import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const CURRENT_CASE = {
  ltv: "72%", incomeMultiple: "5.0x", propertyType: "Semi-detached",
  employment: "Employed", loanAmount: "\u00a3350,000",
};

const MOCK_CASES = [
  {
    id: "AFN-2024-01187", customer: "Borrower A", date: "14 Nov 2024",
    similarity: 94, ltv: "71%", income: "4.8x", property: "Semi-detached",
    employment: "Employed", amount: "\u00a3340,000",
    decision: "Approved", decider: "L1 Underwriter",
    performance: "18 months performing, no issues", perfColor: "green",
  },
  {
    id: "AFN-2024-01302", customer: "Borrower B", date: "03 Jan 2025",
    similarity: 91, ltv: "74%", income: "5.1x", property: "Semi-detached",
    employment: "Employed", amount: "\u00a3380,000",
    decision: "Approved", decider: "L1 Underwriter",
    performance: "12 months performing", perfColor: "green",
  },
  {
    id: "AFN-2025-00034", customer: "Borrower C", date: "18 Mar 2025",
    similarity: 88, ltv: "78%", income: "4.5x", property: "Terrace",
    employment: "Employed", amount: "\u00a3310,000",
    decision: "Approved", decider: "L2 Senior",
    performance: "9 months, 1 late payment month 6, now current", perfColor: "amber",
  },
  {
    id: "AFN-2025-00219", customer: "Borrower D", date: "07 Jun 2025",
    similarity: 82, ltv: "72%", income: "5.2x", property: "Semi-detached",
    employment: "Self-employed", amount: "\u00a3360,000",
    decision: "Declined", decider: "L1 Underwriter",
    performance: "N/A \u2014 declined (self-employed, 1yr accounts)", perfColor: "grey",
  },
  {
    id: "AFN-2025-00478", customer: "Borrower E", date: "22 Sep 2025",
    similarity: 76, ltv: "85%", income: "4.0x", property: "Flat",
    employment: "Employed", amount: "\u00a3420,000",
    decision: "Approved", decider: "L2 Senior",
    performance: "6 months, in arrears \u00a31,200", perfColor: "red",
  },
];

const AI_INSIGHT =
  "4 of 5 similar cases were approved. Of those, 3 are performing well. Case 5 (highest LTV at 85%) is in arrears \u2014 current case has lower LTV (72%) which is a favourable differentiator. The declined case was self-employed with only 1 year\u2019s accounts \u2014 not applicable here.";

function matchColor(caseVal, currentVal) {
  if (caseVal === currentVal) return T.success;
  return T.warning;
}

function SimilarityBar({ pct }) {
  const color =
    pct >= 90 ? T.success : pct >= 80 ? T.warning : T.danger;
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
    <div style={{ textAlign: "center", padding: "6px 8px" }}>
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

export default function ComparisonEngine() {
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [precedents, setPrecedents] = useState([]);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSearched(true); }, 1000);
  };

  const addPrecedent = (c) => {
    if (!precedents.includes(c.id)) setPrecedents([...precedents, c.id]);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 700 }}>
          {Ico.search(22)} Case Comparison Engine
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Find similar historical cases and their outcomes
        </div>
      </div>

      {/* Search Panel */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: T.textSecondary }}>Current Case Parameters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "LTV", value: CURRENT_CASE.ltv },
            { label: "Income Multiple", value: CURRENT_CASE.incomeMultiple },
            { label: "Property Type", value: CURRENT_CASE.propertyType },
            { label: "Employment", value: CURRENT_CASE.employment },
            { label: "Loan Amount", value: CURRENT_CASE.loanAmount },
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
            {MOCK_CASES.length} similar cases found
          </div>

          {MOCK_CASES.map((c) => (
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
                <ParamCell label="LTV" value={c.ltv} isMatch={c.ltv === CURRENT_CASE.ltv || Math.abs(parseFloat(c.ltv) - parseFloat(CURRENT_CASE.ltv)) <= 3} />
                <ParamCell label="Income Multiple" value={c.income} isMatch={Math.abs(parseFloat(c.income) - parseFloat(CURRENT_CASE.incomeMultiple)) <= 0.3} />
                <ParamCell label="Property Type" value={c.property} isMatch={c.property === "Semi-detached"} />
                <ParamCell label="Employment" value={c.employment} isMatch={c.employment === "Employed"} />
                <ParamCell label="Amount" value={c.amount} isMatch={Math.abs(parseInt(c.amount.replace(/[^\d]/g, "")) - 350000) <= 30000} />
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
                <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>{AI_INSIGHT}</div>
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
