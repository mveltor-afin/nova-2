import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES } from "../data/customers";

// ─────────────────────────────────────────────
// AI DASHBOARD — Unified intelligence screen
// ─────────────────────────────────────────────

const BarChart = ({ data, maxVal }) => {
  const max = maxVal || Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, fontSize: 12, color: T.textMuted, textAlign: "right", flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, background: T.borderLight, borderRadius: 4, height: 20, overflow: "hidden" }}>
            <div style={{
              width: `${(d.value / max) * 100}%`, height: "100%", borderRadius: 4,
              background: d.color || `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ width: 50, fontSize: 12, fontWeight: 700, color: T.text }}>{d.display || d.value}</div>
        </div>
      ))}
    </div>
  );
};

// Gather all critical actions across customers
const criticalActions = [];
Object.entries(AI_ACTIONS).forEach(([custId, actions]) => {
  const cust = CUSTOMERS.find(c => c.id === custId);
  actions.filter(a => a.priority === "Critical" || a.priority === "High").forEach(a => {
    criticalActions.push({ ...a, customerId: custId, customerName: cust?.name || custId });
  });
});
criticalActions.sort((a, b) => (a.priority === "Critical" ? 0 : 1) - (b.priority === "Critical" ? 0 : 1));

const CROSS_SELL = [
  { opportunity: "5 mortgage customers have no life insurance", exposure: "£2.4M exposure", revenue: "£12,000/yr premium income", impact: 12000, customers: 5 },
  { opportunity: "3 customers eligible for current account", exposure: "Projected £360/yr fee income", revenue: "£360/yr", impact: 360, customers: 3 },
  { opportunity: "2 fixed deposit customers approaching maturity", exposure: "£67.8k at risk of withdrawal", revenue: "£3,300/yr interest margin", impact: 3300, customers: 2 },
  { opportunity: "4 customers with no buildings & contents insurance", exposure: "£1.1M uninsured property", revenue: "£8,400/yr premium income", impact: 8400, customers: 4 },
];

const RETENTION_ALERTS = [
  { customer: "James & Sarah Mitchell", type: "Rate Expiry", detail: "Fix 2yr 75% expires 15 Jun 2026. SVR revert +£730/mo.", urgency: "High", daysLeft: 70 },
  { customer: "Emma Wilson", type: "Rate Expiry", detail: "Fix 2yr 75% expires 20 Aug 2026. Retention offer needed.", urgency: "Medium", daysLeft: 136 },
  { customer: "Emma Wilson", type: "Deposit Maturity", detail: "2yr Fixed £25k matures 18 May 2026. Re-fix or withdraw.", urgency: "High", daysLeft: 42 },
  { customer: "Maria Santos", type: "Insurance Renewal", detail: "Life Cover £500k renewal 10 Sep 2026.", urgency: "Low", daysLeft: 157 },
  { customer: "Aisha Patel", type: "Insurance Renewal", detail: "Buildings & Contents renewal 15 Nov 2026.", urgency: "Low", daysLeft: 223 },
];

const RISK_SIGNALS = [
  { customer: "Priya Sharma", signal: "3 missed payments, arrears £2,360, vulnerability flag active", severity: "Critical" },
  { customer: "Robert Hughes", signal: "Account locked, no contact 60 days, KYC expired", severity: "Critical" },
  { customer: "David Chen", signal: "LTV 88% approaching 90% threshold -- property value sensitivity", severity: "Medium" },
  { customer: "Tom & Lucy Brennan", signal: "New customer, KYC pending -- onboarding stalled", severity: "Medium" },
];

const AI_PERF = [
  { label: "Recommendation Accuracy", value: 94, display: "94%" },
  { label: "False Positive Rate", value: 6, display: "6%" },
  { label: "Automation Rate", value: 73, display: "73%" },
  { label: "Actions Accepted", value: 87, display: "87%" },
  { label: "CSAT Impact", value: 82, display: "+12pts" },
];

const urgencyColor = (u) => u === "Critical" ? T.danger : u === "High" ? T.warning : u === "Medium" ? "#F59E0B" : T.success;
const severityStyle = (s) => ({
  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5, whiteSpace: "nowrap",
  background: s === "Critical" ? T.dangerBg : s === "High" ? T.warningBg : s === "Medium" ? "#FFF8E0" : T.successBg,
  color: s === "Critical" ? T.danger : s === "High" ? T.warning : s === "Medium" ? "#92400E" : T.success,
});

export default function AIDashboard() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.sparkle(22)}
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>AI Intelligence Dashboard</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>Cross-product AI insights, actions, and performance</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="AI Actions Generated" value="42" sub="this month" color={T.primary} />
        <KPICard label="Critical" value="3" sub="require immediate action" color={T.danger} />
        <KPICard label="Revenue Opportunity" value="£48k" sub="identified cross-sell" color={T.accent} />
        <KPICard label="Automation Rate" value="73%" sub="actions auto-resolved" color={T.success} />
        <KPICard label="Customer Health Avg" value="82%" sub="across portfolio" color="#8B5CF6" />
      </div>

      {/* Critical Actions */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.alert(18)}
          <span style={{ fontWeight: 700, fontSize: 15 }}>Critical Actions</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: T.dangerBg, color: T.danger, marginLeft: 4 }}>
            {criticalActions.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {criticalActions.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderRadius: 10, border: `1px solid ${a.priority === "Critical" ? T.dangerBorder : T.warningBorder}`,
              background: a.priority === "Critical" ? T.dangerBg : T.warningBg,
              flexWrap: "wrap",
            }}>
              <span style={severityStyle(a.priority)}>{a.priority}</span>
              <span style={{ fontWeight: 700, fontSize: 13, minWidth: 140 }}>{a.customerName}</span>
              <span style={{ flex: 1, fontSize: 13, minWidth: 200 }}>{a.action}</span>
              <span style={{ fontSize: 12, color: T.textMuted, minWidth: 140 }}>{a.impact}</span>
              <Btn small primary onClick={() => {}}>Take Action</Btn>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Cross-Sell Opportunities */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.dollar(18)}
            <span style={{ fontWeight: 700, fontSize: 15 }}>Cross-Sell Opportunities</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CROSS_SELL.map((cs, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.borderLight}`, background: T.primaryLight }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{cs.opportunity}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textMuted }}>
                  <span>{cs.exposure}</span>
                  <span style={{ color: T.success, fontWeight: 600 }}>{cs.revenue}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <BarChart
              data={CROSS_SELL.map(cs => ({ label: `${cs.customers} customers`, value: cs.impact, display: `£${(cs.impact / 1000).toFixed(1)}k` }))}
            />
          </div>
        </Card>

        {/* Retention Alerts */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.bell(18)}
            <span style={{ fontWeight: 700, fontSize: 15 }}>Retention Alerts</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RETENTION_ALERTS.map((ra, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                borderRadius: 8, border: `1px solid ${T.borderLight}`,
              }}>
                <div style={{
                  width: 4, height: 36, borderRadius: 2, flexShrink: 0, marginTop: 2,
                  background: urgencyColor(ra.urgency),
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{ra.customer}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: T.borderLight, color: T.textMuted }}>{ra.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{ra.detail}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: ra.daysLeft <= 60 ? T.danger : T.textMuted, whiteSpace: "nowrap" }}>
                  {ra.daysLeft}d left
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Risk Signals */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.shield(18)}
            <span style={{ fontWeight: 700, fontSize: 15 }}>Risk Signals</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RISK_SIGNALS.map((rs, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderRadius: 8, border: `1px solid ${rs.severity === "Critical" ? T.dangerBorder : T.borderLight}`,
                background: rs.severity === "Critical" ? T.dangerBg : "transparent",
              }}>
                <span style={severityStyle(rs.severity)}>{rs.severity}</span>
                <span style={{ fontWeight: 700, fontSize: 13, minWidth: 120 }}>{rs.customer}</span>
                <span style={{ fontSize: 12, color: T.textMuted }}>{rs.signal}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Performance */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.bot(18)}
            <span style={{ fontWeight: 700, fontSize: 15 }}>AI Performance</span>
          </div>
          <BarChart data={AI_PERF.map(p => ({
            label: p.label, value: p.value, display: p.display,
            color: p.value >= 80 ? T.success : p.value >= 50 ? T.primary : p.value <= 10 ? T.success : T.warning,
          }))} maxVal={100} />
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: T.successBg, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.success }}>94%</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Accuracy</div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: T.successBg, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.success }}>6%</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>False Positive</div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: T.primaryLight, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>73%</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Automation</div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: T.primaryLight, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>+12pts</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>CSAT Impact</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
