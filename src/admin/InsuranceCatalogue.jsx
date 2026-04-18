import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// INSURANCE PRODUCTS
// ─────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "Decreasing Term Life",
    code: "DTL",
    category: "Life Cover",
    color: "#059669",
    desc: "Cover decreases in line with your mortgage. Most affordable option.",
    coverRange: "£50,000 – £2,000,000",
    termRange: "5 – 40 years",
    premiumBasis: "Guaranteed for term",
    underwriting: "Full medical underwriting at application",
    features: ["Pays out lump sum on death", "Cover reduces in line with repayment mortgage", "Critical illness add-on available", "Terminal illness benefit included"],
    premiums: {
      "Non-smoker": { "25–34": { "£100k": 6.50, "£250k": 12.80, "£500k": 22.50 }, "35–44": { "£100k": 9.20, "£250k": 18.50, "£500k": 34.00 }, "45–54": { "£100k": 16.80, "£250k": 35.00, "£500k": 68.00 } },
      "Smoker": { "25–34": { "£100k": 10.50, "£250k": 22.00, "£500k": 40.50 }, "35–44": { "£100k": 18.50, "£250k": 38.00, "£500k": 72.00 }, "45–54": { "£100k": 32.00, "£250k": 68.00, "£500k": 130.00 } },
    },
  },
  {
    name: "Level Term Life",
    code: "LTL",
    category: "Life Cover",
    color: "#3B82F6",
    desc: "Fixed cover amount for the full term. Ideal for interest-only mortgages or family protection.",
    coverRange: "£50,000 – £5,000,000",
    termRange: "5 – 40 years",
    premiumBasis: "Guaranteed for term",
    underwriting: "Full medical underwriting",
    features: ["Fixed payout regardless of when claim is made", "Joint life or single life", "Critical illness add-on available", "Waiver of premium option"],
    premiums: {
      "Non-smoker": { "25–34": { "£100k": 8.50, "£250k": 16.80, "£500k": 30.00 }, "35–44": { "£100k": 14.20, "£250k": 28.50, "£500k": 52.00 }, "45–54": { "£100k": 28.00, "£250k": 58.00, "£500k": 110.00 } },
      "Smoker": { "25–34": { "£100k": 14.00, "£250k": 28.00, "£500k": 52.00 }, "35–44": { "£100k": 26.00, "£250k": 54.00, "£500k": 100.00 }, "45–54": { "£100k": 52.00, "£250k": 108.00, "£500k": 205.00 } },
    },
  },
  {
    name: "Critical Illness Cover",
    code: "CIC",
    category: "Critical Illness",
    color: "#8B5CF6",
    desc: "Lump sum on diagnosis of a specified critical illness. Can be standalone or added to life cover.",
    coverRange: "£25,000 – £2,000,000",
    termRange: "5 – 40 years",
    premiumBasis: "Reviewable or guaranteed",
    underwriting: "Full medical underwriting — enhanced for CI",
    features: ["Covers 60+ critical conditions", "Children's cover included free", "Partial payment for less severe conditions", "Standalone or as add-on to life cover"],
    premiums: {
      "Non-smoker": { "25–34": { "£100k": 18.00, "£250k": 38.00, "£500k": 72.00 }, "35–44": { "£100k": 32.00, "£250k": 68.00, "£500k": 130.00 }, "45–54": { "£100k": 62.00, "£250k": 135.00, "£500k": 260.00 } },
      "Smoker": { "25–34": { "£100k": 28.00, "£250k": 58.00, "£500k": 110.00 }, "35–44": { "£100k": 52.00, "£250k": 110.00, "£500k": 210.00 }, "45–54": { "£100k": 98.00, "£250k": 210.00, "£500k": 400.00 } },
    },
  },
  {
    name: "Income Protection",
    code: "IPC",
    category: "Income Protection",
    color: "#F59E0B",
    desc: "Replaces income if unable to work due to illness or injury. Pays until return to work or retirement.",
    coverRange: "Up to 60% of gross income",
    termRange: "To age 60, 65, or 70",
    premiumBasis: "Reviewable or guaranteed",
    underwriting: "Full medical + occupational assessment",
    features: ["Monthly benefit, not lump sum", "Deferred period: 4, 8, 13, 26, or 52 weeks", "Own occupation or suited occupation definitions", "Covers mental health conditions"],
    premiums: {
      "Non-smoker": { "25–34": { "£1k/mo": 22.00, "£2k/mo": 40.00, "£3k/mo": 58.00 }, "35–44": { "£1k/mo": 34.00, "£2k/mo": 62.00, "£3k/mo": 88.00 }, "45–54": { "£1k/mo": 52.00, "£2k/mo": 98.00, "£3k/mo": 140.00 } },
      "Smoker": { "25–34": { "£1k/mo": 32.00, "£2k/mo": 58.00, "£3k/mo": 82.00 }, "35–44": { "£1k/mo": 50.00, "£2k/mo": 92.00, "£3k/mo": 128.00 }, "45–54": { "£1k/mo": 78.00, "£2k/mo": 145.00, "£3k/mo": 205.00 } },
    },
  },
  {
    name: "Buildings & Contents",
    code: "BNC",
    category: "General Insurance",
    color: "#0EA5E9",
    desc: "Property insurance required for mortgage completion. Buildings cover mandatory, contents optional.",
    coverRange: "Rebuild value + contents",
    termRange: "Annual, auto-renewable",
    premiumBasis: "Annual, reviewable",
    underwriting: "Property risk assessment",
    features: ["Buildings cover: structure, fixtures, fittings", "Contents: possessions, valuables, personal items", "Accidental damage add-on", "Legal expenses cover included", "Home emergency cover add-on"],
    premiums: {
      "Standard": { "1-Bed Flat": { "Buildings": 12.00, "Contents": 8.00, "Combined": 18.00 }, "3-Bed Semi": { "Buildings": 18.00, "Contents": 14.00, "Combined": 28.00 }, "4-Bed Detached": { "Buildings": 28.00, "Contents": 22.00, "Combined": 42.00 } },
      "High-Risk Area": { "1-Bed Flat": { "Buildings": 18.00, "Contents": 12.00, "Combined": 26.00 }, "3-Bed Semi": { "Buildings": 28.00, "Contents": 20.00, "Combined": 42.00 }, "4-Bed Detached": { "Buildings": 42.00, "Contents": 32.00, "Combined": 65.00 } },
    },
  },
];

