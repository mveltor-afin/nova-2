import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import OutcomeTracker from "../shared/OutcomeTracker";

/* ─── FCA Consumer Duty outcomes for the case ─── */
const DUTY_OUTCOMES = [
  { outcome: "Products & Services", score: 96, status: "Met", detail: "Product is suitable for the customer's needs and financial position. No evidence of mis-selling risk.", evidence: [
    "Affordability assessment completed — DTI 18.2% (within limits)",
    "Product matches customer's stated objective (home purchase, 2yr fixed preference)",
    "Alternative products considered and documented (5yr fix, tracker — customer chose 2yr)",
    "No evidence of pressure selling or unsuitable recommendation",
  ]},
  { outcome: "Price & Value", score: 91, status: "Met", detail: "Rate is competitive vs market. Fees are proportionate. Fair value assessment passed.", evidence: [
    "Rate 4.49% is at market median for 2yr fix 75% LTV (range: 4.29–4.89%)",
    "Arrangement fee £999 — below average of £1,050 for comparable products",
    "No hidden fees identified. Early repayment charges disclosed clearly",
    "Fair value score: 91/100 — above 80 threshold",
  ]},
  { outcome: "Consumer Understanding", score: 94, status: "Met", detail: "Customer has been provided with clear KFI documentation. Risk warnings issued for interest rate changes.", evidence: [
    "KFI issued and acknowledged by customer on 8 Apr 2026",
    "Rate change risk warning issued — customer understands reversion to SVR at 7.99%",
    "Illustrated total cost over product period: £58,400",
    "Customer confirmed understanding of overpayment limits and ERC schedule",
    "Plain language summary provided alongside formal documentation",
  ]},
  { outcome: "Consumer Support", score: 88, status: "Monitor", detail: "Customer assigned to squad. No vulnerability indicators detected. Communication preferences recorded.", evidence: [
    "Squad allocated: ST (Adviser) / TW (UW) / JM (Care)",
    "Vulnerability screening completed — no indicators detected",
    "Communication preferences: email preferred, phone available",
    "Complaint handling process explained during onboarding",
    "Note: Support score at 88 — below 90 target. Review touchpoint frequency.",
  ]},
];

/* ─── Compliance checklist ─── */
const CHECKLIST = [
  { id: 1, area: "Suitability Assessment", required: true, status: "complete", completedBy: "AI + UW", date: "10 Apr 2026" },
  { id: 2, area: "Affordability Assessment", required: true, status: "complete", completedBy: "AI", date: "10 Apr 2026" },
  { id: 3, area: "KFI Issued & Acknowledged", required: true, status: "complete", completedBy: "System", date: "8 Apr 2026" },
  { id: 4, area: "Risk Warnings Issued", required: true, status: "complete", completedBy: "System", date: "8 Apr 2026" },
  { id: 5, area: "Vulnerability Screening", required: true, status: "complete", completedBy: "AI", date: "9 Apr 2026" },
  { id: 6, area: "Fair Value Assessment", required: true, status: "complete", completedBy: "AI", date: "10 Apr 2026" },
  { id: 7, area: "Alternative Products Documented", required: true, status: "complete", completedBy: "UW", date: "10 Apr 2026" },
  { id: 8, area: "Communication Preferences Recorded", required: false, status: "complete", completedBy: "Ops", date: "7 Apr 2026" },
  { id: 9, area: "Complaint Process Explained", required: false, status: "complete", completedBy: "Ops", date: "7 Apr 2026" },
  { id: 10, area: "Post-Sale Contact Plan", required: false, status: "pending", completedBy: "—", date: "—" },
];

