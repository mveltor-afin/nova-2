import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

/* ── helpers ── */
const fmt = (v) => v.toLocaleString("en-GB");
const fmtGBP = (v) => "£" + v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v, dp = 1) => v.toFixed(dp) + "%";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function calcMonthly(P, rateAnnual, termYears) {
  const r = rateAnnual / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return P / n;
  return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/* ── slider row ── */
function SliderRow({ label, value, min, max, step, format, onChange, readOnly }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: T.font }}>
          {format ? format(value) : value}
        </span>
      </div>
      {!readOnly && (
        <input
          type="range"
          min={min}
          max={max}
          step={step || 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.primary, cursor: "pointer" }}
        />
      )}
      {readOnly && (
        <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, width: pct(clamp(((value - min) / (max - min)) * 100, 0, 100), 0), background: T.primary, transition: "width 0.2s" }} />
        </div>
      )}
    </div>
  );
}

/* ── dimension bar ── */
function DimensionBar({ label, score, explanation, icon }) {
  const color = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "flex", alignItems: "center", gap: 5 }}>
          {icon}{label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score.toFixed(0)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: pct(clamp(score, 0, 100), 0), background: color, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{explanation}</div>
    </div>
  );
}

/* ── circular gauge ── */
function ScoreGauge({ score }) {
  const radius = 64;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(score, 0, 100) / 100) * circumference;
  const color = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke={T.borderLight} strokeWidth={stroke} />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s" }}
        />
        <text x="80" y="72" textAnchor="middle" style={{ fontSize: 36, fontWeight: 700, fill: T.text, fontFamily: T.font }}>{Math.round(score)}</text>
        <text x="80" y="96" textAnchor="middle" style={{ fontSize: 12, fill: T.textMuted, fontFamily: T.font }}>/ 100</text>
      </svg>
    </div>
  );
}

