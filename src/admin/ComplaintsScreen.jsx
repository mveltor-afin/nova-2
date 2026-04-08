import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const MOCK_COMPLAINTS = [
  { id: "CMP-001", customer: "James Whitfield", category: "Delay", summary: "Mortgage application stuck in underwriting for 6 weeks with no update", assigned: "Sarah Chen", status: "Open", opened: "28 Mar 2026", slaDays: 3, fcaCat: "A1 - Delays", timeline: [
    { date: "28 Mar 2026", note: "Customer called to log complaint about delays" },
    { date: "29 Mar 2026", note: "Assigned to Sarah Chen for investigation" },
    { date: "01 Apr 2026", note: "Underwriting team contacted for status update" },
  ], rootCause: "", resolution: "" },
  { id: "CMP-002", customer: "Priya Patel", category: "Fees", summary: "Early repayment charge not clearly disclosed at point of sale", assigned: "Mark Taylor", status: "In Progress", opened: "22 Mar 2026", slaDays: 8, fcaCat: "A2 - Fees/charges", timeline: [
    { date: "22 Mar 2026", note: "Written complaint received via email" },
    { date: "23 Mar 2026", note: "Acknowledgement letter sent" },
    { date: "25 Mar 2026", note: "Product terms reviewed against KFI provided" },
    { date: "01 Apr 2026", note: "Discrepancy found in fee disclosure document" },
  ], rootCause: "KFI template missing ERC schedule for 5-year fix products", resolution: "" },
  { id: "CMP-003", customer: "David O'Connor", category: "Service", summary: "Unable to reach mortgage advisor for 2 weeks, calls unanswered", assigned: "Lisa Wong", status: "In Progress", opened: "25 Mar 2026", slaDays: 5, fcaCat: "A4 - Service", timeline: [
    { date: "25 Mar 2026", note: "Complaint logged via online portal" },
    { date: "26 Mar 2026", note: "Call logs reviewed - 7 missed calls identified" },
    { date: "28 Mar 2026", note: "Advisor spoken to, capacity issues noted" },
  ], rootCause: "Advisor caseload exceeded 85 active cases", resolution: "" },
  { id: "CMP-004", customer: "Emma Richardson", category: "Product", summary: "Rate switch not applied on agreed date, charged higher rate for 1 month", assigned: "Sarah Chen", status: "Escalated", opened: "15 Mar 2026", slaDays: 14, fcaCat: "A2 - Fees/charges", timeline: [
    { date: "15 Mar 2026", note: "Customer identified overcharge on statement" },
    { date: "16 Mar 2026", note: "Complaint acknowledged within 24 hours" },
    { date: "18 Mar 2026", note: "Operations confirmed rate switch was delayed" },
    { date: "22 Mar 2026", note: "Refund of 342.17 calculated" },
    { date: "01 Apr 2026", note: "Escalated - customer rejected initial offer" },
  ], rootCause: "Manual rate switch process missed SLA", resolution: "" },
  { id: "CMP-005", customer: "Michael Thompson", category: "Delay", summary: "Valuation report received but offer not issued for 3 weeks", assigned: "Mark Taylor", status: "Open", opened: "01 Apr 2026", slaDays: 1, fcaCat: "A1 - Delays", timeline: [
    { date: "01 Apr 2026", note: "Broker escalated on behalf of customer" },
    { date: "02 Apr 2026", note: "Case reviewed - valuation complete 12 Mar" },
  ], rootCause: "", resolution: "" },
  { id: "CMP-006", customer: "Aisha Khan", category: "Service", summary: "Incorrect information given about porting mortgage to new property", assigned: "Lisa Wong", status: "Resolved", opened: "10 Mar 2026", slaDays: 0, fcaCat: "A4 - Service", timeline: [
    { date: "10 Mar 2026", note: "Customer misadvised that porting was not available" },
    { date: "11 Mar 2026", note: "Complaint logged and assigned" },
    { date: "14 Mar 2026", note: "Policy confirmed porting IS available on this product" },
    { date: "16 Mar 2026", note: "Customer contacted with correct information and apology" },
    { date: "18 Mar 2026", note: "Customer satisfied, complaint resolved" },
  ], rootCause: "Advisor unfamiliar with porting eligibility on legacy products", resolution: "Correct information provided, porting application initiated, training refresher scheduled for team" },
  { id: "CMP-007", customer: "Robert Clarke", category: "Product", summary: "Overpayment allowance incorrectly calculated, customer penalised", assigned: "Mark Taylor", status: "Resolved", opened: "05 Mar 2026", slaDays: 0, fcaCat: "A2 - Fees/charges", timeline: [
    { date: "05 Mar 2026", note: "Customer disputed ERC charge on overpayment" },
    { date: "06 Mar 2026", note: "Overpayment calculation reviewed" },
    { date: "10 Mar 2026", note: "Error confirmed - 10% allowance not reset at anniversary" },
    { date: "12 Mar 2026", note: "Full refund of 1,250 issued plus 75 goodwill" },
    { date: "14 Mar 2026", note: "System fix deployed, complaint closed" },
  ], rootCause: "Anniversary reset logic bug in overpayment calculator", resolution: "Refund of 1,250 ERC plus 75 goodwill. System fix deployed to correct anniversary reset." },
  { id: "CMP-008", customer: "Sophie Williams", category: "Fees", summary: "Valuation fee charged twice on resubmitted application", assigned: "Sarah Chen", status: "Open", opened: "03 Apr 2026", slaDays: 0, fcaCat: "A2 - Fees/charges", timeline: [
    { date: "03 Apr 2026", note: "Customer identified duplicate charge on bank statement" },
    { date: "04 Apr 2026", note: "Finance team asked to verify payment records" },
  ], rootCause: "", resolution: "" },
  { id: "CMP-009", customer: "Hassan Ahmed", category: "Delay", summary: "Remortgage completion delayed past rate lock expiry, now on higher rate", assigned: "Lisa Wong", status: "In Progress", opened: "20 Mar 2026", slaDays: 10, fcaCat: "A1 - Delays", timeline: [
    { date: "20 Mar 2026", note: "Complaint received - rate lock expired 18 Mar" },
    { date: "21 Mar 2026", note: "Legal team contacted for completion timeline" },
    { date: "25 Mar 2026", note: "Solicitor delays identified as root cause" },
    { date: "02 Apr 2026", note: "Rate lock extension being considered by credit committee" },
  ], rootCause: "Third-party solicitor delays combined with tight rate lock window", resolution: "" },
];

