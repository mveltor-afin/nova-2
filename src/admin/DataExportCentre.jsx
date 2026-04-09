import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── data ── */
const DATA_SOURCES = ["Pipeline Cases", "Customers", "Mortgage Accounts", "Savings Accounts", "Payments", "Documents", "Audit Trail", "User Activity"];

const SCHEDULED = [
  { name: "Daily Pipeline Extract", format: "CSV", schedule: "Daily 06:00", recipients: "ops-team@afinbank.com", lastRun: "06 Apr 2026 06:00", status: "Active" },
  { name: "Weekly MI Data", format: "Excel", schedule: "Monday 08:00", recipients: "finance@afinbank.com", lastRun: "31 Mar 2026 08:00", status: "Active" },
  { name: "Monthly Regulatory Extract", format: "CSV", schedule: "1st of month", recipients: "compliance@afinbank.com", lastRun: "01 Apr 2026 07:00", status: "Active" },
  { name: "Broker Performance Report", format: "Excel", schedule: "Friday 17:00", recipients: "broker-mgmt@afinbank.com", lastRun: "04 Apr 2026 17:00", status: "Active" },
  { name: "Daily Arrears Snapshot", format: "CSV", schedule: "Daily 07:30", recipients: "collections@afinbank.com", lastRun: "06 Apr 2026 07:30", status: "Paused" },
  { name: "Quarterly Board Pack Data", format: "Excel", schedule: "1st Jan/Apr/Jul/Oct", recipients: "board@afinbank.com", lastRun: "01 Apr 2026 06:00", status: "Active" },
];

const HISTORY = [
  { date: "06 Apr 2026 09:14", user: "Sarah Jenkins", source: "Pipeline Cases", format: "CSV", records: "1,247", size: "2.3 MB", duration: "4s" },
  { date: "06 Apr 2026 07:30", user: "System", source: "Mortgage Accounts", format: "CSV", records: "3,891", size: "8.1 MB", duration: "12s" },
  { date: "06 Apr 2026 06:00", user: "System", source: "Pipeline Cases", format: "CSV", records: "1,245", size: "2.3 MB", duration: "4s" },
  { date: "05 Apr 2026 16:22", user: "Mark Davies", source: "Customers", format: "Excel", records: "5,420", size: "14.2 MB", duration: "18s" },
  { date: "05 Apr 2026 14:10", user: "Emma Clark", source: "Audit Trail", format: "JSON", records: "12,890", size: "6.7 MB", duration: "8s" },
  { date: "05 Apr 2026 11:45", user: "Sarah Jenkins", source: "Documents", format: "CSV", records: "892", size: "1.1 MB", duration: "3s" },
  { date: "04 Apr 2026 17:00", user: "System", source: "Pipeline Cases", format: "Excel", records: "1,240", size: "3.8 MB", duration: "6s" },
  { date: "04 Apr 2026 15:33", user: "Tom Wilson", source: "Payments", format: "CSV", records: "8,456", size: "4.2 MB", duration: "9s" },
  { date: "04 Apr 2026 12:00", user: "Anna Price", source: "Savings Accounts", format: "Excel", records: "2,104", size: "5.6 MB", duration: "7s" },
  { date: "03 Apr 2026 18:15", user: "Mark Davies", source: "User Activity", format: "JSON", records: "24,501", size: "11.3 MB", duration: "22s" },
  { date: "03 Apr 2026 09:00", user: "System", source: "Mortgage Accounts", format: "CSV", records: "3,884", size: "8.0 MB", duration: "11s" },
  { date: "02 Apr 2026 16:45", user: "Emma Clark", source: "Pipeline Cases", format: "CSV", records: "1,238", size: "2.3 MB", duration: "4s" },
  { date: "02 Apr 2026 10:20", user: "Sarah Jenkins", source: "Customers", format: "Excel", records: "5,412", size: "14.1 MB", duration: "17s" },
  { date: "01 Apr 2026 07:00", user: "System", source: "Pipeline Cases", format: "CSV", records: "1,232", size: "2.2 MB", duration: "4s" },
  { date: "01 Apr 2026 06:00", user: "System", source: "Mortgage Accounts", format: "CSV", records: "3,880", size: "7.9 MB", duration: "11s" },
];

const RETENTION = [
  { category: "Customer Records", period: "7 years after relationship end", status: "Compliant" },
  { category: "Transaction Data", period: "7 years", status: "Compliant" },
  { category: "KYC Documents", period: "5 years after relationship end", status: "Compliant" },
  { category: "Communications", period: "3 years", status: "Compliant" },
  { category: "Audit Logs", period: "Indefinite", status: "Compliant" },
  { category: "Session Data", period: "90 days", status: "Compliant" },
];

/* ── styles ── */
const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };
const tabStyle = (active) => ({
  padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: "8px 8px 0 0",
  background: active ? T.card : "transparent", color: active ? T.primary : T.textMuted,
  border: active ? `1px solid ${T.border}` : "1px solid transparent", borderBottom: active ? `1px solid ${T.card}` : "none",
  marginBottom: -1,
});

