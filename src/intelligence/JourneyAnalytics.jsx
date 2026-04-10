import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

// ─────────────────────────────────────────────
// STAGE DISTRIBUTION DATA
// ─────────────────────────────────────────────
const STAGE_NAMES = [
  "Awareness & Enquiry",
  "Application & Advice",
  "Assessment & Decision",
  "Offer & Completion",
  "Ongoing Servicing",
  "Retention & Exit",
];

const STAGE_DISTRIBUTION = [
  { stage: "Awareness & Enquiry", count: 1, customers: ["Tom & Lucy Brennan"] },
  { stage: "Application & Advice", count: 1, customers: ["David Chen"] },
  { stage: "Assessment & Decision", count: 0, customers: [] },
  { stage: "Offer & Completion", count: 0, customers: [] },
  { stage: "Ongoing Servicing", count: 5, customers: ["Emma Wilson", "James & Sarah Mitchell", "Priya Sharma", "Aisha Patel", "Maria Santos"] },
  { stage: "Retention & Exit", count: 1, customers: ["Robert Hughes"] },
];

const MAX_COUNT = 5;

// ─────────────────────────────────────────────
// STAGE PERFORMANCE DATA
// ─────────────────────────────────────────────
const STAGE_PERFORMANCE = [
  { stage: "Awareness & Enquiry", customers: 1, avgTime: 3, targetTime: 5, sla: "On Track", dropout: "2%", dutyScore: 90 },
  { stage: "Application & Advice", customers: 1, avgTime: 5, targetTime: 5, sla: "On Track", dropout: "8%", dutyScore: 86 },
  { stage: "Assessment & Decision", customers: 0, avgTime: 12, targetTime: 7, sla: "Breaching", dropout: "6%", dutyScore: 82 },
  { stage: "Offer & Completion", customers: 0, avgTime: 4, targetTime: 5, sla: "On Track", dropout: "3%", dutyScore: 88 },
  { stage: "Ongoing Servicing", customers: 5, avgTime: 0, targetTime: 0, sla: "On Track", dropout: "1%", dutyScore: 84 },
  { stage: "Retention & Exit", customers: 1, avgTime: 14, targetTime: 10, sla: "Breaching", dropout: "12%", dutyScore: 72 },
];

// ─────────────────────────────────────────────
// CONSUMER DUTY HEATMAP DATA
// ─────────────────────────────────────────────
const HEATMAP = [
  { stage: "Awareness & Enquiry", products: 90, price: 85, understanding: 82, support: 88 },
  { stage: "Application & Advice", products: 92, price: 88, understanding: 80, support: 84 },
  { stage: "Assessment & Decision", products: 94, price: 90, understanding: 78, support: 80 },
  { stage: "Offer & Completion", products: 91, price: 87, understanding: 85, support: 82 },
  { stage: "Ongoing Servicing", products: 88, price: 84, understanding: 83, support: 76 },
  { stage: "Retention & Exit", products: 82, price: 78, understanding: 75, support: 70 },
];

const OUTCOME_KEYS = ["products", "price", "understanding", "support"];
const OUTCOME_LABELS = {
  products: "Products & Services",
  price: "Price & Value",
  understanding: "Understanding",
  support: "Support",
};

