import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// REPORT DATA BY PERSONA
// ─────────────────────────────────────────────
const REPORTS = {
  Broker: [
    { id:"b1", name:"Pipeline Summary",     desc:"Cases by stage, conversion rate, and pipeline value",          format:"PDF",   icon:"chart",
      preview:{ metrics:[{l:"Active Cases",v:"7"},{l:"Total Pipeline",v:"£2.35M"},{l:"Conversion Rate",v:"34%"},{l:"Avg Processing",v:"18.4 days"}], bars:[{label:"DIP",v:12},{label:"Submit",v:8},{label:"Offer",v:5},{label:"Complete",v:3}], barColor:T.primary }},
    { id:"b2", name:"Commission Statement",  desc:"Monthly and quarterly earnings breakdown by case",            format:"PDF",   icon:"dollar",
      preview:{ metrics:[{l:"This Month",v:"£4,280"},{l:"Q1 Total",v:"£12,940"},{l:"Cases Paid",v:"14"},{l:"Avg Commission",v:"£923"}], bars:[{label:"Jan",v:3800},{label:"Feb",v:4200},{label:"Mar",v:4940}], barColor:T.accent }},
    { id:"b3", name:"DIP History",            desc:"All DIPs executed with product, amount, and outcome",        format:"Excel", icon:"loans",
      preview:{ metrics:[{l:"Total DIPs",v:"38"},{l:"Approved",v:"31"},{l:"Declined",v:"4"},{l:"Expired",v:"3"}], bars:[{label:"Resid",v:22},{label:"BTL",v:10},{label:"Bridge",v:6}], barColor:T.warning }},
    { id:"b4", name:"My Customer List",       desc:"All linked customers with product holdings and status",      format:"Excel", icon:"customers",
      preview:{ metrics:[{l:"Total Customers",v:"64"},{l:"Active Mortgages",v:"41"},{l:"Savings Only",v:"12"},{l:"Dormant",v:"11"}], bars:[{label:"Active",v:41},{label:"Savings",v:12},{label:"Dormant",v:11}], barColor:T.primary }},
  ],
  Underwriter: [
    { id:"u1", name:"Decision Log",           desc:"All credit decisions this month: approved, declined, referred", format:"PDF", icon:"check",
      preview:{ metrics:[{l:"Total Decisions",v:"142"},{l:"Approved",v:"98"},{l:"Declined",v:"18"},{l:"Referred",v:"26"}], bars:[{label:"Wk1",v:32},{label:"Wk2",v:38},{label:"Wk3",v:36},{label:"Wk4",v:36}], barColor:T.success }},
    { id:"u2", name:"Queue Performance",      desc:"Average decision time, overturn rate, throughput",             format:"PDF", icon:"clock",
      preview:{ metrics:[{l:"Avg Decision",v:"4.2h"},{l:"Overturn Rate",v:"3.1%"},{l:"Throughput",v:"7.1/day"},{l:"SLA Met",v:"96%"}], bars:[{label:"Mon",v:8},{label:"Tue",v:7},{label:"Wed",v:6},{label:"Thu",v:9}], barColor:T.primary }},
    { id:"u3", name:"Cases by Mandate Level", desc:"Breakdown of decisions by L1, L2, and escalated",             format:"Excel",icon:"shield",
      preview:{ metrics:[{l:"L1 Auto",v:"68"},{l:"L2 Manual",v:"52"},{l:"Escalated",v:"22"},{l:"Board Ref",v:"3"}], bars:[{label:"L1",v:68},{label:"L2",v:52},{label:"Esc",v:22}], barColor:"#8B5CF6" }},
    { id:"u4", name:"AI vs Manual Decisions",  desc:"Comparison of AI recommendations vs actual decisions",       format:"PDF",  icon:"bot",
      preview:{ metrics:[{l:"AI Agree Rate",v:"91%"},{l:"AI Override",v:"12"},{l:"Manual Only",v:"8"},{l:"Model Accuracy",v:"94.2%"}], bars:[{label:"Agree",v:130},{label:"Override",v:12},{label:"Manual",v:8}], barColor:T.accent }},
  ],
  Ops: [
    { id:"o1", name:"KYC Processing Report",      desc:"KYC pass rates, first-time pass, avg verification time",           format:"PDF",   icon:"shield",
      preview:{ metrics:[{l:"Pass Rate",v:"87%"},{l:"First-Time Pass",v:"72%"},{l:"Avg Verify",v:"14 min"},{l:"Failed",v:"34"}], bars:[{label:"Auto",v:186},{label:"Manual",v:52},{label:"Failed",v:34}], barColor:T.success }},
    { id:"o2", name:"Document Verification Stats", desc:"Documents processed, AI confidence scores, flags raised",         format:"Excel", icon:"file",
      preview:{ metrics:[{l:"Docs Processed",v:"1,247"},{l:"AI Confidence",v:"96.1%"},{l:"Flags Raised",v:"23"},{l:"False Positives",v:"4"}], bars:[{label:"ID",v:420},{label:"Income",v:380},{label:"Address",v:310},{label:"Other",v:137}], barColor:T.primary }},
    { id:"o3", name:"SLA Compliance Report",       desc:"Compliance by stage with breach analysis",                         format:"PDF",   icon:"clock",
      preview:{ metrics:[{l:"Overall SLA",v:"94.3%"},{l:"Breaches",v:"18"},{l:"Near Miss",v:"31"},{l:"Best Stage",v:"KYC 98%"}], bars:[{label:"KYC",v:98},{label:"UW",v:93},{label:"Offer",v:91},{label:"Disb",v:96}], barColor:T.accent }},
    { id:"o4", name:"Collections Summary",         desc:"Active collections, arrears ageing, recovery rate",               format:"PDF",   icon:"dollar",
      preview:{ metrics:[{l:"Active Cases",v:"142"},{l:"Total Arrears",v:"£1.8M"},{l:"Recovery Rate",v:"64%"},{l:"Avg Days",v:"42"}], bars:[{label:"0-30",v:58},{label:"30-60",v:42},{label:"60-90",v:28},{label:"90+",v:14}], barColor:T.danger }},
    { id:"o5", name:"Complaints Report",           desc:"Open, resolved, avg resolution time, root causes",                format:"Excel", icon:"alert",
      preview:{ metrics:[{l:"Open",v:"12"},{l:"Resolved MTD",v:"34"},{l:"Avg Resolution",v:"3.2 days"},{l:"Top Cause",v:"Delays"}], bars:[{label:"Delay",v:14},{label:"Comms",v:9},{label:"Fees",v:7},{label:"Other",v:4}], barColor:T.warning }},
  ],
  Finance: [
    { id:"f1", name:"Disbursement Report",    desc:"Funds released this period with 4-eyes authorisation trail",          format:"PDF",   icon:"dollar",
      preview:{ metrics:[{l:"Total Disbursed",v:"£18.4M"},{l:"Transactions",v:"42"},{l:"Avg Amount",v:"£438K"},{l:"Pending Auth",v:"3"}], bars:[{label:"Wk1",v:4200},{label:"Wk2",v:5100},{label:"Wk3",v:4800},{label:"Wk4",v:4300}], barColor:T.primary }},
    { id:"f2", name:"Arrears Ageing Report",   desc:"Portfolio arrears by 0-30, 30-60, 60-90, 90+ day bands",            format:"PDF",   icon:"alert",
      preview:{ metrics:[{l:"Total Arrears",v:"£3.2M"},{l:"0-30 Days",v:"£1.4M"},{l:"30-60 Days",v:"£980K"},{l:"90+ Days",v:"£340K"}], bars:[{label:"0-30",v:1400},{label:"30-60",v:980},{label:"60-90",v:480},{label:"90+",v:340}], barColor:T.danger }},
    { id:"f3", name:"Portfolio Summary",       desc:"Total book, LTV distribution, product mix, rate profile",            format:"PDF",   icon:"chart",
      preview:{ metrics:[{l:"Total Book",v:"£842M"},{l:"Avg LTV",v:"68.4%"},{l:"Weighted Rate",v:"4.12%"},{l:"Accounts",v:"3,241"}], bars:[{label:"Resid",v:520},{label:"BTL",v:210},{label:"Bridge",v:72},{label:"Savings",v:40}], barColor:T.accent }},
    { id:"f4", name:"Rate Expiry Schedule",    desc:"Accounts with rates expiring by quarter with retention status",      format:"Excel", icon:"clock",
      preview:{ metrics:[{l:"Expiring Q2",v:"184"},{l:"Expiring Q3",v:"221"},{l:"Retained",v:"62%"},{l:"At Risk",v:"£34M"}], bars:[{label:"Q2",v:184},{label:"Q3",v:221},{label:"Q4",v:168},{label:"Q1'27",v:142}], barColor:T.warning }},
    { id:"f5", name:"Savings Maturity Report", desc:"Deposits maturing by month with renewal projections",                format:"Excel", icon:"wallet",
      preview:{ metrics:[{l:"Maturing 30d",v:"£12.4M"},{l:"Maturing 90d",v:"£28.1M"},{l:"Renewal Rate",v:"71%"},{l:"New Rate Avg",v:"4.85%"}], bars:[{label:"Apr",v:12},{label:"May",v:9},{label:"Jun",v:7}], barColor:"#8B5CF6" }},
  ],
  "Risk Analyst": [
    { id:"r1", name:"Consumer Duty Scorecard",      desc:"FCA 4 outcomes with metrics, trends, and RAG status",            format:"PDF",   icon:"shield",
      preview:{ metrics:[{l:"Overall Score",v:"87/100"},{l:"Green",v:"3 outcomes"},{l:"Amber",v:"1 outcome"},{l:"Trend",v:"Improving"}], bars:[{label:"Products",v:92},{label:"Price",v:88},{label:"Support",v:84},{label:"Understand",v:82}], barColor:T.success }},
    { id:"r2", name:"Regulatory Submission Tracker", desc:"All regulatory returns: status, due dates, completeness",       format:"PDF",   icon:"file",
      preview:{ metrics:[{l:"Total Returns",v:"14"},{l:"Submitted",v:"11"},{l:"Due <30d",v:"2"},{l:"Overdue",v:"1"}], bars:[{label:"FCA",v:6},{label:"PRA",v:4},{label:"BoE",v:3},{label:"Other",v:1}], barColor:T.primary }},
    { id:"r3", name:"Stress Test Summary",          desc:"Latest stress test results across all scenarios",                format:"PDF",   icon:"zap",
      preview:{ metrics:[{l:"Scenarios Run",v:"6"},{l:"Capital Adequate",v:"5/6"},{l:"Worst LGD",v:"12.4%"},{l:"Buffer",v:"3.2%"}], bars:[{label:"Base",v:2},{label:"Mild",v:5},{label:"Severe",v:9},{label:"Reverse",v:14}], barColor:T.warning }},
    { id:"r4", name:"Risk Appetite Utilisation",     desc:"Mandate usage, concentration limits, threshold proximity",      format:"Excel", icon:"chart",
      preview:{ metrics:[{l:"LTV Limit",v:"82% of 85%"},{l:"Concentration",v:"71% of 80%"},{l:"Single Name",v:"4.1% of 5%"},{l:"Headroom",v:"£18M"}], bars:[{label:"LTV",v:82},{label:"Conc",v:71},{label:"Single",v:82},{label:"Geo",v:64}], barColor:T.danger }},
    { id:"r5", name:"AI Model Governance",           desc:"Model accuracy, drift status, override rates, audit history",   format:"PDF",   icon:"bot",
      preview:{ metrics:[{l:"Model Accuracy",v:"94.2%"},{l:"Drift Status",v:"Stable"},{l:"Override Rate",v:"6.8%"},{l:"Last Audit",v:"12 Mar"}], bars:[{label:"Credit",v:95},{label:"Fraud",v:97},{label:"KYC",v:92},{label:"Price",v:91}], barColor:T.accent }},
  ],
  Admin: [
    { id:"a1", name:"Platform Usage Report",  desc:"Active users, logins, screen visits, feature adoption",                format:"PDF",   icon:"dashboard",
      preview:{ metrics:[{l:"Active Users",v:"187"},{l:"Logins Today",v:"142"},{l:"Avg Session",v:"34 min"},{l:"Feature Adoption",v:"78%"}], bars:[{label:"Orig",v:420},{label:"Serv",v:310},{label:"Intel",v:280},{label:"Admin",v:190}], barColor:T.primary }},
    { id:"a2", name:"User Activity Report",   desc:"Actions per user, session durations, idle time",                       format:"Excel", icon:"users",
      preview:{ metrics:[{l:"Avg Actions",v:"142/day"},{l:"Avg Session",v:"34 min"},{l:"Idle Rate",v:"8%"},{l:"Peak Hour",v:"10-11am"}], bars:[{label:"Mon",v:180},{label:"Tue",v:165},{label:"Wed",v:172},{label:"Thu",v:158}], barColor:T.accent }},
    { id:"a3", name:"Broker Quality Report",  desc:"Broker firms ranked by quality score, volume, conversion",             format:"PDF",   icon:"assign",
      preview:{ metrics:[{l:"Total Firms",v:"24"},{l:"Avg Quality",v:"7.8/10"},{l:"Top Firm",v:"Apex 9.4"},{l:"Suspended",v:"1"}], bars:[{label:"Apex",v:94},{label:"Prime",v:88},{label:"Metro",v:82},{label:"City",v:76}], barColor:T.success }},
    { id:"a4", name:"Full Portfolio Report",  desc:"Everything: pipeline, servicing, savings, risk, compliance",            format:"PDF",   icon:"products",
      preview:{ metrics:[{l:"Total Book",v:"£842M"},{l:"Pipeline",v:"£47M"},{l:"Savings",v:"£124M"},{l:"Arrears",v:"1.2%"}], bars:[{label:"Mortg",v:842},{label:"Pipe",v:47},{label:"Savings",v:124}], barColor:T.primary }},
    { id:"a5", name:"Board Pack Summary",     desc:"Executive summary suitable for board presentation",                    format:"PDF",   icon:"file",
      preview:{ metrics:[{l:"Revenue MTD",v:"£1.4M"},{l:"Cost:Income",v:"52%"},{l:"NPS Score",v:"+62"},{l:"Risk RAG",v:"Green"},{l:"FCA Status",v:"Compliant"}], bars:[{label:"Q1",v:4200},{label:"Q2",v:4800},{label:"Q3",v:4100},{label:"Q4 est",v:5100}], barColor:"#8B5CF6" }},
  ],
};

