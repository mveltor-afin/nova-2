import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

const allProducts = [
  { name: "Afin Fix 2yr 75%", rate: "4.49%", maxLtv: 75, employReq: "any" },
  { name: "Afin Fix 5yr 75%", rate: "4.29%", maxLtv: 75, employReq: "any" },
  { name: "Afin Fix 2yr 85%", rate: "4.89%", maxLtv: 85, employReq: "any" },
  { name: "Afin Fix 5yr 85%", rate: "4.69%", maxLtv: 85, employReq: "any" },
  { name: "Afin Tracker 75%", rate: "4.19%", maxLtv: 75, employReq: "any" },
  { name: "Afin Tracker 90%", rate: "5.29%", maxLtv: 90, employReq: "employed" },
  { name: "Afin BTL Fix 2yr", rate: "5.49%", maxLtv: 75, employReq: "any" },
  { name: "Afin Green Fix 5yr", rate: "4.09%", maxLtv: 75, employReq: "any" },
];

const faqs = [
  { q: "What's the max LTV for BTL?", a: "75% for standard BTL, 65% for holiday let." },
  { q: "Do you accept self-employed with 1 year's accounts?", a: "No, minimum 2 years SA302/tax returns required." },
  { q: "What's the minimum income?", a: "No minimum income, but affordability must pass stress test at 7.49%." },
  { q: "Do you accept non-standard construction?", a: "Case by case. Concrete, timber frame accepted. Prefab and single-skin excluded." },
  { q: "What's the maximum age at end of term?", a: "75 years, or retirement age if earlier, unless retirement income evidenced." },
];

const employmentOptions = [
  { value: "", label: "Select..." },
  "Employed", "Self-Employed", "Contract", "Retired", "Multiple",
];

function CriteriaQuickCheck() {
  const [propValue, setPropValue] = useState("485000");
  const [deposit, setDeposit] = useState("135000");
  const [employment, setEmployment] = useState("Employed");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const pv = parseFloat(propValue) || 0;
  const dep = parseFloat(deposit) || 0;
  const ltv = pv > 0 ? Math.round(((pv - dep) / pv) * 100) : 0;

  const handleCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setChecked(true);
    }, 500);
  };

  const ltvColor = ltv > 90 ? T.danger : ltv > 80 ? T.warning : ltv > 60 ? T.accent : T.success;
  const ltvBg = ltv > 90 ? T.dangerBg : ltv > 80 ? T.warningBg : T.successBg;

  return (
    <div style={{ fontFamily: T.font, color: T.text, maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {Ico.sparkle(24)}
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Criteria Quick Check</h1>
      </div>
      <p style={{ fontSize: 14, color: T.textMuted, margin: "0 0 28px 34px" }}>Instantly check if a scenario fits our lending criteria — no enquiry created</p>

      {/* Form */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Input label="Property Value" value={propValue} onChange={setPropValue} prefix="£" type="number" required />
          <Input label="Deposit" value={deposit} onChange={setDeposit} prefix="£" type="number" required />
          <Select label="Employment Type" value={employment} onChange={setEmployment} options={employmentOptions} required />
        </div>

        {/* Live LTV */}
        {pv > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, background: ltvBg, marginBottom: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: ltvColor }}>{ltv}%</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: ltvColor }}>Loan to Value</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Loan amount: £{(pv - dep).toLocaleString()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, borderRadius: 4, background: T.borderLight, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(ltv, 100)}%`, height: "100%", borderRadius: 4, background: ltvColor, transition: "width 0.3s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 3 }}>
                <span>0%</span><span>50%</span><span>75%</span><span>90%</span><span>100%</span>
              </div>
            </div>
          </div>
        )}

        <Btn primary onClick={handleCheck} disabled={loading || !pv || !dep || !employment} icon="search">
          {loading ? "Checking..." : "Check Now"}
        </Btn>
      </Card>

      {/* Loading */}
      {loading && (
        <Card style={{ textAlign: "center", padding: 32, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>{Ico.sparkle(20)} Checking criteria...</div>
        </Card>
      )}

      {/* Results */}
      {checked && !loading && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Product Matches</div>

          {/* Product grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {allProducts.map(p => {
              const eligible = ltv <= p.maxLtv && (p.employReq === "any" || (p.employReq === "employed" && employment === "Employed"));
              return (
                <div key={p.name} style={{
                  padding: "14px 18px", borderRadius: 10,
                  border: `1px solid ${eligible ? T.successBorder : T.borderLight}`,
                  background: eligible ? T.successBg : "#FAFAFA",
                  opacity: eligible ? 1 : 0.6,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: eligible ? T.text : T.textMuted }}>{p.name}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      background: eligible ? T.successBg : T.dangerBg,
                      color: eligible ? T.success : T.danger,
                      border: `1px solid ${eligible ? T.successBorder : T.dangerBorder}`,
                    }}>{eligible ? "Eligible" : "No"}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>
                    Rate: <strong>{p.rate}</strong> &middot; Max LTV: {p.maxLtv}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* LTV indicator with colour band */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>LTV Indicator</div>
            <div style={{ height: 16, borderRadius: 8, overflow: "hidden", display: "flex", position: "relative" }}>
              <div style={{ flex: 60, background: T.success }} />
              <div style={{ flex: 15, background: T.accent }} />
              <div style={{ flex: 10, background: T.warning }} />
              <div style={{ flex: 5, background: "#FF9800" }} />
              <div style={{ flex: 10, background: T.danger }} />
              <div style={{ position: "absolute", left: `${Math.min(ltv, 100)}%`, top: -4, transform: "translateX(-50%)" }}>
                <div style={{ width: 3, height: 24, background: T.text, borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 3 }}>
              <span>0%</span><span>60%</span><span>75%</span><span>85%</span><span>90%</span><span>100%</span>
            </div>
          </div>

          {/* AI one-liner */}
          <div style={{ padding: "14px 18px", borderRadius: 10, background: T.primaryLight, border: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
            {Ico.bot(18)}
            <div style={{ fontSize: 13, lineHeight: 1.5, color: T.text }}>
              At {ltv}% LTV with {employment.toLowerCase()} income, {allProducts.filter(p => ltv <= p.maxLtv && (p.employReq === "any" || (p.employReq === "employed" && employment === "Employed"))).length} of {allProducts.length} products are available.
              {ltv <= 75 ? " All standard residential products are available." : ltv <= 85 ? " Higher LTV products apply — consider increasing deposit for better rates." : ltv <= 90 ? " Limited to high-LTV products. Rates will be higher." : " LTV exceeds maximum — no products available at this level."}
            </div>
          </div>

          {/* Create Full Enquiry button */}
          <Btn primary icon="arrow">Create Full Enquiry →</Btn>
        </Card>
      )}

      {/* FAQ Section */}
      <Card>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Frequently Asked Questions</div>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
            <div
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", cursor: "pointer" }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{faq.q}</span>
              <span style={{ color: T.textMuted, transform: openFaq === i ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>{Ico.arrow(14)}</span>
            </div>
            {openFaq === i && (
              <div style={{ padding: "0 0 14px", fontSize: 13, lineHeight: 1.6, color: T.textSecondary }}>{faq.a}</div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

export default CriteriaQuickCheck;
