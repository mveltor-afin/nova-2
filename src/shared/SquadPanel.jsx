import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";
import { TEAM_MEMBERS } from "../data/loans";

const ROLE_COLORS = {
  adviser:     { bg:"#E6F7F3", text:T.success,  label:"Mortgage Adviser" },
  underwriter: { bg:"#EDE9FE", text:"#7C3AED",  label:"Underwriter" },
  ops:         { bg:"#DBEAFE", text:"#1E40AF",   label:"Customer Care" },
  solicitor:   { bg:"#FFF7ED", text:"#9A3412",   label:"Solicitor" },
};

const allMembers = { ...Object.fromEntries(TEAM_MEMBERS.advisors.map(m=>[m.id,m])), ...Object.fromEntries(TEAM_MEMBERS.underwriters.map(m=>[m.id,m])), ...Object.fromEntries(TEAM_MEMBERS.ops.map(m=>[m.id,m])), ...Object.fromEntries((TEAM_MEMBERS.solicitors||[]).map(m=>[m.id,m])) };

const getMember = (id) => allMembers[id] || null;

export default function SquadPanel({ squad, onReassign, compact }) {
  const [showReassign, setShowReassign] = useState(null);

  if (!squad) return (
    <Card style={{ padding:16, borderLeft:`4px solid ${T.warning}`, background:T.warningBg }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {Ico.alert(18)}
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:T.warning }}>Squad Not Assigned</div>
          <div style={{ fontSize:12, color:T.textMuted }}>This case needs a Mortgage Adviser, Underwriter, and Customer Care team member.</div>
        </div>
        <Btn small primary style={{ marginLeft:"auto" }}>Assign Squad</Btn>
      </div>
    </Card>
  );

  const roles = [
    { key:"adviser", member:getMember(squad.adviser), pool:TEAM_MEMBERS.advisors },
    { key:"underwriter", member:getMember(squad.underwriter), pool:TEAM_MEMBERS.underwriters },
    { key:"ops", member:getMember(squad.ops), pool:TEAM_MEMBERS.ops },
    ...(squad.solicitor ? [{ key:"solicitor", member:getMember(squad.solicitor), pool:TEAM_MEMBERS.solicitors || [] }] : []),
  ];

  if (compact) {
    return (
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        {roles.map(r => {
          const rc = ROLE_COLORS[r.key];
          return r.member ? (
            <div key={r.key} title={`${rc.label}: ${r.member.name}`}
              style={{ width:30, height:30, borderRadius:8, background:rc.bg, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:700, color:rc.text, border:`1.5px solid ${rc.text}30`, cursor:"default" }}>
              {r.member.initials}
            </div>
          ) : (
            <div key={r.key} title={`${rc.label}: Unassigned`}
              style={{ width:30, height:30, borderRadius:8, background:T.bg, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, color:T.textMuted, border:`1.5px dashed ${T.border}` }}>?</div>
          );
        })}
      </div>
    );
  }

  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      <div style={{ padding:"12px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>
        {Ico.users(16)}
        <span style={{ fontSize:14, fontWeight:700, color:T.text }}>Case Squad</span>
        <span style={{ fontSize:11, color:T.textMuted, marginLeft:4 }}>{roles.length} members assigned</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${roles.length}, 1fr)`, gap:0 }}>
        {roles.map((r, i) => {
          const rc = ROLE_COLORS[r.key];
          const m = r.member;
          return (
            <div key={r.key} style={{ padding:"16px 18px", borderRight: i<2 ? `1px solid ${T.border}` : "none" }}>
              {/* Role badge */}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:rc.bg, color:rc.text, textTransform:"uppercase", letterSpacing:0.5 }}>{rc.label}</span>
              </div>
              {m ? (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:`linear-gradient(135deg, ${rc.text}20, ${rc.text}40)`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:rc.text }}>
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{m.name}</div>
                      <div style={{ fontSize:11, color:T.textMuted }}>{m.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>
                    Workload: {m.active}/{m.capacity} cases
                  </div>
                  <div style={{ height:4, background:T.borderLight, borderRadius:2, marginBottom:10 }}>
                    <div style={{ height:4, borderRadius:2, background: m.active/m.capacity > 0.8 ? T.danger : m.active/m.capacity > 0.6 ? T.warning : T.success,
                      width:`${(m.active/m.capacity)*100}%` }} />
                  </div>
                  {m.specialism && (
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                      {m.specialism.map(s => (
                        <span key={s} style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:T.bg, color:T.textMuted, border:`1px solid ${T.border}` }}>{s}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:6 }}>
                    <div style={{ cursor:"pointer", color:T.textMuted, display:"flex" }} title={m.email}>{Ico.send(13)}</div>
                    <div style={{ cursor:"pointer", color:T.textMuted, display:"flex" }} title={m.phone}>{Ico.user(13)}</div>
                    <span onClick={() => setShowReassign(showReassign === r.key ? null : r.key)}
                      style={{ fontSize:11, color:T.primary, cursor:"pointer", fontWeight:600, marginLeft:"auto" }}>Reassign</span>
                  </div>
                  {showReassign === r.key && (
                    <div style={{ marginTop:10, padding:10, background:T.bg, borderRadius:8, border:`1px solid ${T.border}` }}>
                      <div style={{ fontSize:11, fontWeight:600, color:T.textSecondary, marginBottom:6 }}>Select replacement:</div>
                      {r.pool.filter(p => p.id !== m.id).map(p => (
                        <div key={p.id} onClick={() => { onReassign?.(r.key, p.id); setShowReassign(null); }}
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:6, cursor:"pointer", marginBottom:2 }}
                          onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ width:24, height:24, borderRadius:6, background:`${rc.text}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:rc.text }}>{p.initials}</div>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600 }}>{p.name}</div>
                            <div style={{ fontSize:10, color:T.textMuted }}>{p.active}/{p.capacity} cases · {p.specialism?.join(", ")}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"16px 0", color:T.textMuted }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>?</div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Unassigned</div>
                  <Btn small primary>Assign</Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
