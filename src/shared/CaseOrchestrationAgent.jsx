import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card, KPICard } from "./primitives";

// ─────────────────────────────────────────────
// CASE ORCHESTRATION AGENT
// Autonomous AI agent that monitors cases and
// executes workflow actions without human intervention.
// Humans approve decisions; the agent handles logistics.
// ─────────────────────────────────────────────

const AGENT_ACTIONS = [
  { id: 1, time: "18 Apr, 09:01", action: "Auto-ordered full valuation for AFN-2026-00142", type: "valuation", status: "completed", detail: "Countrywide Surveying assigned. Fee: £250. SLA: 5 working days.", caseId: "AFN-2026-00142", autonomous: true },
  { id: 2, time: "18 Apr, 09:02", action: "Triggered KYC biometric check for David Chen", type: "kyc", status: "completed", detail: "Mitek ID verification sent via SMS. Result: Verified (99% confidence).", caseId: "AFN-2026-00135", autonomous: true },
  { id: 3, time: "18 Apr, 09:05", action: "Chased missing document — updated utility bill needed", type: "document", status: "pending", detail: "Auto-sent email to broker (Watson & Partners): 'Please provide utility bill dated within last 3 months.' Deadline: 22 Apr.", caseId: "AFN-2026-00142", autonomous: true },
  { id: 4, time: "18 Apr, 09:10", action: "Assigned AFN-2026-00135 to UW queue — low risk, fast-track eligible", type: "assignment", status: "completed", detail: "Risk score 12/100. Routed to James Mitchell (UW-01, L1 mandate, 4 slots available). Fast-track badge applied.", caseId: "AFN-2026-00135", autonomous: true },
  { id: 5, time: "18 Apr, 09:15", action: "Sent status update to broker — KYC complete for Sophie Brown", type: "communication", status: "completed", detail: "Automated email: 'KYC verification complete. Case progressing to underwriting. Expected decision within 24h.'", caseId: "AFN-2026-00115", autonomous: true },
  { id: 6, time: "18 Apr, 09:20", action: "Escalated Robert Hughes — referred case, no product assigned", type: "escalation", status: "awaiting_approval", detail: "Case AFN-2026-00119 has been in 'Referred' status for 5 days with no product. Recommending: assign to Senior UW (L2) for manual review. Adverse credit + Non-Standard property.", caseId: "AFN-2026-00119", autonomous: false },
  { id: 7, time: "18 Apr, 09:25", action: "Cross-validated income documents for James Mitchell", type: "validation", status: "completed", detail: "Payslip (£5,833/mo) ↔ P60 (£67,500) ↔ Bank Statement (£5,833 salary credit). Discrepancy: £2,500 on P60 — explained by bonus timing. No action required.", caseId: "AFN-2026-00142", autonomous: true },
  { id: 8, time: "18 Apr, 09:30", action: "AML screening refreshed for all active cases", type: "compliance", status: "completed", detail: "ComplyAdvantage batch scan: 7 cases checked. 0 sanctions matches. 0 PEP matches. 0 adverse media hits. All clear.", caseId: "ALL", autonomous: true },
  { id: 9, time: "18 Apr, 09:35", action: "Generated ESIS draft for Aisha Patel", type: "document", status: "awaiting_approval", detail: "European Standardised Information Sheet auto-generated from case data. Product: 2-Year Fixed (Professional) @ 3.69%. Awaiting UW review before sending to broker.", caseId: "AFN-2026-00125", autonomous: false },
  { id: 10, time: "18 Apr, 09:40", action: "Detected valuation report received — triggered UW assignment", type: "workflow", status: "completed", detail: "Valuation for AFN-2026-00135 received from Countrywide (£485,000, Good). Auto-moved case from KYC to Underwriting. Assigned to Amir Hassan (UW-02).", caseId: "AFN-2026-00135", autonomous: true },
  { id: 11, time: "18 Apr, 09:45", action: "SLA warning — AFN-2026-00139 approaching 48h in Offer stage", type: "sla", status: "pending", detail: "Offer issued 46h ago. Customer has not responded. Auto-scheduling follow-up call via broker in 2h. If no response by 72h, will escalate to retention.", caseId: "AFN-2026-00139", autonomous: true },
  { id: 12, time: "18 Apr, 09:50", action: "Pre-completion checklist auto-populated for Emma Wilson", type: "workflow", status: "completed", detail: "Case AFN-2026-00128 — Disbursed. Checklist items: ✓ Offer accepted, ✓ Mortgage deed signed, ✓ Insurance confirmed, ✓ Funds released. Onboarded to servicing as M-002891.", caseId: "AFN-2026-00128", autonomous: true },
];

const PIPELINE_STATS = [
  { stage: "Application Received", count: 3, agentActions: 5, avgTime: "1.2h" },
  { stage: "KYC & ID Verification", count: 2, agentActions: 4, avgTime: "2.8h" },
  { stage: "Valuation", count: 2, agentActions: 3, avgTime: "3.2 days" },
  { stage: "Underwriting", count: 4, agentActions: 2, avgTime: "18h" },
  { stage: "Offer", count: 2, agentActions: 1, avgTime: "24h" },
  { stage: "Completion", count: 1, agentActions: 2, avgTime: "2h" },
];

