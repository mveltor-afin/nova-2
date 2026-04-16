import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const fmt = v => "£" + Number(v).toLocaleString("en-GB");
const MONO = "'Space Mono', monospace";

function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ─────────────────────────────────────────────
// Progress Dots
// ─────────────────────────────────────────────
function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: i <= current ? T.primary : T.border,
          transition: "background 0.2s",
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Big £ Input
// ─────────────────────────────────────────────
function BigInput({ value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "32px 0 16px" }}>
      <span style={{ fontSize: 36, fontWeight: 700, color: T.textMuted }}>£</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          onChange(raw);
        }}
        placeholder={placeholder}
        style={{
          fontSize: 36, fontWeight: 700, fontFamily: MONO, color: T.text,
          border: "none", borderBottom: `3px solid ${T.primary}`, outline: "none",
          background: "transparent", textAlign: "center", width: 280, padding: "8px 0",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Animated Check
// ─────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%", background: T.successBg,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px", border: `3px solid ${T.success}`,
    }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="3">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Confetti Dots (static decorative)
// ─────────────────────────────────────────────
function ConfettiDots() {
  const dots = [
    { top: 10, left: "15%", bg: T.accent, size: 8 },
    { top: 20, left: "75%", bg: T.warning, size: 10 },
    { top: 5,  left: "45%", bg: T.primary, size: 6 },
    { top: 30, left: "85%", bg: T.danger, size: 7 },
    { top: 15, left: "25%", bg: "#7C3AED", size: 9 },
    { top: 25, left: "60%", bg: T.accent, size: 6 },
    { top: 8,  left: "90%", bg: T.warning, size: 8 },
    { top: 35, left: "10%", bg: T.primary, size: 7 },
  ];
  return (
    <div style={{ position: "relative", height: 50 }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute", top: d.top, left: d.left,
          width: d.size, height: d.size, borderRadius: "50%", background: d.bg,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function CustomerApplyChat({ onSubmitted }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [deposit, setDeposit] = useState("");
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("");

  const next = () => setCurrentStep(s => s + 1);
  const back = () => setCurrentStep(s => s - 1);

  const pv = Number(propertyValue) || 0;
  const dep = Number(deposit) || 0;
  const inc = Number(income) || 0;
  const ltv = pv > 0 ? Math.round(((pv - dep) / pv) * 100) : 0;
  const depositPct = pv > 0 ? Math.round((dep / pv) * 100) : 0;
  const maxBorrow = Math.round(inc * 4.5);
  const loanAmount = pv - dep;
  const monthlyPayment = loanAmount > 0 ? calcMonthly(loanAmount, 4.5, 25) : 0;
  const isEligible = ltv <= 90 && employment !== "Self-Employed";

  const questionStyle = { fontSize: 24, fontWeight: 600, fontFamily: T.font, color: T.text, textAlign: "center", lineHeight: 1.3 };
  const hintStyle = { fontSize: 13, color: T.textMuted, textAlign: "center", marginTop: 8 };

  // ─── Purpose cards (step 0) ───
  const PURPOSE_OPTIONS = [
    { id: "buy",        emoji: "\uD83C\uDFE0", title: "Buy a home",     sub: "Get a mortgage for your dream property" },
    { id: "remortgage", emoji: "\uD83D\uDD04", title: "Remortgage",     sub: "Switch your existing deal" },
    { id: "save",       emoji: "\uD83D\uDCB0", title: "Save money",     sub: "Open a savings account" },
    { id: "protect",    emoji: "\uD83D\uDEE1\uFE0F",  title: "Get protected",  sub: "Life insurance & cover" },
  ];

  const EMPLOYMENT_OPTIONS = [
    { id: "Employed",      icon: "loans",    label: "Employed" },
    { id: "Self-Employed", icon: "products", label: "Self-Employed" },
    { id: "Contractor",    icon: "file",     label: "Contractor" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      // ─── Step 0: Purpose ───
      case 0:
        return (
          <div>
            <div style={questionStyle}>What would you like to do?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 32 }}>
              {PURPOSE_OPTIONS.map(o => (
                <div key={o.id} onClick={() => { setPurpose(o.id); next(); }} style={{
                  background: T.card, borderRadius: 14, padding: "24px 20px",
                  border: `1px solid ${T.border}`, cursor: "pointer",
                  textAlign: "center", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{o.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{o.sub}</div>
                </div>
              ))}
            </div>
          </div>
        );

      // ─── Step 1: Property value ───
      case 1:
        return (
          <div>
            <div style={questionStyle}>How much is the property?</div>
            <BigInput value={propertyValue} onChange={setPropertyValue} placeholder="e.g. 350,000" />
            {pv > 0 && (
              <div style={hintStyle}>
                That's a {pv < 200000 ? "1-2 bed" : pv < 350000 ? "2-3 bed" : pv < 500000 ? "3-4 bed" : "4+ bed"} average in your area
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Btn primary onClick={next} disabled={!pv} style={{ padding: "14px 48px", fontSize: 15 }}>Continue</Btn>
            </div>
          </div>
        );

      // ─── Step 2: Deposit ───
      case 2:
        return (
          <div>
            <div style={questionStyle}>How much deposit do you have?</div>
            <BigInput value={deposit} onChange={setDeposit} placeholder="e.g. 50,000" />
            {dep > 0 && pv > 0 && (
              <div style={hintStyle}>
                That's a <span style={{ fontWeight: 700, color: T.primary }}>{depositPct}% deposit</span> ({ltv}% LTV)
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Btn primary onClick={next} disabled={!dep} style={{ padding: "14px 48px", fontSize: 15 }}>Continue</Btn>
            </div>
          </div>
        );

      // ─── Step 3: Income ───
      case 3:
        return (
          <div>
            <div style={questionStyle}>What's your annual income?</div>
            <BigInput value={income} onChange={setIncome} placeholder="e.g. 55,000" />
            {inc > 0 && (
              <div style={hintStyle}>
                Based on this, you could borrow up to <span style={{ fontWeight: 700, color: T.primary, fontFamily: MONO }}>{fmt(maxBorrow)}</span>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Btn primary onClick={next} disabled={!inc} style={{ padding: "14px 48px", fontSize: 15 }}>Continue</Btn>
            </div>
          </div>
        );

      // ─── Step 4: Employment ───
      case 4:
        return (
          <div>
            <div style={questionStyle}>How do you earn?</div>
            <div style={{ display: "flex", gap: 14, marginTop: 32, justifyContent: "center" }}>
              {EMPLOYMENT_OPTIONS.map(o => (
                <div key={o.id} onClick={() => { setEmployment(o.id); next(); }} style={{
                  background: T.card, borderRadius: 14, padding: "28px 24px",
                  border: `1px solid ${T.border}`, cursor: "pointer",
                  textAlign: "center", minWidth: 140, transition: "all 0.15s",
                }}>
                  <div style={{ color: T.primary, marginBottom: 10 }}>{Ico[o.icon](28)}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{o.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      // ─── Step 5: Result ───
      case 5:
        return (
          <div style={{ textAlign: "center" }}>
            <AnimatedCheck />
            <div style={{
              fontSize: 22, fontWeight: 700,
              color: isEligible ? T.success : "#92400E",
              marginBottom: 8,
            }}>
              {isEligible ? "Great news! You're likely eligible" : "We may need more details"}
            </div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>
              {isEligible
                ? "Based on the information you've shared, here's your summary."
                : ltv > 90
                  ? "Your LTV is above 90% — we'll need additional verification."
                  : "Self-employed applications require extra documentation."}
            </div>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 28 }}>
              {[
                ["You could borrow", fmt(loanAmount)],
                ["Monthly payment", "~" + fmt(Math.round(monthlyPayment))],
                ["LTV", ltv + "%"],
              ].map(([label, val]) => (
                <div key={label} style={{
                  background: T.card, borderRadius: 12, padding: "18px 22px", minWidth: 140,
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: MONO }}>{val}</div>
                </div>
              ))}
            </div>

            <Btn primary onClick={next} style={{ padding: "16px 48px", fontSize: 16, width: "100%" }}>Continue Application</Btn>
          </div>
        );

      // ─── Step 6: Submitted ───
      case 6:
        return (
          <div style={{ textAlign: "center" }}>
            <ConfettiDots />
            <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 8 }}>Application Submitted!</div>
            <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 6 }}>
              Reference: <span style={{ fontFamily: MONO, fontWeight: 600, color: T.primary }}>AFN-2026-00215</span>
            </div>

            <Card style={{ textAlign: "left", margin: "28px 0", padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>What happens next</div>
              {[
                { num: 1, title: "Document Check", desc: "We'll review your documents within 24 hours" },
                { num: 2, title: "Valuation", desc: "A surveyor will value the property (3-5 working days)" },
                { num: 3, title: "Offer", desc: "If all looks good, you'll receive a formal mortgage offer" },
              ].map(step => (
                <div key={step.num} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: step.num < 3 ? 16 : 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                    color: "#fff", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{step.num}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </Card>

            <Btn primary onClick={() => onSubmitted?.()} style={{ padding: "16px 48px", fontSize: 15, width: "100%" }}>Track My Application</Btn>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: T.font, padding: "20px 0" }}>

      {/* Progress dots (visible on steps 0-5) */}
      {currentStep < 6 && <ProgressDots current={currentStep} total={6} />}

      {/* Back button */}
      {currentStep > 0 && currentStep < 6 && (
        <div onClick={back} style={{
          display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
          fontSize: 13, fontWeight: 600, color: T.primary, marginBottom: 20,
        }}>
          {Ico.arrowLeft(16)} Back
        </div>
      )}

      {/* Step content */}
      {renderStep()}
    </div>
  );
}
