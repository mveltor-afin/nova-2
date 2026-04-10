import { useState, useEffect } from "react";
import { T, Ico } from "./tokens";

function SessionIndicator({ persona }) {
  const [sessionStart] = useState(() => Date.now() - (2 * 60 + 14) * 60 * 1000);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const formatDuration = () => {
    const ms = Date.now() - sessionStart;
    const totalMinutes = Math.floor(ms / 60000);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const initials = (persona || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        width: 200,
        padding: "2px 8px",
        borderRadius: 8,
        background: "rgba(26,74,84,0.05)",
        border: `1px solid ${T.borderLight}`,
        fontFamily: T.font,
        fontSize: 10,
        color: T.textSecondary,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
      title={`Logged in as ${persona || "Guest"} • Session ${formatDuration()}`}
    >
      {/* Avatar circle */}
      <div
        style={{
          position: "relative",
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials}
        {/* Online dot */}
        <span
          style={{
            position: "absolute",
            bottom: -1,
            right: -1,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: T.success,
            border: "1px solid #fff",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0, overflow: "hidden" }}>
        <span style={{ fontWeight: 600, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis" }}>
          {persona || "Guest"}
        </span>
        <span style={{ fontSize: 9, color: T.textMuted, display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span style={{ display: "inline-flex" }}>{Ico.clock(8)}</span>
          Session: {formatDuration()}
        </span>
      </div>
    </div>
  );
}

export default SessionIndicator;