// Category colours for left bar
const PERSONA_COLOR = {
  Broker: T.primary, Underwriter: T.accent, Ops: T.warning,
  Finance: "#8B5CF6", "Risk Analyst": T.danger, Admin: T.primary,
};

// ─────────────────────────────────────────────
// INLINE BAR CHART  (same pattern as MIScreen)
// ─────────────────────────────────────────────
const BarChart = ({ data, color, height = 80 }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{d.v}</div>
          <div style={{ width: "100%", background: `${color}20`, borderRadius: "4px 4px 0 0", position: "relative", height: height - 28 }}>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0",
              height: `${(d.v / max) * 100}%`, background: color, transition: "height 0.4s ease",
            }} />
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, whiteSpace: "nowrap" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// SINGLE REPORT CARD
// ─────────────────────────────────────────────
const ReportCard = ({ report, personaColor }) => {
  const [state, setState] = useState("idle"); // idle | loading | generated
  const [schedule, setSchedule] = useState(null); // null | { open, freq }
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = () => {
    setState("loading");
    setTimeout(() => setState("generated"), 1500);
  };

  const handleSchedule = () => {
    setSchedule(prev => prev?.open ? { ...prev, open: false } : { open: true, freq: "Weekly" });
  };

  const handleSaveSchedule = () => {
    setSchedule(s => ({ ...s, open: false, saved: true }));
  };

  const leftColor = state === "generated" ? T.success : personaColor;
  const lastGen = report.id.endsWith("1") ? "Today 09:14" : report.id.endsWith("2") ? "03 Apr 2026" : "Never";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Card style={{ borderLeft: `4px solid ${leftColor}`, position: "relative", overflow: "hidden" }}>
        {/* Loading overlay */}
        {state === "loading" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, borderRadius: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 20, height: 20, border: `3px solid ${T.border}`, borderTopColor: T.primary,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>Generating...</span>
            </div>
          </div>
        )}

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            background: `${personaColor}12`, color: personaColor, flexShrink: 0,
          }}>
            {Ico[report.icon]?.(18)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{report.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{report.desc}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, flexShrink: 0,
            background: report.format === "PDF" ? T.dangerBg : T.successBg,
            color: report.format === "PDF" ? T.danger : T.success,
          }}>
            {report.format}
          </span>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 11, color: T.textMuted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {Ico.clock(12)} Last generated: {lastGen}
          </span>
          {schedule?.saved && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: T.success, fontWeight: 600 }}>
              {Ico.check(12)} Scheduled {schedule.freq}
            </span>
          )}
        </div>

        {/* Action buttons */}
        {state !== "generated" ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn primary small onClick={handleGenerate} icon="zap">Generate Now</Btn>
            <Btn ghost small onClick={handleSchedule} icon="clock">Schedule</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.success, display: "inline-flex", alignItems: "center", gap: 4 }}>
              {Ico.check(14)} Generated
            </span>
            <Btn primary small icon="download">Download</Btn>
            <Btn ghost small icon="eye" onClick={() => setShowPreview(p => !p)}>Preview</Btn>
          </div>
        )}

        {/* Schedule inline dropdown */}
        {schedule?.open && (
          <div style={{
            marginTop: 12, padding: 12, borderRadius: 10, background: T.primaryLight,
            border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Frequency:</span>
            {["Daily", "Weekly", "Monthly"].map(f => (
              <button key={f} onClick={() => setSchedule(s => ({ ...s, freq: f }))} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${schedule.freq === f ? T.primary : T.border}`,
                background: schedule.freq === f ? T.primary : T.card,
                color: schedule.freq === f ? "#fff" : T.text, transition: "all 0.15s",
              }}>
                {f}
              </button>
            ))}
            <Btn primary small onClick={handleSaveSchedule}>Save Schedule</Btn>
          </div>
        )}
      </Card>

      {/* Preview panel */}
      {state === "generated" && showPreview && report.preview && (
        <Card style={{ marginTop: -1, borderTop: `1px dashed ${T.border}`, borderLeft: `4px solid ${T.success}`, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{report.name}</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14 }}>Generated Today 09:14 -- 06 Apr 2026</div>

          {/* Sample metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
            {report.preview.metrics.map((m, i) => (
              <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{m.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* Mini bar chart */}
          <div style={{ marginBottom: 16 }}>
            <BarChart data={report.preview.bars} color={report.preview.barColor} height={70} />
          </div>

          {/* Download / email actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary small icon="download">Download {report.format}</Btn>
            <Btn ghost small icon="send">Email Report</Btn>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function MyReports({ persona = "Broker" }) {
  const reports = REPORTS[persona] || REPORTS.Broker;
  const personaColor = PERSONA_COLOR[persona] || T.primary;

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: "0 0 40px" }}>
      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.navy, letterSpacing: -0.5 }}>My Reports</div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6,
            background: `${personaColor}14`, color: personaColor, border: `1px solid ${personaColor}30`,
          }}>
            {persona}
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>One-click reports tailored to your role</div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Reports Available" value={String(reports.length)} sub={`for ${persona}`}     color={personaColor} />
        <KPICard label="Generated This Month" value="8"                  sub="across all reports"    color={T.accent} />
        <KPICard label="Scheduled"            value="2"                  sub="active schedules"      color={T.warning} />
        <KPICard label="Last Generated"       value="Today"              sub="09:14"                 color={T.success} />
      </div>

      {/* Report cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 420px), 1fr))",
        gap: 18, marginBottom: 24,
      }}>
        {reports.map(r => (
          <ReportCard key={r.id} report={r} personaColor={personaColor} />
        ))}
      </div>

      {/* Admin banner */}
      {persona === "Admin" && (
        <Card style={{ background: `linear-gradient(135deg, ${T.primaryLight}, ${T.bg})`, border: `1px solid ${T.border}`, textAlign: "center", padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.primary, marginBottom: 4 }}>
            Need a custom report? Use the Report Builder
          </div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Combine any data source, filter, and visualisation into a bespoke report.{" "}
            <span style={{ color: T.primary, fontWeight: 600, cursor: "pointer" }}>Open Report Builder &rarr;</span>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MyReports;
