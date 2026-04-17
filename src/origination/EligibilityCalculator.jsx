import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import FairValueAssessment from "../shared/FairValueAssessment";
import InlineHelp from "../shared/InlineHelp";
import { getEligibleProducts, getRateBreakdown, CREDIT_PROFILES, PRODUCTS_PRICING, calcMonthlyPayment } from "../data/pricing";

const fmt = (n) => n != null ? "£" + Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—";
const pct = (n) => n != null ? n.toFixed(1) + "%" : "—";

function EligibilityCalculator() {
  const [employment, setEmployment] = useState("Employed");
  const [creditProfile, setCreditProfile] = useState("clean");
  const [income, setIncome] = useState("70000");
  const [partnerIncome, setPartnerIncome] = useState("");
  const [propertyValue, setPropertyValue] = useState("485000");
  const [deposit, setDeposit] = useState("135000");
  const [term, setTerm] = useState("25");
  const [repaymentType, setRepaymentType] = useState("Capital & Interest");
  const [propertyType, setPropertyType] = useState("Residential");
  const [epcRating, setEpcRating] = useState("D");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const loanAmount = (Number(propertyValue) || 0) - (Number(deposit) || 0);
  const ltv = propertyValue ? (loanAmount / Number(propertyValue)) * 100 : 0;
  const totalIncome = (Number(income) || 0) + (Number(partnerIncome) || 0);
  const dti = totalIncome > 0 ? ((loanAmount / totalIncome) * 100 / Number(term || 25)).toFixed(1) : 0;

  // Auto-run on mount with pre-filled data
  useEffect(() => {
    handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = () => {
    setLoading(true);
    setShowResults(false);
    setExpandedProduct(null);
    setTimeout(() => {
      const eligible = getEligibleProducts({
        ltv, credit: creditProfile, employment, property: propertyType === "Residential" ? "Standard" : propertyType,
        epc: epcRating, loyalty: "New", purpose: propertyType === "BTL" ? "BTL" : "Purchase",
      });

      const matched = eligible.map(p => {
        const monthly = p.available ? calcMonthlyPayment(loanAmount, p.rate, Number(term)) : 0;
        const totalCost = monthly * Number(term) * 12;
        let status = p.available ? "eligible" : "ineligible";
        let reason = p.available ? "" : p.reason;

        if (p.available && employment === "Self-Employed" && ltv > (p.product?.maxLTV || 75) - 5) {
          status = "conditional";
          reason = "Self-employed: requires 2 years SA302 + accountant cert";
        } else if (p.available && employment === "Contractor" && ltv > 70) {
          status = "conditional";
          reason = "Contractor: 12-month contract history required";
        }

        return { name: p.product, rate: p.rate, monthly, totalCost, status, reason, breakdown: p.breakdown, maxLtv: p.product ? PRODUCTS_PRICING_MAX[p.product] : 75 };
      });

      setResults(matched);
      setLoading(false);
      setShowResults(true);
    }, 1200);
  };

  const PRODUCTS_PRICING_MAX = Object.fromEntries(
    Object.entries(PRODUCTS_PRICING).map(([k, v]) => [k, v.maxLTV])
  );

  const maxBorrowing = totalIncome * 4.5;
  const bestEligible = results?.filter((r) => r.status === "eligible").sort((a, b) => a.rate - b.rate)[0];

  const statusIcon = (s) => {
    if (s === "eligible") return <span style={{ color: T.success, fontWeight: 700 }}>&#10003;</span>;
    if (s === "conditional") return <span style={{ color: T.warning, fontWeight: 700 }}>&#9888;</span>;
    return <span style={{ color: T.danger, fontWeight: 700 }}>&#10007;</span>;
  };

  const statusColor = (s) => {
    if (s === "eligible") return { bg: T.successBg, border: T.successBorder, text: T.success };
    if (s === "conditional") return { bg: T.warningBg, border: T.warningBorder, text: T.warning };
    return { bg: T.dangerBg, border: T.dangerBorder, text: T.danger };
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {Ico.search(24)}
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Product Eligibility Calculator</h1>
        </div>
        <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>Instant product matching — check eligibility before starting an application</p>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Left: Inputs */}
        <Card style={{ flex: "0 0 50%", minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.file(18)} Applicant & Property Details
          </div>

          <Select label="Employment Status" value={employment} onChange={setEmployment} required
            options={["Employed", "Self-Employed", "Contract", "Retired"]} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input
              label={<>Gross Annual Income<InlineHelp text="Combined annual gross income from all employment sources, before tax. Include salary, bonuses, and regular commission." /></>}
              value={income} onChange={setIncome} prefix="£" required placeholder="0" />
            <Input
              label={<>Partner Income (optional)<InlineHelp text="A second applicant's gross annual income. Adding a partner can increase affordability but both incomes will be assessed." /></>}
              value={partnerIncome} onChange={setPartnerIncome} prefix="£" placeholder="0" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Input
              label={<>Property Value<InlineHelp text="The purchase price, or for remortgages the current market value. A surveyor's valuation may adjust this figure." /></>}
              value={propertyValue} onChange={setPropertyValue} prefix="£" required placeholder="0" />
            <Input
              label={<>Deposit Amount<InlineHelp text="The cash contribution toward the property. A larger deposit lowers the LTV and typically unlocks better rates." /></>}
              value={deposit} onChange={setDeposit} prefix="£" required placeholder="0"
              suffix={propertyValue && deposit ? `LTV: ${pct(ltv)}` : undefined} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textMuted, marginBottom: 12, marginTop: -4 }}>
            About LTV<InlineHelp text="Loan to Value: the percentage of the property value being borrowed. Lower LTV means lower risk and usually better rates." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Select label="Loan Term (years)" value={term} onChange={setTerm} required
              options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 5), label: `${i + 5} years` }))} />
            <Select label="Repayment Type" value={repaymentType} onChange={setRepaymentType} required
              options={["Capital & Interest", "Interest Only", "Both"]} />
          </div>

          <Select label="Property Type" value={propertyType} onChange={setPropertyType} required
            options={["Residential", "BTL", "Holiday Let"]} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Select label="Credit Profile" value={creditProfile} onChange={setCreditProfile} required
              options={CREDIT_PROFILES.map(c => ({ value: c.id, label: `${c.label} — ${c.desc}` }))} />
            <Select label="EPC Rating" value={epcRating} onChange={setEpcRating} required
              options={["A", "B", "C", "D", "E", "F", "G"].map(r => ({ value: r, label: `EPC ${r}` }))} />
          </div>

          {/* Auto-calculated summary */}
          <div style={{ background: T.primaryLight, borderRadius: 10, padding: 16, marginBottom: 20, display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Loan Amount</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.primary }}>{fmt(loanAmount)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>LTV</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: ltv > 85 ? T.danger : ltv > 75 ? T.warning : T.primary }}>{pct(ltv)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>DTI Estimate</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.primary }}>{dti}%</div>
            </div>
          </div>

          <Btn primary onClick={handleCheck} style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center" }}
            icon="search" disabled={loading}>
            {loading ? "Checking Eligibility..." : "Check Eligibility"}
          </Btn>
        </Card>

        {/* Right: Results */}
        <div style={{ flex: "0 0 calc(50% - 28px)", minWidth: 0 }}>
          {loading && (
            <Card style={{ textAlign: "center", padding: 64 }}>
              <div style={{ fontSize: 32, marginBottom: 16, animation: "spin 1.5s linear infinite" }}>{Ico.sparkle(32)}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.primary }}>Matching products...</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Checking eligibility across all product lines</div>
            </Card>
          )}

          {showResults && results && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Summary KPIs */}
              <div style={{ display: "flex", gap: 12 }}>
                <KPICard label="Loan Amount" value={fmt(loanAmount)} color={T.primary} />
                <KPICard label="LTV" value={pct(ltv)} color={ltv > 80 ? T.warning : T.success} />
                <KPICard label="Products Matched" value={`${results.filter((r) => r.status !== "ineligible").length}/${results.length}`} color={T.accent} />
              </div>

              {/* Product matches */}
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Product Matches</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {results.map((p, i) => {
                    const sc = statusColor(p.status);
                    return (
                      <div key={i} style={{ border: `1px solid ${sc.border}`, borderRadius: 10, padding: 14, background: sc.bg }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {statusIcon(p.status)}
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: sc.text, textTransform: "capitalize" }}>{p.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: 20, fontSize: 12, color: T.textSecondary, marginBottom: p.reason ? 6 : 0 }}>
                          <span>Rate: <strong>{p.rate}%</strong></span>
                          <span>Monthly: <strong>{fmt(Math.round(p.monthly))}</strong></span>
                          <span>Max LTV: <strong>{p.maxLtv}%</strong></span>
                        </div>
                        {p.reason && <div style={{ fontSize: 11, color: sc.text, marginTop: 4 }}>{p.reason}</div>}
                        {p.status === "eligible" && (
                          <Btn primary small style={{ marginTop: 8 }} icon="arrow">Start Application</Btn>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Fair Value Assessment */}
              {bestEligible && (
                <FairValueAssessment
                  product={bestEligible.name}
                  rate={`${bestEligible.rate.toFixed(2)}%`}
                  amount={fmt(loanAmount)}
                />
              )}

              {/* AI Insight */}
              <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))", border: `1px solid ${T.primaryGlow}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {Ico.sparkle(18)}
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>Nova AI Insight</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>
                  Based on {fmt(totalIncome)} combined income, max borrowing is approximately {fmt(Math.round(maxBorrowing))} at 4.5x income multiple.
                  At {pct(ltv)} LTV, {results.filter((r) => r.status === "eligible").length} standard {propertyType.toLowerCase()} products are available.
                  {bestEligible && ` Recommend: ${bestEligible.name} — best rate for this profile at ${bestEligible.rate}% fixed.`}
                </p>
              </Card>

              {/* Comparison Table */}
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Comparison Table</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                        {["Product", "Rate", "Monthly", "Total Cost Over Term", "ERC"].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: T.textSecondary, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.filter((r) => r.status !== "ineligible").map((p, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600 }}>{p.name}</td>
                          <td style={{ padding: "8px 10px" }}>{p.rate}%</td>
                          <td style={{ padding: "8px 10px" }}>{fmt(Math.round(p.monthly))}</td>
                          <td style={{ padding: "8px 10px" }}>{fmt(Math.round(p.totalCost))}</td>
                          <td style={{ padding: "8px 10px", fontSize: 11 }}>{p.erc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <Btn primary icon="download">Save Quote</Btn>
                <Btn icon="send">Email to Client</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EligibilityCalculator;
