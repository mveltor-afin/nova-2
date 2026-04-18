import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { TEAM_MEMBERS, MOCK_LOANS } from "../data/loans";
import { AIRouterPanel, getTeamCapacity } from "../shared/AIRouterEngine";

// ─────────────────────────────────────────────
// TEAM VIEW — Capacity & assignment dashboard
// Shows team members, their workload, active cases,
// and AI routing for unassigned cases.
// ─────────────────────────────────────────────

const ROLE_COLORS = {
  ops:         { bg: "#DBEAFE", text: "#1E40AF", accent: "#3B82F6" },
  underwriter: { bg: "#EDE9FE", text: "#7C3AED", accent: "#8B5CF6" },
};

function getMemberStatus(member) {
  const util = member.active / member.capacity;
  if (util >= 0.9) return { label: "At Capacity", color: T.danger, bg: T.dangerBg };
  if (util >= 0.65) return { label: "Busy", color: T.warning, bg: T.warningBg };
  return { label: "Available", color: T.success, bg: T.successBg };
}

function getCasesForMember(memberId, role) {
  const field = role === "underwriter" ? "underwriter" : "ops";
  return MOCK_LOANS.filter(l => l.squad?.[field] === memberId);
}

export default function TeamView({ role = "ops" }) {
  const [reassigningCase, setReassigningCase] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const isOps = role === "ops";
  const pool = isOps ? TEAM_MEMBERS.ops : TEAM_MEMBERS.underwriters;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.ops;
  const capacityData = getTeamCapacity(role);

  // Team KPIs
  const totalCases = pool.reduce((sum, m) => sum + m.active, 0);
  const avgUtil = Math.round(pool.reduce((sum, m) => sum + (m.active / m.capacity) * 100, 0) / pool.length);
  const casesPerPerson = (totalCases / pool.length).toFixed(1);

  // Find unassigned cases (cases without ops or underwriter assigned)
  const field = isOps ? "ops" : "underwriter";
  const assignedIds = new Set(pool.map(m => m.id));
  const unassigned = MOCK_LOANS.filter(l => !l.squad?.[field] || !assignedIds.has(l.squad[field]));

  const handleReassign = (caseId, fromMemberId, toMemberId) => {
    setReassigningCase(null);
    // In production, this would call an API
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.users(22)}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{isOps ? "Ops Team" : "UW Team"}</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>{pool.length} team members — capacity and assignment view</div>
        </div>
      </div>

      {/* Team KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Total Cases" value={totalCases} color={T.primary} />
        <KPICard label="Avg Utilisation" value={`${avgUtil}%`} sub={avgUtil > 75 ? "high load" : "healthy"} color={avgUtil > 75 ? T.warning : T.success} />
        <KPICard label="Cases / Person" value={casesPerPerson} color={roleColor.accent} />
        <KPICard label="Unassigned" value={unassigned.length} sub={unassigned.length > 0 ? "needs routing" : "all assigned"} color={unassigned.length > 0 ? T.danger : T.success} />
      </div>

      {/* Team capacity grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 32 }}>
        {pool.map(member => {
          const status = getMemberStatus(member);
          const util = Math.round((member.active / member.capacity) * 100);
          const memberCases = getCasesForMember(member.id, role);
          const isExpanded = selectedMember === member.id;

          return (
            <Card key={member.id} style={{ padding: 0, overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s", boxShadow: isExpanded ? `0 0 0 2px ${roleColor.accent}40` : "none" }}
              onClick={() => setSelectedMember(isExpanded ? null : member.id)}>
              <div style={{ padding: "18px 20px" }}>
                {/* Avatar + Name row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${roleColor.text}20, ${roleColor.text}40)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: roleColor.text,
                  }}>
                    {member.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{member.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{member.role}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: status.bg, color: status.color,
                  }}>{status.label}</span>
                </div>

                {/* Specialism pills */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                  {member.specialism.map(s => (
                    <span key={s} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 5,
                      background: roleColor.bg, color: roleColor.text,
                      fontWeight: 600,
                    }}>{s}</span>
                  ))}
                  {member.mandate && (
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 5,
                      background: "#FEF3C7", color: "#92400E", fontWeight: 600,
                    }}>Mandate: {member.mandate}</span>
                  )}
                </div>

                {/* Capacity bar */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: T.textMuted }}>Active: {member.active} / {member.capacity}</span>
                    <span style={{ fontWeight: 700, color: util > 80 ? T.danger : util > 60 ? T.warning : T.success }}>{util}%</span>
                  </div>
                  <div style={{ height: 6, background: T.borderLight, borderRadius: 3 }}>
                    <div style={{
                      height: 6, borderRadius: 3, transition: "width 0.3s",
                      background: util > 80 ? T.danger : util > 60 ? T.warning : T.success,
                      width: `${util}%`,
                    }} />
                  </div>
                </div>
              </div>

              {/* Expanded: active cases list */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 20px", background: "#FAFAF8" }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Active Cases ({memberCases.length})
                  </div>
                  {memberCases.length === 0 && (
                    <div style={{ fontSize: 12, color: T.textMuted, padding: "8px 0" }}>No cases assigned.</div>
                  )}
                  {memberCases.map(c => (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                      borderBottom: `1px solid ${T.borderLight}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.navy, fontFamily: "monospace" }}>{c.id}</span>
                          <span style={{ fontSize: 11, color: T.text }}>{c.names}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{c.product} · {c.amount}</div>
                      </div>
                      <div style={{ position: "relative" }}>
                        <Btn small ghost onClick={(e) => {
                          e.stopPropagation();
                          setReassigningCase(reassigningCase === c.id + member.id ? null : c.id + member.id);
                        }}>Reassign</Btn>

                        {reassigningCase === c.id + member.id && (
                          <div style={{
                            position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 10,
                            background: T.card, borderRadius: 10, border: `1px solid ${T.border}`,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: 8, minWidth: 200,
                          }} onClick={e => e.stopPropagation()}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, padding: "4px 8px", marginBottom: 4 }}>
                              Reassign to:
                            </div>
                            {pool.filter(m => m.id !== member.id).map(m => (
                              <div key={m.id}
                                onClick={() => handleReassign(c.id, member.id, m.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
                                  borderRadius: 6, cursor: "pointer",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <div style={{
                                  width: 24, height: 24, borderRadius: 6, background: `${roleColor.text}15`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 9, fontWeight: 700, color: roleColor.text,
                                }}>{m.initials}</div>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{m.name}</div>
                                  <div style={{ fontSize: 10, color: T.textMuted }}>{m.active}/{m.capacity} · {m.specialism.join(", ")}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* AI Routing Section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "#F59E0B" }}>{Ico.sparkle(20)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>AI-Powered Routing</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Automatically assign unassigned cases based on specialism, capacity, and mandate</div>
          </div>
          {unassigned.length > 0 && (
            <Btn primary icon="sparkle">Auto-Route All</Btn>
          )}
        </div>

        <AIRouterPanel
          cases={unassigned.length > 0 ? unassigned : MOCK_LOANS.slice(0, 3)}
          role={role}
          onAccept={(loan, assignee) => {
            // In production: API call to assign
          }}
          onAcceptAll={(recs) => {
            // In production: batch API call
          }}
        />
      </div>
    </div>
  );
}
