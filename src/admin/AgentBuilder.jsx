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

// ─────────────────────────────────────────────
// TOOL DEFINITIONS for the agent builder
// ─────────────────────────────────────────────
const TOOL_DEFINITIONS = [
  { id: "valuation-api", name: "Valuation API", desc: "Orders and retrieves property valuations (AVM, Desktop, Full)", endpoint: "POST /api/valuations/order", input: "{ caseId, type, surveyorId }", output: "{ valuationId, value, confidence, status }", category: "Property" },
  { id: "solicitor-panel", name: "Solicitor Panel", desc: "Selects and instructs solicitors from the approved panel", endpoint: "POST /api/solicitors/instruct", input: "{ caseId, solicitorId, instructionType }", output: "{ instructionId, firm, confirmationRef }", category: "Legal" },
  { id: "pricing-engine", name: "Pricing Engine", desc: "Calculates rates, eligibility, and generates product recommendations", endpoint: "POST /api/pricing/eligibility", input: "{ ltv, credit, employment, property, epc }", output: "{ products[], bestMatch, rate, monthly }", category: "Product" },
  { id: "comms-api", name: "Communications API", desc: "Sends emails, SMS, letters, and push notifications", endpoint: "POST /api/communications/send", input: "{ recipientId, channel, templateId, data }", output: "{ messageId, status, sentAt }", category: "Comms" },
  { id: "document-ai", name: "Document AI", desc: "Parses uploaded documents and extracts structured data", endpoint: "POST /api/documents/parse", input: "{ documentId, type }", output: "{ fields[], confidence, flags[] }", category: "Documents" },
  { id: "mitek-api", name: "Mitek API", desc: "Biometric identity verification via selfie + ID document", endpoint: "POST /api/kyc/verify", input: "{ applicantId, documentType }", output: "{ verified, confidence, matchScore }", category: "KYC" },
  { id: "comply-api", name: "ComplyAdvantage API", desc: "Sanctions, PEP, and adverse media screening", endpoint: "POST /api/aml/screen", input: "{ name, dob, nationality }", output: "{ clear, matches[], riskLevel }", category: "AML" },
  { id: "case-manager", name: "Case Manager", desc: "Updates case status, assigns team, adds notes", endpoint: "PUT /api/cases/{caseId}", input: "{ status, assignee, notes }", output: "{ caseId, updatedAt }", category: "Core" },
  { id: "task-manager", name: "Task Manager", desc: "Creates and schedules tasks for team members", endpoint: "POST /api/tasks", input: "{ assigneeId, type, dueDate, caseId }", output: "{ taskId, status }", category: "Core" },
  { id: "servicing-api", name: "Servicing API", desc: "Manages live mortgage accounts, rate switches, payments", endpoint: "PUT /api/servicing/{accountId}", input: "{ action, params }", output: "{ accountId, newRate, effectiveDate }", category: "Servicing" },
  { id: "doc-generator", name: "Document Generator", desc: "Generates ESIS, offer letters, and formal documents", endpoint: "POST /api/documents/generate", input: "{ templateId, caseId, data }", output: "{ documentId, url, generatedAt }", category: "Documents" },
  { id: "credit-bureau", name: "Credit Bureau API", desc: "Retrieves credit score and credit file data", endpoint: "POST /api/credit/search", input: "{ applicantId, searchType }", output: "{ score, profile, accounts[], flags[] }", category: "KYC" },
];

