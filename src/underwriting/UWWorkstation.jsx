import { useEffect, useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS, MOCK_TIMELINE } from "../data/loans";
import SquadPanel from "../shared/SquadPanel";
// OutcomeTracker is now only used in ConsumerDutyTab
import DecisionEngine from "./DecisionEngine";
import DocumentIntelligence from "./DocumentIntelligence";
import IncomeAnalysis from "./IncomeAnalysis";
import PolicyChecker from "./PolicyChecker";
import ComparisonEngine from "./ComparisonEngine";
import RecommendationTab from "./RecommendationTab";
import ConsumerDutyTab from "./ConsumerDutyTab";
import LifecyclePredictor from "../customers/LifecyclePredictor";

/* ─── Seed system events for the case conversation ─── */
const SEED_THREAD = (caseId) => [
  { id: 1, type: "system", body: "Case assigned to you", at: "2 days ago", author: "System" },
  { id: 2, type: "system", body: "Income documents uploaded by broker (Watson & Partners)", at: "1 day ago", author: "System" },
  { id: 3, type: "system", body: "AVM completed — £495,000 (87% confidence)", at: "22h ago", author: "System" },
  { id: 4, type: "system", body: "Stress test passed at 7.49% — surplus £710/mo", at: "18h ago", author: "System" },
  { id: 5, type: "system", body: "AI Risk Scorecard generated — overall 91/100", at: "16h ago", author: "System" },
];

const THREAD_TYPE_STYLES = {
  system:   { bg: "#F1F5F9", color: "#475569", label: "System",   icon: "settings" },
  note:     { bg: "#DBEAFE", color: "#1E40AF", label: "Note",     icon: "messages" },
  question: { bg: "#FEF3C7", color: "#92400E", label: "Question", icon: "alert" },
  decision: { bg: "#D1FAE5", color: "#065F46", label: "Decision", icon: "check" },
  mention:  { bg: "#EDE9FE", color: "#5B21B6", label: "Mention",  icon: "users" },
};

