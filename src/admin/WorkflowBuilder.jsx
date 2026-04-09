import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const CHAINS = [
  { id: 1, name: "Standard Residential <£500k", nodes: [
    { label: "L1 Underwriter", threshold: "£500k max" },
    { label: "Auto-approve", threshold: "Auto" },
  ]},
  { id: 2, name: "Residential £500k–£1M", nodes: [
    { label: "L1 Underwriter", threshold: "£500k–£1M" },
    { label: "L2 Senior UW", threshold: "£1M max" },
    { label: "Approve", threshold: "Final" },
  ]},
  { id: 3, name: "Residential >£1M", nodes: [
    { label: "L1 UW", threshold: "£1M+" },
    { label: "L2 Senior UW", threshold: "£2M max" },
    { label: "Credit Committee", threshold: "Unlimited" },
    { label: "Approve", threshold: "Final" },
  ]},
  { id: 4, name: "BTL / Specialist", nodes: [
    { label: "Specialist UW", threshold: "BTL/Specialist" },
    { label: "Credit Committee", threshold: "All values" },
    { label: "Approve", threshold: "Final" },
  ]},
];

const RULES = [
  { id: 1, name: "Auto-assign BTL", condition: "Product type = BTL", action: "Route to Specialist UW Team", priority: 1, active: true },
  { id: 2, name: "High Value Escalation", condition: "Amount > £750,000", action: "Flag for senior review", priority: 2, active: true },
  { id: 3, name: "Broker Quality Gate", condition: "Broker score < 70", action: "Add manual doc review step", priority: 3, active: true },
  { id: 4, name: "First-Time Buyer Flag", condition: "Applicant type = FTB", action: "Add affordability deep-check", priority: 4, active: true },
  { id: 5, name: "Overseas Income", condition: "Income source = Overseas", action: "Route to specialist team", priority: 5, active: true },
  { id: 6, name: "Adverse Credit Referral", condition: "Credit score < 600", action: "Auto-refer to manual UW", priority: 2, active: true },
  { id: 7, name: "Self-Employed Extra Docs", condition: "Employment = Self-employed", action: "Request 3yr SA302s", priority: 3, active: false },
  { id: 8, name: "Late-Night Submission Hold", condition: "Submitted after 20:00", action: "Queue for morning review", priority: 6, active: false },
];

const AUTOMATIONS = [
  { id: 1, icon: "clock", name: "Rate Expiry Reminder", trigger: "90 days before rate end", action: "Send retention email", firedToday: 12, active: true },
  { id: 2, icon: "file", name: "Auto-Chase Documents", trigger: "Docs outstanding > 3 days", action: "Send broker reminder", firedToday: 4, active: true },
  { id: 3, icon: "alert", name: "SLA Breach Alert", trigger: "Case in stage > SLA target", action: "Escalate to manager", firedToday: 2, active: true },
  { id: 4, icon: "send", name: "Offer Letter Auto-Send", trigger: "Case approved + conditions met", action: "Generate & email offer", firedToday: 6, active: true },
  { id: 5, icon: "bell", name: "Valuation Chase", trigger: "Valuation not received > 5 days", action: "Chase valuation provider", firedToday: 1, active: true },
  { id: 6, icon: "lock", name: "Rate Lock Notification", trigger: "Rate locked for case", action: "Notify broker & applicant", firedToday: 3, active: false },
];

const ESCALATIONS = [
  { id: "HX-2741", customer: "James Thornton", reason: "SLA breach — underwriting > 48hrs", escalatedBy: "System", time: "2 hours ago", assignedTo: "Sarah Mitchell", status: "Open" },
  { id: "HX-2738", customer: "Priya Sharma", reason: "Adverse credit — requires Credit Committee", escalatedBy: "Tom Davies (L1 UW)", time: "4 hours ago", assignedTo: "Credit Committee", status: "In Progress" },
  { id: "HX-2735", customer: "Robert Chen", reason: "Valuation dispute — customer challenge", escalatedBy: "Ops Team", time: "6 hours ago", assignedTo: "David Park", status: "Open" },
];

const tabStyle = (active) => ({
  padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
  background: active ? T.primary : T.card, color: active ? "#fff" : T.textSecondary,
  border: `1px solid ${active ? T.primary : T.border}`,
});

