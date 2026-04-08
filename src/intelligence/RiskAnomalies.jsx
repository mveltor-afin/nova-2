import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

// ─────────────────────────────────────────────
// RISK & ANOMALIES — Risk heatmap, anomaly feed, KYC tracker
// ─────────────────────────────────────────────

const ANOMALIES = [
  { id: "ANM-001", category: "fraud", severity: "Critical", customerId: "CUS-006", customerName: "Robert Hughes", description: "Unusual login pattern detected -- 3 attempts from unrecognised IP (Lagos, NG) at 02:14 GMT", detected: "05 Apr 2026", status: "Open" },
  { id: "ANM-002", category: "payment", severity: "Critical", customerId: "CUS-003", customerName: "Priya Sharma", description: "Third consecutive missed mortgage payment. Arrears balance £2,360 and rising.", detected: "01 Apr 2026", status: "Under Review" },
  { id: "ANM-003", category: "document", severity: "High", customerId: "CUS-007", customerName: "Tom & Lucy Brennan", description: "Payslip OCR confidence low (62%). Employer name mismatch between application and document.", detected: "04 Apr 2026", status: "Open" },
  { id: "ANM-004", category: "policy", severity: "High", customerId: "CUS-006", customerName: "Robert Hughes", description: "KYC expired Aug 2025. Account remains active -- regulatory breach risk.", detected: "01 Sep 2025", status: "Escalated" },
  { id: "ANM-005", category: "payment", severity: "Medium", customerId: "CUS-004", customerName: "David Chen", description: "Payment amount variance: £2,100 expected, £1,800 received. Shortfall £300.", detected: "05 Apr 2026", status: "Open" },
  { id: "ANM-006", category: "sentiment", severity: "Medium", customerId: "CUS-003", customerName: "Priya Sharma", description: "Negative sentiment detected in last 2 support calls. Vulnerability indicators flagged.", detected: "28 Mar 2026", status: "Under Review" },
  { id: "ANM-007", category: "fraud", severity: "Medium", customerId: "CUS-002", customerName: "James & Sarah Mitchell", description: "New payee added and immediate large transfer (£4,200) -- push payment fraud indicator.", detected: "03 Apr 2026", status: "Open" },
  { id: "ANM-008", category: "document", severity: "Low", customerId: "CUS-005", customerName: "Aisha Patel", description: "Insurance renewal document not yet uploaded. Auto-reminder sent.", detected: "02 Apr 2026", status: "Resolved" },
  { id: "ANM-009", category: "policy", severity: "Low", customerId: "CUS-001", customerName: "Emma Wilson", description: "Contact preference not updated in 24 months. GDPR re-consent recommended.", detected: "01 Apr 2026", status: "Open" },
  { id: "ANM-010", category: "payment", severity: "Low", customerId: "CUS-008", customerName: "Maria Santos", description: "Standing order date shifted from 10th to 15th -- monitoring for pattern change.", detected: "15 Mar 2026", status: "Resolved" },
];

const categoryLabel = { fraud: "Fraud", payment: "Payment", document: "Document", policy: "Policy", sentiment: "Sentiment" };
const categoryColor = { fraud: T.danger, payment: T.warning, document: "#8B5CF6", policy: "#0EA5E9", sentiment: "#F59E0B" };

const severityStyle = (s) => ({
  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5, whiteSpace: "nowrap",
  background: s === "Critical" ? T.dangerBg : s === "High" ? T.warningBg : s === "Medium" ? "#FFF8E0" : T.successBg,
  color: s === "Critical" ? T.danger : s === "High" ? T.warning : s === "Medium" ? "#92400E" : T.success,
});

const statusStyle = (s) => ({
  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
  background: s === "Open" ? T.dangerBg : s === "Under Review" ? T.warningBg : s === "Escalated" ? "#EDE9FE" : T.successBg,
  color: s === "Open" ? T.danger : s === "Under Review" ? T.warning : s === "Escalated" ? "#7C3AED" : T.success,
});

const riskBarColor = (score) => {
  if (score >= 70) return T.danger;
  if (score >= 40) return T.warning;
  return T.success;
};

// Sort customers by risk score descending
const sortedCustomers = [...CUSTOMERS].sort((a, b) => b.riskScore - a.riskScore);

// KYC data
const kycData = CUSTOMERS.map(c => {
  const expiry = c.kycExpiry;
  let isExpired = false;
  if (expiry) {
    const parts = expiry.split(" ");
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const d = new Date(parseInt(parts[1]), months[parts[0]], 1);
    isExpired = d < new Date();
  }
  return { ...c, isExpired, kycStatus: c.kyc };
}).sort((a, b) => (b.isExpired ? 1 : 0) - (a.isExpired ? 1 : 0));

