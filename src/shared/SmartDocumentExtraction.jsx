import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card, KPICard } from "./primitives";

// ─────────────────────────────────────────────
// SMART DOCUMENT EXTRACTION
// LLM-powered document parsing with cross-document
// validation and anomaly detection.
// ─────────────────────────────────────────────

const DOCUMENTS = [
  { id: "DOC-001", name: "Fact_Find_Mitchell.pdf", category: "Fact Find", uploadedAt: "20 Feb, 14:00", size: "2.4MB",
    aiStatus: "Verified", confidence: 94, fieldsExtracted: 42, flags: 0,
    extractedData: [
      { field: "Full Name", value: "James Edward Mitchell", source: "Page 1, Section 1", confidence: 99 },
      { field: "Date of Birth", value: "14 March 1988", source: "Page 1, Section 1", confidence: 99 },
      { field: "Employment Status", value: "Employed", source: "Page 2, Section 3", confidence: 98 },
      { field: "Employer", value: "TechCorp Ltd", source: "Page 2, Section 3", confidence: 97 },
      { field: "Annual Income", value: "£70,000", source: "Page 2, Section 4", confidence: 96 },
      { field: "Bonus", value: "£8,000", source: "Page 2, Section 4", confidence: 94 },
      { field: "Property Address", value: "14 Oak Lane, Bristol BS1 4NZ", source: "Page 3, Section 5", confidence: 99 },
      { field: "Purchase Price", value: "£485,000", source: "Page 3, Section 5", confidence: 99 },
      { field: "Deposit", value: "£135,000", source: "Page 3, Section 6", confidence: 98 },
    ],
  },
  { id: "DOC-002", name: "Payslip_Mar_2026.pdf", category: "Payslip", uploadedAt: "20 Feb, 14:00", size: "340KB",
    aiStatus: "Verified", confidence: 96, fieldsExtracted: 12, flags: 0,
    extractedData: [
      { field: "Employer", value: "TechCorp Ltd", source: "Header", confidence: 99 },
      { field: "Employee", value: "James E Mitchell", source: "Header", confidence: 98 },
      { field: "Gross Monthly", value: "£5,833.33", source: "Earnings section", confidence: 97 },
      { field: "Tax Deducted", value: "£1,166.67", source: "Deductions", confidence: 96 },
      { field: "NI Deducted", value: "£466.67", source: "Deductions", confidence: 96 },
      { field: "Net Pay", value: "£4,199.99", source: "Summary", confidence: 97 },
      { field: "Pay Date", value: "28 March 2026", source: "Header", confidence: 99 },
      { field: "NI Number", value: "QQ 12 34 56 C", source: "Header", confidence: 99 },
    ],
  },
  { id: "DOC-003", name: "P60_2025.pdf", category: "P60", uploadedAt: "20 Feb, 14:00", size: "180KB",
    aiStatus: "Flagged", confidence: 91, fieldsExtracted: 8, flags: 1,
    extractedData: [
      { field: "Employee", value: "James E Mitchell", source: "Header", confidence: 98 },
      { field: "Employer", value: "TechCorp Ltd", source: "Header", confidence: 99 },
      { field: "Total Pay", value: "£67,500.00", source: "Box 1", confidence: 95, flag: "£2,500 less than declared annual income of £70,000" },
      { field: "Total Tax", value: "£14,000.00", source: "Box 2", confidence: 96 },
      { field: "Total NI", value: "£5,600.00", source: "Box 3", confidence: 96 },
      { field: "Tax Year", value: "2024/25", source: "Header", confidence: 99 },
    ],
  },
  { id: "DOC-004", name: "Bank_Statement_Feb.pdf", category: "Bank Statement", uploadedAt: "20 Feb, 14:00", size: "1.1MB",
    aiStatus: "Verified", confidence: 94, fieldsExtracted: 18, flags: 0,
    extractedData: [
      { field: "Account Holder", value: "James E Mitchell", source: "Header", confidence: 98 },
      { field: "Bank", value: "HSBC", source: "Header", confidence: 99 },
      { field: "Sort Code", value: "40-12-34", source: "Header", confidence: 99 },
      { field: "Regular Salary Credit", value: "£4,200.00", source: "28 Feb transaction", confidence: 96 },
      { field: "Salary Source", value: "TECHCORP LTD", source: "Transaction reference", confidence: 97 },
      { field: "Gambling Transactions", value: "None detected", source: "AI pattern analysis", confidence: 92 },
      { field: "Undisclosed Commitments", value: "None detected", source: "AI pattern analysis", confidence: 90 },
    ],
  },
];

