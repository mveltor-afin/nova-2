import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Select } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

// ─────────────────────────────────────────────
// CASE-SPECIFIC DATA
// ─────────────────────────────────────────────
const CASE_PARAMS = {
  "AFN-2026-00142": {
    ltv: "72%", incomeMultiple: "5.0x", propertyType: "Semi-detached",
    employment: "Employed", loanAmount: "£350,000",
  },
  "AFN-2026-00139": {
    ltv: "68%", incomeMultiple: "4.6x", propertyType: "Detached",
    employment: "Employed", loanAmount: "£275,000",
  },
  "AFN-2026-00135": {
    ltv: "90%", incomeMultiple: "3.0x", propertyType: "Flat",
    employment: "Employed", loanAmount: "£425,000",
  },
  "AFN-2026-00128": {
    ltv: "65%", incomeMultiple: "4.2x", propertyType: "Terrace",
    employment: "Employed", loanAmount: "£290,000",
  },
  "AFN-2026-00125": {
    ltv: "70%", incomeMultiple: "3.8x", propertyType: "Detached",
    employment: "Employed", loanAmount: "£510,000",
  },
  "AFN-2026-00119": {
    ltv: "60%", incomeMultiple: "2.8x", propertyType: "Terrace",
    employment: "Self-employed", loanAmount: "£180,000",
  },
  "AFN-2026-00115": {
    ltv: "90%", incomeMultiple: "4.5x", propertyType: "Semi-detached",
    employment: "Employed", loanAmount: "£320,000",
  },
};

