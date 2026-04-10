import { useState, useEffect, useRef } from "react";
import { T, Ico } from "./tokens";

const MOCK_TRANSCRIPTIONS = [
  "Customer mentioned they're going through a divorce and need to refinance soon. Will need to discuss income changes.",
  "DIP approved at 4.49%. Customer happy with monthly payment. Wants to proceed with full application by end of week.",
  "Property valuation came in low — £475k vs £490k expected. Customer considering renegotiating purchase price.",
  "Self-employed customer, 3 years accounts. Income variable but trending up. Manual underwrite likely.",
  "Vulnerable customer indication — recently bereaved. Use enhanced support protocols.",
];

function VoiceNote({ onSave }) {
  const [state, setState] = useState("idle"); // idle | recording | processing | done
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (state === "recording") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      // Auto-stop at 3s
      const stopT = setTimeout(() => {
        clearInterval(timerRef.current);
        setState("processing");
      }, 3000);
      return () => {
        clearInterval(timerRef.current);
        clearTimeout(stopT);
      };
    }
    if (state === "processing") {
      const t = setTimeout(() => {
        const pick = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
        setTranscript(pick);
        setState("done");
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [state]);

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleStop = () => {
    clearInterval(timerRef.current);
    setState("processing");
  };

  const handleSave = () => {
    onSave?.(transcript);
    setState("idle");
    setTranscript("");
    setElapsed(0);
  };

  const handleDiscard = () => {
    setState("idle");
    setTranscript("");
    setElapsed(0);
  };

  return (
    <>
      <style>{`
        @keyframes vnPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,107,97,0.55); }
          50%     { box-shadow: 0 0 0 10px rgba(255,107,97,0); }
        }
        @keyframes vnSpin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 10,
          fontFamily: T.font,
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 12,
          minWidth: 280,
        }}
      >
        {state === "idle" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setState("recording")}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${T.primaryGlow}`,
              }}
              aria-label="Record voice note"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10v2a7 7 0 0014 0v-2M12 19v3" />
              </svg>
            </button>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Record voice note</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Tap mic to start · AI transcription</div>
            </div>
          </div>
        )}

        {state === "recording" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <button
              onClick={handleStop}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: T.danger,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "vnPulse 1.4s infinite",
              }}
              aria-label="Stop recording"
            >
              <div style={{ width: 12, height: 12, background: "#fff", borderRadius: 2 }} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.danger }}>Recording...</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {fmtTime(elapsed)} · Tap to stop
              </div>
            </div>
            {/* waveform */}
            <div style={{ display: "flex", alignItems: "center", gap: 2, height: 24 }}>
              {[8, 14, 20, 12, 16, 22, 10].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    background: T.danger,
                    borderRadius: 2,
                    animation: `vnPulse ${0.8 + i * 0.08}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {state === "processing" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `3px solid ${T.primaryLight}`,
                borderTopColor: T.primary,
                animation: "vnSpin 0.8s linear infinite",
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Transcribing...</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Nova AI is converting speech to text</div>
            </div>
          </div>
        )}

        {state === "done" && (
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ color: T.accent }}>{Ico.sparkle(14)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Transcription ready
              </div>
              <div style={{ marginLeft: "auto", fontSize: 10, color: T.textMuted, fontVariantNumeric: "tabular-nums" }}>
                {fmtTime(elapsed || 3)}
              </div>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                fontSize: 12,
                lineHeight: 1.5,
                fontFamily: T.font,
                color: T.text,
                background: "#F8FAFC",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: T.font,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {Ico.check(13)} Save note
              </button>
              <button
                onClick={handleDiscard}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.card,
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: T.font,
                  cursor: "pointer",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VoiceNote;
