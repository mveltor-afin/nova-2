import React from "react";
import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── mock data ── */
const ARREARS_CASES = [
  { id: "M-002301", customer: "Priya Sharma", arrears: "£2,360", daysInArrears: 18, vulnerability: "None", aiStrategy: "Graduated contact: SMS \u2192 Email \u2192 Call", lastContact: "15 Apr 2026", nextAction: "Personalised email", status: "In Progress" },
  { id: "M-003102", customer: "Sophie Brown", arrears: "£5,160", daysInArrears: 42, vulnerability: "Financial Difficulty", aiStrategy: "Payment plan proposal: \u00A3430/mo over 12 months", lastContact: "12 Apr 2026", nextAction: "Payment plan review call", status: "Plan Proposed" },
  { id: "M-001876", customer: "Robert Hughes", arrears: "£1,890", daysInArrears: 14, vulnerability: "Health", aiStrategy: "Vulnerability protocol: refer to specialist team", lastContact: "16 Apr 2026", nextAction: "Specialist referral", status: "Escalated" },
  { id: "M-003890", customer: "Marcus Williams", arrears: "£12,450", daysInArrears: 192, vulnerability: "None", aiStrategy: "Legal referral recommended (>180 days)", lastContact: "02 Apr 2026", nextAction: "Legal assessment", status: "Legal Review" },
  { id: "M-004012", customer: "Angela Frost", arrears: "£3,780", daysInArrears: 67, vulnerability: "Life Event", aiStrategy: "Payment plan proposal: \u00A3315/mo over 12 months", lastContact: "10 Apr 2026", nextAction: "Collections specialist call", status: "In Progress" },
  { id: "M-004398", customer: "Daniel Osei", arrears: "£890", daysInArrears: 7, vulnerability: "None", aiStrategy: "Graduated contact: SMS \u2192 Email \u2192 Call", lastContact: "16 Apr 2026", nextAction: "SMS reminder", status: "Early Stage" },
];

const AGENT_ACTIONS = [
  { ts: "17 Apr 10:12", action: "Sent SMS reminder to Priya Sharma \u2014 arrears \u00A32,360", status: "Completed" },
  { ts: "17 Apr 09:45", action: "Generated payment plan proposal for Sophie Brown \u2014 \u00A3430/mo \u00D7 12", status: "Pending Approval" },
  { ts: "17 Apr 09:20", action: "Flagged Robert Hughes for vulnerability assessment \u2014 3 missed payments", status: "Escalated" },
  { ts: "16 Apr 16:38", action: "Escalated M-003890 to legal \u2014 180+ days in arrears", status: "Escalated" },
  { ts: "16 Apr 14:15", action: "Scheduled outbound call for Angela Frost \u2014 collections specialist assigned", status: "Completed" },
  { ts: "16 Apr 11:02", action: "Sent automated SMS to Daniel Osei \u2014 first arrears notification", status: "Completed" },
  { ts: "15 Apr 15:30", action: "Recalculated payment plan for Sophie Brown \u2014 adjusted for income change", status: "Completed" },
  { ts: "15 Apr 10:18", action: "Generated arrears summary report for 6 active cases \u2014 sent to collections manager", status: "Completed" },
];

const CONTACT_STRATEGY = [
  { range: "Day 1\u20137", action: "Automated SMS reminder", icon: "send", color: T.success },
  { range: "Day 8\u201314", action: "Personalised email with payment link", icon: "messages", color: T.success },
  { range: "Day 15\u201330", action: "AI-scheduled outbound call", icon: "bot", color: T.warning },
  { range: "Day 31\u201360", action: "Formal letter + payment plan offer", icon: "file", color: T.warning },
  { range: "Day 61\u201390", action: "Collections specialist assigned", icon: "assign", color: T.danger },
  { range: "Day 90+", action: "Legal referral assessment", icon: "shield", color: T.danger },
];

/* ── helpers ── */
const vulnColor = (v) =>
  v === "None" ? T.success : v === "Financial Difficulty" || v === "Health" ? T.danger : T.warning;

const vulnBg = (v) =>
  v === "None" ? T.successBg : v === "Financial Difficulty" || v === "Health" ? T.dangerBg : T.warningBg;

