import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const FILTERS = ["All", "Lending", "Savings", "Insurance"];

const LTV_BANDS = ["\u226460%", "60-75%", "75-85%", "85-90%", "90-95%"];

const MORTGAGE_DATA = [
  { name: "Afin Fix 2yr 75%", rates: [4.19, 4.49, null, null, null], maxLtv: "75%", erc: "2%/1%", note: null },
  { name: "Afin Fix 5yr 75%", rates: [4.59, 4.89, null, null, null], maxLtv: "75%", erc: "5%\u20261%", note: null },
  { name: "Afin Track SVR 75%", rates: [4.84, 5.14, null, null, null], maxLtv: "75%", erc: "None", note: null },
  { name: "Afin Fix 2yr 90%", rates: [4.49, 4.79, 4.99, 5.29, null], maxLtv: "90%", erc: "2%/1%", note: null },
  { name: "Afin Pro Fix 2yr", rates: [3.69, 3.99, 4.29, null, null], maxLtv: "85%", erc: "2%/1%", note: "Professional only" },
  { name: "Afin HNW Fix 5yr", rates: [3.99, 4.29, 4.59, 4.89, null], maxLtv: "85%", erc: "3%\u20261%", note: "HNW only" },
  { name: "Afin BTL Tracker", rates: [5.49, 5.99, 6.29, null, null], maxLtv: "75%", erc: "1%", note: "BTL only" },
  { name: "Afin Shared Ownership", rates: [4.99, 5.49, 5.79, 5.99, 5.69], maxLtv: "95%", erc: "2%/1%", note: "of share" },
];

const SAVINGS_BANDS = ["\u00a31k-\u00a39.9k", "\u00a310k-\u00a349.9k", "\u00a350k-\u00a3249.9k", "\u00a3250k+"];

const SAVINGS_DATA = [
  { name: "1yr Fixed", rates: [4.25, 4.50, 4.65, 4.80], minDeposit: "\u00a31,000", term: "12 months" },
  { name: "2yr Fixed", rates: [4.60, 4.85, 5.00, 5.15], minDeposit: "\u00a31,000", term: "24 months" },
  { name: "3yr Fixed", rates: [4.85, 5.10, 5.25, 5.40], minDeposit: "\u00a35,000", term: "36 months" },
  { name: "90-Day Notice", rates: [2.95, 3.20, 3.45, 3.60], minDeposit: "\u00a31,000", term: "Notice" },
];

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
                  <th style={thStyle}>Product Name</th>
                  {LTV_BANDS.map(b => <th key={b} style={{ ...thStyle, textAlign: "center" }}>{b}</th>)}
                  <th style={{ ...thStyle, textAlign: "center" }}>Max LTV</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>ERC</th>
                </tr>
              </thead>
              <tbody>
                {MORTGAGE_DATA.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#FAFAF7" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, minWidth: 180 }}>
                      {p.name}
                      {p.note && <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 400, marginTop: 2 }}>{p.note}</div>}
                    </td>
                    {p.rates.map((r, j) => (
                      <td key={j} style={{ ...tdStyle, textAlign: "center" }}>
                        {r != null ? (
                          <span style={{
                            display: "inline-block", padding: "4px 10px", borderRadius: 6,
                            fontSize: 13, fontWeight: 600, ...rateColor(r),
                          }}>{r.toFixed(2)}%</span>
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
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              Savings Products — Rate by Balance Band
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
              Colour coding: <span style={{ color: "#065F46" }}>green</span> &gt; 4.5% · <span style={{ color: "#92400E" }}>amber</span> 3.5-4.5% · <span style={{ color: "#64748B" }}>grey</span> &lt; 3.5%
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Product</th>
                  {SAVINGS_BANDS.map(b => <th key={b} style={{ ...thStyle, textAlign: "center" }}>{b}</th>)}
                  <th style={{ ...thStyle, textAlign: "center" }}>Min Deposit</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Term</th>
                </tr>
              </thead>
              <tbody>
                {SAVINGS_DATA.map((p, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#FAFAF7" }}>
                    <td style={{ ...tdStyle, fontWeight: 600, minWidth: 140 }}>{p.name}</td>
                    {p.rates.map((r, j) => (
                      <td key={j} style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{
                          display: "inline-block", padding: "4px 10px", borderRadius: 6,
                          fontSize: 13, fontWeight: 600, ...savingsColor(r),
                        }}>{r.toFixed(2)}%</span>
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 12 }}>{p.minDeposit}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontSize: 12, color: T.textMuted }}>{p.term}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Insurance placeholder */}
      {showInsurance && (
        <Card style={{ marginBottom: 24, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 14, color: T.textMuted }}>Insurance products coming soon</div>
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
