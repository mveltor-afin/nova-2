import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_AUDIT } from "../data/admin";

function AuditScreen() {
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("All");

  const cats = ["All", ...Array.from(new Set(MOCK_AUDIT.map(a => a.cat)))];
  const catColor = c => ({ Auth:"#8B5CF6", "User Mgmt":T.primary, Loan:T.accent, Finance:T.warning, Config:T.danger }[c] || T.textMuted);

  const shown = MOCK_AUDIT.filter(a =>
    (catFilter==="All" || a.cat===catFilter) &&
    (a.actor.toLowerCase().includes(search.toLowerCase()) ||
     a.action.toLowerCase().includes(search.toLowerCase()) ||
     a.target.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Audit Trail</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>
            Complete tamper-evident log of all platform activity
          </p>
        </div>
        <Btn ghost iconNode={Ico.download(16)}>Export CSV</Btn>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Events Today"   value={String(MOCK_AUDIT.filter(a=>a.ts.startsWith("06 Apr")).length)} sub="across all users"  color={T.primary} />
        <KPICard label="Auth Events"    value={String(MOCK_AUDIT.filter(a=>a.cat==="Auth").length)}           sub="logins & sessions" color="#8B5CF6"  />
        <KPICard label="Loan Actions"   value={String(MOCK_AUDIT.filter(a=>a.cat==="Loan").length)}           sub="case updates"      color={T.accent}  />
        <KPICard label="Config Changes" value={String(MOCK_AUDIT.filter(a=>a.cat==="Config").length)}         sub="flags & settings"  color={T.danger}  />
      </div>
      <Card noPad>
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200, maxWidth:340 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.textMuted }}>{Ico.search(15)}</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search actor, action, target…"
              style={{ width:"100%", padding:"8px 12px 8px 34px", borderRadius:8, border:`1px solid ${T.border}`,
                fontSize:13, fontFamily:T.font, outline:"none", boxSizing:"border-box" }} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {cats.map(c => (
              <div key={c} onClick={() => setCat(c)}
                style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", fontSize:12, fontWeight:600,
                  background: catFilter===c ? T.primary : T.card, color: catFilter===c ? "#fff" : T.textSecondary,
                  border:`1px solid ${catFilter===c ? T.primary : T.border}` }}>{c}</div>
            ))}
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.bg }}>
              {["Timestamp","Actor","Role","Action","Target / Detail","IP","Category"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600,
                  color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(a => (
              <tr key={a.id} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                <td style={{ padding:"11px 16px", fontSize:12, color:T.textMuted, whiteSpace:"nowrap", fontFamily:"monospace" }}>{a.ts}</td>
                <td style={{ padding:"11px 16px", fontSize:13, fontWeight:600, color:T.text }}>{a.actor}</td>
                <td style={{ padding:"11px 16px", fontSize:12, color:T.textSecondary }}>{a.role}</td>
                <td style={{ padding:"11px 16px", fontSize:13, color:T.text }}>{a.action}</td>
                <td style={{ padding:"11px 16px", fontSize:12, color:T.textSecondary, maxWidth:260 }}>{a.target}</td>
                <td style={{ padding:"11px 16px", fontSize:11, color:T.textMuted, fontFamily:"monospace" }}>{a.ip}</td>
                <td style={{ padding:"11px 16px" }}>
                  <span style={{ background:`${catColor(a.cat)}18`, color:catColor(a.cat),
                      fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5 }}>{a.cat}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, fontSize:12, color:T.textMuted }}>
          Showing {shown.length} of {MOCK_AUDIT.length} events. Logs are retained for 7 years per FCA requirements.
        </div>
      </Card>
    </div>
  );
}

export default AuditScreen;
