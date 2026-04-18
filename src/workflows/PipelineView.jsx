import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";

// ── Helpers ──
const SOLICITOR_MAP = {};
TEAM_MEMBERS.solicitors.forEach(s => { SOLICITOR_MAP[s.id] = s; });

const ADVISER_MAP = {};
TEAM_MEMBERS.advisors.forEach(a => { ADVISER_MAP[a.id] = a; });

// Status progression order for deriving DIP/ESIS/Offer states
const STATUS_ORDER = [
  "Draft", "Submitted", "DIP_Approved", "Referred", "Declined",
  "KYC_In_Progress", "Underwriting", "Valuation_Complete",
  "Approved", "Offer_Issued", "Offer_Accepted", "Disbursed",
];

function statusAtLeast(caseStatus, threshold) {
  const caseIdx = STATUS_ORDER.indexOf(caseStatus);
  const threshIdx = STATUS_ORDER.indexOf(threshold);
  if (caseIdx === -1 || threshIdx === -1) return false;
  return caseIdx >= threshIdx;
}

function getDIPStatus(status) {
  if (status === "Declined") return { label: "Declined", color: "#991B1B", bg: "#FEE2E2" };
  if (status === "Referred") return { label: "Referred", color: "#92400E", bg: "#FEF3C7" };
  if (statusAtLeast(status, "DIP_Approved")) return { label: "Approved", color: "#065F46", bg: "#D1FAE5" };
  return { label: "Pending", color: "#6B7280", bg: "#F3F4F6" };
}

function getESISStatus(status) {
  if (statusAtLeast(status, "Approved")) return { label: "Generated", color: "#065F46", bg: "#D1FAE5" };
  if (statusAtLeast(status, "DIP_Approved") && !statusAtLeast(status, "Approved")) return { label: "Pending", color: "#92400E", bg: "#FEF3C7" };
  return { label: "N/A", color: "#6B7280", bg: "#F3F4F6" };
}

function getOfferStatus(status) {
  if (status === "Disbursed") return { label: "Complete", color: "#fff", bg: "#34D399" };
  if (status === "Offer_Accepted") return { label: "Accepted", color: "#064E3B", bg: "#6EE7B7" };
  if (status === "Offer_Issued") return { label: "Issued", color: "#1D4ED8", bg: "#BFDBFE", showDays: true };
  if (statusAtLeast(status, "Approved")) return { label: "Pending", color: "#92400E", bg: "#FEF3C7" };
  return { label: "Not Yet", color: "#6B7280", bg: "#F3F4F6" };
}

function getRiskBadge(score, level) {
  if (level === "Low") return { color: "#059669", bg: "#D1FAE5" };
  if (level === "Medium") return { color: "#D97706", bg: "#FEF3C7" };
  return { color: "#DC2626", bg: "#FEE2E2" };
}

// ── Filters & Sorts ──
const STAGE_TABS = ["All Stages", "DIP", "KYC", "Underwriting", "Offer", "Completion", "Disbursed"];
const SORT_OPTIONS = ["By Status", "By Risk", "By Amount"];

const STAGE_FILTER_MAP = {
  "All Stages": () => true,
  "DIP": c => ["DIP_Approved", "Referred", "Declined", "Submitted"].includes(c.status),
  "KYC": c => c.status === "KYC_In_Progress",
  "Underwriting": c => ["Underwriting", "Valuation_Complete"].includes(c.status),
  "Offer": c => ["Approved", "Offer_Issued", "Offer_Accepted"].includes(c.status),
  "Completion": c => c.status === "Offer_Accepted",
  "Disbursed": c => c.status === "Disbursed",
};

function sortCases(cases, sortBy) {
  const sorted = [...cases];
  if (sortBy === "By Status") {
    sorted.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  } else if (sortBy === "By Risk") {
    sorted.sort((a, b) => b.riskScore - a.riskScore);
  } else if (sortBy === "By Amount") {
    const parseAmt = s => parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
    sorted.sort((a, b) => parseAmt(b.amount) - parseAmt(a.amount));
  }
  return sorted;
}

