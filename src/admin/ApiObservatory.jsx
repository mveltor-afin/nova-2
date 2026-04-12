import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ─── Mock Data ─── */
const integrations = [
  { name: "Open Banking (Plaid)", provider: "Plaid", latency: 89, errorRate: 0.1, circuit: "Closed", lastCall: "2 min ago", uptime: 99.98, status: "Healthy" },
  { name: "Credit Bureau (Equifax)", provider: "Equifax", latency: 234, errorRate: 0.3, circuit: "Closed", lastCall: "5 min ago", uptime: 99.91, status: "Healthy" },
  { name: "Land Registry (HMLR)", provider: "HMLR", latency: 1250, errorRate: 4.2, circuit: "Open", lastCall: "45 min ago", uptime: 97.8, status: "DOWN" },
  { name: "HMRC (RTI)", provider: "HMRC", latency: 312, errorRate: 0.8, circuit: "Closed", lastCall: "8 min ago", uptime: 99.85, status: "Healthy" },
  { name: "E-Signature (DocuSign)", provider: "DocuSign", latency: 156, errorRate: 0.2, circuit: "Closed", lastCall: "1 min ago", uptime: 99.97, status: "Healthy" },
  { name: "KYC Provider (Onfido)", provider: "Onfido", latency: 445, errorRate: 1.8, circuit: "Half-Open", lastCall: "12 min ago", uptime: 99.2, status: "Degraded" },
  { name: "AVM (Hometrack)", provider: "Hometrack", latency: 678, errorRate: 2.1, circuit: "Half-Open", lastCall: "18 min ago", uptime: 98.9, status: "Degraded" },
  { name: "Payment Gateway (Modulr)", provider: "Modulr", latency: 67, errorRate: 0.05, circuit: "Closed", lastCall: "30 sec ago", uptime: 99.99, status: "Healthy" },
  { name: "Sanctions (World-Check)", provider: "World-Check", latency: 189, errorRate: 0.1, circuit: "Closed", lastCall: "3 min ago", uptime: 99.96, status: "Healthy" },
  { name: "Email (SendGrid)", provider: "SendGrid", latency: 45, errorRate: 0.02, circuit: "Closed", lastCall: "1 min ago", uptime: 99.99, status: "Healthy" },
  { name: "SMS (Twilio)", provider: "Twilio", latency: 78, errorRate: 0.1, circuit: "Closed", lastCall: "2 min ago", uptime: 99.98, status: "Healthy" },
  { name: "Document OCR (AWS Textract)", provider: "AWS Textract", latency: 520, errorRate: 0.4, circuit: "Closed", lastCall: "4 min ago", uptime: 99.93, status: "Healthy" },
];

const incidents = [
  { id: 1, title: "Land Registry (HMLR) — circuit breaker tripped", badge: "OPEN", time: "45 min ago", impact: "Valuations delayed, manual fallback activated" },
  { id: 2, title: "KYC Provider (Onfido) — elevated latency", badge: "MONITORING", time: "12 min ago", impact: "Onboarding slower, no failures" },
  { id: 3, title: "AVM (Hometrack) — intermittent 503s", badge: "MONITORING", time: "18 min ago", impact: "Some valuations falling back to manual" },
  { id: 4, title: "Credit Bureau (Equifax) — brief outage", badge: "RESOLVED", time: "6h ago", duration: "8 min", impact: "3 cases delayed" },
  { id: 5, title: "Payment Gateway — scheduled maintenance", badge: "RESOLVED", time: "2 days ago", duration: "15 min", impact: "None (outside business hours)" },
];

const degradationAlerts = [
  { name: "Land Registry (HMLR)", status: "DOWN", fallback: "Manual valuation submission via portal", impact: "4 cases awaiting automated title check, estimated 2h delay" },
  { name: "KYC (Onfido)", status: "DEGRADED", fallback: "Extended timeout + retry", impact: "Onboarding taking 8s vs normal 3s" },
  { name: "AVM (Hometrack)", status: "DEGRADED", fallback: "Queue and retry with exponential backoff", impact: "Some valuations delayed up to 5 min" },
];

/* ─── Latency Trend Data (24h) ─── */
const latencyTrend = [
  { h: 0, v: 135 }, { h: 1, v: 130 }, { h: 2, v: 128 }, { h: 3, v: 132 },
  { h: 4, v: 138 }, { h: 5, v: 140 }, { h: 6, v: 145 }, { h: 7, v: 148 },
  { h: 8, v: 155 }, { h: 9, v: 150 }, { h: 10, v: 147 }, { h: 11, v: 142 },
  { h: 12, v: 140 }, { h: 13, v: 350 }, { h: 14, v: 800 }, { h: 15, v: 620 },
  { h: 16, v: 310 }, { h: 17, v: 180 }, { h: 18, v: 155 }, { h: 19, v: 148 },
  { h: 20, v: 142 }, { h: 21, v: 138 }, { h: 22, v: 135 }, { h: 23, v: 132 },
  { h: 24, v: 130 },
];

/* ─── Helpers ─── */
const statusDotColor = (s) =>
  s === "Healthy" ? T.success : s === "Degraded" ? T.warning : T.danger;

