import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";
import SquadPanel from "../shared/SquadPanel";

/* ── time-based greeting ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ── pipeline step definitions ── */
const STEPS = ["DIP", "Submitted", "KYC", "UW", "Offer", "Complete", "Disbursed"];

const STATUS_TO_STEP = {
  Draft: 0,
  DIP_Approved: 0,
  Submitted: 1,
  KYC_In_Progress: 2,
  Underwriting: 3,
  Referred: 3,
  Valuation_Complete: 4,
  Approved: 4,
  Offer_Issued: 4,
  Offer_Accepted: 5,
  Disbursed: 6,
};

/* ── SLA config ── */
const SLA_MAP = {
  KYC_In_Progress: { label: "KYC — 18h remaining", color: T.success },
  Underwriting: { label: "UW Decision — 6h remaining", color: T.warning },
  Referred: { label: "Senior Review — 2d remaining", color: T.success },
  Offer_Issued: { label: "Awaiting acceptance", color: null },
  DIP_Approved: { label: "Submit application", color: null },
  Disbursed: { label: "Complete ✓", color: null },
};

const SLA_URGENCY = {
  Underwriting: 1,
  KYC_In_Progress: 2,
  Referred: 3,
  Submitted: 4,
  Offer_Issued: 5,
  DIP_Approved: 6,
  Approved: 6,
  Offer_Accepted: 7,
  Disbursed: 8,
};

/* ── notifications ── */
const NOTIFICATIONS = [
  { icon: "file", color: "#1D4ED8", bg: "#DBEAFE", title: "Offer issued", detail: "AFN-2026-00139 — Priya Sharma", time: "1d ago" },
  { icon: "check", color: T.success, bg: T.successBg, title: "DIP approved", detail: "AFN-2026-00115 — Sophie & Jack Brown", time: "6d ago" },
  { icon: "alert", color: T.danger, bg: T.dangerBg, title: "Document flagged", detail: "P60 variance — James Mitchell", time: "2h ago" },
  { icon: "messages", color: "#8B5CF6", bg: "#EDE9FE", title: "New message", detail: "Ops team responded re: ERC query", time: "4h ago" },
];

/* ── stepper component ── */
const ProgressStepper = ({ currentStep }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, margin: "14px 0 10px" }}>
    {STEPS.map((label, idx) => {
      const done = idx < currentStep;
      const active = idx === currentStep;
      const future = idx > currentStep;
      return (
        <div key={label} style={{ display: "flex", alignItems: "center", flex: idx < STEPS.length - 1 ? 1 : "none" }}>
          {/* circle */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: done ? "#fff" : active ? "#fff" : T.textMuted, flexShrink: 0,
              background: done ? T.success : active ? T.primary : "transparent",
              border: future ? `2px solid ${T.border}` : "none",
              boxShadow: active ? `0 0 0 4px ${T.primaryGlow}` : "none",
              transition: "all 0.25s",
            }}>
              {done ? Ico.check(12) : (idx + 1)}
            </div>
            {active && (
              <div style={{
                position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${T.primary}`,
                animation: "pulse 2s ease-in-out infinite", opacity: 0.4, pointerEvents: "none",
              }} />
            )}
            <div style={{ position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 9, fontWeight: 600, color: done ? T.success : active ? T.primary : T.textMuted, letterSpacing: 0.2 }}>
              {label}
            </div>
          </div>
          {/* connector line */}
          {idx < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: done ? T.success : T.border, marginLeft: 4, marginRight: 4, transition: "background 0.25s" }} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── main component ── */
function BrokerDashboardV2({ onNewLoan, onOpenCase }) {
  const sorted = [...MOCK_LOANS].sort((a, b) => (SLA_URGENCY[a.status] || 99) - (SLA_URGENCY[b.status] || 99));

  const totalPipeline = MOCK_LOANS.reduce((sum, l) => {
    const num = parseFloat(l.amount.replace(/[^\d.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* pulse keyframe */}
      <style>{`@keyframes pulse { 0%,100% { transform:scale(1); opacity:0.4 } 50% { transform:scale(1.3); opacity:0 } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{getGreeting()}, John.</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
            You have <b style={{ color: T.text }}>4 cases</b> needing attention this week — 1 fewer than last week. Nice work.
          </div>
        </div>
        <Btn primary icon="plus" onClick={onNewLoan}>New Loan</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Active Cases" value={MOCK_LOANS.length} color={T.primary} />
        <KPICard label="Total Pipeline" value={`£${(totalPipeline / 1000).toFixed(0)}K`} sub={`£${(totalPipeline / 1000000).toFixed(2)}M`} color={T.accent} />
        <KPICard label="Avg DIP Time" value="4.2 min" color={T.success} />
        <KPICard label="This Month" value="£890K" color={T.warning} />
        <KPICard label="Commission Pending" value="£4,820" color="#8B5CF6" />
      </div>

      {/* Main layout: pipeline + sidebar */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Pipeline cards ── */}
        <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>Pipeline</div>
          {sorted.map((loan) => {
            const stepIdx = STATUS_TO_STEP[loan.status] ?? 0;
            const sla = SLA_MAP[loan.status];
            return (
              <Card key={loan.id} style={{ padding: 20 }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span onClick={() => onOpenCase?.(loan)} style={{ fontSize: 13, fontWeight: 700, color: T.primary, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{loan.id}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{loan.names}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{loan.amount}</span>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{loan.product}</span>
                  </div>
                </div>

                {/* Progress stepper */}
                <ProgressStepper currentStep={stepIdx} />

                {/* Squad */}
                {loan.squad && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:12, padding:"8px 0", borderTop:`1px solid ${T.borderLight}` }}>
                    <span style={{ fontSize:11, color:T.textMuted, fontWeight:600 }}>Squad:</span>
                    <SquadPanel squad={loan.squad} compact />
                  </div>
                )}
                {/* Bottom row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusBadge status={loan.status} />
                    {sla && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                        background: sla.color === T.success ? T.successBg : sla.color === T.warning ? T.warningBg : T.primaryLight,
                        color: sla.color || T.textMuted,
                      }}>
                        {sla.label}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{Ico.clock(12)} {loan.updated}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Notifications sidebar ── */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12 }}>Notifications</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NOTIFICATIONS.map((n, i) => (
              <Card key={i} style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", color: n.color, flexShrink: 0 }}>
                    {Ico[n.icon]?.(16)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{n.detail}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{n.time}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrokerDashboardV2;