const statusColor = (s) =>
  s === "Completed" || s === "Early Stage" ? T.success :
  s === "In Progress" || s === "Plan Proposed" || s === "Pending Approval" ? T.warning :
  s === "Escalated" || s === "Legal Review" ? T.danger : T.primary;

const statusBg = (s) =>
  s === "Completed" || s === "Early Stage" ? T.successBg :
  s === "In Progress" || s === "Plan Proposed" || s === "Pending Approval" ? T.warningBg :
  s === "Escalated" || s === "Legal Review" ? T.dangerBg : T.primaryLight;

const daysColor = (d) =>
  d > 90 ? T.danger : d > 30 ? T.warning : T.text;

const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}`, verticalAlign: "top" };

export default function CollectionsAgent({ customerId }) {
  const [filter, setFilter] = useState("All");

  const filtered = customerId
    ? ARREARS_CASES.filter(c => c.id === customerId)
    : filter === "All" ? ARREARS_CASES : ARREARS_CASES.filter(c => c.status === filter);

  const totalArrears = "\u00A326,530";

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {Ico.bot(20)}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>AI Collections Agent</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Autonomous arrears management and graduated contact strategy</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>Agent Active</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Cases in Arrears" value="6" sub="2 escalated" color={T.danger} />
        <KPICard label="Total Arrears Value" value={totalArrears} sub="Across all active cases" color={T.warning} />
        <KPICard label="AI Contact Attempts" value="142" sub="This month" color={T.primary} />
        <KPICard label="Recovery Rate" value="73.8%" sub="+6.2% vs last quarter" color={T.success} />
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", "Early Stage", "In Progress", "Plan Proposed", "Escalated", "Legal Review"].map(f => (
          <Btn key={f} small ghost={filter !== f} primary={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Btn>
        ))}
      </div>

      {/* Arrears Cases Table */}
      <Card noPad style={{ marginBottom: 28, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.alert(16)} Arrears Cases
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF7" }}>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Arrears</th>
                <th style={thStyle}>Days in Arrears</th>
                <th style={thStyle}>Vulnerability</th>
                <th style={thStyle}>AI Strategy</th>
                <th style={thStyle}>Last Contact</th>
                <th style={thStyle}>Next Action</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "monospace", fontSize: 12, color: T.primary }}>{c.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{c.customer}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, fontFamily: "monospace", color: T.danger }}>{c.arrears}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: daysColor(c.daysInArrears) }}>{c.daysInArrears}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: vulnBg(c.vulnerability), color: vulnColor(c.vulnerability) }}>
                      {c.vulnerability}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, maxWidth: 260, color: T.textSecondary }}>{c.aiStrategy}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{c.lastContact}</td>
                  <td style={{ ...tdStyle, fontSize: 12, fontWeight: 600 }}>{c.nextAction}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: statusBg(c.status), color: statusColor(c.status), whiteSpace: "nowrap" }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two-column layout: Agent Actions + Contact Strategy */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Agent Actions */}
        <Card noPad>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.zap(16)} Agent Actions
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Autonomous actions taken by the collections agent</div>
          </div>
          <div>
            {AGENT_ACTIONS.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: i < AGENT_ACTIONS.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ minWidth: 90, fontSize: 11, color: T.textMuted, fontFamily: "monospace", paddingTop: 2 }}>{entry.ts}</div>
                <div style={{ flex: 1, fontSize: 13, color: T.text }}>{entry.action}</div>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: statusBg(entry.status), color: statusColor(entry.status), whiteSpace: "nowrap" }}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Strategy */}
        <Card noPad>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.send(16)} Contact Strategy
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Graduated approach to arrears contact</div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {CONTACT_STRATEGY.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < CONTACT_STRATEGY.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                {/* Timeline dot + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 24 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.color, border: `2px solid ${step.color}` }} />
                  {i < CONTACT_STRATEGY.length - 1 && (
                    <div style={{ width: 2, height: 28, background: T.borderLight, marginTop: 2 }} />
                  )}
                </div>
                <div style={{ minWidth: 90 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: step.color }}>{step.range}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ color: step.color }}>{Ico[step.icon]?.(16)}</span>
                  <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{step.action}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