export default function RiskAnomalies() {
  const [anomalies, setAnomalies] = useState(ANOMALIES);

  const handleAction = (id, action) => {
    setAnomalies(prev => prev.map(a =>
      a.id === id ? { ...a, status: action === "resolve" ? "Resolved" : action === "escalate" ? "Escalated" : "False Positive" } : a
    ));
  };

  const activeFlags = anomalies.filter(a => a.status !== "Resolved" && a.status !== "False Positive").length;
  const criticalCount = anomalies.filter(a => a.severity === "Critical" && a.status !== "Resolved").length;
  const atRiskCustomers = CUSTOMERS.filter(c => c.riskScore >= 40).length;
  const kycExpiredCount = kycData.filter(c => c.isExpired).length;
  const vulnCount = CUSTOMERS.filter(c => c.vuln).length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.shield(22)}
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Risk & Anomalies</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>Portfolio risk monitoring, anomaly detection, and KYC tracking</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Active Flags" value={activeFlags} sub="unresolved anomalies" color={T.warning} />
        <KPICard label="Critical" value={criticalCount} sub="immediate attention" color={T.danger} />
        <KPICard label="Customers at Risk" value={atRiskCustomers} sub="risk score >= 40" color="#F59E0B" />
        <KPICard label="KYC Expired" value={kycExpiredCount} sub="mandatory renewal" color={T.danger} />
        <KPICard label="Vulnerability Open" value={vulnCount} sub="active flags" color="#8B5CF6" />
      </div>

      {/* Customer Risk Heatmap */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.chart(18)}
          <span style={{ fontWeight: 700, fontSize: 15 }}>Customer Risk Heatmap</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sortedCustomers.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 180, fontSize: 13, fontWeight: 600, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </div>
              <div style={{ flex: 1, background: T.borderLight, borderRadius: 4, height: 22, overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${c.riskScore}%`, height: "100%", borderRadius: 4,
                  background: riskBarColor(c.riskScore),
                  transition: "width 0.4s ease",
                }} />
              </div>
              <div style={{
                width: 36, fontSize: 13, fontWeight: 700, textAlign: "right",
                color: riskBarColor(c.riskScore),
              }}>
                {c.riskScore}
              </div>
              <div style={{ width: 80, display: "flex", gap: 4 }}>
                {c.vuln && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#F3E8FF", color: "#7C3AED" }}>VULN</span>}
                {c.risk === "High" && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: T.dangerBg, color: T.danger }}>HIGH</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Anomaly Feed */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.alert(18)}
          <span style={{ fontWeight: 700, fontSize: 15 }}>Anomaly Feed</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: T.dangerBg, color: T.danger, marginLeft: 4 }}>
            {activeFlags} active
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {anomalies.map(a => (
            <div key={a.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px",
              borderRadius: 10, border: `1px solid ${a.severity === "Critical" ? T.dangerBorder : T.borderLight}`,
              background: a.severity === "Critical" ? T.dangerBg + "60" : "transparent",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <span style={severityStyle(a.severity)}>{a.severity}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: categoryColor[a.category] + "18", color: categoryColor[a.category],
                }}>
                  {categoryLabel[a.category]}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{a.customerName}</span>
                  <span style={statusStyle(a.status)}>{a.status}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{a.description}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Detected: {a.detected}</div>
              </div>
              {a.status !== "Resolved" && a.status !== "False Positive" && (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Btn small primary onClick={() => handleAction(a.id, "resolve")}>Resolve</Btn>
                  <Btn small danger onClick={() => handleAction(a.id, "escalate")}>Escalate</Btn>
                  <Btn small ghost onClick={() => handleAction(a.id, "false-positive")}>False Positive</Btn>
                </div>
              )}
              {(a.status === "Resolved" || a.status === "False Positive") && (
                <span style={{ fontSize: 12, fontWeight: 600, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
                  {Ico.check(14)} {a.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* KYC Expiry Tracker */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.lock(18)}
          <span style={{ fontWeight: 700, fontSize: 15 }}>KYC Expiry Tracker</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Customer", "Segment", "KYC Status", "Expiry Date", "Risk Score", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                    color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kycData.map(c => (
                <tr key={c.id} style={{
                  borderBottom: `1px solid ${T.borderLight}`,
                  background: c.isExpired ? T.dangerBg : "transparent",
                }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: T.textMuted }}>{c.segment}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                      background: c.kycStatus === "Verified" ? T.successBg : c.kycStatus === "Expired" ? T.dangerBg : T.warningBg,
                      color: c.kycStatus === "Verified" ? T.success : c.kycStatus === "Expired" ? T.danger : T.warning,
                    }}>
                      {c.kycStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: c.isExpired ? 700 : 400, color: c.isExpired ? T.danger : T.text }}>
                    {c.kycExpiry || "Pending"}
                    {c.isExpired && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: T.danger }}>EXPIRED</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontWeight: 700, color: riskBarColor(c.riskScore) }}>{c.riskScore}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {c.isExpired ? (
                      <Btn small danger onClick={() => {}}>Renew KYC</Btn>
                    ) : c.kycStatus === "Pending" ? (
                      <Btn small onClick={() => {}}>Complete KYC</Btn>
                    ) : (
                      <span style={{ fontSize: 12, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
                        {Ico.check(14)} Valid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
