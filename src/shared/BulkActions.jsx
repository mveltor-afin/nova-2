import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";

function BulkActions({ selectedCount, onClear, actions = [] }) {
  if (!selectedCount) return null;

  return (
    <>
      <style>{`
        @keyframes bulkSlideUp {
          from { transform: translate(-50%, 120%); opacity: 0; }
          to   { transform: translate(-50%, 0);    opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 28,
          transform: "translateX(-50%)",
          background: `linear-gradient(135deg, ${T.primaryDark}, #08202B)`,
          color: "#fff",
          borderRadius: 14,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
          fontFamily: T.font,
          zIndex: 1200,
          minWidth: 520,
          animation: "bulkSlideUp 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)",
          border: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {/* Left — count */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: "1px solid rgba(255,255,255,0.12)" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: T.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {selectedCount}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
            {selectedCount === 1 ? "item selected" : "items selected"}
          </div>
        </div>

        {/* Center — actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" }}>
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={a.onClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: a.danger ? `1px solid rgba(255,107,97,0.4)` : "1px solid rgba(255,255,255,0.14)",
                background: a.danger ? "rgba(255,107,97,0.14)" : "rgba(255,255,255,0.06)",
                color: a.danger ? "#FFB8B4" : "#fff",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: T.font,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = a.danger ? "rgba(255,107,97,0.24)" : "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = a.danger ? "rgba(255,107,97,0.14)" : "rgba(255,255,255,0.06)";
              }}
            >
              {a.icon && Ico[a.icon]?.(14)}
              {a.label}
            </button>
          ))}
        </div>

        {/* Right — clear */}
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            paddingLeft: 16,
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            height: 30,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
        >
          {Ico.x(13)} Clear selection
        </button>
      </div>
    </>
  );
}

export default BulkActions;
