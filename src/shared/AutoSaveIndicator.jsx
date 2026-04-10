import { useState, useEffect } from "react";
import { T, Ico } from "./tokens";

function AutoSaveIndicator({ value, onSave }) {
  const [status, setStatus] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (value === undefined || value === null || value === "") return;
    setStatus("editing");
    setMuted(false);
    const t = setTimeout(() => {
      setStatus("saving");
      setTimeout(() => {
        setStatus("saved");
        setSavedAt(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
        onSave?.();
        // Fade to muted after 3s
        setTimeout(() => setMuted(true), 3000);
      }, 400);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const config = (() => {
    switch (status) {
      case "editing":
        return {
          label: "Editing...",
          color: T.textMuted,
          bg: T.borderLight,
          border: T.border,
          icon: (
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: T.textMuted,
                display: "inline-block",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          ),
        };
      case "saving":
        return {
          label: "Saving...",
          color: T.primary,
          bg: T.primaryLight,
          border: T.primaryGlow,
          icon: (
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: `1.5px solid ${T.primary}`,
                borderTopColor: "transparent",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ),
        };
      case "saved":
        return {
          label: savedAt ? `Saved at ${savedAt}` : "Saved",
          color: muted ? T.textMuted : T.success,
          bg: muted ? T.bg : T.successBg,
          border: muted ? T.borderLight : T.successBorder,
          icon: (
            <span style={{ color: muted ? T.textMuted : T.success, display: "inline-flex" }}>
              {Ico.check(11)}
            </span>
          ),
        };
      default:
        return null;
    }
  })();

  if (!config) return null;

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 6,
          background: config.bg,
          border: `1px solid ${config.border}`,
          fontFamily: T.font,
          fontSize: 11,
          fontWeight: 600,
          color: config.color,
          width: 140,
          justifyContent: "center",
          transition: "all 0.3s ease",
          whiteSpace: "nowrap",
        }}
      >
        {config.icon}
        <span>{config.label}</span>
      </div>
    </>
  );
}

export default AutoSaveIndicator;
