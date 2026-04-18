import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import { getRate, LTV_ADJUSTMENTS, CREDIT_PROFILES as PRICING_CREDIT_PROFILES, EMPLOYMENT_ADJUSTMENTS, PROPERTY_ADJUSTMENTS, EPC_ADJUSTMENTS, LOYALTY_ADJUSTMENTS } from "../data/pricing";
import ProductBuckets from "./ProductBuckets";

// ─────────────────────────────────────────────
// PRODUCT TYPE CATALOGUE — drives the new product wizard
// ─────────────────────────────────────────────
const PRODUCT_TYPE_GROUPS = {
  "Lending": [
    "Fixed Rate Mortgage",
    "Tracker Mortgage",
    "Discount Mortgage",
    "Buy-to-Let Mortgage",
    "Shared Ownership Mortgage",
  ],
  "Savings": [
    "Easy Access Savings",
    "Notice Account",
    "Fixed Term Deposit",
    "Cash ISA",
    "Regular Saver",
  ],
  "Banking": [
    "Current Account",
  ],
  "Insurance": [
    "Life Insurance",
    "Buildings & Contents",
  ],
};

// Field definitions per product type. Each field: { name, label, type, options?, suffix?, placeholder? }
const PRODUCT_TYPE_FIELDS = {
  // ─── Lending ───
  "Fixed Rate Mortgage": [
    { name: "rate", label: "Initial Rate", type: "number", suffix: "%", placeholder: "4.49" },
    { name: "fixedTerm", label: "Fixed Period", type: "select", options: ["2 years","3 years","5 years","7 years","10 years"] },
    { name: "revertRate", label: "Reversion Rate (SVR)", type: "number", suffix: "%", placeholder: "7.99" },
    { name: "maxLTV", label: "Max LTV", type: "number", suffix: "%", placeholder: "75" },
    { name: "minLoan", label: "Min Loan", type: "number", suffix: "£", placeholder: "50000" },
    { name: "maxLoan", label: "Max Loan", type: "number", suffix: "£", placeholder: "1500000" },
    { name: "minTerm", label: "Min Term (years)", type: "number", placeholder: "5" },
    { name: "maxTerm", label: "Max Term (years)", type: "number", placeholder: "35" },
    { name: "erc", label: "ERC Schedule", type: "text", placeholder: "5/4/3/2/1%" },
    { name: "arrangementFee", label: "Arrangement Fee", type: "number", suffix: "£", placeholder: "999" },
    { name: "valuationFee", label: "Valuation Fee", type: "number", suffix: "£", placeholder: "250" },
    { name: "overpayments", label: "Overpayments Allowed", type: "select", options: ["10% pa","20% pa","Unlimited","None"] },
    { name: "portable", label: "Portable", type: "toggle" },
  ],
  "Tracker Mortgage": [
    { name: "rate", label: "Margin over Base", type: "number", suffix: "%", placeholder: "0.99" },
    { name: "trackPeriod", label: "Tracker Period", type: "select", options: ["2 years","Lifetime"] },
    { name: "maxLTV", label: "Max LTV", type: "number", suffix: "%", placeholder: "75" },
    { name: "minLoan", label: "Min Loan", type: "number", suffix: "£" },
    { name: "maxLoan", label: "Max Loan", type: "number", suffix: "£" },
    { name: "minTerm", label: "Min Term (years)", type: "number" },
    { name: "maxTerm", label: "Max Term (years)", type: "number" },
    { name: "erc", label: "ERC Schedule", type: "text", placeholder: "None" },
    { name: "arrangementFee", label: "Arrangement Fee", type: "number", suffix: "£" },
    { name: "overpayments", label: "Overpayments Allowed", type: "select", options: ["Unlimited","10% pa","None"] },
  ],
  "Discount Mortgage": [
    { name: "rate", label: "Discount off SVR", type: "number", suffix: "%", placeholder: "1.50" },
    { name: "period", label: "Discount Period", type: "select", options: ["2 years","3 years","5 years"] },
    { name: "maxLTV", label: "Max LTV", type: "number", suffix: "%" },
    { name: "minLoan", label: "Min Loan", type: "number", suffix: "£" },
    { name: "maxLoan", label: "Max Loan", type: "number", suffix: "£" },
    { name: "erc", label: "ERC Schedule", type: "text" },
  ],
  "Buy-to-Let Mortgage": [
    { name: "rate", label: "Initial Rate", type: "number", suffix: "%" },
    { name: "rateType", label: "Rate Type", type: "select", options: ["Fixed","Tracker"] },
    { name: "maxLTV", label: "Max LTV", type: "number", suffix: "%", placeholder: "75" },
    { name: "minRental", label: "Min Rental Cover (ICR)", type: "number", suffix: "%", placeholder: "145" },
    { name: "stressRate", label: "Stress Rate", type: "number", suffix: "%", placeholder: "5.50" },
    { name: "portfolioLandlord", label: "Portfolio Landlords", type: "toggle" },
    { name: "minLoan", label: "Min Loan", type: "number", suffix: "£" },
    { name: "maxLoan", label: "Max Loan", type: "number", suffix: "£" },
    { name: "erc", label: "ERC Schedule", type: "text" },
  ],
  "Shared Ownership Mortgage": [
    { name: "rate", label: "Initial Rate", type: "number", suffix: "%" },
    { name: "minShare", label: "Min Share", type: "number", suffix: "%", placeholder: "25" },
    { name: "maxShare", label: "Max Share", type: "number", suffix: "%", placeholder: "75" },
    { name: "maxLTVOnShare", label: "Max LTV (on share)", type: "number", suffix: "%", placeholder: "95" },
    { name: "staircaseAllowed", label: "Staircasing Allowed", type: "toggle" },
    { name: "rentInclusion", label: "Rent in Affordability", type: "toggle" },
  ],
  // ─── Savings ───
  "Easy Access Savings": [
    { name: "rate", label: "Headline AER", type: "number", suffix: "%", placeholder: "4.10" },
    { name: "minDeposit", label: "Min Opening Deposit", type: "number", suffix: "£", placeholder: "1" },
    { name: "maxDeposit", label: "Max Balance", type: "number", suffix: "£", placeholder: "500000" },
    { name: "interestPaid", label: "Interest Paid", type: "select", options: ["Monthly","Annually","On closure"] },
    { name: "withdrawalsPerYear", label: "Free Withdrawals / yr", type: "number", placeholder: "Unlimited" },
    { name: "tieredRates", label: "Tiered Rates", type: "toggle" },
    { name: "fscsCovered", label: "FSCS Covered (£85k)", type: "toggle" },
  ],
  "Notice Account": [
    { name: "noticePeriodDays", label: "Notice Period (days)", type: "number", placeholder: "90" },
    { name: "rate", label: "AER Gross", type: "number", suffix: "%", placeholder: "4.65" },
    { name: "minDeposit", label: "Min Deposit", type: "number", suffix: "£", placeholder: "1000" },
    { name: "maxDeposit", label: "Max Balance", type: "number", suffix: "£", placeholder: "1000000" },
    { name: "additionalDepositsAllowed", label: "Additional Deposits", type: "toggle" },
    { name: "partialWithdrawals", label: "Partial Withdrawals on Notice", type: "toggle" },
    { name: "earlyAccessPenalty", label: "Early Access Penalty", type: "text", placeholder: "Loss of interest equivalent to notice period" },
    { name: "interestPaid", label: "Interest Paid", type: "select", options: ["Monthly","Annually","On Maturity"] },
    { name: "fscsCovered", label: "FSCS Covered", type: "toggle" },
  ],
  "Fixed Term Deposit": [
    { name: "termMonths", label: "Term (months)", type: "number", placeholder: "12" },
    { name: "rate", label: "AER Gross", type: "number", suffix: "%", placeholder: "4.85" },
    { name: "minDeposit", label: "Min Deposit", type: "number", suffix: "£", placeholder: "5000" },
    { name: "maxDeposit", label: "Max Deposit", type: "number", suffix: "£", placeholder: "500000" },
    { name: "interestPaid", label: "Interest Paid", type: "select", options: ["Monthly","Annually","At Maturity"] },
    { name: "earlyWithdrawal", label: "Early Withdrawal Allowed", type: "toggle" },
    { name: "earlyWithdrawalPenalty", label: "Early Withdrawal Penalty", type: "text", placeholder: "180 days interest" },
    { name: "rolloverPolicy", label: "Maturity Rollover", type: "select", options: ["Auto-renew same term","Pay to nominated account","Customer choice"] },
    { name: "fscsCovered", label: "FSCS Covered", type: "toggle" },
  ],
  "Cash ISA": [
    { name: "isaType", label: "ISA Type", type: "select", options: ["Easy Access","Fixed Rate","Lifetime"] },
    { name: "rate", label: "AER Gross", type: "number", suffix: "%" },
    { name: "minDeposit", label: "Min Deposit", type: "number", suffix: "£" },
    { name: "annualAllowance", label: "Annual Allowance", type: "number", suffix: "£", placeholder: "20000" },
    { name: "transfersIn", label: "Transfers In Allowed", type: "toggle" },
    { name: "flexibleISA", label: "Flexible ISA", type: "toggle" },
  ],
  "Regular Saver": [
    { name: "rate", label: "AER Gross", type: "number", suffix: "%" },
    { name: "minMonthlyDeposit", label: "Min Monthly Deposit", type: "number", suffix: "£" },
    { name: "maxMonthlyDeposit", label: "Max Monthly Deposit", type: "number", suffix: "£" },
    { name: "termMonths", label: "Term (months)", type: "number", placeholder: "12" },
    { name: "missedDepositsAllowed", label: "Missed Deposits Allowed", type: "toggle" },
  ],
  // ─── Banking ───
  "Current Account": [
    { name: "monthlyFee", label: "Monthly Fee", type: "number", suffix: "£", placeholder: "0" },
    { name: "overdraftLimit", label: "Arranged Overdraft", type: "number", suffix: "£" },
    { name: "overdraftRate", label: "Overdraft EAR", type: "number", suffix: "%" },
    { name: "interestOnCredit", label: "Interest on Credit Balance", type: "number", suffix: "%" },
    { name: "switchingIncentive", label: "Switching Incentive", type: "number", suffix: "£" },
    { name: "rewards", label: "Rewards / Cashback", type: "text" },
    { name: "internationalUse", label: "Free International Use", type: "toggle" },
  ],
  // ─── Insurance ───
  "Life Insurance": [
    { name: "coverType", label: "Cover Type", type: "select", options: ["Level Term","Decreasing Term","Whole of Life"] },
    { name: "minSum", label: "Min Sum Assured", type: "number", suffix: "£" },
    { name: "maxSum", label: "Max Sum Assured", type: "number", suffix: "£" },
    { name: "minTerm", label: "Min Term (years)", type: "number" },
    { name: "maxTerm", label: "Max Term (years)", type: "number" },
    { name: "underwriter", label: "Underwriter / Provider", type: "text" },
    { name: "criticalIllnessOption", label: "Critical Illness Add-on", type: "toggle" },
  ],
  "Buildings & Contents": [
    { name: "coverType", label: "Cover Type", type: "select", options: ["Buildings","Contents","Combined"] },
    { name: "buildingsLimit", label: "Buildings Limit", type: "number", suffix: "£" },
    { name: "contentsLimit", label: "Contents Limit", type: "number", suffix: "£" },
    { name: "excess", label: "Standard Excess", type: "number", suffix: "£" },
    { name: "underwriter", label: "Underwriter / Provider", type: "text" },
  ],
};

