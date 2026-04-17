import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const PERIODS = ["This Month", "This Quarter", "YTD", "12 Months"];

const KPIS = [
  { label: "Total Products", value: "14", sub: "2 paused", color: T.primary },
  { label: "Active", value: "12", sub: "across 3 categories", color: T.accent },
  { label: "Applications This Month", value: "47", sub: "+12% vs last month", color: "#6366F1" },
  { label: "Completions", value: "23", sub: "48.9% conversion", color: T.success },
  { label: "Avg Margin", value: "1.52%", sub: "target 1.50%", color: T.warning },
  { label: "Book Value", value: "\u00a34.2M", sub: "+\u00a3620k this month", color: T.primary },
];

const LEADERBOARD = [
  { product: "Afin Fix 2yr 75%", apps: 14, completions: 9, conversion: 64.3, avgDeal: "\u00a3287k", margin: "1.42%", revenue: "\u00a336.7k" },
  { product: "Afin Fix 2yr 90%", apps: 8, completions: 5, conversion: 62.5, avgDeal: "\u00a3198k", margin: "1.58%", revenue: "\u00a315.6k" },
  { product: "2yr Fixed Savings", apps: 6, completions: 4, conversion: 66.7, avgDeal: "\u00a345k", margin: "0.85%", revenue: "\u00a31.5k" },
  { product: "Afin Pro Fix 2yr", apps: 5, completions: 3, conversion: 60.0, avgDeal: "\u00a3512k", margin: "1.24%", revenue: "\u00a319.0k" },
  { product: "Afin HNW Fix 5yr", apps: 4, completions: 2, conversion: 50.0, avgDeal: "\u00a3745k", margin: "1.68%", revenue: "\u00a325.0k" },
  { product: "Afin BTL Tracker", apps: 4, completions: 2, conversion: 50.0, avgDeal: "\u00a3320k", margin: "2.04%", revenue: "\u00a313.1k" },
  { product: "1yr Fixed Savings", apps: 3, completions: 1, conversion: 33.3, avgDeal: "\u00a328k", margin: "0.78%", revenue: "\u00a3218" },
  { product: "Afin Shared Ownership", apps: 3, completions: 1, conversion: 33.3, avgDeal: "\u00a3165k", margin: "1.35%", revenue: "\u00a32.2k" },
];

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

const TREND_DATA = [
  { month: "Nov", apps: 28, comp: 12 },
  { month: "Dec", apps: 24, comp: 10 },
  { month: "Jan", apps: 31, comp: 14 },
  { month: "Feb", apps: 35, comp: 17 },
  { month: "Mar", apps: 41, comp: 20 },
  { month: "Apr", apps: 47, comp: 23 },
];

const MARGIN_DATA = [
  { type: "Fixed Rate", margin: 1.54, color: T.success },
  { type: "Tracker", margin: 1.19, color: T.warning },
  { type: "BTL", margin: 2.04, color: T.success },
  { type: "Savings", margin: 0.85, color: T.warning },
];

function conversionColor(pct) {
  if (pct > 60) return { background: "#E6F7F3", color: "#065F46" };
  if (pct >= 40) return { background: "#FFF8E0", color: "#92400E" };
  return { background: "#FFF0EF", color: "#991B1B" };
}

