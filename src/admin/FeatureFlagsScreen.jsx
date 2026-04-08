import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_FEATURES } from "../data/admin";

function FeatureFlagsScreen() {
  const [flags, setFlags] = useState(MOCK_FEATURES);
  const [filter, setFilter] = useState("All");

  const toggle = id => setFlags(f => f.map(x => x.id===id ? {...x, enabled:!x.enabled, rollout:!x.enabled?100:0} : x));
  const envs = ["All","Production","Staging","Development"];
  const shown = filter==="All" ? flags : flags.filter(f => f.env===filter);

  const envColor = e => ({ Production:T.success, Staging:T.warning, Development:T.textMuted }[e] || T.textMuted);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Feature Flags</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>
            {flags.filter(f=>f.enabled).length} of {flags.length} flags enabled
          </p>
        </div>
        <Btn primary iconNode={Ico.plus(16)}>New Flag</Btn>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <KPICard label="Enabled"     value={String(flags.filter(f=>f.enabled).length)}  sub="active features"     color={T.success} />
        <KPICard label="Disabled"    value={String(flags.filter(f=>!f.enabled).length)} sub="off or staged"       color={T.textMuted} />
        <KPICard label="Production"  value={String(flags.filter(f=>f.env==="Production").length)} sub="live flags"  color={T.danger}  />
        <KPICard label="In Staging"  value={String(flags.filter(f=>f.env==="Staging").length)}    sub="being tested" color={T.warning} />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {envs.map(e => (
          <div key={e} onClick={() => setFilter(e)}
            style={{ padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
              background: filter===e ? T.primary : T.card, color: filter===e ? "#fff" : T.textSecondary,
              border:`1px solid ${filter===e ? T.primary : T.border}` }}>{e}</div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {shown.map(f => (
          <div key={f.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12,
              padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ fontSize:14, fontWeight:600, color:T.text }}>{f.name}</div>
                <span style={{ background:`${envColor(f.env)}18`, color:envColor(f.env),
                    fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5 }}>{f.env}</span>
                <span style={{ fontSize:11, color:T.textMuted }}>Owner: {f.owner}</span>
              </div>
              <div style={{ fontSize:12, color:T.textSecondary }}>{f.desc}</div>
              {f.enabled && f.rollout < 100 && (
                <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, height:4, background:T.borderLight, borderRadius:2 }}>
                    <div style={{ width:`${f.rollout}%`, height:"100%", background:T.accent, borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:11, color:T.textMuted, whiteSpace:"nowrap" }}>{f.rollout}% rollout</span>
                </div>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color: f.enabled?T.success:T.textMuted, fontWeight:600 }}>
                {f.enabled ? "Enabled" : "Disabled"}
              </span>
              <div onClick={() => toggle(f.id)}
                style={{ width:44, height:24, borderRadius:12, background: f.enabled?T.success:T.border,
                  cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff",
                    position:"absolute", top:3, transition:"left 0.2s",
                    left: f.enabled ? 23 : 3 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureFlagsScreen;
