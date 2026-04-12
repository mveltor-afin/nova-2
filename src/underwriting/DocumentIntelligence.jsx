import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const DOCUMENTS = [
  { id: 1, name: "Payslip — March 2026", type: "payslip", status: "verified", confidence: 98, uploaded: "10 Apr 2026", extractedFields: 8, anomalies: 0 },
  { id: 2, name: "Payslip — February 2026", type: "payslip", status: "verified", confidence: 96, uploaded: "10 Apr 2026", extractedFields: 8, anomalies: 0 },
  { id: 3, name: "P60 — Tax Year 2025", type: "p60", status: "anomaly", confidence: 84, uploaded: "9 Apr 2026", extractedFields: 12, anomalies: 2 },
  { id: 4, name: "Bank Statement — March 2026", type: "bank_statement", status: "verified", confidence: 94, uploaded: "9 Apr 2026", extractedFields: 15, anomalies: 0 },
  { id: 5, name: "Bank Statement — February 2026", type: "bank_statement", status: "processing", confidence: 0, uploaded: "12 Apr 2026", extractedFields: 0, anomalies: 0 },
  { id: 6, name: "HMRC Tax Calculation", type: "hmrc", status: "verified", confidence: 99, uploaded: "8 Apr 2026", extractedFields: 6, anomalies: 0 },
  { id: 7, name: "Employer Reference Letter", type: "employer_ref", status: "pending_review", confidence: 72, uploaded: "11 Apr 2026", extractedFields: 4, anomalies: 1 },
  { id: 8, name: "Property Valuation Report", type: "valuation", status: "verified", confidence: 97, uploaded: "7 Apr 2026", extractedFields: 18, anomalies: 0 },
];

