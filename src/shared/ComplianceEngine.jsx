import React from "react";
import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── mock data ── */
const PRODUCTS = [
  { name: "2-Year Fixed Residential", type: "Lending", rate: "5.24%", peer: "Below", score: 92, status: "Fair" },
  { name: "5-Year Fixed Residential", type: "Lending", rate: "4.89%", peer: "At", score: 88, status: "Fair" },
  { name: "2-Year Fixed BTL", type: "Lending", rate: "5.74%", peer: "Above", score: 76, status: "Review" },
  { name: "Variable Tracker", type: "Lending", rate: "5.49%", peer: "Below", score: 94, status: "Fair" },
  { name: "90-Day Notice Saver", type: "Savings", rate: "4.15%", peer: "At", score: 78, status: "Review" },
  { name: "Easy Access Saver", type: "Savings", rate: "3.50%", peer: "Below", score: 91, status: "Fair" },
  { name: "Fixed Rate ISA 1yr", type: "Savings", rate: "4.35%", peer: "Below", score: 95, status: "Fair" },
  { name: "Offset Mortgage", type: "Lending", rate: "5.59%", peer: "At", score: 83, status: "Monitor" },
];

const VULN_CASES = [
  { id: "CUS-003", name: "Sarah Mitchell", type: "Financial Difficulty", severity: "High", detected: "AI", protocol: "Active", days: 12 },
  { id: "CUS-011", name: "James Harrington", type: "Health", severity: "Medium", detected: "Broker", protocol: "Monitoring", days: 34 },
  { id: "CUS-006", name: "Priya Patel", type: "Life Event", severity: "High", detected: "AI", protocol: "Active", days: 5 },
];

const TIMELINE_DATA = [
  { month: "May", ps: 95, pv: 90, cu: 96, cs: 93 },
  { month: "Jun", ps: 96, pv: 91, cu: 97, cs: 92 },
  { month: "Jul", ps: 94, pv: 89, cu: 95, cs: 91 },
  { month: "Aug", ps: 97, pv: 92, cu: 97, cs: 94 },
  { month: "Sep", ps: 95, pv: 90, cu: 96, cs: 93 },
  { month: "Oct", ps: 96, pv: 91, cu: 98, cs: 94 },
  { month: "Nov", ps: 93, pv: 88, cu: 94, cs: 90 },
  { month: "Dec", ps: 86, pv: 78, cu: 84, cs: 82 },
  { month: "Jan", ps: 90, pv: 84, cu: 90, cs: 88 },
  { month: "Feb", ps: 94, pv: 89, cu: 95, cs: 92 },
  { month: "Mar", ps: 96, pv: 91, cu: 97, cs: 93 },
  { month: "Apr", ps: 96, pv: 91, cu: 97, cs: 92 },
];

const ALERTS = [
  { ts: "10 Apr 09:14", severity: "Critical", desc: "Customer CUS-003 missed 3rd consecutive payment — vulnerability protocol triggered", status: "Open" },
  { ts: "09 Apr 16:32", severity: "Warning", desc: "90-Day Notice product fair value score dropped to 78 — peer rates have increased", status: "Open" },
  { ts: "09 Apr 11:05", severity: "Info", desc: "Quarterly Consumer Duty board report due in 5 days", status: "Acknowledged" },
  { ts: "08 Apr 14:21", severity: "Warning", desc: "Broker complaint rate for Apex Mortgages increased 15% this quarter", status: "Open" },
  { ts: "07 Apr 09:00", severity: "Info", desc: "AI model retrained — vulnerability detection accuracy improved to 94.2%", status: "Resolved" },
  { ts: "06 Apr 17:48", severity: "Critical", desc: "KYC expiry for CUS-006 — regulatory breach if not renewed within 30 days", status: "Acknowledged" },
];

const WORKFLOWS = [
  { name: "Origination", coverage: "Full", checks: 14, audit: "28 Mar 2026" },
  { name: "Underwriting", coverage: "Full", checks: 18, audit: "25 Mar 2026" },
  { name: "Servicing", coverage: "Full", checks: 11, audit: "01 Apr 2026" },
  { name: "Collections", coverage: "Full", checks: 16, audit: "20 Mar 2026" },
  { name: "Rate Switch", coverage: "Full", checks: 9, audit: "15 Mar 2026" },
  { name: "Product Selection", coverage: "Full", checks: 12, audit: "22 Mar 2026" },
  { name: "Customer Onboarding", coverage: "Full", checks: 15, audit: "30 Mar 2026" },
  { name: "Broker Management", coverage: "Partial", checks: 7, audit: "10 Mar 2026" },
  { name: "Complaint Handling", coverage: "Full", checks: 13, audit: "05 Apr 2026" },
  { name: "Document Processing", coverage: "Full", checks: 8, audit: "18 Mar 2026" },
  { name: "Communications", coverage: "Partial", checks: 6, audit: "12 Mar 2026" },
  { name: "Reporting", coverage: "Full", checks: 10, audit: "02 Apr 2026" },
];