const thStyle = {
  padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted,
  textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left",
  borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.border}`,
};

export default function ProductPerformance() {
  const [period, setPeriod] = useState("This Month");

  const maxApps = Math.max(...TREND_DATA.map(d => d.apps));
  const chartH = 200;
  const barW = 28;
  const gap = 12;
  const groupW = barW * 2 + gap;
  const chartW = TREND_DATA.length * (groupW + 40);
  const maxMargin = Math.max(...MARGIN_DATA.map(d => d.margin));
  const barAreaW = 320;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {Ico.chart(22)}
          <span style={{ fontSize: 20, fontWeight: 700 }}>Product Performance</span>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted }}>
          Volume, margin and conversion analytics
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {PERIODS.map(p => (
          <div key={p} onClick={() => setPeriod(p)} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            background: period === p ? T.primary : T.card,
            color: period === p ? "#fff" : T.text,
            border: `1px solid ${period === p ? T.primary : T.border}`,
          }}>{p}</div>
        ))}
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        {KPIS.map((k, i) => (
          <KPICard key={i} label={k.label} value={k.value} sub={k.sub} color={k.color} />
        ))}
      </div>

      {/* Product Leaderboard */}
      <Card style={{ marginBottom: 24 }} noPad>
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Product Leaderboard</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Sorted by completions descending</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 32 }}>#</th>
                <th style={thStyle}>Product</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Applications</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Completions</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Conversion %</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Avg Deal Size</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Margin</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#FAFAF7" }}>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {i < 3 ? (
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 24, height: 24, borderRadius: 12, fontSize: 12, fontWeight: 700,
                        background: MEDAL_COLORS[i] + "22", color: MEDAL_COLORS[i],
                        border: `2px solid ${MEDAL_COLORS[i]}`,
                      }}>{i + 1}</span>
                    ) : (
                      <span style={{ color: T.textMuted, fontSize: 12 }}>{i + 1}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{row.product}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{row.apps}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700 }}>{row.completions}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 10px", borderRadius: 6,
                      fontSize: 12, fontWeight: 600, ...conversionColor(row.conversion),
                    }}>{row.conversion.toFixed(1)}%</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{row.avgDeal}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{row.margin}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trend Chart */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Monthly Applications vs Completions</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: T.primary, marginRight: 6, verticalAlign: "middle" }} />
          Applications
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: T.accent, marginLeft: 16, marginRight: 6, verticalAlign: "middle" }} />
          Completions
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg width={chartW + 40} height={chartH + 50} style={{ display: "block" }}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
              <line key={i} x1={30} y1={chartH * (1 - f) + 10} x2={chartW + 30} y2={chartH * (1 - f) + 10}
                stroke={T.border} strokeWidth={1} strokeDasharray={f > 0 && f < 1 ? "4,4" : "0"} />
            ))}
            {TREND_DATA.map((d, i) => {
              const x = 40 + i * (groupW + 40);
              const appH = (d.apps / maxApps) * chartH;
              const compH = (d.comp / maxApps) * chartH;
              return (
                <g key={i}>
                  {/* Applications bar */}
                  <rect x={x} y={chartH - appH + 10} width={barW} height={appH} rx={4} fill={T.primary} />
                  <text x={x + barW / 2} y={chartH - appH + 4} textAnchor="middle"
                    style={{ fontSize: 10, fontWeight: 700, fill: T.text }}>{d.apps}</text>
                  {/* Completions bar */}
                  <rect x={x + barW + gap} y={chartH - compH + 10} width={barW} height={compH} rx={4} fill={T.accent} />
                  <text x={x + barW + gap + barW / 2} y={chartH - compH + 4} textAnchor="middle"
                    style={{ fontSize: 10, fontWeight: 700, fill: T.text }}>{d.comp}</text>
                  {/* Month label */}
                  <text x={x + groupW / 2} y={chartH + 30} textAnchor="middle"
                    style={{ fontSize: 11, fill: T.textMuted }}>{d.month}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* Margin Analysis */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Margin by Product Type</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MARGIN_DATA.map((d, i) => {
            const pct = (d.margin / maxMargin) * 100;
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{d.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.margin.toFixed(2)}%</span>
                </div>
                <div style={{ position: "relative", height: 22, background: "#F1F5F9", borderRadius: 6 }}>
                  <div style={{
                    height: "100%", borderRadius: 6, background: d.color,
                    width: `${pct}%`, opacity: 0.8, transition: "width 0.3s",
                  }} />
                  {/* Target line at 1.50% */}
                  <div style={{
                    position: "absolute", top: -4, bottom: -4,
                    left: `${(1.50 / maxMargin) * 100}%`,
                    width: 2, borderLeft: "2px dashed #64748B",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 11, color: T.textMuted }}>
          <span style={{ display: "inline-block", width: 16, borderTop: "2px dashed #64748B" }} />
          Target margin: 1.50%
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card style={{ borderLeft: "4px solid #A3E635", background: "#FBFFF5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.sparkle(18)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>AI Recommendations</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            padding: "14px 16px", borderRadius: 10, background: "#fff",
            border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.7,
          }}>
            The <strong>2yr Fix 75%</strong> is your best performer by volume but margin is below target.
            Consider: (1) launching a 2yr Fix 80% tier at 4.79% to capture the 75-80% LTV gap,
            (2) reviewing ERC structure to improve retention.
          </div>
          <div style={{
            padding: "14px 16px", borderRadius: 10, background: "#fff",
            border: `1px solid ${T.border}`, fontSize: 13, lineHeight: 1.7,
          }}>
            <strong>90-Day Notice</strong> is losing deposits to competitors. Rate is 0.25% below
            market leader. Recommend matching to stem outflows.
          </div>
        </div>
      </Card>
    </div>
  );
}