const COMPARISON_DATA = {
  "AFN-2026-00142": {
    cases: [
      { id: "AFN-2024-01187", customer: "Borrower A", date: "14 Nov 2024", similarity: 94, ltv: "71%", income: "4.8x", property: "Semi-detached", employment: "Employed", amount: "£340,000", decision: "Approved", decider: "L1 Underwriter", performance: "18 months performing, no issues", perfColor: "green" },
      { id: "AFN-2024-01302", customer: "Borrower B", date: "03 Jan 2025", similarity: 91, ltv: "74%", income: "5.1x", property: "Semi-detached", employment: "Employed", amount: "£380,000", decision: "Approved", decider: "L1 Underwriter", performance: "12 months performing", perfColor: "green" },
      { id: "AFN-2025-00034", customer: "Borrower C", date: "18 Mar 2025", similarity: 88, ltv: "78%", income: "4.5x", property: "Terrace", employment: "Employed", amount: "£310,000", decision: "Approved", decider: "L2 Senior", performance: "9 months, 1 late payment month 6, now current", perfColor: "amber" },
      { id: "AFN-2025-00219", customer: "Borrower D", date: "07 Jun 2025", similarity: 82, ltv: "72%", income: "5.2x", property: "Semi-detached", employment: "Self-employed", amount: "£360,000", decision: "Declined", decider: "L1 Underwriter", performance: "N/A — declined (self-employed, 1yr accounts)", perfColor: "grey" },
      { id: "AFN-2025-00478", customer: "Borrower E", date: "22 Sep 2025", similarity: 76, ltv: "85%", income: "4.0x", property: "Flat", employment: "Employed", amount: "£420,000", decision: "Approved", decider: "L2 Senior", performance: "6 months, in arrears £1,200", perfColor: "red" },
    ],
    insight: "4 of 5 similar cases were approved. Of those, 3 are performing well. Case 5 (highest LTV at 85%) is in arrears — current case has lower LTV (72%) which is a favourable differentiator. The declined case was self-employed with only 1 year's accounts — not applicable here.",
  },
  "AFN-2026-00119": {
    cases: [
      { id: "AFN-2024-00891", customer: "Borrower F", date: "22 Aug 2024", similarity: 92, ltv: "58%", income: "2.9x", property: "Terrace", employment: "Self-employed", amount: "£165,000", decision: "Approved", decider: "L2 Senior", performance: "20 months performing, no issues", perfColor: "green" },
      { id: "AFN-2024-01044", customer: "Borrower G", date: "05 Oct 2024", similarity: 87, ltv: "63%", income: "2.6x", property: "Semi-detached", employment: "Self-employed", amount: "£195,000", decision: "Declined", decider: "L1 Underwriter", performance: "N/A — declined (1yr accounts, variable income)", perfColor: "grey" },
      { id: "AFN-2025-00112", customer: "Borrower H", date: "28 Feb 2025", similarity: 84, ltv: "55%", income: "3.1x", property: "Terrace", employment: "Self-employed", amount: "£150,000", decision: "Declined", decider: "L2 Senior", performance: "N/A — declined (insufficient income evidence)", perfColor: "grey" },
      { id: "AFN-2025-00289", customer: "Borrower I", date: "19 May 2025", similarity: 79, ltv: "62%", income: "2.5x", property: "Flat", employment: "Self-employed", amount: "£175,000", decision: "Approved", decider: "L2 Senior", performance: "8 months, 2 late payments months 3 & 5", perfColor: "red" },
      { id: "AFN-2025-00401", customer: "Borrower J", date: "11 Aug 2025", similarity: 74, ltv: "65%", income: "3.0x", property: "Semi-detached", employment: "Self-employed", amount: "£210,000", decision: "Declined", decider: "L1 Underwriter", performance: "N/A — declined (DTI too high at stressed rate)", perfColor: "grey" },
    ],
    insight: "Only 2 of 5 similar self-employed cases were approved, and one of those is now showing payment difficulties. The 3 declined cases all had issues with income verification or affordability at stress. Hughes has only 1 year of accounts — matching the profile of declined Borrower G. Recommend: request 2 years SA302 or consider with conditions.",
  },
  "AFN-2026-00135": {
    cases: [
      { id: "AFN-2024-01198", customer: "Borrower K", date: "20 Nov 2024", similarity: 93, ltv: "89%", income: "2.9x", property: "Flat", employment: "Employed", amount: "£410,000", decision: "Approved", decider: "L2 Senior", performance: "16 months performing, IO payments current", perfColor: "green" },
      { id: "AFN-2025-00067", customer: "Borrower L", date: "12 Feb 2025", similarity: 89, ltv: "92%", income: "3.2x", property: "Flat", employment: "Employed", amount: "£450,000", decision: "Declined", decider: "L2 Senior", performance: "N/A — declined (LTV exceeded product max)", perfColor: "grey" },
      { id: "AFN-2025-00145", customer: "Borrower M", date: "01 Apr 2025", similarity: 85, ltv: "88%", income: "3.1x", property: "Semi-detached", employment: "Employed", amount: "£395,000", decision: "Approved", decider: "L2 Senior", performance: "11 months, IO repayment vehicle under review", perfColor: "amber" },
      { id: "AFN-2025-00312", customer: "Borrower N", date: "28 Jun 2025", similarity: 81, ltv: "91%", income: "2.7x", property: "Flat", employment: "Employed", amount: "£480,000", decision: "Approved", decider: "L3 Credit Committee", performance: "5 months, performing but endowment shortfall flagged", perfColor: "amber" },
      { id: "AFN-2025-00445", customer: "Borrower O", date: "15 Sep 2025", similarity: 77, ltv: "85%", income: "3.5x", property: "Detached", employment: "Employed", amount: "£520,000", decision: "Declined", decider: "L2 Senior", performance: "N/A — declined (IO with no credible repayment vehicle)", perfColor: "grey" },
    ],
    insight: "3 of 5 high-LTV IO cases were approved but with elevated oversight. Both performing cases show emerging concerns (repayment vehicle adequacy). 2 declines were due to LTV exceeding product limits and inadequate repayment vehicles. Chen's 90% LTV requires the 90% product tier. Recommend: verify repayment vehicle robustness and consider annual review condition.",
  },
};