/* ── helpers ── */
const statusColor = (s) =>
  s === "Fair" || s === "Resolved" ? T.success :
  s === "Monitor" || s === "Acknowledged" ? T.warning : T.danger;

const severityStyle = (sev) => {
  if (sev === "Critical") return { bg: T.dangerBg, color: T.danger, border: T.dangerBorder };
  if (sev === "Warning") return { bg: T.warningBg, color: T.warning, border: T.warningBorder };
  return { bg: T.successBg, color: T.success, border: T.successBorder };
};

const alertStatusStyle = (s) => {
  if (s === "Open") return { bg: T.dangerBg, color: T.danger };
  if (s === "Acknowledged") return { bg: T.warningBg, color: T.warning };
  return { bg: T.successBg, color: T.success };
};

const coverageStyle = (c) => {
  if (c === "Full") return { color: T.success };
  if (c === "Partial") return { color: T.warning };
  return { color: T.danger };
};

const peerColor = (p) =>
  p === "Below" ? T.success : p === "At" ? T.warning : T.danger;

const Badge = ({ text, bg, color, border }) => (
  <span style={{
    display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 8px",
    borderRadius: 4, background: bg, color, border: border ? `1px solid ${border}` : "none",
    letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap",
  }}>{text}</span>
);

/* ── SVG chart constants ── */
const CHART_W = 960;
const CHART_H = 220;
const BAR_W = 56;
const BAR_GAP = 22;
const MAX_TOTAL = 400; // 4 outcomes x 100
const LEGEND = [
  { label: "Products & Services", color: "#3B82F6" },
  { label: "Price & Value", color: T.success },
  { label: "Understanding", color: "#8B5CF6" },
  { label: "Support", color: "#14B8A6" },
];

