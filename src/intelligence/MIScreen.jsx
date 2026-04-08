import { T } from "../shared/tokens";
import { Card, KPICard } from "../shared/primitives";
import { MOCK_MI_BROKER, MOCK_MI_UW, MOCK_MI_OPS, MOCK_MI_FINANCE, MOCK_MI_ADMIN } from "../data/mi";

function MIScreen({ persona }) {
  const BarChart = ({ data, color, height=80, labelKey="label", valueKey="v", unit="" }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
      <div style={{ display:"flex", alignItems:"flex-end", gap:6, height, paddingTop:8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:600 }}>{unit}{d[valueKey]}</div>
            <div style={{ width:"100%", background:`${color}20`, borderRadius:"4px 4px 0 0", position:"relative", height:height-28 }}>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, borderRadius:"4px 4px 0 0",
                background:color, height:`${(d[valueKey]/max)*100}%`, transition:"height 0.4s" }} />
            </div>
            <div style={{ fontSize:10, color:T.textMuted, textAlign:"center", lineHeight:1.2 }}>{d[labelKey]}</div>
          </div>
        ))}
      </div>
    );
  };

  const StatRow = ({ label, value, sub, color }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${T.borderLight}` }}>
      <span style={{ fontSize:13, color:T.textSecondary }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:700, color:color||T.text }}>{value}
        {sub && <span style={{ fontSize:11, fontWeight:400, color:T.textMuted, marginLeft:6 }}>{sub}</span>}
      </span>
    </div>
  );

  if (persona === "Broker") {
    const d = MOCK_MI_BROKER;
    return (
      <div>
        <div style={{ marginBottom:20 }}><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My MI — Broker</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Your pipeline performance and activity</p></div>
        <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
          <KPICard label="Conversion Rate"    value={d.conversionRate} sub="DIP → Completion"    color={T.primary} />
          <KPICard label="Avg DIP Time"       value={d.dipTime}        sub="↓ 92% vs manual"     color={T.success} />
          <KPICard label="Avg Loan Size"      value={d.avgLoanSize}    sub="this month"           color={T.accent}  />
          <KPICard label="Completions YTD"    value={d.completionsYTD} sub="3 completions"        color="#8B5CF6"   />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Pipeline Funnel</div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Cases by stage this month</div>
            <BarChart data={d.pipeline} color={T.primary} height={100} />
          </Card>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Product Mix</div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Volume by product type</div>
            <BarChart data={d.products} color={T.accent} height={100} />
          </Card>
        </div>
      </div>
    );
  }

  if (persona === "Underwriter") {
    const d = MOCK_MI_UW;
    const total = d.approved + d.declined + d.referred;
    return (
      <div>
        <div style={{ marginBottom:20 }}><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My MI — Underwriter</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Decision quality and queue metrics</p></div>
        <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
          <KPICard label="Approved"       value={`${d.approved}%`} sub={`${Math.round(d.approved*total/100)} cases`} color={T.success} />
          <KPICard label="Declined"       value={`${d.declined}%`} sub={`${Math.round(d.declined*total/100)} cases`} color={T.danger}  />
          <KPICard label="Referred"       value={`${d.referred}%`} sub={`${Math.round(d.referred*total/100)} cases`} color={T.warning} />
          <KPICard label="Avg Decision"   value={`${d.avgDecisionHours}h`} sub="per case"               color={T.primary} />
          <KPICard label="Overturn Rate"  value={d.overturnRate}   sub="decisions reversed"             color="#8B5CF6"   />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Queue Depth — This Week</div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Cases received per day</div>
            <BarChart data={d.queue} color={T.primary} height={100} />
          </Card>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Decisions by Mandate Level</div>
            {d.byMandate.map((m, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span>{m.label}</span><span style={{ fontWeight:600 }}>{m.v} cases</span>
                </div>
                <div style={{ height:6, background:T.borderLight, borderRadius:3 }}>
                  <div style={{ height:6, borderRadius:3, background:T.primary, width:`${(m.v/Math.max(...d.byMandate.map(x=>x.v)))*100}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (persona === "Ops") {
    const d = MOCK_MI_OPS;
    return (
      <div>
        <div style={{ marginBottom:20 }}><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My MI — Operations</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>KYC, document quality and SLA performance</p></div>
        <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
          <KPICard label="KYC Pass Rate"      value={`${d.kycPassRate}%`}      sub="all submissions"         color={T.success} />
          <KPICard label="First-Time Pass"    value={`${d.kycFirstTime}%`}     sub="no re-submission"        color={T.accent}  />
          <KPICard label="Doc Verify Time"    value={`${d.avgDocVerifyHours}h`} sub="avg per document"       color={T.primary} />
          <KPICard label="SLA Compliance"     value={`${d.slaCompliance}%`}    sub="across all stages"       color={d.slaCompliance>=90?T.success:T.warning} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Cases in Exception</div>
            {d.byStage.map((s, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span>{s.label}</span><span style={{ fontWeight:600 }}>{s.v} cases</span>
                </div>
                <div style={{ height:6, background:T.borderLight, borderRadius:3 }}>
                  <div style={{ height:6, borderRadius:3, background:T.warning, width:`${(s.v/Math.max(...d.byStage.map(x=>x.v)))*100}%` }} />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Broker Document Quality</div>
            {d.docQuality.map((b, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span>{b.broker}</span>
                  <span style={{ fontWeight:700, color:b.score>=90?T.success:b.score>=75?T.warning:T.danger }}>{b.score}%</span>
                </div>
                <div style={{ height:6, background:T.borderLight, borderRadius:3 }}>
                  <div style={{ height:6, borderRadius:3, background:b.score>=90?T.success:b.score>=75?T.warning:T.danger, width:`${b.score}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  if (persona === "Finance") {
    const d = MOCK_MI_FINANCE;
    return (
      <div>
        <div style={{ marginBottom:20 }}><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My MI — Finance</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Disbursements, treasury and portfolio risk</p></div>
        <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
          <KPICard label="Disbursed MTD"     value={d.disbursedMTD}      sub="month to date"             color={T.primary} />
          <KPICard label="Pending Auth"      value={d.pendingAuth}        sub="awaiting checker"          color={T.warning} />
          <KPICard label="DD Failure Rate"   value={d.failedDD}           sub="last 30 days"              color={T.danger}  />
          <KPICard label="Arrears Provision" value={d.arrearsProvision}   sub="total impairment"          color="#8B5CF6"   />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Weekly Disbursements (£k)</div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Last 4 weeks</div>
            <BarChart data={d.weekly} color={T.primary} height={100} unit="£" />
          </Card>
          <Card>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Rate Expiry Schedule</div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Accounts by days to rate expiry</div>
            <BarChart data={d.rateExpiry} color={T.warning} height={100} />
          </Card>
        </div>
      </div>
    );
  }

  // Admin / default
  const d = MOCK_MI_ADMIN;
  return (
    <div>
      <div style={{ marginBottom:20 }}><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Platform MI — Admin</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Full platform health, compliance and user activity</p></div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Active Users"    value={String(d.activeUsers)} sub="logged in today"            color={T.primary} />
        <KPICard label="AI Auto Rate"    value={`${d.aiAutoRate}%`}    sub="fields AI-populated"        color={T.accent}  />
        <KPICard label="Avg Response"    value={d.avgResponseTime}     sub="case response time"         color={T.success} />
        <KPICard label="Audit Flags"     value={String(d.auditFlags)}  sub="require review"             color={T.danger}  />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Users by Persona</div>
          <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Active user count</div>
          <BarChart data={d.volumeByPersona} color={T.primary} height={100} />
        </Card>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>SLA Compliance by Stage</div>
          {d.slaByStage.map((s, i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                <span>{s.label}</span>
                <span style={{ fontWeight:700, color:s.pct>=95?T.success:s.pct>=85?T.warning:T.danger }}>{s.pct}%</span>
              </div>
              <div style={{ height:6, background:T.borderLight, borderRadius:3 }}>
                <div style={{ height:6, borderRadius:3, background:s.pct>=95?T.success:s.pct>=85?T.warning:T.danger, width:`${s.pct}%` }} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default MIScreen;
