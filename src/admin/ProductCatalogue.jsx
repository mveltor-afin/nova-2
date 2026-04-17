import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import { getRate, LTV_ADJUSTMENTS, CREDIT_PROFILES as PRICING_CREDIT_PROFILES, EMPLOYMENT_ADJUSTMENTS, PROPERTY_ADJUSTMENTS, EPC_ADJUSTMENTS, LOYALTY_ADJUSTMENTS } from "../data/pricing";

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

const CREDIT_TIERS = [
  { id: "clean", label: "Clean", adj: "+0.00%", maxLTV: 95, color: "#059669" },
  { id: "near_prime", label: "Near Prime", adj: "+0.25%", maxLTV: 90, color: "#31B897" },
  { id: "light_adverse", label: "Light Adverse", adj: "+0.50%", maxLTV: 85, color: "#FFBF00" },
  { id: "adverse", label: "Adverse", adj: "+0.75%", maxLTV: 80, color: "#F59E0B" },
  { id: "heavy_adverse", label: "Heavy Adverse", adj: "+1.25%", maxLTV: 75, color: "#FF6B61" },
  { id: "specialist", label: "Specialist", adj: "+1.75%", maxLTV: 65, color: "#DC2626" },
  { id: "fresh_start", label: "Fresh Start", adj: "+2.50%", maxLTV: 60, color: "#991B1B" },
];

const LENDING = [
  { id: 1, name: "Afin Fix 2yr 75%", type: "Lending", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "All", status: "Active",
    creditAccepted: ["clean", "near_prime", "light_adverse", "adverse", "heavy_adverse"], tiers: [
    { ltvBand: "≤60%", rate: "4.19%", margin: "1.24%", status: "Active" },
    { ltvBand: "60-75%", rate: "4.49%", margin: "1.54%", status: "Active" },
  ]},
  { id: 2, name: "Afin Fix 5yr 75%", creditAccepted: ["clean", "near_prime", "light_adverse", "adverse"], type: "Lending", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "5/4/3/2/1%", eligibility: "All", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "4.59%", margin: "1.64%", status: "Active" },
    { ltvBand: "60-75%", rate: "4.89%", margin: "1.94%", status: "Active" },
  ]},
  { id: 3, name: "Afin Track SVR 75%", creditAccepted: ["clean", "near_prime", "light_adverse"], type: "Lending", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "None", eligibility: "All", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "4.84%", margin: "0.59%", status: "Active" },
    { ltvBand: "60-75%", rate: "5.14%", margin: "0.89%", status: "Active" },
  ]},
  { id: 4, name: "Afin Fix 2yr 90%", creditAccepted: ["clean", "near_prime"], type: "Lending", maxLTV: "90%", minTerm: "5yr", maxTerm: "35yr", erc: "4% / 3%", eligibility: "All", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "4.49%", margin: "1.54%", status: "Active" },
    { ltvBand: "60-75%", rate: "4.79%", margin: "1.84%", status: "Active" },
    { ltvBand: "75-85%", rate: "5.09%", margin: "2.14%", status: "Active" },
    { ltvBand: "85-90%", rate: "5.29%", margin: "2.34%", status: "Active" },
  ]},
  { id: 5, name: "Afin Pro Fix 2yr", creditAccepted: ["clean"], type: "Lending", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "Professional only", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "3.69%", margin: "0.74%", status: "Active" },
    { ltvBand: "60-75%", rate: "3.99%", margin: "1.04%", status: "Active" },
  ]},
  { id: 6, name: "Afin HNW Fix 5yr", creditAccepted: ["clean", "near_prime"], type: "Lending", maxLTV: "85%", minTerm: "5yr", maxTerm: "35yr", erc: "5/4/3/2/1%", eligibility: "HNW only", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "3.99%", margin: "1.04%", status: "Active" },
    { ltvBand: "60-75%", rate: "4.29%", margin: "1.34%", status: "Active" },
    { ltvBand: "75-85%", rate: "4.69%", margin: "1.74%", status: "Active" },
  ]},
  { id: 7, name: "Afin BTL Tracker", creditAccepted: ["clean", "near_prime", "light_adverse"], type: "Lending", maxLTV: "75%", minTerm: "5yr", maxTerm: "25yr", erc: "3%", eligibility: "BTL only", status: "Active", tiers: [
    { ltvBand: "≤60%", rate: "5.49%", margin: "1.24%", status: "Active" },
    { ltvBand: "60-75%", rate: "5.99%", margin: "1.74%", status: "Active" },
  ]},
  { id: 8, name: "Afin Shared Ownership", creditAccepted: ["clean", "near_prime", "light_adverse", "adverse", "heavy_adverse", "specialist", "fresh_start"], type: "Lending", rate: "5.49%", maxLTV: "95% of share", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "All", status: "Active", tiers: [
    { ltvBand: "≤75%", rate: "5.19%", margin: "2.24%", status: "Active" },
    { ltvBand: "75-85%", rate: "5.49%", margin: "2.54%", status: "Active" },
    { ltvBand: "85-95%", rate: "5.89%", margin: "2.94%", status: "FTB Only" },
  ]},
];

