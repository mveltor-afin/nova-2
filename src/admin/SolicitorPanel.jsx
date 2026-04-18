import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { TEAM_MEMBERS } from "../data/loans";

const solicitors = TEAM_MEMBERS.solicitors;

const FILTER_TABS = ["All", "Residential", "BTL", "Commercial"];

const starDisplay = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("\u2605");
    else if (i === full && half) stars.push("\u00BD");
    else stars.push("\u2606");
  }
  return stars.join("");
};

export default function SolicitorPanel() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [statusOverrides, setStatusOverrides] = useState({});

  const filtered = filter === "All"
    ? solicitors
    : solicitors.filter(s => s.specialism.includes(filter));

  const panelSize = solicitors.length;
  const avgDays = Math.round(solicitors.reduce((a, s) => a + s.avgDays, 0) / panelSize);
  const avgRating = (solicitors.reduce((a, s) => a + s.rating, 0) / panelSize).toFixed(1);
  const totalActive = solicitors.reduce((a, s) => a + s.active, 0);
  const totalCapacity = solicitors.reduce((a, s) => a + s.capacity, 0);
  const utilisation = Math.round((totalActive / totalCapacity) * 100);

  const getStatus = (id) => statusOverrides[id] || "Active";

  const cycleStatus = (id) => {
    const order = ["Active", "Suspended", "Under Review"];
    const current = getStatus(id);
    const next = order[(order.indexOf(current) + 1) % order.length];
    setStatusOverrides(prev => ({ ...prev, [id]: next }));
  };

  const statusColor = (st) => {
    if (st === "Active") return { bg: T.successBg, color: T.success };
    if (st === "Suspended") return { bg: T.dangerBg, color: T.danger };
    return { bg: T.warningBg, color: T.warning };
  };

  return (
    <div style={{ padding: 32, fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        {Ico.shield(22)}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Solicitor Panel Management</h1>
          <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Manage approved conveyancing firms, monitor performance and capacity</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Panel Size" value={panelSize} sub="approved firms" color={T.primary} />
        <KPICard label="Avg Completion" value={`${avgDays}d`} sub="days to complete" color={T.accent} />
        <KPICard label="Avg Rating" value={avgRating} sub="out of 5.0" color={T.warning} />
        <KPICard label="Active Cases" value={totalActive} sub="across panel" color="#6366F1" />
        <KPICard label="Capacity Utilisation" value={`${utilisation}%`} sub={`${totalActive} / ${totalCapacity}`} color={utilisation > 80 ? T.danger : T.success} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)} style={{
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${filter === tab ? T.primary : T.border}`,
            background: filter === tab ? T.primary : T.card, color: filter === tab ? "#fff" : T.text,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
          }}>{tab}</button>
        ))}
      </div>

      {/* Table */}
      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${T.border}` }}>
              {["Firm", "SRA Number", "Specialism", "Active / Capacity", "Avg Days", "Rating", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(sol => {
              const st = getStatus(sol.id);
              const sc = statusColor(st);
              const isExpanded = expanded === sol.id;
              return [
                <tr key={sol.id} style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }} onClick={() => setExpanded(isExpanded ? null : sol.id)}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: T.primary }}>{sol.initials}</div>
                      {sol.firm}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: 12 }}>{sol.sra}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {sol.specialism.map(sp => (
                        <span key={sp} style={{ padding: "2px 8px", borderRadius: 6, background: T.primaryLight, color: T.primary, fontSize: 11, fontWeight: 600 }}>{sp}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontWeight: 700 }}>{sol.active}</span>
                    <span style={{ color: T.textMuted }}> / {sol.capacity}</span>
                    <div style={{ marginTop: 4, height: 4, borderRadius: 2, background: T.borderLight, width: 60 }}>
                      <div style={{ height: 4, borderRadius: 2, background: (sol.active / sol.capacity) > 0.8 ? T.danger : T.success, width: `${(sol.active / sol.capacity) * 100}%` }} />
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                    {sol.avgDays}d
                    {sol.avgDays <= avgDays
                      ? <span style={{ color: T.success, fontSize: 11, marginLeft: 4 }}>({avgDays - sol.avgDays}d faster)</span>
                      : <span style={{ color: T.danger, fontSize: 11, marginLeft: 4 }}>(+{sol.avgDays - avgDays}d)</span>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ color: sol.rating >= 4.5 ? T.success : sol.rating >= 4.0 ? T.warning : T.danger, fontWeight: 700 }}>
                      {starDisplay(sol.rating)}
                    </span>
                    <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600 }}>{sol.rating}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span onClick={(e) => { e.stopPropagation(); cycleStatus(sol.id); }} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: sc.bg, color: sc.color, cursor: "pointer",
                    }}>{st}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Btn small ghost icon="eye" onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : sol.id); }}>View</Btn>
                  </td>
                </tr>,
                isExpanded && (
                  <tr key={sol.id + "-detail"}>
                    <td colSpan={8} style={{ padding: 0, background: "#F9FAFB" }}>
                      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                        {/* Contact Details */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>Contact Details</div>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: T.textMuted }}>Phone: </span>
                            <span style={{ fontWeight: 600 }}>{sol.phone}</span>
                          </div>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: T.textMuted }}>Email: </span>
                            <span style={{ fontWeight: 600 }}>{sol.email}</span>
                          </div>
                          <div style={{ fontSize: 13 }}>
                            <span style={{ color: T.textMuted }}>SRA: </span>
                            <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{sol.sra}</span>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>Performance Metrics</div>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: T.textMuted }}>Avg Days vs Panel: </span>
                            <span style={{ fontWeight: 700, color: sol.avgDays <= avgDays ? T.success : T.danger }}>
                              {sol.avgDays}d vs {avgDays}d avg
                            </span>
                          </div>
                          <div style={{ fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: T.textMuted }}>Rating Trend: </span>
                            <span style={{ fontWeight: 600 }}>{sol.rating} {sol.rating >= 4.5 ? "(Excellent)" : sol.rating >= 4.0 ? "(Good)" : "(Needs Improvement)"}</span>
                          </div>
                          <div style={{ fontSize: 13 }}>
                            <span style={{ color: T.textMuted }}>Utilisation: </span>
                            <span style={{ fontWeight: 600 }}>{Math.round((sol.active / sol.capacity) * 100)}%</span>
                          </div>
                        </div>

                        {/* Specialism & Cases */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 10, letterSpacing: 0.5 }}>Specialisms</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                            {sol.specialism.map(sp => (
                              <span key={sp} style={{ padding: "4px 10px", borderRadius: 8, background: T.primaryLight, color: T.primary, fontSize: 12, fontWeight: 600 }}>{sp}</span>
                            ))}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Active Cases ({sol.active})</div>
                          <div style={{ fontSize: 12, color: T.textMuted }}>
                            {Array.from({ length: Math.min(sol.active, 5) }, (_, i) => (
                              <div key={i} style={{ padding: "3px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                                Case AFN-2026-{String(100 + i).padStart(5, "0")} - In Progress
                              </div>
                            ))}
                            {sol.active > 5 && <div style={{ marginTop: 4, fontStyle: "italic" }}>+{sol.active - 5} more cases</div>}
                          </div>
                        </div>
                      </div>

                      {/* Panel Status Management */}
                      <div style={{ padding: "12px 24px 16px", borderTop: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted }}>Panel Status:</span>
                        {["Active", "Suspended", "Under Review"].map(s => {
                          const active = getStatus(sol.id) === s;
                          const c = statusColor(s);
                          return (
                            <button key={s} onClick={() => setStatusOverrides(prev => ({ ...prev, [sol.id]: s }))} style={{
                              padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                              border: active ? `2px solid ${c.color}` : `1px solid ${T.border}`,
                              background: active ? c.bg : T.card, color: active ? c.color : T.textMuted,
                              fontFamily: T.font,
                            }}>{s}</button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
