import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const AGENT_RUNS = [
  { id: "RUN-001", agentName: "Case Processing Agent", caseId: "AFN-2026-00150", customer: "Chris & Amy Parker", startedAt: "09:01", status: "complete", duration: "4m 12s",
    steps: [
      { step: 1, phase: "observe", text: "New case AFN-2026-00150 arrived. Status: Approved. LTV: 68%. Risk: 15/100.", ts: "09:01:00" },
      { step: 1, phase: "think", text: "Case is low risk, LTV 68% within AVM threshold (\u226475%). Order AVM first \u2014 faster and cheaper than full valuation.", ts: "09:01:02" },
      { step: 1, phase: "act", text: "Ordered AVM via Countrywide API. Result: \u00a3485,000 (87% confidence).", ts: "09:01:05", tool: "Valuation API", auto: true },
      { step: 2, phase: "observe", text: "AVM confidence 87% \u2014 above 85% threshold.", ts: "09:01:08" },
      { step: 2, phase: "think", text: "AVM acceptable. Select solicitor: Carter & Webb (residential specialism, 25-day avg, 4.8 rating, 9 slots available).", ts: "09:01:10" },
      { step: 2, phase: "act", text: "Instructed Carter & Webb (SOL-03). Instruction pack sent.", ts: "09:01:15", tool: "Solicitor Panel", auto: true },
      { step: 3, phase: "observe", text: "Solicitor instructed. All data ready for ESIS.", ts: "09:02:00" },
      { step: 3, phase: "think", text: "Generate ESIS with: 2-Year Fixed, \u00a3350k, 4.49%, 25yr term. Calculate APRC and monthly payment.", ts: "09:02:05" },
      { step: 3, phase: "act", text: "ESIS generated. Offer issued \u2014 valid 90 days (expires 18 Jul 2026). Sent to broker.", ts: "09:05:12", tool: "Document Generator", auto: false, approval: "Approved by Rebecca Lewis" },
    ]
  },
  { id: "RUN-002", agentName: "Retention Agent", caseId: "M-001234", customer: "James Mitchell", startedAt: "08:45", status: "running", duration: "\u2014",
    steps: [
      { step: 1, phase: "observe", text: "Account M-001234 rate expires 15 Jun 2026 \u2014 58 days remaining.", ts: "08:45:00" },
      { step: 1, phase: "think", text: "Customer is Standard tier. Current rate 4.49%. Best available: 2-Year Fixed @ 4.19% (\u226460% LTV eligible, current LTV 72% \u2014 not eligible). Next best: 4.49% same rate. Recommend 5-Year Fixed @ 4.59% for stability.", ts: "08:45:05" },
      { step: 1, phase: "act", text: "Generated personalised rate switch offer: 5-Year Fixed @ 4.59%.", ts: "08:45:10", tool: "Pricing Engine", auto: true },
      { step: 2, phase: "observe", text: "Offer generated. Customer segment: Standard.", ts: "08:45:12" },
      { step: 2, phase: "think", text: "Standard tier \u2014 send via automated email with rate comparison table.", ts: "08:45:14" },
      { step: 2, phase: "act", text: "Email sent to james.mitchell@email.com with rate switch comparison.", ts: "08:45:20", tool: "Communications API", auto: true },
      { step: 3, phase: "current", text: "Waiting for customer response. Will chase after 14 days (due: 3 May 2026).", ts: "08:45:22" },
    ]
  },
  { id: "RUN-003", agentName: "Collections Agent", caseId: "M-001891", customer: "Priya Sharma", startedAt: "07:30", status: "awaiting_approval", duration: "\u2014",
    steps: [
      { step: 1, phase: "observe", text: "Missed payment on M-001891. Arrears: \u00a32,360. Days in arrears: 28.", ts: "07:30:00" },
      { step: 1, phase: "think", text: "28 days in arrears \u2014 approaching 30-day threshold. Check vulnerability: flagged as vulnerable (distress language detected). Refer to specialist team before formal collections.", ts: "07:30:05" },
      { step: 1, phase: "act", text: "SMS reminder sent. Vulnerability flag noted \u2014 routing to specialist.", ts: "07:30:10", tool: "Communications API", auto: true },
      { step: 2, phase: "observe", text: "No response to SMS after 7 days.", ts: "07:30:12" },
      { step: 2, phase: "think", text: "Customer is vulnerable. Send supportive email with payment support options, not demanding language.", ts: "07:30:15" },
      { step: 2, phase: "act", text: "Supportive email sent with payment plan options and debt charity links.", ts: "07:30:20", tool: "Communications API", auto: true },
      { step: 3, phase: "pending", text: "Awaiting approval: Schedule outbound call by vulnerability specialist. Requires human sign-off due to vulnerability flag.", ts: "07:30:25", tool: "Task Manager", approvalNeeded: true },
    ]
  },
  { id: "RUN-004", agentName: "KYC & AML Agent", caseId: "AFN-2026-00147", customer: "Orion Developments Ltd", startedAt: "09:15", status: "complete", duration: "1m 45s",
    steps: [
      { step: 1, phase: "observe", text: "New application AFN-2026-00147. SPV structure. Directors: 2.", ts: "09:15:00" },
      { step: 1, phase: "think", text: "SPV \u2014 need to verify both directors + company. Run enhanced due diligence for development finance.", ts: "09:15:03" },
      { step: 1, phase: "act", text: "Biometric check sent to both directors via Mitek. Company check via Companies House API.", ts: "09:15:08", tool: "Mitek API", auto: true },
      { step: 2, phase: "observe", text: "Director 1: Verified (99%). Director 2: Verified (97%). Company: Active, incorporated 2021.", ts: "09:16:00" },
      { step: 2, phase: "think", text: "All identities verified. Run sanctions/PEP screening for both directors and the company.", ts: "09:16:05" },
      { step: 2, phase: "act", text: "ComplyAdvantage: All clear. No sanctions, PEP, or adverse media matches.", ts: "09:16:30", tool: "ComplyAdvantage API", auto: true },
      { step: 3, phase: "observe", text: "All checks clear.", ts: "09:16:35" },
      { step: 3, phase: "think", text: "KYC and AML complete. Update case status to KYC_Complete.", ts: "09:16:38" },
      { step: 3, phase: "act", text: "Case AFN-2026-00147 updated. KYC status: Complete. Proceeding to underwriting.", ts: "09:16:45", tool: "Case Manager", auto: true },
    ]
  },
  { id: "RUN-005", agentName: "Document Intelligence Agent", caseId: "AFN-2026-00142", customer: "James Mitchell", startedAt: "09:20", status: "complete", duration: "2m 30s",
    steps: [
      { step: 1, phase: "observe", text: "3 documents uploaded: Payslip_Mar_2026.pdf, P60_2025.pdf, Bank_Statement_Feb.pdf.", ts: "09:20:00" },
      { step: 1, phase: "think", text: "Payslip: extract employer, gross/net pay, date. P60: extract total pay, tax, NI. Bank statement: extract salary credits, regular outgoings.", ts: "09:20:05" },
      { step: 1, phase: "act", text: "Parsed all 3 documents. Extracted 62 fields total. Confidence: 94%.", ts: "09:21:00", tool: "Document AI", auto: true },
      { step: 2, phase: "observe", text: "Fields extracted. Cross-validation needed.", ts: "09:21:05" },
      { step: 2, phase: "think", text: "Compare employer across docs: Fact Find says TechCorp Ltd, Payslip says TechCorp Ltd, P60 says TechCorp Ltd, Bank shows TECHCORP LTD. Match. Compare income: declared \u00a370k, P60 shows \u00a367.5k \u2014 discrepancy of \u00a32,500.", ts: "09:21:10" },
      { step: 2, phase: "act", text: "Cross-validation: 6/7 checks passed. 1 discrepancy flagged: P60 income \u00a32,500 below declared (bonus timing).", ts: "09:22:00", tool: "Validation Engine", auto: true },
      { step: 3, phase: "observe", text: "Discrepancy found in P60 vs declared income.", ts: "09:22:05" },
      { step: 3, phase: "think", text: "\u00a32,500 discrepancy explained by bonus timing (Feb payslip shows \u00a38k bonus after P60 cut-off). Flag for UW awareness but don\u2019t block. Auto-populate 58 clean fields.", ts: "09:22:10" },
      { step: 3, phase: "act", text: "58 fields auto-populated. 1 flag raised for UW: P60 discrepancy noted with explanation.", ts: "09:22:30", tool: "Case Manager", auto: true },
    ]
  },
];