export default function ConsumerDutyTab({ loan }) {
  const caseId = loan?.id || "AFN-2026-00142";
  const [expandedOutcome, setExpandedOutcome] = useState(null);

  // Underwriter's duty notes — persisted per case
  const storageKey = `uw-duty-notes-${caseId}`;
  const [dutyNotes, setDutyNotes] = useState(() => {
    try { return localStorage.getItem(storageKey) || ""; } catch { return ""; }
  });
  useEffect(() => {
    try { localStorage.setItem(storageKey, dutyNotes); } catch {}
  }, [dutyNotes, storageKey]);

  const overallScore = Math.round(DUTY_OUTCOMES.reduce((s, d) => s + d.score, 0) / DUTY_OUTCOMES.length);
  const allMet = DUTY_OUTCOMES.every(d => d.status === "Met");
  const checkComplete = CHECKLIST.filter(c => c.status === "complete").length;
  const checkRequired = CHECKLIST.filter(c => c.required).length;
  const checkRequiredComplete = CHECKLIST.filter(c => c.required && c.status === "complete").length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* ── Overall Duty Score ── */}
      <Card style={{ marginBottom: 20, background: allMet ? `linear-gradient(135deg, ${T.successBg}, #F0FDF4)` : T.warningBg, border: `1px solid ${allMet ? T.successBorder : T.warningBorder}`, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: allMet ? T.success : T.warning, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800 }}>
            {overallScore}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Consumer Duty Compliance — {allMet ? "All Outcomes Met" : "Action Required"}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
              Overall score {overallScore}/100 · {checkRequiredComplete}/{checkRequired} mandatory checks complete · Case {caseId}
            </div>
          </div>
          <div style={{ padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, background: allMet ? T.successBg : T.warningBg, color: allMet ? T.success : T.warning, border: `1px solid ${allMet ? T.successBorder : T.warningBorder}` }}>
            {allMet ? "COMPLIANT" : "REVIEW REQUIRED"}
          </div>
        </div>
      </Card>

      {/* ── Four Outcome Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
        {DUTY_OUTCOMES.map(d => {
          const met = d.status === "Met";
          const isExpanded = expandedOutcome === d.outcome;
          return (
            <Card key={d.outcome} style={{ padding: 0, overflow: "hidden", border: `1px solid ${met ? T.successBorder : T.warningBorder}` }}>
              {/* Header — clickable */}
              <div onClick={() => setExpandedOutcome(isExpanded ? null : d.outcome)} style={{
                padding: "16px 18px", cursor: "pointer",
                background: met ? T.successBg : T.warningBg,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.outcome}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: met ? T.success : T.warning }}>{d.score}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: met ? T.success : T.warning, color: "#fff" }}>{d.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{d.detail}</div>
              </div>

              {/* Evidence (expanded) */}
              {isExpanded && (
                <div style={{ padding: "14px 18px", borderTop: `1px solid ${met ? T.successBorder : T.warningBorder}` }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Supporting Evidence</div>
                  {d.evidence.map((ev, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <span style={{ color: met ? T.success : T.warning, flexShrink: 0, marginTop: 2 }}>{met ? Ico.check(12) : Ico.alert(12)}</span>
                      <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{ev}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── Compliance Checklist ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.check(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Compliance Checklist</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{checkComplete}/{CHECKLIST.length} complete · {checkRequiredComplete}/{checkRequired} mandatory</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {["", "Check", "Required", "Status", "Completed By", "Date"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHECKLIST.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                <td style={{ padding: "8px 12px", width: 28 }}>
                  <span style={{ color: c.status === "complete" ? T.success : T.warning }}>{c.status === "complete" ? Ico.check(14) : Ico.clock(14)}</span>
                </td>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>{c.area}</td>
                <td style={{ padding: "8px 12px" }}>
                  {c.required ? <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3, background: T.dangerBg, color: T.danger }}>MANDATORY</span>
                   : <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted }}>Optional</span>}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: c.status === "complete" ? T.successBg : T.warningBg,
                    color: c.status === "complete" ? T.success : T.warning,
                  }}>{c.status === "complete" ? "Complete" : "Pending"}</span>
                </td>
                <td style={{ padding: "8px 12px", color: T.textMuted }}>{c.completedBy}</td>
                <td style={{ padding: "8px 12px", color: T.textMuted }}>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ── Outcome Recording ── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.file(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Outcome Recording</span>
        </div>
        <OutcomeTracker stage="Decision" customerId={caseId} action="Review" />
      </Card>

      {/* ── Underwriter's Duty Notes ── */}
      <Card style={{ border: `2px solid ${T.primary}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {Ico.messages(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Underwriter's Consumer Duty Notes</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Persisted per case · Included in audit trail</span>
        </div>
        <textarea
          value={dutyNotes}
          onChange={e => setDutyNotes(e.target.value)}
          placeholder={"Record any Consumer Duty observations, concerns or mitigations.\n\nFor example:\n- Is the product genuinely suitable for this customer?\n- Are there vulnerability indicators the AI may have missed?\n- Any fair value concerns given the customer's circumstances?"}
          rows={5}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
            fontSize: 13, fontFamily: T.font, color: T.text, outline: "none", resize: "vertical",
            boxSizing: "border-box", lineHeight: 1.6, background: T.bg,
          }}
        />
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{dutyNotes.length} characters · Auto-saved</div>
      </Card>
    </div>
  );
}
