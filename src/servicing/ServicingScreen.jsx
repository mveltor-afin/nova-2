import { useState } from "react";
import { T, Ico, STATE_COLOR } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { ACCOUNT_STATES, MOCK_SVC_ACCOUNTS, MOCK_SVC_PAYMENTS, MOCK_SVC_TIMELINE, MOCK_VULN_ALERTS, MOCK_RATE_SWITCH_PRODUCTS, SVC_MODULES, PRIORITY_COLOR } from "../data/servicing";

function ServicingScreen({ onViewApplication, initialAccountId }) {
  const [module, setModule]   = useState("lifecycle");
  const [selAcc, setSelAcc]   = useState(() =>
    (initialAccountId && MOCK_SVC_ACCOUNTS.find(a => a.id === initialAccountId)) || MOCK_SVC_ACCOUNTS[0]
  );
  const [accOpen, setAccOpen] = useState(false);
  const [holidayMonths, setHolidayMonths] = useState(3);
  const [reschedTerm, setReschedTerm] = useState(27);
  const [partialRedemption, setPartialRedemption] = useState(0);
  const [redemptionTab, setRedemptionTab] = useState("full");
  const [furtherAdvance, setFurtherAdvance] = useState(20000);
  const [rateChangeBps, setRateChangeBps] = useState(0);
  const [offsetExtra, setOffsetExtra] = useState(0);
  const [writeoffType, setWriteoffType] = useState("full");
  const [writeoffAmount, setWriteoffAmount] = useState(0);
  const [writeoffNotes, setWriteoffNotes] = useState("");
  const [closureRating, setClosureRating] = useState(0);
  const [closureReason, setClosureReason] = useState("");
  const [terminationReason, setTerminationReason] = useState("");
  const [feeWaiverIdx, setFeeWaiverIdx] = useState(-1);
  const [holidayType, setHolidayType] = useState("full");

  const mod = SVC_MODULES.find(m => m.id === module);

  // ── Account picker ──────────────────────────────────────────────
  const AccountPicker = () => (
    <div style={{ position:"relative", display:"inline-block", minWidth:280 }}>
      <div onClick={() => setAccOpen(o => !o)}
        style={{ padding:"8px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, background:T.card,
          display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
        <div style={{ width:8, height:8, borderRadius:"50%",
          background: STATE_COLOR[selAcc.state]?.txt || T.textMuted }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{selAcc.name}</div>
          <div style={{ fontSize:11, color:T.textMuted }}>{selAcc.id} · {selAcc.state}
            {selAcc.originationRef && onViewApplication && (
              <span onClick={e => { e.stopPropagation(); onViewApplication(selAcc.originationRef); }}
                style={{ marginLeft:8, color:T.primary, cursor:"pointer", fontWeight:600 }}>
                ← {selAcc.originationRef}
              </span>
            )}
          </div>
        </div>
        <span style={{ fontSize:10, color:T.textMuted }}>▼</span>
      </div>
      {accOpen && (
        <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:T.card,
            border:`1px solid ${T.border}`, borderRadius:10, boxShadow:"0 4px 20px rgba(0,0,0,0.1)", zIndex:50 }}>
          {MOCK_SVC_ACCOUNTS.map(a => (
            <div key={a.id} onClick={() => { setSelAcc(a); setAccOpen(false); }}
              style={{ padding:"10px 14px", cursor:"pointer", borderBottom:`1px solid ${T.borderLight}`,
                background: a.id===selAcc.id ? T.primaryLight : "transparent",
                display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background: STATE_COLOR[a.state]?.txt || T.textMuted, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{a.name}</div>
                <div style={{ fontSize:11, color:T.textMuted }}>{a.id} · {a.state}{a.arrears ? ` · Arrears ${a.arrears}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── AI insight chip ──────────────────────────────────────────────
  const AiChip = ({ text, color }) => (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 14px",
        background:`${color||T.accent}10`, borderRadius:10, borderLeft:`3px solid ${color||T.accent}`,
        marginBottom:12 }}>
      <span style={{ fontSize:13, color:color||T.accent, flexShrink:0 }}>{Ico.sparkle(14)}</span>
      <div style={{ fontSize:12, color:T.text, lineHeight:1.6 }}><strong>Nova AI:</strong> {text}</div>
    </div>
  );

  // ── Module content ───────────────────────────────────────────────
  const renderModule = () => {

    // 1 ── Loan Account Lifecycle
    if (module === "lifecycle") return (
      <div>
        <AiChip text={`${selAcc.name}'s account is in good standing. No state transition risk detected in next 30 days.`} color={T.success} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
          {[["Account ID", selAcc.id], ["State", selAcc.state], ["Product", selAcc.product],
            ["Balance", selAcc.balance], ["Rate", selAcc.rate], ["LTV", selAcc.ltv],
            ["Next Payment", selAcc.nextPayment], ["Rate End", selAcc.rateEnd]].map(([k,v]) => (
            <div key={k} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, marginBottom:4 }}>{k}</div>
              <div style={{ fontSize:14, fontWeight:600, color: k==="State" ? (STATE_COLOR[v]?.txt||T.text) : T.text }}>{v}</div>
            </div>
          ))}
        </div>
        <Card noPad>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:600 }}>State Machine</div>
          <div style={{ padding:16, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            {ACCOUNT_STATES.map((s, i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600,
                  background: s===selAcc.state ? STATE_COLOR[s]?.bg : T.bg,
                  color: s===selAcc.state ? STATE_COLOR[s]?.txt : T.textMuted,
                  border:`1.5px solid ${s===selAcc.state ? STATE_COLOR[s]?.txt : T.border}` }}>{s}</div>
                {i < ACCOUNT_STATES.length-1 && <span style={{ color:T.border, fontSize:16 }}>→</span>}
              </div>
            ))}
          </div>
          <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8 }}>
            <Btn small>Lock Account</Btn>
            <Btn small>Terminate</Btn>
            <Btn small ghost>View Full History</Btn>
          </div>
        </Card>
      </div>
    );

    // 2 ── Payment Management
    if (module === "payments") return (
      <div>
        <AiChip text={`DD success probability for next collection: 96%. Optimal retry date if failure: 5th (estimated payday). No overpayment opportunities flagged.`} color={T.primary} />
        <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
          <KPICard label="Next Payment"  value={selAcc.payment}       sub={selAcc.nextPayment}  color={T.primary} />
          <KPICard label="Current Rate"  value={selAcc.rate}           sub={selAcc.product}      color={T.accent}  />
          <KPICard label="Balance"       value={selAcc.balance}        sub={`LTV ${selAcc.ltv}`} color={T.warning} />
          <KPICard label="AI Risk Score" value={selAcc.aiRisk==="low"?"Low":selAcc.aiRisk==="medium"?"Medium":"High"}
            sub="DD failure risk" color={selAcc.aiRisk==="low"?T.success:selAcc.aiRisk==="medium"?T.warning:T.danger} />
        </div>
        <Card noPad>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Payment History</span>
            <div style={{ display:"flex", gap:8 }}><Btn small>Record Payment</Btn><Btn small ghost>DD Management</Btn></div>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:T.bg }}>
              {["Date","Type","Amount","Status","Reference"].map(h =>
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {MOCK_SVC_PAYMENTS.map((p,i) => (
                <tr key={i} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                  <td style={{ padding:"11px 16px", fontSize:13, color:T.textMuted, fontFamily:"monospace" }}>{p.date}</td>
                  <td style={{ padding:"11px 16px", fontSize:13 }}>{p.type}</td>
                  <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600 }}>{p.amount}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ background:p.status==="Collected"?T.successBg:T.dangerBg,
                      color:p.status==="Collected"?T.success:T.danger,
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>{p.status}</span>
                  </td>
                  <td style={{ padding:"11px 16px", fontSize:12, color:T.textMuted, fontFamily:"monospace" }}>{p.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );

    // 3 ── Arrears Management
    if (module === "arrears") return (
      <div>
        {selAcc.arrears
          ? <AiChip text={`Arrears of ${selAcc.arrears} detected. Recommended action: contact customer within 24h. Based on profile, 3-month reduced payment arrangement has 82% recovery probability. Contact method: SMS at 6pm (highest response rate).`} color={T.danger} />
          : <AiChip text="No arrears on this account. Payment pattern healthy. Early warning indicators negative." color={T.success} />}
        {selAcc.arrears ? (
          <div>
            <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
              <KPICard label="Arrears Balance" value={selAcc.arrears}  sub="total outstanding"   color={T.danger}  />
              <KPICard label="Months in Arrears" value="2"             sub="since Feb 2026"     color={T.warning} />
              <KPICard label="Recovery Prob."   value="82%"            sub="with arrangement"   color={T.success} />
              <KPICard label="Contact Method"   value="SMS"            sub="6pm optimal"        color={T.primary} />
            </div>
            <Card>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Forbearance Options</div>
              {[
                { label:"Payment Holiday (2 months)", detail:"Payments deferred, interest accrues (+£290). Approval: within your authority.", rec:true  },
                { label:"Reduced Payments (£500/mo for 3 months)", detail:"Covers interest only. Arrears to be repaid over 12 months. Team leader approval required.", rec:false },
                { label:"Term Extension (20→25 years)", detail:"Reduces monthly by £180 permanently. Underwriter approval required.", rec:false },
                { label:"Capitalise Arrears", detail:"Add arrears to balance, recalculate schedule. Underwriter approval required.", rec:false },
              ].map(opt => (
                <div key={opt.label} style={{ padding:"12px 14px", borderRadius:10, marginBottom:8,
                    border:`1.5px solid ${opt.rec ? T.success : T.border}`,
                    background: opt.rec ? T.successBg : T.card }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{opt.label}</div>
                    {opt.rec && <span style={{ fontSize:10, fontWeight:700, color:T.success, background:`${T.success}18`, padding:"2px 8px", borderRadius:5 }}>AI Recommended</span>}
                  </div>
                  <div style={{ fontSize:12, color:T.textSecondary, marginBottom:8 }}>{opt.detail}</div>
                  <Btn small primary={opt.rec}>Apply Arrangement</Btn>
                </div>
              ))}
            </Card>
          </div>
        ) : (
          <Card style={{ padding:40, textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>✓</div>
            <div style={{ fontSize:14, fontWeight:600, color:T.success }}>Account performing</div>
            <div style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>No arrears management required</div>
          </Card>
        )}
      </div>
    );

    // 4 ── Payment Holidays
    if (module === "holidays") {
      const hAdditionalInterest = holidayMonths * 180;
      const hCurrentPayment = parseFloat(selAcc.payment.replace(/[£,]/g, ""));
      const hNewPayment = hCurrentPayment + (holidayMonths * 4);
      const hAiText = holidayMonths <= 2
        ? `A short ${holidayMonths}-month holiday has minimal long-term impact. Additional cost: £${hAdditionalInterest}. Recommended for temporary cash-flow relief.`
        : holidayMonths <= 4
        ? `A ${holidayMonths}-month holiday adds £${hAdditionalInterest} in interest. Monthly payment increases by £${holidayMonths * 4} after resumption. Consider interest-only as a lower-cost alternative.`
        : `A ${holidayMonths}-month holiday is significant. £${hAdditionalInterest} additional interest and ${holidayMonths}-month term extension. Affordability review recommended before approval.`;
      const forbearanceOptions = [
        { type: "full", label: "Full Holiday", desc: "No payments for the duration", costPerMonth: 180, termImpact: "Extended" },
        { type: "interestOnly", label: "Interest Only", desc: "Pay interest only, defer principal", costPerMonth: 90, termImpact: "Principal deferred" },
        { type: "reduced", label: "Reduced Payments", desc: "50% of normal payment", costPerMonth: 120, termImpact: "Arrears cleared later" },
        { type: "extension", label: "Term Extension", desc: "Extend term, keep payments level", costPerMonth: 0, termImpact: "Permanent extension" },
      ];
      return (
        <div>
          <AiChip text={hAiText} color={holidayMonths <= 2 ? T.success : holidayMonths <= 4 ? T.warning : T.danger} />
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Holiday Duration: {holidayMonths} month{holidayMonths > 1 ? "s" : ""}</div>
            <input type="range" min={1} max={6} value={holidayMonths} onChange={e => setHolidayMonths(+e.target.value)}
              style={{ width: "100%", accentColor: T.primary, height: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              <span>1 month</span><span>6 months</span>
            </div>
          </Card>
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <KPICard label="Additional Interest" value={`£${hAdditionalInterest.toLocaleString()}`} sub="accrued during holiday" color={T.warning} />
            <KPICard label="Term Extension" value={`${holidayMonths} mo`} sub="added to mortgage" color={T.primary} />
            <KPICard label="New Payment" value={`£${hNewPayment.toLocaleString()}`} sub="after resumption" color={T.accent} />
            <KPICard label="Total Cost" value={`£${hAdditionalInterest.toLocaleString()}`} sub="lifetime cost of holiday" color={T.danger} />
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Timeline</div>
            <div style={{ display: "flex", height: 36, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <div style={{ flex: 6, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: T.success }}>Payments</div>
              <div style={{ flex: holidayMonths, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#D97706", minWidth: 60 }}>HOLIDAY ({holidayMonths}mo)</div>
              <div style={{ flex: 6, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: T.success }}>Resumed</div>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            {forbearanceOptions.map(opt => (
              <div key={opt.type} onClick={() => setHolidayType(opt.type)}
                style={{ background: holidayType === opt.type ? T.primaryLight : T.card, border: `1.5px solid ${holidayType === opt.type ? T.primary : T.border}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: holidayType === opt.type ? T.primary : T.text, marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 8 }}>{opt.desc}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: T.textMuted }}>
                  <span>Cost: <strong style={{ color: T.text }}>£{(opt.costPerMonth * holidayMonths).toLocaleString()}</strong></span>
                  <span>Term: <strong style={{ color: T.text }}>{opt.termImpact}</strong></span>
                </div>
              </div>
            ))}
          </div>
          <Btn primary style={{ width: "100%" }}>Confirm Payment Holiday</Btn>
        </div>
      );
    }

    // 5 ── Loan Rescheduling
    if (module === "reschedule") {
      const rCurrentPayment = parseFloat(selAcc.payment.replace(/[£,]/g, ""));
      const rReduction = (reschedTerm - 22) * 39;
      const rNewPayment = Math.max(rCurrentPayment - rReduction, 600);
      const rExtraInterest = (reschedTerm - 22) * 5680;
      const rSustainability = Math.max(98 - (reschedTerm - 22) * 1.4, 70);
      const rBarMax = Math.max(rCurrentPayment, rNewPayment);
      return (
        <div>
          <AiChip text={`Extending term from 22 to ${reschedTerm} years reduces monthly payment by £${rReduction.toLocaleString()} (to £${rNewPayment.toLocaleString()}). Extra lifetime interest: £${rExtraInterest.toLocaleString()}. Sustainability: ${rSustainability.toFixed(0)}%.`} color={T.primary} />
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>New Term: {reschedTerm} years</div>
            <input type="range" min={15} max={35} value={reschedTerm} onChange={e => setReschedTerm(+e.target.value)}
              style={{ width: "100%", accentColor: T.primary, height: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              <span>15 years</span><span>35 years</span>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Current</div>
              {[["Term", "22 years"], ["Monthly Payment", selAcc.payment], ["Balance", selAcc.balance], ["Rate", selAcc.rate]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: T.primary }}>After Reschedule</div>
              {[["Term", `${reschedTerm} years`], ["Monthly Payment", `£${rNewPayment.toLocaleString()}`], ["Payment Reduction", `£${rReduction}/mo`], ["Extra Interest", `£${rExtraInterest.toLocaleString()}`], ["Sustainability", `${rSustainability.toFixed(0)}%`]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span>
                  <span style={{ fontWeight: 600, color: k === "Sustainability" ? (rSustainability > 85 ? T.success : T.warning) : T.text }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Monthly Payment Comparison</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: T.textMuted, width: 60 }}>Current</span>
              <div style={{ flex: 1, background: T.bg, borderRadius: 6, height: 24, overflow: "hidden" }}>
                <div style={{ width: `${(rCurrentPayment / rBarMax) * 100}%`, height: "100%", background: T.primary, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>£{rCurrentPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: T.textMuted, width: 60 }}>New</span>
              <div style={{ flex: 1, background: T.bg, borderRadius: 6, height: 24, overflow: "hidden" }}>
                <div style={{ width: `${(rNewPayment / rBarMax) * 100}%`, height: "100%", background: T.success, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>£{rNewPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn primary>Confirm Reschedule</Btn>
            <Btn ghost>Save Scenario</Btn>
          </div>
        </div>
      );
    }

    // 10 ── Rate Switch (P0)
    if (module === "rateswitch") return (
      <div>
        <AiChip text={`Rate expires ${selAcc.rateEnd}. Without action, ${selAcc.name} moves to SVR at 7.99% — payment increases by £730/month. Proactive switch recommended.`} color={selAcc.rateEnd==="SVR"?T.danger:T.warning} />
        <Card noPad style={{ marginBottom:14 }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, fontSize:13, fontWeight:600 }}>
            Available Products — {selAcc.name}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:T.bg }}>
              {["Product","Rate","Monthly","ERC","vs Current",""].map(h =>
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {MOCK_RATE_SWITCH_PRODUCTS.map(p => (
                <tr key={p.name} style={{ borderTop:`1px solid ${T.borderLight}`, background:p.rec?T.successBg:T.card }}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{p.name}</div>
                      {p.rec && <span style={{ fontSize:10, fontWeight:700, color:T.success, background:`${T.success}18`, padding:"2px 7px", borderRadius:5 }}>Recommended</span>}
                    </div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{p.reason}</div>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:T.primary }}>{p.rate}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600 }}>{p.monthly}</td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:T.textMuted }}>{p.erc}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600,
                    color:p.saving.startsWith("+") ? T.success : p.saving.startsWith("-") ? T.danger : T.textMuted }}>
                    {p.saving}
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    {p.name!=="SVR (default)" && <Btn small primary={p.rec}>Switch</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );

    // 11 ── Redemption
    if (module === "redemption") {
      const rdBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      const rdAccrued = 1243;
      const rdERC = Math.round(rdBalance * 0.02);
      const rdDischarge = 295;
      const rdFullSettlement = rdBalance + rdAccrued + rdERC + rdDischarge;
      const rdPartialRemaining = rdBalance - partialRedemption;
      const rdCurrentPayment = parseFloat(selAcc.payment.replace(/[£,]/g, ""));
      const rdPartialNewPayment = partialRedemption > 0 ? Math.round(rdCurrentPayment * (rdPartialRemaining / rdBalance)) : rdCurrentPayment;
      const rdInterestSaved = Math.round(partialRedemption * 0.035 * 10);
      const rdTermReduction = Math.round(partialRedemption / rdCurrentPayment);
      return (
        <div>
          <AiChip text="Settlement quote valid for 30 days. ERC applies until rate end date. No Rightmove or solicitor activity detected — no imminent redemption predicted." color={T.primary} />
          <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
            {["full", "partial"].map(tab => (
              <div key={tab} onClick={() => setRedemptionTab(tab)}
                style={{ flex: 1, padding: "10px 16px", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: redemptionTab === tab ? T.primary : T.card, color: redemptionTab === tab ? "#fff" : T.text,
                  borderRadius: tab === "full" ? "8px 0 0 8px" : "0 8px 8px 0", border: `1px solid ${T.primary}` }}>
                {tab === "full" ? "Full Redemption" : "Partial Redemption"}
              </div>
            ))}
          </div>
          {redemptionTab === "full" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Card>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Settlement Quote</div>
                {[
                  ["Outstanding Balance", `£${rdBalance.toLocaleString()}`],
                  ["Accrued Interest", `£${rdAccrued.toLocaleString()}`],
                  ["Early Repayment Charge (2%)", `£${rdERC.toLocaleString()}`],
                  ["Discharge Fee", `£${rdDischarge}`],
                  ["Total Settlement Figure", `£${rdFullSettlement.toLocaleString()}`],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
                    borderBottom: `1px solid ${T.borderLight}`, fontSize: 13,
                    fontWeight: i === 4 ? 700 : 400, color: i === 4 ? T.primary : T.text }}>
                    <span style={{ color: i === 4 ? T.primary : T.textSecondary }}>{k}</span><span>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Btn primary small>Issue Quote</Btn><Btn small ghost>Download PDF</Btn>
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Redemption Process</div>
                {[
                  { step: "Quote generated", done: false },
                  { step: "Customer confirms", done: false },
                  { step: "Funds received", done: false },
                  { step: "Balance cleared", done: false },
                  { step: "Discharge filed", done: false },
                  { step: "Account closed", done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${s.done ? T.success : T.border}`,
                      background: s.done ? T.success : "transparent", display: "flex", alignItems: "center",
                      justifyContent: "center", color: s.done ? "#fff" : T.textMuted, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 13, color: s.done ? T.success : T.textSecondary }}>{s.step}</div>
                  </div>
                ))}
              </Card>
            </div>
          ) : (
            <div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Partial Redemption Amount: £{partialRedemption.toLocaleString()}</div>
                <input type="range" min={0} max={rdBalance} step={1000} value={partialRedemption} onChange={e => setPartialRedemption(+e.target.value)}
                  style={{ width: "100%", accentColor: T.primary, height: 6 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                  <span>£0</span><span>£{rdBalance.toLocaleString()}</span>
                </div>
              </Card>
              <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
                <KPICard label="Remaining Balance" value={`£${rdPartialRemaining.toLocaleString()}`} sub="after partial payment" color={T.primary} />
                <KPICard label="New Monthly" value={`£${rdPartialNewPayment.toLocaleString()}`} sub="reduced payment" color={T.success} />
                <KPICard label="Interest Saved" value={`£${rdInterestSaved.toLocaleString()}`} sub="over remaining term" color={T.accent} />
                <KPICard label="Term Reduction" value={`${rdTermReduction} mo`} sub="shorter mortgage" color={T.warning} />
              </div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Settlement Breakdown</div>
                {[
                  ["Partial Payment", `£${partialRedemption.toLocaleString()}`],
                  ["ERC on portion (2%)", `£${Math.round(partialRedemption * 0.02).toLocaleString()}`],
                  ["Total Required", `£${(partialRedemption + Math.round(partialRedemption * 0.02)).toLocaleString()}`],
                ].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                    borderBottom: `1px solid ${T.borderLight}`, fontSize: 13, fontWeight: i === 2 ? 700 : 400 }}>
                    <span style={{ color: T.textSecondary }}>{k}</span><span>{v}</span>
                  </div>
                ))}
              </Card>
              <Btn primary>Process Partial Redemption</Btn>
            </div>
          )}
        </div>
      );
    }

    // 14 ── Transaction Adjustments (P0)
    if (module === "txadj") return (
      <div>
        <AiChip text="No unusual adjustment patterns detected on this account. All historical adjustments have valid audit reasons." color={T.success} />
        <Card noPad style={{ marginBottom:14 }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Adjustable Transactions</span>
            <Btn small primary>New Adjustment</Btn>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:T.bg }}>
              {["Date","Type","Amount","Status","Adjustable",""].map(h =>
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {MOCK_SVC_PAYMENTS.map((p,i) => (
                <tr key={i} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                  <td style={{ padding:"11px 16px", fontSize:12, color:T.textMuted, fontFamily:"monospace" }}>{p.date}</td>
                  <td style={{ padding:"11px 16px", fontSize:13 }}>{p.type}</td>
                  <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600 }}>{p.amount}</td>
                  <td style={{ padding:"11px 16px" }}>
                    <span style={{ background:p.status==="Collected"?T.successBg:T.dangerBg,
                      color:p.status==="Collected"?T.success:T.danger,
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>{p.status}</span>
                  </td>
                  <td style={{ padding:"11px 16px", fontSize:12, color:T.success, fontWeight:600 }}>Yes</td>
                  <td style={{ padding:"11px 16px" }}>
                    <Btn small ghost>Reverse</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );

    // 16 ── Customer History
    if (module === "history") return (
      <div>
        <AiChip text="Customer account in good standing for 4 years. 1 payment failure (Dec 2025) resolved by retry. Overpayment of £2,950 in Feb 2026 reduced term by 2 months." color={T.primary} />
        <Card noPad style={{ marginBottom:14 }}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Account Timeline</span>
            <div style={{ display:"flex", gap:8 }}>
              <Btn small ghost>Annual Statement</Btn>
              <Btn small ghost>Interest Certificate</Btn>
              <Btn small ghost>Download All</Btn>
            </div>
          </div>
          <div style={{ padding:"12px 20px" }}>
            {MOCK_SVC_TIMELINE.map((t,i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:14, position:"relative" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:8, height:8, borderRadius:4, marginTop:5,
                    background: t.cat==="AI Alert"?T.warning:t.cat==="Payment"?T.success:T.primary }} />
                  {i<MOCK_SVC_TIMELINE.length-1 && <div style={{ position:"absolute", left:3.5, top:13, bottom:-14, width:1, background:T.borderLight }} />}
                </div>
                <div>
                  <div style={{ fontSize:13, color:T.text }}>{t.text}</div>
                  <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{t.ts} · {t.actor}
                    <span style={{ marginLeft:8, background:`${T.primary}15`, color:T.primary,
                      padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:600 }}>{t.cat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );

    // 17 ── Vulnerability Detection (P0)
    if (module === "vulnerability") return (
      <div>
        <AiChip text={`${MOCK_VULN_ALERTS.filter(v=>v.status==="Open").length} open vulnerability alerts across the portfolio. NLP sentiment monitoring active on all customer communications.`}
          color={T.danger} />
        <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
          <KPICard label="Open Alerts"     value={String(MOCK_VULN_ALERTS.filter(v=>v.status==="Open").length)}      sub="require action"   color={T.danger}  />
          <KPICard label="Monitoring"      value={String(MOCK_VULN_ALERTS.filter(v=>v.status==="Monitoring").length)} sub="watching closely" color={T.warning} />
          <KPICard label="Accounts Scanned" value="2,450"  sub="this week"         color={T.primary} />
          <KPICard label="NLP Accuracy"    value="94%"    sub="detection rate"    color={T.success} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {MOCK_VULN_ALERTS.map(a => (
            <div key={a.id} style={{ background:T.card, border:`1.5px solid ${a.status==="Open"?T.danger:T.warning}`,
                borderRadius:12, padding:"16px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:2 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{a.name}</div>
                    <span style={{ fontSize:10, fontFamily:"monospace", color:T.textMuted }}>{a.account}</span>
                    <span style={{ background:a.status==="Open"?T.dangerBg:T.warningBg,
                      color:a.status==="Open"?T.danger:T.warning,
                      fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5 }}>{a.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:T.textSecondary }}>Trigger: <em>{a.trigger}</em></div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:2 }}>AI Score</div>
                  <div style={{ fontSize:22, fontWeight:700, color:a.score>70?T.danger:T.warning }}>{a.score}</div>
                </div>
              </div>
              <div style={{ background:T.bg, borderRadius:8, padding:"8px 12px", fontSize:12,
                  color:T.text, marginBottom:10, borderLeft:`3px solid ${T.danger}` }}>
                {a.flag}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, color:T.textMuted }}>Assigned: <strong>{a.assigned}</strong></div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn small primary>Transfer to Specialist</Btn>
                  <Btn small ghost>Note on Account</Btn>
                  <Btn small ghost>Resolve</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // ── Refinance / Further Advance
    if (module === "refinance") {
      const fnBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      const fnCurrentLTV = parseFloat(selAcc.ltv) || 58;
      const fnPropertyValue = Math.round(fnBalance / (fnCurrentLTV / 100));
      const fnNewBalance = fnBalance + furtherAdvance;
      const fnNewLTV = ((fnNewBalance / fnPropertyValue) * 100).toFixed(1);
      const fnCurrentPayment = parseFloat(selAcc.payment.replace(/[£,]/g, ""));
      const fnNewPayment = Math.round(fnCurrentPayment * (fnNewBalance / fnBalance));
      const fnMaxAdvance = Math.round(fnPropertyValue * 0.75 - fnBalance);
      return (
        <div>
          <AiChip text={`At current LTV of ${fnCurrentLTV}%, ${selAcc.name} qualifies for up to £${fnMaxAdvance.toLocaleString()} further advance without breaching 75% LTV threshold.`} color={T.primary} />
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <KPICard label="Current Balance" value={selAcc.balance} sub={`LTV ${fnCurrentLTV}%`} color={T.primary} />
            <KPICard label="Property Value" value={`£${fnPropertyValue.toLocaleString()}`} sub="estimated" color={T.accent} />
            <KPICard label="Max Further Advance" value={`£${fnMaxAdvance.toLocaleString()}`} sub="to 75% LTV" color={T.success} />
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Additional Borrowing: £{furtherAdvance.toLocaleString()}</div>
            <input type="range" min={5000} max={Math.max(fnMaxAdvance, 5000)} step={1000} value={furtherAdvance} onChange={e => setFurtherAdvance(+e.target.value)}
              style={{ width: "100%", accentColor: T.primary, height: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              <span>£5,000</span><span>£{fnMaxAdvance.toLocaleString()}</span>
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Impact Summary</div>
              {[
                ["New Total Balance", `£${fnNewBalance.toLocaleString()}`],
                ["New LTV", `${fnNewLTV}%`],
                ["New Monthly Payment", `£${fnNewPayment.toLocaleString()}`],
                ["Payment Increase", `£${(fnNewPayment - fnCurrentPayment).toLocaleString()}/mo`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span>
                  <span style={{ fontWeight: 600, color: k === "New LTV" && parseFloat(fnNewLTV) > 75 ? T.danger : T.text }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Capital Raising Reason</div>
              {["Home improvements", "Debt consolidation", "Other"].map(reason => (
                <div key={reason} style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 8, border: `1.5px solid ${T.border}`,
                  cursor: "pointer", fontSize: 13, color: T.text, background: T.card }}>
                  {reason}
                </div>
              ))}
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 8 }}>Available Products</div>
              {[
                { name: "2yr Fixed 3.89%", monthly: `£${Math.round(fnNewBalance * 0.0389 / 12 + fnNewBalance / 300).toLocaleString()}` },
                { name: "5yr Fixed 4.19%", monthly: `£${Math.round(fnNewBalance * 0.0419 / 12 + fnNewBalance / 300).toLocaleString()}` },
              ].map(p => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.primary, fontWeight: 600 }}>{p.name}</span><span style={{ fontWeight: 600 }}>{p.monthly}/mo</span>
                </div>
              ))}
            </Card>
          </div>
          <Btn primary style={{ width: "100%" }}>Request Further Advance</Btn>
        </div>
      );
    }

    // ── Interest Rate Changes
    if (module === "ratechange") {
      const rcCurrentPayment = parseFloat(selAcc.payment.replace(/[£,]/g, ""));
      const rcChangePerBps = 4.3;
      const rcPaymentDelta = Math.round(rateChangeBps * rcChangePerBps * 4);
      const rcNewPayment = rcCurrentPayment + rcPaymentDelta;
      const rcAnnualImpact = rcPaymentDelta * 12;
      return (
        <div>
          <AiChip text="Next MPC decision: 8 May 2026. Market consensus: hold. No immediate payment impact expected." color={T.primary} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Current Rate Details</div>
              {[
                ["Current Rate", selAcc.rate],
                ["Product Type", selAcc.product],
                ["Rate End Date", selAcc.rateEnd],
                ["Revert Rate (SVR)", "7.99%"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>BoE Base Rate</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: T.primary, marginBottom: 4 }}>4.50%</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Last changed: Feb 2025 (-0.25%)</div>
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
                {[4.75, 4.75, 4.50, 4.50, 4.50, 4.50].map((r, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: "100%", background: i === 5 ? T.primary : T.borderLight, borderRadius: 3, height: `${(r / 5.5) * 60}px` }} />
                    <span style={{ fontSize: 9, color: T.textMuted }}>{["Q1","Q2","Q3","Q4","Q1","Q2"][i]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>If base rate changes by: {rateChangeBps > 0 ? "+" : ""}{(rateChangeBps * 0.25).toFixed(2)}%</div>
            <input type="range" min={-4} max={8} value={rateChangeBps} onChange={e => setRateChangeBps(+e.target.value)}
              style={{ width: "100%", accentColor: T.primary, height: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              <span>-1.00%</span><span>0%</span><span>+2.00%</span>
            </div>
          </Card>
          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <KPICard label="New Payment" value={`£${rcNewPayment.toLocaleString()}`} sub="estimated monthly" color={T.primary} />
            <KPICard label="Change" value={`${rcPaymentDelta >= 0 ? "+" : ""}£${rcPaymentDelta}`} sub="vs current" color={rcPaymentDelta > 0 ? T.danger : rcPaymentDelta < 0 ? T.success : T.textMuted} />
            <KPICard label="Annual Impact" value={`${rcAnnualImpact >= 0 ? "+" : ""}£${rcAnnualImpact.toLocaleString()}`} sub="per year" color={rcAnnualImpact > 0 ? T.danger : T.success} />
          </div>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Notification Preferences</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <div style={{ fontSize: 13, color: T.text }}>Rate change alerts</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Email and SMS when base rate changes</div>
              </div>
              <div style={{ width: 42, height: 24, borderRadius: 12, background: T.success, cursor: "pointer", position: "relative" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, right: 3 }} />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // ── Fees & Penalties
    if (module === "fees") {
      const feeSchedule = [
        { name: "Late Payment Fee", amount: "£25", trigger: "Payment 15+ days late" },
        { name: "Missed DD Fee", amount: "£12", trigger: "Direct Debit failure" },
        { name: "Early Repayment Charge", amount: "2% of balance", trigger: "Redemption during fix period" },
        { name: "Statement Request", amount: "£10", trigger: "Ad-hoc statement" },
        { name: "Discharge Fee", amount: "£295", trigger: "Account closure / redemption" },
        { name: "Duplicate Document", amount: "£25", trigger: "Re-issue of documents" },
      ];
      const appliedFees = [
        { date: "12 Sep 2025", fee: "Late Payment Fee", amount: "£25", status: "Applied", ref: "FEE-20250912" },
        { date: "03 Jul 2025", fee: "Statement Request", amount: "£10", status: "Applied", ref: "FEE-20250703" },
        { date: "18 Mar 2025", fee: "Missed DD Fee", amount: "£12", status: "Waived", ref: "FEE-20250318" },
        { date: "02 Jan 2025", fee: "Late Payment Fee", amount: "£25", status: "Applied", ref: "FEE-20250102" },
      ];
      return (
        <div>
          <AiChip text="No fees charged in last 6 months. Account in good standing — eligible for discretionary fee waiver." color={T.success} />
          <Card noPad style={{ marginBottom: 14 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600 }}>Fee Schedule</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: T.bg }}>
                {["Fee", "Amount", "Trigger"].map(h =>
                  <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {feeSchedule.map((f, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: T.primary }}>{f.amount}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: T.textMuted }}>{f.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card noPad style={{ marginBottom: 14 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600 }}>Applied Fees History</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: T.bg }}>
                {["Date", "Fee", "Amount", "Status", "Reference"].map(h =>
                  <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {appliedFees.map((f, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>{f.date}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13 }}>{f.fee}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>{f.amount}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: f.status === "Applied" ? T.successBg : T.warningBg,
                        color: f.status === "Applied" ? T.success : T.warning,
                        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{f.status}</span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>{f.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Fee Waiver Request</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Select Fee</div>
              <select value={feeWaiverIdx} onChange={e => setFeeWaiverIdx(+e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card }}>
                <option value={-1}>Select a fee to waive...</option>
                {appliedFees.filter(f => f.status === "Applied").map((f, i) => (
                  <option key={i} value={i}>{f.date} — {f.fee} ({f.amount})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Reason for Waiver</div>
              <textarea rows={2} placeholder="Enter justification..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <Btn primary small>Request Waiver</Btn>
          </Card>
        </div>
      );
    }

    // ── Offset & Credit Arrangement
    if (module === "offset") {
      const ofBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      const ofLinkedAccounts = [
        { id: "SA-00412", balance: 26824, name: "Savings Account 1" },
        { id: "SA-00413", balance: 10500, name: "Savings Account 2" },
      ];
      const ofTotalLinked = ofLinkedAccounts.reduce((s, a) => s + a.balance, 0) + offsetExtra;
      const ofNetBalance = Math.max(ofBalance - ofTotalLinked, 0);
      const ofMonthlySaving = Math.round((ofTotalLinked * 0.04) / 12);
      const ofAnnualSaving = ofMonthlySaving * 12;
      return (
        <div>
          <AiChip text={`Offsetting £${ofTotalLinked.toLocaleString()} in linked savings reduces effective balance to £${ofNetBalance.toLocaleString()}. Monthly interest saving: £${ofMonthlySaving}. Annual saving: £${ofAnnualSaving.toLocaleString()}.`} color={T.success} />
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <KPICard label="Mortgage Balance" value={selAcc.balance} sub="gross balance" color={T.primary} />
            <KPICard label="Linked Savings" value={`£${ofTotalLinked.toLocaleString()}`} sub={`${ofLinkedAccounts.length} accounts`} color={T.success} />
            <KPICard label="Net Balance" value={`£${ofNetBalance.toLocaleString()}`} sub="for interest calc" color={T.accent} />
            <KPICard label="Monthly Saving" value={`£${ofMonthlySaving}`} sub={`£${ofAnnualSaving.toLocaleString()}/yr`} color={T.warning} />
          </div>
          <Card noPad style={{ marginBottom: 14 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600 }}>Linked Savings Accounts</div>
            {ofLinkedAccounts.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{a.id}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.success }}>£{a.balance.toLocaleString()}</div>
              </div>
            ))}
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>What if you added more savings? +£{offsetExtra.toLocaleString()}</div>
            <input type="range" min={0} max={50000} step={500} value={offsetExtra} onChange={e => setOffsetExtra(+e.target.value)}
              style={{ width: "100%", accentColor: T.primary, height: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              <span>£0</span><span>£50,000</span>
            </div>
          </Card>
          <Btn primary>Link Additional Account</Btn>
        </div>
      );
    }

    // ── Loan Termination
    if (module === "termination") {
      const tmBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      const tmChecklist = [
        { item: "Outstanding balance", requirement: "Must be £0", met: tmBalance === 0, current: selAcc.balance },
        { item: "Arrears", requirement: "Must be clear", met: !selAcc.arrears, current: selAcc.arrears || "None" },
        { item: "Active disputes", requirement: "None", met: true, current: "None" },
        { item: "Pending transactions", requirement: "None", met: true, current: "None" },
      ];
      const tmAllMet = tmChecklist.every(c => c.met);
      return (
        <div>
          <AiChip text={tmAllMet ? "All termination prerequisites met. No outstanding obligations detected." : "Termination prerequisites not fully met. Resolve outstanding items before proceeding."} color={tmAllMet ? T.success : T.danger} />
          <Card noPad style={{ marginBottom: 14 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600 }}>Termination Checklist</div>
            {tmChecklist.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: c.met ? T.successBg : T.dangerBg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: c.met ? T.success : T.danger, fontWeight: 700 }}>{c.met ? "✓" : "✗"}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.item}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{c.requirement}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.met ? T.success : T.danger }}>{c.current}</div>
              </div>
            ))}
          </Card>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Termination Reason</div>
            <select value={terminationReason} onChange={e => setTerminationReason(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card }}>
              <option value="">Select reason...</option>
              {["Paid in full", "Transferred to another lender", "Voluntary surrender", "Regulatory action"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Card>
          <div style={{ background: `${T.danger}08`, border: `1.5px solid ${T.danger}`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Warning: This action is irreversible</div>
            <div style={{ fontSize: 12, color: T.textSecondary }}>Terminating this account will permanently close it and trigger downstream processes including Land Registry notification.</div>
          </div>
          <Btn primary style={{ width: "100%", opacity: tmAllMet && terminationReason ? 1 : 0.4, pointerEvents: tmAllMet && terminationReason ? "auto" : "none" }}>
            Proceed to Termination
          </Btn>
        </div>
      );
    }

    // ── Write-off
    if (module === "writeoff") {
      const woBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      const woProvision = Math.round(woBalance * 0.65);
      const woAmount = writeoffType === "full" ? woBalance : writeoffAmount;
      const woApprovers = woAmount > 100000
        ? [{ role: "L1 — Collections Manager", status: "Pending" }, { role: "L2 — Head of Credit", status: "Pending" }, { role: "L3 — CFO", status: "Pending" }]
        : woAmount > 50000
        ? [{ role: "L1 — Collections Manager", status: "Pending" }, { role: "L2 — Head of Credit", status: "Pending" }]
        : [{ role: "L1 — Collections Manager", status: "Pending" }];
      const woPnL = woAmount - woProvision;
      return (
        <div>
          <AiChip text="Account has been in arrears for 180+ days with no customer contact. 3 recovery attempts failed. AI recommends: full write-off with regulatory notification." color={T.danger} />
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <KPICard label="Outstanding Balance" value={selAcc.balance} sub="total owed" color={T.danger} />
            <KPICard label="Provision Held" value={`£${woProvision.toLocaleString()}`} sub="65% provisioned" color={T.warning} />
            <KPICard label="Recovery Attempts" value="3" sub="all unsuccessful" color={T.textMuted} />
            <KPICard label="Last Contact" value="180+ days" sub="no response" color={T.danger} />
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Write-off Type</div>
            <div style={{ display: "flex", gap: 0, marginBottom: 14 }}>
              {["full", "partial"].map(t => (
                <div key={t} onClick={() => setWriteoffType(t)}
                  style={{ flex: 1, padding: "10px 16px", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: writeoffType === t ? T.primary : T.card, color: writeoffType === t ? "#fff" : T.text,
                    borderRadius: t === "full" ? "8px 0 0 8px" : "0 8px 8px 0", border: `1px solid ${T.primary}` }}>
                  {t === "full" ? "Full Write-off" : "Partial Write-off"}
                </div>
              ))}
            </div>
            {writeoffType === "partial" && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Write-off Amount: £{writeoffAmount.toLocaleString()}</div>
                <input type="range" min={0} max={woBalance} step={1000} value={writeoffAmount} onChange={e => setWriteoffAmount(+e.target.value)}
                  style={{ width: "100%", accentColor: T.primary, height: 6 }} />
              </div>
            )}
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Approval Chain</div>
              {woApprovers.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: T.warningBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.warning }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.role}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{a.status}</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Financial Impact</div>
              {[
                ["Write-off Amount", `£${woAmount.toLocaleString()}`],
                ["Provision Held", `£${woProvision.toLocaleString()}`],
                ["P&L Impact", `${woPnL > 0 ? "Charge" : "Release"}: £${Math.abs(woPnL).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Mandatory Notes</div>
            <textarea rows={3} value={writeoffNotes} onChange={e => setWriteoffNotes(e.target.value)}
              placeholder="Enter justification for write-off..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card, resize: "vertical", boxSizing: "border-box" }} />
          </Card>
          <Btn primary style={{ width: "100%", opacity: writeoffNotes.length > 0 ? 1 : 0.4 }}>Submit for Approval</Btn>
        </div>
      );
    }

    // ── Account Closure
    if (module === "closure") {
      const clBalance = parseFloat(selAcc.balance.replace(/[£,]/g, ""));
      return (
        <div>
          <AiChip text="Customer is remortgaging. Retention offer was not presented. Consider: competitive rate switch offer before closure completes." color={T.warning} />
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <KPICard label="Final Balance" value={clBalance === 0 ? "£0" : selAcc.balance} sub={clBalance === 0 ? "cleared" : "outstanding"} color={clBalance === 0 ? T.success : T.danger} />
            <KPICard label="Last Payment" value="01 Apr 2026" sub="final collection" color={T.primary} />
            <KPICard label="Account Duration" value="4 yrs 2 mo" sub="since Jan 2022" color={T.accent} />
            <KPICard label="Total Interest Paid" value="£48,290" sub="over lifetime" color={T.warning} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Closure Reason</div>
              <select value={closureReason} onChange={e => setClosureReason(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card, marginBottom: 16 }}>
                <option value="">Select reason...</option>
                {["Mortgage paid off", "Remortgaged elsewhere", "Property sold"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Customer Feedback</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} onClick={() => setClosureRating(s)}
                    style={{ fontSize: 24, cursor: "pointer", color: s <= closureRating ? "#F59E0B" : T.border }}>
                    ★
                  </span>
                ))}
                <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 8, alignSelf: "center" }}>{closureRating > 0 ? `${closureRating}/5` : "Not rated"}</span>
              </div>
              <textarea rows={2} placeholder="Optional comment..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card, resize: "vertical", boxSizing: "border-box" }} />
            </Card>
            <div>
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.warning }}>Retention Opportunity</div>
                <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 10 }}>Customer is closing — consider retention products:</div>
                {["2yr Fixed 3.49% (loyalty rate)", "Offset mortgage with linked savings", "Fee-free product switch"].map(p => (
                  <div key={p} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 6, fontSize: 12, color: T.text, cursor: "pointer" }}>{p}</div>
                ))}
              </Card>
              <Card>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Post-Closure Actions</div>
                {["Issue discharge deed", "Update Land Registry", "Archive documents", "Send closure confirmation"].map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${T.border}`, flexShrink: 0 }} />
                    {a}
                  </div>
                ))}
              </Card>
            </div>
          </div>
          <Btn primary style={{ width: "100%", opacity: closureReason ? 1 : 0.4 }}>Close Account</Btn>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Lending Servicing</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>
            {MOCK_SVC_ACCOUNTS.length} accounts · {MOCK_SVC_ACCOUNTS.filter(a=>a.state==="Active in Arrears").length} in arrears · {MOCK_SVC_ACCOUNTS.filter(a=>a.vuln).length} vulnerability flags
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <AccountPicker />
          <Btn ghost iconNode={Ico.download(16)}>Export</Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Total Portfolio"  value="£2.05M"   sub="7 active accounts"             color={T.primary} />
        <KPICard label="In Arrears"       value="2"        sub="£7,520 total arrears"           color={T.danger}  />
        <KPICard label="Rate Expiring"    value="3"        sub="within 90 days"                color={T.warning} />
        <KPICard label="Vulnerability"    value="2"        sub="open alerts"                   color="#8B5CF6"   />
        <KPICard label="DD Success Rate"  value="97.5%"    sub="last 30 days"                  color={T.success} />
      </div>

      {/* Module nav + content */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
        {/* Left module list */}
        <div style={{ width:220, flexShrink:0, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${T.border}`, fontSize:11, fontWeight:700,
              color:T.textMuted, textTransform:"uppercase", letterSpacing:0.5 }}>17 Modules</div>
          {SVC_MODULES.map(m => (
            <div key={m.id} onClick={() => setModule(m.id)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                cursor:"pointer", borderBottom:`1px solid ${T.borderLight}`,
                background: m.id===module ? T.primaryLight : "transparent",
                borderLeft: m.id===module ? `3px solid ${T.primary}` : "3px solid transparent" }}>
              <span style={{ color: m.id===module ? T.primary : T.textMuted, flexShrink:0 }}>{Ico[m.icon]?.(14)}</span>
              <span style={{ flex:1, fontSize:12, fontWeight: m.id===module ? 600 : 400,
                color: m.id===module ? T.primary : T.text, lineHeight:1.3 }}>{m.label}</span>
              <span style={{ fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:4,
                background:`${PRIORITY_COLOR[m.priority]}18`, color:PRIORITY_COLOR[m.priority] }}>{m.priority}</span>
            </div>
          ))}
        </div>

        {/* Right module content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:T.text }}>{mod?.label}</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Effort: {mod?.effort} · Priority: <strong style={{ color:PRIORITY_COLOR[mod?.priority] }}>{mod?.priority}</strong>
                {selAcc.originationRef && onViewApplication && (
                  <span onClick={() => onViewApplication(selAcc.originationRef)}
                    style={{ marginLeft:10, color:T.primary, cursor:"pointer", fontWeight:600 }}>
                    ← View Application {selAcc.originationRef}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn small ghost iconNode={Ico.clock(14)}>Activity Log</Btn>
            </div>
          </div>
          {renderModule()}
        </div>
      </div>
    </div>
  );
}

export default ServicingScreen;
