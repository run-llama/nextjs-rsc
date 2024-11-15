"use server";

import { generateId, LlamaIndexAdapter, Message, parseStreamPart } from "ai";
import { createStreamableUI, getMutableAIState } from "ai/rsc";
import { ChatMessage, Settings } from "llamaindex";
import { ReactNode } from "react";
import { createChatEngine } from "../api/chat/engine/chat";
import {
  retrieveDocumentIds,
  retrieveMessageContent,
} from "../api/chat/llamaindex/streaming/annotations";
import { createCallbackManager } from "../api/chat/llamaindex/streaming/rsc-events";
import { generateNextQuestions } from "../api/chat/llamaindex/streaming/suggestion";
import { CustomSuggestedQuestions } from "../components/ui/chat/custom/annotations";
import { Markdown } from "../components/ui/chat/custom/markdown";
import { AIProvider } from "./ai";

export type ChatAction = (
  message: Message,
  data?: any,
) => Promise<Message & { display: ReactNode }>;

export const chat: ChatAction = async (message: Message, data?: any) => {
  // save user message to server state
  const aiState = getMutableAIState<AIProvider>();
  aiState.update((prev) => [...prev, message]);

  // prepare chat history
  const messages = aiState.get();
  const chatHistory: ChatMessage[] = messages as ChatMessage[];
  const ids = retrieveDocumentIds(messages);
  const chatEngine = await createChatEngine(ids, data);
  const userMessageContent = retrieveMessageContent(messages);

  // create UI stream and callback manager
  const uiStream = createStreamableUI();
  const callbackManager = createCallbackManager(uiStream);

  // start chat engine
  const response = await Settings.withCallbackManager(callbackManager, () => {
    return chatEngine.chat({
      message: userMessageContent,
      chatHistory,
      stream: true,
    });
  });

  const onFinal = (content: string) => {
    generateNextQuestions([...chatHistory, { role: "assistant", content }])
      .then((questions: string[]) => {
        if (questions.length > 0) {
          uiStream.append(<CustomSuggestedQuestions questions={questions} />);
        }
      })
      .finally(() => {
        uiStream.done();
      });
  };

  // Generate assistant message with UI
  const assistantMessage: Message = {
    id: generateId(),
    role: "assistant",
    content: "",
  };
  const dataStream = LlamaIndexAdapter.toDataStream(response, { onFinal });
  dataStream
    .pipeThrough(new TextDecoderStream())
    .pipeTo(
      new WritableStream({
        write: async (message) => {
          assistantMessage.content += parseStreamPart(message).value;
          uiStream.update(<Markdown content={assistantMessage.content} />);
        },
        close: () => {
          aiState.done([...aiState.get(), assistantMessage]);
        },
      }),
    )
    .catch((err) => {
      uiStream.error(err);
    });

  return {
    ...assistantMessage,
    display: uiStream.value,
  };
};
