import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import OutcomeTracker from "../shared/OutcomeTracker";

/* ─── Consumer Duty outcomes for the case ─── */
const DUTY_OUTCOMES = [
  { outcome: "Products & Services", score: 96, status: "Met", detail: "Product is suitable for the customer's needs and financial position. No evidence of mis-selling risk." },
  { outcome: "Price & Value", score: 91, status: "Met", detail: "Rate is competitive vs market. Fees are proportionate. Fair value assessment passed." },
  { outcome: "Consumer Understanding", score: 94, status: "Met", detail: "Customer has been provided with clear KFI documentation. Risk warnings issued for interest rate changes." },
  { outcome: "Consumer Support", score: 88, status: "Monitor", detail: "Customer assigned to squad. No vulnerability indicators detected. Communication preferences recorded." },
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

export default function RecommendationTab({ loan }) {
  const caseId = loan?.id || "AFN-2026-00142";

  // Underwriter's own analysis — persisted per case
  const storageKey = `uw-analysis-${caseId}`;
  const [uwAnalysis, setUwAnalysis] = useState(() => {
    try { return localStorage.getItem(storageKey) || ""; } catch { return ""; }
  });
  const [uwRating, setUwRating] = useState("agree");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(storageKey, uwAnalysis); } catch {}
  }, [uwAnalysis, storageKey]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* ── AI Analysis ── */}
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
            APPROVE
          </div>
        </div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
          This case presents a <strong>low-risk profile</strong> with strong employment stability, comfortable affordability, and well-valued collateral. The single sensitivity concern is the combined adverse scenario leaving minimal headroom — mitigated by the 28% equity buffer and 7-year employment tenure. Recommend approval with two conditions: employer reference for bonus structure and a note on P60 discrepancy explanation.
        </div>
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

      {/* ── Consumer Duty ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.shield(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>FCA Consumer Duty Assessment</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {DUTY_OUTCOMES.map(d => {
            const met = d.status === "Met";
            return (
              <div key={d.outcome} style={{ padding: 14, borderRadius: 10, background: met ? T.successBg : T.warningBg, border: `1px solid ${met ? T.successBorder : T.warningBorder}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{d.outcome}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: met ? T.success : T.warning }}>{d.score}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: met ? T.success : T.warning }}>{d.status}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>{d.detail}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <OutcomeTracker stage="Recommendation" customerId={caseId} action="Review" />
        </div>
      </Card>

      {/* ── Underwriter's Own Analysis ── */}
      <Card style={{ marginBottom: 20, border: `2px solid ${T.primary}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.messages(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Underwriter's Analysis</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Your assessment is saved per case and included in the audit trail</span>
        </div>

        {/* Agreement with AI */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Do you agree with the AI recommendation?</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { key: "agree", label: "Agree — Approve", color: T.success },
            { key: "agree_conditions", label: "Agree with Conditions", color: T.warning },
            { key: "disagree_refer", label: "Disagree — Refer", color: "#3B82F6" },
            { key: "disagree_decline", label: "Disagree — Decline", color: T.danger },
          ].map(o => (
            <div key={o.key} onClick={() => setUwRating(o.key)} style={{
              padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${uwRating === o.key ? o.color : T.border}`,
              background: uwRating === o.key ? `${o.color}12` : T.card,
              color: uwRating === o.key ? o.color : T.textSecondary,
              transition: "all 0.15s",
            }}>{o.label}</div>
          ))}
        </div>

        {/* Free-text analysis */}
        <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Your Analysis & Reasoning</div>
        <textarea
          value={uwAnalysis}
          onChange={e => setUwAnalysis(e.target.value)}
          placeholder={"Write your analysis here. This will be included in the audit trail alongside the AI recommendation.\n\nConsider:\n- Do you agree with the AI's assessment of each dimension?\n- Are there factors the AI hasn't considered?\n- What conditions would you add or remove?\n- Any concerns about sensitivity or vulnerability?"}
          rows={8}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            fontSize: 13, fontFamily: T.font, color: T.text, outline: "none", resize: "vertical",
            boxSizing: "border-box", lineHeight: 1.6, background: T.bg,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <Btn primary icon="check" onClick={handleSave}>Save Analysis</Btn>
          {saved && <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>Saved to audit trail</span>}
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>
            {uwAnalysis.length} characters · Auto-saved to localStorage
          </span>
        </div>
      </Card>
    </div>
  );
}
