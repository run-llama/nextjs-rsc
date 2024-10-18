import { readStreamableValue, useActions } from "ai/rsc";

import { generateId } from "ai";
import { useUIState } from "ai/rsc";
import { ReactNode, useState } from "react";
import { AIProvider } from "./ai";
import { ClientMessage, StreamingStatus, WithStreamingStatus } from "./types";

export interface UseChatProps {
  onStreaming?: () => void;
  onFinish?: () => void;
  onError?: (error?: unknown) => void;
}

export function useChat({ onStreaming, onFinish, onError }: UseChatProps = {}) {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useUIState<AIProvider>();
  const { chat } = useActions<AIProvider>();

  async function submit(input: string, data?: any) {
    setIsLoading(true);
    try {
      const userMessage: ClientMessage = {
        id: generateId(),
        role: "user",
        display: toUserInputDisplay(input, data),
      };
      setMessages((prev) => [...prev, userMessage]);
      const assistantMessage = await chat(input);
      setMessages((prev) => [...prev, assistantMessage]);
      await handleStreamingStatus(assistantMessage.status);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStreamingStatus(
    streamingStatus: WithStreamingStatus<ClientMessage>["status"],
  ) {
    for await (const status of readStreamableValue(streamingStatus)) {
      switch (status) {
        case StreamingStatus.STREAMING:
          onStreaming?.();
          break;
        case StreamingStatus.FINISHED:
          onFinish?.();
          break;
        case StreamingStatus.ERROR:
          onError?.();
          break;
        default:
          break;
      }
    }
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
  };

  // TODO: regenerate

  return {
    input,
    setInput,
    handleInputChange,
    isLoading,
    messages,
    setMessages,
    submit,
  };
}

// TODO: ChatMessage
function toUserInputDisplay(input: string, data?: any): ReactNode {
  return <div className="font-bold">{input}</div>;
}