const CROSS_VALIDATIONS = [
  { id: 1, fields: ["Employer"], docs: ["Fact Find", "Payslip", "P60", "Bank Statement"], values: ["TechCorp Ltd", "TechCorp Ltd", "TechCorp Ltd", "TECHCORP LTD"], status: "match", note: "Consistent across all 4 documents (uppercase variant on bank statement is normal)" },
  { id: 2, fields: ["Full Name"], docs: ["Fact Find", "Payslip", "P60"], values: ["James Edward Mitchell", "James E Mitchell", "James E Mitchell"], status: "match", note: "Middle name abbreviated on payslip/P60 — acceptable" },
  { id: 3, fields: ["Annual Income vs Gross Monthly × 12"], docs: ["Fact Find", "Payslip"], values: ["£70,000", "£69,999.96 (£5,833.33 × 12)"], status: "match", note: "Rounding difference of £0.04 — within tolerance" },
  { id: 4, fields: ["Annual Income vs P60 Total Pay"], docs: ["Fact Find", "P60"], values: ["£70,000", "£67,500"], status: "discrepancy", note: "P60 shows £2,500 less. Explanation: annual bonus of £8,000 paid in Feb 2026 (after P60 cut-off date of 5 April 2025). Feb payslip confirms bonus. Discrepancy explained — no further action." },
  { id: 5, fields: ["NI Number"], docs: ["Fact Find", "Payslip"], values: ["QQ 12 34 56 C", "QQ 12 34 56 C"], status: "match", note: "Exact match" },
  { id: 6, fields: ["Net Pay vs Bank Credit"], docs: ["Payslip", "Bank Statement"], values: ["£4,199.99", "£4,200.00"], status: "match", note: "Penny rounding difference — within tolerance" },
  { id: 7, fields: ["Property Address"], docs: ["Fact Find", "Land Registry"], values: ["14 Oak Lane, Bristol BS1 4NZ", "14 Oak Lane, Bristol BS1 4NZ"], status: "match", note: "Exact match with Land Registry" },
];

const ANOMALY_CHECKS = [
  { check: "Gambling activity", result: "None detected", status: "clear", detail: "No gambling merchant codes in 3 months of bank statements" },
  { check: "Undisclosed commitments", result: "None found", status: "clear", detail: "No regular outgoing debits not declared in the fact find" },
  { check: "Unusual cash deposits", result: "None flagged", status: "clear", detail: "No cash deposits exceeding £1,000 in the statement period" },
  { check: "Bounce/returned payments", result: "0 found", status: "clear", detail: "No failed direct debits or returned payments" },
  { check: "Payday loans", result: "None detected", status: "clear", detail: "No payday lender merchant codes identified" },
  { check: "Crypto transactions", result: "None detected", status: "clear", detail: "No cryptocurrency exchange transactions identified" },
  { check: "Address discrepancy", result: "None", status: "clear", detail: "Address consistent across fact find, utility bill, and electoral roll" },
  { check: "Income pattern", result: "Consistent", status: "clear", detail: "Regular monthly salary credit on consistent date (28th). No unusual spikes or gaps." },
];

