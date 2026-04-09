import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const enquiries = [
  { id: "ENQ-001", broker: "Watson & Partners", scenario: "3-bed semi, employed, £70k income", amount: 350000, ltv: 72, aiResult: "Eligible", status: "DIP Submitted", squad: "ST/TW/JM" },
  { id: "ENQ-002", broker: "Apex Mortgages", scenario: "BTL, 2-bed flat, portfolio landlord", amount: 220000, ltv: 75, aiResult: "Eligible", status: "Sent to Broker", squad: "ST/TW/AH" },
  { id: "ENQ-003", broker: "Prime Financial", scenario: "Self-employed, 2yr accounts", amount: 480000, ltv: 85, aiResult: "Conditional", status: "Under Review", squad: "ST/LC/JM" },
  { id: "ENQ-004", broker: "Watson & Partners", scenario: "First time buyer, Help to Buy", amount: 180000, ltv: 95, aiResult: "Ineligible", status: "Criteria Not Met", squad: "—" },
  { id: "ENQ-005", broker: "Direct Broker Ltd", scenario: "Remortgage, 4-bed detached", amount: 520000, ltv: 65, aiResult: "Eligible", status: "New", squad: "Pending" },
  { id: "ENQ-006", broker: "Apex Mortgages", scenario: "Shared ownership, 40% share", amount: 128000, ltv: 90, aiResult: "Eligible", status: "Application", squad: "ST/TW/JM" },
  { id: "ENQ-007", broker: "Prime Financial", scenario: "Non-standard construction", amount: 290000, ltv: 78, aiResult: "Conditional", status: "Awaiting UW", squad: "ST/LC/AH" },
  { id: "ENQ-008", broker: "Direct Broker Ltd", scenario: "Interest only, retirement plan", amount: 340000, ltv: 70, aiResult: "Conditional", status: "New", squad: "Pending" },
];

const brokers = [
  { name: "Watson & Partners", cases: 12, quality: 92, lastContact: "2 Apr 2026" },
  { name: "Apex Mortgages", cases: 8, quality: 84, lastContact: "31 Mar 2026" },
  { name: "Prime Financial", cases: 5, quality: 71, lastContact: "28 Mar 2026" },
  { name: "Direct Broker Ltd", cases: 3, quality: 88, lastContact: "4 Apr 2026" },
];

const leaderboard = [
  { name: "Sarah Thompson", pipeline: "£3.8M", enquiries: 12, current: true },
  { name: "Mike Chen", pipeline: "£2.9M", enquiries: 9, current: false },
  { name: "Rachel Adams", pipeline: "£4.1M", enquiries: 14, current: false },
  { name: "David Park", pipeline: "£1.6M", enquiries: 5, current: false },
];

const meetings = [
  { day: "Tue", time: "10am", desc: "Watson & Partners — Product update" },
  { day: "Wed", time: "2pm", desc: "New broker onboarding — Apex" },
  { day: "Thu", time: "11am", desc: "Prime Financial — Pipeline review" },
  { day: "Fri", time: "9am", desc: "Direct Broker Ltd — Introductory visit" },
];

const aiResultStyle = (result) => {
  if (result === "Eligible") return { background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` };
  if (result === "Conditional") return { background: T.warningBg, color: "#92400E", border: `1px solid ${T.warningBorder}` };
  return { background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` };
};

function BDMDashboard({ onNewEnquiry, onOpenEnquiry }) {
  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {Ico.user(24)}
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Good morning, Sarah</h1>
        </div>
        <p style={{ fontSize: 14, color: T.textMuted, margin: 0, marginLeft: 34 }}>Business Development Dashboard</p>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Enquiries This Month" value="12" color={T.primary} />
        <KPICard label="Conversion Rate" value="42%" color={T.accent} />
        <KPICard label="Pipeline Value" value="£3.8M" color={T.primary} />
        <KPICard label="Broker Meetings This Week" value="4" color={T.warning} />
        <KPICard label="Active Squads" value="6" color="#7C3AED" />
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left: Recent Enquiries */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <Card noPad>
            <div style={{ padding: "18px 24px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {Ico.file(18)}
                <span style={{ fontSize: 16, fontWeight: 700 }}>Recent Enquiries</span>
              </div>
              <Btn primary small icon="plus" onClick={onNewEnquiry}>New Enquiry</Btn>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    {["Enquiry ID", "Broker", "Customer Scenario", "Amount", "LTV", "AI Result", "Status", "Squad"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((e) => (
                    <tr key={e.id} onClick={() => onOpenEnquiry?.(e)} style={{ cursor: "pointer", borderBottom: `1px solid ${T.borderLight}`, transition: "background 0.1s" }}
                      onMouseEnter={ev => ev.currentTarget.style.background = T.primaryLight}
                      onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: T.primary }}>{e.id}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{e.broker}</td>
                      <td style={{ padding: "10px 14px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.scenario}</td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>£{e.amount.toLocaleString()}</td>
                      <td style={{ padding: "10px 14px" }}>{e.ltv}%</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ ...aiResultStyle(e.aiResult), padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{e.aiResult}</span>
                      </td>
                      <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>{e.status}</td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: T.textMuted }}>{e.squad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, minWidth: 280 }}>
          {/* My Broker Portfolio */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.users(18)}
              <span style={{ fontSize: 15, fontWeight: 700 }}>My Broker Portfolio</span>
            </div>
            {brokers.map((b) => (
              <div key={b.name} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
                  <span style={{ fontSize: 11, color: T.textMuted }}>{b.cases} cases YTD</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: T.textMuted, minWidth: 50 }}>Quality</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                    <div style={{ width: `${b.quality}%`, height: "100%", borderRadius: 3, background: b.quality >= 85 ? T.success : b.quality >= 75 ? T.warning : T.danger }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: b.quality >= 85 ? T.success : b.quality >= 75 ? "#92400E" : T.danger }}>{b.quality}%</span>
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>Last contact: {b.lastContact}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small ghost icon="clock">Schedule Visit</Btn>
                  <Btn small ghost icon="messages">Log Call</Btn>
                </div>
              </div>
            ))}
          </Card>

          {/* Team Leaderboard */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.chart(18)}
              <span style={{ fontSize: 15, fontWeight: 700 }}>Team Leaderboard</span>
            </div>
            {leaderboard
              .sort((a, b) => parseFloat(b.pipeline.replace(/[^\d.]/g, "")) - parseFloat(a.pipeline.replace(/[^\d.]/g, "")))
              .map((m, i) => (
                <div key={m.name} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, marginBottom: 6,
                  background: m.current ? T.primaryLight : "transparent",
                  border: m.current ? `1px solid ${T.primary}` : "1px solid transparent",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.textMuted, minWidth: 20 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: m.current ? T.primary : T.text }}>{m.name}{m.current && <span style={{ fontSize: 10, marginLeft: 6, color: T.accent }}>(You)</span>}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{m.pipeline} pipeline &middot; {m.enquiries} enquiries</div>
                  </div>
                </div>
              ))}
          </Card>

          {/* This Week */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ico.clock(18)}
              <span style={{ fontSize: 15, fontWeight: 700 }}>This Week</span>
            </div>
            {meetings.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < meetings.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ minWidth: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>{m.day}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{m.time}</div>
                </div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BDMDashboard;
