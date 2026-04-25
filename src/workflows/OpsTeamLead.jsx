import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS, TEAM_MEMBERS } from "../data/loans";

// ─── SLA thresholds per loan status ───────────────────────
const SLA_CONFIG = {
  Submitted:       { days: 1,  milestone: "Assign to UW" },
  KYC_In_Progress: { days: 3,  milestone: "KYC Complete" },
  Underwriting:    { days: 5,  milestone: "UW Decision" },
  Referred:        { days: 10, milestone: "Senior Review" },
  DIP_Approved:    { days: 7,  milestone: "Full App Submitted" },
  Approved:        { days: 2,  milestone: "Issue Offer" },
  Offer_Issued:    { days: 21, milestone: "Acceptance Deadline" },
  Offer_Accepted:  { days: 45, milestone: "Completion Target" },
};

function parseDays(updated = "") {
  if (!updated) return 0;
  if (updated.includes("h")) return 0.1;
  const n = parseInt(updated) || 0;
  if (updated.includes("w")) return n * 7;
  return n;
}

function getRag(days, slaDays) {
  if (!slaDays) return "none";
  const pct = days / slaDays;
  if (pct >= 1) return "red";
  if (pct >= 0.75) return "amber";
  return "green";
}

const RAG = {
  red:   { bg: T.dangerBg,  border: T.dangerBorder,  color: T.danger,  label: "Breached" },
  amber: { bg: T.warningBg, border: T.warningBorder, color: "#D97706", label: "At Risk" },
  green: { bg: T.successBg, border: T.successBorder, color: T.success, label: "On Track" },
  none:  { bg: "#F1F5F9",   border: T.border,        color: T.textMuted, label: "N/A" },
};

const RAG_ORDER = { red: 0, amber: 1, green: 2, none: 3 };

const OPS_LOOKUP = Object.fromEntries((TEAM_MEMBERS.ops || []).map(o => [o.id, o]));
const UW_LOOKUP  = Object.fromEntries((TEAM_MEMBERS.underwriters || []).map(u => [u.id, u]));

const thStyle = {
  padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
  color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5,
  borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "11px 14px", fontSize: 12, borderBottom: `1px solid ${T.borderLight}`, color: T.text, verticalAlign: "middle",
};

