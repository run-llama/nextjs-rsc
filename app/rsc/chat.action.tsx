"use server";

import { Markdown } from "@llamaindex/chat-ui/widgets";
import { generateId, Message } from "ai";
import { createStreamableUI, getMutableAIState } from "ai/rsc";
import { ChatMessage, OpenAIAgent } from "llamaindex";
import { ReactNode } from "react";
import { AIProvider } from "./ai";

export type ChatAction = (
  message: Message,
  data?: any,
) => Promise<Message & { display: ReactNode }>;

export const chat: ChatAction = async (message: Message, data?: any) => {
  const aiState = getMutableAIState<AIProvider>();
  aiState.update((prev) => [...prev, message]); // save user message

  // call LLM to get response
  const chatHistory = prepareChatHistory(aiState.get(), data);
  const agent = new OpenAIAgent({ tools: [] });
  const responseStream = await agent.chat({
    stream: true,
    message: message.content,
    chatHistory,
  });

  // stream response to client
  const uiStream = createStreamableUI();
  const assistantMessage: Message = {
    id: generateId(),
    role: "assistant",
    content: "",
  };

  responseStream
    .pipeTo(
      new WritableStream({
        write: async (message) => {
          assistantMessage.content += message.delta;
          uiStream.update(<Markdown content={assistantMessage.content} />);
        },
        close: () => {
          aiState.done([...aiState.get(), assistantMessage]);
          uiStream.done();
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

// TODO: convert data, annotations to ChatMessage
function prepareChatHistory(
  serverMessages: Message[],
  data?: any,
): ChatMessage[] {
  return serverMessages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as ChatMessage[];
}
