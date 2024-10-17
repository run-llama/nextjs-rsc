"use server";

import { generateId } from "ai";
import { createStreamableUI, getMutableAIState } from "ai/rsc";
import { ChatMessage, OpenAIAgent } from "llamaindex";
import { AIProvider } from "../ai";
import { ClientMessage, ServerMessage } from "../types";

/**
 * Similar to /api/chat, but this is a server action.
 * It generates a response and then returns the UI directly to the client.
 */
export async function chat(input: string, data?: any): Promise<ClientMessage> {
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
  const uiStream = createStreamableUI();
  let content = "";
  responseStream
    .pipeTo(
      new WritableStream({
        write: async (message) => {
          content += message.delta;
          uiStream.append(message.delta);
        },
        close: () => {
          aiState.done([...aiState.get(), { role: "assistant", content }]); // save assistant message
          uiStream.done();
        },
      }),
    )
    .catch(uiStream.error);

  return {
    id: generateId(),
    role: "assistant",
    display: uiStream.value,
  };
}

function prepareChatHistory(
  serverMessages: ServerMessage[],
  data?: any,
): ChatMessage[] {
  return serverMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}
