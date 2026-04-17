import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// BUCKETED PRODUCT DATA
// ─────────────────────────────────────────────
const BUCKETS = [
  {
    name: "Prime",
    color: "#059669",
    desc: "Clean credit \u00b7 Standard criteria \u00b7 Purchase & remortgage",
    reversion: "Bank Base Rate + 3.99%",
    fee: "\u00a31,495",
    termRange: "2-40 years",
    products: [
      { type: "2-Year Fixed", code: "P2F", rates: { "\u226460%": 4.19, "\u226470%": 4.29, "\u226475%": 4.49, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "3%, 2%" },
      { type: "5-Year Fixed", code: "P5F", rates: { "\u226460%": 4.59, "\u226470%": 4.69, "\u226475%": 4.89, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "5%, 4%, 3%, 2%, 1%" },
      { type: "2-Year Tracker", code: "PTR", rates: { "\u226460%": 4.84, "\u226470%": 4.94, "\u226475%": 5.14, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "No ERCs" },
    ],
    notes: "Product Fee (LTV can not exceed 95% with the fee added)",
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a31,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 75 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      incomeMultiple: "4.49x single / 4.49x joint",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0",
        maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted",
        bankruptcy: "Not accepted",
        dmp: "Not accepted",
      },
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
  },
  {
    name: "Prime High LTV",
    color: "#31B897",
    desc: "Clean credit \u00b7 Extended LTV range up to 95%",
    reversion: "Bank Base Rate + 3.99%",
    fee: "\u00a31,495",
    termRange: "2-40 years",
    products: [
      { type: "2-Year Fixed", code: "H2F", rates: { "\u226460%": 4.49, "\u226470%": 4.79, "\u226475%": 4.99, "\u226480%": 5.09, "\u226485%": 5.29, "\u226490%": 5.49, "\u226495%": 5.69 }, erc: "4%, 3%" },
      { type: "5-Year Fixed", code: "H5F", rates: { "\u226460%": 4.89, "\u226470%": 5.09, "\u226475%": 5.29, "\u226480%": 5.39, "\u226485%": 5.59, "\u226490%": 5.79, "\u226495%": 5.99 }, erc: "5%, 4%, 3%, 2%, 1%" },
      { type: "2-Year Tracker", code: "HTR", rates: { "\u226460%": 5.14, "\u226470%": 5.34, "\u226475%": 5.54, "\u226480%": 5.64, "\u226485%": 5.84, "\u226490%": 6.04, "\u226495%": 6.24 }, erc: "No ERCs" },
    ],
    notes: "\u226495% purchase transactions only",
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a3500,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 70 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      incomeMultiple: "4.49x",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0",
        maxDefaults: "0",
        missedPayments: "None in last 24 months",
        iva: "Not accepted",
        bankruptcy: "Not accepted",
        dmp: "Not accepted",
      },
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
      additionalNotes: "\u226495% purchase only",
    },
  },
  {
    name: "Professional",
    color: "#3B82F6",
    desc: "Qualified professionals \u00b7 Enhanced income multiples \u00b7 Reduced rates",
    reversion: "Bank Base Rate + 2.99%",
    fee: "\u00a31,495",
    termRange: "2-40 years",
    products: [
      { type: "2-Year Fixed", code: "D2F", rates: { "\u226460%": 3.69, "\u226470%": 3.79, "\u226475%": 3.99, "\u226480%": 4.19, "\u226485%": 4.39, "\u226490%": 4.69, "\u226495%": null }, erc: "2%, 1%" },
      { type: "5-Year Fixed", code: "D5F", rates: { "\u226460%": 4.09, "\u226470%": 4.19, "\u226475%": 4.39, "\u226480%": 4.59, "\u226485%": 4.79, "\u226490%": 5.09, "\u226495%": null }, erc: "5%, 4%, 3%, 2%, 1%" },
      { type: "2-Year Tracker", code: "DTR", rates: { "\u226460%": 4.24, "\u226470%": 4.34, "\u226475%": 4.54, "\u226480%": 4.74, "\u226485%": 4.94, "\u226490%": 5.24, "\u226495%": null }, erc: "No ERCs" },
    ],
    notes: "LTV can not exceed 90%. Purchase transactions only above 80% LTV.",
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a32,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 80 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)", "Specified professionals / qualifications"],
      incomeMultiple: "5.50x single / 5.50x joint",
      stressRate: "SVR + 1% or 5.50% floor (whichever higher)",
      credit: {
        maxCCJs: "0",
        maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted",
        bankruptcy: "Not accepted",
        dmp: "Not accepted",
      },
      property: {
        minValue: "\u00a3100,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
    },
  },
  {
    name: "High-Net-Worth",
    color: "#8B5CF6",
    desc: "\u00a3300k+ income or \u00a33M+ net assets \u00b7 Bespoke pricing",
    reversion: "Bank Base Rate + 2.49%",
    fee: "\u00a31,495",
    termRange: "2-40 years",
    products: [
      { type: "2-Year Fixed", code: "M2F", rates: { "\u226460%": 3.49, "\u226470%": 3.59, "\u226475%": 3.79, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "2%, 1%" },
      { type: "5-Year Fixed", code: "M5F", rates: { "\u226460%": 3.89, "\u226470%": 3.99, "\u226475%": 4.19, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "5%, 4%, 3%, 2%, 1%" },
      { type: "2-Year Tracker", code: "MTR", rates: { "\u226460%": 4.04, "\u226470%": 4.14, "\u226475%": 4.34, "\u226480%": null, "\u226485%": null, "\u226490%": null, "\u226495%": null }, erc: "No ERCs" },
    ],
    notes: "Max LTV 75%. Income or assets must be verified.",
    criteria: {
      loanSize: { min: "\u00a3150,000", max: "\u00a35,000,000" },
      maxApplicants: 2,
      age: { min: 21, maxAtEnd: 85 },
      residency: "UK citizen / Settled / Pre-settled status",
      minUKResidency: "3 years",
      employment: ["Employed (min 6 months)", "Self-employed (min 2 years)", "Contractors (12 months history)", "Retired (with pension income)"],
      incomeMultiple: "Bespoke (no fixed multiple)",
      stressRate: "Bespoke assessment",
      credit: {
        maxCCJs: "0",
        maxDefaults: "0",
        missedPayments: "None in last 36 months",
        iva: "Not accepted",
        bankruptcy: "Not accepted",
        dmp: "Not accepted",
      },
      property: {
        minValue: "\u00a3250,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
      additionalNotes: "\u00a3300k+ income or \u00a33M+ net assets required",
    },
  },
  {
    name: "Buy-to-Let",
    color: "#F59E0B",
    desc: "Investment properties \u00b7 ICR 145% \u00b7 Portfolio landlords accepted",
    reversion: "Bank Base Rate + 4.49%",
    fee: "\u00a31,995",
    termRange: "5-25 years",
    products: [
      { type: "2-Year Fixed", code: "B2F", rates: { "\u226460%": 5.19, "\u226465%": 5.49, "\u226470%": 5.79, "\u226475%": 5.99, "\u226480%": null, "\u226485%": null, "\u226490%": null }, erc: "3%, 2%" },
      { type: "5-Year Fixed", code: "B5F", rates: { "\u226460%": 5.49, "\u226465%": 5.79, "\u226470%": 5.99, "\u226475%": 6.29, "\u226480%": null, "\u226485%": null, "\u226490%": null }, erc: "5%, 4%, 3%, 2%, 1%" },
      { type: "Tracker", code: "BTR", rates: { "\u226460%": 5.49, "\u226465%": 5.79, "\u226470%": 5.99, "\u226475%": 6.19, "\u226480%": null, "\u226485%": null, "\u226490%": null }, erc: "No ERCs" },
    ],
    notes: "Max LTV 75%. Stress rate 5.50%. ICR 145% required.",
    criteria: {
      loanSize: { min: "\u00a325,000", max: "\u00a32,000,000" },
      maxApplicants: 4,
      age: { min: 21, maxAtEnd: 85 },
      residency: "UK citizen / Settled / Pre-settled status / Ltd companies / SPVs accepted",
      minUKResidency: "3 years",
      employment: ["Any \u2014 income not assessed for standard BTL", "Portfolio landlords accepted", "First-time landlords accepted (max 75% LTV)"],
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
      property: {
        minValue: "\u00a375,000",
        acceptable: ["Houses", "Flats (up to 6 floors)", "Bungalows", "New build", "Ex-local authority", "HMO subject to criteria"],
        unacceptable: ["Above commercial", "Freehold flats", "Mobile homes", "Houseboats", "Holiday lets not accepted"],
        valuation: "Full valuation required. AVM accepted for \u226460% LTV remortgages.",
      },
      valuationFees: [
        { upTo: "\u00a3100,000", fee: "\u00a3150" }, { upTo: "\u00a3200,000", fee: "\u00a3225" },
        { upTo: "\u00a3350,000", fee: "\u00a3295" }, { upTo: "\u00a3500,000", fee: "\u00a3395" },
        { upTo: "\u00a31,000,000", fee: "\u00a3595" },
      ],
      tenancy: "AST only (min 6 months)",
      experience: "No experience required for first property",
    },
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const rateColor = (r) => {
  if (r === null) return T.textMuted;
  if (r < 4.5) return "#059669";
  if (r <= 5.5) return "#D97706";
  return "#DC2626";
};

const extractLtvNum = (ltv) => ltv.replace(/[^0-9]/g, "");

const buildCode = (prodCode, ltv) => {
  const num = extractLtvNum(ltv);
  return `${prodCode}${num}-02`;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function ProductBuckets() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleBucket = (i) => setExpandedIdx(expandedIdx === i ? null : i);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
            Residential Mortgage Products
          </div>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Our residential product range for purchasing or remortgaging
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
            background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE"
          }}>
            Bank Base Rate: 4.75%
          </span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
            background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A"
          }}>
            Reversion Rate: SVR 7.99%
          </span>
        </div>
      </div>

      {/* ── BUCKET CARDS ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {BUCKETS.map((bucket, bIdx) => {
          const ltvBands = Object.keys(bucket.products[0].rates);

          return (
            <Card key={bucket.name} noPad style={{ overflow: "hidden" }}>
              {/* Colour strip */}
              <div style={{ height: 6, background: bucket.color }} />

              {/* Bucket header */}
              <div
                style={{
                  padding: "16px 24px 14px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                }}
                onClick={() => toggleBucket(bIdx)}
              >
                {/* Pill badge */}
                <span style={{
                  display: "inline-block", padding: "5px 16px", borderRadius: 20,
                  background: bucket.color, color: "#fff",
                  fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                }}>
                  {bucket.name}
                </span>
                <span style={{ fontSize: 12, color: T.textMuted, flex: 1 }}>
                  {bucket.desc}
                </span>
                <span style={{
                  transform: expandedIdx === bIdx ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", display: "flex", color: T.textMuted,
                }}>
                  {Ico.arrow(16)}
                </span>
              </div>

              {/* Expanded content */}
              {expandedIdx === bIdx && (
                <div style={{ padding: "0 24px 20px" }}>
                  {/* ── RATE TABLE ── */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{
                      width: "100%", borderCollapse: "collapse", fontSize: 12,
                      fontFamily: T.font,
                    }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                          <th style={{
                            textAlign: "left", padding: "8px 10px", fontSize: 11,
                            fontWeight: 700, color: T.textMuted, width: 80,
                            textTransform: "uppercase", letterSpacing: 0.5,
                          }}>
                            LTV
                          </th>
                          {bucket.products.map((p) => (
                            <th key={p.code} style={{
                              textAlign: "center", padding: "8px 6px", fontSize: 11,
                              fontWeight: 700, color: T.navy, width: 80,
                            }}>
                              {p.type}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ltvBands.map((ltv, rIdx) => (
                          <tr
                            key={ltv}
                            style={{
                              borderBottom: `1px solid ${T.borderLight}`,
                              background: rIdx % 2 === 0 ? "#FAFAF8" : "#FFFFFF",
                            }}
                          >
                            <td style={{
                              padding: "9px 10px", fontWeight: 600, fontSize: 12,
                              color: T.navy, whiteSpace: "nowrap",
                            }}>
                              {ltv}
                            </td>
                            {bucket.products.map((p) => {
                              const rate = p.rates[ltv];
                              const code = buildCode(p.code, ltv);
                              return (
                                <td key={p.code + ltv} style={{
                                  textAlign: "center", padding: "7px 6px",
                                  width: 80, verticalAlign: "middle",
                                }}>
                                  {rate !== null && rate !== undefined ? (
                                    <div>
                                      <span style={{
                                        fontWeight: 700, fontSize: 13,
                                        color: rateColor(rate),
                                      }}>
                                        {rate.toFixed(2)}%
                                      </span>
                                      <div style={{
                                        fontSize: 9, color: T.textMuted,
                                        marginTop: 1, letterSpacing: 0.2,
                                      }}>
                                        ({code})
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ color: "#CBD5E1", fontSize: 14 }}>&mdash;</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── TERMS STRIP ── */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16,
                    padding: "12px 14px", background: "#F8F7F4", borderRadius: 10,
                    border: `1px solid ${T.borderLight}`,
                  }}>
                    {bucket.products.map((p) => (
                      <span key={p.code + "-erc"} style={{
                        fontSize: 11, color: T.textSecondary,
                        padding: "3px 10px", background: "#FFFFFF",
                        borderRadius: 6, border: `1px solid ${T.borderLight}`,
                      }}>
                        <span style={{ fontWeight: 600 }}>ERC ({p.type}):</span> {p.erc}
                      </span>
                    ))}
                    <span style={{
                      fontSize: 11, color: T.textSecondary,
                      padding: "3px 10px", background: "#FFFFFF",
                      borderRadius: 6, border: `1px solid ${T.borderLight}`,
                    }}>
                      <span style={{ fontWeight: 600 }}>Loan Term:</span> {bucket.termRange}
                    </span>
                    <span style={{
                      fontSize: 11, color: T.textSecondary,
                      padding: "3px 10px", background: "#FFFFFF",
                      borderRadius: 6, border: `1px solid ${T.borderLight}`,
                    }}>
                      <span style={{ fontWeight: 600 }}>Product Fee:</span> {bucket.fee}
                    </span>
                    <span style={{
                      fontSize: 11, color: T.textSecondary,
                      padding: "3px 10px", background: "#FFFFFF",
                      borderRadius: 6, border: `1px solid ${T.borderLight}`,
                    }}>
                      <span style={{ fontWeight: 600 }}>Reversion:</span> {bucket.reversion}
                    </span>
                  </div>

                  {/* ── NOTES ── */}
                  {bucket.notes && (
                    <div style={{
                      marginTop: 12, fontSize: 11, fontStyle: "italic",
                      color: T.textMuted, paddingLeft: 2,
                    }}>
                      {bucket.notes}
                    </div>
                  )}

                  {/* ── CRITERIA SECTION ── */}
                  {bucket.criteria && (() => {
                    const c = bucket.criteria;
                    const labelStyle = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.textMuted, marginBottom: 2 };
                    const valStyle = { fontSize: 12, color: T.text, fontWeight: 400 };
                    const creditColor = (v) => v === "Not accepted" || v === "0" ? "#DC2626" : "#059669";
                    const pillBase = { display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 12, marginRight: 5, marginBottom: 4 };

                    return (
                      <div style={{ marginTop: 18, padding: "16px 18px", background: T.bg, borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
                        {/* Title */}
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 14 }}>
                          Criteria Overview
                        </div>

                        {/* Top two-column grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
                          {/* Left column — General */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div><div style={labelStyle}>Loan Size</div><div style={valStyle}>{c.loanSize.min} &ndash; {c.loanSize.max}</div></div>
                            <div><div style={labelStyle}>Max Applicants</div><div style={valStyle}>{c.maxApplicants}{c.maxApplicants === 4 ? " (for SPV/Ltd)" : ""}</div></div>
                            <div><div style={labelStyle}>Age</div><div style={valStyle}>{c.age.min} &ndash; {c.age.maxAtEnd} (at end of term)</div></div>
                            <div><div style={labelStyle}>UK Residency</div><div style={valStyle}>{c.minUKResidency} minimum</div></div>
                            <div><div style={labelStyle}>Income Multiple</div><div style={valStyle}>{c.incomeMultiple}</div></div>
                            <div><div style={labelStyle}>Stress Rate</div><div style={valStyle}>{c.stressRate}</div></div>
                            {c.tenancy && <div><div style={labelStyle}>Tenancy</div><div style={valStyle}>{c.tenancy}</div></div>}
                            {c.experience && <div><div style={labelStyle}>Experience</div><div style={valStyle}>{c.experience}</div></div>}
                            {c.additionalNotes && <div><div style={labelStyle}>Note</div><div style={{ ...valStyle, fontStyle: "italic", color: T.textMuted }}>{c.additionalNotes}</div></div>}
                          </div>

                          {/* Right column — Credit Requirements */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ ...labelStyle, fontSize: 11, marginBottom: 4 }}>Credit Requirements</div>
                            <div><div style={labelStyle}>CCJs</div><div style={{ ...valStyle, color: creditColor(c.credit.maxCCJs) }}>{c.credit.maxCCJs === "0" ? "None accepted" : c.credit.maxCCJs}</div></div>
                            <div><div style={labelStyle}>Defaults</div><div style={{ ...valStyle, color: creditColor(c.credit.maxDefaults) }}>{c.credit.maxDefaults === "0" ? "None accepted" : c.credit.maxDefaults}</div></div>
                            <div><div style={labelStyle}>Missed Payments</div><div style={{ ...valStyle, color: creditColor(c.credit.missedPayments) }}>{c.credit.missedPayments}</div></div>
                            <div><div style={labelStyle}>IVA</div><div style={{ ...valStyle, color: creditColor(c.credit.iva) }}>{c.credit.iva}</div></div>
                            <div><div style={labelStyle}>Bankruptcy</div><div style={{ ...valStyle, color: creditColor(c.credit.bankruptcy) }}>{c.credit.bankruptcy}</div></div>
                            {c.credit.dmp && <div><div style={labelStyle}>DMP</div><div style={{ ...valStyle, color: creditColor(c.credit.dmp) }}>{c.credit.dmp}</div></div>}
                          </div>
                        </div>

                        {/* Middle two-column — Employment & Property */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px", marginTop: 16 }}>
                          {/* Employment */}
                          <div>
                            <div style={{ ...labelStyle, marginBottom: 8 }}>Employment (Acceptable)</div>
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                              {c.employment.map((e) => (
                                <span key={e} style={{ ...pillBase, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>{e}</span>
                              ))}
                            </div>
                          </div>

                          {/* Property */}
                          <div>
                            <div style={{ ...labelStyle, marginBottom: 6 }}>Property Criteria</div>
                            <div style={{ marginBottom: 6 }}><span style={labelStyle}>Min Value: </span><span style={valStyle}>{c.property.minValue}</span></div>
                            <div style={{ ...labelStyle, marginBottom: 4 }}>Acceptable</div>
                            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>
                              {c.property.acceptable.map((a) => (
                                <span key={a} style={{ ...pillBase, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>{a}</span>
                              ))}
                            </div>
                            <div style={{ ...labelStyle, marginBottom: 4 }}>Unacceptable</div>
                            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 6 }}>
                              {c.property.unacceptable.map((u) => (
                                <span key={u} style={{ ...pillBase, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA" }}>{u}</span>
                              ))}
                            </div>
                            <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>{c.property.valuation}</div>
                          </div>
                        </div>

                        {/* Valuation Fee Scale */}
                        {c.valuationFees && (
                          <div style={{ marginTop: 16 }}>
                            <div style={{ ...labelStyle, marginBottom: 8 }}>Valuation Fee Scale</div>
                            <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: T.font }}>
                              <thead>
                                <tr style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                                  <th style={{ textAlign: "left", padding: "5px 16px 5px 0", fontWeight: 700, color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Property Value</th>
                                  <th style={{ textAlign: "right", padding: "5px 0", fontWeight: 700, color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Fee</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.valuationFees.map((vf) => (
                                  <tr key={vf.upTo} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                                    <td style={{ padding: "4px 16px 4px 0", color: T.text }}>Up to {vf.upTo}</td>
                                    <td style={{ padding: "4px 0", textAlign: "right", fontWeight: 600, color: T.navy }}>{vf.fee}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 24, padding: "14px 20px", background: "#F8F7F4",
        borderRadius: 10, border: `1px solid ${T.borderLight}`,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>
          Effective from: 10 Apr 2026
        </span>
        <span style={{ fontSize: 11, color: T.textMuted }}>
          Subject to criteria and valuation
        </span>
      </div>
    </div>
  );
}
