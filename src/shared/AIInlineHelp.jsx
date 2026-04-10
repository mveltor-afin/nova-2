import { useState, useEffect, useRef } from "react";
import { T, Ico } from "./tokens";

const EXPLANATIONS = {
  income: {
    text: "Combined gross annual income from all employment sources before tax. For self-employed, use 2-year average from SA302.",
    suggested: "£72,500",
  },
  ltv: {
    text: "Loan to Value: percentage of property value being borrowed. Lower LTV = better rates. Below 75% gives access to all standard products.",
    suggested: "72%",
  },
  deposit: {
    text: "Customer's contribution. Must come from verified savings or gift letter. Minimum 5% for residential, 25% for BTL.",
    suggested: "£85,000",
  },
  term: {
    text: "Mortgage term in years. Maximum 35 years or retirement age, whichever earlier. Longer term = lower monthly but more interest.",
    suggested: "25 years",
  },
};

const DEFAULT_EXPLANATION = {
  text: "Need help with this field? AI can explain what to enter.",
  suggested: null,
};

function AIInlineHelp({ context, prompt, onApply }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("explain"); // "explain" | "complete"
  const wrapRef = useRef(null);

  const data = EXPLANATIONS[context] || DEFAULT_EXPLANATION;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", fontFamily: T.font }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 9px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: `linear-gradient(135deg, #8B5CF6, #6366F1)`,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: T.font,
          letterSpacing: 0.3,
          boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
        }}
      >
        {Ico.sparkle(11)} AI Help
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: 280,
            background: `linear-gradient(160deg, #0C2D3B, #1A4A54)`,
            color: "#fff",
            borderRadius: 12,
            padding: 14,
            boxShadow: "0 20px 50px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
            zIndex: 1400,
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: T.font,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "linear-gradient(135deg,#8B5CF6,#6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              {Ico.sparkle(14)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>Nova AI Assistant</div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "rgba(255,255,255,0.06)", padding: 3, borderRadius: 7 }}>
            {[
              { id: "explain", label: "What to enter?" },
              { id: "complete", label: "Help me complete" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: T.font,
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: mode === m.id ? "rgba(255,255,255,0.14)" : "transparent",
                  color: mode === m.id ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Explanation */}
          <div style={{ fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.88)", marginBottom: 10 }}>
            {prompt || data.text}
          </div>

          {/* Suggested value (complete mode) */}
          {mode === "complete" && data.suggested && (
            <div
              style={{
                padding: 10,
                background: "rgba(49,184,151,0.12)",
                border: "1px solid rgba(49,184,151,0.3)",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                Suggested value
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{data.suggested}</div>
            </div>
          )}

          {/* Apply button */}
          {mode === "complete" && data.suggested && (
            <button
              onClick={() => {
                onApply?.(data.suggested);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: T.accent,
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
              {Ico.check(13)} Apply suggestion
            </button>
          )}
        </div>
      )}
    </span>
  );
}

export default AIInlineHelp;
