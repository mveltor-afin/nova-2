import React from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";

const VARIANTS = {
  queue: {
    icon: "check",
    title: "Queue is clear",
    message: "No cases waiting for your attention. Time for a coffee.",
    color: T.success,
    bg: T.successBg,
  },
  search: {
    icon: "search",
    title: "No results found",
    message: "Try a different search term or check spelling.",
    color: T.primary,
    bg: T.primaryLight,
  },
  customers: {
    icon: "customers",
    title: "No customers yet",
    message: "Customers will appear here once they're added to your portfolio.",
    color: T.primary,
    bg: T.primaryLight,
  },
  documents: {
    icon: "file",
    title: "No documents",
    message: "Upload documents to see them here.",
    color: T.warning,
    bg: T.warningBg,
  },
  messages: {
    icon: "messages",
    title: "Inbox zero",
    message: "You're all caught up. New messages will appear here.",
    color: T.success,
    bg: T.successBg,
  },
  default: {
    icon: "sparkle",
    title: "Nothing here yet",
    message: "Content will appear here when available.",
    color: T.primary,
    bg: T.primaryLight,
  },
};

function EmptyState({ icon, title, message, actionLabel, onAction, type = "default" }) {
  const v = VARIANTS[type] || VARIANTS.default;
  const iconKey = icon || v.icon;
  const _title = title || v.title;
  const _message = message || v.message;

  return (
    <>
      <style>{`
        @keyframes emptyStateSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes emptyStateIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: 280,
          maxWidth: 400,
          margin: "0 auto",
          padding: "32px 24px",
          background: T.card,
          borderRadius: 14,
          border: `1px solid ${T.borderLight}`,
          fontFamily: T.font,
          animation: "emptyStateSlideUp 0.5s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: "50%",
            background: v.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: v.color,
            marginBottom: 20,
            animation: "emptyStateIconPulse 3.2s ease-in-out infinite",
          }}
        >
          {Ico[iconKey]?.(60) || Ico.sparkle(60)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>
          {_title}
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textMuted,
            lineHeight: 1.5,
            marginBottom: actionLabel ? 20 : 0,
            maxWidth: 320,
          }}
        >
          {_message}
        </div>
        {actionLabel && onAction && (
          <Btn primary onClick={onAction}>
            {actionLabel}
          </Btn>
        )}
      </div>
    </>
  );
}

export default EmptyState;
