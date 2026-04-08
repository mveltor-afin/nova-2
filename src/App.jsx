import { useState } from "react";
import AuthScreen from "./auth/AuthScreen";
import Shell from "./Shell";

const GATE_KEY = "cqy.GHJ!bge_bth7zwr";

function GateScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const submit = () => {
    if (pw === GATE_KEY) { sessionStorage.setItem("nova_gate","1"); onUnlock(); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div style={{ minHeight:"100vh", width:"100vw", background:"#0A1118", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','SF Pro Display',-apple-system,sans-serif" }}>
      <div style={{ width:380, textAlign:"center" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
        <h1 style={{ fontSize:20, fontWeight:700, color:"#fff", margin:"0 0 6px" }}>Restricted Access</h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", margin:"0 0 28px" }}>Enter the access code to continue</p>
        <div style={{ position:"relative", marginBottom:16 }}>
          <input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="Access code" autoFocus
            style={{ width:"100%", padding:"14px 48px 14px 16px", borderRadius:12, border:`1.5px solid ${error?"#FF6B61":"rgba(255,255,255,0.1)"}`,
              background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
          <span onClick={()=>setShow(s=>!s)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", cursor:"pointer", color:"rgba(255,255,255,0.25)", fontSize:12 }}>{show?"HIDE":"SHOW"}</span>
        </div>
        {error && <div style={{ fontSize:12, color:"#FF6B61", marginBottom:12, fontWeight:600 }}>Invalid access code</div>}
        <button onClick={submit} style={{ width:"100%", padding:"13px 24px", borderRadius:12, border:"none",
          background:pw?"linear-gradient(135deg,#31B897,#27a080)":"rgba(255,255,255,0.06)", color:pw?"#fff":"rgba(255,255,255,0.3)",
          fontSize:14, fontWeight:700, cursor:pw?"pointer":"default", fontFamily:"inherit",
          boxShadow:pw?"0 4px 20px rgba(49,184,151,0.25)":"none" }}>Enter</button>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.15)", marginTop:24 }}>This environment is confidential and for authorised users only.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [gateOpen, setGateOpen] = useState(() => sessionStorage.getItem("nova_gate") === "1");
  const [auth, setAuth] = useState(null);
  if (!gateOpen) return <GateScreen onUnlock={() => setGateOpen(true)} />;
  if (!auth) return <AuthScreen onAuth={type => setAuth(type)} />;
  return <Shell userType={auth} />;
}
