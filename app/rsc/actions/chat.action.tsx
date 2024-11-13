"use server";

import { ChatEvents, Markdown } from "@llamaindex/chat-ui/widgets";
import { generateId } from "ai";
import {
  createStreamableUI,
  createStreamableValue,
  getMutableAIState,
} from "ai/rsc";
import { ChatMessage, OpenAIAgent } from "llamaindex";
import { AIProvider } from "../ai";
import {
  ClientMessage,
  ServerMessage,
  StreamingStatus,
  WithStreamingStatus,
} from "../types";

/**
 * Similar to /api/chat, but this is a server action.
 * It generates a response and then returns the UI directly to the client.
 */
export async function chat(
  input: string,
  data?: any,
): Promise<WithStreamingStatus<ClientMessage>> {
  const aiState = getMutableAIState<AIProvider>();
  aiState.update((prev) => [...prev, { role: "user", content: input }]); // save user message

  // call LLM to get response
  const chatHistory = prepareChatHistory(aiState.get(), data);
  const agent = new OpenAIAgent({ tools: [] });
  const responseStream = await agent.chat({
    stream: true,
    message: input,
    chatHistory,
  });

  // stream response to client
  const status = createStreamableValue(StreamingStatus.IDLE);
  const uiStream = createStreamableUI();
  let content = "";
  responseStream
    .pipeTo(
      new WritableStream({
        start: () => {
          status.update(StreamingStatus.STREAMING);
        },
        write: async (message) => {
          content += message.delta;
          // TODO: better append to StreamableValue and use uiStream for rendering annotations
          // uiStream.append(message.delta) will be better uiStream.update (prevent re-rendering Markdown)
          uiStream.update(<Markdown content={content} />);
        },
        close: () => {
          // TODO: remove this test event
          uiStream.append(
            <ChatEvents
              data={[{ title: "This annotation will appear after markdown" }]}
              showLoading={false}
            />,
          );
          aiState.done([...aiState.get(), { role: "assistant", content }]); // save assistant message
          uiStream.done();
          status.done(StreamingStatus.FINISHED);
        },
      }),
    )
    .catch((err) => {
      uiStream.error(err);
      status.done(StreamingStatus.ERROR);
    });

  return {
    id: generateId(),
    role: "assistant",
    display: uiStream.value,
    status: status.value,
  };
}

// TODO: convert data, annotations to ChatMessage
function prepareChatHistory(
  serverMessages: ServerMessage[],
  data?: any,
): ChatMessage[] {
  return serverMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}
