import { useState, useRef } from "react";
import { T, Ico } from "../shared/tokens";
import AfinLogo from "../shared/AfinLogo";

const AuthField = ({ label, value, onChange, type="text", placeholder, icon }) => (
  <div style={{ marginBottom:16 }}>
    {label && <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.6)", marginBottom:6, letterSpacing:0.3 }}>{label}</div>}
    <div style={{ display:"flex", alignItems:"center", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.12)",
      background:"rgba(255,255,255,0.06)", overflow:"hidden", transition:"border-color 0.2s" }}>
      {icon && <span style={{ padding:"0 0 0 14px", color:"rgba(255,255,255,0.35)", display:"flex" }}>{icon}</span>}
      <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
        style={{ flex:1, padding:"12px 14px", border:"none", outline:"none", fontSize:14, fontFamily:T.font,
          background:"transparent", color:"#fff", letterSpacing:0.2 }} />
    </div>
  </div>
);

const AuthShell = ({ children, step }) => {
  const isSelect = step === "select";
  return (
    <div style={{ minHeight:"100vh", width:"100vw", display:"flex", fontFamily:T.font, overflow:"hidden" }}>
      {/* ── Left hero panel ── */}
      <div style={{ flex:"0 0 38%", background:`linear-gradient(145deg, ${T.primaryDark} 0%, #0A1F2B 40%, #091820 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center",
        position:"relative", overflow:"hidden", padding:"60px 40px" }}>

        {/* Animated gradient orbs */}
        <style>{`
          @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.1)}}
          @keyframes float2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,30px) scale(1.05)}}
          @keyframes float3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(15px,15px) scale(0.95)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        `}</style>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", top:"-10%", left:"-10%",
          background:"radial-gradient(circle, rgba(49,184,151,0.15) 0%, transparent 70%)",
          animation:"float1 8s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:350, height:350, borderRadius:"50%", bottom:"-5%", right:"-8%",
          background:"radial-gradient(circle, rgba(255,191,0,0.12) 0%, transparent 70%)",
          animation:"float2 10s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:250, height:250, borderRadius:"50%", top:"40%", left:"50%",
          background:"radial-gradient(circle, rgba(255,107,97,0.08) 0%, transparent 70%)",
          animation:"float3 12s ease-in-out infinite", pointerEvents:"none" }} />

        {/* Grid pattern overlay */}
        <div style={{ position:"absolute", inset:0, opacity:0.03,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize:"60px 60px", pointerEvents:"none" }} />

        {/* Content */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:440, animation:"fadeUp 0.8s ease-out" }}>
          <div style={{ marginBottom:28 }}><AfinLogo size={90} /></div>
          <h1 style={{ fontFamily:"'Sora', sans-serif", fontSize:46, fontWeight:800, color:"#fff", margin:"0 0 10px", letterSpacing:-1, lineHeight:1.1 }}>
            Afin Bank
          </h1>
          <div style={{ fontFamily:"'Sora', sans-serif", fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.35)", textTransform:"uppercase",
            letterSpacing:4, marginBottom:36 }}>Nova Platform</div>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", lineHeight:1.8, margin:"0 0 44px", fontFamily:"'Sora', sans-serif", fontWeight:400 }}>
            The AI-native mortgage lending platform.<br/>Origination to servicing in one seamless flow.
          </p>

          {/* Trust badges */}
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            {[
              { icon:Ico.shield(14), label:"FCA Regulated" },
              { icon:Ico.lock(14),   label:"256-bit Encrypted" },
              { icon:Ico.sparkle(14),label:"AI Powered" },
            ].map((b, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px",
                borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color:T.accent, display:"flex" }}>{b.icon}</span>
                <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", letterSpacing:0.3 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ position:"absolute", bottom:24, left:0, right:0, textAlign:"center",
          fontSize:11, color:"rgba(255,255,255,0.2)", letterSpacing:0.3 }}>
          Afin Bank Ltd is authorised by the FCA (Reg. 000000) · v2.1.0
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex:1, background:`linear-gradient(160deg, #0E2A36 0%, ${T.primaryDark} 50%, #091820 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"auto" }}>
        <div style={{ width:420, padding:"40px 0", animation:"fadeUp 0.6s ease-out 0.15s both" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

function AuthScreen({ onAuth }) {
  const [step, setStep]         = useState("select");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]           = useState(["","","","","",""]);
  const [loading, setLoading]   = useState(false);
  const [signup, setSignup]     = useState({ name:"", company:"", fca:"", email:"", password:"" });
  const otpRefs = useRef([]);

  const sendOtp   = () => { setLoading(true); setTimeout(() => { setLoading(false); setStep("otp"); }, 1300); };
  const verifyOtp = () => { setLoading(true); setTimeout(() => onAuth("external"), 1000); };
  const ssoGo     = () => { setStep("sso-loading"); setTimeout(() => onAuth("internal"), 2000); };

  const GlowBtn = ({ children, onClick, disabled, gradient }) => (
    <button onClick={onClick} disabled={disabled}
      style={{ width:"100%", padding:"13px 24px", borderRadius:12, border:"none",
        background: gradient || `linear-gradient(135deg, ${T.accent}, #27a080)`, color:"#fff",
        fontSize:14, fontWeight:700, cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?0.5:1, fontFamily:T.font, letterSpacing:0.3,
        boxShadow: disabled ? "none" : `0 4px 20px rgba(49,184,151,0.35)`,
        transition:"all 0.2s", position:"relative", overflow:"hidden" }}>
      {children}
    </button>
  );

  if (step === "select") return (
    <AuthShell step="select">
      <div style={{ marginBottom:8 }}>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 6px", color:"#fff", letterSpacing:-0.5 }}>Welcome back</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.45)", margin:0 }}>Choose how you'd like to sign in</p>
      </div>
      <div style={{ margin:"28px 0", display:"flex", flexDirection:"column", gap:12 }}>
        {[
          { key:"sso", icon:Ico.shield(22), gradient:`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
            glow:"rgba(26,74,84,0.4)", title:"Staff — Single Sign-On", sub:"Microsoft Entra ID for Afin Bank employees" },
          { key:"login", icon:Ico.users(22), gradient:`linear-gradient(135deg, ${T.accent}, #27a080)`,
            glow:"rgba(49,184,151,0.35)", title:"Broker / External — OTP", sub:"Secure one-time code for partners" },
        ].map(opt => (
          <div key={opt.key} onClick={() => setStep(opt.key)}
            style={{ padding:"20px 22px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.04)", cursor:"pointer", display:"flex", alignItems:"center", gap:16,
              transition:"all 0.2s", backdropFilter:"blur(8px)" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.transform="translateY(0)"; }}>
            <div style={{ width:48, height:48, borderRadius:12, background:opt.gradient,
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", flexShrink:0,
                boxShadow:`0 4px 16px ${opt.glow}` }}>
              {opt.icon}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:"#fff", marginBottom:2 }}>{opt.title}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{opt.sub}</div>
            </div>
            <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.25)", display:"flex" }}>{Ico.arrow(18)}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ display:"flex", alignItems:"center", gap:14, margin:"24px 0" }}>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:1 }}>or</span>
        <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
      </div>

      <div style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
        New broker?{" "}
        <span onClick={() => setStep("signup")} style={{ color:T.accent, cursor:"pointer", fontWeight:700 }}>
          Create an account
        </span>
      </div>
    </AuthShell>
  );

  if (step === "sso") return (
    <AuthShell step="sso">
      <span onClick={() => setStep("select")} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, marginBottom:20 }}>
        {Ico.arrowLeft(14)} Back
      </span>
      <h2 style={{ fontSize:24, fontWeight:800, margin:"0 0 6px", color:"#fff" }}>Staff Sign-On</h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 24px" }}>You'll be redirected to your identity provider</p>

      <div style={{ background:"rgba(26,74,84,0.3)", borderRadius:12, padding:"16px 18px", marginBottom:24,
          fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.7, border:"1px solid rgba(49,184,151,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <span style={{ color:T.accent, display:"flex" }}>{Ico.shield(16)}</span>
          <strong style={{ color:"#fff" }}>Microsoft Entra ID</strong>
        </div>
        Your session will be secured with multi-factor authentication. No passwords are stored on Nova.
      </div>
      <GlowBtn onClick={ssoGo} gradient={`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`}>
        Continue with SSO →
      </GlowBtn>
    </AuthShell>
  );

  if (step === "sso-loading") return (
    <AuthShell step="sso-loading">
      <div style={{ textAlign:"center", padding:"40px 0" }}>
        <div style={{ position:"relative", width:64, height:64, margin:"0 auto 24px" }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid rgba(255,255,255,0.08)" }} />
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent",
            borderTopColor:T.accent, animation:"spin 0.8s linear infinite" }} />
          <div style={{ position:"absolute", inset:8, borderRadius:"50%", border:"2px solid transparent",
            borderTopColor:"rgba(255,191,0,0.6)", animation:"spin 1.2s linear infinite reverse" }} />
        </div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#fff", margin:"0 0 6px" }}>Authenticating...</h2>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>Verifying your identity with Microsoft Entra ID</p>
      </div>
    </AuthShell>
  );

  if (step === "login") return (
    <AuthShell step="login">
      <span onClick={() => setStep("select")} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, marginBottom:20 }}>
        {Ico.arrowLeft(14)} Back
      </span>
      <h2 style={{ fontSize:24, fontWeight:800, margin:"0 0 6px", color:"#fff" }}>Broker Login</h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 28px" }}>Enter your credentials — a one-time code will be sent</p>

      <AuthField label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@brokerage.com"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>} />
      <AuthField label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter your password"
        icon={Ico.lock(16)} />

      <div style={{ marginBottom:20, textAlign:"right" }}>
        <span style={{ fontSize:12, color:T.accent, cursor:"pointer", fontWeight:500 }}>Forgot password?</span>
      </div>

      <GlowBtn onClick={sendOtp} disabled={!email || !password || loading}>
        {loading ? "Sending OTP..." : "Send One-Time Code →"}
      </GlowBtn>

      <div style={{ marginTop:20, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
        Don't have an account?{" "}
        <span onClick={() => setStep("signup")} style={{ color:T.accent, cursor:"pointer", fontWeight:700 }}>Sign up</span>
      </div>
    </AuthShell>
  );

  if (step === "otp") return (
    <AuthShell step="otp">
      <span onClick={() => setStep("login")} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, marginBottom:20 }}>
        {Ico.arrowLeft(14)} Back
      </span>
      <h2 style={{ fontSize:24, fontWeight:800, margin:"0 0 6px", color:"#fff" }}>Verify your identity</h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 32px" }}>
        Enter the 6-digit code sent to <strong style={{ color:"rgba(255,255,255,0.7)" }}>{email || "your email"}</strong>
      </p>

      <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:32 }}>
        {otp.map((d, i) => (
          <input key={i} ref={el => (otpRefs.current[i] = el)} maxLength={1} value={d}
            onChange={e => {
              const v = e.target.value.replace(/\D/, "");
              const n = [...otp]; n[i] = v; setOtp(n);
              if (v && i < 5) otpRefs.current[i + 1]?.focus();
            }}
            onKeyDown={e => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus(); }}
            style={{ width:48, height:58, textAlign:"center", fontSize:24, fontWeight:800, borderRadius:12,
              border:`2px solid ${d ? T.accent : "rgba(255,255,255,0.12)"}`,
              background: d ? "rgba(49,184,151,0.1)" : "rgba(255,255,255,0.04)",
              outline:"none", fontFamily:T.font, color:"#fff",
              boxShadow: d ? `0 0 16px rgba(49,184,151,0.2)` : "none",
              transition:"all 0.2s" }} />
        ))}
      </div>

      <GlowBtn onClick={verifyOtp} disabled={otp.join("").length < 6 || loading}>
        {loading ? "Verifying..." : "Verify & Sign In →"}
      </GlowBtn>

      <div style={{ marginTop:16, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
        Didn't receive it?{" "}
        <span onClick={sendOtp} style={{ color:T.accent, cursor:"pointer", fontWeight:600 }}>Resend code</span>
      </div>
    </AuthShell>
  );

  if (step === "signup") return (
    <AuthShell step="signup">
      <span onClick={() => setStep("select")} style={{ fontSize:12, color:"rgba(255,255,255,0.35)", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, marginBottom:20 }}>
        {Ico.arrowLeft(14)} Back
      </span>
      <h2 style={{ fontSize:24, fontWeight:800, margin:"0 0 6px", color:"#fff" }}>Create your account</h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 24px" }}>For FCA-authorised brokers and intermediaries</p>

      {[
        { f:"name",     label:"Full name",     type:"text",     ph:"John Watson",         icon:Ico.user(16) },
        { f:"company",  label:"Company",        type:"text",     ph:"Watson & Partners",   icon:Ico.products(16) },
        { f:"fca",      label:"FCA Reference",  type:"text",     ph:"e.g. 123456",          icon:Ico.shield(16) },
        { f:"email",    label:"Email address",  type:"email",    ph:"you@brokerage.com",    icon:null },
        { f:"password", label:"Password",       type:"password", ph:"Min 8 characters",     icon:Ico.lock(16) },
      ].map(({ f, label, type, ph, icon }) => (
        <AuthField key={f} label={label} type={type} placeholder={ph} icon={icon}
          value={signup[f]} onChange={v => setSignup(p => ({ ...p, [f]: v }))} />
      ))}

      <GlowBtn onClick={() => { setEmail(signup.email); sendOtp(); }}>
        Create Account & Verify →
      </GlowBtn>

      <div style={{ marginTop:16, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.4)" }}>
        Already have an account?{" "}
        <span onClick={() => setStep("select")} style={{ color:T.accent, cursor:"pointer", fontWeight:700 }}>Sign in</span>
      </div>
    </AuthShell>
  );

  return null;
}

export default AuthScreen;
