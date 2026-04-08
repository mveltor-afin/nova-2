import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// SEVERITY HELPERS
// ─────────────────────────────────────────────
const SEV = {
  Critical: { bg: T.dangerBg, text: T.danger, border: T.dangerBorder },
  Warning:  { bg: T.warningBg, text: T.warning, border: T.warningBorder },
  Info:     { bg: "#EEF2FF", text: "#4F46E5", border: "#C7D2FE" },
  Resolved: { bg: T.successBg, text: T.success, border: T.successBorder },
};

const SeverityBadge = ({ severity }) => {
  const s = SEV[severity] || SEV.Info;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>{severity}</span>
  );
};

const CATEGORY_ICONS = {
  Document: "file", Fraud: "shield", Payment: "dollar", Policy: "alert",
  Sentiment: "messages", Valuation: "chart",
};

// ─────────────────────────────────────────────
// ANOMALY DATA (15+ items)
// ─────────────────────────────────────────────
const ANOMALIES = [
  { id: "AN-001", severity: "Critical", category: "Fraud", title: "Same phone number on 3 different applications this week",
    detail: "Phone +44 7911 234567 appears on applications ML-04819, ML-04825, and ML-04833. Different applicant names and addresses but identical contact number. Possible coordinated fraud ring.",
    caseId: "ML-04819, ML-04825, ML-04833", detected: "06 Apr 2026", confidence: 94, reviewer: "Claire Dunn", status: "Open",
    analysis: "Cross-referencing with internal fraud database shows this number was previously flagged in Q3 2025 on a declined application. The three current applications were submitted within 72 hours of each other via different broker channels. IP analysis shows two submissions originated from the same network. Recommend immediate referral to Financial Crime team and suspension of all three applications pending investigation." },

  { id: "AN-002", severity: "Critical", category: "Document", title: "Font mismatch in payslip — Calibri header, Arial body",
    detail: "Payslip uploaded for applicant R. Patel (ML-04819) shows Calibri 11pt in header/employer section but Arial 10pt in earnings breakdown. Metadata indicates PDF was last modified 2 days after stated pay date.",
    caseId: "ML-04819", detected: "05 Apr 2026", confidence: 89, reviewer: "Amir Hassan", status: "Under Review",
    analysis: "Document forensics detected two distinct font families within a single payslip document. The header section containing employer details uses Calibri 11pt, while the body containing earnings and deductions uses Arial 10pt. PDF metadata shows creation date of 28 Mar 2026 but last-modified date of 30 Mar 2026, which is 2 days after the stated pay date of 28 Mar. This pattern is consistent with document manipulation. The employer 'TechCorp Solutions' has been verified as a real entity, but the format does not match known TechCorp payslip templates in our database." },

  { id: "AN-003", severity: "Critical", category: "Fraud", title: "Property sold twice in 6 months",
    detail: "14 Elm Street, Manchester M1 4BH appears in case ML-04801 (completed Jan 2026) and new application ML-04836. Title search shows transfer registered 3 months ago. Possible property fraud or undisclosed chain.",
    caseId: "ML-04836", detected: "06 Apr 2026", confidence: 97, reviewer: "Unassigned", status: "Open",
    analysis: "Land Registry records confirm the property at 14 Elm Street was sold and transferred in January 2026 under case ML-04801 to buyer 'J. Okonkwo'. A new purchase application ML-04836 has been submitted by a different applicant 'S. Khan' for the same property. The current title holder (J. Okonkwo) is not listed as the seller in the new application. This could indicate: (1) property fraud with forged title documents, (2) a legitimate quick resale not yet reflected in registry, or (3) an error in property identification. Immediate title verification and contact with the current registered owner is recommended." },

  { id: "AN-004", severity: "Warning", category: "Document", title: "P60 employer name 'TechCorp' doesn't match payslip 'TechCorp Ltd'",
    detail: "Applicant K. Williams (ML-04803) submitted P60 showing employer as 'TechCorp' but payslips show 'TechCorp Ltd'. Minor discrepancy but flagged for consistency check.",
    caseId: "ML-04803", detected: "04 Apr 2026", confidence: 72, reviewer: "Amir Hassan", status: "Under Review",
    analysis: "The employer name discrepancy is likely a formatting difference rather than fraud. Companies House records confirm 'TechCorp Ltd' (company #12345678) is a registered entity. The P60 may use a trading name abbreviation. HMRC PAYE reference numbers match across both documents. Recommend requesting a confirmation letter from the employer or verifying PAYE reference directly. Low fraud probability but should be documented." },

  { id: "AN-005", severity: "Warning", category: "Payment", title: "4 consecutive late payments across 2 accounts — possible financial distress",
    detail: "Customer ID C-2847 (D. Morrison) has missed or delayed payments on mortgage account MA-11204 and personal loan PL-5582 for 4 consecutive months. Payments arriving 8-14 days late.",
    caseId: "MA-11204", detected: "05 Apr 2026", confidence: 86, reviewer: "Sarah Chen", status: "Open",
    analysis: "Payment analysis shows a deteriorating pattern beginning December 2025. Mortgage direct debit has been returned unpaid twice, with manual payments made 8-14 days later. Personal loan shows similar pattern. Customer income deposits remain consistent, suggesting the issue may be cash flow timing rather than income reduction. However, the pattern matches our early-warning model for financial distress with 86% confidence. Recommend proactive outreach under Consumer Duty obligations and offering payment date adjustment or temporary forbearance." },

  { id: "AN-006", severity: "Warning", category: "Policy", title: "LTV 91% exceeds product maximum 90%",
    detail: "Application ML-04829 has calculated LTV of 91.2% based on updated valuation of £310,000 (originally estimated £325,000). Product selected has 90% LTV cap.",
    caseId: "ML-04829", detected: "04 Apr 2026", confidence: 99, reviewer: "Mark Stevens", status: "Under Review",
    analysis: "The original DIP was approved based on an estimated property value of £325,000, giving an LTV of 87.7%. The surveyor valuation has come back at £310,000, increasing the LTV to 91.2%. The selected product (Fix 2yr 4.19%) has a maximum LTV of 90%. Options: (1) Customer increases deposit by £3,720, (2) Switch to a 95% LTV product at 5.29%, (3) Challenge the valuation with a second opinion. The £15,000 down-valuation is significant and may also impact affordability calculations." },

  { id: "AN-007", severity: "Warning", category: "Policy", title: "Self-cert income used without HNW verification",
    detail: "Application ML-04817 for contractor applicant uses self-certified income of £145,000 but HNW verification threshold (£300k+ assets or £100k+ income) has not been completed.",
    caseId: "ML-04817", detected: "03 Apr 2026", confidence: 95, reviewer: "Claire Dunn", status: "Open",
    analysis: "The applicant is a self-employed IT contractor who has declared income of £145,000. Under our policy, self-certified income above £100,000 requires High Net Worth (HNW) verification, including: (1) signed HNW declaration, (2) accountant certification, (3) evidence of assets. None of these have been obtained. The application cannot proceed to offer without completing HNW verification. The broker should be notified of the outstanding requirements." },

  { id: "AN-008", severity: "Warning", category: "Sentiment", title: "Customer used distress language in 2 recent portal messages",
    detail: "Customer C-3291 (L. Thompson) used phrases indicating financial stress in portal messages: 'struggling to keep up', 'don't know what to do'. Sentiment score: -0.82.",
    caseId: "MA-11340", detected: "05 Apr 2026", confidence: 78, reviewer: "Unassigned", status: "Open",
    analysis: "NLP analysis of two portal messages sent on 03 Apr and 05 Apr detected distress indicators. Key phrases: 'struggling to keep up with payments', 'had some unexpected costs', 'don't know what to do about next month'. Sentiment analysis scores: -0.82 (strong negative). The customer's payment history shows no missed payments yet, but this language pattern has historically preceded arrears in 67% of similar cases within 60 days. Consumer Duty requires proactive engagement. Recommend immediate outreach from the support team with information about forbearance options." },

  { id: "AN-009", severity: "Warning", category: "Valuation", title: "AVM and surveyor value differ by >15%",
    detail: "Property at 22 River Lane, Bristol BS1 6QJ — AVM estimate £480,000, surveyor valuation £405,000. Difference of 15.6%. Case ML-04822.",
    caseId: "ML-04822", detected: "04 Apr 2026", confidence: 91, reviewer: "Mark Stevens", status: "Under Review",
    analysis: "The Automated Valuation Model (AVM) estimated the property at £480,000 based on comparable sales data. The physical survey returned a valuation of £405,000, a discrepancy of £75,000 (15.6%). The surveyor noted: (1) significant damp in the rear extension, (2) dated kitchen and bathroom requiring ~£25,000 renovation, (3) limited parking affecting desirability. Our policy triggers a review when AVM and surveyor values differ by more than 10%. The lower valuation impacts LTV from 68.8% to 81.5%. Consider requesting a desktop review or second survey." },

  { id: "AN-010", severity: "Info", category: "Document", title: "Bank statement shows cryptocurrency exchange transactions",
    detail: "Applicant J. Nguyen (ML-04830) bank statements show 12 transactions to Coinbase totalling £8,400 over 3 months. Source of funds query may be required.",
    caseId: "ML-04830", detected: "03 Apr 2026", confidence: 65, reviewer: "Amir Hassan", status: "Open",
    analysis: "Bank statement analysis detected multiple transactions to a known cryptocurrency exchange (Coinbase). While not inherently suspicious, high-volume crypto transactions require source-of-funds verification under AML guidelines. The total £8,400 represents approximately 12% of the applicant's declared savings. No corresponding incoming crypto-related deposits detected, suggesting these are purchases rather than trading activity. Recommend requesting a brief explanation from the applicant and documenting in AML file." },

  { id: "AN-011", severity: "Info", category: "Payment", title: "Unusual overpayment pattern — 3 lump sums in 30 days",
    detail: "Account MA-11198 (B. Armstrong) received 3 lump sum overpayments totalling £42,000 in March 2026. Normal monthly payment is £1,245.",
    caseId: "MA-11198", detected: "02 Apr 2026", confidence: 58, reviewer: "Unassigned", status: "Open",
    analysis: "Three overpayments detected: £15,000 (04 Mar), £12,000 (18 Mar), £15,000 (29 Mar). The source accounts vary — two from the customer's savings and one from a third-party account. The third-party payment may require source-of-funds verification. Annual overpayment allowance is £25,000 (10% of balance); total of £42,000 exceeds this limit. Early repayment charges may apply to the excess £17,000. Recommend contacting customer to confirm intentions and assess ERC implications." },

  { id: "AN-012", severity: "Info", category: "Fraud", title: "Applicant email domain registered 7 days ago",
    detail: "Email address used on ML-04835 (info@newbridgefinancial.co.uk) — domain 'newbridgefinancial.co.uk' was registered on 30 Mar 2026. Low-age domains are a fraud indicator.",
    caseId: "ML-04835", detected: "06 Apr 2026", confidence: 62, reviewer: "Unassigned", status: "Open",
    analysis: "WHOIS lookup confirms domain 'newbridgefinancial.co.uk' was registered on 30 Mar 2026, just 7 days ago. The application was submitted via this email address. While new domain registration alone is not conclusive evidence of fraud, it is a known indicator. The domain has no web presence and no Companies House record exists for 'Newbridge Financial'. The applicant claims to be self-employed through this entity. Recommend requesting additional business verification documentation and cross-referencing with HMRC self-assessment records." },

  { id: "AN-013", severity: "Resolved", category: "Document", title: "Address mismatch between utility bill and application — verified as recent move",
    detail: "Applicant T. Chen (ML-04815) — utility bill showed 45 Park Road but application stated 12 Cedar Close. Confirmed as legitimate house move on 15 Mar 2026.",
    caseId: "ML-04815", detected: "01 Apr 2026", confidence: 88, reviewer: "Sarah Chen", status: "Resolved",
    analysis: "Initial flag raised due to address discrepancy. Investigation confirmed the applicant moved from 45 Park Road to 12 Cedar Close on 15 Mar 2026. Electoral roll update confirmed. Council tax records updated. New utility bill at 12 Cedar Close obtained and verified. No further action required." },

  { id: "AN-014", severity: "Resolved", category: "Policy", title: "Income verification gap — second job income now confirmed",
    detail: "Applicant A. Novak (ML-04810) declared second job income of £12,000/yr but only primary employment was verified. Secondary employer reference now received.",
    caseId: "ML-04810", detected: "28 Mar 2026", confidence: 92, reviewer: "Claire Dunn", status: "Resolved",
    analysis: "The applicant declared total income of £52,000 comprising £40,000 from primary employment (verified) and £12,000 from part-time tutoring. The secondary income was initially unverified. Employer reference from 'Bright Tutors Ltd' received on 04 Apr confirming employment since Sep 2024, contracted 10 hours/week at £23/hr. P60 for secondary employment also obtained and matches declared figure. Income verification now complete. No policy breach." },

  { id: "AN-015", severity: "Resolved", category: "Valuation", title: "Duplicate valuation request — system error corrected",
    detail: "Case ML-04812 had two valuation instructions sent to different surveyors. Duplicate cancelled, single valuation retained.",
    caseId: "ML-04812", detected: "30 Mar 2026", confidence: 100, reviewer: "Mark Stevens", status: "Resolved",
    analysis: "A system error in the valuation ordering workflow caused two separate valuation instructions to be sent — one to Countrywide and one to e.surv. The Countrywide instruction was cancelled within 2 hours before a surveyor was assigned. The e.surv valuation proceeded and has been completed satisfactorily. Root cause identified as a race condition in the instruction API when the submit button was double-clicked. Engineering team notified and fix deployed on 02 Apr." },

  { id: "AN-016", severity: "Warning", category: "Fraud", title: "Applicant employer cannot be verified via Companies House",
    detail: "ML-04834 lists employer as 'Greenfield Consulting Group' — no matching active company found on Companies House. PAYE reference format appears non-standard.",
    caseId: "ML-04834", detected: "05 Apr 2026", confidence: 83, reviewer: "Unassigned", status: "Open",
    analysis: "Companies House search for 'Greenfield Consulting Group' returns no active results. Variations searched: 'Greenfield Consulting', 'Greenfield Group', 'GCG Ltd'. The PAYE reference provided (GCG/12345) does not follow the standard HMRC format (3 digits/letters + 5-digit number). The payslips appear professionally formatted but cannot be independently verified. This could indicate: (1) a recently dissolved company, (2) a trading name not matching the registered name, or (3) fabricated employment. Recommend requesting the company registration number and verifying directly with HMRC." },
];

