import { useState } from "react";
import { T, Ico, StatusBadge, STATE_COLOR } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_DOCS, MOCK_TIMELINE } from "../data/loans";
import { MOCK_SVC_ACCOUNTS, MOCK_SVC_TIMELINE } from "../data/servicing";
import { MOCK_VALUATIONS, MOCK_SURVEYORS } from "../data/valuations";

const VAL_STATUS_COLOR = {
  "AVM Only":        { bg:T.bg,         txt:T.textMuted },
  "Not Instructed":  { bg:T.warningBg,  txt:T.warning   },
  "Instructed":      { bg:T.primaryLight,txt:T.primary  },
  "Report Received": { bg:T.successBg,  txt:T.success   },
  "Down-Valuation":  { bg:T.dangerBg,   txt:T.danger    },
};

// ── AI Underwriting Assessment (mock generated insights) ──
const AI_UW_SECTIONS = [
  { id:"borrower", label:"Borrower Assessment", icon:"user", color:"#8B5CF6",
    insights:[
      { label:"Employment Stability", value:"High", detail:"Employed at TechCorp Ltd since Mar 2019 (7+ years). Permanent, full-time contract. Sector: Technology — low redundancy risk.", risk:"low" },
      { label:"Income Trajectory", value:"Positive", detail:"Basic salary £70,000. Year-on-year growth of ~4.5% based on P60 history. Bonus £8,000 (consistent 3 consecutive years).", risk:"low" },
      { label:"Credit Behaviour", value:"Good", detail:"Equifax score 742. No missed payments in 6 years. 4 active accounts, all in good standing. No County Court Judgments or IVAs.", risk:"low" },
      { label:"Debt-to-Income", value:"18.2%", detail:"Total monthly commitments £1,060 against gross monthly income £5,833. Well within 40% DTI threshold.", risk:"low" },
      { label:"Residency", value:"Stable", detail:"3 years at current address. UK national. On electoral roll. No address discrepancies detected.", risk:"low" },
    ]},
  { id:"credit", label:"Credit & Affordability", icon:"dollar", color:T.primary,
    insights:[
      { label:"Affordability — Base Case", value:"Pass", detail:"Net disposable income £3,330/mo after all commitments. Mortgage payment £1,948/mo leaves £1,382 surplus (71% coverage ratio).", risk:"low" },
      { label:"Affordability — Stress Test", value:"Pass", detail:"At stress rate 7.49%, payment rises to £2,620/mo. Surplus reduces to £710/mo — still positive. Passes PRA stress test.", risk:"low" },
      { label:"Existing Commitments", value:"£420/mo", detail:"Car finance £280/mo (18 months remaining), credit card £140/mo minimum. No undisclosed debts found in bureau data.", risk:"low" },
      { label:"Income Verification", value:"Confirmed", detail:"Payslip (Mar 2026), P60 (2025), bank statements (3 months) all cross-referenced. £2,500 P60 discrepancy explained by bonus proration.", risk:"medium" },
      { label:"Future Commitment Risk", value:"Low", detail:"No pending applications detected in bureau search footprint. Car finance clears in 18 months, improving DTI to 14.1%.", risk:"low" },
    ]},
  { id:"sensitivity", label:"Sensitivity Analysis", icon:"chart", color:T.warning,
    insights:[
      { label:"Rate +2% Scenario", value:"Affordable", detail:"If rate increases to 6.49% at product end, payment becomes £2,340/mo. Surplus £990/mo. Applicant can absorb without hardship.", risk:"low" },
      { label:"Rate +3% Scenario", value:"Tight", detail:"At 7.49% (SVR), payment £2,620/mo. Surplus £710/mo. Manageable but leaves limited buffer for cost-of-living increases.", risk:"medium" },
      { label:"Income Reduction -20%", value:"Marginal", detail:"If income drops to £56,000, DTI rises to 22.8%. Mortgage still affordable at current rate, fails stress test by £180/mo.", risk:"high" },
      { label:"Property Value -10%", value:"LTV 80%", detail:"If property falls from £485,000 to £436,500, LTV increases from 72% to 80%. Still within product parameters. No payment impact.", risk:"medium" },
      { label:"Combined Adverse", value:"Elevated Risk", detail:"Rate +2% AND income -10% simultaneously: DTI 31.4%, surplus £320/mo. Serviceable but with minimal headroom.", risk:"high" },
    ]},
  { id:"collateral", label:"Collateral Assessment", icon:"shield", color:T.accent,
    insights:[
      { label:"Valuation Status", value:"Confirmed", detail:"Full survey completed 25 Mar 2026 by Countrywide Surveying. Report value £485,000 — matches purchase price. No down-valuation.", risk:"low" },
      { label:"LTV Position", value:"72%", detail:"Loan £350,000 against value £485,000. Well within 75% LTV product maximum. Provides 28% equity buffer.", risk:"low" },
      { label:"Property Type Risk", value:"Standard", detail:"Semi-detached, freehold, 3 bedrooms. Standard construction (brick). No non-standard features. Highly marketable in resale.", risk:"low" },
      { label:"Location Risk", value:"Low", detail:"Bristol BS1. Strong demand area. Average days-to-sell: 28. No flood risk (Zone 1). No subsidence history on postcode.", risk:"low" },
      { label:"Tenure & Restrictions", value:"Clean", detail:"Freehold. No restrictive covenants. No planning restrictions. No rights of way. Title is clean per Land Registry.", risk:"low" },
    ]},
  { id:"policy", label:"Policy Compliance", icon:"lock", color:"#1D4ED8",
    insights:[
      { label:"Lending Policy", value:"Compliant", detail:"All parameters within Afin Bank standard residential lending policy. No policy exceptions required.", risk:"low" },
      { label:"Mandate Level", value:"L1 — Standard", detail:"Loan amount £350,000 and LTV 72% fall within L1 mandate. Single underwriter approval sufficient (no escalation required).", risk:"low" },
      { label:"KYC / AML", value:"Passed", detail:"Identity verified (passport). Address verified (utility bill — note: >3 months, but supplemented with bank statement). No sanctions/PEP matches.", risk:"low" },
      { label:"Consumer Duty", value:"Compliant", detail:"Product suitability confirmed. Fixed rate provides payment certainty. No evidence of vulnerability. Customer outcome: Positive.", risk:"low" },
      { label:"Fraud Indicators", value:"None Detected", detail:"No duplicate applications. Address not associated with previous fraud cases. Employer verified on Companies House. Phone number unique.", risk:"low" },
    ]},
  { id:"summary", label:"AI Summary & Recommendation", icon:"sparkle", color:T.accent,
    insights:[
      { label:"Overall Risk Rating", value:"Low", detail:"Composite risk score: 14/100 (Low). All six assessment pillars rate green or amber. No red flags identified.", risk:"low" },
      { label:"AI Recommendation", value:"Approve", detail:"Nova AI recommends APPROVAL. Strong borrower profile, comfortable affordability with stress test headroom, standard collateral, full policy compliance. No conditions recommended.", risk:"low" },
      { label:"Key Strengths", value:"3 identified", detail:"(1) Stable 7-year employment in resilient sector. (2) 72% LTV provides substantial equity buffer. (3) Clean credit history with rising score trajectory.", risk:"low" },
      { label:"Watch Points", value:"2 noted", detail:"(1) P60 discrepancy of £2,500 — explained but flag for file. (2) Fixed rate expires Aug 2028 — ensure retention strategy is noted for servicing handover.", risk:"medium" },
      { label:"Suggested Conditions", value:"None", detail:"No conditions precedent recommended. Standard completion requirements apply. Recommend noting P60 discrepancy explanation on file for audit trail.", risk:"low" },
    ]},
];

