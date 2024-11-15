"use client";

import {
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
} from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/code.css";
import "@llamaindex/chat-ui/styles/katex.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { ChatMessageAvatar } from "./ui/chat/chat-avatar";
import CustomChatInput from "./ui/chat/chat-input";
import { ChatStarter } from "./ui/chat/chat-starter";
import { useChatRSC } from "./use-chat-rsc";

export default function ChatSection() {
  const handler = useChatRSC();
  return (
    <ChatSectionUI handler={handler} className="w-full h-full">
      <ChatMessages className="shadow-xl rounded-xl">
        <ChatMessages.List>
          {handler.messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isLast={index === handler.messages.length - 1}
            >
              <ChatMessageAvatar />
              <ChatMessage.Content>{message.display}</ChatMessage.Content>
              <ChatMessage.Actions />
            </ChatMessage>
          ))}
          <ChatMessages.Loading />
        </ChatMessages.List>
        <ChatStarter />
      </ChatMessages>
      <CustomChatInput />
    </ChatSectionUI>
  );
}