const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

function WorkflowBuilder() {
  const [tab, setTab] = useState("Approval Chains");
  const tabs = ["Approval Chains", "Routing Rules", "Automations", "Escalations"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Workflow Builder</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Define case routing, approval chains, and automation rules</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Active Workflows" value="6" sub="configured" color={T.primary} />
        <KPICard label="Rules Configured" value="24" sub="routing & logic" color={T.accent} />
        <KPICard label="Auto-Actions / Day" value="142" sub="avg last 7 days" color={T.success} />
        <KPICard label="Escalations Today" value="3" sub="open cases" color={T.danger} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map(t => <div key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t}</div>)}
      </div>

      {tab === "Approval Chains" && <ApprovalChainsTab />}
      {tab === "Routing Rules" && <RoutingRulesTab />}
      {tab === "Automations" && <AutomationsTab />}
      {tab === "Escalations" && <EscalationsTab />}
    </div>
  );
}

function ApprovalChainsTab() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn primary iconNode={Ico.plus(16)}>Add Chain</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CHAINS.map(chain => (
          <Card key={chain.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{chain.name}</div>
              <Btn small icon="settings">Edit</Btn>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0" }}>
              {/* Start node */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 70 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.primaryLight, border: `2px solid ${T.primary}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>{Ico.file(16)}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, textAlign: "center" }}>Submit</div>
              </div>
              {chain.nodes.map((node, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: 40, height: 2, background: T.accent }} />
                  <div style={{ color: T.accent, marginRight: -4, fontSize: 12 }}>{"▶"}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: i === chain.nodes.length - 1 ? T.successBg : T.card,
                      border: `2px solid ${i === chain.nodes.length - 1 ? T.success : T.accent}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: i === chain.nodes.length - 1 ? T.success : T.accent,
                    }}>
                      {i === chain.nodes.length - 1 ? Ico.check(18) : Ico.user(16)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginTop: 4, textAlign: "center", maxWidth: 100 }}>{node.label}</div>
                    <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>{node.threshold}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RoutingRulesTab() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn primary iconNode={Ico.plus(16)}>Add Rule</Btn>
      </div>
      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
          <thead>
            <tr>
              <th style={thStyle}>Rule Name</th>
              <th style={thStyle}>Condition</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {RULES.map(r => (
              <tr key={r.id}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                <td style={tdStyle}>{r.condition}</td>
                <td style={tdStyle}>{r.action}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span style={{ background: T.primaryLight, color: T.primary, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>P{r.priority}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    background: r.active ? T.successBg : T.borderLight,
                    color: r.active ? T.success : T.textMuted,
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5,
                  }}>{r.active ? "Active" : "Disabled"}</span>
                </td>
                <td style={tdStyle}><Btn small ghost icon="settings">Edit</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AutomationsTab() {
  const [autos, setAutos] = useState(AUTOMATIONS);
  const toggleAuto = (id) => setAutos(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
      {autos.map(a => (
        <Card key={a.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
                {Ico[a.icon]?.(18)}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{a.name}</div>
            </div>
            <div onClick={() => toggleAuto(a.id)} style={{
              width: 40, height: 22, borderRadius: 11, cursor: "pointer",
              background: a.active ? T.success : T.borderLight, position: "relative", transition: "background 0.2s",
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute",
                top: 3, left: a.active ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Trigger:</span> {a.trigger}
          </div>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 10 }}>
            <span style={{ fontWeight: 600 }}>Action:</span> {a.action}
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
            {Ico.zap(12)} Fired {a.firedToday} times today
          </div>
        </Card>
      ))}
    </div>
  );
}

function EscalationsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ESCALATIONS.map(e => (
        <Card key={e.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{e.id}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{e.customer}</span>
                <span style={{
                  background: e.status === "Open" ? T.dangerBg : T.warningBg,
                  color: e.status === "Open" ? T.danger : T.warning,
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                }}>{e.status}</span>
              </div>
              <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 4 }}>{e.reason}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textMuted }}>
                <span>Escalated by: {e.escalatedBy}</span>
                <span>{Ico.clock(12)} {e.time}</span>
                <span>Assigned to: {e.assignedTo}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small primary>Resolve</Btn>
              <Btn small icon="assign">Re-assign</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default WorkflowBuilder;
