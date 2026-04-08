import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";
import { MOCK_VALUATIONS, MOCK_SURVEYORS } from "../data/valuations";
import { VAL_STATUS_COLOR } from "./ApplicationDetail";

function ValuationScreen() {
  const [selLoanId, setSelLoanId] = useState(null);
  const [showInstruct, setShowInstruct] = useState(false);
  const [selSurveyor, setSelSurveyor] = useState("");
  const [selType, setSelType] = useState("Full");

  const loan = selLoanId ? MOCK_LOANS.find(l => l.id === selLoanId) : null;
  const val  = selLoanId ? MOCK_VALUATIONS[selLoanId] : null;

  const MiniBar = ({ pct, color }) => (
    <div style={{ height:6, background:T.borderLight, borderRadius:3, width:"100%", marginTop:4 }}>
      <div style={{ height:6, borderRadius:3, background:color||T.primary, width:`${pct}%`, transition:"width 0.4s" }} />
    </div>
  );

  if (loan && val) return (
    <div>
      <div style={{ marginBottom:16, display:"flex", alignItems:"center", gap:14 }}>
        <span style={{ fontSize:13, color:T.primary, cursor:"pointer", fontWeight:500 }} onClick={() => setSelLoanId(null)}>← All Valuations</span>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>{loan.id} — Valuation</h1>
            <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700,
              background: VAL_STATUS_COLOR[val.status]?.bg, color: VAL_STATUS_COLOR[val.status]?.txt }}>{val.status}</span>
          </div>
          <p style={{ margin:0, fontSize:13, color:T.textSecondary }}>{loan.names} · {loan.product} · {loan.amount}</p>
        </div>
        {(!val.instructed && val.status !== "Report Received") && (
          <Btn primary iconNode={Ico.assign(16)} onClick={() => setShowInstruct(true)}>Instruct Surveyor</Btn>
        )}
      </div>

      {/* AVM Panel */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            {Ico.sparkle(16)}<span>Automated Valuation Model (AVM)</span>
            <span style={{ marginLeft:"auto", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4,
              background: val.avm.confidence>85?T.successBg:val.avm.confidence>70?T.warningBg:T.dangerBg,
              color: val.avm.confidence>85?T.success:val.avm.confidence>70?T.warning:T.danger }}>
              {val.avm.confidence}% confidence
            </span>
          </div>
          <div style={{ fontSize:28, fontWeight:800, color:T.text, marginBottom:4 }}>{val.avm.value}</div>
          <div style={{ fontSize:12, color:T.textMuted, marginBottom:12 }}>Range: {val.avm.range}</div>
          <MiniBar pct={val.avm.confidence} color={val.avm.confidence>85?T.success:val.avm.confidence>70?T.warning:T.danger} />
          <div style={{ marginTop:12, padding:"10px 12px", background:T.bg, borderRadius:8, fontSize:12, color:T.textSecondary, borderLeft:`3px solid ${T.accent}` }}>
            <strong>Nova AI:</strong> AVM confidence {val.avm.confidence >= 85 ? "is high — no mandatory physical inspection required for this LTV tier." : "is moderate — recommend desktop or full valuation before offer."}
          </div>
          {val.avm.confidence < 80 && (
            <div style={{ marginTop:10, padding:"8px 12px", background:T.warningBg, borderRadius:8, fontSize:12, color:T.warning, fontWeight:600 }}>
              ⚠ Low AVM confidence — physical valuation required before proceeding.
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Instruction Details</div>
          {[
            ["Valuation Type",   val.type || "—"],
            ["Surveyor",         val.surveyorId ? MOCK_SURVEYORS.find(s=>s.id===val.surveyorId)?.firm||"—" : "Not instructed"],
            ["Instructed",       val.instructed || "—"],
            ["Completed",        val.completed  || val.status === "Instructed" ? (val.completed || "Pending") : "—"],
          ].map(([k,v],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
              <span style={{ color:T.textSecondary }}>{k}</span>
              <span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Surveyor Report */}
      {val.report ? (
        <Card>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>Surveyor Report</div>
            {val.report.downVal && (
              <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700, background:T.dangerBg, color:T.danger }}>Down-Valuation</span>
            )}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:16 }}>
            {[["Report Value",val.report.value],["Property Type",val.report.type],
              ["Condition",val.report.condition],["Bedrooms",val.report.rooms],["Tenure",val.report.tenure]].map(([k,v],i) => (
              <div key={i}>
                <div style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4, marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
              </div>
            ))}
          </div>
          {val.report.downVal && (
            <div style={{ padding:"14px 16px", background:T.dangerBg, borderRadius:10, border:`1px solid ${T.dangerBorder}`, marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.danger, marginBottom:6 }}>Down-Valuation Alert</div>
              <div style={{ fontSize:13, color:T.text }}>Surveyor value <strong>{val.report.value}</strong> is below purchase price. Options:</div>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <Btn small danger>Decline Application</Btn>
                <Btn small>Request Renegotiation</Btn>
                <Btn small>Request Reinspection</Btn>
              </div>
            </div>
          )}
          {val.report.restrictions.length > 0 && (
            <div style={{ padding:"10px 14px", background:T.warningBg, borderRadius:8, border:`1px solid ${T.warningBorder}`, fontSize:13, color:T.text }}>
              <strong style={{ color:T.warning }}>Restrictions:</strong> {val.report.restrictions.join("; ")}
            </div>
          )}
          {val.report.retention && (
            <div style={{ marginTop:10, padding:"10px 14px", background:T.primaryLight, borderRadius:8, fontSize:13, color:T.text }}>
              <strong>Retention:</strong> {val.report.retention}
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ textAlign:"center", padding:40, color:T.textMuted }}>
          {val.status === "Instructed"
            ? `Awaiting report from ${MOCK_SURVEYORS.find(s=>s.id===val.surveyorId)?.firm}. Expected within ${MOCK_SURVEYORS.find(s=>s.id===val.surveyorId)?.sla}.`
            : "No surveyor report yet. Instruct a surveyor to proceed."}
        </Card>
      )}

      {/* Instruct modal */}
      {showInstruct && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <div style={{ background:T.card, borderRadius:16, padding:32, width:480, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Instruct Surveyor</div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:6 }}>Valuation Type</div>
              {["AVM","Desktop","Drive-by","Full","Structural"].map(t => (
                <span key={t} onClick={() => setSelType(t)} style={{ display:"inline-block", marginRight:8, marginBottom:8,
                  padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer",
                  background:selType===t?T.primary:T.bg, color:selType===t?"#fff":T.text,
                  border:`1px solid ${selType===t?T.primary:T.border}` }}>{t}</span>
              ))}
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:8 }}>Select Surveyor</div>
              {MOCK_SURVEYORS.filter(s=>s.active).map(s => (
                <div key={s.id} onClick={() => setSelSurveyor(s.id)}
                  style={{ padding:"10px 14px", borderRadius:9, marginBottom:8, cursor:"pointer", border:`1.5px solid ${selSurveyor===s.id?T.primary:T.border}`,
                    background:selSurveyor===s.id?T.primaryLight:T.card }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, fontWeight:600 }}>{s.firm}</span>
                    <span style={{ fontSize:12, color:T.accent, fontWeight:600 }}>★ {s.rating}</span>
                  </div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:3 }}>{s.coverage} · SLA: {s.sla} · Fee: {s.fee}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn ghost onClick={() => setShowInstruct(false)}>Cancel</Btn>
              <Btn primary disabled={!selSurveyor} onClick={() => setShowInstruct(false)}>Confirm Instruction</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // List view
  const downVals = Object.values(MOCK_VALUATIONS).filter(v => v.status === "Down-Valuation").length;
  const pending  = Object.values(MOCK_VALUATIONS).filter(v => v.status === "AVM Only" || v.status === "Not Instructed").length;
  const received = Object.values(MOCK_VALUATIONS).filter(v => v.status === "Report Received").length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Valuations</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>AVM, instruction management and report review</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Total"          value={String(Object.keys(MOCK_VALUATIONS).length)} sub="across all live cases" color={T.primary} />
        <KPICard label="Reports Received" value={String(received)} sub="ready for review"   color={T.success} />
        <KPICard label="Pending Instruction" value={String(pending)} sub="AVM only or not started" color={T.warning} />
        <KPICard label="Down-Valuations" value={String(downVals)} sub="require action"       color={T.danger}  />
      </div>
      <Card noPad>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:600 }}>All Valuations</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>
            {["Case","Borrower","Purchase Price","AVM","AVM Conf.","Type","Status","Action"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 14px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {MOCK_LOANS.map((loan, i) => {
              const v = MOCK_VALUATIONS[loan.id];
              if (!v) return null;
              const sc = VAL_STATUS_COLOR[v.status] || {};
              return (
                <tr key={i} style={{ borderTop:`1px solid ${T.borderLight}`, cursor:"pointer" }} onClick={() => setSelLoanId(loan.id)}>
                  <td style={{ padding:"11px 14px", fontWeight:600, color:T.primary, fontSize:13 }}>{loan.id}</td>
                  <td style={{ padding:"11px 14px", fontSize:13 }}>{loan.names}</td>
                  <td style={{ padding:"11px 14px", fontWeight:500 }}>{loan.amount}</td>
                  <td style={{ padding:"11px 14px", fontWeight:600 }}>{v.avm.value}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ width:40, height:4, borderRadius:2, background:T.borderLight, position:"relative" }}>
                        <div style={{ position:"absolute", left:0, top:0, height:4, borderRadius:2,
                          width:`${v.avm.confidence}%`, background:v.avm.confidence>85?T.success:v.avm.confidence>70?T.warning:T.danger }} />
                      </div>
                      <span style={{ fontSize:12, color:T.textMuted }}>{v.avm.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding:"11px 14px", fontSize:12, color:T.textMuted }}>{v.type || "—"}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:5, fontSize:11, fontWeight:600, background:sc.bg, color:sc.txt }}>{v.status}</span>
                  </td>
                  <td style={{ padding:"11px 14px" }}>
                    <Btn small onClick={e => { e.stopPropagation(); setSelLoanId(loan.id); }}>{v.status === "AVM Only" || v.status === "Not Instructed" ? "Instruct →" : "Review →"}</Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default ValuationScreen;