const circuitColor = (s) => {
  if (s === "Closed") return { bg: T.successBg, color: T.success };
  if (s === "Half-Open") return { bg: T.warningBg, color: T.warning };
  return { bg: T.dangerBg, color: T.danger };
};

const errorColor = (rate) => {
  if (rate > 2) return T.danger;
  if (rate > 0.5) return T.warning;
  return T.text;
};

const latencyBarColor = (ms) => {
  if (ms <= 100) return T.success;
  if (ms <= 300) return T.primary;
  if (ms <= 600) return T.warning;
  return T.danger;
};

const badgeColor = (badge) => {
  if (badge === "OPEN") return { bg: T.dangerBg, color: T.danger, border: T.dangerBorder };
  if (badge === "MONITORING") return { bg: T.warningBg, color: T.warning, border: T.warningBorder };
  return { bg: T.successBg, color: T.success, border: T.successBorder };
};

const statusBadgeColor = (s) => {
  if (s === "DOWN") return { bg: T.dangerBg, color: T.danger };
  return { bg: T.warningBg, color: T.warning };
};

const maxLatency = Math.max(...integrations.map(i => i.latency));

const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text, verticalAlign: "middle" };

/* ─── Latency Chart (SVG) ─── */
const LatencyChart = () => {
  const W = 560, H = 220, PAD_L = 50, PAD_R = 16, PAD_T = 16, PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxY = 900;
  const threshold = 500;

  const x = (h) => PAD_L + (h / 24) * chartW;
  const y = (v) => PAD_T + chartH - (Math.min(v, maxY) / maxY) * chartH;

  const linePts = latencyTrend.map(p => `${x(p.h)},${y(p.v)}`).join(" ");

  // Build clip path for area above threshold
  const threshY = y(threshold);
  const abovePts = [];
  for (let i = 0; i < latencyTrend.length; i++) {
    const px = x(latencyTrend[i].h);
    const py = y(latencyTrend[i].v);
    if (py < threshY) {
      // Point is above threshold line
      abovePts.push({ x: px, y: py });
    }
  }

  // Build the shaded area above threshold as a polygon
  // We need connected segments above the threshold
  let shadePath = "";
  for (let i = 0; i < latencyTrend.length - 1; i++) {
    const x1 = x(latencyTrend[i].h), y1 = y(latencyTrend[i].v);
    const x2 = x(latencyTrend[i + 1].h), y2 = y(latencyTrend[i + 1].v);
    const above1 = y1 < threshY;
    const above2 = y2 < threshY;

    if (above1 && above2) {
      shadePath += `M${x1},${threshY} L${x1},${y1} L${x2},${y2} L${x2},${threshY} Z `;
    } else if (above1 && !above2) {
      const ratio = (threshY - y1) / (y2 - y1);
      const ix = x1 + ratio * (x2 - x1);
      shadePath += `M${x1},${threshY} L${x1},${y1} L${ix},${threshY} Z `;
    } else if (!above1 && above2) {
      const ratio = (threshY - y1) / (y2 - y1);
      const ix = x1 + ratio * (x2 - x1);
      shadePath += `M${ix},${threshY} L${x2},${y2} L${x2},${threshY} Z `;
    }
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {/* Grid lines */}
      {[0, 200, 400, 600, 800].map(v => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(v)} y2={y(v)} stroke={T.borderLight} strokeWidth={1} />
          <text x={PAD_L - 8} y={y(v) + 4} textAnchor="end" fontSize={10} fill={T.textMuted}>{v}</text>
        </g>
      ))}

      {/* X-axis labels */}
      {[0, 4, 8, 12, 16, 20, 24].map(h => (
        <text key={h} x={x(h)} y={H - 6} textAnchor="middle" fontSize={10} fill={T.textMuted}>
          {h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}
        </text>
      ))}

      {/* SLA Threshold line */}
      <line x1={PAD_L} x2={W - PAD_R} y1={y(threshold)} y2={y(threshold)} stroke={T.danger} strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={W - PAD_R - 2} y={y(threshold) - 6} textAnchor="end" fontSize={10} fontWeight={600} fill={T.danger}>SLA Threshold (500ms)</text>

      {/* Shaded area above threshold */}
      <path d={shadePath} fill={T.danger} opacity={0.15} />

      {/* Main line */}
      <polyline points={linePts} fill="none" stroke={T.primary} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots at notable points */}
      {latencyTrend.filter(p => p.v > 400).map(p => (
        <circle key={p.h} cx={x(p.h)} cy={y(p.v)} r={3.5} fill={T.danger} />
      ))}
    </svg>
  );
};

