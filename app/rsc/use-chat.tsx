import { useActions } from "ai/rsc";

import { generateId, Message } from "ai";
import { useUIState } from "ai/rsc";
import { useState } from "react";
import { AIProvider } from "./ai";

export function useChatRSC() {
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useUIState<AIProvider>();
  const { chat } = useActions<AIProvider>();

  const append = async (message: Omit<Message, "id">, data?: any) => {
    const id = generateId();
    const { role, content } = message;
    const userMessage: Message = { id, role, content };

    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { ...userMessage, display: content }]);
      const assistantMessage = await chat(userMessage, data);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    }

    setIsLoading(false);
    setInput("");

    return id;
  };

  return {
    input,
    setInput,
    isLoading,
    messages,
    setMessages,
    append,
  };
}
