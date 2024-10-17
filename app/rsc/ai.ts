import { createAI } from "ai/rsc";
import { chat } from "./actions";
import { AIActions, ClientMessage, ServerMessage } from "./types";

export const AI = createAI<ServerMessage[], ClientMessage[], AIActions>({
  actions: { chat },
  initialAIState: [],
  initialUIState: [],
});

export type AIProvider = typeof AI;
