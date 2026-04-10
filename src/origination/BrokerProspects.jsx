import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import EmptyState from "../shared/EmptyState";

// Broker's own prospects and customers — NOT the bank's full customer base
const MOCK_BROKER_PROSPECTS = [
  { id: "PRO-001", name: "James & Sarah Mitchell", email: "j.mitchell@outlook.com", phone: "+44 7700 900456",
    stage: "Application Submitted", caseRef: "AFN-2026-00142", value: "£350,000", lastContact: "2h ago",
    nextAction: "Awaiting underwriting decision", source: "Referral" },
  { id: "PRO-002", name: "David Chen", email: "d.chen@gmail.com", phone: "+44 7700 900321",
    stage: "KYC In Progress", caseRef: "AFN-2026-00135", value: "£425,000", lastContact: "3d ago",
    nextAction: "Chase ID document upload", source: "Direct" },
  { id: "PRO-003", name: "Emma & Tom Wilson", email: "emma.wilson@gmail.com", phone: "+44 7700 900123",
    stage: "Disbursed", caseRef: "AFN-2026-00128", value: "£290,000", lastContact: "1w ago",
    nextAction: "Schedule completion call", source: "Referral" },
  { id: "PRO-004", name: "Sophie & Jack Brown", email: "sophie.brown@outlook.com", phone: "+44 7700 900789",
    stage: "DIP Approved", caseRef: "AFN-2026-00115", value: "£320,000", lastContact: "6d ago",
    nextAction: "Convert DIP to full application", source: "Cold lead" },
  { id: "PRO-005", name: "Lisa Patel", email: "l.patel@yahoo.com", phone: "+44 7700 900111",
    stage: "Initial Enquiry", caseRef: null, value: "£250,000 (est)", lastContact: "Today",
    nextAction: "Run eligibility check", source: "Website" },
  { id: "PRO-006", name: "Mark Richardson", email: "m.richardson@btinternet.com", phone: "+44 7700 900222",
    stage: "Initial Enquiry", caseRef: null, value: "£180,000 (est)", lastContact: "Yesterday",
    nextAction: "Schedule first meeting", source: "Referral" },
];

const STAGE_COLORS = {
  "Initial Enquiry":     { bg:"#E0E7FF", text:"#3730A3" },
  "DIP Approved":        { bg:"#D1FAE5", text:"#065F46" },
  "Application Submitted":{ bg:"#DBEAFE", text:"#1E40AF" },
  "KYC In Progress":     { bg:"#FEF3C7", text:"#92400E" },
  "Underwriting":        { bg:"#EDE9FE", text:"#5B21B6" },
  "Offer Issued":        { bg:"#BFDBFE", text:"#1D4ED8" },
  "Disbursed":           { bg:"#34D399", text:"#fff" },
};

const SOURCE_COLORS = {
  "Referral":  T.success,
  "Direct":    T.primary,
  "Cold lead": T.warning,
  "Website":   "#8B5CF6",
};

export default function BrokerProspects() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const stages = ["All", "Initial Enquiry", "DIP Approved", "Application Submitted", "KYC In Progress", "Disbursed"];

  const filtered = MOCK_BROKER_PROSPECTS.filter(p => {
    if (filter !== "All" && p.stage !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue = MOCK_BROKER_PROSPECTS.reduce((sum, p) => sum + parseInt(p.value.replace(/[£,()estim]/gi, "")), 0);
  const conversionRate = Math.round((MOCK_BROKER_PROSPECTS.filter(p => p.caseRef).length / MOCK_BROKER_PROSPECTS.length) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Customers & Prospects</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            All customers you have introduced to Afin Bank
          </p>
        </div>
        <Btn primary icon="plus">Add Prospect</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Customers" value={String(MOCK_BROKER_PROSPECTS.length)} sub="In your portfolio" color={T.primary} />
        <KPICard label="Active Cases" value={String(MOCK_BROKER_PROSPECTS.filter(p => p.caseRef).length)} sub="With AFN reference" color={T.accent} />
        <KPICard label="Prospects" value={String(MOCK_BROKER_PROSPECTS.filter(p => !p.caseRef).length)} sub="Not yet applied" color={T.warning} />
        <KPICard label="Conversion Rate" value={`${conversionRate}%`} sub="Enquiry → Application" color={T.success} />
        <KPICard label="Total Value" value={`£${(totalValue / 1000000).toFixed(2)}M`} sub="Lifetime pipeline" color="#8B5CF6" />
      </div>

      <Card noPad>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {stages.map(s => (
              <span key={s} onClick={() => setFilter(s)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: filter === s ? T.primary : T.bg,
                color: filter === s ? "#fff" : T.textSecondary,
              }}>{s}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
            {Ico.search(14)}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prospects..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: 200 }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState type="search" />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name", "Contact", "Stage", "Case Ref", "Value", "Source", "Last Contact", "Next Action"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = STAGE_COLORS[p.stage] || { bg: "#E5E7EB", text: "#374151" };
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}`, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>
                      <div>{p.email}</div>
                      <div style={{ fontSize: 11 }}>{p.phone}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.stage}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 600, color: p.caseRef ? T.primary : T.textMuted }}>
                      {p.caseRef || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.value}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: SOURCE_COLORS[p.source] }}>● {p.source}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{p.lastContact}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.nextAction}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
