import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

// ─── Firm ───────────────────────────────────────────────────────────────────
const FIRM = {
  trading: "Watson & Partners",
  fullName: "Watson & Partners Mortgage Solutions Ltd",
  fca: "123456",
  fcaType: "Directly Authorised",
  address: "12 High Street, Bristol, BS1 4AA",
  formed: "14 Mar 2019",
};

// ─── Organisation relationship ──────────────────────────────────────────────
const ORG = {
  type: "Network",        // Packager | Network | Club
  name: "Primis Mortgage Network",
  fca: "823651",
  tier: "Gold",
  joined: "01 Jan 2020",
  procFeeBase: "0.35%",
  procFeeBonus: "+0.05% (Gold tier)",
  agreementRef: "PMN-2020-0142",
  renewalDate: "31 Dec 2026",
  panel: ["Barclays", "HSBC", "NatWest", "Santander", "Halifax", "Leeds BS", "Nationwide", "TSB", "Accord", "Virgin Money"],
  contact: {
    name: "Claire Henderson",
    role: "Network Development Manager",
    email: "c.henderson@primis.co.uk",
    phone: "0800 321 0987",
  },
  compliance: {
    status: "Compliant",
    lastReview: "15 Jan 2026",
    nextReview: "15 Jan 2027",
    notes: "Annual review completed. No outstanding actions.",
  },
};

// ─── Team ────────────────────────────────────────────────────────────────────
const INITIAL_TEAM = [
  {
    id: "ADV-001", name: "John Watson", email: "j.watson@watsonpartners.co.uk",
    fca: "123456", fcaAuth: "CeMAP + DA", role: "Principal", status: "Active",
    casesMTD: 8,  caseLimit: null,  volumeMTD: 2800000, volumeLimit: null,
    joined: "14 Mar 2019", mfa: true,  lastActive: "Today, 10:32",
  },
  {
    id: "ADV-002", name: "Sarah Mitchell", email: "s.mitchell@watsonpartners.co.uk",
    fca: "234567", fcaAuth: "CeMAP Level 3", role: "Adviser", status: "Active",
    casesMTD: 6, caseLimit: 10, volumeMTD: 2100000, volumeLimit: 3000000,
    joined: "12 Jan 2021", mfa: true,  lastActive: "Today, 09:15",
  },
  {
    id: "ADV-003", name: "Mark Davies", email: "m.davies@watsonpartners.co.uk",
    fca: "345678", fcaAuth: "CeMAP Level 3", role: "Adviser", status: "Active",
    casesMTD: 4, caseLimit: 8,  volumeMTD: 1400000, volumeLimit: 2500000,
    joined: "03 Jun 2022", mfa: false, lastActive: "Yesterday",
  },
  {
    id: "ADV-004", name: "Emma Clarke", email: "e.clarke@watsonpartners.co.uk",
    fca: null, fcaAuth: "CeMAP In Progress", role: "Para Planner", status: "Active",
    casesMTD: 2, caseLimit: 5, volumeMTD: 600000, volumeLimit: 1500000,
    joined: "15 Sep 2023", mfa: true, lastActive: "Today, 08:44",
  },
  {
    id: "ADV-005", name: "Tom O'Brien", email: "t.obrien@watsonpartners.co.uk",
    fca: "456789", fcaAuth: "CeMAP Level 3", role: "Adviser", status: "Suspended",
    casesMTD: 0, caseLimit: 6, volumeMTD: 0, volumeLimit: 2000000,
    joined: "20 Feb 2023", mfa: false, lastActive: "3 days ago",
    suspendReason: "Pending CPD completion — overdue 14 days",
  },
  {
    id: "ADV-006", name: "Rachel Patel", email: "r.patel@watsonpartners.co.uk",
    fca: null, fcaAuth: "—", role: "Admin", status: "Invited",
    casesMTD: 0, caseLimit: 0, volumeMTD: 0, volumeLimit: null,
    joined: null, mfa: false, lastActive: "—", invitedDate: "19 Apr 2026",
  },
];

