import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_SESSIONS, MOCK_USERS } from "../data/admin";

function SessionsScreen() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revoke = id => setSessions(s => s.map(x => x.id===id ? {...x, revoked:true} : x));
  const revokeAll = () => setSessions(s => s.map(x => x.current ? x : {...x, revoked:true}));

  const active = sessions.filter(s => !s.revoked);
  const revoked = sessions.filter(s => s.revoked);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Session Management</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>
            {active.length} active session{active.length!==1?"s":""} across all users
          </p>
        </div>
        <Btn danger onClick={revokeAll}>Revoke All Other Sessions</Btn>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Active Sessions"  value={String(active.length)}  sub="across all users"      color={T.success} />
        <KPICard label="Revoked Today"    value={String(revoked.length)} sub="manually terminated"   color={T.danger}  />
        <KPICard label="MFA Enforced"     value={`${sessions.filter(s=>MOCK_USERS.find(u=>u.name===s.user)?.mfa).length}/${sessions.length}`} sub="sessions with MFA" color={T.primary} />
        <KPICard label="Idle &gt;15 min" value={String(sessions.filter(s=>!s.revoked && parseInt(s.idle)>15).length)} sub="may need review" color={T.warning} />
      </div>
      <Card noPad>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.bg }}>
              {["User","Role","Device","IP Address","Location","Started","Idle","Status",""].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600,
                  color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ borderTop:`1px solid ${T.borderLight}`,
                  opacity: s.revoked ? 0.45 : 1, background: s.current ? `${T.successBg}` : T.card }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${T.primary},${T.accent})`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>
                      {s.user.split(" ").map(x=>x[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{s.user}</div>
                      {s.current && <div style={{ fontSize:10, color:T.success, fontWeight:600 }}>● Current session</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:T.textSecondary }}>{s.role}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:T.textSecondary }}>{s.device}</td>
                <td style={{ padding:"12px 16px", fontSize:12, fontFamily:"monospace", color:T.textSecondary }}>{s.ip}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:T.textSecondary }}>{s.location}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:T.textSecondary }}>{s.started}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color: parseInt(s.idle)>15?T.warning:T.textSecondary }}>{s.idle}</td>
                <td style={{ padding:"12px 16px" }}>
                  {s.revoked
                    ? <span style={{ fontSize:11, color:T.danger, fontWeight:600 }}>Revoked</span>
                    : s.suspended
                    ? <span style={{ fontSize:11, color:T.textMuted, fontWeight:600 }}>Suspended</span>
                    : <span style={{ fontSize:11, color:T.success, fontWeight:600 }}>● Active</span>}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  {!s.current && !s.revoked && (
                    <Btn small danger ghost onClick={() => revoke(s.id)}>Revoke</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default SessionsScreen;
