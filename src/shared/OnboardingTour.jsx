import { useState, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";

// ─────────────────────────────────────────────
// ONBOARDING TOUR — First-time guided overlay
// ─────────────────────────────────────────────

const TOUR_STEPS = {
  Broker: [
    { title: "Welcome to Nova 2.0", desc: "The AI-native lending platform. Let's show you around.", icon: "sparkle" },
    { title: "Smart Apply", desc: "Create applications in 5 minutes. Nova AI pre-populates 73% of fields automatically.", icon: "zap" },
    { title: "Your Pipeline", desc: "Track all your cases from DIP to completion. Real-time status updates.", icon: "loans" },
    { title: "Eligibility Check", desc: "Instantly check what products your client qualifies for before starting an application.", icon: "check" },
    { title: "Nova AI Copilot", desc: "Click the sparkle button anytime for AI-powered assistance, product queries, and draft emails.", icon: "sparkle" },
  ],
  Ops: [
    { title: "Welcome to Nova 2.0", desc: "Your AI-powered operations hub. Let's get you up to speed.", icon: "sparkle" },
    { title: "Needs Attention", desc: "Your home screen shows customers and cases that need action, ranked by AI priority.", icon: "alert" },
    { title: "Intake Queue", desc: "New applications arrive pre-processed by AI. 67% of checks are done before you touch the case.", icon: "loans" },
    { title: "Customer 360", desc: "See everything about a customer in one place — all products, all history, all risk.", icon: "customers" },
    { title: "Servicing", desc: "Search any mortgage account. AI recommends actions. Modals for every operation.", icon: "dollar" },
  ],
  Admin: [
    { title: "Welcome to Nova 2.0", desc: "Your admin control centre. Let's walk through the key areas.", icon: "sparkle" },
    { title: "Platform Overview", desc: "Monitor all users, permissions, and compliance from your admin section.", icon: "dashboard" },
    { title: "AI Intelligence", desc: "Track AI model performance, anomalies, and risk across the entire portfolio.", icon: "bot" },
    { title: "Workflow Configuration", desc: "Define approval chains, mandates, and routing rules.", icon: "settings" },
  ],
  _default: [
    { title: "Welcome to Nova 2.0", desc: "The AI-native lending platform. Let's show you around.", icon: "sparkle" },
    { title: "Navigation", desc: "Use the sidebar to access all screens. The search bar lets you find anything instantly.", icon: "search" },
    { title: "Nova AI Copilot", desc: "Click the sparkle button anytime for AI-powered assistance.", icon: "sparkle" },
  ],
};

function OnboardingTour({ persona, onComplete }) {
  const storageKey = `nova_onboarding_${persona}`;
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const [visible, setVisible] = useState(false);

  const steps = TOUR_STEPS[persona] || TOUR_STEPS._default;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "done") return;
    } catch {}
    setVisible(true);
  }, [storageKey]);

  const finish = () => {
    if (dontShow) {
      try { localStorage.setItem(storageKey, "done"); } catch {}
    }
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(12,45,59,0.72)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.font, animation: "novaFadeIn 0.3s ease",
    }}>
      <style>{`
        @keyframes novaFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes novaPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
        @keyframes novaSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{
        width: 480, maxWidth: "92vw", background: T.card, borderRadius: 18,
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)", overflow: "hidden",
        animation: "novaSlideUp 0.35s ease",
      }}>
        {/* Icon header */}
        <div style={{
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
          padding: "36px 32px 28px", textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 16,
            background: "rgba(255,255,255,0.15)", color: "#fff",
            animation: "novaPulse 2s ease infinite",
          }}>
            {Ico[current.icon]?.(32)}
          </div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginTop: 16 }}>
            {current.title}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600, marginTop: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px 20px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: T.text, margin: 0, textAlign: "center" }}>
            {current.desc}
          </p>

          {/* Step dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, margin: "24px 0 0" }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                background: i === step ? T.primary : T.borderLight,
                transition: "all 0.25s ease",
              }} />
            ))}
          </div>

          {/* Don't show again (last step only) */}
          {isLast && (
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 20, fontSize: 12, color: T.textMuted, cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={dontShow}
                onChange={e => setDontShow(e.target.checked)}
                style={{ accentColor: T.primary }}
              />
              Don't show this again
            </label>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px 24px",
        }}>
          <Btn ghost small onClick={finish} style={{ color: T.textMuted }}>
            Skip tour
          </Btn>
          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <Btn small onClick={back} icon="arrowLeft">
                Back
              </Btn>
            )}
            <Btn primary small onClick={next} icon={isLast ? "check" : "arrow"}>
              {isLast ? "Get Started" : "Next"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingTour;
