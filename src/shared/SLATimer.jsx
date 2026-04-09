import React from "react";
import { T, Ico } from "./tokens";

const SLA_DEFAULTS = {
  KYC_In_Progress: 24,
  Underwriting: 48,
  Submitted: 4,
  Referred: 72,
  Offer_Issued: 120,
};

function parseUpdatedAgo(str) {
  if (!str) return 0;
  const m = str.match(/(\d+)\s*(h|d|w|m)/i);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === "h") return n;
  if (unit === "d") return n * 24;
  if (unit === "w") return n * 168;
  if (unit === "m") return n * 43200;
  return 0;
}

function formatRemaining(hours) {
  const abs = Math.abs(hours);
  if (abs >= 24) {
    const d = Math.floor(abs / 24);
    const h = Math.round(abs % 24);
    return h > 0 ? `${d}d ${h}h` : `${d}d`;
  }
  const h = Math.floor(abs);
  const mins = Math.round((abs - h) * 60);
  return mins > 0 ? `${h}h ${mins}m` : `${h}h`;
}

const breachedKeyframes = `
@keyframes sla-breach-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const tag = document.createElement("style");
  tag.textContent = breachedKeyframes;
  document.head.appendChild(tag);
}

export default function SLATimer({ status, updatedAgo, slaHours, expanded = false }) {
  injectStyle();

  const slaTarget = slaHours != null ? slaHours : (SLA_DEFAULTS[status] || null);

  if (slaTarget == null) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontFamily: T.font, color: T.textMuted,
        padding: "3px 8px", borderRadius: 6, background: "#F1F5F9",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.textMuted, flexShrink: 0 }} />
        No SLA
      </span>
    );
  }

  const elapsed = parseUpdatedAgo(updatedAgo);
  const remaining = slaTarget - elapsed;
  const pct = remaining / slaTarget;

  let color, bg, label, dotStyle;

  if (remaining < 0) {
    color = T.danger;
    bg = T.dangerBg;
    label = `BREACHED · ${formatRemaining(-remaining)} over`;
    dotStyle = { animation: "sla-breach-pulse 1s infinite" };
  } else if (pct < 0.25) {
    color = T.danger;
    bg = T.dangerBg;
    label = `Critical · ${formatRemaining(remaining)} remaining`;
    dotStyle = {};
  } else if (pct < 0.5) {
    color = "#D97706";
    bg = T.warningBg;
    label = `At risk · ${formatRemaining(remaining)} remaining`;
    dotStyle = {};
  } else {
    color = T.success;
    bg = T.successBg;
    label = `On track · ${formatRemaining(remaining)} remaining`;
    dotStyle = {};
  }

  const progressPct = Math.min(Math.max((elapsed / slaTarget) * 100, 0), 100);
  const breached = remaining < 0;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: expanded ? 4 : 0, fontFamily: T.font }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 11, fontWeight: breached ? 700 : 500, color,
        padding: "3px 8px", borderRadius: 6, background: bg,
        whiteSpace: "nowrap",
        ...(breached ? { animation: "sla-breach-pulse 1.5s infinite" } : {}),
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, ...dotStyle }} />
        {label}
      </span>
      {expanded && (
        <div style={{ height: 4, borderRadius: 2, background: "#E2E8F0", overflow: "hidden", width: "100%", minWidth: 100 }}>
          <div style={{
            height: "100%",
            borderRadius: 2,
            width: breached ? "100%" : `${progressPct}%`,
            background: color,
            transition: "width 0.3s",
          }} />
        </div>
      )}
    </span>
  );
}
