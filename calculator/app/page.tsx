"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { useRouter } from "next/navigation";


declare global {
  interface BatteryManager extends EventTarget {
    charging: boolean;
    level: number;

    addEventListener(
      type: "chargingchange" | "levelchange",
      listener: EventListenerOrEventListenerObject
    ): void;
  }

  interface Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }
}

export {};
// ─── Types ────────────────────────────────────────────────────────────────────
interface AlertInfo {
  name: string;
  live_location: string;
  offline: "yes" | "no";
}

type CalcKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "+"
  | "-"
  | "*"
  | "/"
  | "="
  | "C"
  | "±"
  | "%";

// ─── Demo user info ───────────────────────────────────────────────────────────
const ALERT_INFO: AlertInfo = {
  name: "María García",
  live_location: "Calle Falsa 123, Buenos Aires",
  offline: "no",
};

const HOLD_THRESHOLD_MS = 3000;
const RECORDING_DURATION_MS = 10000;

// ─── Calculator logic ─────────────────────────────────────────────────────────
function evaluate(
  a: string,
  op: string,
  b: string
): string {
  const x = parseFloat(a);
  const y = parseFloat(b);

  if (isNaN(x) || isNaN(y)) return "Error";

  switch (op) {
    case "+":
      return String(x + y);

    case "-":
      return String(x - y);

    case "*":
      return String(x * y);

    case "/":
      return y === 0 ? "Error" : String(x / y);

    default:
      return b;
  }
}
interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;

  addEventListener(
    type: "chargingchange" | "levelchange",
    listener: EventListenerOrEventListenerObject
  ): void;
}

interface Navigator {
  getBattery?: () => Promise<BatteryManager>;
}
// ─── Component ────────────────────────────────────────────────────────────────
export default function Calculator() {
  const router = useRouter();

  // ── Calculator state ──────────────────────────────────────────────────────
  const [display, setDisplay] = useState("0");

  const [stored, setStored] =
    useState<string | null>(null);

  const [operator, setOperator] =
    useState<string | null>(null);

  const [waitingForOperand, setWaitingForOperand] =
    useState(false);

  const [pressedKey, setPressedKey] =
    useState<string | null>(null);

  // ── Hold state ────────────────────────────────────────────────────────────
  const [holdProgress, setHoldProgress] = useState(0);

  // ── Alert/video state ─────────────────────────────────────────────────────
  const [showAlert, setShowAlert] = useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordingCountdown, setRecordingCountdown] =
    useState(10);

  const [videoUrl, setVideoUrl] =
    useState<string | null>(null);

  // ── Battery state ─────────────────────────────────────────────────────────
  const [batteryLevel, setBatteryLevel] =
    useState<number | null>(null);

  const [isCharging, setIsCharging] =
    useState(false);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const spaceHoldStart =
    useRef<number | null>(null);

  const holdTimer =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const alertFiredRef = useRef(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const recordedChunksRef = useRef<Blob[]>([]);

  const recordingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const countdownIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(null);

  // ── Start recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recordedChunksRef.current = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          recordedChunksRef.current,
          {
            type: "video/webm",
          }
        );

        const url =
          URL.createObjectURL(blob);

        setVideoUrl(url);

        stream
          .getTracks()
          .forEach(track => track.stop());

        setIsRecording(false);
      };

      recorder.start();

      setIsRecording(true);

      setRecordingCountdown(10);

      countdownIntervalRef.current =
        setInterval(() => {
          setRecordingCountdown(prev => {
            if (prev <= 1) {
              clearInterval(
                countdownIntervalRef.current!
              );

              return 0;
            }

            return prev - 1;
          });
        }, 1000);

      recordingTimeoutRef.current =
        setTimeout(() => {
          recorder.stop();
        }, RECORDING_DURATION_MS);
    } catch (err) {
      console.error(err);

      alert(
        "Camera/microphone access denied."
      );
    }
  };

  // ── Hold logic ────────────────────────────────────────────────────────────
  const startHold = useCallback(() => {
    if (spaceHoldStart.current !== null)
      return;

    alertFiredRef.current = false;

    spaceHoldStart.current = Date.now();

    holdTimer.current = setInterval(() => {
      const elapsed =
        Date.now() -
        (spaceHoldStart.current ??
          Date.now());

      const progress = Math.min(
        (elapsed / HOLD_THRESHOLD_MS) * 100,
        100
      );

      setHoldProgress(progress);

      if (
        elapsed >= HOLD_THRESHOLD_MS &&
        !alertFiredRef.current
      ) {
        alertFiredRef.current = true;

        setShowAlert(true);

        setHoldProgress(100);

        clearInterval(holdTimer.current!);

        startRecording();
      }
    }, 30);
  }, []);

  const endHold = useCallback(() => {
    spaceHoldStart.current = null;

    if (holdTimer.current) {
      clearInterval(holdTimer.current);

      holdTimer.current = null;
    }

    if (!alertFiredRef.current) {
      setHoldProgress(0);
    }
  }, []);

  // ── Keyboard listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        e.code === "Space" &&
        !e.repeat
      ) {
        e.preventDefault();

        startHold();
      }
    };

    const onKeyUp = (
      e: KeyboardEvent
    ) => {
      if (e.code === "Space") {
        e.preventDefault();

        endHold();
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    window.addEventListener(
      "keyup",
      onKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      window.removeEventListener(
        "keyup",
        onKeyUp
      );
    };
  }, [startHold, endHold]);

  // ── Battery API ───────────────────────────────────────────────────────────
