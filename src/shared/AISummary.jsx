import React, { useState } from "react";
import { T, Ico } from "./tokens";

const SUMMARIES = {
  needsattention: "3 customers need action — 1 critical (Robert Hughes: arrears + expired KYC). 2 high priority rate expiries this month.",
  allcustomers: "8 customers in portfolio. 2 at risk. 1 Platinum tier (Maria Santos — highest relationship value at £22.6k).",
  uwqueue: "5 cases in queue. 2 fast-track eligible. AFN-2026-00135 approaching SLA breach in 4 hours — prioritise.",
  uwworkstation: "Case risk score: 14/100. AI recommends Approve with 92% confidence. All 18 policy rules pass.",
  brokerdashboard: "7 active cases. Pipeline value £2.35M. 2 cases need documents. Commission pending: £4,820.",
  smartapply: "Ready for new application. Last submission took 4.2 minutes. AI will auto-populate 73% of fields.",
  servicing: "7 accounts in portfolio. 2 in arrears (£7,520 total). 3 rates expiring within 90 days.",
  mortgages: "£1.86M mortgage book across 6 active accounts. 1 in arrears, 1 locked. Average LTV 66%.",
  savings: "£184k deposit book. 1 account maturing within 60 days (£26.8k). Average rate 4.03%.",
  intake: "3 new applications today. 2 auto-checks complete. Average first-touch time: 14 minutes.",
  approvals: "5 items pending approval. 3 within your mandate. 1 requires L2 escalation.",
  disbursements: "£510k pending authorisation. 1 disbursement awaiting 4-eyes check. Today's scheduled: £510k.",
  commission: "£4,820 pending commission across 5 cases. On track for Gold tier this quarter.",
  mymi: "Your conversion rate (34%) is 2% above team average. Processing time improved 12% this month.",
  myreports: "8 reports available for your role. 2 scheduled for automatic delivery.",
  aidashboard: "42 AI actions generated across portfolio. 3 critical. Revenue opportunity: £48k from cross-sell.",
  riskanomaly: "8 active anomaly flags. 2 critical (fraud signals). 3 customers at elevated risk.",
  comparison: "Select a case to find similar historical decisions. 4 of 5 typical comparisons show positive outcomes.",
  policychecker: "Select a case to validate against 18 lending policy rules.",
  incomeanalysis: "Select a case to analyse income structure, sources, and sustainability.",
  bdmdashboard: "12 enquiries this month. 42% conversion rate. Pipeline value £3.8M. 4 broker meetings this week.",
  collections: "12 active collection cases. £47,820 total arrears. Recovery rate 72%.",
  stresstest: "Last stress test: 01 Apr 2026. Under combined adverse scenario, 5 of 8 accounts would be stressed.",
  consumerduty: "Overall Consumer Duty score: 87%. Consumer Support (79%) is the lowest pillar — review recommended.",
};

function AISummary({ screenId, persona }) {
  const [dismissed, setDismissed] = useState(false);

  const summary = SUMMARIES[screenId];
  if (!summary || dismissed) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: 36,
        padding: "0 14px",
        background: "linear-gradient(90deg, rgba(26,74,84,0.04) 0%, rgba(49,184,151,0.03) 100%)",
        borderLeft: `3px solid ${T.accent}`,
        borderRadius: "0 8px 8px 0",
        fontFamily: T.font,
        marginBottom: 8,
      }}
    >
      <span style={{ color: T.accent, flexShrink: 0, display: "flex" }}>
        {Ico.sparkle(14)}
      </span>
      <span
        style={{
          flex: 1,
          fontSize: 12,
          color: T.textMuted,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {summary}
      </span>
      <button
        onClick={() => setDismissed(true)}
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
        title="Dismiss"
      >
        {Ico.x(12)}
      </button>
    </div>
  );
}

export default AISummary;
