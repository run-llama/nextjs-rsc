"use client";

import {
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection as ChatSectionUI,
} from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/code.css";
import "@llamaindex/chat-ui/styles/katex.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { useChatRSC } from "../rsc/use-chat";

export default function ChatSection() {
  const handler = useChatRSC();
  return (
    <ChatSectionUI handler={handler} className="w-full">
      <ChatMessages className="rounded-xl shadow-xl">
        <ChatMessages.List>
          {handler.messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={{ ...message, content: "" }}
              isLast={index === handler.messages.length - 1}
            >
              <ChatMessage.Avatar />
              <ChatMessage.Content className="items-start">
                {message.display}
              </ChatMessage.Content>
              <ChatMessage.Actions />
            </ChatMessage>
          ))}
          <ChatMessages.Loading />
        </ChatMessages.List>
      </ChatMessages>
      <ChatInput className="rounded-xl shadow-xl" />
    </ChatSectionUI>
  );
}

/**
 * TODO:
 * - Support stop and reload in <ChatMessages.Actions />
 * - Support upload files in <ChatInput.Upload />
 */