export default function ComplianceEngine() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const flagged = PRODUCTS.filter(p => p.score < 80);

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {Ico.shield(24)}
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: T.navy }}>Embedded Compliance Engine</h1>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0, maxWidth: 720 }}>
          FCA Consumer Duty embedded into every workflow — real-time outcome monitoring, fair value scoring, vulnerability protocols
        </p>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Overall Duty Score" value="94/100" sub="Composite index" color={T.success} />
        <KPICard label="Products & Services" value="96%" sub="Outcome 1" color={T.success} />
        <KPICard label="Price & Value" value="91%" sub="Close to threshold" color={T.warning} />
        <KPICard label="Consumer Understanding" value="97%" sub="Outcome 3" color={T.success} />
        <KPICard label="Consumer Support" value="92%" sub="Outcome 4" color={T.success} />
        <KPICard label="Vulnerability Cases" value="3 active" sub="Requires attention" color={T.danger} />
      </div>

      {/* ── Row 1: Fair Value + Vulnerability ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "flex-start" }}>

        {/* Left: Fair Value Scorecard */}
        <Card style={{ flex: "0 0 55%", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            {Ico.dollar(20)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Fair Value Scorecard</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Product", "Type", "Rate", "Peer Comp.", "Score", "Status"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer", background: selectedProduct === i ? T.primaryLight : "transparent" }}
                    onClick={() => setSelectedProduct(selectedProduct === i ? null : i)}>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <Badge text={p.type} bg={p.type === "Lending" ? "rgba(59,130,246,0.1)" : "rgba(139,92,246,0.1)"} color={p.type === "Lending" ? "#3B82F6" : "#8B5CF6"} />
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{p.rate}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <span style={{ color: peerColor(p.peer), fontWeight: 600 }}>
                        {p.peer === "Below" ? "\u25BC " : p.peer === "Above" ? "\u25B2 " : "\u25CF "}{p.peer} market
                      </span>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 48, height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                          <div style={{ width: `${p.score}%`, height: "100%", borderRadius: 3, background: p.score >= 85 ? T.success : p.score >= 80 ? T.warning : T.danger }} />
                        </div>
                        <span style={{ fontWeight: 700, color: p.score >= 85 ? T.success : p.score >= 80 ? T.warning : T.danger }}>{p.score}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <Badge text={p.status} bg={statusColor(p.status) + "18"} color={statusColor(p.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Flagged alert */}
          {flagged.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: T.danger, flexShrink: 0, marginTop: 1 }}>{Ico.alert(16)}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Products flagged for review</div>
                {flagged.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: T.text }}>
                    <strong>{p.name}</strong> — score {p.score}/100, {p.peer.toLowerCase()} market rate
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Right: Vulnerability Dashboard */}
        <Card style={{ flex: "0 0 calc(45% - 20px)", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            {Ico.alert(20)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Vulnerability Dashboard</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {VULN_CASES.map((c, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 10, background: T.bg,
                borderLeft: `4px solid ${T.danger}`, border: `1px solid ${T.borderLight}`,
                borderLeftColor: T.danger, borderLeftWidth: 4,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</span>
                    <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 8 }}>{c.id}</span>
                  </div>
                  <Badge
                    text={c.severity}
                    bg={c.severity === "High" ? T.dangerBg : T.warningBg}
                    color={c.severity === "High" ? T.danger : T.warning}
                  />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: T.textMuted }}>
                  <span><strong style={{ color: T.text }}>Type:</strong> {c.type}</span>
                  <span><strong style={{ color: T.text }}>Detected:</strong> {c.detected}</span>
                  <span><strong style={{ color: T.text }}>Protocol:</strong>{" "}
                    <span style={{ color: c.protocol === "Active" ? T.danger : T.warning, fontWeight: 600 }}>{c.protocol}</span>
                  </span>
                  <span><strong style={{ color: T.text }}>Days open:</strong> {c.days}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI callout */}
          <div style={{ marginTop: 18, padding: "12px 16px", borderRadius: 8, background: "rgba(26,74,84,0.06)", border: `1px solid ${T.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.bot(16)}</span>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
              <strong>Nova AI</strong> auto-detected 2 of 3 active cases through payment pattern analysis and communication sentiment scoring
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 2: Outcome Monitoring Timeline ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          {Ico.chart(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>Outcome Monitoring Timeline</span>
          <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8 }}>12-month rolling Consumer Duty scores</span>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.textMuted }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* SVG Chart */}
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 30}`} style={{ width: "100%", maxWidth: CHART_W, height: "auto" }}>
            {/* grid lines */}
            {[0, 25, 50, 75, 100].map(pct => {
              const y = CHART_H - (pct / 100) * CHART_H;
              return (
                <g key={pct}>
                  <line x1={40} y1={y} x2={CHART_W} y2={y} stroke={T.borderLight} strokeWidth={1} />
                  <text x={32} y={y + 4} textAnchor="end" fontSize={9} fill={T.textMuted}>{pct}</text>
                </g>
              );
            })}
            {/* bars */}
            {TIMELINE_DATA.map((d, i) => {
              const x = 50 + i * (BAR_W + BAR_GAP);
              const total = d.ps + d.pv + d.cu + d.cs;
              const scale = CHART_H / MAX_TOTAL;
              const segments = [
                { val: d.ps, color: "#3B82F6" },
                { val: d.pv, color: T.success },
                { val: d.cu, color: "#8B5CF6" },
                { val: d.cs, color: "#14B8A6" },
              ];
              let cy = CHART_H;
              return (
                <g key={i}>
                  {segments.map((seg, si) => {
                    const h = seg.val * scale;
                    cy -= h;
                    return (
                      <rect key={si} x={x} y={cy} width={BAR_W} height={h} rx={si === 3 ? 3 : 0}
                        fill={seg.color} opacity={0.85} />
                    );
                  })}
                  <text x={x + BAR_W / 2} y={CHART_H + 16} textAnchor="middle" fontSize={10} fill={T.textMuted} fontWeight={600}>
                    {d.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* ── Row 3: Alerts + Coverage ── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Left: Real-Time Compliance Alerts */}
        <Card style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            {Ico.bell(20)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Real-Time Compliance Alerts</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ALERTS.map((a, i) => {
              const sev = severityStyle(a.severity);
              const aSt = alertStatusStyle(a.status);
              return (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 8, background: T.bg,
                  border: `1px solid ${T.borderLight}`,
                  borderLeft: `3px solid ${sev.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <Badge text={a.severity} bg={sev.bg} color={sev.color} border={sev.border} />
                    <Badge text={a.status} bg={aSt.bg} color={aSt.color} />
                    <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>{a.ts}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.45 }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Compliance Coverage Map */}
        <Card style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            {Ico.check(20)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Compliance Coverage Map</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Workflow", "Coverage", "Checks", "Last Audit"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WORKFLOWS.map((w, i) => {
                const cs = coverageStyle(w.coverage);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600 }}>{w.name}</td>
                    <td style={{ padding: "9px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: cs.color }}>
                          {w.coverage === "Full" ? Ico.check(14) :
                           w.coverage === "Partial" ? Ico.alert(14) :
                           Ico.x(14)}
                        </span>
                        <span style={{ color: cs.color, fontWeight: 600, fontSize: 11 }}>{w.coverage}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 10px", fontVariantNumeric: "tabular-nums" }}>{w.checks}</td>
                    <td style={{ padding: "9px 10px", color: T.textMuted, fontSize: 11 }}>{w.audit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 14, display: "flex", gap: 16, fontSize: 11, color: T.textMuted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: T.success }}>{Ico.check(12)}</span> Full: {WORKFLOWS.filter(w => w.coverage === "Full").length}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: T.warning }}>{Ico.alert(12)}</span> Partial: {WORKFLOWS.filter(w => w.coverage === "Partial").length}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: T.danger }}>{Ico.x(12)}</span> None: {WORKFLOWS.filter(w => w.coverage === "None").length}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