/* ─── Main Component ─── */
export default function ApiObservatory() {
  const [acknowledged, setAcknowledged] = useState({});

  const healthyCount = integrations.filter(i => i.status === "Healthy").length;
  const degradedCount = integrations.filter(i => i.status === "Degraded").length;
  const downCount = integrations.filter(i => i.status === "DOWN").length;
  const unhealthy = integrations.filter(i => i.status !== "Healthy");

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.navy }}>
          {Ico.zap(24)} API Observatory
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Real-time integration health — latency, error rates, circuit breakers and degradation alerts
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <KPICard label="APIs Monitored" value="12" color={T.primary} />
        <KPICard label="Healthy" value={String(healthyCount)} sub="Operational" color={T.success} />
        <KPICard label="Degraded" value={String(degradedCount)} sub="Elevated latency" color={T.warning} />
        <KPICard label="Down" value={String(downCount)} sub="Circuit open" color={T.danger} />
        <KPICard label="Avg Latency" value="142ms" sub="Across all APIs" color={T.primary} />
        <KPICard label="Uptime (30d)" value="99.94%" sub="Composite SLA" color={T.success} />
      </div>

      {/* ── Integration Status Grid ── */}
      <Card style={{ marginBottom: 28 }} noPad>
        <div style={{ padding: "20px 24px 12px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Integration Status Grid</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>All 12 monitored integrations</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Integration</th>
                <th style={thStyle}>Provider</th>
                <th style={{ ...thStyle, minWidth: 130 }}>Avg Latency</th>
                <th style={thStyle}>Error Rate</th>
                <th style={thStyle}>Circuit Breaker</th>
                <th style={thStyle}>Last Call</th>
                <th style={thStyle}>Uptime (30d)</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((intg, idx) => {
                const cc = circuitColor(intg.circuit);
                const barWidth = Math.min((intg.latency / maxLatency) * 100, 100);
                return (
                  <tr key={idx} style={{ background: intg.status === "DOWN" ? T.dangerBg : intg.status === "Degraded" ? T.warningBg : "transparent" }}>
                    {/* Status dot */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: statusDotColor(intg.status),
                          boxShadow: `0 0 6px ${statusDotColor(intg.status)}60`,
                        }} />
                      </div>
                    </td>
                    {/* Name */}
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{intg.name}</td>
                    {/* Provider */}
                    <td style={{ ...tdStyle, color: T.textMuted }}>{intg.provider}</td>
                    {/* Latency with spark bar */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ width: `${barWidth}%`, height: "100%", borderRadius: 3, background: latencyBarColor(intg.latency), transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: latencyBarColor(intg.latency) }}>{intg.latency}ms</span>
                      </div>
                    </td>
                    {/* Error Rate */}
                    <td style={{ ...tdStyle, fontWeight: 600, color: errorColor(intg.errorRate) }}>
                      {intg.errorRate}%
                    </td>
                    {/* Circuit Breaker */}
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 4,
                        fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                        background: cc.bg, color: cc.color,
                      }}>
                        {intg.circuit}
                      </span>
                    </td>
                    {/* Last Call */}
                    <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{intg.lastCall}</td>
                    {/* Uptime */}
                    <td style={{ ...tdStyle, fontWeight: 600, color: intg.uptime >= 99.9 ? T.success : intg.uptime >= 99.0 ? T.warning : T.danger }}>
                      {intg.uptime}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Row 2: Latency Trend + Recent Incidents ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>

        {/* Latency Trend (24h) */}
        <Card style={{ flex: "1 1 55%", minWidth: 380 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Latency Trend (24h)</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Aggregate API latency — spike at ~14:00 correlates with HMLR outage</div>
          <LatencyChart />
        </Card>

        {/* Recent Incidents */}
        <Card style={{ flex: "1 1 40%", minWidth: 340 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Recent Incidents</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Last 5 integration events</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {incidents.map(inc => {
              const bc = badgeColor(inc.badge);
              return (
                <div key={inc.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${T.borderLight}`, background: inc.badge === "OPEN" ? T.dangerBg : "transparent" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                      background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`,
                    }}>
                      {inc.badge}
                    </span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>{inc.time}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 4 }}>{inc.title}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>
                    Impact: {inc.impact}
                    {inc.duration && <span> — Duration: {inc.duration}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Row 3: Degradation Alerts ── */}
      {unhealthy.length > 0 && (
        <Card style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {Ico.alert(18)}
            <span style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Degradation Alerts</span>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
            Active fallback strategies for non-healthy integrations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {degradationAlerts.map((alert, idx) => {
              const sc = statusBadgeColor(alert.status);
              const isAcked = acknowledged[idx];
              return (
                <div key={idx} style={{
                  padding: 18, borderRadius: 10,
                  border: `1px solid ${alert.status === "DOWN" ? T.dangerBorder : T.warningBorder}`,
                  background: alert.status === "DOWN" ? T.dangerBg : T.warningBg,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{alert.name}</span>
                    <span style={{
                      padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                      background: sc.bg, color: sc.color,
                    }}>
                      {alert.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}>
                    <strong>Fallback:</strong> {alert.fallback}
                  </div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 14 }}>
                    <strong>Impact:</strong> {alert.impact}
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn small primary icon="zap">Trigger Manual Fallback</Btn>
                    <Btn small icon="send">Notify Ops</Btn>
                    <Btn small ghost disabled={isAcked} onClick={() => setAcknowledged(prev => ({ ...prev, [idx]: true }))}>
                      {isAcked ? "Acknowledged" : "Acknowledge"}
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