const STATUS_STYLES = {
  Open:         { bg: "#DBEAFE", text: "#1E40AF" },
  "In Progress":{ bg: "#FEF3C7", text: "#92400E" },
  Resolved:     { bg: "#D1FAE5", text: "#065F46" },
  Escalated:    { bg: "#FEE2E2", text: "#991B1B" },
};

function ComplaintsScreen() {
  const [tab, setTab]           = useState("All");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const tabs = ["All", "Open", "In Progress", "Resolved", "Escalated"];

  const openCount      = MOCK_COMPLAINTS.filter(c => c.status === "Open").length;
  const inProgressCount = MOCK_COMPLAINTS.filter(c => c.status === "In Progress").length;
  const resolvedCount  = MOCK_COMPLAINTS.filter(c => c.status === "Resolved").length;
  const breachCount    = MOCK_COMPLAINTS.filter(c => c.slaDays >= 14).length;

  const shown = MOCK_COMPLAINTS.filter(c =>
    (tab === "All" || c.status === tab) &&
    (c.customer.toLowerCase().includes(search.toLowerCase()) ||
     c.id.toLowerCase().includes(search.toLowerCase()) ||
     c.summary.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── Detail view ── */
  if (selected) {
    const c = selected;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => setSelected(null)}>
          <span style={{ color: T.primary }}>{Ico.arrowLeft(18)}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>Back to Complaints</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{c.id} — {c.customer}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>{c.summary}</p>
          </div>
          <span style={{ ...badgeStyle(c.status), fontSize: 12, padding: "5px 14px" }}>{c.status}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.text }}>Complaint Details</div>
            {detailRow("Category", c.category)}
            {detailRow("FCA Category", c.fcaCat)}
            {detailRow("Assigned To", c.assigned)}
            {detailRow("Date Opened", c.opened)}
            {detailRow("SLA Status", c.slaDays >= 14 ? "BREACHING" : c.slaDays > 0 ? `${c.slaDays} days elapsed` : "Resolved")}
          </Card>
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.text }}>Root Cause & Resolution</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Root Cause</div>
              <div style={{ fontSize: 13, color: c.rootCause ? T.text : T.textMuted, padding: 10, background: T.bg, borderRadius: 8, minHeight: 40 }}>
                {c.rootCause || "Pending investigation"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Resolution Notes</div>
              <div style={{ fontSize: 13, color: c.resolution ? T.text : T.textMuted, padding: 10, background: T.bg, borderRadius: 8, minHeight: 40 }}>
                {c.resolution || "Not yet resolved"}
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.text }}>Timeline</div>
          {c.timeline.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: i < c.timeline.length - 1 ? 16 : 0, paddingLeft: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? T.primary : T.border, marginTop: 4 }} />
                {i < c.timeline.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 4 }} />}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{t.date}</div>
                <div style={{ fontSize: 13, color: T.text, marginTop: 2 }}>{t.note}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  /* ── Create form overlay ── */
  if (showForm) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => setShowForm(false)}>
          <span style={{ color: T.primary }}>{Ico.arrowLeft(18)}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>Back to Complaints</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 20px" }}>Log New Complaint</h1>
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {formField("Customer Name")}
            {formField("Category", true)}
            {formField("FCA Category", true)}
            {formField("Assign To", true)}
          </div>
          <div style={{ marginTop: 16 }}>
            {formField("Complaint Summary (textarea)")}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn primary icon="check">Submit Complaint</Btn>
            <Btn ghost onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </Card>
      </div>
    );
  }

  /* ── Main list view ── */
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Complaints Management</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            Track, investigate and resolve customer complaints per FCA DISP rules
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn ghost icon="download">Export CSV</Btn>
          <Btn primary icon="plus" onClick={() => setShowForm(true)}>Log Complaint</Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Open"               value={String(openCount)}       sub="awaiting action"     color="#3B82F6" />
        <KPICard label="In Progress"         value={String(inProgressCount)} sub="under investigation" color={T.warning} />
        <KPICard label="Resolved This Month" value="8"                       sub="Mar 2026"            color={T.success} />
        <KPICard label="Avg Resolution"      value="12 days"                 sub="target: 15 days"     color={T.primary} />
        <KPICard label="Breaching SLA"       value={String(breachCount)}     sub="over 8 weeks"        color={T.danger} />
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }}>{Ico.search(15)}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..."
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 8, border: `1px solid ${T.border}`,
                fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {tabs.map(t => (
              <div key={t} onClick={() => setTab(t)}
                style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: tab === t ? T.primary : T.card, color: tab === t ? "#fff" : T.textSecondary,
                  border: `1px solid ${tab === t ? T.primary : T.border}` }}>{t}</div>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {["ID", "Customer", "Category", "Summary", "Assigned", "Status", "Opened", "SLA"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600,
                  color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(c => (
              <tr key={c.id} onClick={() => setSelected(c)} style={{ borderTop: `1px solid ${T.borderLight}`, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 600, color: T.primary, fontFamily: "monospace" }}>{c.id}</td>
                <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.text }}>{c.customer}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: catBg(c.category), color: catColor(c.category) }}>{c.category}</span>
                </td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: T.textSecondary, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.summary}</td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: T.textSecondary }}>{c.assigned}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={badgeStyle(c.status)}>{c.status}</span>
                </td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>{c.opened}</td>
                <td style={{ padding: "11px 16px" }}>
                  {c.status === "Resolved" ? (
                    <span style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Closed</span>
                  ) : c.slaDays >= 14 ? (
                    <span style={{ fontSize: 11, color: T.danger, fontWeight: 700 }}>BREACH</span>
                  ) : (
                    <span style={{ fontSize: 11, color: c.slaDays >= 10 ? T.warning : T.textMuted, fontWeight: 600 }}>Day {c.slaDays}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.textMuted }}>
          Showing {shown.length} of {MOCK_COMPLAINTS.length} complaints. FCA requires final response within 8 weeks.
        </div>
      </Card>
    </div>
  );
}

/* ── helpers ── */
function badgeStyle(status) {
  const s = STATUS_STYLES[status] || { bg: "#E5E7EB", text: "#374151" };
  return { background: s.bg, color: s.text, padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700 };
}
function catColor(cat) {
  return { Service: T.primary, Product: "#8B5CF6", Fees: T.warning, Delay: T.danger }[cat] || T.textMuted;
}
function catBg(cat) {
  return { Service: `${T.primary}18`, Product: "#8B5CF618", Fees: `${T.warning}18`, Delay: `${T.danger}18` }[cat] || "#E5E7EB";
}
function detailRow(label, value) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
      <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{value}</span>
    </div>
  );
}
function formField(label, isSelect) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>{label}</label>
      {isSelect ? (
        <select style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
          <option>Select...</option>
        </select>
      ) : (
        <input style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

export default ComplaintsScreen;