// ─────────────────────────────────────────────
// EXTRACTED FIELD DATA PER TYPE
// ─────────────────────────────────────────────
const EXTRACTED = {
  payslip_1: [
    { field: "Employee Name", value: "James A. Whitfield", confidence: 99, verified: true },
    { field: "Employer", value: "Helix Financial Services Ltd", confidence: 99, verified: true },
    { field: "Pay Period", value: "1 Mar 2026 — 31 Mar 2026", confidence: 98, verified: true },
    { field: "Gross Pay", value: "£5,833.33", confidence: 99, verified: true },
    { field: "Net Pay", value: "£4,112.47", confidence: 98, verified: true },
    { field: "Tax Deducted", value: "£1,166.67", confidence: 97, verified: true },
    { field: "NI Deducted", value: "£404.19", confidence: 97, verified: true },
    { field: "Pension", value: "£150.00", confidence: 96, verified: true },
  ],
  payslip_2: [
    { field: "Employee Name", value: "James A. Whitfield", confidence: 99, verified: true },
    { field: "Employer", value: "Helix Financial Services Ltd", confidence: 99, verified: true },
    { field: "Pay Period", value: "1 Feb 2026 — 28 Feb 2026", confidence: 98, verified: true },
    { field: "Gross Pay", value: "£5,833.33", confidence: 98, verified: true },
    { field: "Net Pay", value: "£4,112.47", confidence: 97, verified: true },
    { field: "Tax Deducted", value: "£1,166.67", confidence: 96, verified: true },
    { field: "NI Deducted", value: "£404.19", confidence: 95, verified: true },
    { field: "Pension", value: "£150.00", confidence: 94, verified: true },
  ],
  p60_3: [
    { field: "Employee Name", value: "James A. Whitfield", confidence: 99, verified: true },
    { field: "Employer", value: "Helix Financial Services Ltd", confidence: 98, verified: true },
    { field: "Tax Year", value: "2024/25", confidence: 99, verified: true },
    { field: "Total Pay", value: "£67,500.00", confidence: 88, verified: false, warning: true },
    { field: "Tax Deducted", value: "£13,500.00", confidence: 90, verified: true },
    { field: "NI", value: "£4,850.28", confidence: 89, verified: true },
    { field: "Student Loan", value: "£0.00", confidence: 95, verified: true },
    { field: "Bonus Payments", value: "£0.00", confidence: 72, verified: false, warning: true },
    { field: "Employer PAYE Ref", value: "941/HX00142", confidence: 97, verified: true },
    { field: "Tax Code", value: "1257L", confidence: 99, verified: true },
    { field: "NI Number", value: "QQ 12 34 56 C", confidence: 98, verified: true },
    { field: "Pension Contributions", value: "£1,800.00", confidence: 91, verified: true },
  ],
  bank_statement_4: [
    { field: "Account Holder", value: "James A. Whitfield", confidence: 99, verified: true },
    { field: "Sort Code", value: "20-45-67", confidence: 99, verified: true },
    { field: "Account No", value: "73849201", confidence: 99, verified: true },
    { field: "Statement Period", value: "1 Mar 2026 — 31 Mar 2026", confidence: 98, verified: true },
    { field: "Opening Balance", value: "£3,214.56", confidence: 97, verified: true },
    { field: "Closing Balance", value: "£4,891.03", confidence: 97, verified: true },
    { field: "Total Credits", value: "£6,412.47", confidence: 96, verified: true },
    { field: "Total Debits", value: "£4,736.00", confidence: 96, verified: true },
    { field: "Regular Income (avg)", value: "£4,112.47", confidence: 94, verified: true },
    { field: "Largest Credit", value: "£4,112.47", confidence: 95, verified: true },
    { field: "Largest Debit", value: "£1,450.00", confidence: 93, verified: true },
    { field: "Gambling Transactions", value: "None detected", confidence: 98, verified: true },
    { field: "Overdraft Used", value: "No", confidence: 97, verified: true },
    { field: "Returned DDs", value: "0", confidence: 99, verified: true },
    { field: "Cash Withdrawals", value: "£200.00", confidence: 92, verified: true },
  ],
  bank_statement_5: [],
  hmrc_6: [
    { field: "Taxpayer Name", value: "James A. Whitfield", confidence: 99, verified: true },
    { field: "UTR", value: "1234567890", confidence: 99, verified: true },
    { field: "Tax Year", value: "2024/25", confidence: 99, verified: true },
    { field: "Total Income", value: "£70,000.00", confidence: 99, verified: true },
    { field: "Tax Paid", value: "£14,000.00", confidence: 98, verified: true },
    { field: "NI Class", value: "Class 1", confidence: 97, verified: true },
  ],
  employer_ref_7: [
    { field: "Employee Name", value: "James A. Whitfield", confidence: 92, verified: true },
    { field: "Job Title", value: "Senior Financial Analyst", confidence: 88, verified: true },
    { field: "Start Date", value: "14 September 2019", confidence: 85, verified: true },
    { field: "Salary Confirmed", value: "£68,000.00", confidence: 62, verified: false, warning: true },
  ],
  valuation_8: [
    { field: "Property Address", value: "42 Elmwood Crescent, Richmond, TW9 3PL", confidence: 99, verified: true },
    { field: "Property Type", value: "Semi-detached house", confidence: 98, verified: true },
    { field: "Tenure", value: "Freehold", confidence: 99, verified: true },
    { field: "Condition", value: "Good", confidence: 96, verified: true },
    { field: "Market Value", value: "£685,000", confidence: 97, verified: true },
    { field: "Forced Sale Value", value: "£575,000", confidence: 95, verified: true },
    { field: "Surveyor Name", value: "David R. Callister MRICS", confidence: 99, verified: true },
    { field: "Survey Date", value: "5 Apr 2026", confidence: 99, verified: true },
    { field: "EPC Rating", value: "C (72)", confidence: 98, verified: true },
    { field: "Flood Risk", value: "Low", confidence: 97, verified: true },
    { field: "Structural Issues", value: "None identified", confidence: 94, verified: true },
    { field: "Rebuild Cost", value: "£420,000", confidence: 93, verified: true },
    { field: "Comparable 1", value: "38 Elmwood Crescent — £670,000 (Jan 2026)", confidence: 91, verified: true },
    { field: "Comparable 2", value: "15 Cedar Lane, TW9 — £695,000 (Dec 2025)", confidence: 90, verified: true },
    { field: "Comparable 3", value: "7 Park Road, TW9 — £710,000 (Nov 2025)", confidence: 89, verified: true },
    { field: "RICS Compliant", value: "Yes", confidence: 99, verified: true },
    { field: "Restrictions", value: "None", confidence: 96, verified: true },
    { field: "Access Issues", value: "None", confidence: 97, verified: true },
  ],
};