// ─── Activity log ─────────────────────────────────────────────────────────
const ACTIVITY = [
  { ts: "Today 10:45", actor: "Sarah Mitchell", action: "Submitted application", detail: "AFN-2026-00188 — £385,000 — Mr & Mrs Brown", type: "case" },
  { ts: "Today 09:30", actor: "John Watson",    action: "Added team member",      detail: "Rachel Patel invited as Admin",                type: "team" },
  { ts: "Yesterday 16:12", actor: "Mark Davies",    action: "DIP approved",           detail: "AFN-2026-00181 — £210,000 — Mr Singh",         type: "case" },
  { ts: "Yesterday 14:00", actor: "System",         action: "Limit alert",             detail: "Sarah Mitchell at 60% of monthly case limit",   type: "alert" },
  { ts: "18 Apr 2026",     actor: "John Watson",    action: "Suspended adviser",       detail: "Tom O'Brien — CPD overdue",                    type: "team" },
  { ts: "15 Apr 2026",     actor: "Emma Clarke",    action: "Submitted application",   detail: "AFN-2026-00171 — £155,000 — Ms Rodriguez",     type: "case" },
];

// ─── Shared table styles ──────────────────────────────────────────────────
const thSt = {
  padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
  color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4,
  borderBottom: `2px solid ${T.border}`,
};
const tdSt = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };
const tabSt = (active) => ({
  padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: "8px 8px 0 0",
  background: active ? T.card : "transparent",
  color: active ? T.primary : T.textMuted,
  border: active ? `1px solid ${T.border}` : "1px solid transparent",
  borderBottom: active ? `1px solid ${T.card}` : "none",
  marginBottom: -1,
  userSelect: "none",
});

