import React, { useState } from "react";
import { Card, Row } from "./primitives";
import { ASSESSMENT_INFO } from "../data/assessmentInfo";

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Hello! I can help with ASD case formulation." },
  ]);
  const [input, setInput] = useState("");

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: "user" as const, text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const key = Object.keys(ASSESSMENT_INFO).find((k) => norm(text).includes(k));
      const reply = key
        ? `${ASSESSMENT_INFO[key].name}: ${ASSESSMENT_INFO[key].domains.join(", ")}. ${ASSESSMENT_INFO[key].notes}`
        : `Consider how "${text}" relates to social communication and restricted behaviours.`;
      const botMsg = { from: "bot" as const, text: reply };
      setMessages((m) => [...m, botMsg]);
    }, 400);
  };

  return (
    <>
      <button
        type="button"
        className="chat-bubble"
        onClick={() => setOpen((o) => !o)}
        title="AI Assistant"
      >
        💬
      </button>
      {open && (
        <div className="chat-window">
          <Card title="AI Assistant" right={<button onClick={() => setOpen(false)}>×</button>}>
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
        </div>
      )}
    </>
  );
}