const FILTERS = ["All", "Running", "Complete", "Awaiting Approval"];

const statusConfig = {
  running:            { label: "Running",           bg: "#DBEAFE", color: "#1E40AF", pulse: true },
  complete:           { label: "Complete",           bg: "#D1FAE5", color: "#065F46", pulse: false },
  awaiting_approval:  { label: "Awaiting Approval",  bg: "#FEF3C7", color: "#92400E", pulse: false },
  failed:             { label: "Failed",             bg: "#FEE2E2", color: "#991B1B", pulse: false },
};

const phaseConfig = {
  observe: { bg: "#DBEAFE", border: "#93C5FD", label: "#1E40AF", text: "OBSERVE" },
  think:   { bg: "#FEF3C7", border: "#FCD34D", label: "#92400E", text: "THINK" },
  act:     { bg: "#D1FAE5", border: "#6EE7B7", label: "#065F46", text: "ACT" },
  current: { bg: "#DBEAFE", border: "#93C5FD", label: "#1E40AF", text: "CURRENT" },
  pending: { bg: "#FEF3C7", border: "#FCD34D", label: "#92400E", text: "PENDING" },
};

const tabStyle = (active) => ({
  padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  background: active ? T.primary : T.card, color: active ? "#fff" : T.textSecondary,
  border: `1px solid ${active ? T.primary : T.border}`,
});

