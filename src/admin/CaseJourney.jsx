import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const categoryColors = {
  status:   { node: "#3B82F6", bg: "#DBEAFE" },
  approval: { node: "#10B981", bg: "#D1FAE5" },
  document: { node: "#F59E0B", bg: "#FEF3C7" },
  ai:       { node: "#8B5CF6", bg: "#EDE9FE" },
  alert:    { node: "#EF4444", bg: "#FEE2E2" },
};

const mockEvents = [
  { date: "19 Feb", time: "14:00", title: "Application Created", actor: "Broker: John Watson", detail: "New lending case initiated via Smart Apply", cat: "status" },
  { date: "19 Feb", time: "14:01", title: "AI Pre-Processing", actor: "System", detail: "Credit pull, AVM, sanctions check completed. Risk score: 14/100", cat: "ai" },
  { date: "19 Feb", time: "14:01", title: "Documents Uploaded", actor: "Broker: John Watson", detail: "6 documents: Fact Find, Payslip, Bank Statement x3, P60", cat: "document" },
  { date: "19 Feb", time: "14:02", title: "AI Document Parsing", actor: "Nova AI", detail: "42 fields populated. 2 flags raised. Confidence: 94%", cat: "ai" },
  { date: "19 Feb", time: "14:05", title: "DIP Executed", actor: "Broker: John Watson", detail: "Product: Afin Fix 2yr 75%. Result: Approved", cat: "approval" },
  { date: "19 Feb", time: "14:10", title: "Application Submitted", actor: "Broker: John Watson", detail: "Full application submitted for processing", cat: "status" },
  { date: "19 Feb", time: "14:12", title: "Auto-Assigned", actor: "System", detail: "Routed to Operations team. Assigned to: Tom Walker", cat: "status" },
  { date: "19 Feb", time: "14:30", title: "KYC Initiated", actor: "Ops: Tom Walker", detail: "Biometric ID verification sent via Mitek", cat: "status" },
  { date: "19 Feb", time: "15:45", title: "KYC Complete", actor: "System", detail: "Identity verified. Electoral roll match confirmed", cat: "approval" },
  { date: "19 Feb", time: "16:00", title: "AML Check Complete", actor: "System", detail: "ComplyAdvantage: Clear. No sanctions/PEP matches", cat: "approval" },
  { date: "20 Feb", time: "09:15", title: "Valuation Instructed", actor: "Ops: Tom Walker", detail: "Countrywide Surveying. Full valuation. Fee: \u00a3250", cat: "document" },
  { date: "20 Feb", time: "10:15", title: "AI Fact Find Review", actor: "Nova AI", detail: "42 fields populated, 94% confidence", cat: "ai" },
  { date: "22 Feb", time: "14:32", title: "DIP Re-run", actor: "Broker", detail: "Afin Fix 2yr 75% \u2014 Approved", cat: "approval" },
  { date: "25 Feb", time: "10:00", title: "Valuation Report Received", actor: "Countrywide", detail: "Value: \u00a3485,000. Condition: Good. No issues", cat: "document" },
  { date: "25 Feb", time: "11:00", title: "Valuation Approved", actor: "Ops: Tom Walker", detail: "Report value matches AVM. No retention required", cat: "approval" },
  { date: "25 Feb", time: "14:00", title: "Assigned to Underwriting", actor: "System", detail: "Routed to James Mitchell (Underwriter)", cat: "status" },
  { date: "26 Feb", time: "09:30", title: "AI Underwriting Assessment", actor: "Nova AI", detail: "Risk score 14/100. Recommendation: Approve. No conditions", cat: "ai" },
  { date: "26 Feb", time: "10:45", title: "Credit Decision: Approved", actor: "UW: James Mitchell", detail: "Within L1 mandate. No escalation required", cat: "approval" },
  { date: "26 Feb", time: "11:00", title: "Offer Generated", actor: "System", detail: "Mortgage offer letter created and sent for signature", cat: "status" },
  { date: "27 Feb", time: "09:15", title: "Offer Accepted", actor: "Customer", detail: "Digital signature received via DocuSign", cat: "approval" },
  { date: "28 Feb", time: "10:00", title: "Disbursement Created", actor: "Finance: Priya Patel", detail: "£350,000 to sort code 20-45-67", cat: "status" },
  { date: "28 Feb", time: "14:00", title: "Disbursement Authorised", actor: "Finance: James Mitchell", detail: "4-eyes check complete", cat: "approval" },
  { date: "01 Mar", time: "09:00", title: "Funds Released", actor: "System", detail: "\u00a3350,000 disbursed", cat: "approval" },
  { date: "01 Mar", time: "09:01", title: "Case Complete", actor: "System", detail: "Case moved to Disbursed. Onboarded to Servicing as M-001234", cat: "approval" },
];

const durations = [
  null, "1m", "0m", "1m", "3m", "5m", "2m", "18m", "1h 15m", "15m",
  "17h 15m", "1h", "2d 4h 17m", "2d 19h 28m", "1h", "3h",
  "19h 30m", "1h 15m", "15m", "22h 15m", "24h 45m", "4h", "19h", "1m",
];

