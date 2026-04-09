import React, { useState, useCallback, createContext, useContext, useEffect, useRef } from "react";
import { T, Ico } from "./tokens";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const TYPE_STYLES = {
  success: { color: T.success, bg: T.successBg, border: T.successBorder, icon: "check" },
  info:    { color: T.primary, bg: T.primaryLight, border: T.primary, icon: "sparkle" },
  warning: { color: T.warning, bg: T.warningBg, border: T.warningBorder, icon: "alert" },
  error:   { color: T.danger, bg: T.dangerBg, border: T.dangerBorder, icon: "alert" },
};

const TOAST_DURATION = 4000;
const MAX_VISIBLE = 3;

function ToastItem({ toast, onClose }) {
  const [phase, setPhase] = useState("enter"); // enter | visible | exit
  const timerRef = useRef(null);
  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  useEffect(() => {
    // Slide in
    const enterTimer = setTimeout(() => setPhase("visible"), 20);
    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => onClose(toast.id), 320);
    }, TOAST_DURATION);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(timerRef.current);
    };
  }, [toast.id, onClose]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setPhase("exit");
    setTimeout(() => onClose(toast.id), 320);
  };

  const iconName = toast.icon || style.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: T.card,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${style.color}`,
        padding: "12px 14px",
        minWidth: 300,
        maxWidth: 420,
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        fontFamily: T.font,
        transform: phase === "enter" ? "translateX(-120%)" : phase === "exit" ? "translateX(-120%)" : "translateX(0)",
        opacity: phase === "exit" ? 0 : 1,
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
        marginTop: 8,
      }}
    >
      <span style={{ color: style.color, flexShrink: 0, marginTop: 1 }}>
        {Ico[iconName] ? Ico[iconName](16) : Ico.check(16)}
      </span>
      <div style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.4 }}>
        {toast.message}
      </div>
      <button
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.textMuted,
          padding: 2,
          flexShrink: 0,
          marginTop: -1,
          lineHeight: 1,
        }}
      >
        {Ico.x(14)}
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "info", icon) => {
    const id = ++idRef.current;
    setToasts((prev) => {
      const next = [...prev, { id, message, type, icon }];
      // Keep only the last MAX_VISIBLE
      return next.slice(-MAX_VISIBLE);
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed, bottom-left, above sidebar FAB */}
      <div
        style={{
          position: "fixed",
          bottom: 28,
          left: 280,
          zIndex: 300,
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext };
export default ToastProvider;