const toolPillStyle = { display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.primaryLight, color: T.primary, border: `1px solid ${T.border}` };

const pulseKeyframes = `
@keyframes agentPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
`;

function RunCard({ run, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[run.status] || statusConfig.complete;

  // Group steps by step number
  const stepGroups = [];
  let currentGroup = null;
  run.steps.forEach((s) => {
    if (!currentGroup || currentGroup.step !== s.step) {
      currentGroup = { step: s.step, phases: [] };
      stepGroups.push(currentGroup);
    }
    currentGroup.phases.push(s);
  });

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{run.agentName}</span>
            <span style={{
              display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
              background: sc.bg, color: sc.color,
              animation: sc.pulse ? "agentPulse 2s ease-in-out infinite" : "none",
            }}>
              {sc.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: T.textMuted }}>
            <span style={{ fontWeight: 600, color: T.textSecondary }}>{run.caseId}</span>
            <span>{run.customer}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{Ico.clock(12)} {run.startedAt}</span>
            <span>Duration: {run.duration}</span>
          </div>
        </div>
        <div style={{ cursor: "pointer", padding: "4px 8px", fontSize: 16, color: T.textMuted, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          &#9662;
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>ReAct Reasoning Chain</div>

          {stepGroups.map((group, gi) => (
            <div key={group.step} style={{ display: "flex", gap: 0, marginBottom: 0 }}>
              {/* Step number + connecting line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {group.step}
                </div>
                {gi < stepGroups.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, minHeight: 20 }} />}
              </div>

              {/* Phase blocks */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingBottom: gi < stepGroups.length - 1 ? 16 : 0, marginLeft: 10 }}>
                {group.phases.map((p, pi) => {
                  const pc = phaseConfig[p.phase] || phaseConfig.observe;
                  const isPulse = p.phase === "current" || p.phase === "pending";

                  return (
                    <div key={pi} style={{
                      background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 8, padding: "8px 12px",
                      animation: isPulse ? "agentPulse 2s ease-in-out infinite" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        {/* Phase label */}
                        <span style={{ fontSize: 9, fontWeight: 800, color: pc.label, letterSpacing: 0.8, textTransform: "uppercase" }}>{pc.text}</span>
                        {/* Timestamp */}
                        <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>{p.ts}</span>
                        {/* Tool badge */}
                        {p.tool && <span style={toolPillStyle}>{p.tool}</span>}
                        {/* AUTO badge */}
                        {p.auto && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#EDE9FE", color: "#5B21B6" }}>
                            {Ico.zap(10)} AUTO
                          </span>
                        )}
                        {/* Approval info */}
                        {p.approval && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.successBg, color: T.success }}>
                            {Ico.check(10)} {p.approval}
                          </span>
                        )}
                        {/* Approval needed */}
                        {p.approvalNeeded && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.warningBg, color: T.warning, border: `1px solid ${T.warningBorder}` }}>
                            {Ico.lock(10)} Requires Approval
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{p.text}</div>

                      {/* Approval actions */}
                      {p.approvalNeeded && run.status === "awaiting_approval" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <Btn small primary onClick={() => onApprove(run.id)} icon="check">Approve</Btn>
                          <Btn small danger onClick={() => onReject(run.id)} icon="x">Reject</Btn>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function AgentMonitor() {
  const [filter, setFilter] = useState("All");
  const [runs, setRuns] = useState(AGENT_RUNS);

  const handleApprove = (runId) => {
    setRuns(runs.map((r) => {
      if (r.id !== runId) return r;
      return {
        ...r,
        status: "complete",
        duration: "—",
        steps: r.steps.map((s) =>
          s.approvalNeeded ? { ...s, approvalNeeded: false, phase: "act", auto: false, approval: "Approved manually" } : s
        ),
      };
    }));
  };

  const handleReject = (runId) => {
    setRuns(runs.map((r) => {
      if (r.id !== runId) return r;
      return {
        ...r,
        status: "complete",
        duration: "—",
        steps: r.steps.map((s) =>
          s.approvalNeeded ? { ...s, approvalNeeded: false, phase: "act", text: "Rejected — action cancelled.", auto: false } : s
        ),
      };
    }));
  };

  const filterMap = { "All": null, "Running": "running", "Complete": "complete", "Awaiting Approval": "awaiting_approval" };
  const filtered = filter === "All" ? runs : runs.filter((r) => r.status === filterMap[filter]);

  const runningCount = runs.filter((r) => r.status === "running").length;
  const completeCount = runs.filter((r) => r.status === "complete").length;
  const awaitingCount = runs.filter((r) => r.status === "awaiting_approval").length;
  const failedCount = runs.filter((r) => r.status === "failed").length;

  return (
    <div>
      {/* Inject pulse animation */}
      <style>{pulseKeyframes}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.eye(22)} Agent Monitor
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            Real-time ReAct reasoning chains
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Running Now" value={runningCount} sub="active agents" color={T.primary} />
        <KPICard label="Completed Today" value={completeCount} sub="successful runs" color={T.success} />
        <KPICard label="Awaiting Approval" value={awaitingCount} sub="needs action" color={T.warning} />
        <KPICard label="Failed" value={failedCount} sub="errors today" color={T.danger} />
        <KPICard label="Avg Duration" value="2m 49s" sub="across all runs" color="#7C3AED" />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {FILTERS.map((f) => (
          <span key={f} style={tabStyle(filter === f)} onClick={() => setFilter(f)}>{f}</span>
        ))}
      </div>

      {/* Run cards */}
      {filtered.map((run) => (
        <RunCard key={run.id} run={run} onApprove={handleApprove} onReject={handleReject} />
      ))}

      {filtered.length === 0 && (
        <Card>
          <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
            <div style={{ marginBottom: 8 }}>{Ico.eye(32)}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No runs match this filter</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try selecting a different filter above.</div>
          </div>
        </Card>
      )}
    </div>
  );
}
