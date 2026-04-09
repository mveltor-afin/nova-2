import React from "react";
import { T, Ico } from "./tokens";

const STEPS = ["DIP", "Submitted", "KYC", "Underwriting", "Offer", "Completion", "Disbursed"];

const STATUS_TO_STEP = {
  DIP_Approved: "DIP",
  Submitted: "Submitted",
  KYC_In_Progress: "KYC",
  Underwriting: "Underwriting",
  Referred: "Underwriting",
  Approved: "Offer",
  Offer_Issued: "Offer",
  Offer_Accepted: "Completion",
  Disbursed: "Disbursed",
};

const pulseKeyframes = `
@keyframes cps-pulse {
  0% { box-shadow: 0 0 0 0 rgba(26,74,84,0.45); }
  70% { box-shadow: 0 0 0 8px rgba(26,74,84,0); }
  100% { box-shadow: 0 0 0 0 rgba(26,74,84,0); }
}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const tag = document.createElement("style");
  tag.textContent = pulseKeyframes;
  document.head.appendChild(tag);
}

export default function CaseProgressStepper({ status, compact = false }) {
  injectStyle();

  const currentStep = STATUS_TO_STEP[status] || null;
  const currentIdx = currentStep ? STEPS.indexOf(currentStep) : -1;

  const circleSize = compact ? 20 : 28;
  const iconSize = compact ? 10 : 14;
  const lineHeight = compact ? 2 : 3;

  return (
    <div style={{ display: "flex", alignItems: "center", fontFamily: T.font, height: compact ? 30 : 50, userSelect: "none" }}>
      {STEPS.map((step, i) => {
        const isCompleted = currentIdx > i;
        const isCurrent = currentIdx === i;
        const isFuture = currentIdx < i;

        const circleStyle = {
          width: circleSize,
          height: circleSize,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.3s",
        };

        if (isCompleted) {
          Object.assign(circleStyle, {
            background: T.success,
            border: "none",
            color: "#fff",
          });
        } else if (isCurrent) {
          Object.assign(circleStyle, {
            background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
            border: "none",
            color: "#fff",
            animation: "cps-pulse 2s infinite",
          });
        } else {
          Object.assign(circleStyle, {
            background: "transparent",
            border: `2px solid ${T.border}`,
            color: T.textMuted,
          });
        }

        const lineColor = isCompleted ? T.success : T.border;

        return (
          <React.Fragment key={step}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: compact ? 0 : 4 }}>
              <div style={circleStyle}>
                {isCompleted && (
                  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
                {isCurrent && (
                  <div style={{ width: iconSize * 0.5, height: iconSize * 0.5, borderRadius: "50%", background: "#fff" }} />
                )}
              </div>
              {!compact && (
                <span style={{
                  fontSize: 9,
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCompleted ? T.success : isCurrent ? T.primary : T.textMuted,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.2,
                }}>
                  {step}
                </span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: lineHeight,
                minWidth: compact ? 12 : 20,
                background: lineColor,
                borderRadius: lineHeight,
                marginBottom: compact ? 0 : 16,
                transition: "background 0.3s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