/* ─── Case Conversation thread (persisted per case in localStorage) ─── */
function CaseConversation({ caseId, onAddNote, draftDecision }) {
  const storageKey = `uw-thread-${caseId}`;
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : SEED_THREAD(caseId);
    } catch { return SEED_THREAD(caseId); }
  });
  const [input, setInput] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(entries)); } catch {}
  }, [entries, storageKey]);

  // Auto-post a system entry when a draft decision is selected
  useEffect(() => {
    if (!draftDecision) return;
    const last = entries[entries.length - 1];
    if (last && last.type === "decision" && last.body.includes(draftDecision)) return;
    setEntries(prev => [...prev, {
      id: Date.now(),
      type: "decision",
      body: `Decision drafted: ${draftDecision}`,
      at: "just now",
      author: "You",
    }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftDecision]);

  const submit = () => {
    if (!input.trim()) return;
    const isQuestion = input.trim().endsWith("?");
    const hasMention = /@\w+/.test(input);
    const type = hasMention ? "mention" : isQuestion ? "question" : "note";
    setEntries(prev => [...prev, {
      id: Date.now(),
      type,
      body: input.trim(),
      at: "just now",
      author: "You",
    }]);
    setInput("");
    onAddNote?.();
  };

  return (
    <Card style={{ marginTop: 24, padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div onClick={() => setCollapsed(c => !c)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px", cursor: "pointer", borderBottom: collapsed ? "none" : `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Ico.messages(18)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Case Conversation</span>
          <span style={{ fontSize: 12, color: T.textMuted }}>· {entries.length} entries</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Notes, system events and decisions — full audit trail</span>
          <span style={{ color: T.textMuted, transform: collapsed ? "rotate(0)" : "rotate(90deg)", display: "flex", transition: "transform 0.15s" }}>{Ico.arrow(14)}</span>
        </div>
      </div>

      {!collapsed && (
        <div>
          {/* Entries */}
          <div style={{ padding: "16px 20px", maxHeight: 360, overflowY: "auto" }}>
            {entries.map(e => {
              const style = THREAD_TYPE_STYLES[e.type] || THREAD_TYPE_STYLES.note;
              return (
                <div key={e.id} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: style.bg, color: style.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{Ico[style.icon]?.(16)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: 0.4 }}>{style.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{e.author}</span>
                      <span style={{ fontSize: 11, color: T.textMuted }}>· {e.at}</span>
                    </div>
                    <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{e.body}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.borderLight}`, background: T.bg }}>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
                placeholder="Add a note, ask a question (?), or @mention a colleague…  ⌘+Enter to send"
                rows={2}
                style={{
                  flex: 1, padding: "10px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                  fontSize: 13, fontFamily: T.font, background: T.card, color: T.text, outline: "none", resize: "vertical",
                }}
              />
              <Btn primary onClick={submit} disabled={!input.trim()} icon="send">Add</Btn>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>
              Tip: end with <strong>?</strong> for a question, use <strong>@name</strong> to tag a colleague. Persisted per case.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Scorecard dimensions ─── */
const SCORE_DIMS = [
  { key: "borrower", label: "Borrower", score: 92, color: T.success,
    detail: "7-year tenure at TechCorp Ltd. Credit score 742 (Good). Clean credit history, no adverse in 6 years. 1 dependant, stable household." },
  { key: "affordability", label: "Affordability", score: 88, color: T.success,
    detail: "DTI 18.2% current, 25.4% stressed at 7.49%. Monthly surplus £1,382 (£710 stressed). Income fully verified across payslip, P60, bank statements, and HMRC." },
  { key: "collateral", label: "Collateral", score: 95, color: T.success,
    detail: "LTV 72%. AVM £495,000 (87% confidence) within 3% of surveyor valuation £485,000. Semi-detached freehold, good condition, 3 bedrooms. Bristol BS1 — strong market." },
  { key: "policy", label: "Policy", score: 100, color: T.success,
    detail: "All product criteria met. LTV within product max. Income multiple within limits. No restricted postcode. Property type accepted." },
  { key: "fraud", label: "Fraud", score: 98, color: T.success,
    detail: "ID verified (UK Passport, expiry 2031). Address confirmed. No fraud indicators. No PEP/sanctions matches. Application consistency check passed." },
  { key: "sensitivity", label: "Sensitivity", score: 72, color: T.warning,
    detail: "Combined adverse scenario (rate +2% AND income -10%) leaves minimal headroom at £320/mo surplus. Single income dependency. Bonus income (£8k) not stress-tested separately." },
];

/* ─── Income verification rows ─── */
const INCOME_ROWS = [
  { source: "Payslip", declared: "£5,833/mo", verified: "£5,833/mo", match: true },
  { source: "P60", declared: "£67,500", verified: "£70,000", match: false, discrepancy: "£2,500" },
  { source: "Bank Statements", declared: "Regular credits", verified: "£5,833 avg", match: true },
  { source: "HMRC", declared: "£70,000 PAYE", verified: "£70,000", match: true },
];

/* ─── Default conditions (shared with RecommendationTab) ─── */
const DEFAULT_CONDITIONS = [
  { id: 1, text: "Obtain employer reference letter confirming bonus structure", accepted: true },
  { id: 2, text: "Note P60 discrepancy explanation on file for audit trail", accepted: true },
];

/* ─── Horizontal score bar ─── */
const ScoreBar = ({ dim, active, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8,
    cursor: "pointer", transition: "background .15s",
    background: active ? "rgba(26,74,84,0.06)" : "transparent",
    border: active ? `1px solid ${T.border}` : "1px solid transparent",
  }}>
    <span style={{ fontSize: 12, fontWeight: 600, width: 90, color: T.textSecondary }}>{dim.label}</span>
    <div style={{ flex: 1, height: 10, borderRadius: 5, background: T.borderLight }}>
      <div style={{ width: `${dim.score}%`, height: "100%", borderRadius: 5, background: dim.color, transition: "width .4s" }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: dim.color, minWidth: 52, textAlign: "right" }}>{dim.score}/100</span>
  </div>
);

/* ─── Table cell helper ─── */
const Td = ({ children, style }) => (
  <td style={{ padding: "8px 12px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, ...style }}>{children}</td>
);

/* ═══════════════════════════════════════════
   UW WORKSTATION COMPONENT
   ═══════════════════════════════════════════ */
function UWWorkstation({ loan, onBack, onDecisionMade, onViewCustomer }) {
  const activeLoan = loan || MOCK_LOANS[0];

  const [caseTab, setCaseTab] = useState("overview");
  const [activeScoreDim, setActiveScoreDim] = useState(null);
  const [decision, setDecision] = useState(null);
  const [reasonCode, setReasonCode] = useState("");
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [customCondition, setCustomCondition] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Decision state is passed to RecommendationTab which hosts the decision controls

  const handleSubmit = () => setShowSuccess(true);

  const toggleCondition = (id) =>
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, accepted: !c.accepted } : c)));

  const addCondition = () => {
    if (!customCondition.trim()) return;
    setConditions((prev) => [...prev, { id: Date.now(), text: customCondition.trim(), accepted: true }]);
    setCustomCondition("");
  };

  /* ── Mandate helper ── */
  const amountNum = parseInt(activeLoan.amount.replace(/[^0-9]/g, ""), 10);
  const isL2 = amountNum >= 500000 || activeLoan.status === "Referred";
  const mandateLabel = isL2 ? "L2 — Requires escalation" : "L1 — Within your mandate";
  const mandateColor = isL2 ? T.warning : T.success;

  return (
    <div style={{ fontFamily: T.font, color: T.text, maxWidth: 1280, margin: "0 auto" }}>

      {/* ══════ HEADER ══════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <span onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.primary, cursor: "pointer", fontWeight: 600 }}>
            {Ico.arrowLeft(16)} Back to Queue
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{activeLoan.id}</h1>
          <span onClick={() => onViewCustomer?.(activeLoan.names)} style={{ fontSize: 15, fontWeight: 600, color: T.primary, cursor: "pointer", textDecoration: "underline", textDecorationColor: `${T.primary}40`, textUnderlineOffset: 2 }}>{activeLoan.names}</span>
          <span style={{ fontSize: 14, color: T.textMuted }}>{activeLoan.amount}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{activeLoan.product}</span>
          {activeLoan.bucket && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: (activeLoan.bucketColor || T.primary) + "14", color: activeLoan.bucketColor || T.primary, border: `1px solid ${(activeLoan.bucketColor || T.primary)}30` }}>
              {activeLoan.bucket}
            </span>
          )}
          {activeLoan.tier && activeLoan.tier !== "Standard" && activeLoan.tier !== "Base" && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#EDE9FE", color: "#6D28D9" }}>
              {activeLoan.tier}
            </span>
          )}
          {activeLoan.code && (
            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>{activeLoan.code}</span>
          )}
          <StatusBadge status={activeLoan.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.textMuted }}>
            {Ico.clock(14)} Decision due in <b style={{ color: T.success }}>22h</b>
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
            background: mandateColor === T.success ? T.successBg : T.warningBg,
            color: mandateColor,
          }}>{mandateLabel}</span>
        </div>
      </div>

      {/* ══════ SQUAD PANEL ══════ */}
      <div style={{ marginBottom:16 }}>
        <SquadPanel squad={loan.squad} />
      </div>

      {/* ══════ CASE TABS ══════ */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "evidence", label: "Applicant & Property" },
          { id: "income", label: "Income" },
          { id: "decision", label: "Decision Engine" },
          { id: "documents", label: "Documents" },
          { id: "policy", label: "Policy" },
          { id: "comparison", label: "Comparisons" },
          { id: "duty", label: "Consumer Duty" },
          { id: "recommendation", label: "Recommendation" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setCaseTab(tab.id)} style={{
            padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: caseTab === tab.id ? 700 : 500, fontFamily: T.font,
            color: caseTab === tab.id ? T.primary : T.textMuted,
            borderBottom: caseTab === tab.id ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ TAB CONTENT + DECISION RAIL ══════ */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ─── TAB CONTENT (left) ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>

        {/* ═══ TAB: OVERVIEW ═══ */}
        {caseTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Row 1: Case Journey — full-width horizontal timeline */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Case Journey</div>
            <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
              {MOCK_TIMELINE.map((evt, i) => {
                const isLast = i === MOCK_TIMELINE.length - 1;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 130, padding: "0 4px" }}>
                      <div style={{ width: 12, height: 12, borderRadius: 6, background: evt.color, border: `2px solid ${T.card}`, boxShadow: `0 0 0 2px ${evt.color}30`, zIndex: 1 }} />
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.text, marginTop: 6, textAlign: "center", lineHeight: 1.3 }}>{evt.title || evt.text.slice(0, 30)}</div>
                      <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2, textAlign: "center" }}>{evt.time}</div>
                      <div style={{ fontSize: 9, color: evt.color, fontWeight: 600, marginTop: 1 }}>{evt.actor}</div>
                    </div>
                    {!isLast && (
                      <div style={{ width: 24, height: 2, background: T.border, marginTop: 5, flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Row 2: Key Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            <KPICard label="Loan Amount" value={activeLoan.amount} color={T.primary} />
            <KPICard label="LTV" value={activeLoan.ltv ? `${activeLoan.ltv}%` : "—"} color={activeLoan.ltv > 80 ? T.warning : T.success} />
            <KPICard label="Rate" value={activeLoan.rate} color={T.accent} />
            <KPICard label="Term" value={activeLoan.term} color="#6366F1" />
            <KPICard label="Risk Score" value={`${activeLoan.riskScore}/100`} color={activeLoan.riskScore > 60 ? T.danger : activeLoan.riskScore > 30 ? T.warning : T.success} />
            <KPICard label="SLA" value="22h left" color={T.success} />
          </div>

          {/* Row 3: Product & Bucket + AI Summary + Applicant */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* Product card */}
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Product & Pricing</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>Product</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{activeLoan.product}</div>
                  {activeLoan.code && <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>{activeLoan.code}</div>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Bucket</div>
                    {activeLoan.bucket
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: activeLoan.bucketColor || T.navy }}>{activeLoan.bucket}</span>
                      : <span style={{ fontSize: 12, color: T.textMuted }}>—</span>}
                  </div>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Tier</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: activeLoan.tier && activeLoan.tier !== "Standard" ? "#6D28D9" : T.navy }}>{activeLoan.tier || "Standard"}</span>
                  </div>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Fee</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{activeLoan.productFee || "—"}</span>
                  </div>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>ERC</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{activeLoan.erc || "—"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                  {activeLoan.creditProfile && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#ECFDF5", color: "#065F46" }}>{activeLoan.creditProfile}</span>}
                  {activeLoan.propertyType && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#FFF7ED", color: "#9A3412" }}>{activeLoan.propertyType}</span>}
                  {activeLoan.epcRating && <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#F0FDF4", color: "#166534" }}>EPC {activeLoan.epcRating}</span>}
                </div>
              </div>
            </Card>

            {/* AI Risk Summary */}
            <Card>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>AI Assessment</div>
              <div style={{
                padding: "14px 16px", borderRadius: 10,
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{activeLoan.riskScore}/100</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  background: activeLoan.riskLevel === "Low" ? "rgba(16,185,129,0.25)" : activeLoan.riskLevel === "Medium" ? "rgba(245,158,11,0.25)" : "rgba(220,38,38,0.25)",
                }}>{activeLoan.riskLevel} Risk</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {SCORE_DIMS.slice(0, 4).map(d => (
                  <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, minWidth: 75 }}>{d.label}</span>
                    <div style={{ flex: 1, height: 5, background: T.borderLight, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${d.score}%`, height: "100%", background: d.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: d.color, minWidth: 24, textAlign: "right" }}>{d.score}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(26,74,84,0.04)", borderRadius: 6, borderLeft: `3px solid ${T.primary}`, fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>
                {activeLoan.riskScore <= 30 ? "Fast-track approval recommended." : activeLoan.riskScore <= 60 ? "Manual review recommended." : "Escalation recommended."}
              </div>
            </Card>

            {/* Applicant */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Applicant</span>
                <span onClick={() => onViewCustomer?.(activeLoan.names)} style={{ fontSize: 11, color: T.primary, cursor: "pointer", fontWeight: 600 }}>View Profile →</span>
              </div>
              {[
                ["Name", activeLoan.names],
                ["Employment", activeLoan.creditProfile === "clean" ? "Employed — TechCorp Ltd" : "Self-Employed"],
                ["Income", "£70,000 + £8,000 bonus"],
                ["Credit", activeLoan.creditProfile || "clean"],
                ["DTI", "18.2%"],
                ["Repayment", activeLoan.type],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                  <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Row 4: Lifecycle Predictor */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Lifecycle Prediction</div>
            <LifecyclePredictor customerId={activeLoan.customerId || "CUS-001"} />
          </Card>
        </div>
        )}

        {/* ═══ TAB: APPLICANT & PROPERTY (was Evidence) ═══ */}
        {caseTab === "evidence" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Card 1: Applicant Summary */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.user(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Applicant Summary</span>
            </div>
            {[
              ["Name", activeLoan.names],
              ["DOB", "14 March 1988"],
              ["Employment", "Employed at TechCorp Ltd, 7 years"],
              ["Income", "£70,000 basic + £8,000 bonus"],
              ["Credit Score", "742 — Good"],
              ["DTI", "18.2%"],
              ["Dependants", "1"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </Card>

          {/* Card 2: Property & Collateral */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.shield(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Property &amp; Collateral</span>
            </div>
            {[
              ["Address", "14 Oak Lane, Bristol BS1 4NZ"],
              ["Type", "Semi-detached, Freehold, 3 bed"],
              ["Purchase Price", "£485,000"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            {/* AVM */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>AVM</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                £495,000 <span style={{ fontSize: 11, color: T.textMuted }}>(87% confidence)</span>
                <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 6, padding: "2px 6px", borderRadius: 4, background: T.successBg, color: T.success }}>Within 3%</span>
              </span>
            </div>
            {[
              ["Surveyor", "£485,000 (Full survey, Good condition)"],
              ["LTV", "72%"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </Card>

          {/* Card 3: Income Verification */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.dollar(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Income Verification</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  {["Source", "Declared", "Verified", "Status"].map((h) => (
                    <th key={h} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, borderBottom: `2px solid ${T.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INCOME_ROWS.map((r) => (
                  <tr key={r.source}>
                    <Td style={{ fontWeight: 600 }}>{r.source}</Td>
                    <Td>{r.declared}</Td>
                    <Td>{r.verified}</Td>
                    <Td>
                      {r.match ? (
                        <span style={{ color: T.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{Ico.check(14)} Match</span>
                      ) : (
                        <span style={{ color: T.warning, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{Ico.alert(14)} {r.discrepancy}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              marginTop: 12, padding: "10px 14px", background: "rgba(26,74,84,0.04)", borderRadius: 8,
              borderLeft: `3px solid ${T.primary}`, fontSize: 12, color: T.textSecondary, lineHeight: 1.5,
            }}>
              <b>AI note:</b> P60 discrepancy of £2,500 explained by bonus timing. Supporting evidence: Feb payslip shows £8,000 annual bonus.
            </div>
          </Card>

          {/* Card 4: Affordability */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.chart(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Affordability</span>
            </div>
            {/* Current */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Current</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {[["Monthly Payment", "£1,948"], ["Surplus", "£1,382"], ["DTI", "18.2%"]].map(([k, v]) => (
                <div key={k} style={{ flex: 1, minWidth: 100, padding: "10px 14px", background: T.successBg, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{k}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.success }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Stress test */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 }}>Stress Test (7.49%)</div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              {[["Payment", "£2,620"], ["Surplus", "£710"], ["DTI", "25.4%"]].map(([k, v]) => (
                <div key={k} style={{ flex: 1, minWidth: 100, padding: "10px 14px", background: T.successBg, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{k}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.success }}>{v}</div>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4, background: T.successBg, color: T.success }}>PASS</span>

            {/* Expenditure */}
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 18, marginBottom: 8 }}>Expenditure Breakdown</div>
            {[["Housing", "£1,200"], ["Transport", "£380"], ["Commitments", "£420"], ["Living", "£900"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Card>

          {/* AI Risk Scorecard — moved here from right column */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              {Ico.sparkle(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>AI Risk Scorecard</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {SCORE_DIMS.map((d) => (
                <ScoreBar key={d.key} dim={d} active={activeScoreDim === d.key} onClick={() => setActiveScoreDim(activeScoreDim === d.key ? null : d.key)} />
              ))}
            </div>
            <div style={{
              marginTop: 16, padding: "14px 16px", borderRadius: 10,
              background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Score</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>91/100</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.2)" }}>Low Risk</span>
            </div>
            {activeScoreDim && (() => {
              const dim = SCORE_DIMS.find((d) => d.key === activeScoreDim);
              return (
                <div style={{
                  marginTop: 12, padding: "12px 16px", background: "rgba(26,74,84,0.04)", borderRadius: 8,
                  borderLeft: `3px solid ${dim.color}`, fontSize: 12, color: T.textSecondary, lineHeight: 1.6,
                }}>
                  <b>{dim.label} Detail:</b> {dim.detail}
                </div>
              );
            })()}
          </Card>
        </div>
        )}

        {/* ═══ TAB: DECISION ENGINE ═══ */}
        {caseTab === "decision" && (
          <DecisionEngine loan={activeLoan} />
        )}

        {/* ═══ TAB: DOCUMENTS ═══ */}
        {caseTab === "documents" && (
          <DocumentIntelligence caseId={activeLoan.id} />
        )}

        {/* ═══ TAB: INCOME ═══ */}
        {caseTab === "income" && (
          <IncomeAnalysis loan={activeLoan} />
        )}

        {/* ═══ TAB: POLICY ═══ */}
        {caseTab === "policy" && (
          <PolicyChecker loan={activeLoan} />
        )}

        {/* ═══ TAB: COMPARISONS ═══ */}
        {caseTab === "comparison" && (
          <ComparisonEngine loan={activeLoan} />
        )}



        {/* ═══ TAB: CONSUMER DUTY ═══ */}
        {caseTab === "duty" && (
          <ConsumerDutyTab loan={activeLoan} />
        )}

        {/* ═══ TAB: RECOMMENDATION ═══ */}
        {caseTab === "recommendation" && (
          <RecommendationTab loan={activeLoan}
            decision={decision} setDecision={setDecision}
            reasonCode={reasonCode} setReasonCode={setReasonCode}
            conditions={conditions} toggleCondition={toggleCondition}
            customCondition={customCondition} setCustomCondition={setCustomCondition}
            addCondition={addCondition} onSubmit={handleSubmit} />
        )}

        </div>
      </div>

      {/* ══════ CASE CONVERSATION (collapsible thread) ══════ */}
      <CaseConversation caseId={activeLoan.id} draftDecision={decision} />

      {/* ══════ SUCCESS MODAL ══════ */}
      {showSuccess && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(12,45,59,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <Card style={{ maxWidth: 460, width: "90%", padding: 36, textAlign: "center", boxShadow: "0 16px 48px rgba(0,0,0,.2)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ color: T.success }}>{Ico.check(28)}</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Decision Recorded</h2>
            <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
              Case <b>{activeLoan.id}</b>: <b style={{ color: T.success }}>
                {decision === "approve" ? "Approved" : decision === "approve_conditions" ? "Approved with Conditions" : decision === "refer" ? "Referred to Senior" : "Declined"}
              </b>.<br />Audit trail updated.
            </p>
            <Btn primary onClick={() => { setShowSuccess(false); onDecisionMade?.({ decision, reasonCode }); }}>
              {Ico.check(16)} Done
            </Btn>
          </Card>
        </div>
      )}
    </div>
  );
}

export default UWWorkstation;
