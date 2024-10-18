"use client";

import { useChat } from "./use-chat";

export default function Home() {
  const { input, messages, submit, handleInputChange, isLoading } = useChat();

  return (
    <div>
      <p>Isloading: {isLoading ? "true" : "false"} </p>
      <ul>
        {messages.map((message) => (
          <li key={message.id} className="wrap">
            {message.display}
          </li>
        ))}
      </ul>
      <div>
        <input type="text" value={input} onChange={handleInputChange} />
        <button onClick={() => submit(input)}>Send Message</button>
      </div>
    </div>
  );
}
