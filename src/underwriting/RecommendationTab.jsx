import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

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

/* ─── AI analysis sections ─── */
const AI_SECTIONS = [
  { title: "Income & Employment", icon: "dollar", color: T.success, rating: "Strong",
    text: "Stable 7-year employment at TechCorp Ltd in the technology sector. Income of £70,000 (basic) + £8,000 (bonus) is fully verified across payslip, P60, bank statements and HMRC. P60 discrepancy of £2,500 is explained by bonus timing — supporting evidence confirmed. Single income dependency is the primary risk factor." },
  { title: "Collateral & Valuation", icon: "shield", color: T.success, rating: "Strong",
    text: "Semi-detached freehold in Bristol BS1 — strong local market. AVM at £495,000 (87% confidence) is within 3% of full surveyor valuation at £485,000. LTV at 72% provides a 28% equity buffer. No structural concerns. EPC rated C. No flood risk." },
  { title: "Affordability & Stress Testing", icon: "chart", color: T.success, rating: "Comfortable",
    text: "Current DTI at 18.2% is well within limits. Monthly surplus of £1,382. Under +3% stress scenario, DTI rises to 25.4% with surplus of £710 — passes comfortably. Combined adverse scenario (rate +2% AND income -10%) leaves minimal headroom at £320/mo — this is the sensitivity concern." },
  { title: "Credit & Fraud", icon: "lock", color: T.success, rating: "Clean",
    text: "Credit score 742 (Good). No adverse in 6 years. No CCJs, defaults or bankruptcy. ID verified via passport (expiry 2031). No PEP/sanctions matches. Application consistency check passed. No fraud indicators detected." },
  { title: "Policy Compliance", icon: "check", color: T.success, rating: "Compliant",
    text: "All lending criteria met. LTV within product maximum (75%). Income multiple within limits. No restricted postcode. Property type accepted. No policy exceptions required." },
  { title: "Sensitivity & Risk Factors", icon: "alert", color: T.warning, rating: "Monitor",
    text: "Single income dependency. Bonus income (£8,000) is discretionary and not stress-tested separately. Combined adverse scenario leaves minimal headroom. Recommend: (1) Note bonus reliance on file, (2) Condition employer reference confirming bonus structure, (3) Annual affordability review at rate switch." },
];

