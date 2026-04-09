import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const services = [
  { name: "Open Banking (TrueLayer)", icon: "wallet", status: "Operational", uptime: "99.9%", latency: 142, errors: "0.1%", requests: "12,480", lastResponse: "23ms ago", circuitBreaker: "Closed", latencyHistory: [120, 135, 150, 142, 138, 145] },
  { name: "Credit Bureau (Equifax)", icon: "shield", status: "Operational", uptime: "99.8%", latency: 205, errors: "0.2%", requests: "8,320", lastResponse: "45ms ago", circuitBreaker: "Closed", latencyHistory: [190, 210, 225, 205, 198, 215] },
  { name: "Land Registry", icon: "file", status: "Degraded", uptime: "98.2%", latency: 1240, errors: "2.1%", requests: "3,150", lastResponse: "1.2s ago", circuitBreaker: "Half-Open", latencyHistory: [380, 520, 890, 1100, 1400, 1240] },
  { name: "Companies House", icon: "products", status: "Operational", uptime: "99.7%", latency: 380, errors: "0.3%", requests: "5,640", lastResponse: "62ms ago", circuitBreaker: "Closed", latencyHistory: [350, 370, 390, 365, 380, 375] },
  { name: "HMRC RTI", icon: "dollar", status: "Operational", uptime: "99.5%", latency: 520, errors: "0.5%", requests: "4,210", lastResponse: "88ms ago", circuitBreaker: "Closed", latencyHistory: [480, 510, 540, 500, 530, 520] },
  { name: "DocuSign", icon: "check", status: "Operational", uptime: "99.9%", latency: 95, errors: "0.0%", requests: "6,890", lastResponse: "12ms ago", circuitBreaker: "Closed", latencyHistory: [88, 92, 100, 95, 90, 93] },
];

const incidents = [
  { service: "Land Registry", issue: "Elevated latency", time: "08 Apr 07:14", status: "Investigating", duration: "2h" },
  { service: "Equifax", issue: "Intermittent timeouts", time: "05 Apr 14:20", status: "Resolved", duration: "45min" },
  { service: "HMRC RTI", issue: "SSL certificate warning", time: "03 Apr 09:00", status: "Resolved", duration: "15min" },
  { service: "DocuSign", issue: "Rate limit exceeded", time: "01 Apr 16:45", status: "Resolved", duration: "20min" },
  { service: "Companies House", issue: "503 errors on bulk requests", time: "28 Mar 11:30", status: "Resolved", duration: "1h 10min" },
];

const statusColor = (s) => {
  if (s === "Operational") return { bg: T.successBg, color: T.success, border: T.successBorder };
  if (s === "Degraded") return { bg: T.warningBg, color: T.warning, border: T.warningBorder };
  return { bg: T.dangerBg, color: T.danger, border: T.dangerBorder };
};

const cbColor = (s) => {
  if (s === "Closed") return { bg: T.successBg, color: T.success };
  if (s === "Half-Open") return { bg: T.warningBg, color: T.warning };
  return { bg: T.dangerBg, color: T.danger };
};

const MiniBarChart = ({ data, maxVal }) => {
  const max = maxVal || Math.max(...data);
  const hours = ["6h", "5h", "4h", "3h", "2h", "1h"];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: 14, height: Math.max(4, (v / max) * 36), borderRadius: 3,
            background: v > max * 0.8 ? T.warning : T.primary, opacity: 0.7,
            transition: "height 0.3s",
          }} />
          <span style={{ fontSize: 8, color: T.textMuted }}>{hours[i]}</span>
        </div>
      ))}
    </div>
  );
};

const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text };

export default function APIHealthDashboard() {
  const degradedCount = services.filter(s => s.status !== "Operational").length;
  const overallStatus = degradedCount === 0 ? "All Systems Operational" : degradedCount <= 2 ? "Degraded Performance" : "Outage Detected";
  const overallColor = degradedCount === 0 ? T.success : degradedCount <= 2 ? T.warning : T.danger;
  const overallBg = degradedCount === 0 ? T.successBg : degradedCount <= 2 ? T.warningBg : T.dangerBg;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.navy }}>
          {Ico.zap(24)} API Health Dashboard
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Real-time status of all external integrations</div>
      </div>

      {/* Overall Status */}
      <Card style={{ marginBottom: 24, background: overallBg, border: `1px solid ${overallColor}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: overallColor, boxShadow: `0 0 8px ${overallColor}` }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: overallColor }}>{overallStatus}</span>
          <span style={{ fontSize: 13, color: T.textMuted, marginLeft: "auto" }}>Last checked: 2 seconds ago</span>
        </div>
      </Card>

      {/* Service Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 32 }}>
        {services.map(svc => {
          const sc = statusColor(svc.status);
          const cb = cbColor(svc.circuitBreaker);
          return (
            <Card key={svc.name} style={{ border: svc.status === "Degraded" ? `2px solid ${T.warning}` : `1px solid ${T.border}`, background: svc.status === "Degraded" ? T.warningBg : T.card }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
                    {Ico[svc.icon]?.(18)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>Last: {svc.lastResponse}</div>
                  </div>
                </div>
                <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{svc.status}</span>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Uptime</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: parseFloat(svc.uptime) >= 99.5 ? T.success : T.warning }}>{svc.uptime}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Avg Latency</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: svc.latency > 1000 ? T.danger : svc.latency > 500 ? T.warning : T.text }}>{svc.latency >= 1000 ? `${(svc.latency / 1000).toFixed(1)}s` : `${svc.latency}ms`}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Error Rate</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: parseFloat(svc.errors) > 1 ? T.danger : T.text }}>{svc.errors}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Requests Today</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{svc.requests}</div>
                </div>
                <MiniBarChart data={svc.latencyHistory} />
              </div>

              {/* Circuit Breaker */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Circuit Breaker</span>
                <span style={{ background: cb.bg, color: cb.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{svc.circuitBreaker}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Incident Log */}
      <div style={{ fontSize: 17, fontWeight: 700, color: T.navy, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        {Ico.alert(18)} Recent Incidents
      </div>
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF7" }}>
                <th style={thStyle}>Service</th>
                <th style={thStyle}>Issue</th>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={i} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{inc.service}</td>
                  <td style={tdStyle}>{inc.issue}</td>
                  <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{inc.time}</td>
                  <td style={tdStyle}>
                    <span style={{
                      background: inc.status === "Resolved" ? T.successBg : T.warningBg,
                      color: inc.status === "Resolved" ? T.success : T.warning,
                      padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>{inc.status}</span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>{inc.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