const SAVINGS = [
  { id: 9,  name: "1yr Fixed Deposit", type: "Savings", rate: "4.50%", keyTerms: "Min £1,000 — Max £500,000", eligibility: "All", status: "Active", tiers: [
    { balanceBand: "£1k - £9,999", rate: "4.25%", status: "Active" },
    { balanceBand: "£10k - £49,999", rate: "4.50%", status: "Active" },
    { balanceBand: "£50k - £249,999", rate: "4.65%", status: "Active" },
    { balanceBand: "£250k+", rate: "4.80%", status: "Active" },
  ]},
  { id: 10, name: "2yr Fixed Deposit", type: "Savings", rate: "4.85%", keyTerms: "Min £1,000 — Max £500,000", eligibility: "All", status: "Active", tiers: [
    { balanceBand: "£1k - £9,999", rate: "4.60%", status: "Active" },
    { balanceBand: "£10k - £49,999", rate: "4.85%", status: "Active" },
    { balanceBand: "£50k - £249,999", rate: "5.00%", status: "Active" },
    { balanceBand: "£250k+", rate: "5.15%", status: "Active" },
  ]},
  { id: 11, name: "3yr Fixed Deposit", type: "Savings", rate: "5.10%", keyTerms: "Min £5,000 — Max £500,000", eligibility: "All", status: "Active", tiers: [
    { balanceBand: "£5k - £24,999", rate: "4.90%", status: "Active" },
    { balanceBand: "£25k - £99,999", rate: "5.10%", status: "Active" },
    { balanceBand: "£100k - £249,999", rate: "5.25%", status: "Active" },
    { balanceBand: "£250k+", rate: "5.40%", status: "Active" },
  ]},
  { id: 12, name: "90-Day Notice", type: "Savings", rate: "3.20%", keyTerms: "Min £1,000 — No Max", eligibility: "All", status: "Active", tiers: [
    { balanceBand: "£1k - £24,999", rate: "3.00%", status: "Active" },
    { balanceBand: "£25k - £99,999", rate: "3.20%", status: "Active" },
    { balanceBand: "£100k+", rate: "3.35%", status: "Active" },
  ]},
];

const INSURANCE = [
  { id: 13, name: "Life Cover", type: "Insurance", rate: "via Afin Protect", keyTerms: "Underwritten by partner", eligibility: "All", status: "Active" },
  { id: 14, name: "Buildings & Contents", type: "Insurance", rate: "via Afin Protect", keyTerms: "Underwritten by partner", eligibility: "All", status: "Active" },
];

const ALL_PRODUCTS = [...LENDING, ...SAVINGS, ...INSURANCE];

const typeBadge = (type) => {
  const colors = { Lending: { bg: "#DBEAFE", text: "#1E40AF" }, Savings: { bg: "#D1FAE5", text: "#065F46" }, Insurance: { bg: "#EDE9FE", text: "#5B21B6" } };
  const c = colors[type] || { bg: T.borderLight, text: T.textMuted };
  return <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{type}</span>;
};