const TYPE_ICON = { valuation: "search", kyc: "shield", document: "file", assignment: "users", communication: "send", escalation: "alert", validation: "check", compliance: "lock", workflow: "zap", sla: "clock" };
const TYPE_COLOR = { valuation: "#3B82F6", kyc: "#059669", document: "#8B5CF6", assignment: "#0EA5E9", communication: "#10B981", escalation: "#DC2626", validation: "#059669", compliance: "#6366F1", workflow: "#F59E0B", sla: "#DC2626" };
const STATUS_STYLE = {
  completed: { bg: "#D1FAE5", color: "#065F46", label: "Completed" },
  pending: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
  awaiting_approval: { bg: "#DBEAFE", color: "#1E40AF", label: "Awaiting Approval" },
};

export default function CaseOrchestrationAgent() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? AGENT_ACTIONS
    : filter === "approval" ? AGENT_ACTIONS.filter(a => !a.autonomous || a.status === "awaiting_approval")
    : AGENT_ACTIONS.filter(a => a.type === filter);

  const autonomousCount = AGENT_ACTIONS.filter(a => a.autonomous && a.status === "completed").length;
  const pendingApproval = AGENT_ACTIONS.filter(a => a.status === "awaiting_approval").length;
  const totalActions = AGENT_ACTIONS.length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {Ico.sparkle(22)}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>Case Orchestration Agent</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Autonomous AI agent managing case workflows. Humans approve decisions — the agent handles logistics.</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#059669", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Agent Active</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, marginTop: 16, flexWrap: "wrap" }}>
        <KPICard label="Actions Today" value={totalActions} sub="autonomous + human" color={T.primary} />
        <KPICard label="Autonomous" value={autonomousCount} sub={`${Math.round(autonomousCount/totalActions*100)}% of total`} color="#059669" />
        <KPICard label="Awaiting Approval" value={pendingApproval} sub="need human review" color={pendingApproval > 0 ? T.warning : T.success} />
        <KPICard label="Cases Monitored" value="7" sub="across all stages" color="#8B5CF6" />
        <KPICard label="Avg Time Saved" value="3.2h" sub="per case vs manual" color={T.accent} />
        <KPICard label="SLA Compliance" value="96%" sub="target: 95%" color={T.success} />
      </div>

      {/* Pipeline overview */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Pipeline — Agent Activity by Stage</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {PIPELINE_STATS.map((s, i) => (
            <div key={i} style={{ flex: "1 1 0", minWidth: 130, padding: "12px 14px", borderRadius: 10, background: T.bg, border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>{s.count}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>{s.stage}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, fontSize: 10 }}>
                <span style={{ color: "#059669", fontWeight: 600 }}>{s.agentActions} actions</span>
                <span style={{ color: T.textMuted }}>avg {s.avgTime}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Actions" },
          { id: "approval", label: "Needs Approval" },
          { id: "document", label: "Documents" },
          { id: "kyc", label: "KYC" },
          { id: "valuation", label: "Valuations" },
          { id: "communication", label: "Comms" },
          { id: "escalation", label: "Escalations" },
        ].map(f => (
          <div key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "5px 14px", borderRadius: 16, fontSize: 11, fontWeight: 600,
            cursor: "pointer", border: `1px solid ${filter === f.id ? T.primary : T.border}`,
            background: filter === f.id ? T.primary : T.card, color: filter === f.id ? "#fff" : T.text,
          }}>{f.label}{f.id === "approval" && pendingApproval > 0 ? ` (${pendingApproval})` : ""}</div>
        ))}
      </div>

      {/* Agent Activity Log */}
      <Card noPad>
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Agent Activity Log</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>Real-time feed of autonomous and human-approved actions</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((action, i) => {
            const st = STATUS_STYLE[action.status] || STATUS_STYLE.pending;
            const typeColor = TYPE_COLOR[action.type] || T.textMuted;
            return (
              <div key={action.id} style={{ display: "flex", gap: 12, padding: "14px 20px", borderTop: i > 0 ? `1px solid ${T.borderLight}` : "none", background: action.status === "awaiting_approval" ? "#FEFCE8" : "transparent" }}>
                {/* Icon */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: typeColor + "14", display: "flex", alignItems: "center", justifyContent: "center", color: typeColor, flexShrink: 0, marginTop: 2 }}>
                  {Ico[TYPE_ICON[action.type]]?.(16) || Ico.sparkle(16)}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{action.action}</span>
                    {action.autonomous && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "#D1FAE5", color: "#065F46" }}>AUTO</span>}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{action.detail}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{action.time}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "#F1F5F9", color: T.textMuted, fontFamily: "monospace" }}>{action.caseId}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                </div>
                {/* Approve/View button for pending items */}
                {action.status === "awaiting_approval" && (
                  <div style={{ display: "flex", gap: 4, alignSelf: "center" }}>
                    <Btn small primary>Approve</Btn>
                    <Btn small>Reject</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