useEffect(() => {
  const loadBattery = async () => {
    try {
      if (!navigator.getBattery) {
        console.log(
          "Battery API not supported"
        );

        return;
      }

      const battery =
        await navigator.getBattery();

      const updateBattery = () => {
        setBatteryLevel(
          Math.round(
            battery.level * 100
          )
        );

        setIsCharging(
          battery.charging
        );
      };

      updateBattery();

      battery.addEventListener(
        "levelchange",
        updateBattery
      );

      battery.addEventListener(
        "chargingchange",
        updateBattery
      );
    } catch (err) {
      console.log(
        "Battery API failed"
      );
    }
  };

  loadBattery();
}, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearInterval(
          holdTimer.current
        );
      }

      if (
        recordingTimeoutRef.current
      ) {
        clearTimeout(
          recordingTimeoutRef.current
        );
      }

      if (
        countdownIntervalRef.current
      ) {
        clearInterval(
          countdownIntervalRef.current
        );
      }

      streamRef.current
        ?.getTracks()
        .forEach(track => track.stop());
    };
  }, []);

  // ── Calculator handlers ───────────────────────────────────────────────────
  const handleDigit = (d: string) => {
    if (waitingForOperand) {
      setDisplay(d);

      setWaitingForOperand(false);
    } else {
      setDisplay(prev =>
        prev === "0"
          ? d
          : prev.length < 12
          ? prev + d
          : prev
      );
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");

      setWaitingForOperand(false);

      return;
    }

    if (!display.includes(".")) {
      setDisplay(prev => prev + ".");
    }
  };

  const handleOperator = (op: string) => {
    const current = display;

    if (
      stored !== null &&
      operator &&
      !waitingForOperand
    ) {
      const result = evaluate(
        stored,
        operator,
        current
      );

      setDisplay(result);

      setStored(result);
    } else {
      setStored(current);
    }

    setOperator(op);

    setWaitingForOperand(true);
  };

  const handleEquals = () => {
    if (
      !operator ||
      stored === null
    )
      return;

    const result = evaluate(
      stored,
      operator,
      display
    );

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
    setDisplay(prev =>
      prev.startsWith("-")
        ? prev.slice(1)
        : prev === "0"
        ? "0"
        : "-" + prev
    );
  };

  const handlePercent = () => {
    setDisplay(prev =>
      String(parseFloat(prev) / 100)
    );
  };

  const handleKey = (key: CalcKey) => {
    switch (key) {
      case "C":
        return handleClear();

      case "±":
        return handleToggleSign();

      case "%":
        return handlePercent();

      case "=":
        return handleEquals();

      case ".":
        return handleDecimal();

      case "+":
      case "-":
      case "*":
      case "/":
        return handleOperator(key);

      default:
        return handleDigit(key);
    }
  };

  // ── Keys ──────────────────────────────────────────────────────────────────
  const keys: {
    label: string;
    key: CalcKey;
    type: "fn" | "op" | "num";
    span?: boolean;
  }[] = [
    {
      label: "C",
      key: "C",
      type: "fn",
    },

    {
      label: "±",
      key: "±",
      type: "fn",
    },

    {
      label: "%",
      key: "%",
      type: "fn",
    },

    {
      label: "÷",
      key: "/",
      type: "op",
    },

    {
      label: "7",
      key: "7",
      type: "num",
    },

    {
      label: "8",
      key: "8",
      type: "num",
    },

    {
      label: "9",
      key: "9",
      type: "num",
    },

    {
      label: "×",
      key: "*",
      type: "op",
    },

    {
      label: "4",
      key: "4",
      type: "num",
    },

    {
      label: "5",
      key: "5",
      type: "num",
    },

    {
      label: "6",
      key: "6",
      type: "num",
    },

    {
      label: "−",
      key: "-",
      type: "op",
    },

    {
      label: "1",
      key: "1",
      type: "num",
    },

    {
      label: "2",
      key: "2",
      type: "num",
    },

    {
      label: "3",
      key: "3",
      type: "num",
    },

    {
      label: "+",
      key: "+",
      type: "op",
    },

    {
      label: "0",
      key: "0",
      type: "num",
      span: true,
    },

    {
      label: ".",
      key: ".",
      type: "num",
    },

    {
      label: "=",
      key: "=",
      type: "op",
    },
  ];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #0a0a0f;
          font-family: sans-serif;
        }

        .bg {
          position: fixed;
          inset: 0;

          background:
            radial-gradient(
              ellipse 60% 50% at 20% 30%,
              rgba(255,60,80,.12),
              transparent 70%
            ),
            #0a0a0f;
        }

        .wrapper {
          min-height: 100vh;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 20px;

          position: relative;
          z-index: 1;
        }

        .hint {
          color: rgba(255,255,255,.5);
          font-size: 12px;

          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hint-bar {
          width: 90px;
          height: 4px;

          background: rgba(255,255,255,.08);

          border-radius: 999px;

          overflow: hidden;
        }

        .hint-bar-fill {
          height: 100%;

          background:
            linear-gradient(
              90deg,
              #ff3c50,
              #ff8c00
            );

          transition: width .05s linear;
        }

        .calc {
          position: relative;

          width: 320px;

          background:
            rgba(20,20,28,.85);

          border-radius: 28px;

          overflow: hidden;

          backdrop-filter: blur(24px);

          border:
            1px solid rgba(255,255,255,.06);

          box-shadow:
            0 30px 80px rgba(0,0,0,.6);
        }

        .settings-btn {
          position: absolute;

          top: 14px;
          left: 14px;

          z-index: 5;

          width: 38px;
          height: 38px;

          border: none;
          border-radius: 12px;

          background:
            rgba(255,255,255,.06);

          color: white;

          cursor: pointer;
        }

        .display {
          min-height: 120px;

          padding:
            28px 24px 18px;

          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-end;
        }

        .display-sub {
          color:
            rgba(255,255,255,.35);

          margin-bottom: 8px;
        }

        .display-main {
          color: white;

          font-size: 48px;

          font-weight: bold;
        }

        .grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 1px;

          background:
            rgba(255,255,255,.04);
        }

        .btn {
          border: none;

          height: 72px;

          color: white;

          cursor: pointer;

          font-size: 20px;

          background:
            rgba(255,255,255,.06);

          transition:
            transform .08s,
            filter .1s;
        }

        .btn:hover {
          filter: brightness(1.1);
        }

        .btn:active {
          transform: scale(.94);
        }

        .btn-op {
          background:
            rgba(255,80,60,.18);

          color: #ff6a56;
        }

        .btn-fn {
          background:
            rgba(255,255,255,.12);
        }

        .btn-eq {
          background:
            linear-gradient(
              135deg,
              #ff3c50,
              #ff7e30
            );
        }

        .btn-span {
          grid-column: span 2;
        }

        .overlay {
          position: fixed;
          inset: 0;

          background:
            rgba(0,0,0,.72);

          backdrop-filter: blur(10px);

          z-index: 100;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .alert-box {
          width: 92%;
          max-width: 520px;

          background: #111118;

          border-radius: 24px;

          padding: 28px;

          border:
            1px solid rgba(255,255,255,.08);
        }

        .alert-title {
          color: white;

          font-size: 24px;
          font-weight: bold;

          margin-bottom: 16px;
        }

        .recording {
          margin-bottom: 20px;

          padding: 14px 16px;

          border-radius: 14px;

          background:
            rgba(255,60,80,.14);

          color: #ff6575;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .record-dot {
          width: 12px;
          height: 12px;

          border-radius: 999px;

          background: #ff3c50;

          animation:
            pulse 1s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }

          50% {
            opacity: .3;
          }

          100% {
            opacity: 1;
          }
        }

        .alert-field {
          margin-bottom: 14px;

          padding: 14px;

          border-radius: 14px;

          background:
            rgba(255,255,255,.04);
        }

        .alert-label {
          color:
            rgba(255,255,255,.45);

          font-size: 11px;

          margin-bottom: 6px;

          text-transform: uppercase;
        }

        .alert-value {
          color: white;

          display: flex;
          align-items: center;
          gap: 6px;
        }

        .video-preview {
          width: 100%;

          border-radius: 16px;

          overflow: hidden;

          margin-top: 18px;

          background: black;
        }

        .video-preview video {
          width: 100%;
          display: block;
        }

        .alert-close {
          margin-top: 18px;

          width: 100%;

          height: 48px;

          border: none;
          border-radius: 14px;

          background:
            rgba(255,60,80,.18);

          color: #ff6473;

          cursor: pointer;

          font-size: 15px;
          font-weight: bold;
        }
      `}</style>

      <div className="bg" />

      <div className="wrapper">
        <div className="hint">
          <span>
            Hold SPACE for emergency
          </span>

          <div className="hint-bar">
            <div
              className="hint-bar-fill"
              style={{
                width: `${holdProgress}%`,
              }}
            />
          </div>
        </div>

        <div className="calc">
          <button
            className="settings-btn"
            onClick={() =>
              router.push("/settings")
            }
          >
            ⚙
          </button>

          <div className="display">
            <div className="display-sub">
              {stored && operator
                ? `${stored} ${operator}`
                : ""}
            </div>

            <div className="display-main">
              {display}
            </div>
          </div>

          <div className="grid">
            {keys.map(
              ({
                label,
                key,
                span,
                type,
              }) => (
                <button
                  key={label}
                  className={[
                    "btn",

                    type === "op"
                      ? "btn-op"
                      : "",

                    type === "fn"
                      ? "btn-fn"
                      : "",

                    key === "="
                      ? "btn-eq"
                      : "",

                    span
                      ? "btn-span"
                      : "",
                  ].join(" ")}
                  onPointerDown={() =>
                    setPressedKey(label)
                  }
                  onPointerUp={() => {
                    setPressedKey(null);

                    handleKey(key);
                  }}
                  onPointerLeave={() =>
                    setPressedKey(null)
                  }
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {showAlert && (
        <div
          className="overlay"
          onClick={() =>
            setShowAlert(false)
          }
        >
          <div
            className="alert-box"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="alert-title">
              🚨 Emergency Triggered
            </div>

            {isRecording && (
              <div className="recording">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div className="record-dot" />

                  <span>
                    Recording video...
                  </span>
                </div>

                <strong>
                  {recordingCountdown}s
                </strong>
              </div>
            )}

            <div className="alert-field">
              <div className="alert-label">
                Person at risk
              </div>

              <div className="alert-value">
                {ALERT_INFO.name}
              </div>
            </div>

            <div className="alert-field">
              <div className="alert-label">
                Location
              </div>

              <div className="alert-value">
                {ALERT_INFO.live_location}
              </div>
            </div>

            <div className="alert-field">
              <div className="alert-label">
                Offline mode
              </div>

              <div className="alert-value">
                {ALERT_INFO.offline ===
                "yes"
                  ? "🔴 Offline"
                  : "🟢 Online"}
              </div>
            </div>

            <div className="alert-field">
              <div className="alert-label">
                Battery
              </div>

              <div
                className="alert-value"
                style={{
                  color:
                    batteryLevel !==
                      null &&
                    batteryLevel <= 20
                      ? "#ff5f5f"
                      : "white",
                }}
              >
                {batteryLevel !==
                null ? (
                  <>
                    {isCharging
                      ? "⚡"
                      : "🔋"}

                    {batteryLevel}%
                  </>
                ) : (
                  "Unavailable"
                )}
              </div>
            </div>

            {videoUrl && (
              <div className="video-preview">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            )}

            <button
              className="alert-close"
              onClick={() =>
                setShowAlert(false)
              }
            >
              Close Alert
            </button>
          </div>
        </div>
      )}
    </>
  );
}