// ─────────────────────────────────────────────
// ANOMALIES
// ─────────────────────────────────────────────
const ANOMALIES = {
  3: [
    { title: "Income Discrepancy", detail: "Total pay £67,500 does not match payslip annualised figure of £70,000 — variance of £2,500" },
    { title: "Missing Bonus Line Item", detail: "Bonus of £8,000 reported on payslip but not itemised on P60" },
  ],
  7: [
    { title: "Salary Mismatch", detail: "Salary confirmed as £68,000 but payslip shows £70,000 basic — variance £2,000" },
  ],
};

// ─────────────────────────────────────────────
// CROSS-DOCUMENT VERIFICATIONS
// ─────────────────────────────────────────────
const CROSS_VERIFICATIONS = {
  1: [
    { text: "Income on payslip (£70,000 annualised) matches HMRC (£70,000)", pass: true },
    { text: "Net pay (£4,112.47) matches bank statement credit (£4,112.47)", pass: true },
    { text: "Employer name matches across all documents", pass: true },
  ],
  2: [
    { text: "Income on payslip (£70,000 annualised) matches HMRC (£70,000)", pass: true },
    { text: "Net pay (£4,112.47) matches bank statement credit (£4,112.47)", pass: true },
  ],
  3: [
    { text: "P60 total (£67,500) does NOT match payslip annualised (£70,000)", pass: false },
    { text: "P60 employer PAYE ref matches payslip employer", pass: true },
    { text: "P60 bonus (£0) does NOT match payslip bonus (£8,000)", pass: false },
  ],
  4: [
    { text: "Bank statement regular income (£4,112.47) matches payslip net pay", pass: true },
    { text: "No gambling transactions detected — passes affordability checks", pass: true },
    { text: "Account holder name matches applicant name", pass: true },
  ],
  5: [],
  6: [
    { text: "HMRC total income (£70,000) matches payslip annualised (£70,000)", pass: true },
    { text: "HMRC tax year matches P60 tax year", pass: true },
  ],
  7: [
    { text: "Employer ref salary (£68,000) does NOT match payslip (£70,000)", pass: false },
    { text: "Employee name matches across documents", pass: true },
    { text: "Start date (Sep 2019) indicates 6+ years tenure — positive indicator", pass: true },
  ],
  8: [
    { text: "Property valuation (£685,000) supports requested LTV", pass: true },
    { text: "Surveyor is RICS accredited", pass: true },
    { text: "EPC rating C — meets minimum lending criteria", pass: true },
  ],
};

