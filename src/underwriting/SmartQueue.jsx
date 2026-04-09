import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";
import SquadPanel from "../shared/SquadPanel";

/* ─── Queue case data ─── */
const QUEUE_CASES = [
  {
    id: "AFN-2026-00119", names: "Robert Hughes", amount: "£180,000", status: "Referred",
    riskScore: 78, riskColor: T.danger, priority: "HIGH",
    aiSummary: "Self-cert income, no employer verification possible. Referred from L1. Above standard mandate threshold.",
    badge: "Manual Review Required", badgeColor: T.warning,
    mandate: "L2 — Requires Senior UW", mandateColor: T.warning,
    sla: "Senior Review — 18h remaining", slaColor: T.warning, slaPulse: false,
    squad: { bdm: "Sarah Thompson", ops: "Tom Walker" },
    fastTrack: false,
  },
  {
    id: "AFN-2026-00142", names: "James & Sarah Mitchell", amount: "£350,000", status: "Underwriting",
    riskScore: 14, riskColor: T.success, priority: "MEDIUM",
    aiSummary: "Strong profile. Employed 7yrs, credit 742, LTV 72%. All docs verified. AI recommends: Approve, no conditions.",
    badge: "Fast-Track Eligible", badgeColor: T.success,
    mandate: "L1 — Within your mandate", mandateColor: T.success,
    sla: "Decision due — 22h remaining", slaColor: T.success, slaPulse: false,
    squad: { bdm: "—", ops: "Tom Walker" },
    fastTrack: true,
  },
  {
    id: "AFN-2026-00135", names: "David Chen", amount: "£425,000", status: "KYC_In_Progress",
    riskScore: 42, riskColor: T.warning, priority: "MEDIUM",
    aiSummary: "Interest only, high LTV (90%). Income strong but IO requires retirement plan evidence.",
    badge: "Manual Review Required", badgeColor: T.warning,
    mandate: "L1 — Within your mandate", mandateColor: T.success,
    sla: "KYC complete — 4h remaining", slaColor: T.danger, slaPulse: true,
    squad: { bdm: "—", ops: "Lucy Fernandez" },
    fastTrack: false,
  },
  {
    id: "AFN-2026-00125", names: "Aisha Patel", amount: "£510,000", status: "Approved",
    riskScore: 22, riskColor: T.success, priority: "LOW",
    aiSummary: "Above £500k threshold. Requires second approval (mandate L2). AI recommends: Approve.",
    badge: "Escalation — L2 Required", badgeColor: "#3B82F6",
    mandate: "L2 — Awaiting 2nd approval", mandateColor: "#3B82F6",
    sla: "2nd approval — 36h remaining", slaColor: T.success, slaPulse: false,
    squad: { bdm: "—", ops: "—" },
    fastTrack: false, escalation: true,
  },
  {
    id: "AFN-2026-00115", names: "Sophie & Jack Brown", amount: "£320,000", status: "DIP_Approved",
    riskScore: 18, riskColor: T.success, priority: "LOW",
    aiSummary: "First-time buyer, Fix 2yr 90%. LTV elevated but within product max. Clean credit.",
    badge: "Fast-Track Eligible", badgeColor: T.success,
    mandate: "L1 — Within your mandate", mandateColor: T.success,
    sla: "No SLA yet — DIP stage", slaColor: T.textMuted, slaPulse: false,
    squad: { bdm: "—", ops: "—" },
    fastTrack: true,
  },
  {
    id: "AFN-2026-00139", names: "Priya Sharma", amount: "£275,000", status: "Offer_Issued",
    riskScore: 12, riskColor: T.success, priority: "LOW",
    aiSummary: "Offer issued, awaiting acceptance. Strong affordability, clean credit profile.",
    badge: "On Track", badgeColor: T.success,
    mandate: "L1 — Within your mandate", mandateColor: T.success,
    sla: "Offer expires — 12d remaining", slaColor: T.success, slaPulse: false,
    squad: { bdm: "James Reed", ops: "Tom Walker" },
    fastTrack: false,
  },
  {
    id: "AFN-2026-00128", names: "Emma & Tom Wilson", amount: "£290,000", status: "Disbursed",
    riskScore: 8, riskColor: T.success, priority: "LOW",
    aiSummary: "Completed and disbursed. Post-completion review flagged — no issues found.",
    badge: "Complete", badgeColor: T.textMuted,
    mandate: "L1 — No action required", mandateColor: T.textMuted,
    sla: "No SLA — Disbursed", slaColor: T.textMuted, slaPulse: false,
    squad: { bdm: "—", ops: "Tom Walker" },
    fastTrack: false,
  },
];

