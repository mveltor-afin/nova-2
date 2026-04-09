import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Select } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

// ─────────────────────────────────────────────
// CASE-SPECIFIC RULES
// ─────────────────────────────────────────────

const RULES_BY_CASE = {
  "AFN-2026-00142": [
    // Borrower Eligibility
    { cat: "Borrower Eligibility", rule: "Minimum age", threshold: "18", actual: "38", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Maximum age at end of term", threshold: "75", actual: "63", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "UK residency", threshold: "Yes", actual: "Yes", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Employment minimum tenure", threshold: "6 months", actual: "7 years", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Credit score minimum", threshold: "600", actual: "742", status: "PASS" },
    // Affordability
    { cat: "Affordability", rule: "DTI maximum", threshold: "45%", actual: "18.2%", status: "PASS" },
    { cat: "Affordability", rule: "Stress test (SVR + 3%)", threshold: "Pass", actual: "Pass (surplus £710)", status: "PASS" },
    { cat: "Affordability", rule: "Income verification", threshold: "2 sources", actual: "4 sources", status: "PASS" },
    { cat: "Affordability", rule: "Minimum surplus after stress", threshold: "£0", actual: "£710", status: "PASS" },
    // Collateral
    { cat: "Collateral", rule: "Maximum LTV", threshold: "75%", actual: "72%", status: "PASS" },
    { cat: "Collateral", rule: "Minimum valuation confidence", threshold: "75%", actual: "87%", status: "PASS" },
    { cat: "Collateral", rule: "Property type accepted", threshold: "Standard", actual: "Standard", status: "PASS" },
    { cat: "Collateral", rule: "AVM vs Surveyor variance", threshold: "<15%", actual: "2.1%", status: "PASS" },
    // Product & Mandate
    { cat: "Product & Mandate", rule: "Within product LTV band", threshold: "Max 75%", actual: "72%", status: "PASS" },
    { cat: "Product & Mandate", rule: "Within mandate level", threshold: "L1 max £500k", actual: "£350k", status: "PASS" },
    { cat: "Product & Mandate", rule: "ERC disclosure", threshold: "Yes", actual: "Yes", status: "PASS" },
    // Documentation
    { cat: "Documentation", rule: "All required documents", threshold: "6 required", actual: "6 provided", status: "WARNING", warning: "P60 shows £2,500 variance from declared income" },
    { cat: "Documentation", rule: "KYC verification", threshold: "Complete", actual: "Complete", status: "WARNING", warning: "Utility bill older than 3 months — supplemented with bank statement" },
  ],

  "AFN-2026-00119": [
    // Borrower Eligibility
    { cat: "Borrower Eligibility", rule: "Minimum age", threshold: "18", actual: "44", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Maximum age at end of term", threshold: "75", actual: "59", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "UK residency", threshold: "Yes", actual: "Yes", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Employment minimum tenure", threshold: "2 years (self-employed)", actual: "18 months", status: "FAIL", warning: "Self-employed less than 2 years — policy requires minimum 2 years trading history for sole traders" },
    { cat: "Borrower Eligibility", rule: "Credit score minimum", threshold: "600", actual: "668", status: "PASS" },
    // Affordability
    { cat: "Affordability", rule: "DTI maximum", threshold: "45%", actual: "28.4%", status: "PASS" },
    { cat: "Affordability", rule: "Stress test (SVR + 3%)", threshold: "Pass", actual: "Pass (surplus £185)", status: "WARNING", warning: "Surplus is marginal — under £200 threshold for comfort. Self-employed income variability increases risk." },
    { cat: "Affordability", rule: "Income verification", threshold: "2 years SA302", actual: "1 year SA302 only", status: "FAIL", warning: "Only 1 year of SA302/Tax Calculations provided. Policy requires minimum 2 years for self-employed applicants." },
    { cat: "Affordability", rule: "Minimum surplus after stress", threshold: "£0", actual: "£185", status: "PASS" },
    // Collateral
    { cat: "Collateral", rule: "Maximum LTV", threshold: "75%", actual: "60%", status: "PASS" },
    { cat: "Collateral", rule: "Minimum valuation confidence", threshold: "75%", actual: "82%", status: "PASS" },
    { cat: "Collateral", rule: "Property type accepted", threshold: "Standard", actual: "Standard", status: "PASS" },
    { cat: "Collateral", rule: "AVM vs Surveyor variance", threshold: "<15%", actual: "4.8%", status: "PASS" },
    // Product & Mandate
    { cat: "Product & Mandate", rule: "Within product LTV band", threshold: "Max 75%", actual: "60%", status: "PASS" },
    { cat: "Product & Mandate", rule: "Within mandate level", threshold: "L1 max £500k", actual: "£180k", status: "PASS" },
    { cat: "Product & Mandate", rule: "ERC disclosure", threshold: "Yes", actual: "Pending", status: "WARNING", warning: "Product not yet selected — ERC disclosure will be required at offer stage" },
    // Documentation
    { cat: "Documentation", rule: "All required documents", threshold: "8 required (SE)", actual: "6 provided", status: "WARNING", warning: "Missing: 2nd year SA302, Company accounts. Self-employed applicants require extended documentation." },
    { cat: "Documentation", rule: "KYC verification", threshold: "Complete", actual: "Complete", status: "PASS" },
  ],

  "AFN-2026-00135": [
    // Borrower Eligibility
    { cat: "Borrower Eligibility", rule: "Minimum age", threshold: "18", actual: "46", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Maximum age at end of term", threshold: "75", actual: "71", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "UK residency", threshold: "Yes", actual: "Yes", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Employment minimum tenure", threshold: "6 months", actual: "11 years", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Credit score minimum", threshold: "600", actual: "718", status: "PASS" },
    // Affordability
    { cat: "Affordability", rule: "DTI maximum", threshold: "45%", actual: "22.5%", status: "PASS" },
    { cat: "Affordability", rule: "Stress test (SVR + 3%)", threshold: "Pass", actual: "Pass (surplus £1,240)", status: "PASS" },
    { cat: "Affordability", rule: "Income verification", threshold: "2 sources", actual: "3 sources", status: "PASS" },
    { cat: "Affordability", rule: "Minimum surplus after stress", threshold: "£0", actual: "£1,240", status: "PASS" },
    // Collateral
    { cat: "Collateral", rule: "Maximum LTV (standard product)", threshold: "75%", actual: "90%", status: "FAIL", warning: "LTV of 90% exceeds standard product maximum of 75%. However, applicant is on 90% LTV product tier (Afin Fix 5yr 90%) which permits up to 90% LTV. Reclassify to 90% product rules." },
    { cat: "Collateral", rule: "Minimum valuation confidence", threshold: "75%", actual: "91%", status: "PASS" },
    { cat: "Collateral", rule: "Property type accepted", threshold: "Standard", actual: "Standard", status: "PASS" },
    { cat: "Collateral", rule: "AVM vs Surveyor variance", threshold: "<15%", actual: "1.8%", status: "PASS" },
    // Product & Mandate
    { cat: "Product & Mandate", rule: "Within product LTV band (90% tier)", threshold: "Max 90%", actual: "90%", status: "WARNING", warning: "LTV is at the absolute maximum for 90% product. Any valuation reduction will breach. High sensitivity to market movements." },
    { cat: "Product & Mandate", rule: "Within mandate level", threshold: "L2 max £500k", actual: "£425k", status: "PASS" },
    { cat: "Product & Mandate", rule: "Interest Only: repayment vehicle", threshold: "Required", actual: "ISA portfolio", status: "WARNING", warning: "Interest Only requires credible repayment vehicle. ISA portfolio (£95,000) projected to cover 84% of capital at maturity. Recommend annual review condition." },
    { cat: "Product & Mandate", rule: "ERC disclosure", threshold: "Yes", actual: "Yes", status: "PASS" },
    // Documentation
    { cat: "Documentation", rule: "All required documents", threshold: "8 required (IO)", actual: "8 provided", status: "PASS" },
    { cat: "Documentation", rule: "KYC verification", threshold: "Complete", actual: "Complete", status: "PASS" },
  ],
};

// Generate rules for cases without specific data
function generateDefaultRules(loan) {
  const amount = parseInt((loan.amount || "£300,000").replace(/[^\d]/g, ""));
  const isApproved = ["Approved", "Offer_Issued", "Offer_Accepted", "Disbursed"].includes(loan.status);
  const isDIP = loan.status === "DIP_Approved";

  return [
    { cat: "Borrower Eligibility", rule: "Minimum age", threshold: "18", actual: "35", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Maximum age at end of term", threshold: "75", actual: "65", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "UK residency", threshold: "Yes", actual: "Yes", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Employment minimum tenure", threshold: "6 months", actual: "4 years", status: "PASS" },
    { cat: "Borrower Eligibility", rule: "Credit score minimum", threshold: "600", actual: isApproved || isDIP ? "721" : "688", status: "PASS" },
    { cat: "Affordability", rule: "DTI maximum", threshold: "45%", actual: isApproved ? "24.1%" : "32.5%", status: "PASS" },
    { cat: "Affordability", rule: "Stress test (SVR + 3%)", threshold: "Pass", actual: isApproved ? "Pass (surplus £580)" : "Pass (surplus £310)", status: "PASS" },
    { cat: "Affordability", rule: "Income verification", threshold: "2 sources", actual: "3 sources", status: "PASS" },
    { cat: "Affordability", rule: "Minimum surplus after stress", threshold: "£0", actual: isApproved ? "£580" : "£310", status: "PASS" },
    { cat: "Collateral", rule: "Maximum LTV", threshold: "75%", actual: "70%", status: "PASS" },
    { cat: "Collateral", rule: "Minimum valuation confidence", threshold: "75%", actual: "85%", status: "PASS" },
    { cat: "Collateral", rule: "Property type accepted", threshold: "Standard", actual: "Standard", status: "PASS" },
    { cat: "Collateral", rule: "AVM vs Surveyor variance", threshold: "<15%", actual: "3.2%", status: "PASS" },
    { cat: "Product & Mandate", rule: "Within product LTV band", threshold: "Max 75%", actual: "70%", status: "PASS" },
    { cat: "Product & Mandate", rule: "Within mandate level", threshold: "L1 max £500k", actual: `£${(amount / 1000).toFixed(0)}k`, status: amount <= 500000 ? "PASS" : "WARNING", ...(amount > 500000 ? { warning: `Amount £${(amount / 1000).toFixed(0)}k exceeds L1 mandate — requires L2 Senior approval` } : {}) },
    { cat: "Product & Mandate", rule: "ERC disclosure", threshold: "Yes", actual: "Yes", status: "PASS" },
    { cat: "Documentation", rule: "All required documents", threshold: "6 required", actual: isDIP ? "4 provided" : "6 provided", status: isDIP ? "WARNING" : "PASS", ...(isDIP ? { warning: "DIP stage — remaining documents due at full application" } : {}) },
    { cat: "Documentation", rule: "KYC verification", threshold: "Complete", actual: isDIP ? "In progress" : "Complete", status: isDIP ? "WARNING" : "PASS", ...(isDIP ? { warning: "KYC verification in progress — expected completion within 48 hours" } : {}) },
  ];
}

function getRulesForCase(caseId) {
  if (RULES_BY_CASE[caseId]) return RULES_BY_CASE[caseId];
  const loan = MOCK_LOANS.find(l => l.id === caseId);
  if (loan) return generateDefaultRules(loan);
  return RULES_BY_CASE["AFN-2026-00142"];
}

const CAT_COLORS = {
  "Borrower Eligibility": { bg: "#EDE9FE", fg: "#5B21B6" },
  "Affordability": { bg: "#DBEAFE", fg: "#1E40AF" },
  "Collateral": { bg: "#D1FAE5", fg: "#065F46" },
  "Product & Mandate": { bg: "#FEF3C7", fg: "#92400E" },
  "Documentation": { bg: "#FFE4E6", fg: "#9F1239" },
};

function StatusBadge({ status }) {
  const map = {
    PASS: { bg: T.successBg, fg: T.success, icon: "check" },
    WARNING: { bg: T.warningBg, fg: "#92400E", icon: "alert" },
    FAIL: { bg: T.dangerBg, fg: T.danger, icon: "x" },
  };
  const s = map[status] || map.PASS;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg }}>
      {Ico[s.icon]?.(12)} {status}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function PolicyChecker() {
  const [selectedCase, setSelectedCase] = useState(MOCK_LOANS[0].id);
  const [expanded, setExpanded] = useState({});
  const [generated, setGenerated] = useState(false);

  const currentLoan = MOCK_LOANS.find(l => l.id === selectedCase) || MOCK_LOANS[0];
  const rules = getRulesForCase(selectedCase);

  const handleCaseChange = (val) => {
    setSelectedCase(val);
    setExpanded({});
    setGenerated(false);
  };

  const toggle = (i) => setExpanded((p) => ({ ...p, [i]: !p[i] }));

  const passed = rules.filter((r) => r.status === "PASS").length;
  const warnings = rules.filter((r) => r.status === "WARNING").length;
  const failed = rules.filter((r) => r.status === "FAIL").length;

  const hasFails = failed > 0;
  const summaryBg = hasFails ? T.dangerBg : T.successBg;
  const summaryBorder = hasFails ? T.dangerBorder : T.successBorder;
  const summaryColor = hasFails ? T.danger : T.success;
  const summaryIcon = hasFails ? Ico.alert(20) : Ico.check(20);
  const summaryTitle = hasFails ? "Policy Compliance Issues Detected" : "Policy Compliance Summary";
  const summaryText = hasFails
    ? `${passed} rules passed. ${warnings} warning(s). ${failed} failure(s) requiring exception requests. Case cannot proceed without resolution.`
    : `${passed} rules passed. ${warnings} warning(s) (non-blocking). ${failed} failures. No exceptions required. Case is policy-compliant for standard approval.`;

  const caseOptions = MOCK_LOANS.map(l => ({ value: l.id, label: `${l.id} — ${l.names}` }));

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 700 }}>
          {Ico.shield(22)} Policy Compliance Checker
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Real-time validation against lending policy
        </div>
      </div>

      {/* Case Selector */}
      <Card style={{ marginBottom: 24 }}>
        <Select
          label="Select Case"
          value={selectedCase}
          onChange={handleCaseChange}
          options={caseOptions}
        />
        <div style={{ fontSize: 12, color: T.textSecondary, fontWeight: 600, marginTop: -8 }}>
          {currentLoan.names} &middot; {currentLoan.amount} &middot; {currentLoan.product} &middot; {currentLoan.type}
        </div>
      </Card>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Rules Checked" value={rules.length} color={T.primary} />
        <KPICard label="Passed" value={passed} color={T.success} />
        <KPICard label="Warnings" value={warnings} color={T.warning} />
        <KPICard label="Failed" value={failed} color={failed > 0 ? T.danger : T.success} />
        <KPICard label="Exceptions Active" value={0} color={T.textMuted} />
      </div>

      {/* Rules Table */}
      <Card noPad style={{ marginBottom: 24, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "160px 1fr 140px 140px 100px",
          padding: "12px 16px", background: "#F8FAFC", borderBottom: `1px solid ${T.border}`,
          fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4,
        }}>
          <div>Category</div><div>Rule</div><div>Threshold</div><div>Actual</div><div>Status</div>
        </div>

        {rules.map((r, i) => {
          const isWarning = r.status === "WARNING";
          const isFail = r.status === "FAIL";
          const rowBg = isFail ? T.dangerBg : isWarning ? T.warningBg : i % 2 === 0 ? "#fff" : "#FAFAFA";
          const cc = CAT_COLORS[r.cat] || { bg: "#E5E7EB", fg: "#374151" };
          const isFirstOfCat = i === 0 || rules[i - 1].cat !== r.cat;

          return (
            <div key={i}>
              <div
                onClick={() => (isWarning || isFail) && toggle(i)}
                style={{
                  display: "grid", gridTemplateColumns: "160px 1fr 140px 140px 100px",
                  padding: "10px 16px", background: rowBg,
                  borderBottom: `1px solid ${T.borderLight}`, alignItems: "center",
                  cursor: isWarning || isFail ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                <div>
                  {isFirstOfCat && (
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: cc.bg, color: cc.fg }}>
                      {r.cat}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{r.rule}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{r.threshold}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isFail ? T.danger : T.text }}>{r.actual}</div>
                <div><StatusBadge status={r.status} /></div>
              </div>

              {/* Expanded detail for warnings */}
              {isWarning && expanded[i] && (
                <div style={{ padding: "10px 16px 10px 180px", background: T.warningBg, borderBottom: `1px solid ${T.warningBorder}`, fontSize: 12, color: "#92400E" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {Ico.alert(14)} {r.warning}
                  </div>
                </div>
              )}

              {/* Expanded detail for failures */}
              {isFail && expanded[i] && (
                <div style={{ padding: "12px 16px 12px 180px", background: T.dangerBg, borderBottom: `1px solid ${T.dangerBorder}` }}>
                  <div style={{ fontSize: 12, color: T.danger, marginBottom: 8, lineHeight: 1.5 }}>
                    {Ico.x(14)} {r.warning || "This rule has failed. An exception request is required."}
                  </div>
                  <textarea
                    placeholder="Mandatory justification for exception request..."
                    style={{
                      width: "100%", minHeight: 60, padding: 10, borderRadius: 8,
                      border: `1px solid ${T.dangerBorder}`, fontSize: 12, fontFamily: T.font,
                      resize: "vertical", marginBottom: 8,
                    }}
                  />
                  <Btn small danger icon="alert">Request Exception</Btn>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      {/* Summary */}
      <Card style={{ marginBottom: 24, background: summaryBg, border: `1px solid ${summaryBorder}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ color: summaryColor, flexShrink: 0, marginTop: 2 }}>{summaryIcon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: summaryColor, marginBottom: 4 }}>{summaryTitle}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>{summaryText}</div>
          </div>
        </div>
      </Card>

      {/* Generate Report */}
      <Btn primary icon="file" onClick={() => setGenerated(true)}>
        Generate Policy Report
      </Btn>
      {generated && (
        <div style={{ marginTop: 12, fontSize: 12, color: T.success, fontWeight: 600 }}>
          {Ico.check(14)} Policy compliance report generated and attached to case file.
        </div>
      )}
    </div>
  );
}
