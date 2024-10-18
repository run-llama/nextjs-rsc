"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useChat } from "./use-chat";

export default function Home() {
  const { input, messages, submit, handleInputChange, isLoading } = useChat();

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <div className="flex-1 w-full rounded-xl bg-white p-4 shadow-xl relative overflow-y-auto">
        <div className="flex flex-col gap-5 divide-y">
          {messages.map((message) => (
            <div key={message.id}>{message.display}</div>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-xl space-y-4 shrink-0">
        <div className="flex w-full items-start justify-between gap-4">
          <Input
            autoFocus
            name="message"
            placeholder="Type a message"
            className="flex-1 min-h-0 h-[40px]"
            value={input}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            onClick={() => submit(input)}
          >
            Send message
          </Button>
        </div>
      </div>
    </div>
  );
}
