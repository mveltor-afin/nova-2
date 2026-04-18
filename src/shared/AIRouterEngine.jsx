import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card, KPICard } from "./primitives";
import { TEAM_MEMBERS, MOCK_LOANS } from "../data/loans";

// ─────────────────────────────────────────────
// AI ROUTING ENGINE
// Auto-assigns cases to the best team member
// based on specialism, capacity, mandate & performance.
// ─────────────────────────────────────────────

// Seed-based deterministic "random" per member+loan for stable scores
function pseudoRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 100) / 100;
}

// Map loan type/bucket to specialism keywords
function getLoanSpecialisms(loan) {
  const tags = [];
  if (loan.bucket?.includes("Prime")) tags.push("Residential", "Standard");
  if (loan.bucket?.includes("Buy-to-Let") || loan.type === "BTL") tags.push("BTL");
  if (loan.bucket?.includes("Commercial") || loan.type === "Commercial") tags.push("Commercial", "Complex");
  if (loan.bucket?.includes("Professional") || loan.bucket?.includes("HNW")) tags.push("HNW");
  if (loan.bucket?.includes("Development") || loan.type === "Development") tags.push("Complex");
  if (loan.bucket?.includes("Bridging") || loan.type === "Bridging") tags.push("Bridging");
  if (loan.creditProfile === "near_prime" || loan.creditProfile === "adverse") tags.push("Complex");
  if (loan.status === "KYC_In_Progress") tags.push("KYC");
  if (loan.ltv >= 85) tags.push("First Time");
  if (loan.type === "C&I" && !tags.length) tags.push("Residential", "Standard");
  return tags;
}

// Parse amount string to number
function parseAmount(str) {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
}

// Mandate limits for underwriters
const MANDATE_LIMITS = { L1: 500000, L2: 1500000, L3: 5000000 };

