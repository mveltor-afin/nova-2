import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_DISBURSEMENTS } from "../data/disbursements";

function DisbursementsScreen({ currentUser }) {
  const user = currentUser || "Priya Patel"; // Finance user A (maker)
  const [disbs, setDisbs] = useState(MOCK_DISBURSEMENTS);
  const [sel, setSel] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const STATUS_COLOR = {
    "Authorised":          { bg:T.successBg, txt:T.success },
    "Pending Authorisation":{ bg:T.warningBg, txt:T.warning },
    "Rejected":            { bg:T.dangerBg,  txt:T.danger  },
    "Draft":               { bg:T.bg,        txt:T.textMuted },
  };

  const authorise = (id) => {
    setDisbs(prev => prev.map(d => d.id===id
      ? { ...d, status:"Authorised", checker:"James Mitchell", checkerTime:"Now" }
      : d));
    setSel(null);
  };
  const reject = (id) => {
    setDisbs(prev => prev.map(d => d.id===id
      ? { ...d, status:"Rejected", checker:"James Mitchell", checkerTime:"Now", notes:rejectNote||d.notes }
      : d));
    setSel(null);
    setRejectNote("");
  };

  const pendingAuth = disbs.filter(d => d.status === "Pending Authorisation");
  const totalPending = pendingAuth.reduce((s,d) => s + parseFloat(d.amount.replace(/[£,]/g,"")), 0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Disbursements</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>4-eyes authorisation · Maker / Checker</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowCreate(true)}>Create Disbursement</Btn>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Disbursed MTD"    value="£1.87M"  sub="3 completions"          color={T.primary} />
        <KPICard label="Pending Auth"     value={`£${(totalPending/1000).toFixed(0)}k`} sub={`${pendingAuth.length} awaiting checker`} color={T.warning} />
        <KPICard label="Today Scheduled"  value="£510k"   sub="1 completion"            color={T.accent}  />
        <KPICard label="Mandate Headroom" value="£3.8M"   sub="of £5M daily cap"        color={T.success} />
      </div>

      {pendingAuth.length > 0 && (
        <div style={{ padding:"12px 18px", borderRadius:10, background:T.warningBg, border:`1.5px solid ${T.warningBorder}`,
          marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          {Ico.alert(18)}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.warning }}>{pendingAuth.length} disbursement{pendingAuth.length>1?"s":""} awaiting 4-eyes authorisation</div>
            <div style={{ fontSize:12, color:T.text }}>A second Finance authoriser must approve before funds are released. Self-authorisation is not permitted.</div>
          </div>
        </div>
      )}

      <Card noPad style={{ marginBottom:16 }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:600 }}>All Disbursements</div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>
            {["ID","Case","Borrower","Amount","Scheduled","Maker","Checker","Status","Action"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 12px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {disbs.map((d, i) => {
              const sc = STATUS_COLOR[d.status] || {};
              const canAuth = d.status === "Pending Authorisation" && d.maker !== user;
              return (
                <tr key={i} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                  <td style={{ padding:"11px 12px", fontWeight:600, color:T.primary, fontSize:12 }}>{d.id}</td>
                  <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{d.loanId}</td>
                  <td style={{ padding:"11px 12px", fontSize:13 }}>{d.borrower}</td>
                  <td style={{ padding:"11px 12px", fontWeight:700, fontSize:14 }}>{d.amount}</td>
                  <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{d.scheduledDate}</td>
                  <td style={{ padding:"11px 12px", fontSize:12 }}>{d.maker||"—"}</td>
                  <td style={{ padding:"11px 12px", fontSize:12 }}>
                    {d.checker ? <span style={{ color:T.success }}>{d.checker}</span> : d.status==="Pending Authorisation" ? <span style={{ color:T.warning }}>Awaiting</span> : "—"}
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    <span style={{ padding:"3px 9px", borderRadius:5, fontSize:11, fontWeight:600, background:sc.bg, color:sc.txt }}>{d.status}</span>
                  </td>
                  <td style={{ padding:"11px 12px" }}>
                    {canAuth
                      ? <Btn small primary onClick={() => setSel(d)}>Authorise</Btn>
                      : d.status==="Draft"
                        ? <Btn small onClick={() => setSel(d)}>Submit</Btn>
                        : <Btn small ghost onClick={() => setSel(d)}>View</Btn>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Authorisation modal */}
      {sel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <div style={{ background:T.card, borderRadius:16, padding:32, width:520, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>
              {sel.status==="Pending Authorisation" && sel.maker!==user ? "4-Eyes Authorisation Review" : "Disbursement Details"}
            </div>
            <div style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>{sel.id} · {sel.loanId}</div>
            {[["Borrower",sel.borrower],["Amount",sel.amount],["Account",sel.account],
              ["Scheduled",sel.scheduledDate],["Maker",sel.maker||"—"],["Created",sel.makerTime||"—"],["Notes",sel.notes||"—"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.borderLight}`, fontSize:13 }}>
                <span style={{ color:T.textSecondary, fontWeight:500 }}>{k}</span>
                <span style={{ fontWeight: k==="Amount"?700:400 }}>{v}</span>
              </div>
            ))}
            {sel.status === "Pending Authorisation" && sel.maker !== user && (
              <div style={{ marginTop:16 }}>
                <div style={{ padding:"10px 14px", background:T.warningBg, borderRadius:8, fontSize:12, color:T.warning, fontWeight:600, marginBottom:12 }}>
                  You are acting as the independent authoriser (Checker). This is a 4-eyes control. You cannot authorise a disbursement you created.
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>Rejection reason (if rejecting)</div>
                  <input value={rejectNote} onChange={e=>setRejectNote(e.target.value)} placeholder="Enter reason for rejection…"
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <Btn ghost onClick={() => setSel(null)}>Cancel</Btn>
                  <Btn danger onClick={() => reject(sel.id)}>Reject</Btn>
                  <Btn primary onClick={() => authorise(sel.id)} iconNode={Ico.check(15)}>Authorise Disbursement</Btn>
                </div>
              </div>
            )}
            {(sel.status !== "Pending Authorisation" || sel.maker === user) && (
              <div style={{ marginTop:16, display:"flex", justifyContent:"flex-end" }}>
                {sel.maker === user && sel.status === "Pending Authorisation" && (
                  <div style={{ flex:1, fontSize:12, color:T.warning, fontWeight:600 }}>⚠ You created this disbursement — a different authoriser must approve it.</div>
                )}
                <Btn ghost onClick={() => setSel(null)}>Close</Btn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <div style={{ background:T.card, borderRadius:16, padding:32, width:480, boxShadow:"0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Create Disbursement Instruction</div>
            {["Case ID","Borrower Name","Loan Amount","Destination Account","Sort Code","Scheduled Date","Notes"].map(l => (
              <div key={l} style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>{l}</div>
                <input placeholder={`Enter ${l.toLowerCase()}…`}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ padding:"10px 14px", background:T.primaryLight, borderRadius:8, fontSize:12, color:T.primary, marginBottom:16 }}>
              This instruction will be submitted for 4-eyes authorisation. A second Finance authoriser will be required to approve before funds are released.
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <Btn ghost onClick={() => setShowCreate(false)}>Cancel</Btn>
              <Btn primary onClick={() => setShowCreate(false)}>Submit for Authorisation</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisbursementsScreen;
