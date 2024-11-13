import { Message } from "ai";
import { createAI } from "ai/rsc";
import { ReactNode } from "react";
import { chat, ChatAction } from "./chat.action";

type ServerState = Message[]; // a list of messages
type FrontendState = Array<Message & { display: ReactNode }>; // list of messages with UI
type Actions = { chat: ChatAction }; // server actions

export const AI = createAI<ServerState, FrontendState, Actions>({
  actions: { chat },
  initialAIState: [],
  initialUIState: [],
});

export type AIProvider = typeof AI;
