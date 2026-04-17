import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import { CREDIT_PROFILES, PROPERTY_ADJUSTMENTS } from "../data/pricing";

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

// Dimension options for accepted-dimension selectors
const ALL_ACCEPTED_EMPLOYMENT = ["Employed", "Self-Employed", "Contractor", "Retired"];
const ALL_ACCEPTED_PROPERTY = ["Standard", "Non-Standard", "New Build", "Ex-Local Authority", "High-Rise (>6 floors)"];
const ALL_ACCEPTED_EPC = ["A", "B", "C", "D", "E", "F", "G"];

// ─────────────────────────────────────────────
// ALL LTV BANDS (used for rate grids)
// ─────────────────────────────────────────────
const ALL_LTV_BANDS = ["\u226460%", "60-75%", "75-85%", "85-90%", "90-95%"];

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
    acceptedEmployments: ["Employed", "Self-Employed", "Contractor"],
    acceptedProperties: ["Standard", "New Build", "Ex-Local Authority"],
    acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
    tierOverrides: {},
    tiers: [
      { name: "Standard", conditions: { credit: ["clean"], employment: ["Employed"], property: ["Standard"] },
        adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} },
      { name: "Self-Employed", conditions: { credit: ["clean"], employment: ["Self-Employed", "Contractor"] },
        adjustmentType: "grid", flatAdj: 0.15, gridAdj: {
          "2-Year Fixed": { "\u226460%": 0.15, "60-75%": 0.20 },
          "5-Year Fixed": { "\u226460%": 0.15, "60-75%": 0.20 },
          "2-Year Tracker": { "\u226460%": 0.15, "60-75%": 0.20 },
        }},
      { name: "Near Prime", conditions: { credit: ["near_prime"] },
        adjustmentType: "flat", flatAdj: 0.25, gridAdj: {} },
      { name: "Non-Standard Property", conditions: { property: ["Non-Standard", "Ex-Local Authority"] },
        adjustmentType: "flat", flatAdj: 0.25, gridAdj: {} },
      { name: "Green Discount", conditions: { epc: ["A", "B"] },
        adjustmentType: "flat", flatAdj: -0.15, gridAdj: {} },
    ],
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
      { type: "2-Year Fixed", code: "P2F", erc: "3%, 2%", rates: { "\u226460%": 4.19, "60-75%": 4.49 } },
      { type: "5-Year Fixed", code: "P5F", erc: "5%, 4%, 3%, 2%, 1%", rates: { "\u226460%": 4.59, "60-75%": 4.89 } },
      { type: "2-Year Tracker", code: "PTR", erc: "No ERCs", rates: { "\u226460%": 4.84, "60-75%": 5.14 } },
    ],
  },
  {
    name: "Prime High LTV",
    color: "#31B897",
    desc: "Clean credit \u00b7 Extended LTV range up to 95%",
    maxLTV: 95,
    acceptedCreditProfiles: ["clean", "near_prime"],
    acceptedEmployments: ["Employed", "Self-Employed", "Contractor"],
    acceptedProperties: ["Standard", "New Build", "Ex-Local Authority"],
    acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
    tierOverrides: {},
    tiers: [
      { name: "Standard", conditions: { credit: ["clean"], employment: ["Employed"] },
        adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} },
      { name: "Self-Employed", conditions: { employment: ["Self-Employed", "Contractor"] },
        adjustmentType: "flat", flatAdj: 0.20, gridAdj: {} },
      { name: "Near Prime", conditions: { credit: ["near_prime"] },
        adjustmentType: "flat", flatAdj: 0.25, gridAdj: {} },
      { name: "FTB 90%+", conditions: { credit: ["clean"] },
        adjustmentType: "flat", flatAdj: 0.40, gridAdj: {} },
    ],
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
      { type: "2-Year Fixed", code: "H2F", erc: "4%, 3%", rates: { "\u226460%": 4.49, "60-75%": 4.79, "75-85%": 5.29, "85-90%": 5.59, "90-95%": 5.99 } },
      { type: "5-Year Fixed", code: "H5F", erc: "5%, 4%, 3%, 2%, 1%", rates: { "\u226460%": 4.89, "60-75%": 5.19, "75-85%": 5.69, "85-90%": 5.99, "90-95%": 6.39 } },
      { type: "2-Year Tracker", code: "HTR", erc: "No ERCs", rates: { "\u226460%": 5.14, "60-75%": 5.44, "75-85%": 5.94, "85-90%": 6.24, "90-95%": 6.64 } },
    ],
  },
  {
    name: "Professional",
    color: "#3B82F6",
    desc: "Qualified professionals \u00b7 Enhanced income multiples \u00b7 Reduced rates",
    maxLTV: 90,
    acceptedCreditProfiles: ["clean", "near_prime", "light_adverse"],
    acceptedEmployments: ["Employed", "Self-Employed", "Contractor", "Retired"],
    acceptedProperties: ["Standard", "New Build"],
    acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
    tierOverrides: { employment: { "Self-Employed": 0.10 } },
    tiers: [
      { name: "Standard", conditions: { credit: ["clean"], employment: ["Employed"] },
        adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} },
      { name: "Self-Employed", conditions: { employment: ["Self-Employed", "Contractor"] },
        adjustmentType: "flat", flatAdj: 0.10, gridAdj: {} },
      { name: "Near Prime", conditions: { credit: ["near_prime"] },
        adjustmentType: "flat", flatAdj: 0.20, gridAdj: {} },
      { name: "Light Adverse", conditions: { credit: ["light_adverse"] },
        adjustmentType: "flat", flatAdj: 0.45, gridAdj: {} },
    ],
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
      { type: "2-Year Fixed", code: "D2F", erc: "2%, 1%", rates: { "\u226460%": 3.69, "60-75%": 3.99, "75-85%": 4.49, "85-90%": 4.79 } },
      { type: "5-Year Fixed", code: "D5F", erc: "5%, 4%, 3%, 2%, 1%", rates: { "\u226460%": 4.09, "60-75%": 4.39, "75-85%": 4.89, "85-90%": 5.19 } },
      { type: "2-Year Tracker", code: "DTR", erc: "No ERCs", rates: { "\u226460%": 4.34, "60-75%": 4.64, "75-85%": 5.14, "85-90%": 5.44 } },
    ],
  },
  {
    name: "High-Net-Worth",
    color: "#8B5CF6",
    desc: "\u00a3300k+ income or \u00a33M+ net assets \u00b7 Bespoke pricing",
    maxLTV: 75,
    acceptedCreditProfiles: ["clean"],
    acceptedEmployments: ["Employed", "Self-Employed"],
    acceptedProperties: ["Standard", "New Build"],
    acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
    tierOverrides: { ltv: [{ band: "\u226460%", adj: -0.10 }, { band: "60-75%", adj: 0.15 }] },
    tiers: [
      { name: "Standard", conditions: { credit: ["clean"], employment: ["Employed"] },
        adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} },
      { name: "Self-Employed", conditions: { employment: ["Self-Employed"] },
        adjustmentType: "flat", flatAdj: 0.15, gridAdj: {} },
    ],
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
      { type: "2-Year Fixed", code: "M2F", erc: "2%, 1%", rates: { "\u226460%": 3.49, "60-75%": 3.79 } },
      { type: "5-Year Fixed", code: "M5F", erc: "5%, 4%, 3%, 2%, 1%", rates: { "\u226460%": 3.89, "60-75%": 4.19 } },
      { type: "2-Year Tracker", code: "MTR", erc: "No ERCs", rates: { "\u226460%": 4.04, "60-75%": 4.34 } },
    ],
  },
  {
    name: "Buy-to-Let",
    color: "#F59E0B",
    desc: "Investment properties \u00b7 ICR 145% \u00b7 Portfolio landlords accepted",
    maxLTV: 75,
    acceptedCreditProfiles: ["clean", "near_prime", "light_adverse", "adverse", "heavy_adverse"],
    acceptedEmployments: ["Employed", "Self-Employed", "Contractor"],
    acceptedProperties: ["Standard", "New Build", "Ex-Local Authority", "High-Rise (>6 floors)"],
    acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
    tierOverrides: { ltv: [{ band: "\u226460%", adj: 0.00 }, { band: "60-75%", adj: 0.50 }], employment: {} },
    tiers: [
      { name: "Standard", conditions: { credit: ["clean"], property: ["Standard"] },
        adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} },
      { name: "Portfolio Landlord", conditions: { employment: ["Employed", "Self-Employed"] },
        adjustmentType: "flat", flatAdj: 0.10, gridAdj: {} },
      { name: "Adverse Credit", conditions: { credit: ["adverse", "heavy_adverse"] },
        adjustmentType: "flat", flatAdj: 0.50, gridAdj: {} },
      { name: "Non-Standard", conditions: { property: ["Non-Standard", "Ex-Local Authority"] },
        adjustmentType: "flat", flatAdj: 0.30, gridAdj: {} },
      { name: "HMO", conditions: { property: ["High-Rise (>6 floors)"] },
        adjustmentType: "flat", flatAdj: 0.35, gridAdj: {} },
    ],
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
      { type: "2-Year Fixed", code: "B2F", erc: "3%, 2%", rates: { "\u226460%": 5.19, "60-75%": 5.49 } },
      { type: "5-Year Fixed", code: "B5F", erc: "5%, 4%, 3%, 2%, 1%", rates: { "\u226460%": 5.49, "60-75%": 5.79 } },
      { type: "Tracker", code: "BTR", erc: "No ERCs", rates: { "\u226460%": 5.49, "60-75%": 5.79 } },
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
  acceptedEmployments: ["Employed", "Self-Employed", "Contractor"],
  acceptedProperties: ["Standard", "New Build"],
  acceptedEpc: ["A", "B", "C", "D", "E", "F", "G"],
  tierOverrides: {},
  tiers: [],
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
  type: "", code: "", erc: "", rates: {},
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

        {/* SECTION 4: EMPLOYMENT & DIMENSIONS */}
        <div style={sectionTitleSt}>4. Employment & Accepted Dimensions</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelSt}>Employment Criteria (descriptive)</label>
          <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 12 }}>
            {ALL_EMPLOYMENT.map((emp) => (
              <span key={emp} style={chipSt((form.criteria.employment || []).includes(emp), "#4338CA")} onClick={() => toggleInArray("criteria.employment", emp)}>
                {emp}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelSt}>Accepted Employment Types (pricing dimension)</label>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>Controls which employment types are accepted for pricing. Unselected types will be rejected at application.</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {ALL_ACCEPTED_EMPLOYMENT.map((emp) => (
              <span
                key={emp}
                style={chipSt((form.acceptedEmployments || []).includes(emp), "#059669")}
                onClick={() => {
                  setForm((prev) => {
                    const next = JSON.parse(JSON.stringify(prev));
                    if (!next.acceptedEmployments) next.acceptedEmployments = [];
                    const idx = next.acceptedEmployments.indexOf(emp);
                    if (idx >= 0) next.acceptedEmployments.splice(idx, 1);
                    else next.acceptedEmployments.push(emp);
                    return next;
                  });
                }}
              >
                {emp}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelSt}>Accepted Property Types (pricing dimension)</label>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>Controls which property types are accepted for pricing adjustments.</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {ALL_ACCEPTED_PROPERTY.map((pt) => (
              <span
                key={pt}
                style={chipSt((form.acceptedProperties || []).includes(pt), "#059669")}
                onClick={() => {
                  setForm((prev) => {
                    const next = JSON.parse(JSON.stringify(prev));
                    if (!next.acceptedProperties) next.acceptedProperties = [];
                    const idx = next.acceptedProperties.indexOf(pt);
                    if (idx >= 0) next.acceptedProperties.splice(idx, 1);
                    else next.acceptedProperties.push(pt);
                    return next;
                  });
                }}
              >
                {pt}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelSt}>Accepted EPC Ratings (pricing dimension)</label>
          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>Controls which EPC ratings are accepted. All selected by default.</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {ALL_ACCEPTED_EPC.map((epc) => (
              <span
                key={epc}
                style={chipSt((form.acceptedEpc || []).includes(epc), "#059669")}
                onClick={() => {
                  setForm((prev) => {
                    const next = JSON.parse(JSON.stringify(prev));
                    if (!next.acceptedEpc) next.acceptedEpc = [];
                    const idx = next.acceptedEpc.indexOf(epc);
                    if (idx >= 0) next.acceptedEpc.splice(idx, 1);
                    else next.acceptedEpc.push(epc);
                    return next;
                  });
                }}
              >
                EPC {epc}
              </span>
            ))}
          </div>
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
          Define the product types for this bucket. Full rate editing is available in the "Edit Rates" tab after creation.
        </div>
        {(form.products || []).map((prod, pIdx) => (
          <div key={pIdx} style={{ marginBottom: 14, padding: 12, borderRadius: 8, border: `1px solid ${T.borderLight}`, background: T.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 32px", gap: 8, marginBottom: 8, alignItems: "end" }}>
              <div>
                {pIdx === 0 && <label style={labelSt}>Type</label>}
                <input style={inputSt} value={prod.type} onChange={(e) => setProduct(pIdx, "type", e.target.value)} placeholder="e.g. 2-Year Fixed" />
              </div>
              <div>
                {pIdx === 0 && <label style={labelSt}>Code</label>}
                <input style={inputSt} value={prod.code} onChange={(e) => setProduct(pIdx, "code", e.target.value)} placeholder="P2F" />
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
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginRight: 4 }}>LTV Rates:</span>
              {ALL_LTV_BANDS.map((band) => (
                <div key={band} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{band}</span>
                  <input
                    style={{ width: 54, padding: "4px 6px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.font, color: T.text, background: T.card, outline: "none", textAlign: "center" }}
                    type="number" step="0.01"
                    value={(prod.rates && prod.rates[band]) || ""}
                    placeholder="--"
                    onChange={(e) => {
                      setForm((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        if (!next.products[pIdx].rates) next.products[pIdx].rates = {};
                        const v = parseFloat(e.target.value);
                        if (isNaN(v)) { delete next.products[pIdx].rates[band]; }
                        else { next.products[pIdx].rates[band] = v; }
                        return next;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
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

      {/* Accepted Dimensions */}
      <div style={sectionHeaderSt}>Accepted Dimensions (Pricing)</div>
      {bucket.acceptedEmployments && bucket.acceptedEmployments.length > 0 && (
        <PillRow label="Accepted Employment" items={bucket.acceptedEmployments} pillStyle={greenPill} />
      )}
      {bucket.acceptedProperties && bucket.acceptedProperties.length > 0 && (
        <>
          <PillRow label="Accepted Property Types" items={bucket.acceptedProperties} pillStyle={greenPill} />
          <PillRow
            label="Rejected Property Types"
            items={Object.keys(PROPERTY_ADJUSTMENTS).filter(p => !(bucket.acceptedProperties || []).includes(p))}
            pillStyle={redPill}
          />
        </>
      )}
      {bucket.acceptedEpc && bucket.acceptedEpc.length > 0 && (
        <PillRow label="Accepted EPC Ratings" items={bucket.acceptedEpc} pillStyle={greenPill} />
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
// PRODUCTS TAB (Edit Rates — inline grid editor)
// ─────────────────────────────────────────────
function ProductsTab({ bucket, onUpdateProducts }) {
  const [products, setProducts] = useState(bucket.products || []);

  const commit = (next) => { setProducts(next); onUpdateProducts(next); };

  const updateProduct = (idx, field, val) => {
    commit(products.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const updateRate = (idx, band, val) => {
    const next = products.map((p, i) => {
      if (i !== idx) return p;
      const rates = { ...(p.rates || {}) };
      const v = parseFloat(val);
      if (isNaN(v) || val === "") { delete rates[band]; } else { rates[band] = v; }
      return { ...p, rates };
    });
    commit(next);
  };

  const addProduct = () => commit([...products, emptyProduct()]);
  const removeProduct = (idx) => commit(products.filter((_, i) => i !== idx));

  const maxLTV = bucket.maxLTV || 75;
  const ltvBandMax = { "\u226460%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };
  const visibleBands = ALL_LTV_BANDS.filter((b) => ltvBandMax[b] <= maxLTV);

  const inputSt = {
    padding: "7px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, padding: "8px 6px" };
  const rateInputSt = {
    width: 60, padding: "6px 4px", borderRadius: 6, textAlign: "center",
    border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none",
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
        Edit product rates per LTV band. Empty cells mean the product is not offered at that LTV.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={labelSt}>Product Type</th>
              <th style={labelSt}>Code</th>
              <th style={labelSt}>ERC</th>
              {visibleBands.map((b) => <th key={b} style={{ ...labelSt, textAlign: "center" }}>{b}</th>)}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {products.map((prod, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${T.borderLight}`, background: idx % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                <td style={{ padding: "6px" }}>
                  <input style={{ ...inputSt, width: "100%" }} value={prod.type} onChange={(e) => updateProduct(idx, "type", e.target.value)} placeholder="e.g. 2-Year Fixed" />
                </td>
                <td style={{ padding: "6px" }}>
                  <input style={{ ...inputSt, width: 64 }} value={prod.code} onChange={(e) => updateProduct(idx, "code", e.target.value)} placeholder="P2F" />
                </td>
                <td style={{ padding: "6px" }}>
                  <input style={{ ...inputSt, width: "100%", minWidth: 80 }} value={prod.erc} onChange={(e) => updateProduct(idx, "erc", e.target.value)} placeholder="3%, 2%" />
                </td>
                {visibleBands.map((band) => (
                  <td key={band} style={{ padding: "6px", textAlign: "center" }}>
                    <input
                      style={rateInputSt}
                      type="number" step="0.01"
                      value={(prod.rates && prod.rates[band] != null) ? prod.rates[band] : ""}
                      placeholder="--"
                      onChange={(e) => updateRate(idx, band, e.target.value)}
                    />
                  </td>
                ))}
                <td style={{ padding: "6px" }}>
                  <span
                    onClick={() => removeProduct(idx)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {Ico.x(14)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div style={{ padding: "24px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>
          No products configured yet. Add a product to get started.
        </div>
      )}

      <Btn small onClick={addProduct} style={{ marginTop: 8 }}>
        + Add Product Type
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
// RATES TAB — Reads explicit rates from product.rates
// ─────────────────────────────────────────────
function RatesTab({ bucket }) {
  const products = bucket.products || [];
  if (products.length === 0) {
    return (
      <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic", padding: "20px 0" }}>
        No products configured for this bucket yet. Add products in the Edit Rates tab.
      </div>
    );
  }

  const maxLTV = bucket.maxLTV || 75;
  const ltvBandMax = { "\u226460%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };
  const visibleBands = ALL_LTV_BANDS.filter((b) => ltvBandMax[b] <= maxLTV);

  return (
    <div>
      {/* LTV x Product rate grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMuted, width: 100, textTransform: "uppercase", letterSpacing: 0.5 }}>
                LTV
              </th>
              {products.map((p) => (
                <th key={p.code} style={{ textAlign: "center", padding: "8px 6px", fontSize: 11, fontWeight: 700, color: T.navy, minWidth: 100 }}>
                  {p.type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBands.map((band, rIdx) => (
              <tr key={band} style={{ borderBottom: `1px solid ${T.borderLight}`, background: rIdx % 2 === 0 ? "#FAFAF8" : "#FFFFFF" }}>
                <td style={{ padding: "8px 10px", fontWeight: 600, fontSize: 12, color: T.navy, whiteSpace: "nowrap" }}>
                  {band}
                </td>
                {products.map((prod) => {
                  const rate = prod.rates && prod.rates[band];
                  const code = prod.code + band.replace(/[^0-9]/g, "");
                  if (rate == null) {
                    return (
                      <td key={prod.code + band} style={{ textAlign: "center", padding: "7px 6px", verticalAlign: "middle" }}>
                        <span style={{ color: "#CBD5E1", fontSize: 14 }}>&mdash;</span>
                      </td>
                    );
                  }
                  return (
                    <td key={prod.code + band} style={{ textAlign: "center", padding: "7px 6px", verticalAlign: "middle" }}>
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
            ))}
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
          Max LTV: {maxLTV}%
        </span>
      </div>

      {/* Pricing Tiers Applied On Top */}
      {(bucket.tiers && bucket.tiers.length > 0) && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>
            Pricing Tiers Applied On Top
          </div>
          <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", fontFamily: T.font }}>
            {bucket.tiers.map((tier, tIdx) => {
              const tierColor = [T.primary, "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"][tIdx % 5];
              let adjLabel;
              if (tier.adjustmentType === "flat") {
                adjLabel = `${tier.flatAdj >= 0 ? "+" : ""}${tier.flatAdj.toFixed(2)}% (flat)`;
              } else {
                const vals = [];
                Object.values(tier.gridAdj || {}).forEach(bands => Object.values(bands).forEach(v => vals.push(v)));
                if (vals.length > 0) {
                  const mn = Math.min(...vals), mx = Math.max(...vals);
                  adjLabel = mn === mx
                    ? `+${mn.toFixed(2)}% (varies by term/LTV)`
                    : `+${mn.toFixed(2)}% to +${mx.toFixed(2)}% (varies by term/LTV)`;
                } else {
                  adjLabel = "+0.00% (varies by term/LTV)";
                }
              }
              return (
                <div
                  key={tIdx}
                  style={{
                    display: "flex", alignItems: "center", padding: "8px 14px",
                    borderBottom: tIdx < bucket.tiers.length - 1 ? `1px solid ${T.borderLight}` : "none",
                    background: tIdx % 2 === 0 ? "#FAFAF8" : "#FFF",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: tierColor, minWidth: 48 }}>Tier {tIdx + 1}:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.navy, minWidth: 160 }}>{tier.name}</span>
                  <span style={{ fontSize: 12, color: tier.flatAdj < 0 ? "#059669" : tier.flatAdj === 0 ? T.textMuted : "#B07A00", fontWeight: 600 }}>
                    {adjLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TIERS TAB — Tier Wizard (up to 5 tiers per bucket)
// ─────────────────────────────────────────────
const TIER_COLORS = [T.primary, "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"];
const TIER_DIMENSIONS = {
  credit: { label: "Credit", options: ["clean", "near_prime", "light_adverse", "adverse", "heavy_adverse"] },
  employment: { label: "Employment", options: ["Employed", "Self-Employed", "Contractor", "Retired"] },
  property: { label: "Property", options: ["Standard", "Non-Standard", "New Build", "Ex-Local Authority", "High-Rise (>6 floors)"] },
  epc: { label: "EPC", options: ["A", "B", "C", "D", "E", "F", "G"] },
};

function TiersTab({ bucket, onUpdateTiers }) {
  const [tiers, setTiers] = useState(() => bucket.tiers ? JSON.parse(JSON.stringify(bucket.tiers)) : []);

  const commit = (next) => { setTiers(next); onUpdateTiers(next); };

  const addTier = () => {
    if (tiers.length >= 5) return;
    commit([...tiers, { name: "New Tier", conditions: {}, adjustmentType: "flat", flatAdj: 0.00, gridAdj: {} }]);
  };

  const removeTier = (idx) => commit(tiers.filter((_, i) => i !== idx));

  const updateTier = (idx, field, val) => {
    commit(tiers.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const toggleCondition = (tierIdx, dimension, value) => {
    const tier = tiers[tierIdx];
    const conds = { ...(tier.conditions || {}) };
    const arr = [...(conds[dimension] || [])];
    const vi = arr.indexOf(value);
    if (vi >= 0) arr.splice(vi, 1); else arr.push(value);
    if (arr.length === 0) delete conds[dimension]; else conds[dimension] = arr;
    updateTier(tierIdx, "conditions", conds);
  };

  const updateGridAdj = (tierIdx, productType, band, val) => {
    const tier = tiers[tierIdx];
    const gridAdj = JSON.parse(JSON.stringify(tier.gridAdj || {}));
    if (!gridAdj[productType]) gridAdj[productType] = {};
    const v = parseFloat(val);
    if (isNaN(v) || val === "") { delete gridAdj[productType][band]; if (Object.keys(gridAdj[productType]).length === 0) delete gridAdj[productType]; }
    else { gridAdj[productType][band] = v; }
    updateTier(tierIdx, "gridAdj", gridAdj);
  };

  // Derive visible LTV bands from bucket products
  const products = bucket.products || [];
  const usedBands = new Set();
  products.forEach(p => { if (p.rates) Object.keys(p.rates).forEach(b => usedBands.add(b)); });
  const visibleBands = ALL_LTV_BANDS.filter(b => usedBands.has(b));
  const productTypes = products.map(p => p.type).filter(Boolean);

  // Find an example base rate for preview
  const getExampleRate = () => {
    for (const p of products) {
      if (p.rates) {
        for (const b of visibleBands) {
          if (p.rates[b] != null) return { type: p.type, band: b, rate: p.rates[b] };
        }
      }
    }
    return null;
  };
  const exampleRate = getExampleRate();

  const chipSt = (active, color) => ({
    display: "inline-block", padding: "3px 8px", borderRadius: 10,
    fontSize: 10, fontWeight: 600, cursor: "pointer", marginRight: 4, marginBottom: 4,
    border: active ? `1.5px solid ${color || T.primary}` : `1px solid ${T.border}`,
    background: active ? (color + "18") : T.card,
    color: active ? color : T.textMuted, transition: "all 0.12s", userSelect: "none",
  });

  const gridInputSt = {
    width: 50, padding: "3px 4px", borderRadius: 5, textAlign: "center",
    border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Pricing Tiers</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>Define up to 5 tiers. Each tier applies a rate adjustment on top of base rates.</div>
        </div>
        <Btn small primary onClick={addTier} disabled={tiers.length >= 5} style={{ opacity: tiers.length >= 5 ? 0.45 : 1 }}>
          + Add Tier
        </Btn>
      </div>

      {tiers.length === 0 && (
        <div style={{ padding: "28px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>
          No pricing tiers configured. Add a tier to define conditional rate adjustments.
        </div>
      )}

      {/* Tier cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {tiers.map((tier, tIdx) => {
          const tierColor = TIER_COLORS[tIdx % TIER_COLORS.length];
          const adjRange = (() => {
            if (tier.adjustmentType === "flat") return null;
            const vals = [];
            Object.values(tier.gridAdj || {}).forEach(bands => Object.values(bands).forEach(v => vals.push(v)));
            if (vals.length === 0) return null;
            return { min: Math.min(...vals), max: Math.max(...vals) };
          })();

          return (
            <div key={tIdx} style={{
              border: `1px solid ${T.border}`, borderRadius: 10, borderLeft: `4px solid ${tierColor}`,
              background: T.card, overflow: "hidden", fontFamily: T.font,
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: tierColor, minWidth: 20 }}>T{tIdx + 1}</span>
                <input
                  style={{
                    width: 200, padding: "5px 8px", borderRadius: 6, border: `1px solid ${T.border}`,
                    fontSize: 13, fontWeight: 600, fontFamily: T.font, color: T.navy, background: T.card, outline: "none",
                  }}
                  value={tier.name}
                  onChange={(e) => updateTier(tIdx, "name", e.target.value)}
                  placeholder="Tier name"
                />
                <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
                  {["flat", "grid"].map(mode => (
                    <button
                      key={mode}
                      onClick={() => updateTier(tIdx, "adjustmentType", mode)}
                      style={{
                        padding: "4px 12px", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600,
                        fontFamily: T.font, background: tier.adjustmentType === mode ? tierColor : T.bg,
                        color: tier.adjustmentType === mode ? "#fff" : T.textMuted, transition: "all 0.12s",
                      }}
                    >
                      {mode === "flat" ? "Flat" : "Per Cell"}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1 }} />
                <span
                  onClick={() => removeTier(tIdx)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", fontSize: 14, fontWeight: 700, transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {Ico.x(12)}
                </span>
              </div>

              {/* Conditions section */}
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Applies when:
                </div>
                {Object.entries(TIER_DIMENSIONS).map(([dim, cfg]) => {
                  const selected = (tier.conditions && tier.conditions[dim]) || [];
                  const hasAny = selected.length > 0;
                  return (
                    <div key={dim} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: hasAny ? T.text : T.textMuted, marginRight: 8, minWidth: 70, display: "inline-block" }}>
                        {cfg.label}:
                      </span>
                      {cfg.options.map(opt => (
                        <span
                          key={opt}
                          style={chipSt(selected.includes(opt), tierColor)}
                          onClick={() => toggleCondition(tIdx, dim, opt)}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Adjustment section */}
              <div style={{ padding: "10px 14px" }}>
                {tier.adjustmentType === "flat" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>Flat adjustment:</span>
                    <input
                      style={{ width: 70, padding: "5px 8px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, color: T.text, background: T.card, outline: "none", textAlign: "center" }}
                      type="number" step="0.01"
                      value={tier.flatAdj}
                      onChange={(e) => updateTier(tIdx, "flatAdj", parseFloat(e.target.value) || 0)}
                    />
                    <span style={{ fontSize: 12, color: T.textMuted }}>%</span>
                    {exampleRate && (
                      <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 12, fontStyle: "italic" }}>
                        {exampleRate.type} at {exampleRate.band}: {exampleRate.rate.toFixed(2)}% base {tier.flatAdj >= 0 ? "+" : ""}{tier.flatAdj.toFixed(2)}% tier = {(exampleRate.rate + tier.flatAdj).toFixed(2)}% final
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 8 }}>Per-cell adjustments:</div>
                    {productTypes.length === 0 || visibleBands.length === 0 ? (
                      <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>No products/LTV bands to show. Add products with rates first.</div>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: T.font }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, color: T.textMuted, textAlign: "left" }} />
                              {productTypes.map(pt => (
                                <th key={pt} style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, color: T.navy, textAlign: "center", whiteSpace: "nowrap" }}>{pt}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {visibleBands.map(band => (
                              <tr key={band}>
                                <td style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: T.textMuted, whiteSpace: "nowrap" }}>{band}</td>
                                {productTypes.map(pt => {
                                  const val = tier.gridAdj && tier.gridAdj[pt] && tier.gridAdj[pt][band];
                                  return (
                                    <td key={pt} style={{ padding: "3px 4px", textAlign: "center" }}>
                                      <input
                                        style={gridInputSt}
                                        type="number" step="0.01"
                                        value={val != null ? val : ""}
                                        placeholder="--"
                                        onChange={(e) => updateGridAdj(tIdx, pt, band, e.target.value)}
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {exampleRate && adjRange && (
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 6, fontStyle: "italic" }}>
                        {exampleRate.type} at {exampleRate.band}: {exampleRate.rate.toFixed(2)}% base + {adjRange.min.toFixed(2)}% to {adjRange.max.toFixed(2)}% tier
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

  const updateBucketTiers = (bIdx, tiers) => {
    setBuckets((prev) => {
      const next = [...prev];
      next[bIdx] = { ...next[bIdx], tiers };
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
            Bucket-based product hierarchy with explicit rate grids and dimension loadings
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
                    { id: "products", label: "Edit Rates" },
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
                    onUpdateTiers={(t) => updateBucketTiers(bIdx, t)}
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
