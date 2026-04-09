import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const RULES = [
  // Borrower Eligibility
  { cat: "Borrower Eligibility", rule: "Minimum age", threshold: "18", actual: "38", status: "PASS" },
  { cat: "Borrower Eligibility", rule: "Maximum age at end of term", threshold: "75", actual: "63", status: "PASS" },
  { cat: "Borrower Eligibility", rule: "UK residency", threshold: "Yes", actual: "Yes", status: "PASS" },
  { cat: "Borrower Eligibility", rule: "Employment minimum tenure", threshold: "6 months", actual: "7 years", status: "PASS" },
  { cat: "Borrower Eligibility", rule: "Credit score minimum", threshold: "600", actual: "742", status: "PASS" },
  // Affordability
  { cat: "Affordability", rule: "DTI maximum", threshold: "45%", actual: "18.2%", status: "PASS" },
  { cat: "Affordability", rule: "Stress test (SVR + 3%)", threshold: "Pass", actual: "Pass (surplus \u00a3710)", status: "PASS" },
  { cat: "Affordability", rule: "Income verification", threshold: "2 sources", actual: "4 sources", status: "PASS" },
  { cat: "Affordability", rule: "Minimum surplus after stress", threshold: "\u00a30", actual: "\u00a3710", status: "PASS" },
  // Collateral
  { cat: "Collateral", rule: "Maximum LTV", threshold: "75%", actual: "72%", status: "PASS" },
  { cat: "Collateral", rule: "Minimum valuation confidence", threshold: "75%", actual: "87%", status: "PASS" },
  { cat: "Collateral", rule: "Property type accepted", threshold: "Standard", actual: "Standard", status: "PASS" },
  { cat: "Collateral", rule: "AVM vs Surveyor variance", threshold: "<15%", actual: "2.1%", status: "PASS" },
  // Product & Mandate
  { cat: "Product & Mandate", rule: "Within product LTV band", threshold: "Max 75%", actual: "72%", status: "PASS" },
  { cat: "Product & Mandate", rule: "Within mandate level", threshold: "L1 max \u00a3500k", actual: "\u00a3350k", status: "PASS" },
  { cat: "Product & Mandate", rule: "ERC disclosure", threshold: "Yes", actual: "Yes", status: "PASS" },
  // Documentation
  { cat: "Documentation", rule: "All required documents", threshold: "6 required", actual: "6 provided", status: "WARNING",
    warning: "P60 shows \u00a32,500 variance from declared income" },
  { cat: "Documentation", rule: "KYC verification", threshold: "Complete", actual: "Complete", status: "WARNING",
    warning: "Utility bill older than 3 months \u2014 supplemented with bank statement" },
];

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

export default function PolicyChecker() {
  const [expanded, setExpanded] = useState({});
  const [generated, setGenerated] = useState(false);

  const toggle = (i) => setExpanded((p) => ({ ...p, [i]: !p[i] }));

  const passed = RULES.filter((r) => r.status === "PASS").length;
  const warnings = RULES.filter((r) => r.status === "WARNING").length;
  const failed = RULES.filter((r) => r.status === "FAIL").length;

  // Group rules by category
  const categories = [];
  let lastCat = "";
  RULES.forEach((r, i) => {
    if (r.cat !== lastCat) { categories.push({ cat: r.cat, start: i }); lastCat = r.cat; }
  });

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
        <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 8, fontWeight: 600 }}>
          Case: AFN-2026-00142 &mdash; James &amp; Sarah Mitchell
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Rules Checked" value={RULES.length} color={T.primary} />
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

        {RULES.map((r, i) => {
          const isWarning = r.status === "WARNING";
          const isFail = r.status === "FAIL";
          const rowBg = isWarning ? T.warningBg : isFail ? T.dangerBg : i % 2 === 0 ? "#fff" : "#FAFAFA";
          const cc = CAT_COLORS[r.cat] || { bg: "#E5E7EB", fg: "#374151" };
          const isFirstOfCat = i === 0 || RULES[i - 1].cat !== r.cat;

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
                <div style={{ fontSize: 12, fontWeight: 600 }}>{r.actual}</div>
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
                  <div style={{ fontSize: 12, color: T.danger, marginBottom: 8 }}>
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
      <Card style={{ marginBottom: 24, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ color: T.success, flexShrink: 0, marginTop: 2 }}>{Ico.check(20)}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.success, marginBottom: 4 }}>Policy Compliance Summary</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>
              {passed} rules passed. {warnings} warnings (non-blocking). {failed} failures. No exceptions required.
              Case is policy-compliant for standard approval.
            </div>
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
