import React, { useState, useEffect } from "react";
import { T, Ico } from "./tokens";

const TIPS = {
  needsattention: "Tip: Cases are ranked by AI priority. Critical items always appear first — address them before moving to High priority.",
  uwqueue: "Tip: You can fast-track approve low-risk cases directly from the queue — no need to open the full workstation.",
  uwworkstation: "Tip: Click any bar in the Risk Scorecard to see detailed analysis for that dimension.",
  smartapply: "Tip: You only need name, income, property value, and deposit to get started. Nova handles the rest.",
  servicing: "Tip: Use the search bar to find any account instantly. The Actions tab groups all 14 operations in one place.",
  brokerdashboard: "Tip: Cases closest to SLA breach appear first. Squad badges show your assigned team at a glance.",
  allcustomers: "Tip: Click any customer row to open their full Customer Hub with products, timeline, and AI insights.",
  intake: "Tip: Nova AI has already run credit, AVM, and sanctions checks before you see the case. Look for green checkmarks.",
  comparison: "Tip: Click 'Use as Precedent' on a historical case to reference it in your decision notes.",
  policychecker: "Tip: Failed rules can be overridden with an exception request — but you must provide a justification.",
  incomeanalysis: "Tip: For self-employed applicants, switch to the 24-month view to see income variability over time.",
  commission: "Tip: You're £3,600 away from Gold tier. Completing 2 more cases this quarter would unlock 0.40% commission on all future cases.",
  bdmdashboard: "Tip: Use Criteria Quick Check for instant answers to broker questions without creating a formal enquiry.",
  myreports: "Tip: Click 'Schedule' on any report to set up automatic daily, weekly, or monthly delivery.",
  collections: "Tip: AI recommends the optimal contact strategy for each account based on historical engagement patterns.",
};

const STORAGE_PREFIX = "nova_tip_dismissed_";

function AITips({ screenId }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!screenId || !TIPS[screenId]) {
      setVisible(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(STORAGE_PREFIX + screenId);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, [screenId]);

  if (!visible || !TIPS[screenId]) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_PREFIX + screenId, "1");
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
  };

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 380,
        marginLeft: "auto",
        marginBottom: 12,
        background: T.card,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 10,
        padding: "10px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        fontFamily: T.font,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <span style={{ color: T.accent, flexShrink: 0, marginTop: 1, display: "flex" }}>
        {Ico.sparkle(14)}
      </span>
      <span style={{ flex: 1, fontSize: 12, color: T.textMuted, lineHeight: 1.45 }}>
        {TIPS[screenId]}
      </span>
      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: T.textMuted,
          padding: 2,
          flexShrink: 0,
          display: "flex",
          opacity: 0.6,
        }}
        title="Dismiss tip"
      >
        {Ico.x(12)}
      </button>
    </div>
  );
}

export default AITips;