export default function OpsTeamLead({ onOpenCase }) {
  const [filter, setFilter] = useState("all");

  // Build enriched case list from MOCK_LOANS (exclude Disbursed — closed)
  const activeCases = MOCK_LOANS
    .filter(l => l.status !== "Disbursed")
    .map(l => {
      const sla = SLA_CONFIG[l.status];
      const days = parseDays(l.updated);
      const rag = getRag(days, sla?.days);
      const opsHandler = l.squad?.ops ? OPS_LOOKUP[l.squad.ops] : null;
      const uwHandler  = l.squad?.underwriter ? UW_LOOKUP[l.squad.underwriter] : null;
      return { ...l, sla, days, rag, opsHandler, uwHandler };
    });

  const breached = activeCases.filter(c => c.rag === "red").length;
  const atRisk   = activeCases.filter(c => c.rag === "amber").length;
  const onTrack  = activeCases.filter(c => c.rag === "green").length;

  const filtered = filter === "all" ? activeCases : activeCases.filter(c => c.rag === filter);
  const sorted = [...filtered].sort((a, b) => RAG_ORDER[a.rag] - RAG_ORDER[b.rag]);

  // Team utilization from real squad assignments
  const assignmentCounts = {};
  MOCK_LOANS.forEach(l => {
    if (!l.squad) return;
    ["ops", "underwriter", "solicitor"].forEach(role => {
      const id = l.squad[role];
      if (id) assignmentCounts[id] = (assignmentCounts[id] || 0) + 1;
    });
  });

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.clock(22)}
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>SLA Tracker</h2>
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
            Live case oversight — {activeCases.length} active cases ·{" "}
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn icon="download">Export</Btn>
          <Btn primary icon="bell">Configure Alerts</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Active Cases"  value={activeCases.length} color={T.primary} />
        <KPICard label="SLA Breached"  value={breached} sub="action required"    color={T.danger} />
        <KPICard label="At Risk"       value={atRisk}   sub="within 25% of limit" color={T.warning} />
        <KPICard label="On Track"      value={onTrack}                            color={T.success} />
        <KPICard label="Avg Days in Stage" value={
          (activeCases.reduce((s, c) => s + c.days, 0) / (activeCases.length || 1)).toFixed(1)
        } sub="all stages" color={T.accent} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { id: "all",   label: `All (${activeCases.length})` },
          { id: "red",   label: `Breached (${breached})` },
          { id: "amber", label: `At Risk (${atRisk})` },
          { id: "green", label: `On Track (${onTrack})` },
        ].map(f => {
          const active = filter === f.id;
          const accentColor = f.id === "red" ? T.danger : f.id === "amber" ? "#D97706" : f.id === "green" ? T.success : T.primary;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "7px 16px", borderRadius: 8, border: active ? "none" : `1px solid ${T.border}`,
              cursor: "pointer", fontFamily: T.font, fontSize: 12, fontWeight: 600,
              background: active ? accentColor : "transparent",
              color: active ? (f.id === "amber" ? "#fff" : "#fff") : T.textMuted,
              transition: "all 0.15s",
            }}>{f.label}</button>
          );
        })}
      </div>

      {/* SLA Table */}
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                <th style={{ ...thStyle, width: 24, paddingRight: 4 }} />
                <th style={thStyle}>Case</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Product / Amount</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Days in Stage</th>
                <th style={{ ...thStyle, textAlign: "center" }}>SLA (d)</th>
                <th style={thStyle}>Next Milestone</th>
                <th style={thStyle}>Handler</th>
                <th style={{ ...thStyle, textAlign: "right", paddingRight: 16 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => {
                const rs = RAG[c.rag];
                const pct = c.sla ? Math.min((c.days / c.sla.days) * 100, 100) : 0;
                const rowBg = i % 2 === 0 ? "#fff" : "#FAFAFA";
                return (
                  <tr key={c.id}
                    style={{ background: rowBg, transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}
                    onClick={() => onOpenCase?.(c)}>
                    {/* RAG dot */}
                    <td style={{ ...tdStyle, paddingRight: 0, paddingLeft: 16, width: 24 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: rs.color, boxShadow: `0 0 0 3px ${rs.bg}`,
                      }} />
                    </td>
                    {/* Case ID */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: T.primary, fontFamily: "monospace", fontSize: 11 }}>{c.id}</span>
                    </td>
                    {/* Customer */}
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{c.names}</td>
                    {/* Product / Amount */}
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{c.product}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{c.amount}</div>
                    </td>
                    {/* Status badge */}
                    <td style={tdStyle}><StatusBadge status={c.status} /></td>
                    {/* Days in stage + progress bar */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: rs.color, fontSize: 15 }}>
                        {c.days < 1 ? "<1" : c.days}
                      </div>
                      {c.sla && (
                        <div style={{ width: 56, height: 4, borderRadius: 2, background: T.borderLight, margin: "4px auto 0" }}>
                          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: rs.color }} />
                        </div>
                      )}
                    </td>
                    {/* SLA limit */}
                    <td style={{ ...tdStyle, textAlign: "center", color: T.textMuted, fontWeight: 600 }}>
                      {c.sla ? c.sla.days : "—"}
                    </td>
                    {/* Milestone */}
                    <td style={{ ...tdStyle, fontSize: 11, color: T.textMuted }}>{c.sla?.milestone ?? "—"}</td>
                    {/* Handler */}
                    <td style={{ ...tdStyle, fontSize: 11 }}>
                      {c.opsHandler ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.opsHandler.name}</div>
                          {c.uwHandler && <div style={{ color: T.textMuted }}>UW: {c.uwHandler.name}</div>}
                        </div>
                      ) : "—"}
                    </td>
                    {/* Action */}
                    <td style={{ ...tdStyle, textAlign: "right", paddingRight: 16 }} onClick={e => e.stopPropagation()}>
                      {c.rag === "red" ? (
                        <Btn small danger onClick={() => onOpenCase?.(c)}>Escalate →</Btn>
                      ) : (
                        <Btn small primary onClick={() => onOpenCase?.(c)}>Open →</Btn>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>No cases in this category.</div>
          )}
        </div>
      </Card>

      {/* Team Utilization */}
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: T.text }}>Team Utilization</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

        {/* Ops */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>Operations</div>
          {(TEAM_MEMBERS.ops || []).map(m => {
            const count = assignmentCounts[m.id] || 0;
            const pct = Math.min((count / m.capacity) * 100, 100);
            const color = pct >= 90 ? T.danger : pct >= 70 ? T.warning : T.success;
            return (
              <div key={m.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color, fontWeight: 700 }}>{count}/{m.capacity}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: T.borderLight }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{m.specialism.join(", ")}</div>
              </div>
            );
          })}
        </Card>

        {/* Underwriting */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>Underwriting</div>
          {(TEAM_MEMBERS.underwriters || []).map(m => {
            const count = assignmentCounts[m.id] || 0;
            const pct = Math.min((count / m.capacity) * 100, 100);
            const color = pct >= 90 ? T.danger : pct >= 70 ? T.warning : T.success;
            return (
              <div key={m.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "monospace", background: T.primaryLight, color: T.primary, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>{m.mandate}</span>
                    <span style={{ color, fontWeight: 700 }}>{count}/{m.capacity}</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: T.borderLight }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{m.specialism.join(", ")}</div>
              </div>
            );
          })}
        </Card>

        {/* Conveyancers */}
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>Conveyancers</div>
          {(TEAM_MEMBERS.solicitors || []).map(m => {
            const count = assignmentCounts[m.id] ?? m.active;
            const pct = Math.min((count / m.capacity) * 100, 100);
            const color = pct >= 90 ? T.danger : pct >= 70 ? T.warning : T.success;
            return (
              <div key={m.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color, fontWeight: 700 }}>{count}/{m.capacity}</span>
                </div>
                <div style={{ height: 5, borderRadius: 2, background: T.borderLight }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: color, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </Card>

      </div>
    </div>
  );
}