function DataExportCentre() {
  const [tab, setTab] = useState("Quick Export");
  const [source, setSource] = useState("Pipeline Cases");
  const [format, setFormat] = useState("CSV");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-04-06");
  const [previewed, setPreviewed] = useState(false);
  const [exported, setExported] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const tabs = ["Quick Export", "Scheduled", "History", "Retention Policy"];

  const filteredHistory = HISTORY.filter((h) =>
    !historySearch || h.source.toLowerCase().includes(historySearch.toLowerCase()) || h.user.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.text }}>{Ico.download(22)} Data Export Centre</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 32 }}>Export, schedule, and manage data extracts</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Exports This Month" value="24" color={T.primary} />
        <KPICard label="Scheduled" value="6" color={T.accent} />
        <KPICard label="Data Retention" value="7 years" color={T.warning} />
        <KPICard label="Last Export" value="Today 09:14" color={T.success} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
        {tabs.map((t) => <div key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {/* ── Quick Export ── */}
      {tab === "Quick Export" && (
        <Card>
          <div style={{ maxWidth: 600 }}>
            {/* Data source */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Data Source</label>
              <select value={source} onChange={(e) => { setSource(e.target.value); setPreviewed(false); setExported(false); }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
                {DATA_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Format */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Format</label>
              <div style={{ display: "flex", gap: 12 }}>
                {["CSV", "Excel", "JSON"].map((f) => (
                  <label key={f} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
                    <input type="radio" name="format" checked={format === f} onChange={() => { setFormat(f); setPreviewed(false); setExported(false); }}
                      style={{ accentColor: T.primary }} />
                    {f}
                  </label>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>From</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPreviewed(false); setExported(false); }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>To</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPreviewed(false); setExported(false); }}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Status (optional)</label>
                <select style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
                  <option value="">All</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Closed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Product Type (optional)</label>
                <select style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
                  <option value="">All</option>
                  <option>Fixed Rate</option>
                  <option>Tracker</option>
                  <option>Variable</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Broker (optional)</label>
                <select style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
                  <option value="">All</option>
                  <option>Sterling Mortgages</option>
                  <option>Horizon Finance</option>
                  <option>Blue Sky Lending</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Btn onClick={() => setPreviewed(true)} icon="search">Preview</Btn>
              <Btn primary onClick={() => setExported(true)} icon="download" disabled={!previewed}>Export Now</Btn>
            </div>

            {previewed && (
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 9, background: T.primaryLight, fontSize: 13, color: T.primary, fontWeight: 600 }}>
                {Ico.file(16)} &nbsp;1,247 records match your criteria
              </div>
            )}

            {exported && (
              <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 9, background: T.successBg, fontSize: 13, color: T.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {Ico.check(16)} Export complete &mdash; {source}.{format.toLowerCase()} downloaded successfully
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Scheduled ── */}
      {tab === "Scheduled" && (
        <Card noPad>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Format", "Schedule", "Recipients", "Last Run", "Status", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SCHEDULED.map((s) => (
                  <tr key={s.name}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{s.name}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.primaryLight, color: T.primary }}>{s.format}</span>
                    </td>
                    <td style={tdStyle}>{s.schedule}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{s.recipients}</td>
                    <td style={tdStyle}>{s.lastRun}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.status === "Active" ? T.successBg : T.warningBg, color: s.status === "Active" ? T.success : T.warning }}>{s.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small icon="settings">Edit</Btn>
                        <Btn small>{s.status === "Active" ? "Pause" : "Resume"}</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── History ── */}
      {tab === "History" && (
        <div>
          <div style={{ marginBottom: 16, maxWidth: 360, position: "relative" }}>
            <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted }}>{Ico.search(16)}</div>
            <input placeholder="Search by source or user..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" }} />
          </div>
          <Card noPad>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Date", "User", "Data Source", "Format", "Records", "Size", "Duration", ""].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{h.date}</td>
                      <td style={tdStyle}>{h.user}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{h.source}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.primaryLight, color: T.primary }}>{h.format}</span>
                      </td>
                      <td style={tdStyle}>{h.records}</td>
                      <td style={tdStyle}>{h.size}</td>
                      <td style={tdStyle}>{h.duration}</td>
                      <td style={tdStyle}><Btn small icon="download">Download</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Retention Policy ── */}
      {tab === "Retention Policy" && (
        <div>
          <Card noPad style={{ marginBottom: 20 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Data Category", "Retention Period", "Compliance Status"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RETENTION.map((r) => (
                    <tr key={r.category}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.category}</td>
                      <td style={tdStyle}>{r.period}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.successBg, color: T.success }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.success }}>{Ico.shield(18)}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.success }}>All retention policies are being met &#10003;</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Last compliance check: 06 Apr 2026 00:00</div>
              </div>
            </div>
            <div style={{ padding: "12px 16px", borderRadius: 9, background: T.warningBg, fontSize: 13, color: T.warning, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.clock(16)} Next data purge: 15 Apr 2026 &mdash; 142 session records eligible for deletion
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DataExportCentre;