// ─────────────────────────────────────────────
// FUNNEL DATA
// ─────────────────────────────────────────────
const FUNNEL = [
  { stage: "Enquiry", pct: 100, dropoff: null },
  { stage: "Application", pct: 85, dropoff: "15% did not proceed — incomplete documents, eligibility mismatch" },
  { stage: "Assessment", pct: 78, dropoff: "7% withdrawn — valuation issues, credit declines" },
  { stage: "Offer", pct: 72, dropoff: "6% did not accept — better rate found elsewhere" },
  { stage: "Completion", pct: 68, dropoff: "4% fell through — legal delays, chain collapse" },
  { stage: "Retained", pct: 64, dropoff: "4% churned — moved lender at product expiry" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function ragColor(score) {
  if (score >= 80) return T.success;
  if (score >= 60) return T.warning;
  return T.danger;
}

function ragBg(score) {
  if (score >= 80) return T.successBg;
  if (score >= 60) return T.warningBg;
  return T.dangerBg;
}

// ─────────────────────────────────────────────
// JOURNEY ANALYTICS COMPONENT
// ─────────────────────────────────────────────
// Product-specific journey data
const PRODUCT_DATA = {
  "All Products": { customers:8, journeyDays:18, dutyScore:87, dropout:4, vuln:2 },
  "Mortgages":    { customers:8, journeyDays:18, dutyScore:87, dropout:4, vuln:2 },
  "Savings":      { customers:9, journeyDays:3,  dutyScore:94, dropout:1, vuln:0 },
  "Current Accounts":{ customers:2, journeyDays:1, dutyScore:96, dropout:0, vuln:0 },
  "Insurance":    { customers:3, journeyDays:5,  dutyScore:91, dropout:2, vuln:0 },
  "Shared Ownership":{ customers:2, journeyDays:24, dutyScore:84, dropout:6, vuln:0 },
};

const PRODUCT_OPTIONS = ["All Products","Mortgages","Savings","Current Accounts","Insurance","Shared Ownership"];

export default function JourneyAnalytics() {
  const [exportMsg, setExportMsg] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("All Products");

  const data = PRODUCT_DATA[selectedProduct] || PRODUCT_DATA["All Products"];

  const handleExport = () => {
    setExportMsg(true);
    setTimeout(() => setExportMsg(false), 3000);
  };

  return (
    <div style={{ fontFamily: T.font, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.primary }}>{Ico.chart(22)}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Customer Journey Analytics</span>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 32 }}>
            End-to-end journey performance and Consumer Duty compliance — viewing: <strong style={{ color:T.primary }}>{selectedProduct}</strong>
          </div>
        </div>
        {/* Product selector */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:T.textMuted, fontWeight:600 }}>Product:</span>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
            style={{ padding:"8px 14px", borderRadius:9, border:`1.5px solid ${T.border}`,
              fontSize:13, fontFamily:T.font, fontWeight:600, background:T.card, color:T.text, cursor:"pointer", minWidth:200 }}>
            {PRODUCT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs — adapt per product */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap:"wrap" }}>
        <KPICard label="Total Customers" value={String(data.customers)} sub={selectedProduct} color={T.primary} />
        <KPICard label="Avg Journey Time" value={`${data.journeyDays} days`} sub="Enquiry to completion" color={T.accent} />
        <KPICard label="Consumer Duty Score" value={`${data.dutyScore}/100`} sub="Across all pillars" color={data.dutyScore >= 85 ? T.success : T.warning} />
        <KPICard label="Dropout Rate" value={`${data.dropout}%`} sub="Last 12 months" color={data.dropout > 5 ? T.danger : T.warning} />
        <KPICard label="Vulnerability Cases" value={String(data.vuln)} sub="Active monitoring" color={T.danger} />
      </div>

      {/* Stage Distribution */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ color: T.primary }}>{Ico.users(18)}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Stage Distribution</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {STAGE_DISTRIBUTION.map(row => (
            <div key={row.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 180, fontSize: 12, fontWeight: 600, color: T.textSecondary, flexShrink: 0 }}>
                {row.stage}
              </div>
              <div style={{ flex: 1, height: 24, background: T.borderLight, borderRadius: 6, overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${(row.count / MAX_COUNT) * 100}%`, height: "100%", borderRadius: 6,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                  minWidth: row.count > 0 ? 24 : 0,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ width: 30, fontSize: 13, fontWeight: 700, color: T.text, textAlign: "right" }}>
                {row.count}
              </div>
              <div style={{ width: 200, fontSize: 10, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.customers.join(", ") || "—"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stage Performance Table */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ color: T.primary }}>{Ico.clock(18)}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Stage Performance</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Stage", "Customers", "Avg Time", "Target Time", "SLA Status", "Dropout Rate", "Duty Score"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAGE_PERFORMANCE.map(row => {
                const timeBreaching = row.avgTime > row.targetTime && row.targetTime > 0;
                const dropoutNum = parseInt(row.dropout);
                const dropoutHigh = dropoutNum > 5;
                const rowBg = timeBreaching ? T.warningBg : dropoutHigh ? T.dangerBg : "transparent";

                return (
                  <tr key={row.stage} style={{ borderBottom: `1px solid ${T.borderLight}`, background: rowBg }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: T.text }}>{row.stage}</td>
                    <td style={{ padding: "10px 12px", color: T.text }}>{row.customers}</td>
                    <td style={{ padding: "10px 12px", color: timeBreaching ? T.warning : T.text, fontWeight: timeBreaching ? 700 : 400 }}>
                      {row.avgTime > 0 ? `${row.avgTime} days` : "N/A"}
                    </td>
                    <td style={{ padding: "10px 12px", color: T.textMuted }}>
                      {row.targetTime > 0 ? `${row.targetTime} days` : "N/A"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                        background: row.sla === "On Track" ? T.successBg : T.warningBg,
                        color: row.sla === "On Track" ? T.success : T.warning,
                      }}>
                        {row.sla}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: dropoutHigh ? T.danger : T.text, fontWeight: dropoutHigh ? 700 : 400 }}>
                      {row.dropout}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontWeight: 700, color: ragColor(row.dutyScore) }}>{row.dutyScore}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Consumer Duty Heatmap */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ color: T.primary }}>{Ico.shield(18)}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Consumer Duty Heatmap</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase" }}>Stage</th>
                {OUTCOME_KEYS.map(k => (
                  <th key={k} style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase" }}>
                    {OUTCOME_LABELS[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEATMAP.map(row => (
                <tr key={row.stage} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: T.text, fontSize: 12 }}>{row.stage}</td>
                  {OUTCOME_KEYS.map(k => (
                    <td key={k} style={{ textAlign: "center", padding: "8px 12px" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 14px", borderRadius: 6,
                        background: ragBg(row[k]), color: ragColor(row[k]),
                        fontWeight: 700, fontSize: 13, minWidth: 40,
                      }}>
                        {row[k]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {/* Overall row */}
              <tr style={{ borderTop: `2px solid ${T.border}`, background: T.primaryLight }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: T.primary, fontSize: 12 }}>Overall</td>
                {OUTCOME_KEYS.map(k => {
                  const avg = Math.round(HEATMAP.reduce((s, r) => s + r[k], 0) / HEATMAP.length);
                  return (
                    <td key={k} style={{ textAlign: "center", padding: "8px 12px" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 14px", borderRadius: 6,
                        background: ragBg(avg), color: ragColor(avg),
                        fontWeight: 700, fontSize: 13,
                      }}>
                        {avg}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lowest score insight */}
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 8,
          background: T.warningBg, border: `1px solid ${T.warningBorder}`,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <span style={{ color: T.warning, flexShrink: 0, marginTop: 2 }}>{Ico.alert(16)}</span>
          <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
            <strong>Consumer Support in Stage 5 (Servicing) at 76%</strong> is the weakest pillar — 3 customers have had no proactive contact in &gt;6 months.
          </span>
        </div>
      </Card>

      {/* Bottleneck Analysis */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ color: T.primary }}>{Ico.sparkle(18)}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Bottleneck Analysis</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
            background: "linear-gradient(135deg, rgba(26,74,84,0.1), rgba(49,184,151,0.1))",
            color: T.primary, marginLeft: 4,
          }}>
            AI Insight
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            padding: "14px 18px", borderRadius: 10,
            background: T.primaryLight, border: `1px solid ${T.borderLight}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: T.warning }}>{Ico.clock(14)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Processing Delay</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
              Stage 3 (Assessment) has the longest average time at <strong>12 days</strong>. Root cause: valuation turnaround from Countrywide Surveying averaging 4.2 days vs 3-day SLA.
            </div>
          </div>

          <div style={{
            padding: "14px 18px", borderRadius: 10,
            background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: T.danger }}>{Ico.alert(14)}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Retention Risk</span>
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
              Stage 6 (Retention) shows 1 customer at risk of exit — <strong>Robert Hughes</strong> (locked account, arrears). Retention probability: <strong>15%</strong>.
            </div>
          </div>
        </div>
      </Card>

      {/* Journey Funnel */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ color: T.primary }}>{Ico.arrow(18)}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Journey Funnel</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
          {FUNNEL.map((step, idx) => {
            const widthPct = step.pct;
            const nextPct = FUNNEL[idx + 1]?.pct;
            const dropPct = nextPct != null ? step.pct - nextPct : 0;
            const color = step.pct >= 80 ? T.success : step.pct >= 60 ? T.primary : T.warning;

            return (
              <React.Fragment key={step.stage}>
                <div style={{
                  width: `${widthPct}%`, minWidth: 200, padding: "12px 20px",
                  background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                  border: `1px solid ${color}30`,
                  borderRadius: idx === 0 ? "10px 10px 0 0" : idx === FUNNEL.length - 1 ? "0 0 10px 10px" : 0,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderBottom: idx < FUNNEL.length - 1 ? "none" : undefined,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{step.stage}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color }}>{step.pct}%</span>
                </div>
                {step.dropoff && (
                  <div style={{
                    width: `${widthPct - 4}%`, minWidth: 180,
                    fontSize: 10, color: T.textMuted, padding: "4px 20px",
                    textAlign: "right",
                  }}>
                    -{dropPct}% — {step.dropoff.split("—")[1]?.trim() || step.dropoff}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Export Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 16 }}>
        {exportMsg && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.success,
            padding: "8px 14px", background: T.successBg, borderRadius: 8,
          }}>
            {Ico.check(14)} Consumer Duty Board Report exported successfully.
          </div>
        )}
        <Btn primary icon="download" onClick={handleExport}>
          Export Consumer Duty Board Report
        </Btn>
      </div>
    </div>
  );
}
