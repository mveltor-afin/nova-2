import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";

// ─────────────────────────────────────────────
// INCOMING — UW-approved cases ready for Ops processing
// Shows cases that have been approved by underwriting
// and are ready for valuation, offer, solicitor, completion.
// ─────────────────────────────────────────────

const APPROVED_STATUSES = ["Approved", "Offer_Issued", "Offer_Accepted"];

const allSolicitors = Object.fromEntries((TEAM_MEMBERS.solicitors || []).map(s => [s.id, s]));
const allAdvisers = Object.fromEntries((TEAM_MEMBERS.advisors || []).map(a => [a.id, a]));

// UW decision mock data per case
const UW_DECISIONS = {
  "AFN-2026-00142": { decision: "Approved", uwName: "James Mitchell", uwDate: "26 Feb 2026", conditions: "None", riskNote: "Strong profile. All checks passed. Fast-track eligible." },
  "AFN-2026-00139": { decision: "Approved", uwName: "Simrat Gill", uwDate: "18 Mar 2026", conditions: "P60 discrepancy noted on file", riskNote: "Near prime credit. Offer issued, awaiting acceptance." },
  "AFN-2026-00135": { decision: "Approved", uwName: "Amir Hassan", uwDate: "10 Mar 2026", conditions: "IO retirement plan evidence required", riskNote: "Interest only, high LTV. Income strong." },
  "AFN-2026-00125": { decision: "Approved", uwName: "Amir Hassan", uwDate: "14 Mar 2026", conditions: "None — within L2 mandate", riskNote: "Above £500k. L2 second approval obtained." },
  "AFN-2026-00145": { decision: "Approved", uwName: "James Mitchell", uwDate: "12 Apr 2026", conditions: "Cashflow verification required", riskNote: "Commercial mortgage. Owner-occupied. Clean credit." },
  "AFN-2026-00144": { decision: "Approved", uwName: "Amir Hassan", uwDate: "16 Apr 2026", conditions: "Portfolio assessment complete", riskNote: "BTL portfolio. ICR 168%. Ltd company." },
};

export default function IntakeQueue({ onProcessCase }) {
  const [filter, setFilter] = useState("all");

  // Filter MOCK_LOANS for approved cases
  const approvedCases = MOCK_LOANS.filter(l =>
    APPROVED_STATUSES.includes(l.status) || UW_DECISIONS[l.id]
  );

  const filtered = filter === "all" ? approvedCases
    : filter === "mortgage" ? approvedCases.filter(l => !l.lendingType || l.lendingType === "residential" || l.type === "C&I" || l.type === "Interest Only")
    : filter === "commercial" ? approvedCases.filter(l => l.lendingType === "commercial" || l.lendingType === "btl" || l.type === "BTL" || l.type === "Commercial")
    : approvedCases;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.zap(22)}
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Incoming — UW Approved</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>Cases approved by underwriting, ready for Ops processing (valuation, offer, solicitor, completion)</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Ready to Process" value={approvedCases.length} color={T.primary} />
        <KPICard label="Approved" value={approvedCases.filter(l => l.status === "Approved").length} sub="awaiting ops" color={T.success} />
        <KPICard label="Offer Issued" value={approvedCases.filter(l => l.status === "Offer_Issued").length} sub="in progress" color={T.accent} />
        <KPICard label="Offer Accepted" value={approvedCases.filter(l => l.status === "Offer_Accepted").length} sub="ready to complete" color="#8B5CF6" />
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { id: "all", label: "All" },
          { id: "mortgage", label: "Residential" },
          { id: "commercial", label: "Commercial & BTL" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: T.font, fontSize: 12, fontWeight: 600,
            background: filter === f.id ? T.primary : "transparent",
            color: filter === f.id ? "#fff" : T.textMuted,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Case cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(loan => {
          const uwDecision = UW_DECISIONS[loan.id];
          const solicitor = loan.squad?.solicitor ? allSolicitors[loan.squad.solicitor] : null;
          const adviser = loan.squad?.adviser ? allAdvisers[loan.squad.adviser] : null;

          return (
            <Card key={loan.id} style={{ padding: 20 }}>
              {/* Top row: case info + action */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{loan.id}</span>
                    <StatusBadge status={loan.status} />
                    {loan.bucket && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: (loan.bucketColor || T.primary) + "14", color: loan.bucketColor || T.primary }}>{loan.bucket}</span>
                    )}
                    {loan.tier && loan.tier !== "Standard" && loan.tier !== "Base" && (
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: "#EDE9FE", color: "#6D28D9" }}>{loan.tier}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{loan.names}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textMuted }}>
                    <span><strong>{loan.product}</strong></span>
                    <span>{loan.amount}</span>
                    <span>{loan.rate}</span>
                    <span>LTV: {loan.ltv}%</span>
                    {loan.code && <span style={{ fontFamily: "monospace" }}>{loan.code}</span>}
                  </div>
                </div>
                <Btn primary onClick={() => onProcessCase?.(loan)}>
                  Process Case →
                </Btn>
              </div>

              {/* UW Decision summary */}
              {uwDecision && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #A7F3D0", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: T.success, fontWeight: 700, fontSize: 14 }}>✓</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>UW Decision: {uwDecision.decision}</span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>by {uwDecision.uwName} · {uwDecision.uwDate}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{uwDecision.riskNote}</div>
                  {uwDecision.conditions && uwDecision.conditions !== "None" && uwDecision.conditions !== "None — within L2 mandate" && (
                    <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6, background: "#FEF3C7", color: "#92400E", display: "inline-block" }}>
                      Condition: {uwDecision.conditions}
                    </div>
                  )}
                </div>
              )}

              {/* Squad */}
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.textMuted }}>
                {adviser && <span>Adviser: <strong style={{ color: T.text }}>{adviser.name}</strong></span>}
                {solicitor && <span>Solicitor: <strong style={{ color: T.text }}>{solicitor.firm}</strong></span>}
                <span>Risk: <strong style={{ color: loan.riskScore > 60 ? T.danger : loan.riskScore > 30 ? T.warning : T.success }}>{loan.riskScore}/100 {loan.riskLevel}</strong></span>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
            No cases ready for processing in this category.
          </Card>
        )}
      </div>
    </div>
  );
}
