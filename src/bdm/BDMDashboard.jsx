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

const meetings = [
  { day: "Tue", date: "9 Apr", time: "10:00", broker: "Watson & Partners", type: "Product update", colour: T.primary },
  { day: "Wed", date: "10 Apr", time: "14:00", broker: "Apex Mortgages", type: "New broker onboarding", colour: T.accent },
  { day: "Thu", date: "11 Apr", time: "11:00", broker: "Prime Financial", type: "Pipeline review", colour: T.warning },
  { day: "Fri", date: "12 Apr", time: "09:00", broker: "Direct Broker Ltd", type: "Introductory visit", colour: "#8B5CF6" },
];

const aiResultStyle = (result) => {
  if (result === "Eligible") return { background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` };
  if (result === "Conditional") return { background: T.warningBg, color: "#92400E", border: `1px solid ${T.warningBorder}` };
  return { background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` };
};

function BDMDashboard({ onNewEnquiry, onOpenEnquiry }) {
  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Good morning, Sarah</h1>
          </div>
          <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>Business Development Dashboard · 12 enquiries this month</p>
        </div>
        <Btn primary icon="plus" onClick={onNewEnquiry} style={{ fontSize: 14, padding: "10px 18px" }}>New Enquiry</Btn>
      </div>

      {/* ── Today's Focus AI Card ── */}
      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${T.primaryLight}, ${T.successBg})`, border: `1px solid ${T.primary}30`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            {Ico.sparkle(20)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Today's Focus · Nova AI</div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.5 }}>
              <strong>4 enquiries</strong> awaiting broker response · <strong>1 meeting in 2 hours</strong> with Watson & Partners · Prime Financial hasn't logged a case in 12 days — <strong style={{ color: T.warning }}>schedule a check-in</strong>.
            </div>
          </div>
          <Btn small ghost icon="arrow">View Actions</Btn>
        </div>
      </Card>

      {/* ── This Week Meetings (horizontal scroll) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.clock(16)}
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textTransform: "uppercase", letterSpacing: 0.5 }}>This Week</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>· {meetings.length} meetings</span>
          </div>
          <span style={{ fontSize: 12, color: T.primary, cursor: "pointer", fontWeight: 600 }}>View calendar →</span>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
          {meetings.map((m, i) => (
            <div key={i} style={{
              flexShrink: 0, minWidth: 240, padding: 14, background: T.card, borderRadius: 12,
              border: `1px solid ${T.border}`, borderLeft: `4px solid ${m.colour}`, cursor: "pointer", transition: "transform 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${m.colour}15`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: m.colour, textTransform: "uppercase" }}>{m.day}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: m.colour }}>{m.date.split(" ")[0]}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{m.time}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{m.date}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{m.broker}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{m.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Enquiries This Month" value="12" sub="+3 vs last month" color={T.primary} />
        <KPICard label="Conversion Rate" value="42%" sub="+5% vs last month" color={T.accent} />
        <KPICard label="Pipeline Value" value="£3.8M" sub="across 12 enquiries" color={T.primary} />
        <KPICard label="Active Squads" value="6" sub="3 awaiting decision" color="#7C3AED" />
      </div>

      {/* ── Recent Enquiries (full width) ── */}
      <Card noPad>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.file(18)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Recent Enquiries</span>
            <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>· {enquiries.length} total</span>
          </div>
          <span style={{ fontSize: 12, color: T.primary, cursor: "pointer", fontWeight: 600 }}>View all →</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {["Enquiry ID", "Broker", "Customer Scenario", "Amount", "LTV", "AI Result", "Status", "Application"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} onClick={() => onOpenEnquiry?.(e)} style={{ cursor: "pointer", borderBottom: `1px solid ${T.borderLight}`, transition: "background 0.1s" }}
                  onMouseEnter={ev => ev.currentTarget.style.background = T.primaryLight}
                  onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: T.primary }}>{e.id}</td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>{e.broker}</td>
                  <td style={{ padding: "13px 16px" }}>{e.scenario}</td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap", fontWeight: 600 }}>£{(e.amount / 1000).toFixed(0)}k</td>
                  <td style={{ padding: "13px 16px" }}>{e.ltv}%</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...aiResultStyle(e.aiResult), padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{e.aiResult}</span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>{e.status}</td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    {e.id === "ENQ-001" ? <span style={{ fontWeight:600, color:T.primary, cursor:"pointer" }}>AFN-2026-00142</span>
                     : e.id === "ENQ-006" ? <span style={{ fontWeight:600, color:T.primary, cursor:"pointer" }}>AFN-2026-00201</span>
                     : <span style={{ color:T.textMuted }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default BDMDashboard;
