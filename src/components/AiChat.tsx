import React, { useState } from "react";
import { Card, Row } from "./primitives";

export function AiChat() {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hello! I can help with ASD case formulation." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: "user" as const, text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const botMsg = {
        from: "bot" as const,
        text: `Consider how "${text}" relates to social communication and restricted behaviours.`,
      };
      setMessages((m) => [...m, botMsg]);
    }, 400);
  };

  return (
    <Card title="AI Assistant">
      <div className="chat-log">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-msg--${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <Row>
        <input
          style={{ flex: 1 }}
          value={input}
          placeholder="Ask about the case..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="button" className="btn btn--accent" onClick={send}>
          Send
        </button>
      </Row>
    </Card>
  );
}
