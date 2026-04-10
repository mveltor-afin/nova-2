import { useState, useEffect, useRef } from "react";
import { T } from "./tokens";

function InlineHelp({ text }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [placement, setPlacement] = useState("bottom");
  const wrapRef = useRef(null);
  const iconRef = useRef(null);

  const visible = hovered || pinned;

  // Auto-position tooltip (above vs below)
  useEffect(() => {
    if (!visible || !iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPlacement(spaceBelow < 120 ? "top" : "bottom");
  }, [visible]);

  // Click-outside to close pinned tooltip
  useEffect(() => {
    if (!pinned) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setPinned(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pinned]);

  return (
    <span
      ref={wrapRef}
      style={{ position: "relative", display: "inline-flex", marginLeft: 4, verticalAlign: "middle" }}
    >
      <button
        ref={iconRef}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPinned((p) => !p);
        }}
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1px solid ${T.border}`,
          background: T.card,
          color: T.textMuted,
          fontSize: 10,
          fontWeight: 700,
          fontFamily: T.font,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
          transition: "all 0.15s",
        }}
        aria-label="Help"
      >
        ?
      </button>

      {visible && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            [placement === "bottom" ? "top" : "bottom"]: "calc(100% + 8px)",
            background: T.navy,
            color: "#fff",
            fontFamily: T.font,
            fontSize: 12,
            lineHeight: 1.45,
            fontWeight: 500,
            padding: "8px 12px",
            borderRadius: 8,
            maxWidth: 280,
            width: "max-content",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            zIndex: 1000,
            pointerEvents: pinned ? "auto" : "none",
            whiteSpace: "normal",
          }}
        >
          {text}
          {/* Arrow */}
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: T.navy,
              [placement === "bottom" ? "top" : "bottom"]: -4,
            }}
          />
        </span>
      )}
    </span>
  );
}

export default InlineHelp;
