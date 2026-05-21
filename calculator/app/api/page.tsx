"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "bot", content: data.reply },
    ]);

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
        }

        .bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(
              ellipse 60% 50% at 20% 30%,
              rgba(255,60,80,.10) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 60% at 80% 70%,
              rgba(60,80,255,.08) 0%,
              transparent 70%
            ),
            #0a0a0f;
        }

        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px 24px;
        }

        /* ── Header ── */
        .header {
          width: 100%;
          max-width: 520px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .back-btn {
          all: unset;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          background: rgba(255,255,255,.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.75);
          font-size: 18px;
          transition: background .15s, transform .1s;
          flex-shrink: 0;
        }
        .back-btn:hover  { background: rgba(255,255,255,.1); }
        .back-btn:active { transform: scale(.92); }

        .header-text { flex: 1; }

        .page-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: rgba(255,255,255,.3);
          margin-bottom: 2px;
        }

        .page-title {
          font-size: 22px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -.02em;
        }

        /* ── Chat container ── */
        .chat-wrap {
          width: 100%;
          max-width: 520px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .messages-card {
          background: rgba(20,20,28,.85);
          backdrop-filter: blur(24px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.07);
          box-shadow:
            0 0 0 1px rgba(0,0,0,.4),
            0 16px 48px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.06);
          flex: 1;
          min-height: 420px;
          max-height: 60vh;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }

        .messages-card::-webkit-scrollbar { width: 4px; }
        .messages-card::-webkit-scrollbar-track { background: transparent; }
        .messages-card::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,.1);
          border-radius: 2px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: rgba(255,255,255,.18);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          text-align: center;
        }

        .empty-icon { font-size: 28px; opacity: .4; }

        .msg-row { display: flex; flex-direction: column; }
        .msg-row.user { align-items: flex-end; }
        .msg-row.bot  { align-items: flex-start; }

        .msg-sender {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .msg-row.user .msg-sender { color: rgba(255,106,86,.6); }
        .msg-row.bot  .msg-sender { color: rgba(255,255,255,.25); }

        .bubble {
          max-width: 78%;
          padding: 11px 15px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.55;
        }

        .msg-row.user .bubble {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.1);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .msg-row.bot .bubble {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
          color: rgba(255,255,255,.85);
          border-bottom-left-radius: 4px;
        }

        .typing-bubble {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          border-bottom-left-radius: 4px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,.35);
          animation: bounce 1.2s infinite ease-in-out;
        }
        .dot:nth-child(2) { animation-delay: .2s; }
        .dot:nth-child(3) { animation-delay: .4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(.7); opacity: .4; }
          40%            { transform: scale(1);  opacity: 1;   }
        }

        .input-card {
          background: rgba(20,20,28,.85);
          backdrop-filter: blur(24px);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.07);
          box-shadow:
            0 0 0 1px rgba(0,0,0,.4),
            0 8px 24px rgba(0,0,0,.4),
            inset 0 1px 0 rgba(255,255,255,.06);
          padding: 12px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .chat-input {
          all: unset;
          flex: 1;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #fff;
          padding: 6px 8px;
        }
        .chat-input::placeholder { color: rgba(255,255,255,.2); }

        .send-btn {
          all: unset;
          cursor: pointer;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.8);
          font-size: 17px;
          flex-shrink: 0;
          transition: background .15s, transform .1s;
        }
        .send-btn:hover  { background: rgba(255,255,255,.18); }
        .send-btn:active { transform: scale(.92); }
        .send-btn:disabled { opacity: .35; cursor: not-allowed; }
      `}</style>

      <div className="bg" />

      <div className="page">
        <div className="header">
          <button className="back-btn" onClick={() => router.push("/")}>←</button>
          <div className="header-text">
            <div className="page-label">Chat</div>
            <div className="page-title">Asistente Virtual</div>
          </div>
        </div>

        <div className="chat-wrap">
          <div className="messages-card">
            {messages.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <span>Escribe algo para comenzar</span>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role === "user" ? "user" : "bot"}`}>
                    <div className="msg-sender">
                      {msg.role === "user" ? "Tú" : "Asistente"}
                    </div>
                    <div className="bubble">{msg.content}</div>
                  </div>
                ))}

                {loading && (
                  <div className="msg-row bot">
                    <div className="msg-sender">Asistente</div>
                    <div className="typing-bubble">
                      <div className="dot" />
                      <div className="dot" />
                      <div className="dot" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="input-card">
            <input
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe algo..."
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}