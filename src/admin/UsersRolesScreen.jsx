import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_USERS, MOCK_ROLES } from "../data/admin";

function UsersRolesScreen() {
  const [tab, setTab]           = useState("users");
  const [search, setSearch]     = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite]     = useState({ name:"", email:"", role:"Ops" });

  const Tabs = () => (
    <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${T.border}`, marginBottom:20 }}>
      {[["users","Users"],["roles","Roles"],["permissions","Permission Sets"]].map(([id,label]) => (
        <div key={id} onClick={() => setTab(id)} style={{ padding:"10px 20px", cursor:"pointer",
            fontSize:13, fontWeight:600, color:tab===id?T.primary:T.textMuted,
            borderBottom:`2px solid ${tab===id?T.primary:"transparent"}`, marginBottom:-1 }}>{label}</div>
      ))}
    </div>
  );

  const roleColor = r => (MOCK_ROLES.find(x => x.name===r)||{color:T.textMuted}).color;

  if (tab === "users") return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Users &amp; Roles</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>{MOCK_USERS.length} users · {MOCK_ROLES.length} roles</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowInvite(true)}>Invite User</Btn>
      </div>
      {showInvite && (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:22, marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Invite new user</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["name","Full name","text"],["email","Email address","email"]].map(([f,l,t]) => (
              <div key={f} style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>{l}</div>
                <input value={invite[f]} onChange={e => setInvite(p=>({...p,[f]:e.target.value}))} type={t}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`,
                    fontSize:13, fontFamily:T.font, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>Role</div>
              <select value={invite.role} onChange={e => setInvite(p=>({...p,role:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`,
                  fontSize:13, fontFamily:T.font, outline:"none", background:T.card }}>
                {MOCK_ROLES.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <Btn primary small onClick={() => setShowInvite(false)}>Send Invite</Btn>
            <Btn small onClick={() => setShowInvite(false)}>Cancel</Btn>
          </div>
        </div>
      )}
      <Card noPad>
        <div style={{ padding:"12px 16px 0" }}><Tabs /></div>
        <div style={{ padding:"0 16px 12px", display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, maxWidth:320 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:T.textMuted }}>{Ico.search(15)}</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users…"
              style={{ width:"100%", padding:"8px 12px 8px 34px", borderRadius:8, border:`1px solid ${T.border}`,
                fontSize:13, fontFamily:T.font, outline:"none", boxSizing:"border-box" }} />
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.bg }}>
              {["User","Email","Role","Team","MFA","Status","Last active",""].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600,
                  color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.filter(u =>
              u.name.toLowerCase().includes(search.toLowerCase()) ||
              u.email.toLowerCase().includes(search.toLowerCase())
            ).map(u => (
              <tr key={u.id} style={{ borderTop:`1px solid ${T.borderLight}` }}>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${T.primary},${T.accent})`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {u.name.split(" ").map(x=>x[0]).join("").slice(0,2)}
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{u.name}</div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13, color:T.textSecondary }}>{u.email}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ background:`${roleColor(u.role)}18`, color:roleColor(u.role),
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:700 }}>{u.role}</span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:13, color:T.textSecondary }}>{u.team}</td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ fontSize:12, color: u.mfa?T.success:T.danger, fontWeight:600 }}>{u.mfa?"✓ On":"✗ Off"}</span>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ background: u.status==="Active"?T.successBg:T.dangerBg,
                      color: u.status==="Active"?T.success:T.danger,
                      padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>{u.status}</span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:T.textMuted }}>{u.last}</td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn small ghost>Edit</Btn>
                    <Btn small danger ghost>{u.status==="Active"?"Suspend":"Reactivate"}</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  if (tab === "roles") return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Users &amp; Roles</h1></div>
        <Btn primary iconNode={Ico.plus(16)}>New Role</Btn>
      </div>
      <Card noPad>
        <div style={{ padding:"12px 16px 0" }}><Tabs /></div>
        <div style={{ padding:"0 16px 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14, marginTop:8 }}>
            {MOCK_ROLES.map(r => (
              <div key={r.id} style={{ border:`1px solid ${T.border}`, borderRadius:12, padding:18,
                  background:T.card, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:r.color }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:T.text }}>{r.name}</div>
                  <span style={{ background:`${r.color}18`, color:r.color, padding:"2px 8px",
                      borderRadius:6, fontSize:11, fontWeight:700 }}>{r.users} users</span>
                </div>
                <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5, marginBottom:12 }}>{r.desc}</div>
                <Btn small ghost>Edit permissions</Btn>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  // permissions tab — blank slate
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Users &amp; Roles</h1></div>
      </div>
      <Card noPad>
        <div style={{ padding:"12px 16px 0" }}><Tabs /></div>
        <div style={{ padding:60, textAlign:"center" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:T.primaryLight,
              display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:T.primary }}>
            {Ico.shield(28)}
          </div>
          <div style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:6 }}>Permission Sets</div>
          <div style={{ fontSize:13, color:T.textMuted, maxWidth:360, margin:"0 auto" }}>
            Granular permission sets will be configured here. Schema coming soon — awaiting definition from stakeholders.
          </div>
          <div style={{ marginTop:20 }}>
            <Btn primary iconNode={Ico.plus(16)}>Create Permission Set</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UsersRolesScreen;