export default function SmartDocumentExtraction({ caseId }) {
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [activeView, setActiveView] = useState("extraction");

  const doc = DOCUMENTS[selectedDoc];
  const totalFields = DOCUMENTS.reduce((sum, d) => sum + d.fieldsExtracted, 0);
  const totalFlags = DOCUMENTS.reduce((sum, d) => sum + d.flags, 0);
  const avgConfidence = Math.round(DOCUMENTS.reduce((sum, d) => sum + d.confidence, 0) / DOCUMENTS.length);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        {Ico.sparkle(22)}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>Smart Document Extraction</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>LLM-powered document parsing with cross-document validation and anomaly detection</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Documents Parsed" value={DOCUMENTS.length} sub="100% processed" color={T.primary} />
        <KPICard label="Fields Extracted" value={totalFields} sub="auto-populated" color="#059669" />
        <KPICard label="Avg Confidence" value={`${avgConfidence}%`} sub="across all docs" color={T.accent} />
        <KPICard label="Flags Raised" value={totalFlags} sub={totalFlags === 0 ? "all clear" : "needs review"} color={totalFlags > 0 ? T.warning : T.success} />
        <KPICard label="Cross-Validations" value={`${CROSS_VALIDATIONS.filter(v => v.status === "match").length}/${CROSS_VALIDATIONS.length}`} sub="passed" color={T.success} />
      </div>

      {/* View tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {[
          { id: "extraction", label: "Document Extraction" },
          { id: "crossval", label: "Cross-Document Validation" },
          { id: "anomaly", label: "Anomaly Detection" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)} style={{
            padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: activeView === tab.id ? 700 : 500, fontFamily: T.font,
            color: activeView === tab.id ? T.primary : T.textMuted,
            borderBottom: activeView === tab.id ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Extraction view */}
      {activeView === "extraction" && (
        <div style={{ display: "flex", gap: 20 }}>
          {/* Document list */}
          <div style={{ width: 260, flexShrink: 0 }}>
            {DOCUMENTS.map((d, i) => (
              <div key={d.id} onClick={() => setSelectedDoc(i)} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
                border: selectedDoc === i ? `2px solid ${T.primary}` : `1px solid ${T.borderLight}`,
                background: selectedDoc === i ? T.primaryLight : T.card, transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  {Ico.file(14)}
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{d.category}</span>
                  <span style={{
                    marginLeft: "auto", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                    background: d.aiStatus === "Verified" ? "#D1FAE5" : "#FEF3C7",
                    color: d.aiStatus === "Verified" ? "#065F46" : "#92400E",
                  }}>{d.aiStatus}</span>
                </div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{d.name}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10 }}>
                  <span style={{ color: T.textMuted }}>{d.fieldsExtracted} fields</span>
                  <span style={{ color: T.textMuted }}>{d.confidence}%</span>
                  {d.flags > 0 && <span style={{ color: T.warning, fontWeight: 600 }}>{d.flags} flag</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Extracted data */}
          <Card style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{doc.category}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{doc.name} · {doc.size} · {doc.uploadedAt}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>{doc.confidence}% confidence</span>
                <div style={{ width: 60, height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                  <div style={{ width: `${doc.confidence}%`, height: "100%", borderRadius: 3, background: doc.confidence >= 95 ? "#059669" : doc.confidence >= 90 ? T.warning : T.danger }} />
                </div>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Field</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Extracted Value</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Source Location</th>
                  <th style={{ textAlign: "center", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {doc.extractedData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, background: row.flag ? "#FEF3C7" : i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.navy }}>{row.field}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 500 }}>
                      {row.value}
                      {row.flag && (
                        <div style={{ fontSize: 10, color: T.warning, fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                          {Ico.alert(12)} {row.flag}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 11, color: T.textMuted }}>{row.source}</td>
                    <td style={{ padding: "10px 10px", textAlign: "center" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: row.confidence >= 97 ? "#D1FAE5" : row.confidence >= 93 ? "#FEF3C7" : "#FEE2E2",
                        color: row.confidence >= 97 ? "#065F46" : row.confidence >= 93 ? "#92400E" : "#991B1B",
                      }}>{row.confidence}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Cross-validation view */}
      {activeView === "crossval" && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Cross-Document Validation</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>AI compares the same data point across multiple documents to detect inconsistencies</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CROSS_VALIDATIONS.map(v => (
              <div key={v.id} style={{
                padding: "14px 16px", borderRadius: 10, border: `1px solid ${v.status === "match" ? "#A7F3D0" : "#FDE68A"}`,
                background: v.status === "match" ? "#F0FDF4" : "#FEFCE8",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: v.status === "match" ? "#059669" : "#F59E0B" }}>{v.status === "match" ? Ico.check(16) : Ico.alert(16)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{v.fields.join(" / ")}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: v.status === "match" ? "#D1FAE5" : "#FEF3C7",
                    color: v.status === "match" ? "#065F46" : "#92400E",
                  }}>{v.status === "match" ? "MATCH" : "DISCREPANCY"}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  {v.docs.map((doc, i) => (
                    <div key={i} style={{ padding: "4px 10px", borderRadius: 6, background: T.card, border: `1px solid ${T.borderLight}`, fontSize: 11 }}>
                      <span style={{ fontWeight: 600, color: T.textMuted }}>{doc}:</span> <span style={{ fontWeight: 600, color: T.text }}>{v.values[i]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, fontStyle: "italic" }}>{v.note}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Anomaly detection view */}
      {activeView === "anomaly" && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Anomaly Detection</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>AI scans for fraud indicators, undisclosed commitments, and suspicious patterns</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ANOMALY_CHECKS.map((check, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: i % 2 === 0 ? "#FAFAF8" : "#FFF", border: `1px solid ${T.borderLight}` }}>
                <span style={{ color: check.status === "clear" ? "#059669" : "#DC2626" }}>{check.status === "clear" ? Ico.check(16) : Ico.alert(16)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{check.check}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{check.detail}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  background: check.status === "clear" ? "#D1FAE5" : "#FEE2E2",
                  color: check.status === "clear" ? "#065F46" : "#991B1B",
                }}>{check.result}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, padding: "14px 16px", borderRadius: 10,
            background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}08)`,
            border: `1px solid ${T.primary}20`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {Ico.sparkle(16)}
              <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>AI Summary</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
              All 8 anomaly checks passed. No fraud indicators, undisclosed commitments, or suspicious transaction patterns detected. One cross-document discrepancy (P60 vs declared income) has been explained by bonus timing. <strong>Recommendation: proceed with confidence.</strong>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
