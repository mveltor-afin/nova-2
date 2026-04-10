import React, { useState, useEffect } from "react";
import { T, Ico } from "./tokens";

function StatusBar({ persona }) {
  const [lastSyncSeconds, setLastSyncSeconds] = useState(2);
  const [connection] = useState("connected"); // connected | degraded | offline

  useEffect(() => {
    const id = setInterval(() => {
      setLastSyncSeconds((s) => {
        const next = s + 5;
        if (next > 55) return 1; // simulate re-sync
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const connDot =
    connection === "connected"
      ? { color: T.success, label: "Connected" }
      : connection === "degraded"
      ? { color: T.warning, label: "Degraded" }
      : { color: T.danger, label: "Offline" };

  const formatSync = (s) => {
    if (s < 60) return `Last synced ${s}s ago`;
    const m = Math.floor(s / 60);
    return `Last synced ${m}m ago`;
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 60,
        right: 0,
        height: 28,
        zIndex: 50,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderTop: `1px solid ${T.borderLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        fontFamily: T.font,
        fontSize: 11,
        color: T.textMuted,
        userSelect: "none",
      }}
    >
      {/* Left: Connection */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: connDot.color,
            boxShadow: `0 0 6px ${connDot.color}`,
            display: "inline-block",
          }}
        />
        <span style={{ fontWeight: 600, color: T.textSecondary }}>{connDot.label}</span>
        {persona && (
          <>
            <span style={{ opacity: 0.4, margin: "0 4px" }}>•</span>
            <span>{persona}</span>
          </>
        )}
      </div>

      {/* Center: Sync */}
      <div
        style={{
          flex: 1,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        <span style={{ color: T.textMuted }}>{Ico.clock(11)}</span>
        <span>{formatSync(lastSyncSeconds)}</span>
      </div>

      {/* Right: Health + version */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: T.success, display: "inline-flex" }}>{Ico.check(11)}</span>
          <span>API Health: All systems operational</span>
        </div>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            background: T.primaryLight,
            color: T.primary,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 0.3,
          }}
        >
          v2.6.0
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