const EXAMPLE_AGENT = {
  name: "Valuation Agent",
  role: "I am the Valuation Agent. I am responsible for ordering, tracking, and validating property valuations for mortgage cases.",
  goal: "Ensure every approved case receives an appropriate valuation within SLA, at the lowest cost, from the best-rated surveyor available.",
  thinkStructure: `When I receive a case, I follow this reasoning:
1. Check the case LTV and risk level
2. If LTV ≤75% and risk is Low → order AVM (cheapest, fastest)
3. If AVM confidence <85% → escalate to Full valuation
4. If LTV >75% or risk is Medium/High → order Full valuation directly
5. Select surveyor based on: specialism match, capacity, SLA, rating
6. Monitor for report delivery within SLA
7. When received, validate value against AVM and flag discrepancies >10%`,
  actStructure: `Actions I can take:
- Order AVM → Valuation API: POST /api/valuations/order { type: "AVM" }
- Order Full Valuation → Valuation API: POST /api/valuations/order { type: "Full", surveyorId }
- Chase surveyor → Communications API: POST /api/communications/send { template: "valuation-chase" }
- Flag discrepancy → Case Manager: PUT /api/cases/{caseId} { notes: "Valuation discrepancy" }
- Accept valuation → Case Manager: PUT /api/cases/{caseId} { status: "Valuation_Complete" }`,
  tools: ["valuation-api", "comms-api", "case-manager"],
  example: [
    { phase: "observe", text: "Case AFN-2026-00150 approved. LTV: 68%. Risk: 15/100 (Low). Property: 14 Oak Lane, Bristol BS1 4NZ." },
    { phase: "think", text: "LTV 68% is ≤75% and risk is Low. I should order an AVM first — it's faster (instant) and cheaper (£0 vs £250). If confidence ≥85%, I'll accept it. Otherwise I'll escalate to a full valuation." },
    { phase: "act", text: "→ POST /api/valuations/order { caseId: 'AFN-2026-00150', type: 'AVM' }\n← Response: { value: 485000, confidence: 87, status: 'complete' }", tool: "Valuation API" },
    { phase: "observe", text: "AVM returned: £485,000 with 87% confidence. This is ≥85% threshold." },
    { phase: "think", text: "AVM confidence 87% exceeds my 85% threshold. The value £485,000 matches the purchase price (£485,000 declared). No discrepancy. I can accept this valuation and update the case." },
    { phase: "act", text: "→ PUT /api/cases/AFN-2026-00150 { status: 'Valuation_Complete', valuationType: 'AVM', value: 485000, confidence: 87 }\n← Response: { caseId: 'AFN-2026-00150', updatedAt: '2026-04-19T09:01:15Z' }", tool: "Case Manager" },
  ],
};