const AGE_BANDS = ["25–34", "35–44", "45–54"];
const COVER_AMOUNTS = ["£100k", "£250k", "£500k"];
const IP_AMOUNTS = ["£1k/mo", "£2k/mo", "£3k/mo"];
const GI_PROPERTIES = ["1-Bed Flat", "3-Bed Semi", "4-Bed Detached"];
const GI_COVERS = ["Buildings", "Contents", "Combined"];

export default function InsuranceCatalogue() {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [smokerStatus, setSmokerStatus] = useState("Non-smoker");

  const product = PRODUCTS[selectedProduct];
  const isGI = product.category === "General Insurance";
  const isIP = product.category === "Income Protection";

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Product selector cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {PRODUCTS.map((p, i) => (
          <div
            key={i}
            onClick={() => setSelectedProduct(i)}
            style={{
              flex: "1 1 0", minWidth: 140, padding: "12px 14px", borderRadius: 12, cursor: "pointer",
              border: selectedProduct === i ? `2px solid ${p.color}` : `1px solid ${T.borderLight}`,
              background: selectedProduct === i ? p.color + "08" : T.card,
              transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: p.color }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{p.name}</span>
            </div>
            <div style={{ fontSize: 10, color: T.textMuted }}>{p.category}</div>
          </div>
        ))}
      </div>

      {/* Selected product detail */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: product.color }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>{product.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{product.desc}</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: product.color + "14", color: product.color, fontFamily: "monospace" }}>{product.code}</span>
        </div>

        {/* Key info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Cover Range</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{product.coverRange}</div>
          </div>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Term</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{product.termRange}</div>
          </div>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Premiums</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{product.premiumBasis}</div>
          </div>
          <div style={{ padding: "8px 10px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Underwriting</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{product.underwriting}</div>
          </div>
        </div>

        {/* Features */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Key Features</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {product.features.map((f, i) => (
            <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", fontWeight: 500 }}>
              {f}
            </span>
          ))}
        </div>
      </Card>

      {/* Premium table */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>
            {isGI ? "Premium Table (monthly)" : "Indicative Premiums (monthly)"}
          </div>
          {!isGI && (
            <div style={{ display: "flex", gap: 0 }}>
              {["Non-smoker", "Smoker"].map((s, i) => (
                <button key={s} onClick={() => setSmokerStatus(s)} style={{
                  padding: "6px 16px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                  background: smokerStatus === s ? T.primary : T.card, color: smokerStatus === s ? "#fff" : T.textMuted,
                  border: `1px solid ${smokerStatus === s ? T.primary : T.border}`,
                  borderRadius: i === 0 ? "6px 0 0 6px" : "0 6px 6px 0",
                }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>
                  {isGI ? "Property Type" : "Age Band"}
                </th>
                {(isGI ? GI_COVERS : isIP ? IP_AMOUNTS : COVER_AMOUNTS).map(c => (
                  <th key={c} style={{ textAlign: "center", padding: "8px 8px", fontSize: 10, fontWeight: 700, color: T.navy }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isGI ? GI_PROPERTIES : AGE_BANDS).map((row, i) => {
                const premiums = isGI
                  ? product.premiums[smokerStatus === "Non-smoker" ? "Standard" : "High-Risk Area"]?.[row] || {}
                  : product.premiums[smokerStatus]?.[row] || {};
                const cols = isGI ? GI_COVERS : isIP ? IP_AMOUNTS : COVER_AMOUNTS;
                return (
                  <tr key={row} style={{ borderBottom: `1px solid ${T.borderLight}`, background: i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: T.navy }}>{row}</td>
                    {cols.map(c => {
                      const val = premiums[c];
                      return (
                        <td key={c} style={{ textAlign: "center", padding: "10px 8px" }}>
                          {val != null
                            ? <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>£{val.toFixed(2)}<span style={{ fontSize: 10, color: T.textMuted }}>/mo</span></span>
                            : <span style={{ color: "#CBD5E1" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(26,74,84,0.04)", borderRadius: 8, borderLeft: `3px solid ${product.color}`, fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>
          {isGI
            ? "Premiums shown are indicative monthly costs. Actual premiums depend on property location, construction, claims history, and selected add-ons."
            : "Premiums shown are indicative for a healthy individual with no pre-existing conditions. Actual premiums depend on full medical underwriting, occupation, and lifestyle factors."}
        </div>
      </Card>
    </div>
  );
}
