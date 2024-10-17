import { useActions } from "ai/rsc";

import { generateId } from "ai";
import { useUIState } from "ai/rsc";
import { ReactNode, useState } from "react";
import { AIProvider } from "../ai";
import { ClientMessage } from "../types";

export interface UseChatProps {
  onError?: (error: unknown) => void;
  // TODO: onFinish
}

export function useChat({ onError }: UseChatProps = {}) {
  const [input, setInput] = useState<string>("");
  // TODO: move to server status: IDLE, STREAMING, FINISHED
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useUIState<AIProvider>();
  const { chat } = useActions<AIProvider>();

  async function submit(input: string, data?: any) {
    try {
      setIsLoading(true);
      const userMessage: ClientMessage = {
        id: generateId(),
        role: "user",
        display: toUserInputDisplay(input, data),
      };
      setMessages((prev) => [...prev, userMessage]);
      const assistantMessage = await chat(input);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      onError?.(error);
    } finally {
      setIsLoading(false);
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
