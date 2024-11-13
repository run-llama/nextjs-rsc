"use client";

import {
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
  Message,
} from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/code.css";
import "@llamaindex/chat-ui/styles/katex.css";
import { useChat } from "../rsc/use-chat";

export default function ChatSection() {
  const handler = useChat();

  const messages = handler.messages.map((message) => {
    return { ...message, content: "" }; // FIX: remove content
  });

  const append = (message: Message, data?: any) =>
    handler.submit(message.content, data);

  return (
    <ChatSectionUI
      handler={{ ...handler, append, messages }}
      className="w-full"
    >
      <ChatMessages className="rounded-xl shadow-xl">
        <ChatMessages.List>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={{ ...message, content: "" }}
              isLast={index === messages.length - 1}
              className="items-start pt-4"
            >
              <ChatMessage.Avatar />
              <ChatMessage.Content className="items-start">
                {message.display}
              </ChatMessage.Content>
              <ChatMessage.Actions />
            </ChatMessage>
          ))}
        </ChatMessages.List>
        <ChatMessages.Actions />
      </ChatMessages>
      <ChatInput className="rounded-lg shadow-lg" />
    </ChatSectionUI>
  );
}
