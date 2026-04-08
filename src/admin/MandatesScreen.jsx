import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_MANDATES } from "../data/admin";

function MandatesScreen() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]         = useState("All");

  const statuses = ["All","Active","Draft"];
  const filtered = filter === "All" ? MOCK_MANDATES : MOCK_MANDATES.filter(m => m.status === filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Mandates</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Lending authority thresholds and approval requirements</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowCreate(true)}>New Mandate</Btn>
      </div>
      {showCreate && (
        <Card style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Create mandate</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {[["Name","text"],["Scope","text"],["Limit","text"],["Approver","text"]].map(([l,t]) => (
              <div key={l}>
                <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>{l}</div>
                <input type={t} style={{ width:"100%", padding:"9px 12px", borderRadius:8,
                  border:`1.5px solid ${T.border}`, fontSize:13, fontFamily:T.font, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <Btn primary small onClick={() => setShowCreate(false)}>Save Mandate</Btn>
            <Btn small onClick={() => setShowCreate(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {statuses.map(s => (
          <div key={s} onClick={() => setFilter(s)}
            style={{ padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
              background: filter===s ? T.primary : T.card,
              color: filter===s ? "#fff" : T.textSecondary,
              border:`1px solid ${filter===s ? T.primary : T.border}` }}>{s}</div>
        ))}
      </div>
      <Card noPad>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.bg }}>
              {["Mandate","Scope","Limit","Current Usage","Approver","Status","Last Updated",""].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600,
                  color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                <td style={{ padding:"13px 16px", fontSize:13, fontWeight:600, color:T.text }}>{m.name}</td>
                <td style={{ padding:"13px 16px", fontSize:13, color:T.textSecondary }}>{m.scope}</td>
                <td style={{ padding:"13px 16px", fontSize:13, fontWeight:600, color:T.primary }}>{m.limit}</td>
                <td style={{ padding:"13px 16px", fontSize:13, color:T.textSecondary }}>{m.current}</td>
                <td style={{ padding:"13px 16px", fontSize:12, color:T.textSecondary }}>{m.approver}</td>
                <td style={{ padding:"13px 16px" }}>
                  <span style={{
                      background: m.status==="Active" ? T.successBg : T.warningBg,
                      color:      m.status==="Active" ? T.success    : T.warning,
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ padding:"13px 16px", fontSize:12, color:T.textMuted }}>{m.updated}</td>
                <td style={{ padding:"13px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn small ghost>Edit</Btn>
                    <Btn small danger ghost>Revoke</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default MandatesScreen;
