import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// CASE TRACKER
// Visual progress stepper for mortgage applications
// ─────────────────────────────────────────────

const STAGES = [
  { key: "DIP", label: "DIP", icon: "check" },
  { key: "Submitted", label: "Submitted", icon: "upload" },
  { key: "KYC", label: "KYC", icon: "user" },
  { key: "Underwriting", label: "Underwriting", icon: "eye" },
  { key: "Offer", label: "Offer", icon: "file" },
  { key: "Completion", label: "Completion", icon: "lock" },
  { key: "Disbursed", label: "Disbursed", icon: "dollar" },
];

const STATUS_TO_STAGE = {
  DIP_Approved: "DIP", Submitted: "Submitted", KYC_In_Progress: "KYC",
  Underwriting: "Underwriting", Valuation_Complete: "Underwriting",
  Approved: "Offer", Offer_Issued: "Offer", Offer_Accepted: "Completion",
  Disbursed: "Disbursed",
};

const TIMELINE_EVENTS = [
  { date: "17 Apr 2026", time: "09:14", desc: "Offer issued — awaiting acceptance", actor: "System", color: "#3B82F6", icon: "file" },
  { date: "15 Apr 2026", time: "16:42", desc: "Valuation report received — £396,433", actor: "Surveyor", color: "#059669", icon: "check" },
  { date: "14 Apr 2026", time: "11:20", desc: "Property valuation instructed", actor: "Ops Team", color: "#8B5CF6", icon: "eye" },
  { date: "12 Apr 2026", time: "14:08", desc: "Underwriting review completed — approved", actor: "Sarah Chen, UW", color: "#059669", icon: "check" },
  { date: "10 Apr 2026", time: "10:35", desc: "Case assigned to underwriter", actor: "System", color: "#F59E0B", icon: "assign" },
  { date: "08 Apr 2026", time: "09:50", desc: "KYC verification complete — all checks passed", actor: "System", color: "#059669", icon: "shield" },
  { date: "05 Apr 2026", time: "15:22", desc: "Supporting documents uploaded (payslips, ID, bank statements)", actor: "James Mitchell", color: "#3B82F6", icon: "upload" },
  { date: "03 Apr 2026", time: "11:00", desc: "Application created via broker portal", actor: "Mark Thompson, BDM", color: "#1A4A54", icon: "plus" },
];

const pulseKeyframes = `
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(26,74,84,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(26,74,84,0); }
}
`;

export default function CaseTracker({ application, onBack }) {
  const currentStage = STATUS_TO_STAGE[application?.status] || "DIP";
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div style={{ padding: "0 20px 20px" }}>
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "#fff", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {Ico.arrowLeft(18)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>Application Tracker</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{application?.id || "AFN-2026-00142"}</div>
        </div>
      </div>

      {/* Estimated completion */}
      <div style={{
        padding: "14px 16px", borderRadius: 14, marginBottom: 16,
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>Estimated Completion</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>28 April 2026</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase" }}>Product</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{application?.product || "2-Year Fixed"}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{application?.amount || "£350,000"}</div>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card style={{ marginBottom: 16, padding: "20px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Progress</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
          {/* Connecting line */}
          <div style={{ position: "absolute", top: 14, left: 20, right: 20, height: 2, background: T.borderLight, zIndex: 0 }} />
          <div style={{ position: "absolute", top: 14, left: 20, height: 2, background: `linear-gradient(90deg, ${T.accent}, ${T.primary})`, zIndex: 1, width: `${Math.max(0, (currentIdx / (STAGES.length - 1)) * 100 - 5)}%`, transition: "width 0.5s ease" }} />

          {STAGES.map((stage, i) => {
            const isComplete = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isFuture = i > currentIdx;

            return (
              <div key={stage.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 14,
                  background: isComplete ? T.accent : isCurrent ? T.primary : "#fff",
                  border: isFuture ? `2px solid ${T.borderLight}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isComplete || isCurrent ? "#fff" : T.textMuted,
                  animation: isCurrent ? "pulse 2s ease-in-out infinite" : "none",
                  transition: "all 0.3s",
                }}>
                  {isComplete ? Ico.check(14) : (Ico[stage.icon]?.(12) || <span style={{ fontSize: 10, fontWeight: 700 }}>{i + 1}</span>)}
                </div>
                <div style={{ fontSize: 8, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? T.primary : isFuture ? T.textMuted : T.text, marginTop: 6, textAlign: "center", lineHeight: 1.2 }}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Timeline</div>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: T.borderLight }} />

        {TIMELINE_EVENTS.map((evt, i) => (
          <div key={i} style={{ marginBottom: i < TIMELINE_EVENTS.length - 1 ? 16 : 0, position: "relative" }}>
            {/* Dot */}
            <div style={{
              position: "absolute", left: -20, top: 4, width: 14, height: 14, borderRadius: 7,
              background: evt.color, border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: "#fff" }} />
            </div>

            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${T.borderLight}`, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{evt.desc}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, color: T.textMuted }}>{evt.date} at {evt.time}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: evt.color }}>{evt.actor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