// Common fields shown for every product
const COMMON_FIELDS = [
  { name: "code", label: "Product Code", type: "text", placeholder: "AFN-MTG-FX2-75" },
  { name: "eligibility", label: "Eligibility", type: "select", options: ["All","Professional only","HNW only","Existing customers","BTL only","Joint only"] },
  { name: "channel", label: "Distribution Channel", type: "select", options: ["Direct + Broker","Broker only","Direct only","Internal only"] },
  { name: "status", label: "Status", type: "select", options: ["Draft","Active","Withdrawn"] },
];

const COMPLIANCE_FIELDS = [
  { name: "targetMarket", label: "Target Market", type: "text", placeholder: "e.g. First-time buyers, employed, 25–45" },
  { name: "fairValueRating", label: "Fair Value Rating", type: "select", options: ["Excellent","Good","Acceptable","Needs Review"] },
  { name: "vulnerableSuitable", label: "Suitable for Vulnerable Customers", type: "toggle" },
  { name: "consumerDutyOutcome", label: "Consumer Duty Outcome", type: "select", options: ["Products & Services","Price & Value","Consumer Understanding","Consumer Support"] },
  { name: "kfiTemplate", label: "KFI Template", type: "select", options: ["Standard","Lending","Savings","Insurance"] },
];