const avgDurations = [
  null, "2m", "5m", "3m", "10m", "8m", "5m", "30m", "2h", "30m",
  "24h", "2h", "3d", "3d 12h", "2h", "4h",
  "24h", "2h", "30m", "1d 12h", "1d 8h", "6h", "1d", "2m",
];

function CaseJourney() {
  const [caseId, setCaseId] = useState("AFN-2026-00142");
  const [showCompare, setShowCompare] = useState(false);

  const catLabel = { status: "Status", approval: "Approval", document: "Document", ai: "AI", alert: "Alert" };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
          {Ico.clock(24)}
          Case Journey Visualiser
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 34 }}>
          End-to-end audit trail from submission to completion
        </div>
      </div>

      {/* Search bar */}
      <Card style={{ marginBottom: 24, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: T.textMuted }}>{Ico.search(18)}</span>
        <input
          value={caseId}
          onChange={e => setCaseId(e.target.value)}
          placeholder="Enter case ID"
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: T.font,
            background: "transparent", color: T.text,
          }}
        />
        <Btn primary small icon="search">Search</Btn>
      </Card>

      {/* Case header */}
      <Card style={{ marginBottom: 24, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
            background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, color: "#fff",
          }}>
            {caseId}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>James & Sarah Mitchell</span>
          <span style={{ fontSize: 12, color: T.textMuted }}>\u2014 Residential Mortgage \u2014 \u00a3350,000</span>
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
            background: "#34D399", color: "#fff",
          }}>
            Disbursed
          </span>
        </div>
      </Card>

      {/* Performance metrics */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Total Elapsed" value="10 days" sub="vs 15-day SLA" color={T.success} />
        <KPICard label="Time in KYC" value="1h 15m" sub="Identity & AML" color="#3B82F6" />
        <KPICard label="Time in Valuation" value="4d 20h" sub="Longest stage" color={T.warning} />
        <KPICard label="Time in Underwriting" value="20h 45m" sub="Credit assessment" color="#8B5CF6" />
        <KPICard label="AI Automation" value="67%" sub="Checks done automatically" color="#8B5CF6" />
        <KPICard label="Human Touchpoints" value="8" sub="Manual actions" color={T.primary} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Btn icon="download">Export Journey PDF</Btn>
        <div
          onClick={() => setShowCompare(!showCompare)}
          style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: T.primary, userSelect: "none",
          }}
        >
          <div style={{
            width: 36, height: 20, borderRadius: 10, padding: 2,
            background: showCompare ? T.primary : T.border, transition: "background 0.2s",
            display: "flex", alignItems: "center",
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: 8, background: "#fff",
              transition: "transform 0.2s", transform: showCompare ? "translateX(16px)" : "translateX(0)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }} />
          </div>
          Compare with Average
        </div>

        {/* Legend */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, flexWrap: "wrap" }}>
          {Object.entries(categoryColors).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textMuted }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: val.node }} />
              {catLabel[key]}
            </div>
          ))}
        </div>
      </div>

      {/* Journey Timeline */}
      <Card style={{ padding: "32px 28px" }}>
        <div style={{ position: "relative" }}>
          {mockEvents.map((evt, i) => {
            const cc = categoryColors[evt.cat] || categoryColors.status;
            const isLast = i === mockEvents.length - 1;
            return (
              <div key={i} style={{ display: "flex", gap: 0, marginBottom: isLast ? 0 : 8, position: "relative" }}>
                {/* Date / time column */}
                <div style={{ width: 90, textAlign: "right", paddingRight: 20, paddingTop: 6, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{evt.date}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{evt.time}</div>
                </div>

                {/* Node + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 40 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 10,
                    background: cc.node, border: `3px solid ${cc.bg}`,
                    boxShadow: `0 0 0 2px ${cc.node}33`,
                    flexShrink: 0, position: "relative", zIndex: 1,
                  }} />
                  {!isLast && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 40,
                      background: `linear-gradient(to bottom, ${cc.node}44, ${categoryColors[mockEvents[i + 1]?.cat]?.node || cc.node}44)`,
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 20, paddingTop: 0,
                }}>
                  <div style={{
                    background: cc.bg + "66", border: `1px solid ${cc.node}22`,
                    borderRadius: 10, padding: "12px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{evt.title}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                        background: cc.node, color: "#fff",
                      }}>
                        {catLabel[evt.cat]}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: T.primary, fontWeight: 600, marginBottom: 4 }}>{evt.actor}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>{evt.detail}</div>
                    {durations[i] && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginTop: 8,
                        fontSize: 11, color: T.textMuted,
                      }}>
                        {Ico.clock(12)}
                        <span>{durations[i]} in this stage</span>
                        {showCompare && (
                          <span style={{
                            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                            background: T.primaryLight, color: T.primary,
                          }}>
                            avg: {avgDurations[i]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default CaseJourney;
