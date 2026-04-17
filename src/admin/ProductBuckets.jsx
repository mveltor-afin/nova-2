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
    notes: "Product Fee (LTV can not exceed 95% with the fee added)"
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
    notes: "\u226495% purchase transactions only"
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
    notes: "LTV can not exceed 90%. Purchase transactions only above 80% LTV."
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
    notes: "Max LTV 75%. Income or assets must be verified."
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
    notes: "Max LTV 75%. Stress rate 5.50%. ICR 145% required."
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