const statusBadge = (status) => {
  const isActive = status === "Active";
  return <span style={{ background: isActive ? T.successBg : T.borderLight, color: isActive ? T.success : T.textMuted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>{status}</span>;
};

const tierStatusBadge = (status) => {
  const map = {
    Active: { bg: T.successBg, color: T.success },
    "FTB Only": { bg: "#DBEAFE", color: "#1E40AF" },
    Paused: { bg: "#FEF3C7", color: "#92400E" },
  };
  const s = map[status] || { bg: T.borderLight, color: T.textMuted };
  return <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{status}</span>;
};

const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

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
                    <div onClick={() => setShowDimensionsInfo(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: T.primary, cursor: "pointer", padding: "4px 10px", borderRadius: 6, background: T.primaryLight }}>
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
                            {PRICING_CREDIT_PROFILES.slice(0, 5).map((credit, ci) => (
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
                        Showing first 5 credit profiles. Employment, property, EPC and loyalty modifiers applied on top at application time.
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
                creditAccepted: category === "Lending" ? ["clean", "near_prime", "light_adverse"] : null,
                tiers: category === "Savings" ? tiers : null,
                keyTerms: category !== "Lending" ? `Min £1,000 — Max £500,000` : null,
              })}>Publish Product</Btn>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCatalogue() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDimensionsInfo, setShowDimensionsInfo] = useState(false);
  const [newProducts, setNewProducts] = useState([]);

  const filters = ["All", "Lending", "Savings", "Insurance", "Archived"];
  const allProducts = [...ALL_PRODUCTS, ...newProducts];
  const shown = filter === "All" ? allProducts : filter === "Archived" ? [] : allProducts.filter(p => p.type === filter);

  const activeCount = allProducts.filter(p => p.status === "Active").length;
  const archivedCount = allProducts.length - activeCount;

  const keyTermsFor = (p) => {
    if (p.type === "Lending") return `LTV ${p.maxLTV}, ${p.minTerm}–${p.maxTerm}, ERC ${p.erc}`;
    return p.keyTerms || "—";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Product Catalogue</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Single source of truth for all lending and savings products</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowModal(true)}>Create Product</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Total Products" value="14" color={T.primary} />
        <KPICard label="Lending" value="8" color="#1E40AF" />
        <KPICard label="Savings" value="4" color={T.success} />
        <KPICard label="Insurance" value="2" color="#5B21B6" />
        <KPICard label="Active" value={String(activeCount)} color={T.accent} />
        <KPICard label="Archived" value={String(archivedCount)} color={T.textMuted} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: filter === f ? T.primary : T.card, color: filter === f ? "#fff" : T.textSecondary,
            border: `1px solid ${filter === f ? T.primary : T.border}`,
          }}>{f}</div>
        ))}
      </div>

      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
          <thead>
            <tr>
              <th style={thStyle}>Product Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Rate</th>
              <th style={thStyle}>Max LTV</th>
              <th style={thStyle}>Term</th>
              <th style={thStyle}>ERC</th>
              <th style={thStyle}>Credit Profiles</th>
              <th style={thStyle}>Eligibility</th>
              <th style={thStyle}>Status</th>
              <th style={{...thStyle, textAlign: "center", width: 60}}></th>
            </tr>
          </thead>
          <tbody>
            {shown.map(p => (
              <>
                <tr key={p.id} onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ cursor: "pointer", background: expanded === p.id ? T.primaryLight : "transparent" }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                  <td style={tdStyle}>{typeBadge(p.type)}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.tiers?.length
                    ? `${p.tiers[0].rate} – ${p.tiers[p.tiers.length - 1].rate}`
                    : p.rate || "—"}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{p.maxLTV || "—"}</td>
                  <td style={{ ...tdStyle, fontSize: 12, whiteSpace: "nowrap" }}>{p.type === "Lending" ? `${p.minTerm}–${p.maxTerm}` : p.keyTerms?.split("—")[0]?.trim() || "—"}</td>
                  <td style={{ ...tdStyle, fontSize: 11 }}>{p.erc || "—"}</td>
                  <td style={{ ...tdStyle, fontSize: 11 }}>
                    {p.creditAccepted ? (
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {CREDIT_TIERS.filter(c => p.creditAccepted.includes(c.id)).map(c => (
                          <span key={c.id} style={{ padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 600, background: `${c.color}18`, color: c.color, whiteSpace: "nowrap" }}>{c.label}</span>
                        ))}
                      </div>
                    ) : <span style={{ color: T.textMuted }}>All</span>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{p.eligibility}</td>
                  <td style={tdStyle}>{statusBadge(p.status)}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted, background: T.bg, border: `1px solid ${T.borderLight}` }} title="Edit">{Ico.settings(14)}</div>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted, background: T.bg, border: `1px solid ${T.borderLight}` }} title="Archive">{Ico.download(14)}</div>
                    </div>
                  </td>
                </tr>
                {expanded === p.id && (
                  <tr key={`${p.id}-detail`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ background: T.bg, padding: 24, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Product Name</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Type</div>
                            <div>{typeBadge(p.type)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Rate</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.rate}</div>
                          </div>
                          {p.type === "Lending" && <>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Max LTV</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.maxLTV}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Term Range</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.minTerm} – {p.maxTerm}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>ERC Schedule</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.erc}</div>
                            </div>
                          </>}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Eligibility</div>
                            <div style={{ fontSize: 14, color: T.text }}>{p.eligibility}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                            <div>{statusBadge(p.status)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Fee Schedule</div>
                            <div style={{ fontSize: 14, color: T.text }}>{p.type === "Lending" ? "£999 arrangement, £250 valuation" : "No fees"}</div>
                          </div>
                        </div>
                        {/* Live Pricing Grid — generated from pricing engine */}
                        {p.type === "Lending" && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {Ico.chart(16)}
                                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Live Pricing Grid</span>
                                <span style={{ fontSize: 11, color: T.textMuted }}>· from pricing engine</span>
                              </div>
                              <div onClick={() => setShowDimensionsInfo(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: T.primary, cursor: "pointer", padding: "4px 10px", borderRadius: 6, background: T.primaryLight }}>
                                {Ico.eye(12)} Pricing Dimensions
                              </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", background: T.card, borderBottom: `1px solid ${T.border}` }}>Credit \ LTV</th>
                                    {LTV_ADJUSTMENTS.map(l => (
                                      <th key={l.band} style={{ padding: "8px 10px", textAlign: "center", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", background: T.card, borderBottom: `1px solid ${T.border}` }}>{l.band}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {PRICING_CREDIT_PROFILES.filter(c => p.creditAccepted?.includes(c.id)).map((credit, ci) => (
                                    <tr key={credit.id} style={{ background: ci % 2 === 0 ? "transparent" : `${T.card}60` }}>
                                      <td style={{ padding: "7px 10px", fontWeight: 600, fontSize: 11, color: T.text, borderBottom: `1px solid ${T.borderLight}`, whiteSpace: "nowrap" }}>{credit.label}</td>
                                      {LTV_ADJUSTMENTS.map(ltv => {
                                        const mid = Math.round((ltv.min + ltv.max) / 2) || 30;
                                        const r = getRate({ product: p.name, ltv: mid, credit: credit.id });
                                        const rateColor = !r.available ? { bg: "#F5F5F5", color: "#999" }
                                          : r.rate < 4.5 ? { bg: T.successBg, color: T.success }
                                          : r.rate <= 5.5 ? { bg: T.warningBg, color: "#92400E" }
                                          : { bg: T.dangerBg, color: T.danger };
                                        return (
                                          <td key={ltv.band} style={{ padding: "5px 6px", textAlign: "center", borderBottom: `1px solid ${T.borderLight}` }}>
                                            {r.available ? (
                                              <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: rateColor.bg, color: rateColor.color }}>{r.rate.toFixed(2)}%</span>
                                            ) : (
                                              <span style={{ color: T.textMuted }}>—</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Savings tiers (kept as-is — balance-based) */}
                        {p.type !== "Lending" && p.tiers && p.tiers.length > 0 && (
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Balance Tiers</div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", background: T.card, borderBottom: `1px solid ${T.border}` }}>Balance Band</th>
                                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", background: T.card, borderBottom: `1px solid ${T.border}` }}>Rate</th>
                                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", background: T.card, borderBottom: `1px solid ${T.border}` }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.tiers.map((tier, idx) => (
                                  <tr key={idx}>
                                    <td style={{ padding: "8px 12px", fontWeight: 600, borderBottom: `1px solid ${T.borderLight}` }}>{tier.balanceBand}</td>
                                    <td style={{ padding: "8px 12px", fontWeight: 700, color: T.primary, borderBottom: `1px solid ${T.borderLight}` }}>{tier.rate}</td>
                                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderLight}` }}>{tierStatusBadge(tier.status)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <Btn primary>Save Changes</Btn>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>

      {/* AI Insight */}
      <Card style={{ marginTop: 20, background: `linear-gradient(135deg, ${T.primaryLight}, rgba(49,184,151,0.06))`, border: `1px solid ${T.accent}40` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>{Ico.sparkle(18)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI Product Gap Analysis</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>
              No 10yr fixed rate product. 3 competitor lenders now offer 10yr fixes at 4.6–4.8%. Consider adding to retain rate-security-seeking borrowers.
            </div>
          </div>
        </div>
      </Card>

      {/* Create Product Wizard */}
      {showModal && <ProductWizard onClose={() => setShowModal(false)} onPublish={(product) => {
        setNewProducts(prev => [...prev, { ...product, id: Date.now(), status: "Active" }]);
        setShowModal(false);
      }} />}

      {/* Pricing Dimensions Info Popout */}
      {showDimensionsInfo && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={() => setShowDimensionsInfo(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: T.card, borderRadius: 18, padding: "28px 32px", width: 700, maxWidth: "94vw", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Pricing Dimensions</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Every factor that affects the final customer rate. All dimensions combine additively.</div>
              </div>
              <div onClick={() => setShowDimensionsInfo(false)} style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textMuted }}>{Ico.x(16)}</div>
            </div>

            {/* How it works */}
            <div style={{ padding: "14px 18px", background: T.primaryLight, borderRadius: 10, marginBottom: 20, borderLeft: `4px solid ${T.primary}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4 }}>How pricing works</div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>
                Final Rate = Base Rate + LTV Adjustment + Credit Adjustment + Employment Adjustment + Property Adjustment + EPC Adjustment + Loyalty Adjustment
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Example: 4.19% base + 0.30% (60-75% LTV) + 0.50% (Light Adverse) + 0.20% (Self-Employed) = <strong>5.19%</strong></div>
            </div>

            {/* Dimension tables */}
            {[
              { title: "LTV Band", desc: "Loan-to-value ratio — higher LTV = higher rate", icon: "shield",
                rows: LTV_ADJUSTMENTS.map(l => [l.band, `+${l.adj.toFixed(2)}%`]) },
              { title: "Credit Profile", desc: "Customer's credit history — adverse history increases rate", icon: "user",
                rows: PRICING_CREDIT_PROFILES.map(c => [`${c.label} — ${c.desc}`, `+${c.adj.toFixed(2)}%`, c.maxLTV ? `Max LTV ${c.maxLTV}%` : "No LTV restriction"]) },
              { title: "Employment Type", desc: "How the customer earns — self-employed carries higher risk", icon: "products",
                rows: Object.entries(EMPLOYMENT_ADJUSTMENTS).map(([k, v]) => [k, v === 0 ? "No adjustment" : `+${v.toFixed(2)}%`]) },
              { title: "Property Type", desc: "Construction and property characteristics", icon: "shield",
                rows: Object.entries(PROPERTY_ADJUSTMENTS).map(([k, v]) => [k, v === 0 ? "Standard" : `+${v.toFixed(2)}%`]) },
              { title: "EPC / Green Incentive", desc: "Energy efficiency rating — greener homes get a discount", icon: "sparkle",
                rows: Object.entries(EPC_ADJUSTMENTS).map(([k, v]) => [`EPC ${k}`, v < 0 ? `${v.toFixed(2)}% discount` : v === 0 ? "Standard" : `+${v.toFixed(2)}% premium`]) },
              { title: "Customer Loyalty", desc: "Existing customers rewarded with better rates", icon: "customers",
                rows: Object.entries(LOYALTY_ADJUSTMENTS).map(([k, v]) => [k, v < 0 ? `${v.toFixed(2)}% discount` : v === 0 ? "Standard" : `+${v.toFixed(2)}%`]) },
            ].map(dim => (
              <div key={dim.title} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: T.primary }}>{Ico[dim.icon]?.(14)}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{dim.title}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>— {dim.desc}</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {dim.rows.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                        <td style={{ padding: "6px 12px", fontWeight: 500, color: T.text }}>{row[0]}</td>
                        <td style={{ padding: "6px 12px", fontWeight: 700, color: row[1].includes("discount") ? T.success : row[1].includes("+") ? T.warning : T.textMuted, textAlign: "right" }}>{row[1]}</td>
                        {row[2] && <td style={{ padding: "6px 12px", fontSize: 10, color: T.textMuted }}>{row[2]}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Btn primary onClick={() => setShowDimensionsInfo(false)}>Got it</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalogue;
