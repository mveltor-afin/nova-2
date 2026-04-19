import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const AGENT_TEMPLATES = [
  { id: "case-processing", name: "Case Processing Agent", desc: "Handles post-UW lifecycle: valuation → offer → solicitor → completion", status: "Active", trigger: "Case status changes to Approved", autonomous: true,
    steps: [
      { id: 1, observe: "New approved case received", think: "Check LTV and risk to determine valuation type. If LTV ≤75% and risk Low, use AVM. Otherwise full valuation.", act: "Order valuation", tool: "Valuation API", approvalRequired: false },
      { id: 2, observe: "Valuation result received", think: "Check confidence level. If AVM confidence ≥85%, accept. Otherwise escalate to full valuation.", act: "Accept or escalate valuation", tool: "Valuation API", approvalRequired: false },
      { id: 3, observe: "Valuation accepted", think: "Select best solicitor from panel based on specialism, capacity, and rating.", act: "Instruct solicitor", tool: "Solicitor Panel", approvalRequired: false },
      { id: 4, observe: "Solicitor instructed", think: "All data available for ESIS. Generate document and issue offer with 90-day validity.", act: "Generate ESIS & issue offer", tool: "Document Generator", approvalRequired: true },
      { id: 5, observe: "Offer issued", think: "Monitor offer acceptance. If no response after 14 days, send chase. After 60 days, escalate.", act: "Monitor & chase offer", tool: "Communications API", approvalRequired: false },
    ]
  },
  { id: "retention", name: "Retention Agent", desc: "Monitors rate expiries, auto-generates personalised retention offers", status: "Active", trigger: "Rate end date within 90 days", autonomous: true,
    steps: [
      { id: 1, observe: "Account rate expiring within 90 days", think: "Check customer segment, LTV, credit profile. Determine best retention product from current catalogue.", act: "Generate personalised rate switch offer", tool: "Pricing Engine", approvalRequired: false },
      { id: 2, observe: "Offer generated", think: "Customer is Premier tier — send via email with personal adviser intro. Standard tier — send via automated email.", act: "Send offer to customer", tool: "Communications API", approvalRequired: false },
      { id: 3, observe: "No response after 14 days", think: "Churn risk increasing. Schedule outbound call via adviser.", act: "Schedule retention call", tool: "Task Manager", approvalRequired: false },
      { id: 4, observe: "Customer responds", think: "If accepted, process rate switch. If declined, log reason and flag for review.", act: "Process or log outcome", tool: "Servicing API", approvalRequired: true },
    ]
  },
  { id: "collections", name: "Collections Agent", desc: "Graduated contact strategy for arrears cases", status: "Active", trigger: "Missed payment detected", autonomous: false,
    steps: [
      { id: 1, observe: "Missed payment on account", think: "First missed payment. Check if vulnerability flags exist. If yes, refer to specialist immediately.", act: "Send SMS reminder", tool: "Communications API", approvalRequired: false },
      { id: 2, observe: "7 days, no payment", think: "Second contact needed. Personalise email with payment link and support options.", act: "Send personalised email", tool: "Communications API", approvalRequired: false },
      { id: 3, observe: "14 days, no payment", think: "Escalate to outbound call. Check affordability data for payment plan options.", act: "Schedule outbound call", tool: "Task Manager", approvalRequired: true },
      { id: 4, observe: "30+ days, no payment", think: "Formal collections process. Generate payment plan proposal based on income.", act: "Send formal letter + payment plan", tool: "Document Generator", approvalRequired: true },
    ]
  },
  { id: "kyc-aml", name: "KYC & AML Agent", desc: "Automated identity verification and sanctions screening", status: "Active", trigger: "New application submitted", autonomous: true,
    steps: [
      { id: 1, observe: "New application received", think: "Trigger biometric ID check. Select provider based on document type.", act: "Run Mitek biometric check", tool: "Mitek API", approvalRequired: false },
      { id: 2, observe: "ID verified", think: "Run sanctions and PEP screening across global databases.", act: "Run ComplyAdvantage screening", tool: "ComplyAdvantage API", approvalRequired: false },
      { id: 3, observe: "Screening complete", think: "If clear, proceed. If match found, flag for manual review.", act: "Update case status", tool: "Case Manager", approvalRequired: false },
    ]
  },
  { id: "document-extraction", name: "Document Intelligence Agent", desc: "Extracts and cross-validates data from uploaded documents", status: "Active", trigger: "Document uploaded", autonomous: true,
    steps: [
      { id: 1, observe: "Document uploaded to case", think: "Identify document type (payslip, P60, bank statement, ID). Select appropriate extraction model.", act: "Parse document with LLM", tool: "Document AI", approvalRequired: false },
      { id: 2, observe: "Fields extracted", think: "Cross-validate extracted data against other documents on the case. Check for discrepancies.", act: "Run cross-document validation", tool: "Validation Engine", approvalRequired: false },
      { id: 3, observe: "Validation complete", think: "If discrepancies found, flag for underwriter. If clean, auto-populate application fields.", act: "Flag or auto-populate", tool: "Case Manager", approvalRequired: false },
    ]
  },
];