function CreateAgentForm({ onSave }) {
  const [section, setSection] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [trigger, setTrigger] = useState(TRIGGER_OPTIONS[0]);
  const [autonomous, setAutonomous] = useState(false);
  const [thinkStructure, setThinkStructure] = useState("");
  const [actStructure, setActStructure] = useState("");
  const [selectedTools, setSelectedTools] = useState([]);
  const [steps, setSteps] = useState([
    { id: 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false },
  ]);

  const toggleTool = (toolId) => setSelectedTools(prev => prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]);

  const addStep = () => setSteps([...steps, { id: steps.length + 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false }]);
  const removeStep = (idx) => { if (steps.length <= 1) return; setSteps(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, id: i + 1 }))); };
  const updateStep = (idx, field, value) => { const u = [...steps]; u[idx] = { ...u[idx], [field]: value }; setSteps(u); };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: `custom-${Date.now()}`, name, desc: goal, role, goal, trigger, autonomous, thinkStructure, actStructure, selectedTools, status: "Draft", steps });
    setName(""); setRole(""); setGoal(""); setThinkStructure(""); setActStructure(""); setSelectedTools([]);
    setSteps([{ id: 1, observe: "", think: "", act: "", tool: TOOL_OPTIONS[0], approvalRequired: false }]);
    setSection(0);
  };

  const loadExample = () => {
    setName(EXAMPLE_AGENT.name); setRole(EXAMPLE_AGENT.role); setGoal(EXAMPLE_AGENT.goal);
    setThinkStructure(EXAMPLE_AGENT.thinkStructure); setActStructure(EXAMPLE_AGENT.actStructure);
    setSelectedTools(EXAMPLE_AGENT.tools);
    setSteps(EXAMPLE_AGENT.example.map((e, i) => ({ id: i + 1, observe: e.phase === "observe" ? e.text : "", think: e.phase === "think" ? e.text : "", act: e.phase === "act" ? e.text : "", tool: e.tool || TOOL_OPTIONS[0], approvalRequired: false })));
  };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 };
  const textareaStyle = { ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 };
  const sectionTitleSt = { fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 };
  const sectionDescSt = { fontSize: 12, color: T.textMuted, marginBottom: 16 };

  const SECTIONS = [
    { id: 0, label: "1. Role & Goal", icon: "user" },
    { id: 1, label: "2. Think-Act Structure", icon: "sparkle" },
    { id: 2, label: "3. Tool Definitions", icon: "zap" },
    { id: 3, label: "4. Complete Example", icon: "check" },
  ];

  return (
    <div>
      {/* Section navigation */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "12px 16px", border: "none", cursor: "pointer", fontFamily: T.font,
            fontSize: 13, fontWeight: section === s.id ? 700 : 500,
            background: section === s.id ? T.primary : T.card,
            color: section === s.id ? "#fff" : T.textMuted,
            borderBottom: section === s.id ? `3px solid ${T.primary}` : `1px solid ${T.border}`,
            borderRadius: i === 0 ? "8px 0 0 0" : i === SECTIONS.length - 1 ? "0 8px 0 0" : 0,
            transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          }}>
            {Ico[s.icon]?.(14)} {s.label}
          </button>
        ))}
      </div>

      {/* Load example button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn small onClick={loadExample} style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff", border: "none" }}>
          {Ico.sparkle(12)} Load Example: Valuation Agent
        </Btn>
      </div>

      {/* Section 1: Role & Goal */}
      {section === 0 && (
        <Card>
          <div style={sectionTitleSt}>Role & Goal</div>
          <div style={sectionDescSt}>Define who the agent is and what it aims to achieve. Be specific — this shapes all its decisions.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Agent Name <span style={{ color: T.danger }}>*</span></label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Valuation Agent" />
            </div>
            <div>
              <label style={labelStyle}>Trigger</label>
              <select style={inputStyle} value={trigger} onChange={e => setTrigger(e.target.value)}>
                {TRIGGER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Role — who is this agent?</label>
            <textarea style={textareaStyle} value={role} onChange={e => setRole(e.target.value)} placeholder="I am the Valuation Agent. I am responsible for ordering, tracking, and validating property valuations for mortgage cases." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Goal — what is the agent trying to achieve?</label>
            <textarea style={textareaStyle} value={goal} onChange={e => setGoal(e.target.value)} placeholder="Ensure every approved case receives an appropriate valuation within SLA, at the lowest cost, from the best-rated surveyor available." />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Autonomous</label>
            <div onClick={() => setAutonomous(!autonomous)} style={{ width: 40, height: 22, borderRadius: 11, background: autonomous ? T.success : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: autonomous ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 11, color: T.textMuted }}>{autonomous ? "Agent acts without approval unless gated" : "All actions require approval"}</span>
          </div>
        </Card>
      )}

      {/* Section 2: Think-Act Structure */}
      {section === 1 && (
        <Card>
          <div style={sectionTitleSt}>Think-Act Structure</div>
          <div style={sectionDescSt}>Define how the agent must format its reasoning and actions. This enforces the ReAct pattern.</div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Thinking Structure — how must the agent reason?</label>
            <textarea style={{ ...textareaStyle, minHeight: 140 }} value={thinkStructure} onChange={e => setThinkStructure(e.target.value)}
              placeholder={`When I receive a case, I follow this reasoning:\n1. Check the case LTV and risk level\n2. If LTV ≤75% and risk is Low → order AVM\n3. If AVM confidence <85% → escalate to Full valuation\n4. Select surveyor based on: specialism, capacity, SLA, rating\n5. Monitor for report delivery within SLA`} />
          </div>

          <div>
            <label style={labelStyle}>Action Structure — what actions can the agent take and how?</label>
            <textarea style={{ ...textareaStyle, minHeight: 140 }} value={actStructure} onChange={e => setActStructure(e.target.value)}
              placeholder={`Actions I can take:\n- Order AVM → Valuation API: POST /api/valuations/order { type: "AVM" }\n- Order Full Valuation → Valuation API: POST /api/valuations/order { type: "Full" }\n- Chase surveyor → Communications API: POST /api/communications/send\n- Accept valuation → Case Manager: PUT /api/cases/{caseId}`} />
          </div>
        </Card>
      )}

      {/* Section 3: Tool Definitions */}
      {section === 2 && (
        <Card>
          <div style={sectionTitleSt}>Tool Definitions</div>
          <div style={sectionDescSt}>Select which tools this agent can use. Each tool has an API endpoint, input, and output contract.</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TOOL_DEFINITIONS.map(tool => {
              const active = selectedTools.includes(tool.id);
              return (
                <div key={tool.id} onClick={() => toggleTool(tool.id)} style={{
                  padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                  border: active ? `2px solid ${T.primary}` : `1px solid ${T.borderLight}`,
                  background: active ? T.primaryLight : T.card,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${active ? T.primary : T.border}`, background: active ? T.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                        {active && "✓"}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{tool.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#F1F5F9", color: T.textMuted }}>{tool.category}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8, marginLeft: 28 }}>{tool.desc}</div>
                  <div style={{ marginLeft: 28, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div style={{ padding: "6px 8px", borderRadius: 6, background: T.bg, fontSize: 10 }}>
                      <div style={{ fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Endpoint</div>
                      <div style={{ fontFamily: "monospace", color: T.text, fontSize: 10 }}>{tool.endpoint}</div>
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: 6, background: T.bg, fontSize: 10 }}>
                      <div style={{ fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Input</div>
                      <div style={{ fontFamily: "monospace", color: T.text, fontSize: 10 }}>{tool.input}</div>
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: 6, background: T.bg, fontSize: 10 }}>
                      <div style={{ fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Output</div>
                      <div style={{ fontFamily: "monospace", color: T.text, fontSize: 10 }}>{tool.output}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: T.textMuted }}>{selectedTools.length} tool{selectedTools.length !== 1 ? "s" : ""} selected</div>
        </Card>
      )}

      {/* Section 4: Complete Example */}
      {section === 3 && (
        <Card>
          <div style={sectionTitleSt}>Complete Example</div>
          <div style={sectionDescSt}>Define a worked example showing the full Observe → Think → Act chain. This teaches the agent by demonstration.</div>

          {steps.map((step, idx) => (
            <div key={step.id} style={{ display: "flex", gap: 0, marginBottom: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step.id}</div>
                {idx < steps.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, minHeight: 20 }} />}
              </div>
              <div style={{ flex: 1, marginLeft: 10, marginBottom: 20 }}>
                <div style={{ background: phaseColors.observe.bg, border: `1px solid ${phaseColors.observe.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.observe.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>OBSERVE</span>
                  <input style={{ ...inputStyle, border: "none", background: "transparent", padding: "4px 0" }} value={step.observe} onChange={e => updateStep(idx, "observe", e.target.value)} placeholder="What does the agent observe?" />
                </div>
                <div style={{ background: phaseColors.think.bg, border: `1px solid ${phaseColors.think.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.think.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>THINK</span>
                  <textarea style={{ ...textareaStyle, border: "none", background: "transparent", padding: "4px 0", minHeight: 40, fontFamily: T.font }} value={step.think} onChange={e => updateStep(idx, "think", e.target.value)} placeholder="How does the agent reason?" />
                </div>
                <div style={{ background: phaseColors.act.bg, border: `1px solid ${phaseColors.act.border}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: phaseColors.act.label, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>ACT</span>
                  <textarea style={{ ...textareaStyle, border: "none", background: "transparent", padding: "4px 0", minHeight: 40 }} value={step.act} onChange={e => updateStep(idx, "act", e.target.value)} placeholder="→ POST /api/... { input }\n← Response: { output }" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <div style={{ flex: 1 }}>
                    <select style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }} value={step.tool} onChange={e => updateStep(idx, "tool", e.target.value)}>
                      {TOOL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div onClick={() => updateStep(idx, "approvalRequired", !step.approvalRequired)} style={{ width: 34, height: 18, borderRadius: 9, background: step.approvalRequired ? T.warning : T.border, cursor: "pointer", position: "relative" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: step.approvalRequired ? 18 : 2, transition: "left 0.2s" }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{Ico.lock(10)} Gate</span>
                  </div>
                  <Btn small onClick={() => removeStep(idx)} style={{ padding: "4px 8px", color: T.danger, background: "transparent", border: "none" }}>{Ico.x(12)}</Btn>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10, marginLeft: 46 }}>
            <Btn small onClick={addStep}>+ Add Step</Btn>
          </div>
        </Card>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Btn onClick={() => setSection(Math.max(0, section - 1))} disabled={section === 0}>← Back</Btn>
        {section < 3 ? (
          <Btn primary onClick={() => setSection(section + 1)}>Next →</Btn>
        ) : (
          <Btn primary onClick={handleSave} disabled={!name.trim()}>Save Agent</Btn>
        )}
      </div>
    </div>
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