// ─────────────────────────────────────────────
// AI SUMMARIES
// ─────────────────────────────────────────────
const AI_SUMMARIES = {
  1: "March 2026 payslip for James Whitfield has been fully verified. All extracted fields match expected values with high confidence (98% avg). Gross pay of £5,833.33 annualises to £70,000, consistent with HMRC records and bank statement deposits. No anomalies detected. This document is ready for underwriting use.",
  2: "February 2026 payslip verified successfully. Pay figures are consistent month-on-month, supporting income stability. Net pay of £4,112.47 aligns with bank statement credits for the same period. All fields extracted with confidence above 94%. Recommend approval for income evidence.",
  3: "P60 for tax year 2024/25 contains two anomalies requiring manual review. The total pay figure of £67,500 is £2,500 below the annualised payslip figure of £70,000. Additionally, a bonus of £8,000 referenced on payslips is not itemised on the P60. This may indicate a mid-year salary change or a data entry error. Recommend requesting employer clarification before proceeding.",
  4: "March 2026 bank statement verified. Opening and closing balances are consistent, total credits include regular salary deposit matching payslip net pay. No gambling transactions, no returned direct debits, and no overdraft usage detected — strong affordability indicators. Cash withdrawals are minimal at £200.",
  5: "Document is currently being processed by the AI extraction engine. Please check back shortly.",
  6: "HMRC tax calculation verified with 99% confidence. Total income of £70,000 matches payslip annualised figures. Tax paid of £14,000 is consistent with the 1257L tax code. No discrepancies found. This is a strong corroborating document for income verification.",
  7: "Employer reference letter has been extracted but requires manual review. The confirmed salary of £68,000 does not match the £70,000 shown on recent payslips — a variance of £2,000 which may indicate a recent pay rise not yet reflected in the reference. Job title and start date have been verified. Recommend contacting employer to confirm current salary.",
  8: "Property valuation report fully verified with 97% confidence. Market value of £685,000 with a forced sale value of £575,000 (84% of market value). The property is freehold, in good condition, with no structural issues, flood risk, or restrictions. Three comparable properties support the valuation. RICS compliant survey by David Callister. EPC rating of C (72) meets minimum lending criteria.",
};

// ─────────────────────────────────────────────
// STATUS HELPERS
// ─────────────────────────────────────────────
const STATUS_CFG = {
  verified:       { label: "Verified",       bg: "rgba(49,184,151,0.12)", color: T.success,   icon: "check" },
  anomaly:        { label: "Anomaly",        bg: "rgba(255,107,97,0.12)", color: T.danger,    icon: "alert" },
  processing:     { label: "Processing",     bg: "rgba(59,130,246,0.12)", color: "#3B82F6",   icon: "clock" },
  pending_review: { label: "Pending Review", bg: "rgba(255,191,0,0.12)",  color: T.warning,   icon: "eye" },
};

const TYPE_COLORS = {
  payslip: T.primary,
  p60: "#7C3AED",
  bank_statement: "#3B82F6",
  hmrc: "#059669",
  employer_ref: T.warning,
  valuation: "#E11D48",
};

const TYPE_LABELS = {
  payslip: "Payslip",
  p60: "P60",
  bank_statement: "Bank Statement",
  hmrc: "HMRC",
  employer_ref: "Employer Ref",
  valuation: "Valuation",
};

