"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: string; content: string }[]
  >([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        content: data.reply,
      },
    ]);

    setMessage("");
  };

  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">
        AI Chat Demo
      </h1>

      <div className="border rounded p-4 h-[400px] overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.role === "user"
                ? "text-right"
                : "text-left"
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Escribe algo..."
          className="border p-2 rounded flex-1"
        />

        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}