// Legacy product arrays removed — all product data now managed via bucket system

// ─────────────────────────────────────────────
// Product Wizard — adapts to product type
// ─────────────────────────────────────────────
function ProductWizard({ onClose, onPublish }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Lending");
  const [productType, setProductType] = useState("Fixed Rate Mortgage");
  const [params, setParams] = useState({});
  const [common, setCommon] = useState({ status: "Draft", channel: "Direct + Broker", eligibility: "All", code: "" });
  const [compliance, setCompliance] = useState({ fairValueRating: "Good", consumerDutyOutcome: "Price & Value", kfiTemplate: "Standard" });
  const [tiers, setTiers] = useState([]);
  const [wizardDimensionsInfo, setWizardDimensionsInfo] = useState(false);

  // Dimension configuration for lending products
  const [acceptedCredits, setAcceptedCredits] = useState(
    PRICING_CREDIT_PROFILES.slice(0, 5).map(c => c.id) // default: Clean → Heavy Adverse
  );
  const [acceptedEmployments, setAcceptedEmployments] = useState(["Employed", "Self-Employed", "Contractor"]);
  const [acceptedProperties, setAcceptedProperties] = useState(["Standard", "New Build"]);
  const [excludedEpc, setExcludedEpc] = useState([]);

  const toggleCredit = (id) => setAcceptedCredits(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleEmployment = (id) => setAcceptedEmployments(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleProperty = (id) => setAcceptedProperties(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Per-product overrides — override platform defaults with custom values
  const [overrides, setOverrides] = useState({}); // { "Self-Employed": { adj: 0.10, comment: "Designed for contractors" } }
  const setOverride = (key, adj, comment) => setOverrides(prev => ({ ...prev, [key]: { adj: parseFloat(adj) || 0, comment } }));
  const removeOverride = (key) => setOverrides(prev => { const next = { ...prev }; delete next[key]; return next; });

  const isLendingCategory = category === "Lending";
  const addTier = () => {
    if (isLendingCategory) {
      setTiers(prev => [...prev, { ltvBand: "", rate: "", margin: "", status: "Active" }]);
    } else {
      setTiers(prev => [...prev, { balanceBand: "", rate: "", status: "Active" }]);
    }
  };
  const removeTier = (idx) => setTiers(prev => prev.filter((_, i) => i !== idx));
  const updateTier = (idx, key, val) => setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [key]: val } : t));

  const typeFields = PRODUCT_TYPE_FIELDS[productType] || [];
  const availableTypes = PRODUCT_TYPE_GROUPS[category] || [];

  const setParam = (k, v) => setParams(prev => ({ ...prev, [k]: v }));

  const renderField = (f, value, onChange) => {
    if (f.type === "toggle") {
      return (
        <div onClick={() => onChange(f.name, !value)} style={{
          display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
          padding: "8px 12px", borderRadius: 8, background: value ? T.successBg : T.bg,
          border: `1px solid ${value ? T.successBorder : T.border}`,
        }}>
          <div style={{ width: 32, height: 18, borderRadius: 9, background: value ? T.success : T.border, position: "relative", transition: "background 0.15s" }}>
            <div style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 14, height: 14, borderRadius: 7, background: "#fff", transition: "left 0.15s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: value ? T.success : T.textMuted }}>{value ? "Yes" : "No"}</span>
        </div>
      );
    }
    if (f.type === "select") {
      return (
        <select value={value || ""} onChange={e => onChange(f.name, e.target.value)} style={{
          width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13,
          fontFamily: T.font, background: T.card, color: T.text, outline: "none",
        }}>
          <option value="">Select…</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return (
      <div style={{ position: "relative" }}>
        {f.suffix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.textMuted, fontWeight: 600, pointerEvents: "none" }}>
          {f.suffix === "£" ? "£" : ""}
        </span>}
        <input key={`field-${f.name}`} id={`field-${f.name}`} type={f.type === "number" ? "number" : "text"}
          value={value || ""} placeholder={f.placeholder || ""}
          onChange={e => onChange(f.name, e.target.value)}
          style={{
            width: "100%", padding: f.suffix === "£" ? "9px 12px 9px 24px" : "9px 12px",
            border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13,
            fontFamily: T.font, background: T.card, color: T.text, outline: "none",
          }} />
        {f.suffix && f.suffix !== "£" && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.textMuted, fontWeight: 600, pointerEvents: "none" }}>
          {f.suffix}
        </span>}
      </div>
    );
  };

  const Field = ({ label, children }) => (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );

  const StepBar = () => (
    <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `1px solid ${T.border}` }}>
      {[
        { n: 1, label: "Basics" },
        { n: 2, label: "Product Parameters" },
        { n: 3, label: "Compliance & Disclosures" },
      ].map((s, i) => (
        <div key={s.n} onClick={() => setStep(s.n)} style={{
          flex: 1, padding: "12px 16px", textAlign: "center", cursor: "pointer", fontSize: 12, fontWeight: 600,
          color: step === s.n ? T.primary : T.textMuted,
          borderBottom: `2.5px solid ${step === s.n ? T.primary : "transparent"}`, marginBottom: -1,
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 11, marginRight: 8,
            background: step >= s.n ? T.primary : T.borderLight, color: step >= s.n ? "#fff" : T.textMuted,
            fontSize: 11, fontWeight: 800,
          }}>{s.n}</span>
          {s.label}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: T.card, borderRadius: 18, width: 760, maxWidth: "94vw", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "22px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: T.text }}>Create New Product</h2>
            <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>Define a new product across the catalogue. Parameters adapt to the type you select.</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: T.textMuted }}>{Ico.x(20)}</button>
        </div>

        <div style={{ padding: "20px 28px 0", flex: 1, overflowY: "auto" }}>
          <StepBar />

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Product Name">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Afin Fix 5yr 75% LTV"
                    style={{ width: "100%", padding: "10px 14px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, fontFamily: T.font, background: T.card, color: T.text, outline: "none" }} />
                </Field>
              </div>
              <Field label="Category">
                <select value={category} onChange={e => { setCategory(e.target.value); setProductType(PRODUCT_TYPE_GROUPS[e.target.value][0]); setParams({}); }}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: T.font, background: T.card, color: T.text }}>
                  {Object.keys(PRODUCT_TYPE_GROUPS).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Product Type">
                <select value={productType} onChange={e => { setProductType(e.target.value); setParams({}); }}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: T.font, background: T.card, color: T.text }}>
                  {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              {COMMON_FIELDS.map(f => (
                <Field key={f.name} label={f.label}>
                  {renderField(f, common[f.name], (k, v) => setCommon(prev => ({ ...prev, [k]: v })))}
                </Field>
              ))}
              <div style={{ gridColumn: "1 / -1", height: 20 }} />
            </div>
          )}

          {/* STEP 2 — type-aware parameters */}
          {step === 2 && (
            <div>
              <div style={{ padding: "10px 14px", background: T.primaryLight, borderRadius: 8, marginBottom: 18, fontSize: 12, color: T.primary, fontWeight: 600 }}>
                {Ico.sparkle(14)} <span style={{ marginLeft: 6 }}>Showing parameters for <strong>{productType}</strong>. Fields adapt based on the product type chosen on the previous step.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {typeFields.map(f => (
                  <Field key={f.name} label={f.label}>
                    {renderField(f, params[f.name], setParam)}
                  </Field>
                ))}
              </div>
              {typeFields.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: T.textMuted, fontSize: 13 }}>No parameters defined for this product type.</div>
              )}

              {/* Pricing — Lending: set base rate + max LTV, engine generates all tiers */}
              {isLendingCategory && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Pricing</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Set the base rate — the pricing engine generates all tier combinations automatically</div>
                    </div>
                    <div onClick={() => setWizardDimensionsInfo(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: T.primary, cursor: "pointer", padding: "4px 10px", borderRadius: 6, background: T.primaryLight }}>
                      {Ico.eye(12)} View Dimensions
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Field label="Base Rate (at ≤60% LTV, Clean credit)">
                      <div style={{ position: "relative" }}>
                        <input key="base-rate-input" id="base-rate-input" type="number" step="0.01" value={params.baseRate || ""} placeholder="4.19"
                          onChange={e => setParam("baseRate", e.target.value)}
                          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 14, fontFamily: T.font, background: T.card, color: T.text, outline: "none", fontWeight: 700 }} />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.textMuted }}>%</span>
                      </div>
                    </Field>
                    <Field label="Max LTV">
                      <select value={params.maxLTV || "75"} onChange={e => setParam("maxLTV", e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, fontFamily: T.font, background: T.card, color: T.text }}>
                        {[60, 65, 70, 75, 80, 85, 90, 95].map(v => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Dimension selectors */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Accepted Credit Profiles</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {PRICING_CREDIT_PROFILES.map(c => {
                        const active = acceptedCredits.includes(c.id);
                        return (
                          <div key={c.id} onClick={() => toggleCredit(c.id)} style={{
                            padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            background: active ? T.successBg : T.bg, color: active ? T.success : T.textMuted,
                            border: `1px solid ${active ? T.successBorder : T.border}`, transition: "all 0.15s",
                          }}>{c.label}</div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Accepted Employment Types</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {["Employed", "Self-Employed", "Contractor", "Retired"].map(emp => {
                        const active = acceptedEmployments.includes(emp);
                        return (
                          <div key={emp} onClick={() => toggleEmployment(emp)} style={{
                            padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            background: active ? T.successBg : T.bg, color: active ? T.success : T.textMuted,
                            border: `1px solid ${active ? T.successBorder : T.border}`, transition: "all 0.15s",
                          }}>{emp}</div>
                        );
                      })}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>Accepted Property Types</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["Standard", "Non-Standard", "New Build", "Ex-Local Authority", "High-Rise (>6 floors)"].map(pt => {
                        const active = acceptedProperties.includes(pt);
                        return (
                          <div key={pt} onClick={() => toggleProperty(pt)} style={{
                            padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                            background: active ? T.successBg : T.bg, color: active ? T.success : T.textMuted,
                            border: `1px solid ${active ? T.successBorder : T.border}`, transition: "all 0.15s",
                          }}>{pt}</div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-product dimension overrides */}
                  <div style={{ marginTop: 16, padding: "14px 16px", background: T.warningBg, borderRadius: 10, border: `1px solid ${T.warningBorder}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      {Ico.settings(14)}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>Dimension Overrides</span>
                      <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 4 }}>Override platform defaults for this product only</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 28px", gap: 6, alignItems: "center", marginBottom: 6, fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                      <span>Dimension</span><span>Override %</span><span>Comment / Reason</span><span />
                    </div>
                    {[
                      ...acceptedEmployments.map(e => ({ key: e, group: "Employment", default: EMPLOYMENT_ADJUSTMENTS[e] || 0 })),
                      ...acceptedProperties.map(p => ({ key: p, group: "Property", default: PROPERTY_ADJUSTMENTS[p] || 0 })),
                      ...["A","B","C","D","E","F","G"].map(r => ({ key: `EPC ${r}`, group: "EPC", default: EPC_ADJUSTMENTS[r] || 0 })),
                    ].filter(d => d.default !== 0 || overrides[d.key]).map(d => {
                      const ov = overrides[d.key];
                      return (
                        <div key={d.key} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 28px", gap: 6, alignItems: "center", marginBottom: 4 }}>
                          <div style={{ fontSize: 11 }}>
                            <span style={{ fontWeight: 600, color: T.text }}>{d.key}</span>
                            <span style={{ color: T.textMuted, marginLeft: 6 }}>default: {d.default > 0 ? "+" : ""}{d.default.toFixed(2)}%</span>
                          </div>
                          <input type="number" step="0.05" value={ov?.adj ?? ""} placeholder={d.default.toFixed(2)}
                            onChange={e => setOverride(d.key, e.target.value, ov?.comment || "")}
                            style={{ width: "100%", padding: "5px 6px", borderRadius: 4, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.font, background: T.card, textAlign: "center" }} />
                          <input type="text" value={ov?.comment || ""} placeholder="Reason for override"
                            onChange={e => setOverride(d.key, ov?.adj ?? d.default, e.target.value)}
                            style={{ width: "100%", padding: "5px 6px", borderRadius: 4, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.font, background: T.card }} />
                          {ov ? (
                            <button onClick={() => removeOverride(d.key)} style={{ width: 24, height: 24, borderRadius: 4, border: `1px solid ${T.border}`, background: T.card, color: T.textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                          ) : <span />}
                        </div>
                      );
                    })}
                    {Object.keys(overrides).length > 0 && (
                      <div style={{ fontSize: 10, color: "#92400E", marginTop: 8, fontWeight: 600 }}>
                        {Object.keys(overrides).length} override{Object.keys(overrides).length > 1 ? "s" : ""} will apply to this product only. Platform defaults unchanged.
                      </div>
                    )}
                  </div>

                  {/* Live preview grid */}
                  {params.baseRate && (
                    <div style={{ padding: "14px 16px", background: T.bg, borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>Live Rate Preview (Credit × LTV)</div>
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Credit \ LTV</th>
                              {LTV_ADJUSTMENTS.filter(l => {
                                const maxLtv = parseInt(params.maxLTV) || 75;
                                return l.max <= maxLtv || l.min < maxLtv;
                              }).map(l => (
                                <th key={l.band} style={{ padding: "6px 8px", textAlign: "center", fontSize: 9, fontWeight: 700, color: T.textMuted }}>{l.band}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {PRICING_CREDIT_PROFILES.filter(c => acceptedCredits.includes(c.id)).map((credit, ci) => (
                              <tr key={credit.id}>
                                <td style={{ padding: "5px 8px", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{credit.label}</td>
                                {LTV_ADJUSTMENTS.filter(l => {
                                  const maxLtv = parseInt(params.maxLTV) || 75;
                                  return l.max <= maxLtv || l.min < maxLtv;
                                }).map(ltv => {
                                  const base = parseFloat(params.baseRate) || 0;
                                  const mid = Math.round((ltv.min + ltv.max) / 2) || 30;
                                  const maxLtv = parseInt(params.maxLTV) || 75;
                                  if (mid > maxLtv || (credit.maxLTV && mid > credit.maxLTV)) {
                                    return <td key={ltv.band} style={{ padding: "4px 6px", textAlign: "center" }}><span style={{ color: T.textMuted }}>—</span></td>;
                                  }
                                  const rate = Math.round((base + ltv.adj + credit.adj) * 100) / 100;
                                  const color = rate < 4.5 ? T.success : rate <= 5.5 ? "#92400E" : T.danger;
                                  const bg = rate < 4.5 ? T.successBg : rate <= 5.5 ? T.warningBg : T.dangerBg;
                                  return (
                                    <td key={ltv.band} style={{ padding: "4px 6px", textAlign: "center" }}>
                                      <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: bg, color }}>{rate.toFixed(2)}%</span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>
                        Showing {acceptedCredits.length} accepted credit profiles. Employment ({acceptedEmployments.join(", ")}), property ({acceptedProperties.join(", ")}), EPC and loyalty modifiers applied at application time.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing — Savings: balance band tiers (manual) */}
              {category === "Savings" && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Balance Tiers</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Define rate by deposit balance band</div>
                    </div>
                    <Btn small iconNode={Ico.plus(14)} onClick={addTier}>Add Tier</Btn>
                  </div>
                  {tiers.length === 0 && (
                    <div style={{ padding: "16px 0", textAlign: "center", color: T.textMuted, fontSize: 12, background: T.bg, borderRadius: 8, border: `1px dashed ${T.border}` }}>
                      No tiers added. Click "Add Tier" to define balance bands.
                    </div>
                  )}
                  {tiers.map((tier, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 120px 32px", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input type="text" value={tier.balanceBand || ""} placeholder="e.g. £1k - £9,999"
                        onChange={e => updateTier(idx, "balanceBand", e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, fontFamily: T.font, background: T.card, color: T.text, outline: "none" }} />
                      <input type="number" value={tier.rate} placeholder="4.50"
                        onChange={e => updateTier(idx, "rate", e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 12, fontFamily: T.font, background: T.card, color: T.text, outline: "none" }} />
                      <select value={tier.status} onChange={e => updateTier(idx, "status", e.target.value)}
                        style={{ width: "100%", padding: "7px 8px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11, fontFamily: T.font, background: T.card, color: T.text, outline: "none" }}>
                        <option value="Active">Active</option>
                        <option value="Paused">Paused</option>
                      </select>
                      <button onClick={() => removeTier(idx)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${T.border}`, background: T.card, color: T.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — compliance */}
          {step === 3 && (
            <div>
              <div style={{ padding: "10px 14px", background: T.warningBg, border: `1px solid ${T.warningBorder}`, borderRadius: 8, marginBottom: 18, fontSize: 12, color: "#92400E", fontWeight: 600 }}>
                {Ico.shield(14)} <span style={{ marginLeft: 6 }}>FCA Consumer Duty requires every product to have a defined target market, fair value assessment and outcome mapping.</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {COMPLIANCE_FIELDS.map(f => (
                  <Field key={f.name} label={f.label}>
                    {renderField(f, compliance[f.name], (k, v) => setCompliance(prev => ({ ...prev, [k]: v })))}
                  </Field>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg }}>
          <div style={{ fontSize: 12, color: T.textMuted }}>Step {step} of 3</div>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 1 && <Btn onClick={() => setStep(step - 1)}>Back</Btn>}
            {step < 3 && <Btn primary onClick={() => setStep(step + 1)}>Continue</Btn>}
            {step === 3 && <>
              <Btn onClick={onClose}>Save as Draft</Btn>
              <Btn primary onClick={() => onPublish?.({
                name: name || "New Product",
                type: category,
                rate: params.baseRate ? params.baseRate + "%" : "—",
                maxLTV: params.maxLTV ? params.maxLTV + "%" : "—",
                minTerm: params.minTerm || "5yr",
                maxTerm: params.maxTerm || "35yr",
                erc: params.erc || "—",
                eligibility: common.eligibility || "All",
                creditAccepted: category === "Lending" ? acceptedCredits : null,
                acceptedEmployments: category === "Lending" ? acceptedEmployments : null,
                acceptedProperties: category === "Lending" ? acceptedProperties : null,
                dimensionOverrides: category === "Lending" && Object.keys(overrides).length > 0 ? overrides : null,
                tiers: category === "Savings" ? tiers : null,
                keyTerms: category !== "Lending" ? `Min £1,000 — Max £500,000` : null,
              })}>Publish Product</Btn>
            </>}
          </div>
        </div>
      </div>

      {/* Wizard-level Dimensions Info Modal */}
      {wizardDimensionsInfo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setWizardDimensionsInfo(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: T.card, borderRadius: 16, padding: "24px 28px", width: 640, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Pricing Dimensions</div>
              <div onClick={() => setWizardDimensionsInfo(false)} style={{ width: 28, height: 28, borderRadius: 6, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted }}>{Ico.x(14)}</div>
            </div>
            <div style={{ padding: "12px 16px", background: T.primaryLight, borderRadius: 8, marginBottom: 16, borderLeft: `4px solid ${T.primary}`, fontSize: 12, color: T.text, lineHeight: 1.6 }}>
              <strong>Final Rate</strong> = Base Rate + LTV Adjustment + Credit Adjustment + Employment + Property + EPC + Loyalty
            </div>
            {[
              { title: "LTV Bands", items: LTV_ADJUSTMENTS.map(l => [l.band, `+${l.adj.toFixed(2)}%`]) },
              { title: "Credit Profiles", items: PRICING_CREDIT_PROFILES.map(c => [c.label, `+${c.adj.toFixed(2)}%`, c.maxLTV ? `Max ${c.maxLTV}%` : ""]) },
              { title: "Employment", items: Object.entries(EMPLOYMENT_ADJUSTMENTS).map(([k, v]) => [k, v === 0 ? "Base" : `+${v.toFixed(2)}%`]) },
              { title: "Property Type", items: Object.entries(PROPERTY_ADJUSTMENTS).map(([k, v]) => [k, v === 0 ? "Base" : `+${v.toFixed(2)}%`]) },
              { title: "EPC Rating", items: Object.entries(EPC_ADJUSTMENTS).map(([k, v]) => [`EPC ${k}`, v < 0 ? `${v.toFixed(2)}%` : v === 0 ? "Base" : `+${v.toFixed(2)}%`]) },
              { title: "Loyalty", items: Object.entries(LOYALTY_ADJUSTMENTS).map(([k, v]) => [k, v < 0 ? `${v.toFixed(2)}%` : v === 0 ? "Base" : `+${v.toFixed(2)}%`]) },
            ].map(dim => (
              <div key={dim.title} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{dim.title}</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {dim.items.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                        <td style={{ padding: "5px 10px" }}>{row[0]}</td>
                        <td style={{ padding: "5px 10px", fontWeight: 700, textAlign: "right", color: row[1].includes("-") ? T.success : row[1].includes("+") ? T.warning : T.textMuted }}>{row[1]}</td>
                        {row[2] && <td style={{ padding: "5px 10px", fontSize: 10, color: T.textMuted }}>{row[2]}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT CATALOGUE — Multi-type with subtabs
// ─────────────────────────────────────────────
import SavingsBuckets from "./SavingsBuckets";
import SharedOwnershipCatalogue from "./SharedOwnershipCatalogue";
import InsuranceCatalogue from "./InsuranceCatalogue";

const RESIDENTIAL_BUCKETS = ["Prime", "Prime High LTV", "Professional", "High-Net-Worth", "Residential Bridging", "Buy-to-Let"];
const COMMERCIAL_BUCKETS = ["Unregulated Bridging", "Commercial Mortgage", "Development Finance"];

const PRODUCT_TYPES = [
  { id: "residential", label: "Residential", icon: "shield", color: "#059669" },
  { id: "commercial", label: "Commercial", icon: "dashboard", color: "#6366F1" },
  { id: "savings", label: "Savings", icon: "dollar", color: "#3B82F6" },
  { id: "sharedOwnership", label: "Shared Ownership", icon: "users", color: "#8B5CF6" },
  { id: "insurance", label: "Insurance", icon: "lock", color: "#F59E0B" },
];

function ProductCatalogue() {
  const [activeType, setActiveType] = useState("residential");

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Product type subtabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 24 }}>
        {PRODUCT_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setActiveType(pt.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: activeType === pt.id ? 700 : 500, fontFamily: T.font,
              color: activeType === pt.id ? pt.color : T.textMuted,
              borderBottom: activeType === pt.id ? `3px solid ${pt.color}` : "3px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
            }}
          >
            {Ico[pt.icon]?.(16)} {pt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeType === "residential" && <ProductBuckets filterBuckets={RESIDENTIAL_BUCKETS} />}
      {activeType === "commercial" && <ProductBuckets filterBuckets={COMMERCIAL_BUCKETS} />}
      {activeType === "savings" && <SavingsBuckets />}
      {activeType === "sharedOwnership" && <SharedOwnershipCatalogue />}
      {activeType === "insurance" && <InsuranceCatalogue />}
    </div>
  );
}

export default ProductCatalogue;
