import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import { LTV_ADJUSTMENTS, CREDIT_PROFILES, EMPLOYMENT_ADJUSTMENTS, getRate } from "../data/pricing";

// ─────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────
function loadBuckets() {
  try {
    const s = localStorage.getItem("product_buckets");
    return s ? JSON.parse(s) : DEFAULT_BUCKETS;
  } catch {
    return DEFAULT_BUCKETS;
  }
}

function saveBuckets(b) {
  try {
    localStorage.setItem("product_buckets", JSON.stringify(b));
  } catch {}
}

// ─────────────────────────────────────────────
// COLOUR PRESETS
// ─────────────────────────────────────────────
const COLOUR_PRESETS = [
  { label: "Green", value: "#059669" },
  { label: "Teal", value: "#31B897" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Red", value: "#DC2626" },
];

// ─────────────────────────────────────────────
// EMPLOYMENT & PROPERTY OPTIONS
// ─────────────────────────────────────────────
const ALL_EMPLOYMENT = [
  "Employed (min 6 months)",
  "Self-employed (min 2 years)",
  "Contractors (12 months history)",
  "Retired (with pension income)",
  "Specified professionals / qualifications",
];
const ALL_ACCEPTABLE_TYPES = [
  "Houses", "Flats (up to 6 floors)", "Bungalows", "New build",
  "Ex-local authority", "HMO subject to criteria",
];
const ALL_UNACCEPTABLE_TYPES = [
  "Above commercial", "Freehold flats", "Mobile homes",
  "Houseboats", "Holiday lets not accepted",
];

// ─────────────────────────────────────────────
// RATE GENERATION FROM PRICING ENGINE
// ─────────────────────────────────────────────
const generateRates = (baseRate, maxLTV, tierOverrides = {}) => {
  const base = parseFloat(baseRate) || 0;
  const max = parseInt(maxLTV) || 75;
  // Use bucket-level LTV overrides if provided, else global
  const ltvTiers = tierOverrides.ltv || LTV_ADJUSTMENTS;
  return ltvTiers.map(ltv => {
    // If ltv is from overrides, it might just have band+adj; fill in min/max from global
    const globalLtv = LTV_ADJUSTMENTS.find(g => g.band === ltv.band) || ltv;
    const mid = Math.round(((globalLtv.min || 0) + (globalLtv.max || 75)) / 2) || 30;
    if (mid > max) return { band: ltv.band, rate: null };
    const rate = Math.round((base + (ltv.adj != null ? ltv.adj : globalLtv.adj || 0)) * 100) / 100;
    return { band: ltv.band, rate };
  });
};

// ─────────────────────────────────────────────
// DEFAULT BUCKETS — Unified hierarchy
// ─────────────────────────────────────────────
const DEFAULT_BUCKETS = [
  {
    name: "Prime",
    color: "#059669",
    desc: "Clean credit \u00b7 Standard criteria \u00b7 Purchase & remortgage",
    maxLTV: 75,
    acceptedCreditProfiles: ["clean", "near_prime"],
    tierOverrides: {},
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a31,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 75 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      incomeMultiple: "4.49x single / 4.49x joint",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0", maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted", bankruptcy: "Not accepted", dmp: "Not accepted",
      },
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
    },
    fees: {
      productFee: "\u00a31,495",
      reversion: "BBR + 3.99%",
      termRange: "2-40 years",
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
    products: [
      { type: "2-Year Fixed", code: "P2F", baseRate: 4.19, erc: "3%, 2%", rates: null },
      { type: "5-Year Fixed", code: "P5F", baseRate: 4.59, erc: "5%, 4%, 3%, 2%, 1%", rates: null },
      { type: "2-Year Tracker", code: "PTR", baseRate: 4.84, erc: "No ERCs", rates: null },
    ],
  },
  {
    name: "Prime High LTV",
    color: "#31B897",
    desc: "Clean credit \u00b7 Extended LTV range up to 95%",
    maxLTV: 95,
    acceptedCreditProfiles: ["clean", "near_prime"],
    tierOverrides: {},
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a3500,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 70 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      incomeMultiple: "4.49x",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0", maxDefaults: "0",
        missedPayments: "None in last 24 months",
        iva: "Not accepted", bankruptcy: "Not accepted", dmp: "Not accepted",
      },
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      additionalNotes: "\u226495% purchase only",
    },
    fees: {
      productFee: "\u00a31,495",
      reversion: "BBR + 3.99%",
      termRange: "2-40 years",
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
    products: [
      { type: "2-Year Fixed", code: "H2F", baseRate: 4.49, erc: "4%, 3%", rates: null },
      { type: "5-Year Fixed", code: "H5F", baseRate: 4.89, erc: "5%, 4%, 3%, 2%, 1%", rates: null },
      { type: "2-Year Tracker", code: "HTR", baseRate: 5.14, erc: "No ERCs", rates: null },
    ],
  },
  {
    name: "Professional",
    color: "#3B82F6",
    desc: "Qualified professionals \u00b7 Enhanced income multiples \u00b7 Reduced rates",
    maxLTV: 90,
    acceptedCreditProfiles: ["clean", "near_prime", "light_adverse"],
    tierOverrides: { employment: { "Self-Employed": 0.10 } },
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a32,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 80 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      incomeMultiple: "5.50x single / 5.50x joint",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0", maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted", bankruptcy: "Not accepted", dmp: "Not accepted",
      },
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)", "Specified professionals / qualifications"],
      property: {
        minValue: "\u00a3100,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
    },
    fees: {
      productFee: "\u00a31,495",
      reversion: "BBR + 2.99%",
      termRange: "2-40 years",
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
    products: [
      { type: "2-Year Fixed", code: "D2F", baseRate: 3.69, erc: "2%, 1%", rates: null },
      { type: "5-Year Fixed", code: "D5F", baseRate: 4.09, erc: "5%, 4%, 3%, 2%, 1%", rates: null },
      { type: "2-Year Tracker", code: "DTR", baseRate: 4.24, erc: "No ERCs", rates: null },
    ],
  },
  {
    name: "High-Net-Worth",
    color: "#8B5CF6",
    desc: "\u00a3300k+ income or \u00a33M+ net assets \u00b7 Bespoke pricing",
    maxLTV: 75,
    acceptedCreditProfiles: ["clean"],
    tierOverrides: { ltv: [{ band: "\u226460%", adj: -0.10 }, { band: "60-75%", adj: 0.15 }] },
    criteria: {
      loanSize: { min: "\u00a3150,000", max: "\u00a35,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 85 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      incomeMultiple: "Bespoke (no fixed multiple)",
      stressRate: "Bespoke assessment",
      credit: {
        maxCCJs: "0", maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted", bankruptcy: "Not accepted", dmp: "Not accepted",
      },
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      property: {
        minValue: "\u00a3250,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      additionalNotes: "\u00a3300k+ income or \u00a33M+ net assets required",
    },
    fees: {
      productFee: "\u00a31,495",
      reversion: "BBR + 2.49%",
      termRange: "2-40 years",
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
    products: [
      { type: "2-Year Fixed", code: "M2F", baseRate: 3.49, erc: "2%, 1%", rates: null },
      { type: "5-Year Fixed", code: "M5F", baseRate: 3.89, erc: "5%, 4%, 3%, 2%, 1%", rates: null },
      { type: "2-Year Tracker", code: "MTR", baseRate: 4.04, erc: "No ERCs", rates: null },
    ],
  },
  {
    name: "Buy-to-Let",
    color: "#F59E0B",
    desc: "Investment properties \u00b7 ICR 145% \u00b7 Portfolio landlords accepted",
    maxLTV: 75,
    acceptedCreditProfiles: ["clean", "near_prime", "light_adverse", "adverse", "heavy_adverse"],
    tierOverrides: { ltv: [{ band: "\u226460%", adj: 0.00 }, { band: "60-75%", adj: 0.50 }], employment: {} },
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a32,000,000" },
      maxApplicants: 4,
      age: { min: 21, maxAtEnd: 85 },
      residency: "UK citizen / Settled / Pre-settled status / Ltd companies / SPVs accepted",
      minUKResidency: "3 years",
      incomeMultiple: "N/A \u2014 rental coverage assessed instead",
      stressRate: "5.50% stress rate, ICR 145%",
      credit: {
        maxCCJs: "2 (satisfied, >12 months)",
        maxDefaults: "1 (satisfied, >36 months)",
        missedPayments: "Max 1 in last 12 months",
        iva: "Discharged >3 years",
        bankruptcy: "Discharged >6 years",
        dmp: "Not accepted",
      },
      employment: ["Any \u2014 income not assessed for standard BTL", "Portfolio landlords accepted", "First-time landlords accepted (max 75% LTV)"],
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority", "HMO subject to criteria"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats", "Holiday lets not accepted"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      tenancy: "AST only (min 6 months)",
      experience: "No experience required for first property",
    },
    fees: {
      productFee: "\u00a31,995",
      reversion: "BBR + 4.49%",
      termRange: "5-25 years",
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
    products: [
      { type: "2-Year Fixed", code: "B2F", baseRate: 5.19, erc: "3%, 2%", rates: null },
      { type: "5-Year Fixed", code: "B5F", baseRate: 5.49, erc: "5%, 4%, 3%, 2%, 1%", rates: null },
      { type: "Tracker", code: "BTR", baseRate: 5.49, erc: "No ERCs", rates: null },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const rateColor = (r) => {
  if (r === null || r === undefined) return T.textMuted;
  if (r < 4.5) return "#059669";
  if (r <= 5.5) return "#D97706";
  return "#DC2626";
};

const creditColor = (v) =>
  v === "Not accepted" || v === "0" ? "#DC2626" : "#059669";

const emptyBucket = () => ({
  name: "",
  color: "#059669",
  desc: "",
  maxLTV: 75,
  acceptedCreditProfiles: ["clean"],
  tierOverrides: {},
  criteria: {
    loanSize: { min: "", max: "" },
    maxApplicants: 2,
    age: { min: 21, maxAtEnd: 75 },
    residency: "UK citizen / Settled / Pre-settled status",
    minUKResidency: "3 years",
    employment: [],
    incomeMultiple: "",
    stressRate: "",
    credit: {
      maxCCJs: "0", maxDefaults: "0", missedPayments: "",
      iva: "Not accepted", bankruptcy: "Not accepted", dmp: "Not accepted",
    },
    property: { minValue: "", acceptable: [], unacceptable: [], valuation: "" },
  },
  fees: {
    productFee: "\u00a31,495",
    reversion: "BBR + 3.99%",
    termRange: "2-40 years",
    valuationFees: [],
  },
  products: [],
});

const emptyProduct = () => ({
  type: "", code: "", baseRate: 4.50, erc: "", rates: null,
});

// ─────────────────────────────────────────────
// BUCKET FORM MODAL
// ─────────────────────────────────────────────
function BucketFormModal({ bucket, onSave, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!bucket) return emptyBucket();
    return JSON.parse(JSON.stringify(bucket));
  });

  const set = (path, val) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const toggleInArray = (path, item) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      const arr = obj[keys[keys.length - 1]];
      const idx = arr.indexOf(item);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(item);
      return next;
    });
  };

  const addProduct = () => {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, emptyProduct()],
    }));
  };

  const removeProduct = (idx) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== idx),
    }));
  };

  const setProduct = (idx, field, val) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.products[idx][field] = val;
      return next;
    });
  };

  const addValuationTier = () => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.fees.valuationFees) next.fees.valuationFees = [];
      next.fees.valuationFees.push({ upTo: "", fee: "" });
      return next;
    });
  };

  const removeValuationTier = (idx) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.fees.valuationFees.splice(idx, 1);
      return next;
    });
  };

  const setValuationTier = (idx, field, val) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.fees.valuationFees[idx][field] = val;
      return next;
    });
  };

  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };
  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const sectionTitleSt = {
    fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12, marginTop: 24,
    paddingBottom: 6, borderBottom: `2px solid ${T.borderLight}`,
  };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const row3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
  const fieldWrap = { marginBottom: 12 };

  const chipSt = (active, color) => ({
    display: "inline-block", padding: "5px 12px", borderRadius: 16,
    fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 6, marginBottom: 6,
    border: active ? `2px solid ${color || T.primary}` : `1px solid ${T.border}`,
    background: active ? (color ? color + "18" : T.primaryLight) : T.card,
    color: active ? (color || T.primary) : T.textMuted, transition: "all 0.15s",
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        style={{ width: 720, maxHeight: "90vh", overflow: "auto", background: T.card, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
          {bucket ? "Edit Bucket" : "Create Bucket"}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
          {bucket ? "Modify the product bucket configuration below." : "Fill in the details for the new product bucket."}
        </div>

        {/* SECTION 1: IDENTITY */}
        <div style={sectionTitleSt}>1. Identity</div>
        <div style={fieldWrap}>
          <label style={labelSt}>Name</label>
          <input style={inputSt} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Prime" />
        </div>
        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Colour</label>
            <select style={inputSt} value={form.color} onChange={(e) => set("color", e.target.value)}>
              {COLOUR_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Preview</label>
            <div style={{ height: 36, borderRadius: 7, background: form.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {form.name || "Bucket"}
            </div>
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelSt}>Description</label>
          <input style={inputSt} value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Short description of this bucket" />
        </div>

        {/* SECTION 2: ELIGIBILITY */}
        <div style={sectionTitleSt}>2. Eligibility Criteria</div>
        <div style={row2}>
          <div style={fieldWrap}>
            <label style={labelSt}>Loan Size Min</label>
            <input style={inputSt} value={form.criteria.loanSize.min} onChange={(e) => set("criteria.loanSize.min", e.target.value)} placeholder="\u00a325,000" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Loan Size Max</label>
            <input style={inputSt} value={form.criteria.loanSize.max} onChange={(e) => set("criteria.loanSize.max", e.target.value)} placeholder="\u00a31,000,000" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div style={fieldWrap}>
            <label style={labelSt}>Max Applicants</label>
            <input style={inputSt} type="number" value={form.criteria.maxApplicants} onChange={(e) => set("criteria.maxApplicants", Number(e.target.value))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Min Age</label>
            <input style={inputSt} type="number" value={form.criteria.age.min} onChange={(e) => set("criteria.age.min", Number(e.target.value))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Max Age at End</label>
            <input style={inputSt} type="number" value={form.criteria.age.maxAtEnd} onChange={(e) => set("criteria.age.maxAtEnd", Number(e.target.value))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Max LTV %</label>
            <input style={inputSt} type="number" value={form.maxLTV} onChange={(e) => set("maxLTV", Number(e.target.value))} />
          </div>
        </div>
        <div style={row2}>
          <div style={fieldWrap}>
            <label style={labelSt}>UK Residency</label>
            <input style={inputSt} value={form.criteria.residency} onChange={(e) => set("criteria.residency", e.target.value)} placeholder="UK citizen / Settled" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Min UK Residency</label>
            <input style={inputSt} value={form.criteria.minUKResidency} onChange={(e) => set("criteria.minUKResidency", e.target.value)} placeholder="3 years" />
          </div>
        </div>
        <div style={row2}>
          <div style={fieldWrap}>
            <label style={labelSt}>Income Multiple</label>
            <input style={inputSt} value={form.criteria.incomeMultiple} onChange={(e) => set("criteria.incomeMultiple", e.target.value)} placeholder="4.49x" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Stress Rate</label>
            <input style={inputSt} value={form.criteria.stressRate} onChange={(e) => set("criteria.stressRate", e.target.value)} placeholder="SVR + 1% or 5.50%" />
          </div>
        </div>

        {/* SECTION 3: ACCEPTED CREDIT PROFILES */}
        <div style={sectionTitleSt}>3. Accepted Credit Profiles</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
          Select which credit profiles this bucket accepts. Rates are adjusted automatically based on the profile's pricing adjustment.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 12 }}>
          {CREDIT_PROFILES.map((cp) => (
            <span
              key={cp.id}
              style={chipSt((form.acceptedCreditProfiles || []).includes(cp.id), "#059669")}
              onClick={() => {
                setForm((prev) => {
                  const next = JSON.parse(JSON.stringify(prev));
                  if (!next.acceptedCreditProfiles) next.acceptedCreditProfiles = [];
                  const idx = next.acceptedCreditProfiles.indexOf(cp.id);
                  if (idx >= 0) next.acceptedCreditProfiles.splice(idx, 1);
                  else next.acceptedCreditProfiles.push(cp.id);
                  return next;
                });
              }}
            >
              {cp.label} {cp.adj >= 0 ? "+" : ""}{cp.adj.toFixed(2)}%
            </span>
          ))}
        </div>

        {/* SECTION 4: EMPLOYMENT */}
        <div style={sectionTitleSt}>4. Employment</div>
        <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 12 }}>
          {ALL_EMPLOYMENT.map((emp) => (
            <span key={emp} style={chipSt((form.criteria.employment || []).includes(emp), "#4338CA")} onClick={() => toggleInArray("criteria.employment", emp)}>
              {emp}
            </span>
          ))}
        </div>

        {/* SECTION 5: PROPERTY */}
        <div style={sectionTitleSt}>5. Property</div>
        <div style={fieldWrap}>
          <label style={labelSt}>Min Value</label>
          <input style={{ ...inputSt, maxWidth: 200 }} value={form.criteria.property.minValue} onChange={(e) => set("criteria.property.minValue", e.target.value)} placeholder="\u00a375,000" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Acceptable Types</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {ALL_ACCEPTABLE_TYPES.map((t) => (
              <span key={t} style={chipSt((form.criteria.property.acceptable || []).includes(t), "#059669")} onClick={() => toggleInArray("criteria.property.acceptable", t)}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Unacceptable Types</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {ALL_UNACCEPTABLE_TYPES.map((t) => (
              <span key={t} style={chipSt((form.criteria.property.unacceptable || []).includes(t), "#DC2626")} onClick={() => toggleInArray("criteria.property.unacceptable", t)}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelSt}>Valuation Rule</label>
          <input style={inputSt} value={form.criteria.property.valuation} onChange={(e) => set("criteria.property.valuation", e.target.value)} placeholder="Full valuation required." />
        </div>

        {/* SECTION 6: FEES & TERMS */}
        <div style={sectionTitleSt}>6. Fees & Terms</div>
        <div style={row3}>
          <div style={fieldWrap}>
            <label style={labelSt}>Product Fee</label>
            <input style={inputSt} value={form.fees.productFee} onChange={(e) => set("fees.productFee", e.target.value)} placeholder="\u00a31,495" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Term Range</label>
            <input style={inputSt} value={form.fees.termRange} onChange={(e) => set("fees.termRange", e.target.value)} placeholder="2-40 years" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Reversion Rate</label>
            <input style={inputSt} value={form.fees.reversion} onChange={(e) => set("fees.reversion", e.target.value)} placeholder="BBR + 3.99%" />
          </div>
        </div>

        {/* SECTION 7: INITIAL PRODUCTS */}
        <div style={sectionTitleSt}>7. Products</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12 }}>
          Define the product types for this bucket. Rates are auto-generated from the base rate + LTV adjustments.
        </div>
        {(form.products || []).map((prod, pIdx) => (
          <div key={pIdx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 32px", gap: 8, marginBottom: 8, alignItems: "end" }}>
            <div>
              {pIdx === 0 && <label style={labelSt}>Type</label>}
              <input style={inputSt} value={prod.type} onChange={(e) => setProduct(pIdx, "type", e.target.value)} placeholder="e.g. 2-Year Fixed" />
            </div>
            <div>
              {pIdx === 0 && <label style={labelSt}>Code</label>}
              <input style={inputSt} value={prod.code} onChange={(e) => setProduct(pIdx, "code", e.target.value)} placeholder="P2F" />
            </div>
            <div>
              {pIdx === 0 && <label style={labelSt}>Base Rate</label>}
              <input style={inputSt} type="number" step="0.01" value={prod.baseRate} onChange={(e) => setProduct(pIdx, "baseRate", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              {pIdx === 0 && <label style={labelSt}>ERC</label>}
              <input style={inputSt} value={prod.erc} onChange={(e) => setProduct(pIdx, "erc", e.target.value)} placeholder="3%, 2%" />
            </div>
            <span
              onClick={() => removeProduct(pIdx)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 34, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", transition: "background 0.15s", marginBottom: 1 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {Ico.x(14)}
            </span>
          </div>
        ))}
        <Btn small onClick={addProduct} style={{ marginTop: 4, marginBottom: 8 }}>
          + Add Product
        </Btn>

        {/* FOOTER */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => { if (!form.name.trim()) return; onSave(form); }}>
            Save Bucket
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DELETE CONFIRMATION
// ─────────────────────────────────────────────
function DeleteConfirmDialog({ bucketName, onConfirm, onCancel }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        style={{ width: 420, background: T.card, borderRadius: 14, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font, textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 48, height: 48, borderRadius: 24, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16", color: T.danger }}>
          {Ico.alert(24)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 8 }}>
          Delete Bucket
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: T.text }}>{bucketName}</strong>? This will remove all products and rate configurations. This action cannot be undone.
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn danger onClick={onConfirm}>Delete Bucket</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CRITERIA TABLE
// ─────────────────────────────────────────────
function CriteriaTable({ bucket }) {
  const c = bucket.criteria;
  if (!c) return null;

  const sectionHeaderSt = {
    padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 1, color: bucket.color, background: bucket.color + "14",
    borderBottom: `1px solid ${T.borderLight}`,
  };
  const rowSt = (i) => ({
    display: "flex", borderBottom: `1px solid ${T.borderLight}`,
    background: i % 2 === 0 ? "#FAFAF8" : "#FFFFFF",
  });
  const labelCellSt = { width: "40%", padding: "9px 14px", fontSize: 12, fontWeight: 600, color: T.navy };
  const valueCellSt = { width: "60%", padding: "9px 14px", fontSize: 12, color: T.text, fontWeight: 400 };
  const pillBase = { display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 12, marginRight: 5, marginBottom: 3 };
  const greenPill = { ...pillBase, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" };
  const redPill = { ...pillBase, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" };
  const bluePill = { ...pillBase, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" };

  let rowIdx = 0;
  const Row = ({ label, value, valueColor, valueStyle }) => {
    const i = rowIdx++;
    return (
      <div style={rowSt(i)}>
        <div style={labelCellSt}>{label}</div>
        <div style={{ ...valueCellSt, color: valueColor || valueCellSt.color, ...valueStyle }}>{value}</div>
      </div>
    );
  };
  const PillRow = ({ label, items, pillStyle }) => {
    const i = rowIdx++;
    return (
      <div style={rowSt(i)}>
        <div style={labelCellSt}>{label}</div>
        <div style={{ ...valueCellSt, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0 }}>
          {items.map((item) => <span key={item} style={pillStyle}>{item}</span>)}
        </div>
      </div>
    );
  };

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", fontFamily: T.font }}>
      <div style={sectionHeaderSt}>Applicant</div>
      <Row label="Loan Size" value={`${c.loanSize.min} \u2013 ${c.loanSize.max}`} />
      <Row label="Max Applicants" value={`${c.maxApplicants}${c.maxApplicants === 4 ? " (for SPV/Ltd)" : ""}`} />
      <Row label="Age Range" value={`${c.age.min} \u2013 ${c.age.maxAtEnd} (at end of term)`} />
      <Row label="Max LTV" value={`${bucket.maxLTV}%`} />
      <Row label="UK Residency" value={c.residency} />
      <Row label="Min UK Residency" value={c.minUKResidency} />

      <div style={sectionHeaderSt}>Income & Affordability</div>
      <Row label="Income Multiple" value={c.incomeMultiple} />
      <Row label="Stress Rate" value={c.stressRate} />
      <PillRow label="Employment" items={c.employment || []} pillStyle={bluePill} />
      {c.tenancy && <Row label="Tenancy" value={c.tenancy} />}
      {c.experience && <Row label="Experience" value={c.experience} />}

      <div style={sectionHeaderSt}>Credit History</div>
      {bucket.acceptedCreditProfiles && bucket.acceptedCreditProfiles.length > 0 ? (
        <>
          <PillRow
            label="Accepted Profiles"
            items={CREDIT_PROFILES.filter(cp => (bucket.acceptedCreditProfiles || []).includes(cp.id)).map(cp => `${cp.label} (${cp.adj >= 0 ? "+" : ""}${cp.adj.toFixed(2)}%)`)}
            pillStyle={greenPill}
          />
          <PillRow
            label="Rejected Profiles"
            items={CREDIT_PROFILES.filter(cp => !(bucket.acceptedCreditProfiles || []).includes(cp.id)).map(cp => cp.label)}
            pillStyle={redPill}
          />
        </>
      ) : (
        <>
          <Row label="CCJs" value={c.credit.maxCCJs === "0" ? "None accepted" : c.credit.maxCCJs} valueColor={creditColor(c.credit.maxCCJs)} />
          <Row label="Defaults" value={c.credit.maxDefaults === "0" ? "None accepted" : c.credit.maxDefaults} valueColor={creditColor(c.credit.maxDefaults)} />
          <Row label="Missed Payments" value={c.credit.missedPayments} valueColor={creditColor(c.credit.missedPayments)} />
          <Row label="IVA" value={c.credit.iva} valueColor={creditColor(c.credit.iva)} />
          <Row label="Bankruptcy" value={c.credit.bankruptcy} valueColor={creditColor(c.credit.bankruptcy)} />
          <Row label="DMP" value={c.credit.dmp} valueColor={creditColor(c.credit.dmp)} />
        </>
      )}

      <div style={sectionHeaderSt}>Property</div>
      <Row label="Min Property Value" value={c.property.minValue} />
      <PillRow label="Acceptable Types" items={c.property.acceptable || []} pillStyle={greenPill} />
      <PillRow label="Unacceptable Types" items={c.property.unacceptable || []} pillStyle={redPill} />
      <Row label="Valuation" value={c.property.valuation} valueStyle={{ fontStyle: "italic", color: T.textMuted }} />

      {c.additionalNotes && (
        <>
          <div style={sectionHeaderSt}>Notes</div>
          <Row label="Additional" value={c.additionalNotes} valueStyle={{ fontStyle: "italic" }} />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCTS TAB
// ─────────────────────────────────────────────
function ProductsTab({ bucket, onUpdateProducts }) {
  const [products, setProducts] = useState(bucket.products || []);

  const updateProduct = (idx, field, val) => {
    const next = products.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    setProducts(next);
    onUpdateProducts(next);
  };

  const addProduct = () => {
    const next = [...products, emptyProduct()];
    setProducts(next);
    onUpdateProducts(next);
  };

  const removeProduct = (idx) => {
    const next = products.filter((_, i) => i !== idx);
    setProducts(next);
    onUpdateProducts(next);
  };

  const inputSt = {
    width: "100%", padding: "7px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
        Define product types for this bucket. Rates are auto-generated from each product's base rate using the pricing engine LTV adjustments.
      </div>

      {/* Column headers */}
      {products.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 2fr 32px", gap: 10, marginBottom: 6 }}>
          <div style={labelSt}>Product Type</div>
          <div style={labelSt}>Code</div>
          <div style={labelSt}>Base Rate</div>
          <div style={labelSt}>ERC Schedule</div>
          <div />
        </div>
      )}

      {products.map((prod, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px 2fr 32px", gap: 10, marginBottom: 8, alignItems: "center" }}>
          <input style={inputSt} value={prod.type} onChange={(e) => updateProduct(idx, "type", e.target.value)} placeholder="e.g. 2-Year Fixed" />
          <input style={inputSt} value={prod.code} onChange={(e) => updateProduct(idx, "code", e.target.value)} placeholder="P2F" />
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inputSt, paddingRight: 20 }}
              type="number" step="0.01" value={prod.baseRate}
              onChange={(e) => updateProduct(idx, "baseRate", parseFloat(e.target.value) || 0)}
            />
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: T.textMuted }}>%</span>
          </div>
          <input style={inputSt} value={prod.erc} onChange={(e) => updateProduct(idx, "erc", e.target.value)} placeholder="3%, 2%" />
          <span
            onClick={() => removeProduct(idx)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {Ico.x(14)}
          </span>
        </div>
      ))}

      {products.length === 0 && (
        <div style={{ padding: "24px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>
          No products configured yet. Add a product to get started.
        </div>
      )}

      <Btn small onClick={addProduct} style={{ marginTop: 8 }}>
        + Add Product
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────
// FEES & TERMS TAB
// ─────────────────────────────────────────────
function FeesTab({ bucket, onUpdateFees }) {
  const [fees, setFees] = useState(bucket.fees || { productFee: "", reversion: "", termRange: "", valuationFees: [] });

  const updateField = (field, val) => {
    const next = { ...fees, [field]: val };
    setFees(next);
    onUpdateFees(next);
  };

  const addTier = () => {
    const next = { ...fees, valuationFees: [...(fees.valuationFees || []), { upTo: "", fee: "" }] };
    setFees(next);
    onUpdateFees(next);
  };

  const removeTier = (idx) => {
    const next = { ...fees, valuationFees: fees.valuationFees.filter((_, i) => i !== idx) };
    setFees(next);
    onUpdateFees(next);
  };

  const updateTier = (idx, field, val) => {
    const tiers = fees.valuationFees.map((t, i) => i === idx ? { ...t, [field]: val } : t);
    const next = { ...fees, valuationFees: tiers };
    setFees(next);
    onUpdateFees(next);
  };

  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const cardSt = {
    padding: "14px 16px", borderRadius: 10, background: T.bg,
    border: `1px solid ${T.borderLight}`,
  };
  const cardLabelSt = { fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 };

  return (
    <div>
      {/* Editable fee cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={cardSt}>
          <div style={cardLabelSt}>Product Fee</div>
          <input style={inputSt} value={fees.productFee} onChange={(e) => updateField("productFee", e.target.value)} placeholder="\u00a31,495" />
        </div>
        <div style={cardSt}>
          <div style={cardLabelSt}>Loan Term</div>
          <input style={inputSt} value={fees.termRange} onChange={(e) => updateField("termRange", e.target.value)} placeholder="2-40 years" />
        </div>
        <div style={cardSt}>
          <div style={cardLabelSt}>Reversion Rate</div>
          <input style={inputSt} value={fees.reversion} onChange={(e) => updateField("reversion", e.target.value)} placeholder="BBR + 3.99%" />
        </div>
      </div>

      {/* ERC per product */}
      {bucket.products && bucket.products.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>
            Early Repayment Charges
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {bucket.products.map((p) => (
              <div key={p.code || p.type} style={{ flex: "1 1 0", minWidth: 140, padding: "10px 14px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>{p.type}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.erc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valuation fee scale */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 10 }}>
          Valuation Fee Scale
        </div>
        {(fees.valuationFees || []).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Property Value Up To</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>Fee</div>
            <div />
          </div>
        )}
        {(fees.valuationFees || []).map((tier, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 8, marginBottom: 6, alignItems: "center" }}>
            <input style={inputSt} value={tier.upTo} onChange={(e) => updateTier(idx, "upTo", e.target.value)} placeholder="\u00a3100,000" />
            <input style={inputSt} value={tier.fee} onChange={(e) => updateTier(idx, "fee", e.target.value)} placeholder="\u00a3150" />
            <span
              onClick={() => removeTier(idx)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {Ico.x(14)}
            </span>
          </div>
        ))}
        <Btn small onClick={addTier} style={{ marginTop: 4 }}>
          + Add Tier
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RATES TAB — Auto-generated from pricing engine
// ─────────────────────────────────────────────
function RatesTab({ bucket }) {
  const products = bucket.products || [];
  if (products.length === 0) {
    return (
      <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic", padding: "20px 0" }}>
        No products configured for this bucket yet. Add products in the Products tab.
      </div>
    );
  }

  const maxLTV = bucket.maxLTV || 75;
  const overrides = bucket.tierOverrides || {};
  const acceptedProfiles = (bucket.acceptedCreditProfiles || ["clean"])
    .map(id => CREDIT_PROFILES.find(cp => cp.id === id))
    .filter(Boolean);

  // Determine LTV tiers to use
  const ltvTiers = overrides.ltv || LTV_ADJUSTMENTS;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMuted, width: 160, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Profile / LTV
              </th>
              {products.map((p) => (
                <th key={p.code} style={{ textAlign: "center", padding: "8px 6px", fontSize: 11, fontWeight: 700, color: T.navy, minWidth: 100 }}>
                  <div>{p.type}</div>
                  <div style={{ fontSize: 9, fontWeight: 500, color: T.textMuted, marginTop: 2 }}>Base: {(p.baseRate || 0).toFixed(2)}%</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {acceptedProfiles.map((profile) => {
              const creditAdj = profile.adj || 0;
              return [
                // Credit profile section header
                <tr key={`header-${profile.id}`} style={{ background: bucket.color + "14" }}>
                  <td
                    colSpan={products.length + 1}
                    style={{ padding: "7px 10px", fontSize: 11, fontWeight: 700, color: bucket.color, letterSpacing: 0.3 }}
                  >
                    {"\u25B8"} {profile.label} ({creditAdj >= 0 ? "+" : ""}{creditAdj.toFixed(2)}%)
                  </td>
                </tr>,
                // LTV band rows under this credit profile
                ...ltvTiers.map((ltv, rIdx) => {
                  const globalLtv = LTV_ADJUSTMENTS.find(g => g.band === ltv.band) || ltv;
                  const mid = Math.round(((globalLtv.min || 0) + (globalLtv.max || 75)) / 2) || 30;
                  const ltvAdj = ltv.adj != null ? ltv.adj : globalLtv.adj || 0;
                  return (
                    <tr key={`${profile.id}-${ltv.band}`} style={{ borderBottom: `1px solid ${T.borderLight}`, background: rIdx % 2 === 0 ? "#FAFAF8" : "#FFFFFF" }}>
                      <td style={{ padding: "8px 10px 8px 24px", fontWeight: 600, fontSize: 12, color: T.navy, whiteSpace: "nowrap" }}>
                        {ltv.band}
                      </td>
                      {products.map((prod) => {
                        const base = parseFloat(prod.baseRate) || 0;
                        if (mid > maxLTV) {
                          return (
                            <td key={prod.code + ltv.band} style={{ textAlign: "center", padding: "7px 6px", verticalAlign: "middle" }}>
                              <span style={{ color: "#CBD5E1", fontSize: 14 }}>&mdash;</span>
                            </td>
                          );
                        }
                        const rate = Math.round((base + ltvAdj + creditAdj) * 100) / 100;
                        const code = prod.code + ltv.band.replace(/[^0-9]/g, "");
                        return (
                          <td key={prod.code + ltv.band} style={{ textAlign: "center", padding: "7px 6px", verticalAlign: "middle" }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 13, color: rateColor(rate) }}>
                                {rate.toFixed(2)}%
                              </span>
                              <div style={{ fontSize: 9, color: T.textMuted, marginTop: 1, letterSpacing: 0.2 }}>
                                ({code})
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.borderLight}`, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#059669", display: "inline-block" }} />
          {"< 4.50%"}
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#D97706", display: "inline-block" }} />
          4.50% - 5.50%
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#DC2626", display: "inline-block" }} />
          {"> 5.50%"}
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>
          Rate = base + LTV adj + credit adj. Max LTV: {maxLTV}%
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TIERS TAB — Override pricing dimensions per bucket
// ─────────────────────────────────────────────
function TiersTab({ bucket, onUpdateTierOverrides }) {
  const overrides = bucket.tierOverrides || {};

  const setOverride = (dimension, key, val) => {
    const next = JSON.parse(JSON.stringify(overrides));
    if (!next[dimension]) next[dimension] = dimension === "ltv" ? [] : {};
    if (dimension === "ltv") {
      const idx = next[dimension].findIndex(t => t.band === key);
      if (val === "" || val === null || val === undefined) {
        if (idx >= 0) next[dimension].splice(idx, 1);
        if (next[dimension].length === 0) delete next[dimension];
      } else {
        if (idx >= 0) next[dimension][idx].adj = parseFloat(val);
        else next[dimension].push({ band: key, adj: parseFloat(val) });
      }
    } else {
      if (val === "" || val === null || val === undefined) {
        delete next[dimension][key];
        if (Object.keys(next[dimension]).length === 0) delete next[dimension];
      } else {
        next[dimension][key] = parseFloat(val);
      }
    }
    onUpdateTierOverrides(next);
  };

  const resetAll = () => {
    onUpdateTierOverrides({});
  };

  const inputSt = {
    width: 80, padding: "5px 8px", borderRadius: 6, textAlign: "center",
    border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none",
  };
  const thSt = { textAlign: "left", padding: "7px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 };
  const tdSt = { padding: "7px 10px", fontSize: 12, color: T.text };
  const sectionSt = { fontSize: 11, fontWeight: 700, color: bucket.color, padding: "8px 10px", background: bucket.color + "14", textTransform: "uppercase", letterSpacing: 0.8 };

  const hasAnyOverride = Object.keys(overrides).length > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>
          Blank fields inherit from global defaults. Overridden values are highlighted in amber.
        </div>
        {hasAnyOverride && (
          <Btn small onClick={resetAll} style={{ fontSize: 10 }}>
            Reset to Global
          </Btn>
        )}
      </div>

      <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", fontFamily: T.font }}>
        {/* LTV Adjustments */}
        <div style={sectionSt}>LTV Adjustments</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={thSt}>Band</th>
              <th style={thSt}>Global Default</th>
              <th style={thSt}>Override</th>
              <th style={thSt}>Effective</th>
            </tr>
          </thead>
          <tbody>
            {LTV_ADJUSTMENTS.map((ltv, i) => {
              const ov = overrides.ltv && overrides.ltv.find(t => t.band === ltv.band);
              const hasOv = ov != null;
              const effective = hasOv ? ov.adj : ltv.adj;
              return (
                <tr key={ltv.band} style={{ borderBottom: `1px solid ${T.borderLight}`, background: hasOv ? "#FFFBEB" : i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                  <td style={{ ...tdSt, fontWeight: 600, color: T.navy }}>{ltv.band}</td>
                  <td style={tdSt}>{ltv.adj >= 0 ? "+" : ""}{ltv.adj.toFixed(2)}%</td>
                  <td style={tdSt}>
                    <input
                      style={{ ...inputSt, borderColor: hasOv ? "#F59E0B" : T.border }}
                      type="number" step="0.01"
                      value={hasOv ? ov.adj : ""}
                      placeholder="\u2014"
                      onChange={(e) => setOverride("ltv", ltv.band, e.target.value)}
                    />
                  </td>
                  <td style={{ ...tdSt, fontWeight: 700, color: hasOv ? "#D97706" : T.text }}>
                    {effective >= 0 ? "+" : ""}{effective.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Credit Profile Adjustments */}
        <div style={sectionSt}>Credit Profile Adjustments</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={thSt}>Profile</th>
              <th style={thSt}>Global Default</th>
              <th style={thSt}>Override</th>
              <th style={thSt}>Effective</th>
            </tr>
          </thead>
          <tbody>
            {CREDIT_PROFILES.map((cp, i) => {
              const ov = overrides.credit && overrides.credit[cp.id];
              const hasOv = ov != null;
              const effective = hasOv ? ov : cp.adj;
              return (
                <tr key={cp.id} style={{ borderBottom: `1px solid ${T.borderLight}`, background: hasOv ? "#FFFBEB" : i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                  <td style={{ ...tdSt, fontWeight: 600, color: T.navy }}>{cp.label}</td>
                  <td style={tdSt}>{cp.adj >= 0 ? "+" : ""}{cp.adj.toFixed(2)}%</td>
                  <td style={tdSt}>
                    <input
                      style={{ ...inputSt, borderColor: hasOv ? "#F59E0B" : T.border }}
                      type="number" step="0.01"
                      value={hasOv ? ov : ""}
                      placeholder="\u2014"
                      onChange={(e) => setOverride("credit", cp.id, e.target.value)}
                    />
                  </td>
                  <td style={{ ...tdSt, fontWeight: 700, color: hasOv ? "#D97706" : T.text }}>
                    {effective >= 0 ? "+" : ""}{effective.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Employment Adjustments */}
        <div style={sectionSt}>Employment Adjustments</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={thSt}>Type</th>
              <th style={thSt}>Global Default</th>
              <th style={thSt}>Override</th>
              <th style={thSt}>Effective</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(EMPLOYMENT_ADJUSTMENTS).map(([type, adj], i) => {
              const ov = overrides.employment && overrides.employment[type];
              const hasOv = ov != null;
              const effective = hasOv ? ov : adj;
              return (
                <tr key={type} style={{ borderBottom: `1px solid ${T.borderLight}`, background: hasOv ? "#FFFBEB" : i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                  <td style={{ ...tdSt, fontWeight: 600, color: T.navy }}>{type}</td>
                  <td style={tdSt}>{adj >= 0 ? "+" : ""}{adj.toFixed(2)}%</td>
                  <td style={tdSt}>
                    <input
                      style={{ ...inputSt, borderColor: hasOv ? "#F59E0B" : T.border }}
                      type="number" step="0.01"
                      value={hasOv ? ov : ""}
                      placeholder="\u2014"
                      onChange={(e) => setOverride("employment", type, e.target.value)}
                    />
                  </td>
                  <td style={{ ...tdSt, fontWeight: 700, color: hasOv ? "#D97706" : T.text }}>
                    {effective >= 0 ? "+" : ""}{effective.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ProductBuckets() {
  const [buckets, setBuckets] = useState(loadBuckets);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [bucketTab, setBucketTab] = useState({});
  const [editingIdx, setEditingIdx] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    saveBuckets(buckets);
  }, [buckets]);

  const toggleBucket = (i) => {
    setExpandedIdx(expandedIdx === i ? null : i);
    if (!bucketTab[i]) setBucketTab((prev) => ({ ...prev, [i]: "rates" }));
  };
  const getTab = (i) => bucketTab[i] || "rates";
  const setTab = (i, tab) => setBucketTab((prev) => ({ ...prev, [i]: tab }));

  const handleSaveNew = (form) => {
    setBuckets((prev) => [...prev, form]);
    setShowCreateModal(false);
  };

  const handleSaveEdit = (form) => {
    setBuckets((prev) => {
      const next = [...prev];
      next[editingIdx] = form;
      return next;
    });
    setEditingIdx(null);
  };

  const handleDelete = (idx) => {
    setBuckets((prev) => prev.filter((_, i) => i !== idx));
    setDeleteConfirm(null);
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateBucketProducts = (bIdx, products) => {
    setBuckets((prev) => {
      const next = [...prev];
      next[bIdx] = { ...next[bIdx], products };
      return next;
    });
  };

  const updateBucketFees = (bIdx, fees) => {
    setBuckets((prev) => {
      const next = [...prev];
      next[bIdx] = { ...next[bIdx], fees };
      return next;
    });
  };

  const updateBucketTierOverrides = (bIdx, tierOverrides) => {
    setBuckets((prev) => {
      const next = [...prev];
      next[bIdx] = { ...next[bIdx], tierOverrides };
      return next;
    });
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
            Product Catalogue
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Bucket-based product hierarchy with auto-generated rate grids from the pricing engine
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>
            Bank Base Rate: 4.75%
          </span>
          <Btn primary small onClick={() => setShowCreateModal(true)}>
            + Create Bucket
          </Btn>
        </div>
      </div>

      {/* ── BUCKET CARDS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {buckets.map((bucket, bIdx) => (
          <Card key={bucket.name + bIdx} noPad style={{ overflow: "hidden" }}>
            {/* Colour strip */}
            <div style={{ height: 6, background: bucket.color }} />

            {/* Bucket header */}
            <div
              style={{ padding: "16px 24px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}
              onClick={() => toggleBucket(bIdx)}
            >
              {/* Pill badge */}
              <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: 20, background: bucket.color, color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
                {bucket.name}
              </span>
              <span style={{ fontSize: 12, color: T.textMuted, flex: 1 }}>
                {bucket.desc}
              </span>
              {/* Product count */}
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: T.bg, color: T.textMuted, border: `1px solid ${T.borderLight}` }}>
                {(bucket.products || []).length} product{(bucket.products || []).length !== 1 ? "s" : ""}
              </span>

              {/* Edit button */}
              <span
                title="Edit bucket"
                onClick={(e) => { e.stopPropagation(); setEditingIdx(bIdx); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.textMuted, background: "transparent", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.primaryLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {Ico.settings(14)}
              </span>

              {/* Delete button */}
              <span
                title="Delete bucket"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(bIdx); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.textMuted, background: "transparent", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {Ico.x(14)}
              </span>

              {/* Chevron */}
              <span style={{ transform: expandedIdx === bIdx ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "flex", color: T.textMuted }}>
                {Ico.arrow(16)}
              </span>
            </div>

            {/* Expanded content */}
            {expandedIdx === bIdx && (
              <div style={{ padding: "0 24px 20px" }}>
                {/* Tab bar */}
                <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 16 }}>
                  {[
                    { id: "rates", label: "Rates" },
                    { id: "products", label: "Products" },
                    { id: "criteria", label: "Criteria" },
                    { id: "fees", label: "Fees & Terms" },
                    { id: "tiers", label: "Tiers" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTab(bIdx, tab.id)}
                      style={{
                        padding: "8px 18px", border: "none", background: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: getTab(bIdx) === tab.id ? 700 : 500, fontFamily: T.font,
                        color: getTab(bIdx) === tab.id ? bucket.color : T.textMuted,
                        borderBottom: getTab(bIdx) === tab.id ? `2.5px solid ${bucket.color}` : "2.5px solid transparent",
                        marginBottom: -2,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB: RATES */}
                {getTab(bIdx) === "rates" && <RatesTab bucket={bucket} />}

                {/* TAB: PRODUCTS */}
                {getTab(bIdx) === "products" && (
                  <ProductsTab
                    bucket={bucket}
                    onUpdateProducts={(prods) => updateBucketProducts(bIdx, prods)}
                  />
                )}

                {/* TAB: CRITERIA */}
                {getTab(bIdx) === "criteria" && <CriteriaTable bucket={bucket} />}

                {/* TAB: FEES & TERMS */}
                {getTab(bIdx) === "fees" && (
                  <FeesTab
                    bucket={bucket}
                    onUpdateFees={(f) => updateBucketFees(bIdx, f)}
                  />
                )}

                {/* TAB: TIERS */}
                {getTab(bIdx) === "tiers" && (
                  <TiersTab
                    bucket={bucket}
                    onUpdateTierOverrides={(o) => updateBucketTierOverrides(bIdx, o)}
                  />
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ── MODALS ── */}
      {showCreateModal && (
        <BucketFormModal bucket={null} onSave={handleSaveNew} onCancel={() => setShowCreateModal(false)} />
      )}
      {editingIdx !== null && (
        <BucketFormModal bucket={buckets[editingIdx]} onSave={handleSaveEdit} onCancel={() => setEditingIdx(null)} />
      )}
      {deleteConfirm !== null && (
        <DeleteConfirmDialog
          bucketName={buckets[deleteConfirm]?.name}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