export default function PipelineView({ onProcessCase }) {
  const [activeTab, setActiveTab] = useState("All Stages");
  const [sortBy, setSortBy] = useState("By Status");

  const filterFn = STAGE_FILTER_MAP[activeTab] || (() => true);
  const filtered = sortCases(MOCK_LOANS.filter(filterFn), sortBy);

  // KPIs
  const totalCases = MOCK_LOANS.length;
  const inUW = MOCK_LOANS.filter(c => c.status === "Underwriting").length;
  const offersOut = MOCK_LOANS.filter(c => ["Offer_Issued", "Offer_Accepted"].includes(c.status)).length;
  const highRisk = MOCK_LOANS.filter(c => c.riskLevel === "High").length;
  const disbursed = MOCK_LOANS.filter(c => c.status === "Disbursed").length;

  const thStyle = { padding: "10px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
  const tdStyle = { padding: "10px 10px", fontSize: 12, color: T.text, borderBottom: `1px solid ${T.borderLight}`, whiteSpace: "nowrap", verticalAlign: "middle" };
  const badgeStyle = (bg, color) => ({ background: bg, color, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, display: "inline-block" });

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>{Ico.loans(22)} Pipeline View</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Full case pipeline -- all stages, all personas</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setSortBy(opt)} style={{
              padding: "6px 14px", borderRadius: 6, border: `1px solid ${sortBy === opt ? T.primary : T.border}`,
              background: sortBy === opt ? T.primaryLight : "transparent",
              color: sortBy === opt ? T.primary : T.textMuted,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
            }}>{opt}</button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <KPICard label="Total Cases" value={totalCases} color={T.primary} />
        <KPICard label="In Underwriting" value={inUW} color="#8B5CF6" />
        <KPICard label="Offers Out" value={offersOut} color="#3B82F6" />
        <KPICard label="High Risk" value={highRisk} color={T.danger} />
        <KPICard label="Disbursed" value={disbursed} color={T.success} />
      </div>

      {/* Stage Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {STAGE_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: T.font,
            background: activeTab === tab ? T.primary : "transparent",
            color: activeTab === tab ? "#fff" : T.textMuted,
            transition: "all 0.15s",
          }}>{tab}</button>
        ))}
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Case ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>LTV</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>DIP</th>
                <th style={thStyle}>ESIS</th>
                <th style={thStyle}>Offer</th>
                <th style={thStyle}>Solicitor</th>
                <th style={thStyle}>Adviser</th>
                <th style={thStyle}>Risk</th>
                {onProcessCase && <th style={{ ...thStyle, textAlign: "center" }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const dip = getDIPStatus(c.status);
                const esis = getESISStatus(c.status);
                const offer = getOfferStatus(c.status);
                const risk = getRiskBadge(c.riskScore, c.riskLevel);
                const solicitor = SOLICITOR_MAP[c.squad?.solicitor];
                const adviser = ADVISER_MAP[c.squad?.adviser];

                return (
                  <tr key={c.id}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={tdStyle}>
                      <span style={{ color: T.primary, fontWeight: 600, cursor: "pointer" }}>{c.id}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{c.names}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 12 }}>{c.product}</span>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ background: c.bucketColor + "18", color: c.bucketColor, padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700 }}>{c.bucket}</span>
                          {c.tier && <span style={{ background: "#F3F4F6", color: "#6B7280", padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 600 }}>{c.tier}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{c.amount}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontWeight: 600,
                        color: c.ltv > 85 ? "#DC2626" : c.ltv > 75 ? "#D97706" : "#059669",
                      }}>{c.ltv}%</span>
                    </td>
                    <td style={tdStyle}><StatusBadge status={c.status} /></td>
                    <td style={tdStyle}><span style={badgeStyle(dip.bg, dip.color)}>{dip.label}</span></td>
                    <td style={tdStyle}><span style={badgeStyle(esis.bg, esis.color)}>{esis.label}</span></td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(offer.bg, offer.color)}>{offer.label}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>{solicitor ? solicitor.firm : "--"}</td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>{adviser ? adviser.name : "--"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          ...badgeStyle(risk.bg, risk.color),
                          minWidth: 28, textAlign: "center",
                        }}>{c.riskScore}</span>
                        <span style={{ fontSize: 10, color: risk.color, fontWeight: 600 }}>{c.riskLevel}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {onProcessCase && (
                        <Btn small primary onClick={() => onProcessCase(c)}>Process</Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
            No cases found for this stage.
          </div>
        )}
      </Card>

      {/* Summary footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "0 4px" }}>
        <div style={{ fontSize: 12, color: T.textMuted }}>
          Showing {filtered.length} of {MOCK_LOANS.length} cases
        </div>
        <div style={{ fontSize: 11, color: T.textMuted }}>
          Last updated: just now
        </div>
      </div>
    </div>
  );
}
