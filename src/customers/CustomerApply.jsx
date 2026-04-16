import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// CUSTOMER APPLY — Conversational 4-step flow
// Direct Customer application experience
// ─────────────────────────────────────────────

const fmt = (n) => "£" + Number(n).toLocaleString("en-GB");

const productChoices = [
  { key: "buy", label: "Buy a Home", icon: "loans", desc: "Find your first or next mortgage" },
  { key: "remortgage", label: "Remortgage", icon: "dollar", desc: "Switch your deal and save" },
  { key: "savings", label: "Open Savings", icon: "wallet", desc: "Grow your money with great rates" },
  { key: "insurance", label: "Get Insurance", icon: "shield", desc: "Protect what matters most" },
];

const employmentOpts = [
  { value: "", label: "Select..." },
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "contractor", label: "Contractor" },
];

const termOpts = [
  { value: "", label: "Select..." },
  { value: "easy-access", label: "Easy Access" },
  { value: "30-day", label: "30-Day Notice" },
  { value: "1yr", label: "1yr Fixed" },
  { value: "2yr", label: "2yr Fixed" },
];

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
  fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
};

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 };

function Field({ label, prefix, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 0 0 12px", fontSize: 13, color: T.textMuted }}>{prefix}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, border: "none" }} />
      </div>
    </div>
  );
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function CustomerApply({ onSubmitted }) {
  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState("");

  // Buy fields
  const [propertyValue, setPropertyValue] = useState("");
  const [deposit, setDeposit] = useState("");
  const [income, setIncome] = useState("");
  const [employment, setEmployment] = useState("");

  // Remortgage fields
  const [currentBalance, setCurrentBalance] = useState("");
  const [currentRate, setCurrentRate] = useState("");
  const [rmPropertyValue, setRmPropertyValue] = useState("");
  const [rmIncome, setRmIncome] = useState("");

  // Savings fields
  const [saveAmount, setSaveAmount] = useState("");
  const [termPref, setTermPref] = useState("");

  // Insurance fields
  const [coverAmount, setCoverAmount] = useState("");
  const [insTerm, setInsTerm] = useState("");
  const [smoker, setSmoker] = useState("no");

  const canProceedStep2 = () => {
    if (choice === "buy") return propertyValue && deposit && income && employment;
    if (choice === "remortgage") return currentBalance && currentRate && rmPropertyValue && rmIncome;
    if (choice === "savings") return saveAmount && termPref;
    if (choice === "insurance") return coverAmount && insTerm;
    return false;
  };

  // Calculations for Step 3
  const getResults = () => {
    if (choice === "buy") {
      const maxBorrow = Number(income) * 4.5;
      const loanNeeded = Number(propertyValue) - Number(deposit);
      const ltv = Math.round((loanNeeded / Number(propertyValue)) * 100);
      const eligible = loanNeeded <= maxBorrow && ltv <= 95;
      const conditional = loanNeeded <= maxBorrow && ltv > 85;
      const monthlyRate = 4.49 / 100 / 12;
      const months = 25 * 12;
      const monthly = Math.round(loanNeeded * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
      return { maxBorrow, loanNeeded, ltv, eligible: eligible || conditional, conditional, monthly };
    }
    if (choice === "remortgage") {
      const maxBorrow = Number(rmIncome) * 4.5;
      const ltv = Math.round((Number(currentBalance) / Number(rmPropertyValue)) * 100);
      const eligible = Number(currentBalance) <= maxBorrow && ltv <= 90;
      const monthlyRate = 4.29 / 100 / 12;
      const months = 25 * 12;
      const monthly = Math.round(Number(currentBalance) * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
      return { maxBorrow, ltv, eligible, monthly };
    }
    if (choice === "savings") {
      const rateMap = { "easy-access": 2.5, "30-day": 2.95, "1yr": 4.5, "2yr": 4.85 };
      const rate = rateMap[termPref] || 3.0;
      const interest = Math.round(Number(saveAmount) * (rate / 100));
      return { rate, interest };
    }
    if (choice === "insurance") {
      const base = smoker === "yes" ? 18 : 12;
      const premium = Math.round(base * (Number(coverAmount) / 150000) * (Number(insTerm) / 20));
      return { premium: Math.max(premium, 8) };
    }
    return {};
  };

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px", fontFamily: T.font }}>

      {/* ── Progress Bar ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{
              fontSize: 11, fontWeight: 700, color: s <= step ? T.primary : T.textMuted,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                background: s < step ? T.success : s === step ? T.primary : T.bg,
                color: s <= step ? "#fff" : T.textMuted,
              }}>
                {s < step ? <span style={{ color: "#fff" }}>{Ico.check(14)}</span> : s}
              </span>
              <span style={{ display: s === 1 || s === 4 ? "inline" : undefined }}>
                {s === 1 ? "Choose" : s === 2 ? "Details" : s === 3 ? "Result" : "Done"}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 4, borderRadius: 2, background: T.bg }}>
          <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${T.primary}, ${T.success})`, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* ── Step 1: Choose Product ── */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>What do you need?</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Pick the product that's right for you</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {productChoices.map((p) => (
              <div key={p.key} onClick={() => { setChoice(p.key); setStep(2); }} style={{
                background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 24,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: choice === p.key ? `0 0 0 2px ${T.primary}` : "none",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ color: T.primary, marginBottom: 12 }}>{Ico[p.icon]?.(28)}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Form Fields ── */}
      {step === 2 && (
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Tell us the basics</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>We just need a few details to get started</div>

          <Card>
            {choice === "buy" && (<>
              <Field label="Property value" prefix="£" value={propertyValue} onChange={setPropertyValue} />
              <Field label="Deposit" prefix="£" value={deposit} onChange={setDeposit} />
              <Field label="Annual income" prefix="£" value={income} onChange={setIncome} />
              <Dropdown label="Employment status" value={employment} onChange={setEmployment} options={employmentOpts} />
            </>)}

            {choice === "remortgage" && (<>
              <Field label="Current mortgage balance" prefix="£" value={currentBalance} onChange={setCurrentBalance} />
              <Field label="Current interest rate" value={currentRate} onChange={setCurrentRate} type="text" />
              <Field label="Property value" prefix="£" value={rmPropertyValue} onChange={setRmPropertyValue} />
              <Field label="Annual income" prefix="£" value={rmIncome} onChange={setRmIncome} />
            </>)}

            {choice === "savings" && (<>
              <Field label="Amount to save" prefix="£" value={saveAmount} onChange={setSaveAmount} />
              <Dropdown label="Term preference" value={termPref} onChange={setTermPref} options={termOpts} />
            </>)}

            {choice === "insurance" && (<>
              <Field label="Cover amount" prefix="£" value={coverAmount} onChange={setCoverAmount} />
              <Field label="Term (years)" value={insTerm} onChange={setInsTerm} />
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Smoker?</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["no", "yes"].map((v) => (
                    <div key={v} onClick={() => setSmoker(v)} style={{
                      flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 9, cursor: "pointer",
                      border: smoker === v ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                      background: smoker === v ? T.primaryLight : T.card,
                      fontSize: 13, fontWeight: 600, color: smoker === v ? T.primary : T.text,
                    }}>
                      {v === "no" ? "No" : "Yes"}
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </Card>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn onClick={() => setStep(1)}>Back</Btn>
            <Btn primary disabled={!canProceedStep2()} onClick={() => setStep(3)}>See My Result</Btn>
          </div>
        </div>
      )}

      {/* ── Step 3: Instant Result ── */}
      {step === 3 && (() => {
        const r = getResults();
        return (
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 6 }}>Instant Result</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Here's what we can offer based on your details</div>

            <Card>
              {(choice === "buy" || choice === "remortgage") && (<>
                {/* Eligibility Badge */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <span style={{
                    display: "inline-block", padding: "8px 24px", borderRadius: 20, fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
                    background: r.eligible ? (r.conditional ? T.warningBg : T.successBg) : T.dangerBg,
                    color: r.eligible ? (r.conditional ? "#92400E" : T.success) : T.danger,
                  }}>
                    {r.eligible ? (r.conditional ? "CONDITIONAL" : "ELIGIBLE") : "NOT ELIGIBLE"}
                  </span>
                </div>

                {choice === "buy" && (
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Based on your details, you could borrow up to</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: T.primary }}>{fmt(r.maxBorrow)}</div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <KPICard label="Estimated Monthly" value={fmt(r.monthly)} color={T.primary} />
                  <KPICard label="LTV" value={`${r.ltv}%`} color={r.ltv > 85 ? T.warning : T.success} />
                </div>
              </>)}

              {choice === "savings" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Your estimated interest</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: T.success }}>{fmt(r.interest)}/year</div>
                  <div style={{ fontSize: 14, color: T.textMuted, marginTop: 6 }}>at {r.rate}% AER</div>
                </div>
              )}

              {choice === "insurance" && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Estimated premium</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: T.primary }}>{fmt(r.premium)}/month</div>
                </div>
              )}
            </Card>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn onClick={() => setStep(2)}>Back</Btn>
              <Btn primary onClick={() => setStep(4)}>Continue Application</Btn>
            </div>
          </div>
        );
      })()}

      {/* ── Step 4: Success ── */}
      {step === 4 && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36, background: T.successBg, margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: T.success }}>{Ico.check(36)}</span>
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 8 }}>
            Your application has been submitted
          </div>

          <div style={{
            display: "inline-block", padding: "8px 20px", borderRadius: 8, background: T.bg,
            fontSize: 14, fontWeight: 600, color: T.textSecondary, marginBottom: 28, letterSpacing: 0.5,
          }}>
            Reference: AFN-2026-00215
          </div>

          <Card style={{ textAlign: "left", marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 16 }}>What happens next:</div>
            {[
              { num: 1, text: "We'll verify your details" },
              { num: 2, text: "You'll receive a decision" },
              { num: 3, text: "We'll contact you to complete" },
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 14, background: T.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: T.primary, flexShrink: 0,
                }}>
                  {s.num}
                </span>
                <span style={{ fontSize: 13, color: T.text }}>{s.text}</span>
              </div>
            ))}
          </Card>

          <Btn primary onClick={() => onSubmitted?.()}>Track My Application</Btn>
        </div>
      )}
    </div>
  );
}