export default function RecommendationTab({
  loan, decision, setDecision, reasonCode, setReasonCode,
  conditions, toggleCondition, customCondition, setCustomCondition,
  addCondition, onSubmit,
}) {
  const caseId = loan?.id || "AFN-2026-00142";
  const aiRecommendation = "APPROVE";
  const isOverride = decision && decision !== "approve" && decision !== "approve_conditions";
  const needsReason = decision === "refer" || decision === "decline";

  // Underwriter's own analysis — persisted per case
  const storageKey = `uw-analysis-${caseId}`;
  const [uwAnalysis, setUwAnalysis] = useState(() => {
    try { return localStorage.getItem(storageKey) || ""; } catch { return ""; }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(storageKey, uwAnalysis); } catch {}
  }, [uwAnalysis, storageKey]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* ── AI Case Recommendation ── */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${T.primaryLight}, ${T.successBg})`, border: `1px solid ${T.primary}30`, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            {Ico.sparkle(20)}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>Nova AI — Case Recommendation</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Comprehensive analysis across 6 dimensions · {caseId}</div>
          </div>
          <div style={{ marginLeft: "auto", padding: "4px 14px", borderRadius: 6, fontSize: 14, fontWeight: 800, background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }}>
            {aiRecommendation}
          </div>
        </div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6, marginBottom: 14 }}>
          This case presents a <strong>low-risk profile</strong> with strong employment stability, comfortable affordability, and well-valued collateral. The single sensitivity concern is the combined adverse scenario leaving minimal headroom — mitigated by the 28% equity buffer and 7-year employment tenure. Recommend approval with two conditions: employer reference for bonus structure and a note on P60 discrepancy explanation.
        </div>
        {/* Key findings inline */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Key findings</div>
        {FINDINGS.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5, fontSize: 12, lineHeight: 1.5 }}>
            <span style={{ flexShrink: 0, marginTop: 1, color: f.type === "green" ? T.success : T.warning }}>
              {f.type === "green" ? Ico.check(12) : Ico.alert(12)}
            </span>
            <span style={{ color: f.type === "green" ? T.success : "#92400E" }}>{f.text}</span>
          </div>
        ))}
      </Card>

      {/* ── Dimension-by-dimension analysis ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {AI_SECTIONS.map(s => (
          <Card key={s.title} style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: s.color }}>{Ico[s.icon]?.(16)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, flex: 1 }}>{s.title}</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: `${s.color}18`, color: s.color, textTransform: "uppercase" }}>{s.rating}</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{s.text}</div>
          </Card>
        ))}
      </div>

      {/* ── Underwriter's Analysis ── */}
      <Card style={{ marginBottom: 20, border: `2px solid ${T.primary}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.messages(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Underwriter's Analysis</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Saved per case · Included in audit trail</span>
        </div>
        <textarea
          value={uwAnalysis}
          onChange={e => setUwAnalysis(e.target.value)}
          placeholder={"Write your analysis here. This will be included in the audit trail alongside the AI recommendation.\n\nConsider:\n- Do you agree with the AI's assessment of each dimension?\n- Are there factors the AI hasn't considered?\n- What conditions would you add or remove?\n- Any concerns about sensitivity or vulnerability?"}
          rows={6}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            fontSize: 13, fontFamily: T.font, color: T.text, outline: "none", resize: "vertical",
            boxSizing: "border-box", lineHeight: 1.6, background: T.bg,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <Btn primary icon="check" onClick={handleSave}>Save Analysis</Btn>
          {saved && <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>Saved to audit trail</span>}
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{uwAnalysis.length} characters</span>
        </div>
      </Card>

      {/* ── Decision ── */}
      <Card style={{ background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`, border: "none", padding: "22px 24px" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Submit Decision</div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Decision options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 260 }}>
            {[
              { key: "approve", label: "Approve", color: T.success, icon: "check" },
              { key: "approve_conditions", label: "Approve with Conditions", color: T.warning, icon: "check" },
              { key: "refer", label: "Refer to Senior", color: "#3B82F6", icon: "arrow" },
              { key: "decline", label: "Decline", color: T.danger, icon: "x" },
            ].map(d => {
              const isSelected = decision === d.key;
              return (
                <div key={d.key} onClick={() => setDecision(d.key)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all .15s",
                  border: `2px solid ${isSelected ? d.color : "rgba(255,255,255,0.2)"}`,
                  background: isSelected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                }}>
                  <span style={{ color: d.color, display: "flex" }}>{Ico[d.icon](16)}</span>
                  <span style={{ fontSize: 14, fontWeight: isSelected ? 700 : 500, color: "#fff", flex: 1 }}>{d.label}</span>
                  {isSelected && <span style={{ width: 10, height: 10, borderRadius: 5, background: d.color }} />}
                </div>
              );
            })}
          </div>

          {/* Contextual panel */}
          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Override warning */}
            {isOverride && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, marginBottom: 12,
                background: T.warningBg, border: `1px solid ${T.warningBorder}`,
                fontSize: 12, fontWeight: 600, color: "#92400E", display: "flex", alignItems: "flex-start", gap: 6,
              }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>{Ico.alert(14)}</span>
                <span>You are overriding the AI recommendation of <strong>APPROVE</strong>. Reasoning is mandatory.</span>
              </div>
            )}

            {/* Conditions (when Approve with Conditions) */}
            {decision === "approve_conditions" && conditions && (
              <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.08)", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Conditions</div>
                {conditions.map(c => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    padding: "8px 10px", marginBottom: 6, borderRadius: 6,
                    background: c.accepted ? "rgba(49,184,151,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid rgba(255,255,255,0.15)`,
                  }}>
                    <span style={{ fontSize: 12, color: "#fff", flex: 1, lineHeight: 1.4 }}>{c.text}</span>
                    <button onClick={() => toggleCondition(c.id)} style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, cursor: "pointer",
                      background: c.accepted ? T.success : "rgba(255,255,255,0.1)", color: "#fff",
                      border: "none",
                    }}>{c.accepted ? "ACCEPTED" : "REJECTED"}</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <input value={customCondition || ""} onChange={e => setCustomCondition(e.target.value)}
                    placeholder="Add condition..." onKeyDown={e => e.key === "Enter" && addCondition?.()}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, fontFamily: T.font, background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none" }} />
                  <button onClick={addCondition} style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Add</button>
                </div>
              </div>
            )}

            {/* Reason code (when Refer / Decline) */}
            {needsReason && (
              <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.08)", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Reason Code <span style={{ color: T.danger }}>*</span></div>
                <select value={reasonCode} onChange={e => setReasonCode(e.target.value)} style={{
                  width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 12, fontFamily: T.font, background: "#fff", color: T.text, outline: "none",
                }}>
                  {REASON_CODES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {decision === "decline" && (
                  <textarea placeholder="Customer-facing decline message (optional)…" rows={2}
                    style={{
                      width: "100%", marginTop: 8, padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)",
                      fontSize: 12, fontFamily: T.font, background: "rgba(255,255,255,0.06)", color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box",
                    }} />
                )}
              </div>
            )}

            {/* Submit + secondary actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={onSubmit} disabled={!decision || (needsReason && !reasonCode)}
                style={{
                  padding: "14px 20px", borderRadius: 10, border: "none", cursor: decision ? "pointer" : "not-allowed",
                  background: decision ? T.success : "rgba(255,255,255,0.15)", color: decision ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: 14, fontWeight: 800, fontFamily: T.font,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: decision ? "0 4px 16px rgba(49,184,151,0.3)" : "none", transition: "all .15s",
                }}>
                Submit Decision {Ico.arrow(16)}
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Save Draft</button>
                <button style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>Place on Hold</button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
