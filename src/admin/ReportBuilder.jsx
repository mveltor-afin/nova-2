import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const savedReports = [
  { name: "Weekly Pipeline Summary", creator: "Sarah Chen", lastRun: "07 Apr", schedule: "Mon 8am", recipients: 4, type: "Weekly" },
  { name: "Monthly Completions", creator: "Priya Patel", lastRun: "01 Apr", schedule: "1st of month", recipients: 3, type: "Monthly" },
  { name: "Broker Quality Report", creator: "Tom Walker", lastRun: "07 Apr", schedule: "Fri 6pm", recipients: 2, type: "Weekly" },
  { name: "Arrears Ageing", creator: "Sarah Chen", lastRun: "08 Apr", schedule: "Daily 7am", recipients: 5, type: "Daily" },
  { name: "Portfolio LTV Distribution", creator: "Priya Patel", lastRun: "01 Apr", schedule: "1st of month", recipients: 3, type: "Monthly" },
  { name: "AI Model Performance", creator: "Sarah Chen", lastRun: "07 Apr", schedule: "Mon 9am", recipients: 2, type: "Weekly" },
  { name: "Consumer Duty Dashboard", creator: "Risk Team", lastRun: "01 Apr", schedule: "Quarterly", recipients: 6, type: "Quarterly" },
  { name: "DIP Conversion Funnel", creator: "Sales", lastRun: "07 Apr", schedule: "Mon 8am", recipients: 4, type: "Weekly" },
];

const scheduledReports = [
  { name: "Weekly Pipeline Summary", schedule: "Every Monday 8:00 AM", nextRun: "14 Apr 08:00", recipients: 4, lastRun: "07 Apr 08:00", status: "Active" },
  { name: "Arrears Ageing", schedule: "Daily 7:00 AM", nextRun: "09 Apr 07:00", recipients: 5, lastRun: "08 Apr 07:00", status: "Active" },
  { name: "Monthly Completions", schedule: "1st of month 9:00 AM", nextRun: "01 May 09:00", recipients: 3, lastRun: "01 Apr 09:00", status: "Active" },
  { name: "Consumer Duty Dashboard", schedule: "Quarterly (Jan, Apr, Jul, Oct)", nextRun: "01 Jul 09:00", recipients: 6, lastRun: "01 Apr 09:00", status: "Paused" },
];

const metricGroups = {
  Pipeline: ["Cases by stage", "Conversion rate", "Avg processing time", "SLA compliance"],
  Portfolio: ["Total book", "LTV distribution", "Arrears summary", "Rate expiry schedule"],
  Broker: ["Volume by broker", "Quality scores", "Decline reasons"],
  Customer: ["Segment breakdown", "NPS scores", "Product holdings", "Churn risk"],
  AI: ["Automation rate", "Model accuracy", "Actions generated"],
};

const vizOptions = [
  { value: "table", label: "Table", icon: "file" },
  { value: "bar", label: "Bar Chart", icon: "chart" },
  { value: "line", label: "Line Chart", icon: "chart" },
  { value: "kpi", label: "KPI Cards", icon: "dashboard" },
];

const schedBadgeColor = (type) => {
  const map = {
    Daily: { bg: "#DBEAFE", color: "#1E40AF" },
    Weekly: { bg: "#D1FAE5", color: "#065F46" },
    Monthly: { bg: "#EDE9FE", color: "#5B21B6" },
    Quarterly: { bg: "#FEF3C7", color: "#92400E" },
  };
  return map[type] || map.Weekly;
};

const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text };