/* ─── Helpers ─── */
const amountNum = (s) => parseInt(s.replace(/[^0-9]/g, ""), 10);
const sortFns = {
  risk: (a, b) => b.riskScore - a.riskScore,
  sla: (a, b) => {
    const urgency = (c) => (c.slaPulse ? 0 : c.slaColor === T.danger ? 1 : c.slaColor === T.warning ? 2 : 3);
    return urgency(a) - urgency(b);
  },
  amount: (a, b) => amountNum(b.amount) - amountNum(a.amount),
};
const filterFns = {
  all: () => true,
  fasttrack: (c) => c.fastTrack,
  manual: (c) => c.badge.includes("Manual"),
  escalation: (c) => c.badge.includes("Escalation"),
};

/* ─── Risk bar ─── */
const RiskBar = ({ score, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 52 }}>{score}/100</span>
    <div style={{ flex: 1, height: 8, borderRadius: 4, background: T.borderLight }}>
      <div style={{ width: `${score}%`, height: "100%", borderRadius: 4, background: color, transition: "width .4s" }} />
    </div>
  </div>
);

/* ─── Pill badge ─── */
const Pill = ({ text, color }) => (
  <span style={{
    display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
    background: color === T.success ? T.successBg : color === T.warning ? T.warningBg : color === T.danger ? T.dangerBg : color === "#3B82F6" ? "#DBEAFE" : "#F3F4F6",
    color: color === "#3B82F6" ? "#1E40AF" : color,
  }}>{text}</span>
);

/* ═══════════════════════════════════════════
   SMART QUEUE COMPONENT
   ═══════════════════════════════════════════ */
