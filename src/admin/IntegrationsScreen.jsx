import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ───── helpers ───── */
const Badge = ({ label, color, bg }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: bg, color }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
    {label}
  </span>
);

const TH = ({ children, width }) => (
  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}`, width }}>{children}</th>
);
const TD = ({ children, bold, color }) => (
  <td style={{ padding: "10px 14px", fontSize: 13, color: color || T.text, fontWeight: bold ? 600 : 400, borderBottom: `1px solid ${T.borderLight}` }}>{children}</td>
);

const AISummary = ({ text }) => (
  <div style={{ display: "flex", gap: 10, background: "linear-gradient(135deg, rgba(26,74,84,0.06), rgba(49,184,151,0.06))", border: `1px solid ${T.borderLight}`, borderRadius: 10, padding: "14px 18px", marginTop: 16 }}>
    <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.bot(18)}</span>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>AI Analysis</div>
      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{text}</div>
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12, marginTop: 20 }}>{children}</div>
);

const Bar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
      <span style={{ color: T.text, fontWeight: 500 }}>{label}</span>
      <span style={{ color: T.textMuted, fontWeight: 600 }}>{value}</span>
    </div>
    <div style={{ height: 8, borderRadius: 4, background: T.borderLight }}>
      <div style={{ height: "100%", borderRadius: 4, background: color || T.primary, width: `${(parseFloat(value.replace(/[^0-9.]/g, "")) / max) * 100}%`, transition: "width 0.4s" }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────── */
/*  TAB: Open Banking                          */
/* ─────────────────────────────────────────── */
const incomeMonths = [
  { month: "Oct", amount: 5833, employer: true },
  { month: "Nov", amount: 5833, employer: true },
  { month: "Dec", amount: 6200, employer: true },
  { month: "Jan", amount: 5833, employer: true },
  { month: "Feb", amount: 5833, employer: true },
  { month: "Mar", amount: 4100, employer: false },
];

const expenditure = [
  { cat: "Housing", amount: 1200, color: "#1A4A54" },
  { cat: "Transport", amount: 380, color: "#2D8E80" },
  { cat: "Food & Groceries", amount: 420, color: "#31B897" },
  { cat: "Subscriptions", amount: 85, color: "#FFBF00" },
  { cat: "Utilities", amount: 195, color: "#6EE7B7" },
  { cat: "Entertainment", amount: 150, color: "#7C3AED" },
  { cat: "Other", amount: 210, color: "#8B95A5" },
];

function OpenBankingTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Connection status */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Open Banking Connection</div>
            <Badge label="Connected" color={T.success} bg={T.successBg} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small icon="zap">Refresh Data</Btn>
            <Btn small danger>Disconnect</Btn>
          </div>
        </div>
        <div style={{ background: T.bg, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DB0011", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>H</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>HSBC Current Account</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Sort code: 40-47-82 &bull; Account: ****4521</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.textMuted }}>Last synced</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Today, 09:14</div>
          </div>
        </div>
      </Card>

      {/* Income verification */}
      <Card>
        <SectionTitle>Income Verification &mdash; Last 6 Months</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, marginBottom: 8 }}>
          {incomeMonths.map((m, i) => {
            const h = (m.amount / 6500) * 120;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 4 }}>&pound;{m.amount.toLocaleString()}</div>
                <div style={{ height: h, borderRadius: "6px 6px 0 0", background: m.employer ? T.primary : T.warning, transition: "height 0.3s" }} />
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{m.month}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted, marginTop: 4 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: T.primary, marginRight: 5, verticalAlign: "middle" }} />Employer credit</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: T.warning, marginRight: 5, verticalAlign: "middle" }} />Irregular income</span>
        </div>
        <AISummary text="Income verified at £5,833/mo. Stable. No gambling transactions. 2 loan repayments detected (car finance £289/mo, personal loan £150/mo)." />
      </Card>

      {/* Expenditure */}
      <Card>
        <SectionTitle>Expenditure Categorisation</SectionTitle>
        <div style={{ maxWidth: 500 }}>
          {expenditure.map((e, i) => (
            <Bar key={i} label={e.cat} value={`£${e.amount}`} max={1200} color={e.color} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "12px 16px", background: T.bg, borderRadius: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Total Monthly Outgoings</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>&pound;2,640</span>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  TAB: Credit Bureau                         */
/* ─────────────────────────────────────────── */
const creditAccounts = [
  { type: "Mortgage", provider: "Nationwide BS", balance: "£142,300", limit: "£165,000", status: "Current", opened: "Mar 2019" },
  { type: "Car Finance", provider: "Black Horse", balance: "£8,420", limit: "£14,000", status: "Current", opened: "Jul 2022" },
  { type: "Credit Card", provider: "Barclaycard", balance: "£1,230", limit: "£5,500", status: "Current", opened: "Jan 2020" },
  { type: "Store Card", provider: "John Lewis", balance: "£0", limit: "£2,000", status: "Settled", opened: "Nov 2018" },
];

const searches = [
  { date: "12 Feb 2026", organisation: "HSBC UK", type: "Soft", purpose: "Quotation search" },
  { date: "28 Jan 2026", organisation: "Helix Bank", type: "Hard", purpose: "Mortgage application" },
  { date: "15 Dec 2025", organisation: "Compare the Market", type: "Soft", purpose: "Insurance quote" },
];

function CreditBureauTab() {
  const score = 742;
  const angle = ((score - 300) / 550) * 180;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Score */}
      <Card>
        <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          {/* Gauge */}
          <div style={{ position: "relative", width: 180, height: 100 }}>
            <svg width="180" height="100" viewBox="0 0 180 100">
              <path d="M10 95 A80 80 0 0 1 170 95" fill="none" stroke={T.borderLight} strokeWidth="14" strokeLinecap="round" />
              <path d="M10 95 A80 80 0 0 1 170 95" fill="none" stroke="url(#gauge)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={`${(angle / 180) * 251.3} 251.3`} />
              <defs><linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={T.danger} /><stop offset="50%" stopColor={T.warning} /><stop offset="100%" stopColor={T.success} /></linearGradient></defs>
            </svg>
            <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: T.text }}>{score}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>out of 850</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Equifax Credit Report</div>
            <div style={{ marginTop: 6 }}><Badge label="Good" color="#047857" bg="#D1FAE5" /></div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Report pulled: 2 Apr 2026</div>
          </div>
        </div>
      </Card>

      {/* Accounts */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Credit Accounts</SectionTitle></div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Type</TH><TH>Provider</TH><TH>Balance</TH><TH>Limit</TH><TH>Status</TH><TH>Opened</TH></tr></thead>
            <tbody>
              {creditAccounts.map((a, i) => (
                <tr key={i}>
                  <TD bold>{a.type}</TD><TD>{a.provider}</TD><TD>{a.balance}</TD><TD>{a.limit}</TD>
                  <TD><Badge label={a.status} color={a.status === "Current" ? T.success : T.textMuted} bg={a.status === "Current" ? T.successBg : T.bg} /></TD>
                  <TD>{a.opened}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Search footprint */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Search Footprint</SectionTitle></div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><TH>Date</TH><TH>Organisation</TH><TH>Type</TH><TH>Purpose</TH></tr></thead>
            <tbody>
              {searches.map((s, i) => (
                <tr key={i}>
                  <TD>{s.date}</TD><TD>{s.provider || s.organisation}</TD>
                  <TD><Badge label={s.type} color={s.type === "Hard" ? T.warning : T.textMuted} bg={s.type === "Hard" ? T.warningBg : T.bg} /></TD>
                  <TD>{s.purpose}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Public records */}
      <Card>
        <SectionTitle>Public Records</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success }}>
          {Ico.check(18)}
          <span style={{ fontSize: 13, fontWeight: 600 }}>None found</span>
        </div>
        <AISummary text="No adverse. DTI within limits. Recommend proceed. Score in 'Good' band — no defaults, CCJs, or IVAs on file." />
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  TAB: Land Registry                         */
/* ─────────────────────────────────────────── */
const saleHistory = [
  { date: "14 Jun 2019", price: "£310,000", buyer: "James & Claire Mitchell" },
  { date: "03 Mar 2012", price: "£245,000", buyer: "David Thompson" },
  { date: "21 Sep 2005", price: "£178,500", buyer: "Sandra Whitfield" },
];

function LandRegistryTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle>Title Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
          {[
            ["Title Number", "WM482917"],
            ["Class of Title", "Absolute"],
            ["Registered Owner", "James Mitchell & Claire Mitchell"],
            ["Property Address", "14 Oakwood Drive, Solihull, B91 3QR"],
            ["Purchase Price", "£310,000"],
            ["Purchase Date", "14 Jun 2019"],
            ["Tenure", "Freehold"],
          ].map(([k, v], i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Existing Charges</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success }}>
          {Ico.check(18)}
          <span style={{ fontSize: 13, fontWeight: 600 }}>None registered</span>
        </div>
      </Card>

      {/* Map placeholder */}
      <Card>
        <SectionTitle>Location Map</SectionTitle>
        <div style={{ height: 200, borderRadius: 10, background: "#E2E0D8", display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${T.border}` }}>
          <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>Map view &mdash; integration pending</span>
        </div>
      </Card>

      {/* Flood risk */}
      <Card>
        <SectionTitle>Environmental Risk</SectionTitle>
        <div style={{ display: "flex", gap: 24 }}>
          <KPICard label="Flood Risk" value="Zone 1" sub="Negligible" color={T.success} />
          <KPICard label="Subsidence" value="Low" sub="No claims history" color={T.success} />
          <KPICard label="Contamination" value="None" sub="No records" color={T.success} />
        </div>
      </Card>

      {/* Sale history */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Sale History</SectionTitle></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Date</TH><TH>Price</TH><TH>Buyer</TH></tr></thead>
          <tbody>
            {saleHistory.map((s, i) => (
              <tr key={i}><TD>{s.date}</TD><TD bold>{s.price}</TD><TD>{s.buyer}</TD></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  TAB: Companies House                       */
/* ─────────────────────────────────────────── */
const directors = [
  { name: "James Mitchell", role: "Director", appointed: "15 Mar 2018", status: "Active" },
  { name: "Claire Mitchell", role: "Secretary", appointed: "15 Mar 2018", status: "Active" },
];

const filings = [
  { date: "12 Jan 2026", type: "Confirmation Statement", status: "Accepted" },
  { date: "30 Sep 2025", type: "Annual Accounts (Micro)", status: "Accepted" },
  { date: "14 Jan 2025", type: "Confirmation Statement", status: "Accepted" },
];

function CompaniesHouseTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle>Company Overview</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
          {[
            ["Company Name", "Mitchell Consulting Ltd"],
            ["Company Number", "11234567"],
            ["Status", "Active"],
            ["Incorporated", "15 Mar 2018"],
            ["Company Type", "Private Limited"],
            ["Registered Office", "14 Oakwood Drive, Solihull, B91 3QR"],
            ["SIC Code", "70229 — Management consultancy"],
            ["Last Accounts Made Up To", "31 Mar 2025"],
          ].map(([k, v], i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                {v}
                {k === "Status" && <Badge label="Active" color={T.success} bg={T.successBg} />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Directors */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Directors &amp; Officers</SectionTitle></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Name</TH><TH>Role</TH><TH>Appointed</TH><TH>Status</TH></tr></thead>
          <tbody>
            {directors.map((d, i) => (
              <tr key={i}>
                <TD bold>{d.name}</TD><TD>{d.role}</TD><TD>{d.appointed}</TD>
                <TD><Badge label={d.status} color={T.success} bg={T.successBg} /></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Filing history */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Recent Filing History</SectionTitle></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Date</TH><TH>Type</TH><TH>Status</TH></tr></thead>
          <tbody>
            {filings.map((f, i) => (
              <tr key={i}>
                <TD>{f.date}</TD><TD>{f.type}</TD>
                <TD><Badge label={f.status} color={T.success} bg={T.successBg} /></TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Financials */}
      <Card>
        <SectionTitle>Last Filed Accounts Summary</SectionTitle>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <KPICard label="Turnover" value="£185,400" sub="Year ending 31 Mar 2025" color={T.primary} />
          <KPICard label="Net Profit" value="£78,200" sub="Margin 42.2%" color={T.success} />
          <KPICard label="Net Assets" value="£124,600" sub="Retained earnings" color={T.accent} />
        </div>
        <AISummary text="Company active 8 years. Accounts filed on time. No flags. Turnover stable year-on-year. Director's loan account cleared." />
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  TAB: E-Signature                           */
/* ─────────────────────────────────────────── */
const signingDocs = [
  {
    name: "Mortgage Offer Letter",
    recipient: "James Mitchell",
    steps: [
      { label: "Sent", time: "2 Apr 2026, 10:30", done: true },
      { label: "Viewed", time: "2 Apr 2026, 14:12", done: true },
      { label: "Signed", time: "3 Apr 2026, 09:45", done: true },
    ],
  },
  {
    name: "Mortgage Deed",
    recipient: "James & Claire Mitchell",
    steps: [
      { label: "Sent", time: "5 Apr 2026, 11:00", done: true },
      { label: "Viewed", time: null, done: false },
      { label: "Signed", time: null, done: false },
    ],
  },
];

const signingEvents = [
  { time: "5 Apr, 11:00", event: "Mortgage Deed sent to James & Claire Mitchell", icon: "send" },
  { time: "3 Apr, 09:45", event: "Mortgage Offer Letter signed by James Mitchell", icon: "check" },
  { time: "2 Apr, 14:12", event: "Mortgage Offer Letter viewed by James Mitchell", icon: "eye" },
  { time: "2 Apr, 10:30", event: "Mortgage Offer Letter sent to James Mitchell", icon: "send" },
];

function ESignatureTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Documents */}
      {signingDocs.map((doc, di) => {
        const allDone = doc.steps.every(s => s.done);
        const pending = !allDone;
        return (
          <Card key={di}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Recipient: {doc.recipient}</div>
              </div>
              <Badge label={allDone ? "Completed" : "Pending"} color={allDone ? T.success : T.warning} bg={allDone ? T.successBg : T.warningBg} />
            </div>
            {/* Progress steps */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
              {doc.steps.map((step, si) => (
                <div key={si} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: step.done ? T.success : T.borderLight,
                      color: step.done ? "#fff" : T.textMuted,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                    }}>
                      {step.done ? Ico.check(16) : si + 1}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: step.done ? T.text : T.textMuted, marginTop: 6 }}>{step.label}</div>
                    {step.time && <div style={{ fontSize: 10, color: T.textMuted }}>{step.time}</div>}
                  </div>
                  {si < doc.steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: step.done ? T.success : T.borderLight, margin: "0 8px", marginBottom: 20 }} />
                  )}
                </div>
              ))}
            </div>
            {pending && (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn small primary icon="send">Resend Reminder</Btn>
                <Btn small icon="eye">View Document</Btn>
              </div>
            )}
          </Card>
        );
      })}

      {/* Timeline */}
      <Card>
        <SectionTitle>Signing Activity Timeline</SectionTitle>
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 9, top: 4, bottom: 4, width: 2, background: T.borderLight }} />
          {signingEvents.map((ev, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18, position: "relative" }}>
              <div style={{
                position: "absolute", left: -28, width: 20, height: 20, borderRadius: "50%",
                background: T.card, border: `2px solid ${T.primary}`, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: T.primary }}>{Ico[ev.icon]?.(12)}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{ev.event}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{ev.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn primary icon="send">Send for Signature</Btn>
          <Btn icon="file">Create New Envelope</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  TAB: HMRC                                  */
/* ─────────────────────────────────────────── */
const taxYears = [
  { year: "2024/25", employment: "£70,000", selfAssessment: "£12,400", tax: "£18,432", ni: "£5,284" },
  { year: "2023/24", employment: "£67,500", selfAssessment: "£10,800", tax: "£17,232", ni: "£4,960" },
  { year: "2022/23", employment: "£62,000", selfAssessment: "£9,200", tax: "£15,432", ni: "£4,548" },
];

const incomeComparison = [
  { source: "Employment — TechCorp Ltd", declared: "£70,000", hmrc: "£70,000", match: true },
  { source: "Self-employment — Mitchell Consulting", declared: "£12,400", hmrc: "£12,400", match: true },
  { source: "Rental income", declared: "£7,200", hmrc: "£6,800", match: false },
];

function HMRCTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Employment check */}
      <Card>
        <SectionTitle>Employment Verification</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
          {[
            ["Employer", "TechCorp Ltd"],
            ["Tax Code", "1257L"],
            ["PAYE Scheme", "Active"],
            ["Employment Start", "01 Sep 2020"],
            ["NI Number", "AB 12 34 56 C"],
            ["Pay Frequency", "Monthly"],
          ].map(([k, v], i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                {v}
                {k === "PAYE Scheme" && <Badge label="Active" color={T.success} bg={T.successBg} />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Income comparison */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Income Comparison &mdash; Declared vs HMRC</SectionTitle></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Source</TH><TH>Declared</TH><TH>HMRC Confirmed</TH><TH>Status</TH></tr></thead>
          <tbody>
            {incomeComparison.map((r, i) => (
              <tr key={i}>
                <TD bold>{r.source}</TD><TD>{r.declared}</TD><TD>{r.hmrc}</TD>
                <TD>
                  <Badge
                    label={r.match ? "Match" : "Mismatch"}
                    color={r.match ? T.success : T.danger}
                    bg={r.match ? T.successBg : T.dangerBg}
                  />
                </TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Tax year summary */}
      <Card noPad>
        <div style={{ padding: "18px 24px 0" }}><SectionTitle>Tax Year Summary &mdash; Last 3 Years</SectionTitle></div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><TH>Tax Year</TH><TH>Employment Income</TH><TH>Self-Assessment</TH><TH>Tax Paid</TH><TH>NI Paid</TH></tr></thead>
          <tbody>
            {taxYears.map((y, i) => (
              <tr key={i}>
                <TD bold>{y.year}</TD><TD>{y.employment}</TD><TD>{y.selfAssessment}</TD><TD>{y.tax}</TD><TD>{y.ni}</TD>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <AISummary text="Employment confirmed with TechCorp Ltd. PAYE active. Tax code standard (1257L). Minor rental income discrepancy of £400 — within tolerance. Self-assessment filed on time for all 3 years." />
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  MAIN SCREEN                                */
/* ─────────────────────────────────────────── */
const TABS = [
  { key: "openbanking", label: "Open Banking", icon: "wallet" },
  { key: "credit",      label: "Credit Bureau", icon: "shield" },
  { key: "land",        label: "Land Registry", icon: "file" },
  { key: "companies",   label: "Companies House", icon: "products" },
  { key: "esign",       label: "E-Signature", icon: "send" },
  { key: "hmrc",        label: "HMRC", icon: "lock" },
];

export default function IntegrationsScreen() {
  const [tab, setTab] = useState("openbanking");

  const renderTab = () => {
    switch (tab) {
      case "openbanking": return <OpenBankingTab />;
      case "credit":      return <CreditBureauTab />;
      case "land":        return <LandRegistryTab />;
      case "companies":   return <CompaniesHouseTab />;
      case "esign":       return <ESignatureTab />;
      case "hmrc":        return <HMRCTab />;
      default:            return null;
    }
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {Ico.zap(22)}
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.text }}>External Integrations</h1>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>Real-time data from third-party providers powering affordability, identity, and compliance checks.</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `2px solid ${T.borderLight}`, paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", border: "none", cursor: "pointer",
            fontFamily: T.font, fontSize: 13, fontWeight: 600,
            background: "transparent",
            color: tab === t.key ? T.primary : T.textMuted,
            borderBottom: tab === t.key ? `2px solid ${T.primary}` : "2px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>
            {Ico[t.icon]?.(15)}
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {renderTab()}
    </div>
  );
}