// ─── Helpers ──────────────────────────────────────────────────────────────
const fmtVol  = (n) => n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(1)}M` : `£${(n / 1_000).toFixed(0)}k`;
const pctUsed = (val, limit) => limit ? Math.min(Math.round((val / limit) * 100), 100) : 0;
const limitBarColor = (p) => p >= 90 ? T.danger : p >= 70 ? T.warning : T.success;

const statusChip = (s) => ({
  Active:    { bg: T.successBg, text: T.success },
  Suspended: { bg: T.dangerBg,  text: T.danger  },
  Invited:   { bg: T.warningBg, text: "#B45309" },
}[s] || { bg: T.bg, text: T.textMuted });

// ─── Progress bar for case / volume limits ─────────────────────────────────
function LimitBar({ val, limit, label }) {
  if (!limit) return <span style={{ fontSize: 12, color: T.textMuted }}>No limit</span>;
  const p = pctUsed(val, limit);
  const c = limitBarColor(p);
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 3 }}>
        <span>{label ? label(val) : val}</span>
        <span>{label ? label(limit) : limit} max</span>
      </div>
      <div style={{ background: T.border, borderRadius: 4, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: 4, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

// ─── Settings toggle ──────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width: 40, height: 22, borderRadius: 11, flexShrink: 0, cursor: "pointer", position: "relative",
      background: on ? T.success : T.border, transition: "background 0.2s",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 2, left: on ? 20 : 2, transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const BLANK_FORM = { name: "", email: "", role: "Adviser", fcaAuth: "", fca: "", caseLimit: "", volumeLimit: "", mfa: true };
const ORG_TYPES  = ["Packager", "Network", "Club"];
const MEMBER_ROLES = ["Principal", "Adviser", "Para Planner", "Admin", "Trainee Adviser"];
const PRODUCT_TYPES = ["Residential", "BTL", "Commercial", "Bridging", "Development", "Shared Ownership"];
const DEFAULT_ENABLED_PRODUCTS = ["Residential", "BTL"];

export default function BrokerAdminDashboard() {
  const [tab, setTab]           = useState("Overview");
  const [team, setTeam]         = useState(INITIAL_TEAM);
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(BLANK_FORM);
  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [settings, setSettings] = useState({ mfaRequired: true, principalSignoff: false, limitAlerts: true });
  const [enabledProducts, setEnabledProducts] = useState(DEFAULT_ENABLED_PRODUCTS);

  const tabs = ["Overview", "My Team", "Organisation", "Settings"];

  const activeTeam  = team.filter(m => m.status === "Active");
  const totalCases  = activeTeam.reduce((s, m) => s + m.casesMTD, 0);
  const totalVolume = activeTeam.reduce((s, m) => s + m.volumeMTD, 0);

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(BLANK_FORM);
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name, email: member.email || "", role: member.role,
      fcaAuth: member.fcaAuth === "—" ? "" : member.fcaAuth,
      fca: member.fca || "",
      caseLimit: member.caseLimit != null ? String(member.caseLimit) : "",
      volumeLimit: member.volumeLimit != null ? String(member.volumeLimit / 1000) : "",
      mfa: member.mfa,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(BLANK_FORM); };

  const handleSave = () => {
    const patch = {
      name:        form.name,
      email:       form.email,
      role:        form.role,
      fcaAuth:     form.fcaAuth || "—",
      fca:         form.fca || null,
      caseLimit:   form.caseLimit  ? parseInt(form.caseLimit,  10)       : null,
      volumeLimit: form.volumeLimit ? parseInt(form.volumeLimit, 10) * 1000 : null,
      mfa:         form.mfa,
    };
    if (editing) {
      setTeam(t => t.map(m => m.id === editing.id ? { ...m, ...patch } : m));
    } else {
      const newId = `ADV-${String(team.length + 1).padStart(3, "0")}`;
      setTeam(t => [...t, {
        id: newId, ...patch,
        casesMTD: 0, volumeMTD: 0,
        joined: null, status: "Invited", lastActive: "—", invitedDate: "Today",
      }]);
    }
    closeModal();
  };

  const toggleSuspend = (member) => {
    setTeam(t => t.map(m => m.id === member.id ? {
      ...m,
      status: m.status === "Active" ? "Suspended" : "Active",
      suspendReason: m.status === "Active" ? "Suspended by firm admin" : undefined,
    } : m));
    setConfirmSuspend(null);
  };

  const toggleProduct = (pt) =>
    setEnabledProducts(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 64px", fontFamily: T.font }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.navy, margin: 0 }}>{FIRM.trading}</h1>
              <span style={{ background: "#EDE9FE", color: "#6D28D9", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.4 }}>
                {ORG.type}
              </span>
              <span style={{ background: T.successBg, color: T.success, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                Active
              </span>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: T.textMuted }}>FCA <strong style={{ color: T.text }}>{FIRM.fca}</strong></span>
              <span style={{ fontSize: 13, color: T.textMuted }}>{FIRM.fcaType}</span>
              <span style={{ fontSize: 13, color: T.textMuted }}>
                {ORG.name} · <strong style={{ color: "#6D28D9" }}>{ORG.tier} tier</strong>
              </span>
              <span style={{ fontSize: 13, color: T.textMuted }}>{FIRM.address}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ghost icon="download" small>Export Report</Btn>
            <Btn primary icon="assign" small onClick={openAdd}>Add Team Member</Btn>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <KPICard label="Active Advisers"  value={activeTeam.length}  sub={`${team.filter(m => m.status === "Suspended").length} suspended · ${team.filter(m => m.status === "Invited").length} invited`} color={T.primary} />
        <KPICard label="Cases This Month" value={totalCases}          sub="Across all active advisers"     color={T.accent}  />
        <KPICard label="Volume MTD"       value={fmtVol(totalVolume)} sub="All active advisers"            color={T.success} />
        <KPICard label="Organisation"     value={ORG.tier + " Tier"}  sub={`${ORG.name} · ${ORG.procFeeBase} proc`} color="#6D28D9" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}` }}>
        {tabs.map(t => <div key={t} style={tabSt(tab === t)} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {/* ── Tab panel ── */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 8px 8px 8px", padding: 24 }}>

        {/* ════════════ OVERVIEW ════════════ */}
        {tab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
            {/* Activity feed */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Recent Activity</div>
              {ACTIVITY.map((a, i) => {
                const typeColor = { case: T.primary, team: "#6D28D9", alert: T.warning }[a.type] || T.textMuted;
                const typeBg    = { case: T.primaryLight, team: "#EDE9FE", alert: T.warningBg }[a.type]   || T.bg;
                return (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: typeBg, display: "flex", alignItems: "center", justifyContent: "center", color: typeColor, flexShrink: 0 }}>
                      {a.type === "case" ? Ico.loans(14) : a.type === "alert" ? Ico.alert(14) : Ico.users(14)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{a.action}</div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{a.detail}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{a.actor} · {a.ts}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Alerts */}
              <div style={{ background: T.warningBg, border: `1px solid ${T.warningBorder}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  {Ico.alert(15)} Alerts
                </div>
                <div style={{ fontSize: 12, color: "#92400E", marginBottom: 8, lineHeight: 1.5 }}>
                  <strong>Tom O'Brien</strong> — CPD overdue 14 days. Adviser suspended.
                </div>
                <div style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
                  <strong>Sarah Mitchell</strong> — 60% monthly case limit (6/10 cases).
                </div>
              </div>

              {/* Org summary */}
              <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6D28D9", marginBottom: 10 }}>Organisation</div>
                <div style={{ fontSize: 12, color: "#5B21B6", marginBottom: 4, fontWeight: 600 }}>{ORG.name}</div>
                {[
                  ["Type", `${ORG.type} · ${ORG.tier} Tier`],
                  ["Proc fee", `${ORG.procFeeBase} ${ORG.procFeeBonus}`],
                  ["Panel", `${ORG.panel.length} lenders`],
                  ["Renewal", ORG.renewalDate],
                ].map(([l, v]) => (
                  <div key={l} style={{ fontSize: 12, color: "#6D28D9", marginBottom: 3 }}>
                    <span style={{ opacity: 0.7 }}>{l}: </span>{v}
                  </div>
                ))}
              </div>

              {/* FCA */}
              <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.success, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  {Ico.shield(15)} FCA Status
                </div>
                {[
                  ["Firm", `Active — ${FIRM.fca} (${FIRM.fcaType})`],
                  ["Last review", ORG.compliance.lastReview],
                  ["Next review", ORG.compliance.nextReview],
                ].map(([l, v]) => (
                  <div key={l} style={{ fontSize: 12, color: "#065F46", marginBottom: 3 }}>
                    <strong>{l}:</strong> {v}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MY TEAM ════════════ */}
        {tab === "My Team" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Team Members</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                  {team.length} members · {activeTeam.length} active
                </div>
              </div>
              <Btn primary icon="assign" small onClick={openAdd}>Add Member</Btn>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    <th style={thSt}>Name / Role</th>
                    <th style={thSt}>FCA Auth</th>
                    <th style={thSt}>Cases MTD</th>
                    <th style={thSt}>Volume MTD</th>
                    <th style={thSt}>Status</th>
                    <th style={thSt}>Last Active</th>
                    <th style={{ ...thSt, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map(member => {
                    const chip = statusChip(member.status);
                    return (
                      <tr key={member.id} style={{ background: member.status === "Suspended" ? "#FFF8F8" : "transparent" }}>
                        <td style={tdSt}>
                          <div style={{ fontWeight: 600, color: T.text }}>{member.name}</div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{member.role}</div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>{member.email}</div>
                          {member.status === "Suspended" && member.suspendReason && (
                            <div style={{ fontSize: 11, color: T.danger, marginTop: 3, fontWeight: 500 }}>
                              ⚠ {member.suspendReason}
                            </div>
                          )}
                          {member.status === "Invited" && (
                            <div style={{ fontSize: 11, color: "#B45309", marginTop: 3 }}>
                              Invited {member.invitedDate}
                            </div>
                          )}
                        </td>
                        <td style={tdSt}>
                          <div style={{ fontSize: 12 }}>{member.fcaAuth}</div>
                          {member.fca && <div style={{ fontSize: 11, color: T.textMuted }}>#{member.fca}</div>}
                        </td>
                        <td style={tdSt}>
                          <LimitBar val={member.casesMTD} limit={member.caseLimit} />
                        </td>
                        <td style={tdSt}>
                          <LimitBar val={member.volumeMTD} limit={member.volumeLimit} label={fmtVol} />
                        </td>
                        <td style={tdSt}>
                          <span style={{ background: chip.bg, color: chip.text, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                            {member.status}
                          </span>
                          {member.mfa && (
                            <div style={{ fontSize: 10, color: T.success, marginTop: 3 }}>MFA ✓</div>
                          )}
                        </td>
                        <td style={{ ...tdSt, fontSize: 12, color: T.textMuted }}>{member.lastActive}</td>
                        <td style={{ ...tdSt, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <Btn ghost small onClick={() => openEdit(member)}>Edit</Btn>
                            {member.role !== "Principal" && member.status !== "Invited" && (
                              <button
                                onClick={() => setConfirmSuspend(member)}
                                style={{
                                  padding: "7px 14px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                  background: member.status === "Suspended" ? T.successBg : T.dangerBg,
                                  color: member.status === "Suspended" ? T.success : T.danger,
                                  border: `1px solid ${member.status === "Suspended" ? T.successBorder : T.dangerBorder}`,
                                  fontFamily: T.font,
                                }}>
                                {member.status === "Suspended" ? "Reinstate" : "Suspend"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Limit legend */}
            <div style={{ marginTop: 20, padding: 14, background: T.bg, borderRadius: 8, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Limit bars:</div>
              {[["< 70%", T.success], ["70–90%", T.warning], ["> 90%", T.danger]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                  {label}
                </div>
              ))}
              <div style={{ fontSize: 12, color: T.textMuted, marginLeft: "auto" }}>
                Limits reset on the 1st of each month
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ORGANISATION ════════════ */}
        {tab === "Organisation" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Left: relationship + panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Relationship Details</div>

              {/* Main org card */}
              <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                    {ORG.type[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#4C1D95" }}>{ORG.name}</div>
                    <div style={{ fontSize: 12, color: "#7C3AED" }}>{ORG.type} · FCA {ORG.fca}</div>
                  </div>
                  <span style={{ background: "#DDD6FE", color: "#6D28D9", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                    {ORG.tier} Tier
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {[
                    ["Member since",  ORG.joined],
                    ["Agreement ref", ORG.agreementRef],
                    ["Renewal date",  ORG.renewalDate],
                    ["Base proc fee", ORG.procFeeBase],
                    ["Tier bonus",    ORG.procFeeBonus],
                    ["Panel lenders", `${ORG.panel.length} lenders`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#4C1D95" }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel access */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Lender Panel Access</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {ORG.panel.map(lender => (
                    <span key={lender} style={{ background: T.primaryLight, color: T.primary, fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 6 }}>
                      {lender}
                    </span>
                  ))}
                </div>
              </div>

              {/* About this relationship */}
              <div style={{ background: T.bg, borderRadius: 10, padding: 16, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>About this relationship</div>
                <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7 }}>
                  As a <strong>{ORG.type}</strong> member, {FIRM.trading} operates as an Appointed Representative (AR) under {ORG.name}'s FCA permissions.
                  Your <strong>{ORG.tier}</strong> tier status provides enhanced proc fees and priority access to specialist lenders on the panel.
                </div>
              </div>
            </div>

            {/* Right: contact + compliance */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Key Contact</div>

              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary, fontWeight: 700, fontSize: 18 }}>
                    {ORG.contact.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{ORG.contact.name}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{ORG.contact.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.text }}>
                    {Ico.send(14)} {ORG.contact.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.text }}>
                    {Ico.bell(14)} {ORG.contact.phone}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn ghost small>Send Message</Btn>
                  <Btn primary small>Request Support</Btn>
                </div>
              </div>

              {/* Compliance status */}
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Compliance Status</div>
              <div style={{ background: T.successBg, border: `1px solid ${T.successBorder}`, borderRadius: 10, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {Ico.shield(16)}
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>{ORG.compliance.status}</span>
                </div>
                {[
                  ["Last review", ORG.compliance.lastReview],
                  ["Next review", ORG.compliance.nextReview],
                  ["Notes",       ORG.compliance.notes],
                ].map(([l, v]) => (
                  <div key={l} style={{ marginBottom: 7 }}>
                    <span style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{l} </span>
                    <span style={{ fontSize: 12, color: T.text }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Org type explainer */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ORG_TYPES.map(t => (
                  <div key={t} style={{
                    padding: "12px 16px", borderRadius: 8,
                    background: t === ORG.type ? "#F5F3FF" : T.bg,
                    border: `1px solid ${t === ORG.type ? "#DDD6FE" : T.borderLight}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: t === ORG.type ? 700 : 500, color: t === ORG.type ? "#6D28D9" : T.text }}>{t}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                        {{ Packager: "Specialist case packaging + lender access", Network: "AR network with shared FCA permissions", Club: "Volume aggregator — enhanced proc fees" }[t]}
                      </div>
                    </div>
                    {t === ORG.type && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#6D28D9", textTransform: "uppercase", letterSpacing: 0.5 }}>Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ SETTINGS ════════════ */}
        {tab === "Settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {/* Default limits */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Default Application Limits</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Applied to new team members on invitation. Can be overridden per individual in the My Team tab.
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Input label="Monthly case limit (number of cases)"   value="10"         onChange={() => {}} placeholder="e.g. 10"        hint="Leave blank to apply no limit" />
                <Input label="Monthly volume limit"                    value="3,000,000"  onChange={() => {}} placeholder="e.g. 3000000"   hint="Maximum £ lending volume per calendar month" prefix="£" />
                <Input label="Quarterly case limit"                    value="25"         onChange={() => {}} placeholder="e.g. 25"        hint="Leave blank to apply no limit" />
                <Input label="Quarterly volume limit"                  value="8,000,000"  onChange={() => {}} placeholder="e.g. 8000000"   hint="Maximum £ lending volume per quarter" prefix="£" />
              </div>
              <Btn primary>Save Default Limits</Btn>
            </div>

            {/* Firm settings */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Firm Settings</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 24 }}>Platform-wide configuration for {FIRM.trading}.</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Toggle rows */}
                {[
                  {
                    key: "mfaRequired", label: "Require MFA for all team members",
                    sub: "New members must enable 2FA before accessing the platform.",
                  },
                  {
                    key: "principalSignoff", label: "Require principal sign-off on submissions",
                    sub: "Applications need approval from the principal broker before submission.",
                  },
                  {
                    key: "limitAlerts", label: "Limit threshold alerts",
                    sub: "Notify admin when any team member reaches 70% of their limit.",
                  },
                ].map(({ key, label, sub }) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card }}>
                    <div style={{ flex: 1, paddingRight: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>{sub}</div>
                    </div>
                    <Toggle on={settings[key]} onToggle={() => setSettings(s => ({ ...s, [key]: !s[key] }))} />
                  </div>
                ))}

                {/* Product restrictions */}
                <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${T.border}`, background: T.card }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>Permitted product types</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>
                    Restrict which product types advisers can submit applications for.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {PRODUCT_TYPES.map(pt => {
                      const on = enabledProducts.includes(pt);
                      return (
                        <div key={pt} onClick={() => toggleProduct(pt)} style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                          borderRadius: 7, cursor: "pointer",
                          background: on ? T.primaryLight : T.bg,
                          border: `1px solid ${on ? T.primary : T.border}`,
                        }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: 3, border: `2px solid ${on ? T.primary : T.border}`,
                            background: on ? T.primary : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {on && <div style={{ color: "#fff", fontSize: 10, fontWeight: 700, lineHeight: 1 }}>✓</div>}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 500, color: on ? T.primary : T.textMuted }}>{pt}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Btn primary small>Save Restrictions</Btn>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT TEAM MEMBER MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: T.card, borderRadius: 16, padding: 32, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.24)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.navy }}>
                {editing ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <span onClick={closeModal} style={{ cursor: "pointer", color: T.textMuted, display: "flex" }}>{Ico.x(20)}</span>
            </div>

            {/* Name + email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Full name"     value={form.name}  onChange={val => setForm(f => ({ ...f, name:  val }))} placeholder="e.g. Jane Smith"      required />
              <Input label="Email address" value={form.email} onChange={val => setForm(f => ({ ...f, email: val }))} placeholder="jane@firm.co.uk"       required />
            </div>

            {/* Role + FCA auth */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Select label="Role"              value={form.role}    onChange={val => setForm(f => ({ ...f, role:    val }))} options={MEMBER_ROLES} />
              <Input  label="FCA qualification" value={form.fcaAuth} onChange={val => setForm(f => ({ ...f, fcaAuth: val }))} placeholder="e.g. CeMAP Level 3" />
            </div>

            {/* FCA number */}
            <Input
              label="FCA register number (if applicable)"
              value={form.fca}
              onChange={val => setForm(f => ({ ...f, fca: val }))}
              placeholder="e.g. 234567"
              hint="Leave blank for para planners and admin staff"
            />

            {/* Application limits */}
            <div style={{ background: T.bg, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Application Limits</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Input
                  label="Monthly case limit"
                  value={form.caseLimit}
                  onChange={val => setForm(f => ({ ...f, caseLimit: val }))}
                  placeholder="e.g. 10"
                  hint="Leave blank for no limit"
                  type="number"
                />
                <Input
                  label="Monthly volume limit (£000s)"
                  value={form.volumeLimit}
                  onChange={val => setForm(f => ({ ...f, volumeLimit: val }))}
                  placeholder="e.g. 3000"
                  hint="Enter in thousands — e.g. 3000 = £3M"
                  type="number"
                />
              </div>
            </div>

            {/* MFA toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <Toggle on={form.mfa} onToggle={() => setForm(f => ({ ...f, mfa: !f.mfa }))} />
              <span style={{ fontSize: 13, color: T.text }}>Require MFA for this member</span>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Btn ghost onClick={closeModal}>Cancel</Btn>
              <Btn primary onClick={handleSave} disabled={!form.name || !form.email}>
                {editing ? "Save Changes" : "Send Invitation"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CONFIRM SUSPEND / REINSTATE MODAL
      ══════════════════════════════════════ */}
      {confirmSuspend && (
        <div
          onClick={() => setConfirmSuspend(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: T.card, borderRadius: 16, padding: 32, maxWidth: 420, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.24)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
                background: confirmSuspend.status === "Suspended" ? T.successBg : T.dangerBg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: confirmSuspend.status === "Suspended" ? T.success : T.danger,
              }}>
                {confirmSuspend.status === "Suspended" ? Ico.check(24) : Ico.alert(24)}
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: T.navy }}>
                {confirmSuspend.status === "Suspended" ? "Reinstate" : "Suspend"} {confirmSuspend.name}?
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
                {confirmSuspend.status === "Suspended"
                  ? "This will restore the adviser's access to submit new applications."
                  : "This will immediately block the adviser from submitting new applications. Existing cases are not affected."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Btn ghost onClick={() => setConfirmSuspend(null)}>Cancel</Btn>
              {confirmSuspend.status === "Suspended"
                ? <Btn primary onClick={() => toggleSuspend(confirmSuspend)}>Reinstate Access</Btn>
                : <button
                    onClick={() => toggleSuspend(confirmSuspend)}
                    style={{ padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", background: T.danger, color: "#fff", border: "none", fontFamily: T.font }}>
                    Suspend Access
                  </button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