// Generate default comparison data for cases without specific mock data
function getComparisonData(caseId) {
  if (COMPARISON_DATA[caseId]) return COMPARISON_DATA[caseId];
  const loan = MOCK_LOANS.find(l => l.id === caseId);
  const params = CASE_PARAMS[caseId] || { ltv: "70%", incomeMultiple: "4.0x", propertyType: "Semi-detached", employment: "Employed", loanAmount: loan?.amount || "£300,000" };
  return {
    cases: [
      { id: "AFN-2024-01100", customer: "Comparable A", date: "10 Oct 2024", similarity: 90, ltv: params.ltv, income: params.incomeMultiple, property: params.propertyType, employment: params.employment, amount: params.loanAmount, decision: "Approved", decider: "L1 Underwriter", performance: "14 months performing", perfColor: "green" },
      { id: "AFN-2025-00050", customer: "Comparable B", date: "01 Feb 2025", similarity: 85, ltv: String(parseInt(params.ltv) + 3) + "%", income: "4.2x", property: params.propertyType, employment: params.employment, amount: params.loanAmount, decision: "Approved", decider: "L1 Underwriter", performance: "10 months performing", perfColor: "green" },
      { id: "AFN-2025-00200", customer: "Comparable C", date: "15 Apr 2025", similarity: 80, ltv: String(parseInt(params.ltv) - 2) + "%", income: "3.8x", property: "Terrace", employment: params.employment, amount: params.loanAmount, decision: "Approved", decider: "L2 Senior", performance: "7 months performing", perfColor: "green" },
      { id: "AFN-2025-00350", customer: "Comparable D", date: "20 Jul 2025", similarity: 75, ltv: String(parseInt(params.ltv) + 8) + "%", income: "3.5x", property: "Flat", employment: params.employment, amount: params.loanAmount, decision: "Approved", decider: "L2 Senior", performance: "4 months, 1 late payment", perfColor: "amber" },
      { id: "AFN-2025-00500", customer: "Comparable E", date: "10 Oct 2025", similarity: 70, ltv: String(parseInt(params.ltv) + 15) + "%", income: "3.0x", property: "Flat", employment: "Self-employed", amount: params.loanAmount, decision: "Declined", decider: "L1 Underwriter", performance: "N/A — declined", perfColor: "grey" },
    ],
    insight: `4 of 5 comparable cases were approved with generally good performance. The case profile for ${loan?.names || "this applicant"} aligns well with approved precedents. One decline was due to self-employment with insufficient documentation.`,
  };
}

