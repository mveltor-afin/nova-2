import React, { useState, useRef, useEffect } from "react";
import { T, Ico } from "./tokens";

function QuickActions({ actions = [], onAction }) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Decide drop direction based on viewport position
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedHeight = actions.length * 38 + 16;
      setDropUp(spaceBelow < estimatedHeight + 20);
    }
  }, [open, actions.length]);

  const handleAction = (e, a) => {
    e.stopPropagation();
    setOpen(false);
    onAction?.(a.id, a);
  };

  return (
    <>
      <style>{`
        @keyframes quickActionsSlideDown {
          0% { opacity: 0; transform: translateY(-6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes quickActionsSlideUp {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ position: "relative", display: "inline-block", fontFamily: T.font }}>
        <button
          ref={btnRef}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-label="More actions"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "none",
            background: open ? T.primaryLight : "transparent",
            color: T.textSecondary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            if (!open) e.currentTarget.style.background = T.bg;
          }}
          onMouseLeave={(e) => {
            if (!open) e.currentTarget.style.background = "transparent";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              right: 0,
              top: dropUp ? "auto" : "calc(100% + 6px)",
              bottom: dropUp ? "calc(100% + 6px)" : "auto",
              width: 180,
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(12,45,59,0.15), 0 2px 8px rgba(12,45,59,0.06)",
              padding: 6,
              zIndex: 1000,
              animation: `${
                dropUp ? "quickActionsSlideUp" : "quickActionsSlideDown"
              } 0.16s cubic-bezier(.2,.8,.2,1)`,
            }}
          >
            {actions.map((a) => {
              const iconNode = a.icon && Ico[a.icon] ? Ico[a.icon](14) : null;
              return (
                <button
                  key={a.id}
                  onClick={(e) => handleAction(e, a)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 10px",
                    border: "none",
                    background: "transparent",
                    color: a.danger ? T.danger : T.text,
                    fontSize: 13,
                    fontFamily: T.font,
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 6,
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = a.danger ? T.dangerBg : T.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {iconNode && (
                    <span
                      style={{
                        display: "inline-flex",
                        color: a.danger ? T.danger : T.textMuted,
                      }}
                    >
                      {iconNode}
                    </span>
                  )}
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default QuickActions;