/* ── main component ── */
export default function DecisionEngine() {
  const [selectedLoan, setSelectedLoan] = useState(MOCK_LOANS[0].id);
  const [income, setIncome] = useState(70000);
  const [loanAmount, setLoanAmount] = useState(350000);
  const [propertyValue, setPropertyValue] = useState(485000);
  const [rate, setRate] = useState(4.49);
  const [term, setTerm] = useState(25);
  const [creditScore, setCreditScore] = useState(742);
  const [dependants, setDependants] = useState(1);
  const [employmentTenure, setEmploymentTenure] = useState(7);

  const analysis = useMemo(() => {
    const ltv = (loanAmount / propertyValue) * 100;
    const monthlyPayment = calcMonthly(loanAmount, rate, term);
    const monthlyIncome = income / 12;
    const dti = (monthlyPayment / monthlyIncome) * 100;
    const stressedRate = rate + 3;
    const stressedPayment = calcMonthly(loanAmount, stressedRate, term);
    const stressedDTI = (stressedPayment / monthlyIncome) * 100;
    const surplus = monthlyIncome - monthlyPayment;

    // Borrower dimension (credit score + employment)
    const creditNorm = clamp(((creditScore - 300) / 699) * 80 + 20, 0, 100);
    const empNorm = clamp((employmentTenure / 10) * 100, 0, 100);
    const borrower = clamp(creditNorm * 0.7 + empNorm * 0.3, 0, 100);

    // Affordability dimension (DTI-based)
    let affordability;
    if (dti <= 25) affordability = 95;
    else if (dti <= 35) affordability = 85 - (dti - 25);
    else if (dti <= 45) affordability = 75 - (dti - 35) * 2;
    else affordability = Math.max(10, 55 - (dti - 45) * 3);

    // Collateral dimension (LTV-based)
    let collateral;
    if (ltv <= 60) collateral = 98;
    else if (ltv <= 75) collateral = 90 - (ltv - 60);
    else if (ltv <= 85) collateral = 75 - (ltv - 75) * 2;
    else if (ltv <= 95) collateral = 55 - (ltv - 85) * 3;
    else collateral = Math.max(5, 25 - (ltv - 95) * 5);

    // Policy dimension
    let policy = 100;
    if (ltv > 95) policy -= 40;
    else if (ltv > 90) policy -= 15;
    if (income < 25000) policy -= 30;
    if (income < 20000) policy -= 15;
    if (dependants >= 4) policy -= 10;
    policy = clamp(policy, 0, 100);

    // Fraud dimension
    const fraudBase = creditScore > 700 ? 99 : creditScore > 500 ? 97 : 96;
    const fraud = clamp(fraudBase - (Math.abs(creditScore - 742) % 4), 92, 100);

    // Sensitivity dimension
    let sensitivity;
    if (stressedDTI <= 35) sensitivity = 95;
    else if (stressedDTI <= 45) sensitivity = 80 - (stressedDTI - 35) * 2;
    else if (stressedDTI <= 60) sensitivity = 60 - (stressedDTI - 45) * 2;
    else sensitivity = Math.max(5, 30 - (stressedDTI - 60) * 2);

    // Overall weighted score
    const overall = clamp(
      borrower * 0.2 +
      affordability * 0.25 +
      collateral * 0.2 +
      policy * 0.15 +
      fraud * 0.05 +
      sensitivity * 0.15,
      0, 100
    );

    // Risk level and recommendation
    let riskLevel, riskColor, riskBg;
    if (overall >= 75) { riskLevel = "Low Risk"; riskColor = T.success; riskBg = T.successBg; }
    else if (overall >= 50) { riskLevel = "Medium Risk"; riskColor = T.warning; riskBg = T.warningBg; }
    else { riskLevel = "High Risk"; riskColor = T.danger; riskBg = T.dangerBg; }

    let recommendation, recColor, recBg;
    if (overall > 80) { recommendation = "APPROVE"; recColor = T.success; recBg = T.successBg; }
    else if (overall > 65) { recommendation = "CONDITIONAL"; recColor = T.warning; recBg = T.warningBg; }
    else if (overall > 50) { recommendation = "REFER"; recColor = "#B45309"; recBg = "#FEF3C7"; }
    else { recommendation = "DECLINE"; recColor = T.danger; recBg = T.dangerBg; }

    // Key findings
    const findings = [];
    if (ltv <= 75) findings.push(`LTV at ${ltv.toFixed(1)}% provides comfortable equity buffer`);
    else if (ltv <= 85) findings.push(`LTV at ${ltv.toFixed(1)}% is acceptable but limits equity cushion`);
    else if (ltv <= 90) findings.push(`WARNING: LTV at ${ltv.toFixed(1)}% — elevated risk with thin equity margin`);
    else findings.push(`WARNING: LTV exceeds 90% at ${ltv.toFixed(1)}% — limited equity protection`);

    if (creditScore >= 750) findings.push(`Excellent credit score (${creditScore}) — strong borrower profile`);
    else if (creditScore >= 650) findings.push(`Good credit score (${creditScore}) — meets standard criteria`);
    else findings.push(`WARNING: Credit score (${creditScore}) below standard threshold of 650`);

    if (dti <= 30) findings.push(`Healthy DTI at ${dti.toFixed(1)}% — strong affordability position`);
    else if (dti <= 40) findings.push(`DTI at ${dti.toFixed(1)}% is within acceptable range`);
    else findings.push(`WARNING: DTI at ${dti.toFixed(1)}% exceeds recommended 40% threshold`);

    if (stressedDTI > 45) findings.push(`Stress test concern: DTI rises to ${stressedDTI.toFixed(1)}% at +3% rate increase`);
    else findings.push(`Passes stress test: DTI at ${stressedDTI.toFixed(1)}% under +3% rate scenario`);

    if (employmentTenure >= 5) findings.push(`${employmentTenure} years employment tenure demonstrates job stability`);
    else if (employmentTenure >= 2) findings.push(`Employment tenure of ${employmentTenure} years — adequate but monitor`);
    else findings.push(`WARNING: Only ${employmentTenure} year(s) employment tenure — stability concern`);

    return {
      ltv, monthlyPayment, monthlyIncome, dti, stressedDTI, stressedPayment, surplus,
      borrower, affordability, collateral, policy, fraud, sensitivity,
      overall, riskLevel, riskColor, riskBg,
      recommendation, recColor, recBg,
      findings: findings.slice(0, 5),
    };
  }, [income, loanAmount, propertyValue, rate, term, creditScore, dependants, employmentTenure]);

  const dimensions = [
    { label: "Borrower", score: analysis.borrower, icon: Ico.user(14), explanation: `Credit ${creditScore} + ${employmentTenure}yr tenure — ${analysis.borrower >= 75 ? "strong" : analysis.borrower >= 50 ? "adequate" : "weak"} borrower profile` },
    { label: "Affordability", score: analysis.affordability, icon: Ico.dollar(14), explanation: `DTI ${analysis.dti.toFixed(1)}% on ${fmtGBP(analysis.monthlyPayment)}/mo payment — ${analysis.affordability >= 75 ? "comfortable" : analysis.affordability >= 50 ? "stretched" : "strained"}` },
    { label: "Collateral", score: analysis.collateral, icon: Ico.shield(14), explanation: `LTV ${analysis.ltv.toFixed(1)}% — ${analysis.collateral >= 75 ? "strong equity buffer" : analysis.collateral >= 50 ? "acceptable coverage" : "thin margin"}` },
    { label: "Policy", score: analysis.policy, icon: Ico.check(14), explanation: `${analysis.policy >= 90 ? "Meets all lending criteria" : analysis.policy >= 70 ? "Minor policy exceptions noted" : "Policy breaches detected — escalation required"}` },
    { label: "Fraud", score: analysis.fraud, icon: Ico.lock(14), explanation: `No anomalies detected — identity and income verified` },
    { label: "Sensitivity", score: analysis.sensitivity, icon: Ico.zap(14), explanation: `Stressed DTI ${analysis.stressedDTI.toFixed(1)}% at ${(rate + 3).toFixed(2)}% — ${analysis.sensitivity >= 70 ? "resilient" : analysis.sensitivity >= 45 ? "marginal" : "vulnerable"}` },
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 4 }}>
          {Ico.sparkle(22)}
          Real-Time Decisioning Engine
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginLeft: 32 }}>
          Adjust parameters to see how the AI risk model responds — explainable, transparent, auditable
        </div>
      </div>

      {/* Case selector */}
      <Card style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, whiteSpace: "nowrap" }}>Case:</span>
          <select
            value={selectedLoan}
            onChange={(e) => setSelectedLoan(e.target.value)}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
              fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none",
            }}
          >
            {MOCK_LOANS.map((l) => (
              <option key={l.id} value={l.id}>{l.id} — {l.names}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left column — parameters */}
        <Card style={{ flex: "0 0 55%", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.settings(16)} Input Parameters
          </div>

          <SliderRow label="Annual Income" value={income} min={20000} max={200000} step={1000} format={(v) => "£" + fmt(v)} onChange={setIncome} />
          <SliderRow label="Loan Amount" value={loanAmount} min={50000} max={1500000} step={5000} format={(v) => "£" + fmt(v)} onChange={setLoanAmount} />
          <SliderRow label="Property Value" value={propertyValue} min={100000} max={2000000} step={5000} format={(v) => "£" + fmt(v)} onChange={setPropertyValue} />
          <SliderRow label="Loan-to-Value (LTV)" value={analysis.ltv} min={0} max={150} format={(v) => pct(v)} readOnly />

          <div style={{ height: 1, background: T.borderLight, margin: "16px 0" }} />

          <SliderRow label="Interest Rate" value={rate} min={2} max={10} step={0.01} format={(v) => pct(v, 2)} onChange={setRate} />
          <SliderRow label="Term (years)" value={term} min={5} max={40} format={(v) => v + " years"} onChange={setTerm} />
          <SliderRow label="Credit Score" value={creditScore} min={300} max={999} format={(v) => String(v)} onChange={setCreditScore} />
          <SliderRow label="Dependants" value={dependants} min={0} max={6} format={(v) => String(v)} onChange={setDependants} />
          <SliderRow label="Employment Tenure" value={employmentTenure} min={0} max={30} format={(v) => v + " years"} onChange={setEmploymentTenure} />
        </Card>

        {/* Right column — results */}
        <div style={{ flex: "0 0 calc(45% - 20px)", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Overall score + recommendation */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <ScoreGauge score={analysis.overall} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Overall AI Score</div>
                <div style={{
                  display: "inline-block", padding: "4px 14px", borderRadius: 6,
                  fontSize: 12, fontWeight: 700, background: analysis.riskBg, color: analysis.riskColor,
                  marginBottom: 10,
                }}>
                  {analysis.riskLevel}
                </div>
                <div style={{
                  display: "inline-block", marginLeft: 8, padding: "4px 14px", borderRadius: 6,
                  fontSize: 13, fontWeight: 800, letterSpacing: 0.5,
                  background: analysis.recBg, color: analysis.recColor,
                }}>
                  {analysis.recommendation}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 8 }}>
                  AI recommendation based on 6-dimension weighted model
                </div>
              </div>
            </div>
          </Card>

          {/* Dimension scores */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.chart(16)} Dimension Scores
            </div>
            {dimensions.map((d) => (
              <DimensionBar key={d.label} label={d.label} score={d.score} explanation={d.explanation} icon={d.icon} />
            ))}
          </Card>

          {/* Affordability breakdown */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.dollar(16)} Affordability Breakdown
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Monthly Payment", value: fmtGBP(analysis.monthlyPayment) },
                { label: "Monthly Income", value: fmtGBP(analysis.monthlyIncome) },
                { label: "Monthly Surplus", value: fmtGBP(analysis.surplus), color: analysis.surplus > 0 ? T.success : T.danger },
                { label: "Current DTI", value: pct(analysis.dti), color: analysis.dti <= 40 ? T.success : analysis.dti <= 50 ? T.warning : T.danger },
                { label: "Stressed DTI (+3%)", value: pct(analysis.stressedDTI), color: analysis.stressedDTI <= 45 ? T.success : analysis.stressedDTI <= 55 ? T.warning : T.danger },
                { label: "Stressed Payment", value: fmtGBP(analysis.stressedPayment) },
              ].map((item) => (
                <div key={item.label} style={{ padding: "10px 12px", borderRadius: 8, background: T.bg }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color || T.text }}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key findings */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.eye(16)} Key Findings
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.findings.map((f, i) => {
                const isWarning = f.startsWith("WARNING");
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "8px 12px", borderRadius: 8,
                      background: isWarning ? T.dangerBg : T.successBg,
                      border: `1px solid ${isWarning ? T.dangerBorder : T.successBorder}`,
                    }}
                  >
                    <span style={{ marginTop: 1, flexShrink: 0, color: isWarning ? T.danger : T.success }}>
                      {isWarning ? Ico.alert(14) : Ico.check(14)}
                    </span>
                    <span style={{ fontSize: 12, color: isWarning ? T.danger : T.text, lineHeight: 1.4 }}>{f}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