function getCaseParams(caseId) {
  if (CASE_PARAMS[caseId]) return CASE_PARAMS[caseId];
  const loan = MOCK_LOANS.find(l => l.id === caseId);
  return { ltv: "70%", incomeMultiple: "4.0x", propertyType: "Semi-detached", employment: "Employed", loanAmount: loan?.amount || "£300,000" };
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────

function SimilarityBar({ pct }) {
  const color = pct >= 90 ? T.success : pct >= 80 ? T.warning : T.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.borderLight }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}dd)` }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
    </div>
  );
}

function ParamCell({ label, value, isMatch }) {
  return (
    <div style={{ textAlign: "center", padding: "6px 8px", background: "#fff" }}>
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{value}</div>
      <div style={{ marginTop: 3, color: isMatch ? T.success : T.warning }}>
        {isMatch ? Ico.check(14) : Ico.alert(14)}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }) {
  const isApproved = decision === "Approved";
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: isApproved ? T.successBg : T.dangerBg,
      color: isApproved ? T.success : T.danger,
    }}>
      {decision}
    </span>
  );
}

function PerfBadge({ text, color }) {
  const map = {
    green: { bg: T.successBg, fg: T.success },
    amber: { bg: T.warningBg, fg: "#92400E" },
    red: { bg: T.dangerBg, fg: T.danger },
    grey: { bg: "#F1F5F9", fg: "#64748B" },
  };
  const c = map[color] || map.grey;
  return (
    <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, background: c.bg, color: c.fg, fontWeight: 500, marginTop: 8 }}>
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function ComparisonEngine({ loan }) {
  const selectedCase = loan?.id || MOCK_LOANS[0].id;
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [precedents, setPrecedents] = useState([]);

  const currentLoan = loan || MOCK_LOANS[0];
  const currentParams = getCaseParams(selectedCase);
  const comparisonData = getComparisonData(selectedCase);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSearched(true); }, 1000);
  };

  const addPrecedent = (c) => {
    if (!precedents.includes(c.id)) setPrecedents([...precedents, c.id]);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Search Panel */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: T.textSecondary }}>Current Case Parameters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "LTV", value: currentParams.ltv },
            { label: "Income Multiple", value: currentParams.incomeMultiple },
            { label: "Property Type", value: currentParams.propertyType },
            { label: "Employment", value: currentParams.employment },
            { label: "Loan Amount", value: currentParams.loanAmount },
          ].map((p) => (
            <div key={p.label} style={{ background: T.primaryLight, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3, textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.4 }}>{p.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{p.value}</div>
            </div>
          ))}
        </div>
        <Btn primary onClick={handleSearch} icon="search" disabled={loading}>
          {loading ? "Searching..." : "Find Similar Cases"}
        </Btn>
      </Card>

      {/* Results */}
      {searched && (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: T.textSecondary }}>
            {comparisonData.cases.length} similar cases found
          </div>

          {comparisonData.cases.map((c) => (
            <Card key={c.id} style={{ marginBottom: 16 }}>
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{c.id}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{c.customer} &middot; Decision: {c.date}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <DecisionBadge decision={c.decision} />
                  <span style={{ fontSize: 11, color: T.textMuted }}>{c.decider}</span>
                </div>
              </div>

              {/* Similarity bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>Similarity Score</div>
                <SimilarityBar pct={c.similarity} />
              </div>

              {/* Parameter comparison grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1,
                background: T.borderLight, borderRadius: 8, overflow: "hidden", marginBottom: 12,
              }}>
                <ParamCell label="LTV" value={c.ltv} isMatch={Math.abs(parseFloat(c.ltv) - parseFloat(currentParams.ltv)) <= 3} />
                <ParamCell label="Income Multiple" value={c.income} isMatch={Math.abs(parseFloat(c.income) - parseFloat(currentParams.incomeMultiple)) <= 0.3} />
                <ParamCell label="Property Type" value={c.property} isMatch={c.property === currentParams.propertyType} />
                <ParamCell label="Employment" value={c.employment} isMatch={c.employment === currentParams.employment} />
                <ParamCell label="Amount" value={c.amount} isMatch={Math.abs(parseInt(c.amount.replace(/[^\d]/g, "")) - parseInt(currentParams.loanAmount.replace(/[^\d]/g, ""))) <= 30000} />
              </div>

              {/* Performance */}
              <PerfBadge text={`Post-completion: ${c.performance}`} color={c.perfColor} />

              {/* Precedent button (approved only) */}
              {c.decision === "Approved" && (
                <div style={{ marginTop: 12 }}>
                  <Btn small onClick={() => addPrecedent(c)} disabled={precedents.includes(c.id)} icon="check">
                    {precedents.includes(c.id) ? `Added ${c.id} as Precedent` : "Use as Precedent"}
                  </Btn>
                </div>
              )}
            </Card>
          ))}

          {/* AI Insight */}
          <Card style={{ marginBottom: 24, background: T.primaryLight, border: `1px solid ${T.primary}22` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ color: T.primary, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(20)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 6 }}>AI Insight</div>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>{comparisonData.insight}</div>
              </div>
            </div>
          </Card>

          {/* Precedent summary */}
          {precedents.length > 0 && (
            <Card style={{ background: T.successBg, border: `1px solid ${T.successBorder}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.success }}>
                {Ico.check(16)} {precedents.length} precedent{precedents.length > 1 ? "s" : ""} added to decision notes: {precedents.join(", ")}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