function SmartQueue({ onOpenCase }) {
  const [sort, setSort] = useState("risk");
  const [filter, setFilter] = useState("all");
  const [fastTrackModal, setFastTrackModal] = useState(null);

  const filtered = QUEUE_CASES.filter(filterFns[filter]).sort(sortFns[sort]);

  return (
    <div style={{ fontFamily: T.font, color: T.text, maxWidth: 1060, margin: "0 auto" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Ico.shield(22)}
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Underwriting Queue</h1>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>AI-triaged and risk-sorted</p>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="My Queue" value="5" color={T.primary} />
        <KPICard label="Fast-Track Eligible" value="2" color={T.success} />
        <KPICard label="Manual Review" value="2" color={T.warning} />
        <KPICard label="Avg Decision Time" value="2.1h" color={T.primary} />
        <KPICard label="SLA Compliance" value="96%" color={T.success} />
      </div>

      {/* ── AI Triage Banner ── */}
      <Card style={{
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
        marginBottom: 24, border: "none",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ marginTop: 2 }}>{Ico.sparkle(20)}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Nova AI Triage</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.92 }}>
              Nova AI has triaged <b>5 cases</b>. <b>2</b> are fast-track eligible (low risk, all checks green).
              <b> 1</b> requires specialist review (self-employed income). Priority case:
              <b> AFN-2026-00135</b> approaching SLA breach in <b>4 hours</b>.
            </div>
          </div>
        </div>
      </Card>

      {/* ── Sort / Filter Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap",
        padding: "12px 16px", background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Sort by:</span>
        {[["risk", "Risk Score"], ["sla", "SLA Urgency"], ["amount", "Amount"]].map(([k, l]) => (
          <Btn key={k} small ghost={sort !== k} primary={sort === k} onClick={() => setSort(k)}>{l}</Btn>
        ))}
        <span style={{ width: 1, height: 22, background: T.border, margin: "0 6px" }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Filter:</span>
        {[["all", "All"], ["fasttrack", "Fast-Track"], ["manual", "Manual Review"], ["escalation", "Escalation"]].map(([k, l]) => (
          <Btn key={k} small ghost={filter !== k} primary={filter === k} onClick={() => setFilter(k)}>{l}</Btn>
        ))}
      </div>

      {/* ── Queue Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((c) => (
          <Card key={c.id} style={{ padding: 0, overflow: "hidden" }}>
            {/* Priority bar */}
            <div style={{
              height: 4,
              background: c.priority === "HIGH" ? T.danger : c.priority === "MEDIUM" ? T.warning : T.success,
            }} />

            <div style={{ padding: "20px 24px" }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.4,
                  background: c.priority === "HIGH" ? T.dangerBg : c.priority === "MEDIUM" ? T.warningBg : T.successBg,
                  color: c.priority === "HIGH" ? T.danger : c.priority === "MEDIUM" ? "#92400E" : T.success,
                }}>{c.priority} PRIORITY</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{c.id}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.names}</span>
                <span style={{ fontSize: 13, color: T.textMuted }}>{c.amount}</span>
                <StatusBadge status={c.status} />
              </div>

              {/* AI Risk Score */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>AI Risk Score</span>
                <RiskBar score={c.riskScore} color={c.riskColor} />
              </div>

              {/* AI Summary */}
              <div style={{
                fontSize: 13, color: T.textSecondary, lineHeight: 1.5, marginBottom: 12,
                padding: "10px 14px", background: "rgba(26,74,84,0.04)", borderRadius: 8, borderLeft: `3px solid ${T.primary}`,
              }}>
                <span style={{ fontWeight: 600, marginRight: 4 }}>AI:</span> "{c.aiSummary}"
              </div>

              {/* Badges row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Pill text={c.badge} color={c.badgeColor} />
                <Pill text={c.mandate} color={c.mandateColor} />
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                  color: c.slaColor,
                  background: c.slaColor === T.danger ? T.dangerBg : c.slaColor === T.warning ? T.warningBg : c.slaColor === T.success ? T.successBg : "#F3F4F6",
                  animation: c.slaPulse ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>{c.sla}</span>
              </div>

              {/* Squad */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:11, color:T.textMuted, fontWeight:600 }}>Squad:</span>
                {c.loanRef?.squad ? <SquadPanel squad={c.loanRef.squad} compact /> : (
                  <div style={{ fontSize:12, color:T.textMuted }}>
                    <span style={{ fontWeight:600 }}>BDM:</span> {c.squad?.bdm || "—"} · <span style={{ fontWeight:600 }}>Ops:</span> {c.squad?.ops || "—"}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {c.fastTrack && (
                  <Btn small onClick={() => setFastTrackModal(c)} style={{ background: T.success, color: "#fff", border: "none" }}>
                    {Ico.check(14)} Fast-Track Approve
                  </Btn>
                )}
                {c.escalation && (
                  <Btn small primary onClick={() => onOpenCase?.(c)}>
                    {Ico.eye(14)} Review &amp; Co-Approve
                  </Btn>
                )}
                <Btn small onClick={() => onOpenCase?.(c)}>
                  Open Case {Ico.arrow(14)}
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Pulse keyframe (injected once) ── */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }`}</style>

      {/* ── Fast-Track Confirmation Modal ── */}
      {fastTrackModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(12,45,59,0.45)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999,
        }} onClick={() => setFastTrackModal(null)}>
          <Card style={{ maxWidth: 460, width: "90%", padding: 32, boxShadow: "0 12px 40px rgba(0,0,0,.18)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.sparkle(20)}
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Confirm Fast-Track Approval</h2>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: T.textSecondary, marginBottom: 6 }}>
              AI recommends approval with <b>no conditions</b>.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: T.textSecondary, marginBottom: 20 }}>
              Risk score <b style={{ color: T.success }}>{fastTrackModal.riskScore}/100</b>.
              Confirm fast-track?
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn primary onClick={() => { setFastTrackModal(null); }}>
                {Ico.check(16)} Confirm Approve
              </Btn>
              <Btn onClick={() => { setFastTrackModal(null); onOpenCase?.(fastTrackModal); }}>
                Open Full Review
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SmartQueue;