function ApplicationDetail({ loan, persona, onBack, onCreateLoan, onViewServicing }) {
  const [appTab, setAppTab] = useState("main");
  const [aiUWGenerated, setAiUWGenerated] = useState(false);
  const [aiUWLoading, setAiUWLoading] = useState(false);
  const [aiUWExpandedSection, setAiUWExpandedSection] = useState("borrower");

  const linkedSvcAccount = loan.servicingId ? MOCK_SVC_ACCOUNTS.find(a => a.id === loan.servicingId) : null;
  const isUW = persona === "Underwriter" || persona === "Admin";

  const tabs = [
    { id: "main", label: "Overview" }, { id: "dip", label: "DIP" },
    { id: "documents", label: "Documents" }, { id: "timeline", label: "Timeline" },
    { id: "affordability", label: "Affordability" }, { id: "parties", label: "Parties" },
    { id: "valuation", label: "Valuation" },
    ...(isUW ? [{ id: "aiuw", label: "AI Underwriting" }] : []),
    ...(linkedSvcAccount ? [{ id: "servicing", label: "Servicing Account" }] : []),
  ];

  // Next-action banner config per status
  const ACTION_BANNER = {
    DIP_Approved:    { who: "Broker",       color: T.primary,  icon: "arrow",  msg: "DIP approved — submit full mortgage application to proceed." },
    Submitted:       { who: "Ops",          color: T.warning,  icon: "file",   msg: "Application received — initiate KYC and document verification." },
    KYC_In_Progress: { who: "Ops",          color: T.warning,  icon: "shield", msg: "KYC in progress — complete identity checks and verify uploaded documents." },
    Underwriting:    { who: "Underwriter",  color: "#8B5CF6",  icon: "check",  msg: "Ready for credit decision — review affordability and issue recommendation." },
    Referred:        { who: "Underwriter",  color: T.danger,   icon: "alert",  msg: "Case referred — senior underwriter review required before proceeding." },
    Offer_Issued:    { who: "Broker",       color: T.accent,   icon: "send",   msg: "Mortgage offer issued — awaiting customer acceptance." },
    Offer_Accepted:  { who: "Finance",      color: T.success,  icon: "dollar", msg: "Offer accepted — process disbursement and onboard to Lending Servicing." },
    Approved:        { who: "Finance",      color: T.success,  icon: "dollar", msg: "Application approved — ready for disbursement." },
    Disbursed:       { who: null,           color: T.accent,   icon: "check",  msg: "Loan disbursed and live in Lending Servicing." },
  };
  const banner = ACTION_BANNER[loan.status];
  const showBanner = banner && (banner.who === persona || banner.who === null || persona === "Admin");

  const renderTab = () => {
    if (appTab === "main") return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Loan Details</div>
          {[["Amount",loan.amount],["Product",loan.product],["Rate",loan.rate],["Term",loan.term],["Type",loan.type]].map(([k,v],i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
              <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Applicant — James Mitchell</div>
          {[["Date of Birth","15 Mar 1984"],["Employment","Employed (TechCorp Ltd)"],["Annual Income","£70,000"],["Credit Score","742 — Good"],["Nationality","British"]].map(([k,v],i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
              <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card style={{ gridColumn: "1/-1" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Property</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[["Address","14 Oak Lane, Bristol BS1 4NZ"],["Type","Semi-Detached"],["Value","£485,000"],["LTV","72%"],["Tenure","Freehold"],["Bedrooms","3"]].map(([k,v],i) => (
              <div key={i}><div style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div></div>
            ))}
          </div>
        </Card>
      </div>
    );
    if (appTab === "documents") return (
      <Card noPad>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Documents ({MOCK_DOCS.length})</span>
          <Btn small iconNode={Ico.upload(14)}>Upload</Btn>
        </div>
        <div style={{ padding: "0 20px" }}>
          {MOCK_DOCS.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr auto auto", gap: 12, alignItems: "center", padding: "14px 0", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
              <div style={{ width: 36, height: 36, background: T.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted }}>{Ico.file(18)}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{d.category}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, background: "#F8FAFC", padding: "4px 8px", borderRadius: 5, borderLeft: `2px solid ${T.primary}` }}>🤖 {d.ai}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>AI</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: d.confidence > 94 ? T.success : d.confidence > 88 ? T.warning : T.danger }}>{d.confidence}%</div>
              </div>
              <span style={{ padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: d.status === "Verified" ? T.successBg : T.warningBg,
                color: d.status === "Verified" ? T.success : T.warning }}>{d.status}</span>
            </div>
          ))}
        </div>
      </Card>
    );
    if (appTab === "timeline") return (
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Case Timeline</div>
        {MOCK_TIMELINE.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: t.color, marginTop: 5 }} />
              {i < MOCK_TIMELINE.length - 1 && <div style={{ position: "absolute", left: 3.5, top: 13, bottom: -16, width: 1, background: T.borderLight }} />}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>
                {t.text}
                {t.type === "ai" && <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 7px", background: "#EFF6FF", color: "#1D4ED8", borderRadius: 4, fontWeight: 600 }}>AI</span>}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{t.time} · {t.actor}</div>
            </div>
          </div>
        ))}
      </Card>
    );
    if (appTab === "affordability") return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Income Assessment</div>
          {[["Basic Salary","£70,000"],["Bonus (50%)","£5,000"],["Total Gross","£75,000"],["Stress Rate","7.5%"],["Max Borrowing","£375,000"],["Requested","£350,000"]].map(([k,v],i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
              <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Expenditure</div>
          {[["Monthly Commitments","£420"],["Monthly Rent","£1,200"],["Living Costs","£900"],["Total Outgoings","£2,520"],["Disposable Income","£3,330"],["Stress Test","✓ Pass"]].map(([k,v],i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
              <span style={{ color: T.textSecondary }}>{k}</span>
              <span style={{ fontWeight: 600, color: v.includes("✓") ? T.success : T.text }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>
    );
    if (appTab === "dip") return (
      <Card noPad>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>DIP History</span>
          <Btn small primary iconNode={Ico.shield(14)}>Run New DIP</Btn>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#F8FAFC" }}>
            {["Date/Time","Product","Amount","LTV","Rate","Term","Result"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "9px 14px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[
              { date:"20 Feb 2026, 14:32", product:"Afin Fix 2yr 75%", amount:"£350,000", ltv:"72%", rate:"4.49%", term:"25 yrs", result:"Approved" },
              { date:"20 Feb 2026, 14:28", product:"Afin Fix 5yr 75%", amount:"£350,000", ltv:"72%", rate:"4.89%", term:"25 yrs", result:"Approved" },
              { date:"20 Feb 2026, 14:25", product:"Afin Track SVR 75%",amount:"£350,000", ltv:"72%", rate:"5.14%", term:"25 yrs", result:"Declined" },
            ].map((d,i) => (
              <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                <td style={{ padding:"11px 14px", fontSize:12, color:T.textMuted }}>{d.date}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:500 }}>{d.product}</td>
                <td style={{ padding:"11px 14px" }}>{d.amount}</td>
                <td style={{ padding:"11px 14px" }}>{d.ltv}</td>
                <td style={{ padding:"11px 14px", fontWeight:600 }}>{d.rate}</td>
                <td style={{ padding:"11px 14px", color:T.textMuted, fontSize:12 }}>{d.term}</td>
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ padding:"3px 9px", borderRadius:4, fontSize:11, fontWeight:600,
                    background: d.result==="Approved"?T.successBg:T.dangerBg,
                    color: d.result==="Approved"?T.success:T.danger }}>{d.result}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
    if (appTab === "valuation") {
      const val = MOCK_VALUATIONS[loan.id];
      if (!val) return <Card style={{ padding:40, textAlign:"center", color:T.textMuted }}>No valuation data for this case.</Card>;
      const sc = VAL_STATUS_COLOR[val.status] || {};
      const surveyor = val.surveyorId ? MOCK_SURVEYORS.find(s => s.id === val.surveyorId) : null;
      return (
        <div>
          {/* AVM */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <Card>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                {Ico.sparkle(16)}<span style={{ fontSize:14, fontWeight:700 }}>AVM Result</span>
                <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4,
                  background:val.avm.confidence>85?T.successBg:val.avm.confidence>70?T.warningBg:T.dangerBg,
                  color:val.avm.confidence>85?T.success:val.avm.confidence>70?T.warning:T.danger }}>
                  {val.avm.confidence}% confidence
                </span>
              </div>
              <div style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>{val.avm.value}</div>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:10 }}>Range: {val.avm.range}</div>
              <div style={{ height:6, background:T.borderLight, borderRadius:3 }}>
                <div style={{ height:6, borderRadius:3, width:`${val.avm.confidence}%`,
                  background:val.avm.confidence>85?T.success:val.avm.confidence>70?T.warning:T.danger }} />
              </div>
              <div style={{ marginTop:12, padding:"10px 12px", background:T.bg, borderRadius:8, fontSize:12, color:T.textSecondary, borderLeft:`3px solid ${T.accent}` }}>
                <strong>Nova AI:</strong> {val.avm.confidence>=85?"High confidence — consistent with comparable sales in postcode.":"Moderate confidence — recommend physical inspection before offer."}
              </div>
            </Card>
            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Instruction</div>
              {[["Status", <span style={{ padding:"2px 8px", borderRadius:5, fontSize:11, fontWeight:700, background:sc.bg, color:sc.txt }}>{val.status}</span>],
                ["Type",     val.type || "Not instructed"],
                ["Surveyor", surveyor?.firm || "—"],
                ["Instructed",val.instructed || "—"],
                ["Completed", val.completed || (val.status==="Instructed"?"Pending":"—")]].map(([k,v],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
                  <span style={{ color:T.textSecondary }}>{k}</span><span style={{ fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
          {/* Report */}
          {val.report ? (
            <Card>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Surveyor Report</div>
                {val.report.downVal && <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700, background:T.dangerBg, color:T.danger }}>⚠ Down-Valuation</span>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
                {[["Report Value",val.report.value],["Property Type",val.report.type],["Condition",val.report.condition],
                  ["Bedrooms",val.report.rooms],["Tenure",val.report.tenure]].map(([k,v],i) => (
                  <div key={i}><div style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{v}</div></div>
                ))}
              </div>
              {val.report.downVal && (
                <div style={{ padding:"12px 16px", background:T.dangerBg, borderRadius:10, border:`1px solid ${T.dangerBorder}`, marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.danger, marginBottom:8 }}>Down-Valuation — Action Required</div>
                  <div style={{ fontSize:13, color:T.text, marginBottom:10 }}>Surveyor value <strong>{val.report.value}</strong> is below the declared purchase price <strong>{loan.amount}</strong>.</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn small danger>Decline Application</Btn>
                    <Btn small>Request Renegotiation</Btn>
                    <Btn small>Request Reinspection</Btn>
                  </div>
                </div>
              )}
              {val.report.restrictions.length > 0 && (
                <div style={{ padding:"10px 14px", background:T.warningBg, borderRadius:8, border:`1px solid ${T.warningBorder}`, fontSize:13 }}>
                  <strong style={{ color:T.warning }}>Restrictions: </strong>{val.report.restrictions.join("; ")}
                </div>
              )}
              {val.report.retention && (
                <div style={{ marginTop:10, padding:"10px 14px", background:T.primaryLight, borderRadius:8, fontSize:13 }}>
                  <strong>Retention: </strong>{val.report.retention}
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ textAlign:"center", padding:32, color:T.textMuted }}>
              {val.status === "Instructed"
                ? `Awaiting report from ${surveyor?.firm}. Expected within ${surveyor?.sla}.`
                : "No surveyor report yet."}
              {(val.status === "AVM Only" || val.status === "Not Instructed") && persona !== "Broker" && (
                <div style={{ marginTop:12 }}><Btn small primary>Instruct Surveyor</Btn></div>
              )}
            </Card>
          )}
        </div>
      );
    }
    if (appTab === "servicing" && linkedSvcAccount) {
      const svc = linkedSvcAccount;
      // Unified timeline: merge origination + servicing events sorted newest-first
      const unifiedTimeline = [
        ...MOCK_TIMELINE.map(e => ({ ts: e.time, actor: e.actor, cat: "Origination", text: e.text, color: e.color })),
        ...MOCK_SVC_TIMELINE.map(e => ({ ...e, color: T.accent })),
      ];
      return (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:T.successBg, borderRadius:10, border:`1px solid ${T.successBorder}`, marginBottom:16 }}>
            {Ico.check(16)}
            <span style={{ fontSize:13, fontWeight:600, color:T.success }}>Loan live in Lending Servicing</span>
            <span style={{ fontSize:12, color:T.textSecondary, marginLeft:4 }}>Account {svc.id}</span>
            <Btn small style={{ marginLeft:"auto" }} onClick={() => onViewServicing?.(svc.id)} iconNode={Ico.arrow(14)}>Open Full Servicing View</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            {[["Account ID",svc.id],["State",svc.state],["Balance",svc.balance],["Monthly Payment",svc.payment],
              ["Rate",svc.rate],["LTV",svc.ltv],["Next Payment",svc.nextPayment],["Rate Expires",svc.rateEnd]].map(([k,v]) => (
              <div key={k} style={{ background:T.bg, borderRadius:10, padding:"12px 16px", border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, marginBottom:4 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:600, color: k==="State"?(STATE_COLOR[v]?.txt||T.text):T.text }}>{v}</div>
              </div>
            ))}
          </div>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Unified Case Timeline</div>
            {unifiedTimeline.map((e, i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:14, position:"relative" }}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:8, height:8, borderRadius:4, background:e.color||T.accent, marginTop:5 }} />
                  {i < unifiedTimeline.length-1 && <div style={{ position:"absolute", left:3.5, top:13, bottom:-14, width:1, background:T.borderLight }} />}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:500, color:T.text }}>{e.text}
                    <span style={{ marginLeft:8, fontSize:10, padding:"1px 6px", borderRadius:4, fontWeight:600,
                      background: e.cat==="Origination"?T.primaryLight:T.successBg,
                      color: e.cat==="Origination"?T.primary:T.success }}>{e.cat}</span>
                  </div>
                  <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{e.ts} · {e.actor}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      );
    }
    if (appTab === "aiuw" && isUW) {
      const riskColor = r => r === "low" ? T.success : r === "medium" ? T.warning : T.danger;
      const riskLabel = r => r === "low" ? "Low Risk" : r === "medium" ? "Medium" : "High Risk";

      const generateAI = () => {
        setAiUWLoading(true);
        setTimeout(() => { setAiUWLoading(false); setAiUWGenerated(true); }, 2800);
      };

      if (!aiUWGenerated && !aiUWLoading) return (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ width:80, height:80, borderRadius:20, background:`linear-gradient(135deg,${T.primary},${T.accent})`,
            display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px",
            boxShadow:`0 8px 32px ${T.primaryGlow}` }}>
            <span style={{ color:"#fff" }}>{Ico.sparkle(36)}</span>
          </div>
          <h3 style={{ fontSize:20, fontWeight:800, margin:"0 0 8px", color:T.text }}>Nova AI Underwriting Assessment</h3>
          <p style={{ fontSize:14, color:T.textMuted, maxWidth:480, margin:"0 auto 8px", lineHeight:1.6 }}>
            Generate a comprehensive AI-powered credit assessment covering borrower profile, affordability,
            sensitivity analysis, collateral review, policy compliance, and a final recommendation.
          </p>
          <p style={{ fontSize:12, color:T.textMuted, margin:"0 auto 28px" }}>
            Based on all uploaded documents, credit bureau data, AVM results, and application details.
          </p>
          <Btn primary onClick={generateAI} iconNode={Ico.sparkle(16)} style={{ padding:"14px 32px", fontSize:15 }}>
            Generate AI Assessment
          </Btn>
        </div>
      );

      if (aiUWLoading) return (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <style>{`@keyframes uwSpin{to{transform:rotate(360deg)}} @keyframes uwPulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
          <div style={{ position:"relative", width:80, height:80, margin:"0 auto 24px" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`3px solid ${T.borderLight}` }} />
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent",
              borderTopColor:T.accent, animation:"uwSpin 0.8s linear infinite" }} />
            <div style={{ position:"absolute", inset:12, borderRadius:"50%", border:"2px solid transparent",
              borderTopColor:T.primary, animation:"uwSpin 1.3s linear infinite reverse" }} />
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:T.accent, animation:"uwPulse 1.5s ease-in-out infinite" }}>{Ico.sparkle(22)}</span>
            </div>
          </div>
          <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px", color:T.text }}>Analysing application...</h3>
          <p style={{ fontSize:13, color:T.textMuted }}>Nova AI is reviewing documents, credit data, and valuation reports</p>
        </div>
      );

      // Generated state — show full assessment
      const currentSection = AI_UW_SECTIONS.find(s => s.id === aiUWExpandedSection) || AI_UW_SECTIONS[0];
      const allInsights = AI_UW_SECTIONS.flatMap(s => s.insights);
      const lowCount = allInsights.filter(i => i.risk === "low").length;
      const medCount = allInsights.filter(i => i.risk === "medium").length;
      const highCount = allInsights.filter(i => i.risk === "high").length;

      return (
        <div>
          {/* Header strip */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", borderRadius:12, marginBottom:16,
            background:`linear-gradient(135deg, ${T.primaryLight}, ${T.successBg})`, border:`1px solid ${T.successBorder}` }}>
            <span style={{ color:T.accent }}>{Ico.sparkle(20)}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text }}>Nova AI Underwriting Assessment Complete</div>
              <div style={{ fontSize:12, color:T.textSecondary }}>Generated for {loan.id} · {loan.names} · {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, background:T.successBg, color:T.success }}>{lowCount} Low</span>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, background:T.warningBg, color:T.warning }}>{medCount} Medium</span>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:6, background:T.dangerBg, color:T.danger }}>{highCount} High</span>
            </div>
            <Btn small ghost iconNode={Ico.download(14)}>Export PDF</Btn>
          </div>

          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            {/* Left nav */}
            <div style={{ width:220, flexShrink:0, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, fontSize:11, fontWeight:700,
                color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>Assessment Sections</div>
              {AI_UW_SECTIONS.map(s => {
                const sectionRisks = s.insights.map(i => i.risk);
                const worst = sectionRisks.includes("high") ? "high" : sectionRisks.includes("medium") ? "medium" : "low";
                return (
                  <div key={s.id} onClick={() => setAiUWExpandedSection(s.id)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
                      cursor:"pointer", borderBottom:`1px solid ${T.borderLight}`,
                      background: s.id===aiUWExpandedSection ? T.primaryLight : "transparent",
                      borderLeft: s.id===aiUWExpandedSection ? `3px solid ${T.primary}` : "3px solid transparent" }}>
                    <span style={{ color: s.id===aiUWExpandedSection ? T.primary : T.textMuted, flexShrink:0 }}>{Ico[s.icon]?.(14)}</span>
                    <span style={{ flex:1, fontSize:12, fontWeight: s.id===aiUWExpandedSection ? 600 : 400,
                      color: s.id===aiUWExpandedSection ? T.primary : T.text, lineHeight:1.3 }}>{s.label}</span>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:riskColor(worst), flexShrink:0 }} />
                  </div>
                );
              })}
            </div>

            {/* Right content */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${currentSection.color}15`,
                  display:"flex", alignItems:"center", justifyContent:"center", color:currentSection.color }}>
                  {Ico[currentSection.icon]?.(18)}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{currentSection.label}</div>
                  <div style={{ fontSize:12, color:T.textMuted }}>
                    {currentSection.insights.filter(i=>i.risk==="low").length} low · {currentSection.insights.filter(i=>i.risk==="medium").length} medium · {currentSection.insights.filter(i=>i.risk==="high").length} high risk items
                  </div>
                </div>
              </div>

              {currentSection.insights.map((insight, i) => (
                <Card key={i} style={{ marginBottom:12, padding:0, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"stretch" }}>
                    {/* Risk indicator bar */}
                    <div style={{ width:4, background:riskColor(insight.risk), flexShrink:0 }} />
                    <div style={{ flex:1, padding:"16px 18px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{insight.label}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:15, fontWeight:800, color:riskColor(insight.risk) }}>{insight.value}</span>
                          <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5,
                            background:`${riskColor(insight.risk)}18`, color:riskColor(insight.risk) }}>{riskLabel(insight.risk)}</span>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:T.textSecondary, lineHeight:1.7, padding:"10px 14px",
                        background:T.bg, borderRadius:8, borderLeft:`3px solid ${riskColor(insight.risk)}` }}>
                        <span style={{ color:T.accent, marginRight:6 }}>{Ico.sparkle(12)}</span>
                        {insight.detail}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Action buttons at bottom of summary section */}
              {aiUWExpandedSection === "summary" && (
                <Card style={{ background:`linear-gradient(135deg, ${T.successBg}, ${T.primaryLight})`, border:`1.5px solid ${T.successBorder}`, marginTop:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:T.success, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0 }}>
                      {Ico.check(24)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:T.success, marginBottom:2 }}>AI Recommendation: Approve</div>
                      <div style={{ fontSize:13, color:T.textSecondary }}>All assessment pillars pass. No conditions precedent recommended.</div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <Btn primary iconNode={Ico.check(16)}>Accept & Approve</Btn>
                      <Btn iconNode={Ico.alert(16)}>Override — Refer</Btn>
                      <Btn danger iconNode={Ico.x(16)}>Override — Decline</Btn>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }
    return <Card style={{ padding: 60, textAlign: "center", color: T.textMuted }}>Screen under construction 🚧</Card>;
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display:"flex", alignItems:"center", gap:16 }}>
        <span style={{ fontSize: 13, color: T.primary, cursor: "pointer", fontWeight: 500 }} onClick={onBack}>← Back to Pipeline</span>
        {linkedSvcAccount && (
          <span style={{ fontSize:13, color:T.accent, cursor:"pointer", fontWeight:500 }} onClick={() => onViewServicing?.(linkedSvcAccount.id)}>
            Servicing Account {linkedSvcAccount.id} →
          </span>
        )}
      </div>

      {/* Next-action banner */}
      {showBanner && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 18px", borderRadius:10, marginBottom:16,
          background: `${banner.color}12`, border:`1.5px solid ${banner.color}40` }}>
          <span style={{ color:banner.color, flexShrink:0 }}>{Ico[banner.icon]?.(18)}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:banner.color, textTransform:"uppercase", letterSpacing:0.4, marginBottom:2 }}>
              {banner.who ? `Action required · ${banner.who}` : "Status Update"}
            </div>
            <div style={{ fontSize:13, color:T.text }}>{banner.msg}</div>
          </div>
          {loan.status === "Offer_Accepted" && persona === "Finance" && (
            <Btn primary small iconNode={Ico.arrow(14)}>Confirm Disbursement & Onboard →</Btn>
          )}
          {loan.status === "Disbursed" && linkedSvcAccount && (
            <Btn small iconNode={Ico.arrow(14)} onClick={() => { setAppTab("servicing"); }}>View Servicing Account</Btn>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>{loan.id}</h1>
            <StatusBadge status={loan.status} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: T.textSecondary }}>{loan.names} · {loan.product} · {loan.amount} @ {loan.rate}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn>Change Product</Btn>
          <Btn primary iconNode={Ico.send(16)}>Submit Application</Btn>
        </div>
      </div>
      <Card noPad style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, padding: "0 20px", overflowX:"auto" }}>
          {tabs.map(t => (
            <div key={t.id} onClick={() => setAppTab(t.id)} style={{ padding: "12px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace:"nowrap",
              color: appTab === t.id ? T.primary : T.textMuted,
              borderBottom: `2px solid ${appTab === t.id ? T.primary : "transparent"}`,
              marginBottom: -1, transition: "all 0.15s" }}>{t.label}</div>
          ))}
        </div>
        <div style={{ padding: 20 }}>{renderTab()}</div>
      </Card>
    </div>
  );
}

export { VAL_STATUS_COLOR };
export default ApplicationDetail;