// ─────────────────────────────────────────────
// ANIMATION KEYFRAMES (processing pulse)
// ─────────────────────────────────────────────
const pulseKeyframes = `
@keyframes docPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function DocumentIntelligence({ caseId }) {
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);

  const selected = DOCUMENTS.find(d => d.id === selectedId);
  const extractionKey = selected ? `${selected.type}_${selected.id}` : null;
  const fields = extractionKey ? (EXTRACTED[extractionKey] || []) : [];

  const handleUploadClick = () => {
    setToast("Document uploaded — AI extraction starting...");
    setTimeout(() => setToast(null), 3000);
  };

  // ── KPI calculations ──
  const totalDocs = DOCUMENTS.length;
  const verifiedCount = DOCUMENTS.filter(d => d.status === "verified").length;
  const anomalyCount = DOCUMENTS.reduce((sum, d) => sum + d.anomalies, 0);
  const avgConf = Math.round(DOCUMENTS.filter(d => d.confidence > 0).reduce((s, d) => s + d.confidence, 0) / DOCUMENTS.filter(d => d.confidence > 0).length);
  const autoFields = DOCUMENTS.reduce((s, d) => s + d.extractedFields, 0);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <style>{pulseKeyframes}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: T.primary, color: "#fff", padding: "12px 24px",
          borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {Ico.sparkle(16)} {toast}
        </div>
      )}

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        <KPICard label="Total Documents" value={totalDocs} color={T.primary} />
        <KPICard label="Verified" value={verifiedCount} color={T.success} />
        <KPICard label="Anomalies Detected" value={anomalyCount} color={T.danger} />
        <KPICard label="Avg Confidence" value={`${avgConf}%`} color="#3B82F6" />
        <KPICard label="Auto-Populated Fields" value={autoFields} color="#7C3AED" />
      </div>

      {/* ── Main panels ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── LEFT PANEL: Document Inbox ── */}
        <div style={{ flex: "0 0 55%", minWidth: 0 }}>

          {/* Upload zone */}
          <div
            onClick={handleUploadClick}
            style={{
              border: `2px dashed ${T.border}`, borderRadius: 12,
              padding: "28px 20px", textAlign: "center", cursor: "pointer",
              marginBottom: 18, transition: "all 0.2s",
              background: "rgba(26,74,84,0.02)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.background = T.primaryLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(26,74,84,0.02)"; }}
          >
            <div style={{ color: T.textMuted, marginBottom: 6 }}>{Ico.upload(28)}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary }}>
              Drop documents here or click to upload
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              PDF, JPG, PNG — max 25 MB per file
            </div>
          </div>

          {/* Document list */}
          <Card noPad style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Document Inbox</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>{totalDocs} documents</span>
            </div>
            {DOCUMENTS.map(doc => {
              const sc = STATUS_CFG[doc.status];
              const tc = TYPE_COLORS[doc.type];
              const isSelected = doc.id === selectedId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 20px", cursor: "pointer",
                    borderBottom: `1px solid ${T.borderLight}`,
                    background: isSelected ? T.primaryLight : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(26,74,84,0.04)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Type icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${tc}14`, display: "flex", alignItems: "center", justifyContent: "center",
                    color: tc, flexShrink: 0,
                  }}>
                    {Ico.file(18)}
                  </div>

                  {/* Name + date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                      Uploaded {doc.uploaded} &middot; {doc.extractedFields} fields extracted
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                    background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                    animation: doc.status === "processing" ? "docPulse 1.5s ease-in-out infinite" : "none",
                  }}>
                    {sc.label}
                  </span>

                  {/* Confidence */}
                  {doc.confidence > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: doc.confidence >= 90 ? T.success : doc.confidence >= 75 ? T.warning : T.danger, minWidth: 36, textAlign: "right" }}>
                      {doc.confidence}%
                    </span>
                  )}
                </div>
              );
            })}
          </Card>
        </div>

        {/* ── RIGHT PANEL: Extraction Detail ── */}
        <div style={{ flex: "0 0 45%", minWidth: 0 }}>
          {!selected ? (
            <Card style={{ textAlign: "center", padding: "64px 32px" }}>
              <div style={{ color: T.textMuted, marginBottom: 12 }}>{Ico.file(40)}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.textSecondary }}>
                Select a document to view AI extraction results
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6 }}>
                Click any document in the inbox to see extracted fields, anomalies and cross-document verification
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── 1. Document Header ── */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `${TYPE_COLORS[selected.type]}14`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: TYPE_COLORS[selected.type],
                  }}>
                    {Ico.file(22)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>{selected.name}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                        background: `${TYPE_COLORS[selected.type]}18`, color: TYPE_COLORS[selected.type],
                        textTransform: "uppercase", letterSpacing: 0.5,
                      }}>
                        {TYPE_LABELS[selected.type]}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                        background: STATUS_CFG[selected.status].bg, color: STATUS_CFG[selected.status].color,
                      }}>
                        {STATUS_CFG[selected.status].label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confidence gauge */}
                {selected.confidence > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>AI Confidence</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: selected.confidence >= 90 ? T.success : selected.confidence >= 75 ? T.warning : T.danger }}>
                        {selected.confidence}%
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 3, width: `${selected.confidence}%`,
                        background: selected.confidence >= 90 ? T.success : selected.confidence >= 75 ? T.warning : T.danger,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                )}
              </Card>

              {/* ── 2. Extracted Fields ── */}
              {fields.length > 0 && (
                <Card noPad>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.primary }}>{Ico.sparkle(16)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Extracted Fields</span>
                    <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{fields.length} fields</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ background: "rgba(26,74,84,0.03)" }}>
                          <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: T.textMuted, fontSize: 11, borderBottom: `1px solid ${T.borderLight}` }}>Field</th>
                          <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: T.textMuted, fontSize: 11, borderBottom: `1px solid ${T.borderLight}` }}>Extracted Value</th>
                          <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 600, color: T.textMuted, fontSize: 11, borderBottom: `1px solid ${T.borderLight}` }}>Confidence</th>
                          <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 600, color: T.textMuted, fontSize: 11, borderBottom: `1px solid ${T.borderLight}` }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((f, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                            <td style={{ padding: "10px 16px", fontWeight: 600, color: T.textSecondary }}>{f.field}</td>
                            <td style={{ padding: "10px 16px", color: T.text, fontFamily: "'DM Sans', monospace" }}>{f.value}</td>
                            <td style={{ padding: "10px 16px", textAlign: "center" }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                                background: f.confidence >= 90 ? T.successBg : f.confidence >= 75 ? T.warningBg : T.dangerBg,
                                color: f.confidence >= 90 ? T.success : f.confidence >= 75 ? T.warning : T.danger,
                              }}>
                                {f.confidence}%
                              </span>
                            </td>
                            <td style={{ padding: "10px 16px", textAlign: "center" }}>
                              {f.verified ? (
                                <span style={{ color: T.success }}>{Ico.check(16)}</span>
                              ) : f.warning ? (
                                <span style={{ color: T.warning }}>{Ico.alert(16)}</span>
                              ) : (
                                <span style={{ color: T.danger }}>{Ico.x(16)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ── 3. Anomalies ── */}
              {selected.anomalies > 0 && ANOMALIES[selected.id] && (
                <Card style={{ border: `1px solid ${T.dangerBorder}`, background: T.dangerBg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ color: T.danger }}>{Ico.alert(18)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.danger }}>
                      Anomalies Detected ({ANOMALIES[selected.id].length})
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ANOMALIES[selected.id].map((a, i) => (
                      <div key={i} style={{
                        background: T.card, borderRadius: 10, padding: "14px 16px",
                        border: `1px solid ${T.dangerBorder}`,
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 4 }}>{a.title}</div>
                        <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{a.detail}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── 4. Cross-Document Verification ── */}
              {CROSS_VERIFICATIONS[selected.id] && CROSS_VERIFICATIONS[selected.id].length > 0 && (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ color: T.primary }}>{Ico.shield(18)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Cross-Document Verification</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {CROSS_VERIFICATIONS[selected.id].map((cv, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "10px 14px", borderRadius: 8,
                        background: cv.pass ? T.successBg : T.dangerBg,
                        border: `1px solid ${cv.pass ? T.successBorder : T.dangerBorder}`,
                      }}>
                        <span style={{ color: cv.pass ? T.success : T.danger, flexShrink: 0, marginTop: 1 }}>
                          {cv.pass ? Ico.check(15) : Ico.x(15)}
                        </span>
                        <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{cv.text}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── 5. AI Summary ── */}
              {AI_SUMMARIES[selected.id] && (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ color: T.primary }}>{Ico.bot(18)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>AI Summary</span>
                  </div>
                  <p style={{ fontSize: 13, color: T.text, lineHeight: 1.7, margin: 0 }}>
                    {AI_SUMMARIES[selected.id]}
                  </p>
                </Card>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <Btn primary icon="check">Approve Document</Btn>
                <Btn icon="eye">Request Review</Btn>
                <Btn danger icon="alert">Flag Issue</Btn>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
