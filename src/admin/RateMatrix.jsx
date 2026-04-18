import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { LTV_ADJUSTMENTS } from "../data/pricing";

const FILTERS = ["All", "Lending", "Savings"];

const ALL_LTV_BANDS = ["≤60%", "60-75%", "75-85%", "85-90%", "90-95%"];

// Read lending buckets from localStorage
function loadLendingBuckets() {
  try { const s = localStorage.getItem("product_buckets"); return s ? JSON.parse(s) : []; } catch { return []; }
}

// Read savings buckets from localStorage
function loadSavingsBuckets() {
  try { const s = localStorage.getItem("savings_buckets_v3"); return s ? JSON.parse(s) : []; } catch { return []; }
}

// Generate lending data from buckets
function getLendingData() {
  const buckets = loadLendingBuckets();
  const rows = [];
  for (const bucket of buckets) {
    const ltvBandMax = { "≤60%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };
    for (const prod of (bucket.products || [])) {
      rows.push({
        name: prod.type,
        bucket: bucket.name,
        bucketColor: bucket.color,
        code: prod.code,
        rates: ALL_LTV_BANDS.map(b => ltvBandMax[b] <= (bucket.maxLTV || 75) ? (prod.rates?.[b] ?? null) : null),
        maxLtv: bucket.maxLTV + "%",
        erc: prod.erc,
      });
    }
  }
  return rows;
}

// Generate savings data from buckets
function getSavingsData() {
  const buckets = loadSavingsBuckets();
  const rows = [];
  for (const bucket of buckets) {
    for (const prod of (bucket.products || [])) {
      rows.push({
        name: prod.name,
        bucket: bucket.name,
        bucketColor: bucket.color,
        term: prod.term,
        baseRate: prod.baseRate,
        code: prod.code,
      });
    }
  }
  return rows;
}

const MARKET_COMPARE = [
  { product: "2yr Fix 75% LTV", ours: "4.49%", market: "4.55%", rank: "#3 of 12", below: true },
  { product: "5yr Fix 75% LTV", ours: "4.89%", market: "4.82%", rank: "#5 of 12", below: false },
  { product: "90-Day Notice", ours: "3.20%", market: "3.45%", rank: "#8 of 10", below: false },
];

function rateColor(rate) {
  if (rate < 4.5) return { background: "#E6F7F3", color: "#065F46" };
  if (rate <= 5.5) return { background: "#FFF8E0", color: "#92400E" };
  return { background: "#FFF0EF", color: "#991B1B" };
}

function savingsColor(rate) {
  if (rate > 4.5) return { background: "#E6F7F3", color: "#065F46" };
  if (rate >= 3.5) return { background: "#FFF8E0", color: "#92400E" };
  return { background: "#F1F5F9", color: "#64748B" };
}

const thStyle = {
  padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted,
  textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left",
  borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.border}`,
};

export default function RateMatrix() {
  const [filter, setFilter] = useState("All");
  const MORTGAGE_DATA = getLendingData();
  const SAVINGS_DATA = getSavingsData();

  const showLending = filter === "All" || filter === "Lending";
  const showSavings = filter === "All" || filter === "Savings";
  const showInsurance = filter === "Insurance";

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {Ico.products(22)}
          <span style={{ fontSize: 20, fontWeight: 700 }}>Rate Matrix</span>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>
          All products and pricing tiers at a glance
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          {Ico.clock(13)} Last updated: 10 Apr 2026
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {FILTERS.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            background: filter === f ? T.primary : T.card,
            color: filter === f ? "#fff" : T.text,
            border: `1px solid ${filter === f ? T.primary : T.border}`,
          }}>{f}</div>
        ))}
      </div>

      {/* Lending Rate Matrix */}
      {showLending && (
        <Card style={{ marginBottom: 24 }} noPad>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              Mortgage Products — Rate by LTV Band
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              Colour coding: <span style={{ color: "#065F46" }}>green</span> &lt; 4.5% · <span style={{ color: "#92400E" }}>amber</span> 4.5-5.5% · <span style={{ color: "#991B1B" }}>red</span> &gt; 5.5%
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Bucket</th>
                  {ALL_LTV_BANDS.map(b => <th key={b} style={{ ...thStyle, textAlign: "center" }}>{b}</th>)}
                  <th style={{ ...thStyle, textAlign: "center" }}>Max LTV</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>ERC</th>
                </tr>
              </thead>
              <tbody>
                {MORTGAGE_DATA.length === 0 && (
                  <tr><td colSpan={9} style={{ ...tdStyle, textAlign: "center", color: T.textMuted, fontStyle: "italic" }}>No lending buckets configured. Create buckets in Product Catalogue.</td></tr>
                )}
                {MORTGAGE_DATA.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#FAFAF7" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, minWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {p.name}
                        {p.code && <span style={{ fontSize: 9, color: T.textMuted, fontFamily: "monospace" }}>{p.code}</span>}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>
                      <span style={{ fontWeight: 700, padding: "2px 6px", borderRadius: 5, background: (p.bucketColor || T.primary) + "14", color: p.bucketColor || T.primary }}>{p.bucket}</span>
                    </td>
                    {p.rates.map((r, j) => (
                      <td key={j} style={{ ...tdStyle, textAlign: "center" }}>
                        {r != null ? (
                          <span style={{
                            display: "inline-block", padding: "4px 10px", borderRadius: 6,
                            fontSize: 13, fontWeight: 600, ...rateColor(r),
                          }}>{r.toFixed(2) + "%"}</span>
                        ) : (
                          <span style={{ color: T.textMuted }}>—</span>
                        )}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, fontSize: 12 }}>{p.maxLtv}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 12, color: T.textMuted }}>{p.erc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Savings Rate Matrix */}
      {showSavings && (
        <Card style={{ marginBottom: 24 }} noPad>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Savings Products</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              Colour coding: <span style={{ color: "#065F46" }}>green</span> ≥ 5.0% · <span style={{ color: "#92400E" }}>amber</span> 3.5–4.99% · <span style={{ color: "#64748B" }}>grey</span> &lt; 3.5%
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Bucket</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Term</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Base Rate (AER)</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Code</th>
                </tr>
              </thead>
              <tbody>
                {SAVINGS_DATA.length === 0 && (
                  <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: T.textMuted, fontStyle: "italic" }}>No savings buckets configured.</td></tr>
                )}
                {SAVINGS_DATA.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#FAFAF7" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, minWidth: 160 }}>{p.name}</td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>
                      <span style={{ fontWeight: 700, padding: "2px 6px", borderRadius: 5, background: (p.bucketColor || T.primary) + "14", color: p.bucketColor || T.primary }}>{p.bucket}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>{p.term}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {p.baseRate != null ? (
                        <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 600, ...savingsColor(p.baseRate) }}>{p.baseRate.toFixed(2)}%</span>
                      ) : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{p.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Market Comparison Strip */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.chart(18)} Our Position vs Market
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MARKET_COMPARE.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
              borderRadius: 10, background: "#FAFAF7", flexWrap: "wrap",
            }}>
              <span style={{ fontWeight: 600, fontSize: 13, minWidth: 160 }}>{c.product}</span>
              <span style={{ fontSize: 13, color: T.textMuted }}>
                Ours <strong style={{ color: T.text }}>{c.ours}</strong>
                {" · "}Market avg <strong style={{ color: T.text }}>{c.market}</strong>
                {" · "}Rank <strong style={{ color: T.text }}>{c.rank}</strong>
              </span>
              <span style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: c.below ? T.successBg : T.warningBg,
                color: c.below ? T.success : T.warning,
                marginLeft: "auto",
              }}>
                {c.below ? "Below market" : "Above market"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insight */}
      <Card style={{ borderLeft: `4px solid #A3E635`, background: "#FBFFF5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {Ico.sparkle(18)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>AI Rate Insight</span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: T.text }}>
          Rate gap analysis: our BTL Tracker at 5.99% is 0.34% above market average.
          Reducing to 5.65% would improve broker submissions by ~18% based on historical
          elasticity. The 2yr Fix 75% at 4.49% is well-positioned at rank #3, while the
          90-Day Notice account is losing share — recommend reviewing vs market leader rate.
        </div>
      </Card>
    </div>
  );
}