export function routeCase(loan, role = "ops") {
  const pool = role === "underwriter" ? TEAM_MEMBERS.underwriters : TEAM_MEMBERS.ops;
  const loanTags = getLoanSpecialisms(loan);
  const amount = parseAmount(loan.amount);

  const scored = pool.map(member => {
    let score = 0;
    const reasons = [];

    // Specialism match: +40
    const specMatch = member.specialism.some(s => loanTags.includes(s));
    if (specMatch) {
      score += 40;
      const matched = member.specialism.filter(s => loanTags.includes(s));
      reasons.push(`${matched.join(", ")} specialism match`);
    }

    // Capacity: +30 * (1 - utilisation)
    const util = member.active / member.capacity;
    const capScore = Math.round(30 * (1 - util));
    score += capScore;
    const available = member.capacity - member.active;
    reasons.push(`${available} slot${available !== 1 ? "s" : ""} available`);

    // Mandate match (UW only): +20
    if (role === "underwriter" && member.mandate) {
      const limit = MANDATE_LIMITS[member.mandate] || 0;
      if (amount <= limit) {
        score += 20;
        reasons.push(`${member.mandate} mandate covers ${loan.amount}`);
      }
    }

    // Performance factor: +10 * pseudo-random
    const perfFactor = pseudoRandom(member.id + loan.id);
    score += Math.round(10 * perfFactor);

    return {
      assignee: member,
      score,
      reason: reasons.join(" + "),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

export function routeBatch(loans, role = "ops") {
  return loans.map(loan => {
    const result = routeCase(loan, role);
    return result ? { loan, ...result } : null;
  }).filter(Boolean);
}

export function getTeamCapacity(role = "ops") {
  const pool = role === "underwriter" ? TEAM_MEMBERS.underwriters : TEAM_MEMBERS.ops;
  return pool.map(member => ({
    member,
    active: member.active,
    capacity: member.capacity,
    utilisation: Math.round((member.active / member.capacity) * 100),
    available: member.capacity - member.active,
  }));
}

// ─────────────────────────────────────────────
// AI ROUTER PANEL — React Component
// ─────────────────────────────────────────────

export function AIRouterPanel({ cases, role = "ops", onAccept, onAcceptAll }) {
  const [accepted, setAccepted] = useState({});
  const [reassigning, setReassigning] = useState(null);

  const pool = role === "underwriter" ? TEAM_MEMBERS.underwriters : TEAM_MEMBERS.ops;
  const recommendations = routeBatch(cases || [], role);

  const handleAccept = (rec) => {
    setAccepted(prev => ({ ...prev, [rec.loan.id]: true }));
    onAccept?.(rec.loan, rec.assignee);
  };

  const handleAcceptAll = () => {
    const all = {};
    recommendations.forEach(r => { all[r.loan.id] = true; });
    setAccepted(prev => ({ ...prev, ...all }));
    onAcceptAll?.(recommendations);
  };

  const handleReassign = (rec, newMember) => {
    setAccepted(prev => ({ ...prev, [rec.loan.id]: true }));
    setReassigning(null);
    onAccept?.(rec.loan, newMember);
  };

  if (!recommendations.length) {
    return (
      <Card style={{ padding: 20, textAlign: "center" }}>
        <div style={{ color: T.textMuted, fontSize: 13 }}>No unassigned cases to route.</div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#F59E0B" }}>{Ico.sparkle(20)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>AI Routing Engine</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>{recommendations.length} case{recommendations.length !== 1 ? "s" : ""} analysed — optimal assignments recommended</div>
        </div>
        <Btn primary small onClick={handleAcceptAll} icon="check">Accept All</Btn>
      </div>

      {/* Recommendations */}
      <div style={{ padding: "0" }}>
        {recommendations.map((rec, i) => {
          const isAccepted = accepted[rec.loan.id];
          const showReassign = reassigning === rec.loan.id;

          return (
            <div key={rec.loan.id} style={{
              padding: "16px 20px",
              borderBottom: i < recommendations.length - 1 ? `1px solid ${T.borderLight}` : "none",
              background: isAccepted ? T.successBg : "transparent",
              transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Case info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.navy, fontFamily: "monospace" }}>{rec.loan.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{rec.loan.names}</span>
                    {rec.loan.bucket && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: (rec.loan.bucketColor || T.primary) + "14", color: rec.loan.bucketColor || T.primary }}>{rec.loan.bucket}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{rec.loan.product} · {rec.loan.amount} · LTV {rec.loan.ltv}%</div>
                </div>

                {/* Arrow */}
                <span style={{ color: T.textMuted }}>{Ico.arrow(16)}</span>

                {/* Recommended assignee */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: `linear-gradient(135deg, ${T.primary}20, ${T.primary}40)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: T.primary,
                  }}>
                    {rec.assignee.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{rec.assignee.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{rec.assignee.role}</div>
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  padding: "4px 10px", borderRadius: 8, minWidth: 50, textAlign: "center",
                  background: rec.score >= 60 ? T.successBg : rec.score >= 40 ? T.warningBg : T.dangerBg,
                  color: rec.score >= 60 ? T.success : rec.score >= 40 ? T.warning : T.danger,
                  fontSize: 13, fontWeight: 700,
                }}>
                  {rec.score}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  {isAccepted ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.success, display: "flex", alignItems: "center", gap: 4 }}>
                      {Ico.check(14)} Assigned
                    </span>
                  ) : (
                    <>
                      <Btn small primary onClick={() => handleAccept(rec)}>Accept</Btn>
                      <Btn small ghost onClick={() => setReassigning(showReassign ? null : rec.loan.id)}>Reassign</Btn>
                    </>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted, paddingLeft: 2 }}>
                <span style={{ color: "#F59E0B", marginRight: 4 }}>{Ico.sparkle(11)}</span>
                {rec.reason}
              </div>

              {/* Reassign dropdown */}
              {showReassign && !isAccepted && (
                <div style={{ marginTop: 10, padding: 12, background: T.bg, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Select alternative:</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {pool.filter(m => m.id !== rec.assignee.id).map(m => (
                      <div key={m.id} onClick={() => handleReassign(rec, m)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                          borderRadius: 8, cursor: "pointer", background: T.card, border: `1px solid ${T.border}`,
                          transition: "border-color 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
                        onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7,
                          background: `${T.primary}15`, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, color: T.primary,
                        }}>{m.initials}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: T.textMuted }}>{m.active}/{m.capacity} cases</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AIRouterPanel;
