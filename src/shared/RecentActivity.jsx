import React from "react";
import { T, Ico } from "./tokens";

function RecentActivity({ history, onNavigate }) {
  if (!history || history.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 28,
        padding: "0 16px",
        fontFamily: T.font,
        fontSize: 11,
        color: T.textMuted,
        background: "rgba(26,74,84,0.02)",
        borderBottom: `1px solid ${T.borderLight}`,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {Ico.clock(12)}
        <span style={{ fontWeight: 600, letterSpacing: 0.3 }}>Recent:</span>
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
        {history.slice(0, 5).map((item, i) => (
          <button
            key={item.id + "-" + i}
            onClick={() => onNavigate?.(item.id)}
            style={{
              background: "none",
              border: `1px solid ${i === 0 ? T.border : "transparent"}`,
              borderRadius: 5,
              padding: "2px 8px",
              fontSize: 11,
              fontFamily: T.font,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? T.text : T.textMuted,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primaryLight;
              e.currentTarget.style.borderColor = T.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = i === 0 ? T.border : "transparent";
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
