import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";
import SquadPanel from "../shared/SquadPanel";

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

/* ─── Key findings ─── */
const FINDINGS = [
  { type: "green", text: "Stable 7-year employment in resilient technology sector" },
  { type: "green", text: "LTV 72% provides 28% equity buffer — well within product limits" },
  { type: "green", text: "Credit score 742 with clean history — no adverse in 6 years" },
  { type: "amber", text: "P60 discrepancy £2,500 — explained by bonus timing, supporting evidence available" },
  { type: "amber", text: "Sensitivity: combined adverse scenario (rate +2% AND income -10%) leaves minimal headroom (£320/mo surplus)" },
];

/* ─── Reason codes ─── */
const REASON_CODES = [
  { value: "", label: "Select reason code..." },
  { value: "affordability", label: "Affordability — fails stress test" },
  { value: "credit", label: "Credit — adverse history" },
  { value: "collateral", label: "Collateral — valuation concern" },
  { value: "policy", label: "Policy — exceeds mandate" },
  { value: "fraud", label: "Fraud — suspicious indicators" },
  { value: "docs", label: "Documentation — incomplete" },
  { value: "other", label: "Other" },
];

/* ─── Default conditions ─── */
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
function UWWorkstation({ loan, onBack, onDecisionMade }) {
  const activeLoan = loan || MOCK_LOANS[0];

  const [activeScoreDim, setActiveScoreDim] = useState(null);
  const [decision, setDecision] = useState(null);
  const [reasonCode, setReasonCode] = useState("");
  const [notes, setNotes] = useState("");
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [customCondition, setCustomCondition] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const aiRecommendation = "APPROVE";
  const isOverride = decision && decision !== "approve" && decision !== "approve_conditions";
  const needsReason = decision === "refer" || decision === "decline";
  const canSubmit = decision && notes.trim() && (!needsReason || reasonCode);

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
          <span style={{ fontSize: 15, fontWeight: 600 }}>{activeLoan.names}</span>
          <span style={{ fontSize: 14, color: T.textMuted }}>{activeLoan.amount}</span>
          <span style={{ fontSize: 13, color: T.textMuted }}>{activeLoan.product}</span>
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
      <div style={{ marginBottom:20 }}>
        <SquadPanel squad={loan.squad} />
      </div>

      {/* ══════ TWO-COLUMN LAYOUT ══════ */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ─── LEFT COLUMN (40%) ─── */}
        <div style={{ flex: "0 0 38%", minWidth: 340, display: "flex", flexDirection: "column", gap: 20 }}>

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
        </div>

        {/* ─── RIGHT COLUMN (60%) ─── */}
        <div style={{ flex: 1, minWidth: 400, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Card 5: AI Risk Scorecard */}
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
            {/* Overall */}
            <div style={{
              marginTop: 16, padding: "14px 16px", borderRadius: 10,
              background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Overall Score</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>91/100</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.2)" }}>Low Risk</span>
            </div>
            {/* Dimension detail */}
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

          {/* Card 6: AI Recommendation */}
          <Card style={{ background: T.successBg, borderColor: T.successBorder }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {Ico.bot(20)}
                <span style={{ fontSize: 14, fontWeight: 700 }}>AI Recommendation</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <span style={{
                fontSize: 28, fontWeight: 800, color: T.success, letterSpacing: 1,
              }}>APPROVE</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.success, padding: "4px 12px", borderRadius: 6, background: "rgba(49,184,151,0.15)" }}>
                92% confidence
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 10 }}>Key Findings</div>
            {FINDINGS.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                <span style={{ marginTop: 2, flexShrink: 0 }}>
                  {f.type === "green" ? Ico.check(14) : Ico.alert(14)}
                </span>
                <span style={{ color: f.type === "green" ? T.success : "#92400E" }}>{f.text}</span>
              </div>
            ))}
          </Card>

          {/* Card 7: Conditions */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.file(18)}
              <span style={{ fontSize: 14, fontWeight: 700 }}>Conditions</span>
            </div>
            {conditions.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "10px 14px", marginBottom: 8, borderRadius: 8, border: `1px solid ${T.borderLight}`,
                background: c.accepted ? T.successBg : "#FFF",
              }}>
                <span style={{ fontSize: 13, flex: 1 }}>{c.text}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small onClick={() => toggleCondition(c.id)} style={{
                    background: c.accepted ? T.success : T.card, color: c.accepted ? "#fff" : T.text,
                    border: c.accepted ? "none" : `1px solid ${T.border}`,
                  }}>
                    {c.accepted ? "Accepted" : "Rejected"}
                  </Btn>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                value={customCondition} onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Add custom condition..."
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`,
                  fontSize: 13, fontFamily: T.font, outline: "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && addCondition()}
              />
              <Btn small primary onClick={addCondition}>{Ico.plus(14)} Add</Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* ══════ DECISION ZONE (full width) ══════ */}
      <Card style={{
        marginTop: 28,
        background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
        border: "none", padding: 28,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Decision Zone</div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Left: Decision cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, minWidth: 320 }}>
            {[
              { key: "approve", label: "Approve", sub: "Standard approval within mandate", color: T.success, icon: "check" },
              { key: "approve_conditions", label: "Approve with Conditions", sub: "Approval subject to conditions above", color: T.warning, icon: "check" },
              { key: "refer", label: "Refer to Senior", sub: "Escalate for L2 review", color: "#3B82F6", icon: "arrow" },
              { key: "decline", label: "Decline", sub: "Decline with recorded reason", color: T.danger, icon: "x" },
            ].map((d) => (
              <div key={d.key} onClick={() => setDecision(d.key)} style={{
                padding: "16px 14px", borderRadius: 10, cursor: "pointer", transition: "all .15s",
                border: `2px solid ${decision === d.key ? d.color : "rgba(255,255,255,0.2)"}`,
                background: decision === d.key ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ color: d.color }}>{Ico[d.icon](16)}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{d.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{d.sub}</div>
              </div>
            ))}
          </div>

          {/* Middle: Reason code (if refer/decline) */}
          {needsReason && (
            <div style={{ minWidth: 240, flex: "0 0 220px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>Reason Code *</label>
              <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} style={{
                width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid rgba(255,255,255,0.3)`,
                fontSize: 13, fontFamily: T.font, color: T.text, background: "#fff", outline: "none",
              }}>
                {REASON_CODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          {/* Right: Notes + submit */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Override warning */}
            {isOverride && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 12,
                background: T.warningBg, border: `1px solid ${T.warningBorder}`,
                fontSize: 12, fontWeight: 600, color: "#92400E", display: "flex", alignItems: "center", gap: 6,
              }}>
                {Ico.alert(14)} You are overriding the AI recommendation of APPROVE. Override reason is mandatory.
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
              Decision Notes {decision && <span style={{ color: T.danger }}>*</span>}
            </label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your reasoning for audit trail..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid rgba(255,255,255,0.3)`,
                fontSize: 13, fontFamily: T.font, color: T.text, outline: "none", resize: "vertical", boxSizing: "border-box",
              }}
            />

            <div style={{ marginTop: 14 }}>
              <Btn primary disabled={!canSubmit} onClick={handleSubmit} style={{
                padding: "12px 28px", fontSize: 14,
                background: canSubmit ? T.success : "rgba(255,255,255,0.15)",
                boxShadow: canSubmit ? `0 4px 16px rgba(49,184,151,0.3)` : "none",
              }}>
                Submit Decision {Ico.arrow(16)}
              </Btn>
            </div>
          </div>
        </div>
      </Card>

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
            <Btn primary onClick={() => { setShowSuccess(false); onDecisionMade?.({ decision, notes, reasonCode }); }}>
              {Ico.check(16)} Done
            </Btn>
          </Card>
        </div>
      )}
    </div>
  );
}

export default UWWorkstation;
