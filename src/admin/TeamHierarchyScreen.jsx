import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_TEAM } from "../data/admin";

function TeamHierarchyScreen() {
  const [expanded, setExpanded] = useState(["T1","T2","T3"]);
  const [showAdd, setShowAdd]   = useState(false);
  const [newNode, setNewNode]   = useState({ name:"", role:"Team", parent:"T1" });

  const toggle = id => setExpanded(e => e.includes(id) ? e.filter(x=>x!==id) : [...e, id]);
  const children = id => MOCK_TEAM.filter(t => t.parent === id);

  const roleBadge = r => {
    const map = { Organisation:`${T.primary}`, Division:`${T.accent}`, Team:`${T.warning}` };
    return map[r] || T.textMuted;
  };

  const Node = ({ node, depth=0 }) => {
    const kids = children(node.id);
    const open  = expanded.includes(node.id);
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
            paddingLeft: 16 + depth * 28, borderTop:`1px solid ${T.borderLight}`,
            background: depth===0 ? T.bg : T.card }}>
          {kids.length > 0 && (
            <span onClick={() => toggle(node.id)} style={{ cursor:"pointer", color:T.textMuted, fontSize:12, width:14, textAlign:"center" }}>
              {open ? "▼" : "▶"}
            </span>
          )}
          {kids.length === 0 && <span style={{ width:14 }} />}
          <div style={{ width:32, height:32, borderRadius:8,
              background:`${roleBadge(node.role)}18`, display:"flex", alignItems:"center",
              justifyContent:"center", color:roleBadge(node.role), flexShrink:0 }}>
            {node.role === "Organisation" ? Ico.shield(16) : node.role === "Division" ? Ico.users(16) : Ico.user(16)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{node.name}</div>
            <div style={{ fontSize:11, color:T.textMuted }}>{node.head} · {node.members} members</div>
          </div>
          <span style={{ background:`${roleBadge(node.role)}18`, color:roleBadge(node.role),
              fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5 }}>{node.role}</span>
          <Btn small ghost>Edit</Btn>
        </div>
        {open && kids.map(k => <Node key={k.id} node={k} depth={depth+1} />)}
      </div>
    );
  };

  const roots = MOCK_TEAM.filter(t => t.parent === null);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Team Hierarchy</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Organisational structure and reporting lines</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowAdd(true)}>Add Node</Btn>
      </div>
      {showAdd && (
        <Card style={{ marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Add team / division</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["name","Name","text"],["role","Type","select"],["parent","Reports to","select"]].map(([f,l,t]) => (
              <div key={f} style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:5 }}>{l}</div>
                {t === "select" ? (
                  <select value={newNode[f]} onChange={e => setNewNode(p=>({...p,[f]:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`,
                      fontSize:13, fontFamily:T.font, outline:"none", background:T.card }}>
                    {f === "role"
                      ? ["Organisation","Division","Team"].map(r => <option key={r}>{r}</option>)
                      : MOCK_TEAM.map(t2 => <option key={t2.id} value={t2.id}>{t2.name}</option>)
                    }
                  </select>
                ) : (
                  <input value={newNode[f]} onChange={e => setNewNode(p=>({...p,[f]:e.target.value}))}
                    style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`,
                      fontSize:13, fontFamily:T.font, outline:"none", boxSizing:"border-box" }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            <Btn primary small onClick={() => setShowAdd(false)}>Save Node</Btn>
            <Btn small onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </Card>
      )}
      <Card noPad>
        {roots.map(r => <Node key={r.id} node={r} />)}
      </Card>
    </div>
  );
}

export default TeamHierarchyScreen;