const TRIGGER_OPTIONS = ["Case status change", "Document uploaded", "Payment missed", "Rate expiring", "Schedule (daily/hourly)"];
const TOOL_OPTIONS = ["Pricing Engine", "Valuation API", "Solicitor Panel", "Communications API", "Document AI", "Mitek API", "ComplyAdvantage API", "Case Manager", "Task Manager", "Servicing API", "Document Generator", "Validation Engine"];

const tabStyle = (active) => ({
  padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  background: active ? T.primary : T.card, color: active ? "#fff" : T.textSecondary,
  border: `1px solid ${active ? T.primary : T.border}`,
});

const statusBadgeStyle = (status) => {
  const map = {
    Active: { bg: T.successBg, color: T.success },
    Paused: { bg: T.warningBg, color: T.warning },
    Draft: { bg: "#E8E8E8", color: "#555" },
  };
  const s = map[status] || map.Draft;
  return { display: "inline-block", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color };
};

const toolPillStyle = { display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.primaryLight, color: T.primary, border: `1px solid ${T.border}` };

const phaseColors = {
  observe: { bg: "#DBEAFE", border: "#93C5FD", label: "#1E40AF", text: "OBSERVE" },
  think:   { bg: "#FEF3C7", border: "#FCD34D", label: "#92400E", text: "THINK" },
  act:     { bg: "#D1FAE5", border: "#6EE7B7", label: "#065F46", text: "ACT" },
};

