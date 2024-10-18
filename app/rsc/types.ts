import { StreamableValue } from "ai/rsc";
import { ReactNode } from "react";

type Role = "user" | "assistant";

/**
 * Server Messages is the source of truth to handle logic of the application
 * It is used to manage chat history before sending to LLM:
 * - When a client submits a message, it will be added to server messages
 * - When the server finishes streaming a response, the new result will be added to server messages
 * - Event data (annotations) are also stored in server messages
 */
interface ServerMessage {
  role: Role;
  content: string;
  annotations?: any;
}

/**
 * Client Messages is only used to display messages to the client
 * They don't have raw string content, instead, they have ReactNode to display
 * Because RSC stores chat history in Server Actions, client don't need to send chat history to the server
 * ClientMessage can be computed from ServerMessage
 */
interface ClientMessage {
  id: string;
  role: Role;
  display: ReactNode;
}

/**
 * A list of Server Actions that can be performed
 * Each action is a function that takes input, call LLM, build UI from LLM's result
 * and return a ClientMessage with the UI
 */
type AIActions = {
  chat: (
    message: string,
    data?: any,
  ) => Promise<WithStreamingStatus<ClientMessage>>;
};

enum StreamingStatus {
  IDLE = "idle",
  STREAMING = "streaming",
  FINISHED = "finished",
  ERROR = "error",
}

type WithStreamingStatus<T> = T & {
  status: StreamableValue<StreamingStatus, any>;
};

export {
  StreamingStatus,
  type AIActions,
  type ClientMessage,
  type ServerMessage,
  type WithStreamingStatus,
};
