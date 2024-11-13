"use client";

import {
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
} from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/code.css";
import "@llamaindex/chat-ui/styles/katex.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChatRSC } from "../rsc/use-chat";
import { ChatMessageAvatar } from "./chat/chat-avatar";
import CustomChatInput from "./chat/chat-input";
import { ChatStarter } from "./chat/chat-starter";

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
              <ChatMessage.Content className="items-start">
                {message.display}
              </ChatMessage.Content>
              <ChatMessage.Actions />
            </ChatMessage>
          ))}
          <ChatMessages.Loading />
        </ChatMessages.List>
        <ChatMessages.Actions />
        <ChatStarter />
      </ChatMessages>
      <CustomChatInput />
    </ChatSectionUI>
  );
}