export default function ReportBuilder() {
  const [tab, setTab] = useState("My Reports");
  const tabs = ["My Reports", "Create New", "Scheduled"];

  // Create New state
  const [reportName, setReportName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [vizType, setVizType] = useState("table");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterBroker, setFilterBroker] = useState("");
  const [filterPersona, setFilterPersona] = useState("");
  const [scheduleType, setScheduleType] = useState("One-time");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const toggleMetric = (m) => {
    setSelectedMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.navy }}>
          {Ico.chart(24)} Report Builder
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Create custom reports and schedule delivery</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Saved Reports" value="8" color={T.primary} sub="2 created this week" />
        <KPICard label="Scheduled" value="4" color={T.accent} sub="3 active, 1 paused" />
        <KPICard label="Generated This Week" value="12" color={T.success} sub="+4 from last week" />
        <KPICard label="Avg Build Time" value="3.2s" color={T.warning} sub="Optimised queries" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${T.borderLight}` }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: "none", background: "none", fontFamily: T.font,
            color: tab === t ? T.primary : T.textMuted,
            borderBottom: tab === t ? `2px solid ${T.primary}` : "2px solid transparent",
            marginBottom: -2,
          }}>{t}</button>
        ))}
      </div>

      {/* My Reports Tab */}
      {tab === "My Reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {savedReports.map((r, i) => {
            const sc = schedBadgeColor(r.type);
            return (
              <Card key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, lineHeight: 1.3 }}>{r.name}</div>
                  <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{r.type}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Created by {r.creator}</div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.clock(12)} Last run: {r.lastRun}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textSecondary, marginBottom: 14 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.bell(12)} {r.schedule}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.users(12)} {r.recipients} recipients</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small primary icon="zap">Run Now</Btn>
                  <Btn small ghost>Edit</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create New Tab */}
      {tab === "Create New" && (
        <div>
          {/* Progress Steps */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div onClick={() => setCurrentStep(s)} style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: currentStep >= s ? T.primary : T.borderLight, color: currentStep >= s ? "#fff" : T.textMuted,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                }}>{s}</div>
                {s < 5 && <div style={{ width: 48, height: 2, background: currentStep > s ? T.primary : T.borderLight }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Report Name */}
          {currentStep === 1 && (
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Step 1: Report Name</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Report Name</label>
                <input value={reportName} onChange={e => setReportName(e.target.value)} placeholder="Enter report name..." style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Btn primary onClick={() => setCurrentStep(2)}>Next {Ico.arrow(14)}</Btn>
              </div>
            </Card>
          )}

          {/* Step 2: Select Metrics */}
          {currentStep === 2 && (
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Step 2: Select Metrics</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 20 }}>
                {Object.entries(metricGroups).map(([group, metrics]) => (
                  <div key={group}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{group}</div>
                    {metrics.map(m => (
                      <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 8, cursor: "pointer", color: T.text }}>
                        <input type="checkbox" checked={selectedMetrics.includes(m)} onChange={() => toggleMetric(m)} style={{ accentColor: T.primary }} />
                        {m}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>{selectedMetrics.length} metrics selected</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Btn ghost onClick={() => setCurrentStep(1)}>{Ico.arrowLeft(14)} Back</Btn>
                <Btn primary onClick={() => setCurrentStep(3)}>Next {Ico.arrow(14)}</Btn>
              </div>
            </Card>
          )}

          {/* Step 3: Visualisation */}
          {currentStep === 3 && (
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Step 3: Choose Visualisation</div>
              <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                {vizOptions.map(v => (
                  <button key={v.value} onClick={() => setVizType(v.value)} style={{
                    flex: 1, padding: "18px 16px", borderRadius: 12, cursor: "pointer",
                    border: vizType === v.value ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                    background: vizType === v.value ? T.primaryLight : T.card,
                    color: vizType === v.value ? T.primary : T.textMuted,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    fontFamily: T.font, fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                  }}>
                    {Ico[v.icon]?.(22)}
                    {v.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Btn ghost onClick={() => setCurrentStep(2)}>{Ico.arrowLeft(14)} Back</Btn>
                <Btn primary onClick={() => setCurrentStep(4)}>Next {Ico.arrow(14)}</Btn>
              </div>
            </Card>
          )}

          {/* Step 4: Filters */}
          {currentStep === 4 && (
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Step 4: Filters</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Date From</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Date To</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Product Type</label>
                  <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font }}>
                    <option value="">All Products</option>
                    <option value="residential">Residential</option>
                    <option value="btl">Buy-to-Let</option>
                    <option value="commercial">Commercial</option>
                    <option value="bridging">Bridging</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Broker</label>
                  <select value={filterBroker} onChange={e => setFilterBroker(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font }}>
                    <option value="">All Brokers</option>
                    <option value="nationwide">Nationwide Brokers</option>
                    <option value="london">London & Partners</option>
                    <option value="sterling">Sterling Finance</option>
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Persona</label>
                  <select value={filterPersona} onChange={e => setFilterPersona(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font }}>
                    <option value="">All Personas</option>
                    <option value="broker">Broker</option>
                    <option value="underwriter">Underwriter</option>
                    <option value="ops">Ops</option>
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                    <option value="risk">Risk Analyst</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Btn ghost onClick={() => setCurrentStep(3)}>{Ico.arrowLeft(14)} Back</Btn>
                <Btn primary onClick={() => setCurrentStep(5)}>Next {Ico.arrow(14)}</Btn>
              </div>
            </Card>
          )}

          {/* Step 5: Schedule */}
          {currentStep === 5 && (
            <Card>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Step 5: Schedule</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Frequency</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["One-time", "Daily", "Weekly", "Monthly"].map(f => (
                    <button key={f} onClick={() => setScheduleType(f)} style={{
                      padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontFamily: T.font,
                      border: scheduleType === f ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                      background: scheduleType === f ? T.primaryLight : T.card,
                      color: scheduleType === f ? T.primary : T.textMuted,
                      fontSize: 12, fontWeight: 600,
                    }}>{f}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Recipients (email)</label>
                  <input type="text" value={scheduleRecipients} onChange={e => setScheduleRecipients(e.target.value)} placeholder="user@helix.bank, team@helix.bank" style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Btn ghost onClick={() => setCurrentStep(4)}>{Ico.arrowLeft(14)} Back</Btn>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn onClick={() => setShowPreview(true)} icon="eye">Generate Preview</Btn>
                  <Btn primary icon="check">Save Report</Btn>
                </div>
              </div>

              {/* Mock Preview */}
              {showPreview && (
                <Card style={{ background: "#FAFAF7", marginTop: 16, border: `1px solid ${T.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: T.navy }}>Report Preview</div>
                    <button onClick={() => setShowPreview(false)} style={{ border: "none", background: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(18)}</button>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{reportName || "Untitled Report"}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
                    {selectedMetrics.length} metrics | {vizType} | {scheduleType}
                  </div>

                  {vizType === "kpi" && (
                    <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                      {(selectedMetrics.length > 0 ? selectedMetrics.slice(0, 4) : ["Cases by stage", "Conversion rate", "Total book", "SLA compliance"]).map((m, i) => (
                        <KPICard key={i} label={m} value={["142", "68%", "£2.4B", "94%"][i] || "—"} color={[T.primary, T.success, T.accent, T.warning][i]} />
                      ))}
                    </div>
                  )}

                  {vizType === "bar" && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 120, padding: "16px 0", marginBottom: 16 }}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
                        <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                          <div style={{ width: "100%", height: [65, 80, 55, 95, 72][i], background: `linear-gradient(180deg, ${T.primary}, ${T.primaryDark})`, borderRadius: "6px 6px 0 0", opacity: 0.8 }} />
                          <span style={{ fontSize: 11, color: T.textMuted }}>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {vizType === "line" && (
                    <div style={{ height: 120, background: T.card, borderRadius: 10, border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                      <svg width="300" height="80" viewBox="0 0 300 80">
                        <polyline fill="none" stroke={T.primary} strokeWidth="2" points="10,60 60,45 110,50 160,25 210,30 260,15 290,20" />
                        <polyline fill="none" stroke={T.accent} strokeWidth="2" strokeDasharray="4" points="10,65 60,55 110,58 160,40 210,42 260,35 290,38" />
                      </svg>
                    </div>
                  )}

                  {vizType === "table" && (
                    <div style={{ overflowX: "auto", marginBottom: 16 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: T.card }}>
                            <th style={{ ...thStyle, fontSize: 10 }}>Metric</th>
                            <th style={{ ...thStyle, fontSize: 10 }}>Current</th>
                            <th style={{ ...thStyle, fontSize: 10 }}>Previous</th>
                            <th style={{ ...thStyle, fontSize: 10 }}>Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedMetrics.length > 0 ? selectedMetrics.slice(0, 5) : ["Cases by stage", "Conversion rate", "Total book"]).map((m, i) => (
                            <tr key={i}>
                              <td style={{ ...tdStyle, fontSize: 12, fontWeight: 600 }}>{m}</td>
                              <td style={{ ...tdStyle, fontSize: 12 }}>{["142", "68%", "£2.4B", "94%", "3.2s"][i] || "—"}</td>
                              <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{["128", "65%", "£2.3B", "91%", "3.5s"][i] || "—"}</td>
                              <td style={{ ...tdStyle, fontSize: 12, color: T.success, fontWeight: 600 }}>{["+11%", "+3%", "+4%", "+3%", "-8%"][i] || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: T.textMuted }}>Generated at {new Date().toLocaleString("en-GB")} | Preview mode</div>
                </Card>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {tab === "Scheduled" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Scheduled Reports</div>
          <Card noPad>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAF7" }}>
                    <th style={thStyle}>Report Name</th>
                    <th style={thStyle}>Schedule</th>
                    <th style={thStyle}>Next Run</th>
                    <th style={thStyle}>Recipients</th>
                    <th style={thStyle}>Last Run</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map((r, i) => (
                    <tr key={i} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>{r.schedule}</td>
                      <td style={{ ...tdStyle, fontSize: 12 }}>{r.nextRun}</td>
                      <td style={tdStyle}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.users(14)} {r.recipients}</span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{r.lastRun}</td>
                      <td style={tdStyle}>
                        <span style={{
                          background: r.status === "Active" ? T.successBg : T.warningBg,
                          color: r.status === "Active" ? T.success : T.warning,
                          padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        }}>{r.status}</span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn small ghost icon="zap">Run Now</Btn>
                          <Btn small ghost>Edit</Btn>
                          <Btn small ghost>{r.status === "Active" ? "Pause" : "Resume"}</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
