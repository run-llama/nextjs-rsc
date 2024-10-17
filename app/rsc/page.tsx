"use client";

import { useChat } from "./actions/use-chat";

export default function Home() {
  const { input, messages, submit, handleInputChange } = useChat();

  return (
    <div>
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
