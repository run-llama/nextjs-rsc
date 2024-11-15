"use server";

import { ChatSources } from "@llamaindex/chat-ui/widgets";
import { generateId, LlamaIndexAdapter, Message, parseStreamPart } from "ai";
import { createStreamableUI, getMutableAIState } from "ai/rsc";
import { ChatMessage, Settings } from "llamaindex";
import { ReactNode } from "react";
import { createChatEngine } from "../api/chat/engine/chat";
import {
  retrieveDocumentIds,
  retrieveMessageContent,
} from "../api/chat/llamaindex/streaming/annotations";
import {
  createCallbackManager,
  StreamData,
} from "../api/chat/llamaindex/streaming/events";
import { generateNextQuestions } from "../api/chat/llamaindex/streaming/suggestion";
import {
  CustomChatEvents,
  CustomSuggestedQuestions,
} from "../components/ui/chat/custom/annotations";
import { Markdown } from "../components/ui/chat/custom/markdown";
import { ChatTools } from "../components/ui/chat/tools/chat-tools";
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
  const annotationStream = new AnnotationStream();
  const callbackManager = createCallbackManager(annotationStream);

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
          uiStream.update(
            <>
              {annotationStream.eventUI}
              {annotationStream.toolUI}
              <Markdown content={assistantMessage.content} />
            </>,
          );
        },
        close: () => {
          uiStream.append(annotationStream.sourceUI);
          aiState.done([
            ...aiState.get(),
            {
              ...assistantMessage,
              // save annotations to assistant message
              annotations: annotationStream.annotations,
            },
          ]);
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

class AnnotationStream implements StreamData {
  annotations: any[] = [];

  get eventUI() {
    const eventData = this.getAnnotationData("events");
    if (!eventData?.length) return null;
    return <CustomChatEvents events={eventData} />;
  }

  get toolUI() {
    const toolData = this.getAnnotationData("tools");
    if (!toolData?.length) return null;
    return toolData.map((tool, index) => (
      <ChatTools key={index} data={tool} artifactVersion={undefined} />
    ));
  }

  get sourceUI() {
    const sourceData = this.getAnnotationData("sources");
    if (!sourceData?.length) return null;
    return sourceData.map((source, index) => (
      <ChatSources key={index} data={source} />
    ));
  }

  appendMessageAnnotation(annotation: any) {
    this.annotations.push(annotation);
  }

  private getAnnotationData(type: string) {
    if (!this.annotations.length) return [];
    return this.annotations
      .filter((anno) => "type" in anno && anno.type === type)
      .map((anno) => anno.data);
  }
}