function ReActStep({ step, isLast }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: isLast ? 0 : 0 }}>
      {/* Step number + connecting line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {step.id}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, background: T.border, minHeight: 20 }} />}
      </div>

      {/* Phase cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, paddingBottom: isLast ? 0 : 16, marginLeft: 10 }}>
        {["observe", "think", "act"].map((phase) => {
          const pc = phaseColors[phase];
          return (
            <div key={phase} style={{ background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: pc.label, letterSpacing: 0.8, textTransform: "uppercase" }}>{pc.text}</span>
                {phase === "act" && (
                  <>
                    <span style={toolPillStyle}>{step.tool}</span>
                    {step.approvalRequired && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.warningBg, color: T.warning, border: `1px solid ${T.warningBorder}` }}>
                        {Ico.lock(10)} Requires Approval
                      </span>
                    )}
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{step[phase]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({ agent, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{agent.name}</span>
            <span style={statusBadgeStyle(agent.status)}>{agent.status}</span>
            {agent.autonomous && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#EDE9FE", color: "#5B21B6" }}>
                {Ico.zap(10)} Autonomous
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>{agent.desc}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: T.textMuted }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{Ico.zap(12)} Trigger: {agent.trigger}</span>
            <span>{agent.steps.length} steps</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
          <Btn small ghost onClick={() => onToggle(agent.id)}>
            {agent.status === "Active" ? "Pause" : "Activate"}
          </Btn>
          <Btn small ghost onClick={() => {}}>Edit</Btn>
          <Btn small ghost danger onClick={() => onDelete(agent.id)}>Delete</Btn>
          <div style={{ cursor: "pointer", padding: "4px 8px", fontSize: 16, color: T.textMuted, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} onClick={() => setExpanded(!expanded)}>
            &#9662;
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>ReAct Chain</div>
          {agent.steps.map((step, i) => (
            <ReActStep key={step.id} step={step} isLast={i === agent.steps.length - 1} />
          ))}
        </div>
      )}
    </Card>
  );
}

function CreateAgentForm({ onSave }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [autonomous, setAutonomous] = useState(false);
  const [steps, setSteps] = useState([
    { id: 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false },
  ]);

  const addStep = () => {
    setSteps([...steps, { id: steps.length + 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false }]);
  };

  const removeStep = (idx) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, id: i + 1 }));
    setSteps(updated);
  };

  const updateStep = (idx, field, value) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: value };
    setSteps(updated);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `custom-${Date.now()}`,
      name,
      desc,
      trigger,
      autonomous,
      status: "Draft",
      steps,
    });
    setName("");
    setDesc("");
    setTrigger(TRIGGER_OPTIONS[0]);
    setAutonomous(false);
    setSteps([{ id: 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false }]);
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 };
  const textareaStyle = { ...inputStyle, minHeight: 60, resize: "vertical" };

  return (
    <Card>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Create New Agent</div>

      {/* Agent details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Agent Name <span style={{ color: T.danger }}>*</span></label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Retention Agent" />
        </div>
        <div>
          <label style={labelStyle}>Trigger</label>
          <select style={inputStyle} value={trigger} onChange={(e) => setTrigger(e.target.value)}>
            {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Description</label>
        <textarea style={textareaStyle} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this agent do?" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Autonomous</label>
        <div onClick={() => setAutonomous(!autonomous)} style={{ width: 40, height: 22, borderRadius: 11, background: autonomous ? T.success : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: autonomous ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
        <span style={{ fontSize: 11, color: T.textMuted }}>{autonomous ? "Agent acts without human approval unless gated" : "All actions require human approval"}</span>
      </div>

      {/* Step builder */}
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>ReAct Steps</div>

        {steps.map((step, idx) => (
          <div key={step.id} style={{ display: "flex", gap: 0, marginBottom: idx < steps.length - 1 ? 0 : 0 }}>
            {/* Step number + line */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {step.id}
              </div>
              {idx < steps.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, minHeight: 20 }} />}
            </div>

            <div style={{ flex: 1, marginLeft: 10, marginBottom: 20 }}>
              {/* Observe */}
              <div style={{ background: phaseColors.observe.bg, border: `1px solid ${phaseColors.observe.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.observe.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>OBSERVE</span>
                <input style={{ ...inputStyle, border: "none", background: "transparent", padding: "4px 0" }} value={step.observe} onChange={(e) => updateStep(idx, "observe", e.target.value)} placeholder="What does the agent observe?" />
              </div>
              {/* Think */}
              <div style={{ background: phaseColors.think.bg, border: `1px solid ${phaseColors.think.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.think.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>THINK</span>
                <textarea style={{ ...textareaStyle, border: "none", background: "transparent", padding: "4px 0", minHeight: 40 }} value={step.think} onChange={(e) => updateStep(idx, "think", e.target.value)} placeholder="How does the agent reason about this?" />
              </div>
              {/* Act */}
              <div style={{ background: phaseColors.act.bg, border: `1px solid ${phaseColors.act.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.act.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>ACT</span>
                <input style={{ ...inputStyle, border: "none", background: "transparent", padding: "4px 0" }} value={step.act} onChange={(e) => updateStep(idx, "act", e.target.value)} placeholder="What action does the agent take?" />
              </div>
              {/* Tool + Approval */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, fontSize: 10 }}>Tool</label>
                  <select style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }} value={step.tool} onChange={(e) => updateStep(idx, "tool", e.target.value)}>
                    {TOOL_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                  <div onClick={() => updateStep(idx, "approvalRequired", !step.approvalRequired)} style={{ width: 34, height: 18, borderRadius: 9, background: step.approvalRequired ? T.warning : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: step.approvalRequired ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <span style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 3 }}>{Ico.lock(11)} Approval</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Btn small danger ghost onClick={() => removeStep(idx)} style={{ padding: "4px 8px" }}>
                    {Ico.x(12)} Remove
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 12, marginLeft: 46 }}>
          <Btn small onClick={addStep} icon="plus">Add Step</Btn>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20, marginTop: 20, display: "flex", gap: 10 }}>
        <Btn primary onClick={handleSave} icon="check">Save Agent</Btn>
      </div>
    </Card>
  );
}

export default function AgentBuilder() {
  const [tab, setTab] = useState("Agent Registry");
  const [agents, setAgents] = useState(AGENT_TEMPLATES);

  const toggleAgent = (id) => {
    setAgents(agents.map((a) => a.id === id ? { ...a, status: a.status === "Active" ? "Paused" : "Active" } : a));
  };

  const deleteAgent = (id) => {
    setAgents(agents.filter((a) => a.id !== id));
  };

  const saveAgent = (agent) => {
    setAgents([...agents, agent]);
    setTab("Agent Registry");
  };

  const activeCount = agents.filter((a) => a.status === "Active").length;
  const totalSteps = agents.reduce((sum, a) => sum + a.steps.length, 0);
  const autonomousCount = agents.filter((a) => a.autonomous && a.status === "Active").reduce((sum, a) => sum + a.steps.filter((s) => !s.approvalRequired).length, 0);
  const approvalCount = agents.reduce((sum, a) => sum + a.steps.filter((s) => s.approvalRequired).length, 0);

  const tabs = ["Agent Registry", "Create Agent"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.sparkle(22)} Agent Orchestrator
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            Define, configure and monitor ReAct agents
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Active Agents" value={activeCount} sub={`of ${agents.length} total`} color={T.primary} />
        <KPICard label="Total Actions Today" value="247" sub="across all agents" color={T.accent} />
        <KPICard label="Autonomous Actions" value={autonomousCount} sub="no approval needed" color={T.success} />
        <KPICard label="Approval Pending" value={approvalCount} sub="gated steps" color={T.warning} />
        <KPICard label="Avg Time Saved" value="68%" sub="vs manual processing" color="#7C3AED" />
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((t) => (
          <span key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>{t}</span>
        ))}
      </div>

      {/* Agent Registry */}
      {tab === "Agent Registry" && (
        <div>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onToggle={toggleAgent} onDelete={deleteAgent} />
          ))}
          {agents.length === 0 && (
            <Card>
              <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
                <div style={{ marginBottom: 8 }}>{Ico.bot(32)}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No agents configured</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Switch to "Create Agent" to build your first ReAct agent.</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Create Agent */}
      {tab === "Create Agent" && (
        <CreateAgentForm onSave={saveAgent} />
      )}
    </div>
  );
}
