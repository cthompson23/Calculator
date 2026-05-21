"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AlertInfo {
  name: string;
  live_location: string;
  offline: "yes" | "no";
}

type CalcKey =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "." | "+" | "-" | "*" | "/" | "=" | "C" | "±" | "%";

// ─── Demo user info (swap with real data / props as needed) ───────────────────
const ALERT_INFO: AlertInfo = {
  name: "María García",
  live_location: "Calle Falsa 123, Buenos Aires",
  offline: "no",
};

const HOLD_THRESHOLD_MS = 3000; // 3 seconds

// ─── Calculator logic ─────────────────────────────────────────────────────────
function evaluate(a: string, op: string, b: string): string {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return "Error";
  switch (op) {
    case "+": return String(x + y);
    case "-": return String(x - y);
    case "*": return String(x * y);
    case "/": return y === 0 ? "Error" : String(x / y);
    default: return b;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0-100
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const spaceHoldStart = useRef<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertFiredRef = useRef(false);

  // ── Spacebar hold listeners ────────────────────────────────────────────────
  const startHold = useCallback(() => {
    if (spaceHoldStart.current !== null) return; // already holding
    alertFiredRef.current = false;
    spaceHoldStart.current = Date.now();

    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - (spaceHoldStart.current ?? Date.now());
      const progress = Math.min((elapsed / HOLD_THRESHOLD_MS) * 100, 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_THRESHOLD_MS && !alertFiredRef.current) {
        alertFiredRef.current = true;
        setShowAlert(true);
        setHoldProgress(100);
        clearInterval(holdTimer.current!);
      }
    }, 30);
  }, []);

  const endHold = useCallback(() => {
    spaceHoldStart.current = null;
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    if (!alertFiredRef.current) setHoldProgress(0);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        startHold();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        endHold();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startHold, endHold]);

  // Cleanup on unmount
  useEffect(() => () => { if (holdTimer.current) clearInterval(holdTimer.current); }, []);

  // ── Calculator handlers ───────────────────────────────────────────────────
  const handleDigit = (d: string) => {
    if (waitingForOperand) {
      setDisplay(d);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === "0" ? d : prev.length < 12 ? prev + d : prev);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return; }
    if (!display.includes(".")) setDisplay(prev => prev + ".");
  };

  const handleOperator = (op: string) => {
    const current = display;
    if (stored !== null && operator && !waitingForOperand) {
      const result = evaluate(stored, operator, current);
      setDisplay(result);
      setStored(result);
    } else {
      setStored(current);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (!operator || stored === null) return;
    const result = evaluate(stored, operator, display);
    setDisplay(result);
    setStored(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleToggleSign = () => {
    setDisplay(prev => prev.startsWith("-") ? prev.slice(1) : prev === "0" ? "0" : "-" + prev);
  };

  const handlePercent = () => {
    setDisplay(prev => String(parseFloat(prev) / 100));
  };

  const handleKey = (key: CalcKey) => {
    switch (key) {
      case "C": return handleClear();
      case "±": return handleToggleSign();
      case "%": return handlePercent();
      case "=": return handleEquals();
      case ".": return handleDecimal();
      case "+": case "-": case "*": case "/": return handleOperator(key);
      default: return handleDigit(key);
    }
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  const keys: { label: string; key: CalcKey; span?: boolean; type: "fn" | "op" | "num" }[] = [
    { label: "C",   key: "C",  type: "fn" },
    { label: "±",   key: "±",  type: "fn" },
    { label: "%",   key: "%",  type: "fn" },
    { label: "÷",   key: "/",  type: "op" },
    { label: "7",   key: "7",  type: "num" },
    { label: "8",   key: "8",  type: "num" },
    { label: "9",   key: "9",  type: "num" },
    { label: "×",   key: "*",  type: "op" },
    { label: "4",   key: "4",  type: "num" },
    { label: "5",   key: "5",  type: "num" },
    { label: "6",   key: "6",  type: "num" },
    { label: "−",   key: "-",  type: "op" },
    { label: "1",   key: "1",  type: "num" },
    { label: "2",   key: "2",  type: "num" },
    { label: "3",   key: "3",  type: "num" },
    { label: "+",   key: "+",  type: "op" },
    { label: "0",   key: "0",  type: "num", span: true },
    { label: ".",   key: ".",  type: "num" },
    { label: "=",   key: "=",  type: "op" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 30%, rgba(255,60,80,.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 70%, rgba(60,80,255,.10) 0%, transparent 70%),
            #0a0a0f;
        }

        .wrapper {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }

        .hint {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .12em;
          color: rgba(255,255,255,.25);
          text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }

        .hint-bar {
          width: 80px; height: 3px;
          background: rgba(255,255,255,.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .hint-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff3c50, #ff8c00);
          border-radius: 2px;
          transition: width .06s linear;
        }

        /* ── Calculator shell ── */
        .calc {
          width: 320px;
          background: rgba(20,20,28,.85);
          backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.07);
          box-shadow:
            0 0 0 1px rgba(0,0,0,.5),
            0 32px 80px rgba(0,0,0,.6),
            inset 0 1px 0 rgba(255,255,255,.08);
          overflow: hidden;
        }

        /* ── Display ── */
        .display {
          padding: 28px 24px 16px;
          min-height: 110px;
          display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end;
          gap: 4px;
        }
        .display-sub {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: rgba(255,255,255,.3);
          min-height: 18px;
        }
        .display-main {
          font-family: 'DM Mono', monospace;
          font-size: clamp(28px, 8vw, 48px);
          font-weight: 500;
          color: #fff;
          letter-spacing: -.02em;
          word-break: break-all;
          line-height: 1;
        }

        /* ── Grid ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,.04);
          padding: 1px;
          border-radius: 0 0 28px 28px;
        }

        /* ── Button base ── */
        .btn {
          all: unset;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          height: 72px;
          font-family: 'DM Sans', sans-serif;
          font-size: 20px;
          font-weight: 400;
          border-radius: 2px;
          user-select: none;
          transition: filter .1s, transform .08s;
          position: relative;
        }
        .btn:active, .btn.pressed {
          transform: scale(.93);
          filter: brightness(1.25);
        }

        .btn-num {
          background: rgba(255,255,255,.06);
          color: #fff;
        }
        .btn-num:hover { background: rgba(255,255,255,.1); }

        .btn-fn {
          background: rgba(255,255,255,.12);
          color: rgba(255,255,255,.75);
          font-size: 18px;
        }
        .btn-fn:hover { background: rgba(255,255,255,.18); }

        .btn-op {
          background: rgba(255, 80, 60, .18);
          color: #ff6a56;
          font-weight: 500;
        }
        .btn-op:hover { background: rgba(255, 80, 60, .28); }

        .btn-eq {
          background: linear-gradient(135deg, #ff3c50, #ff7e30);
          color: #fff;
          font-weight: 500;
          box-shadow: 0 2px 16px rgba(255,60,80,.3);
        }
        .btn-eq:hover { filter: brightness(1.1); }

        .btn-span { grid-column: span 2; }

        /* ── Alert overlay ── */
        .overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn .25s ease;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        .alert-box {
          background: #0f0f16;
          border: 1px solid rgba(255,60,80,.35);
          border-radius: 20px;
          padding: 32px 36px;
          max-width: 400px;
          width: 90%;
          box-shadow:
            0 0 0 1px rgba(255,60,80,.12),
            0 32px 80px rgba(0,0,0,.7),
            0 0 60px rgba(255,60,80,.08);
          animation: popIn .3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes popIn {
          from { transform: scale(.8); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .alert-icon {
          font-size: 36px; text-align: center; margin-bottom: 16px;
        }

        .alert-title {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: #ff3c50;
          margin-bottom: 20px;
          text-align: center;
        }

        .alert-row {
          display: flex; flex-direction: column; gap: 12px;
          margin-bottom: 24px;
        }

        .alert-field {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          padding: 12px 16px;
        }
        .alert-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: rgba(255,255,255,.35);
          margin-bottom: 4px;
        }
        .alert-value {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
        }
        .alert-value.danger { color: #ff3c50; }
        .alert-value.ok { color: #34d399; }

        .alert-close {
          all: unset;
          cursor: pointer;
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          background: rgba(255,60,80,.15);
          border: 1px solid rgba(255,60,80,.3);
          color: #ff3c50;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-align: center;
          transition: background .15s;
        }
        .alert-close:hover { background: rgba(255,60,80,.25); }
      `}</style>

      <div className="bg" />

      <div className="wrapper">
        {/* Hold hint */}
        <div className="hint">
          <span>mantén ESPACIO para alerta</span>
          <div className="hint-bar">
            <div className="hint-bar-fill" style={{ width: `${holdProgress}%` }} />
          </div>
        </div>

        {/* Calculator */}
        <div className="calc">
          <div className="display">
            <div className="display-sub">
              {stored !== null && operator ? `${stored} ${operator}` : ""}
            </div>
            <div className="display-main">{display}</div>
          </div>

          <div className="grid">
            {keys.map(({ label, key, span, type }) => (
              <button
                key={label}
                className={[
                  "btn",
                  type === "num" ? "btn-num" : type === "fn" ? "btn-fn" : "btn-op",
                  key === "=" ? "btn-eq" : "",
                  span ? "btn-span" : "",
                  pressedKey === label ? "pressed" : "",
                ].join(" ")}
                onPointerDown={() => { setPressedKey(label); }}
                onPointerUp={() => { setPressedKey(null); handleKey(key); }}
                onPointerLeave={() => setPressedKey(null)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Alert */}
      {showAlert && (
        <div className="overlay" onClick={() => { setShowAlert(false); setHoldProgress(0); }}>
          <div className="alert-box" onClick={e => e.stopPropagation()}>
            <div className="alert-icon">🚨</div>
            <div className="alert-title">⚠ Alerta de emergencia</div>

            <div className="alert-row">
              <div className="alert-field">
                <div className="alert-label">Persona en riesgo</div>
                <div className="alert-value danger">{ALERT_INFO.name}</div>
              </div>
              <div className="alert-field">
                <div className="alert-label">Ubicación</div>
                <div className="alert-value">{ALERT_INFO.live_location}</div>
              </div>
              <div className="alert-field">
                <div className="alert-label">Modo offline</div>
                <div className={`alert-value ${ALERT_INFO.offline === "yes" ? "danger" : "ok"}`}>
                  {ALERT_INFO.offline === "yes" ? "🔴 Sin conexión" : "🟢 En línea"}
                </div>
              </div>
            </div>

            <button className="alert-close" onClick={() => { setShowAlert(false); setHoldProgress(0); }}>
              Cerrar alerta
            </button>
          </div>
        </div>
      )}
    </>
  );
}