// ─────────────────────────────────────────────
// FILTER TABS
// ─────────────────────────────────────────────
const TABS = ["All", "Critical", "Warning", "Info", "Resolved"];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AnomalyScreen() {
  const [tab, setTab] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = tab === "All" ? ANOMALIES : ANOMALIES.filter(a => a.severity === tab);

  const counts = { Critical: 0, Warning: 0, Info: 0, Resolved: 0 };
  ANOMALIES.forEach(a => { counts[a.severity] = (counts[a.severity] || 0) + 1; });

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {Ico.shield(22)}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>AI Anomaly Detection</h2>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Automated risk monitoring across applications, accounts, and documents</div>
        </div>
      </div>

      {/* AI Summary banner */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))`, border: `1px solid ${T.primaryGlow}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ color: T.primary, marginTop: 2 }}>{Ico.sparkle(20)}</span>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>
            <strong>Nova AI Summary:</strong> 3 critical items require immediate attention. 2 potential fraud signals detected this week — above the 30-day average of 0.8. Document anomalies have increased by 15% compared to last month. 1 unassigned critical item needs immediate triage.
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Active Flags" value="14" sub="+3 since yesterday" color={T.primary} />
        <KPICard label="Critical" value="3" sub="1 unassigned" color={T.danger} />
        <KPICard label="Under Review" value="5" sub="Avg 1.8 days in review" color={T.warning} />
        <KPICard label="Resolved Today" value="8" sub="Avg resolution: 2.1 days" color={T.success} />
        <KPICard label="False Positive Rate" value="12%" sub="Down from 18% last month" color="#7C3AED" />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {TABS.map(t => (
          <div key={t} onClick={() => { setTab(t); setSelected(null); }} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: tab === t ? T.primary : "transparent",
            color: tab === t ? "#fff" : T.textMuted,
            transition: "all 0.15s",
          }}>
            {t}{t !== "All" ? ` (${counts[t] || 0})` : ""}
          </div>
        ))}
      </div>

      {/* Anomaly list */}
      <Card noPad>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "90px 90px 1fr 100px 90px 80px 110px 80px",
          padding: "12px 20px", fontSize: 11, fontWeight: 700, color: T.textMuted,
          textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`,
          background: "#FAFAF8",
        }}>
          <span>ID</span><span>Severity</span><span>Anomaly</span><span>Case</span>
          <span>Detected</span><span>AI Conf.</span><span>Reviewer</span><span>Status</span>
        </div>

        {filtered.map(a => (
          <div key={a.id}>
            {/* Row */}
            <div onClick={() => setSelected(selected === a.id ? null : a.id)} style={{
              display: "grid", gridTemplateColumns: "90px 90px 1fr 100px 90px 80px 110px 80px",
              padding: "14px 20px", alignItems: "center", cursor: "pointer",
              borderBottom: `1px solid ${T.borderLight}`,
              background: selected === a.id ? T.primaryLight : "transparent",
              transition: "background 0.12s",
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{a.id}</span>
              <span><SeverityBadge severity={a.severity} /></span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: T.primary }}>{Ico[CATEGORY_ICONS[a.category]]?.(14)}</span>
                  {a.title}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{a.detail.slice(0, 100)}...</div>
              </div>
              <span style={{ fontSize: 12, color: T.primary, fontWeight: 500 }}>{a.caseId.length > 12 ? a.caseId.slice(0, 12) + "..." : a.caseId}</span>
              <span style={{ fontSize: 12, color: T.textMuted }}>{a.detected}</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: a.confidence >= 90 ? T.danger : a.confidence >= 70 ? T.warning : T.textMuted,
              }}>{a.confidence}%</span>
              <span style={{ fontSize: 12, color: a.reviewer === "Unassigned" ? T.danger : T.text }}>{a.reviewer}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                background: a.status === "Open" ? T.dangerBg : a.status === "Under Review" ? T.warningBg : T.successBg,
                color: a.status === "Open" ? T.danger : a.status === "Under Review" ? T.warning : T.success,
              }}>{a.status}</span>
            </div>

            {/* Detail panel */}
            {selected === a.id && (
              <div style={{ padding: "20px 24px", background: "#FAFBFC", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Left: full analysis */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                      {Ico.sparkle(13)} AI Analysis
                    </div>
                    <div style={{
                      fontSize: 13, lineHeight: 1.75, color: T.text, padding: 16, borderRadius: 10,
                      background: T.card, border: `1px solid ${T.border}`,
                    }}>
                      {a.analysis}
                    </div>
                  </div>
                  {/* Right: evidence & meta */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                      Evidence & Details
                    </div>
                    <div style={{ padding: 16, borderRadius: 10, background: T.card, border: `1px solid ${T.border}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 16 }}>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Category</span><br /><strong>{a.category}</strong></div>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Confidence</span><br /><strong>{a.confidence}%</strong></div>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Affected Case(s)</span><br /><strong>{a.caseId}</strong></div>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Detected</span><br /><strong>{a.detected}</strong></div>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Reviewer</span><br /><strong>{a.reviewer}</strong></div>
                        <div><span style={{ color: T.textMuted, fontSize: 11 }}>Status</span><br /><strong>{a.status}</strong></div>
                      </div>
                      <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {a.status !== "Resolved" && (
                          <>
                            <Btn small primary icon="check">Mark Resolved</Btn>
                            <Btn small danger icon="alert">Escalate</Btn>
                            <Btn small icon="x">False Positive</Btn>
                          </>
                        )}
                        {a.status === "Resolved" && (
                          <span style={{ fontSize: 12, color: T.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            {Ico.check(14)} Resolved — no further action required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
