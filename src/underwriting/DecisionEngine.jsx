import { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

/* ── helpers ── */
const fmt = (v) => v.toLocaleString("en-GB");
const fmtGBP = (v) => "£" + v.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtGBP2 = (v) => "£" + v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v, dp = 1) => v.toFixed(dp) + "%";
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function calcMonthly(P, rateAnnual, termYears) {
  const r = rateAnnual / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return P / n;
  return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/* ── Scenario presets ── */
const PRESETS = {
  base:   { label: "Base Case",   income: 70000, loanAmount: 350000, propertyValue: 485000, rate: 4.49, term: 25, creditScore: 742, dependants: 1, employmentTenure: 7 },
  stress: { label: "Stress Test",  income: 70000, loanAmount: 350000, propertyValue: 485000, rate: 7.49, term: 25, creditScore: 742, dependants: 1, employmentTenure: 7 },
  best:   { label: "Best Case",   income: 95000, loanAmount: 300000, propertyValue: 550000, rate: 3.99, term: 30, creditScore: 810, dependants: 0, employmentTenure: 12 },
  worst:  { label: "Adverse",     income: 45000, loanAmount: 400000, propertyValue: 420000, rate: 6.50, term: 20, creditScore: 580, dependants: 3, employmentTenure: 2 },
};

/* ── Analysis engine (pure function) ── */
function runAnalysis({ income, loanAmount, propertyValue, rate, term, creditScore, dependants, employmentTenure }) {
  const ltv = (loanAmount / propertyValue) * 100;
  const monthlyPayment = calcMonthly(loanAmount, rate, term);
  const monthlyIncome = income / 12;
  const dti = (monthlyPayment / monthlyIncome) * 100;
  const stressedRate = rate + 3;
  const stressedPayment = calcMonthly(loanAmount, stressedRate, term);
  const stressedDTI = (stressedPayment / monthlyIncome) * 100;
  const surplus = monthlyIncome - monthlyPayment;

  const creditNorm = clamp(((creditScore - 300) / 699) * 80 + 20, 0, 100);
  const empNorm = clamp((employmentTenure / 10) * 100, 0, 100);
  const borrower = clamp(creditNorm * 0.7 + empNorm * 0.3, 0, 100);

  let affordability;
  if (dti <= 25) affordability = 95;
  else if (dti <= 35) affordability = 85 - (dti - 25);
  else if (dti <= 45) affordability = 75 - (dti - 35) * 2;
  else affordability = Math.max(10, 55 - (dti - 45) * 3);

  let collateral;
  if (ltv <= 60) collateral = 98;
  else if (ltv <= 75) collateral = 90 - (ltv - 60);
  else if (ltv <= 85) collateral = 75 - (ltv - 75) * 2;
  else if (ltv <= 95) collateral = 55 - (ltv - 85) * 3;
  else collateral = Math.max(5, 25 - (ltv - 95) * 5);

  let policy = 100;
  if (ltv > 95) policy -= 40; else if (ltv > 90) policy -= 15;
  if (income < 25000) policy -= 30;
  if (income < 20000) policy -= 15;
  if (dependants >= 4) policy -= 10;
  policy = clamp(policy, 0, 100);

  const fraudBase = creditScore > 700 ? 99 : creditScore > 500 ? 97 : 96;
  const fraud = clamp(fraudBase - (Math.abs(creditScore - 742) % 4), 92, 100);

  let sensitivity;
  if (stressedDTI <= 35) sensitivity = 95;
  else if (stressedDTI <= 45) sensitivity = 80 - (stressedDTI - 35) * 2;
  else if (stressedDTI <= 60) sensitivity = 60 - (stressedDTI - 45) * 2;
  else sensitivity = Math.max(5, 30 - (stressedDTI - 60) * 2);

  const overall = clamp(
    borrower * 0.2 + affordability * 0.25 + collateral * 0.2 +
    policy * 0.15 + fraud * 0.05 + sensitivity * 0.15, 0, 100
  );

  let riskLevel, riskColor, riskBg;
  if (overall >= 75) { riskLevel = "Low Risk"; riskColor = T.success; riskBg = T.successBg; }
  else if (overall >= 50) { riskLevel = "Medium Risk"; riskColor = T.warning; riskBg = T.warningBg; }
  else { riskLevel = "High Risk"; riskColor = T.danger; riskBg = T.dangerBg; }

  let recommendation, recColor, recBg;
  if (overall > 80) { recommendation = "APPROVE"; recColor = T.success; recBg = T.successBg; }
  else if (overall > 65) { recommendation = "CONDITIONAL"; recColor = T.warning; recBg = T.warningBg; }
  else if (overall > 50) { recommendation = "REFER"; recColor = "#B45309"; recBg = "#FEF3C7"; }
  else { recommendation = "DECLINE"; recColor = T.danger; recBg = T.dangerBg; }

  const findings = [];
  if (ltv <= 75) findings.push(`LTV at ${ltv.toFixed(1)}% provides comfortable equity buffer`);
  else if (ltv <= 85) findings.push(`LTV at ${ltv.toFixed(1)}% is acceptable but limits equity cushion`);
  else if (ltv <= 90) findings.push(`WARNING: LTV at ${ltv.toFixed(1)}% — elevated risk`);
  else findings.push(`WARNING: LTV exceeds 90% at ${ltv.toFixed(1)}% — limited equity protection`);
  if (creditScore >= 750) findings.push(`Excellent credit score (${creditScore}) — strong profile`);
  else if (creditScore >= 650) findings.push(`Good credit score (${creditScore}) — meets criteria`);
  else findings.push(`WARNING: Credit score (${creditScore}) below 650 threshold`);
  if (dti <= 30) findings.push(`Healthy DTI at ${dti.toFixed(1)}% — strong affordability`);
  else if (dti <= 40) findings.push(`DTI at ${dti.toFixed(1)}% is within acceptable range`);
  else findings.push(`WARNING: DTI at ${dti.toFixed(1)}% exceeds 40% threshold`);
  if (stressedDTI > 45) findings.push(`Stress test concern: DTI ${stressedDTI.toFixed(1)}% at +3%`);
  else findings.push(`Passes stress test: DTI ${stressedDTI.toFixed(1)}% at +3%`);
  if (employmentTenure >= 5) findings.push(`${employmentTenure}yr tenure — stable employment`);
  else if (employmentTenure >= 2) findings.push(`${employmentTenure}yr tenure — adequate`);
  else findings.push(`WARNING: ${employmentTenure}yr tenure — stability concern`);

  const dims = { borrower, affordability, collateral, policy, fraud, sensitivity };
  return {
    ltv, monthlyPayment, monthlyIncome, dti, stressedDTI, stressedPayment, surplus,
    ...dims, overall, riskLevel, riskColor, riskBg,
    recommendation, recColor, recBg, findings: findings.slice(0, 5),
  };
}

/* ── Compact slider ── */
function Slider({ label, value, min, max, step, format, onChange, readOnly }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{format ? format(value) : value}</span>
      </div>
      {!readOnly ? (
        <input type="range" min={min} max={max} step={step || 1} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.primary, cursor: "pointer", height: 4 }} />
      ) : (
        <div style={{ height: 5, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, width: `${clamp(((value - min) / (max - min)) * 100, 0, 100)}%`, background: T.primary, transition: "width 0.2s" }} />
        </div>
      )}
    </div>
  );
}

/* ── Circular gauge ── */
function ScoreGauge({ score, size = 140, snapshot }) {
  const r = size * 0.4, sw = size * 0.065;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(score, 0, 100) / 100) * circ;
  const color = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;
  const half = size / 2;

  const snapOffset = snapshot != null ? circ - (clamp(snapshot, 0, 100) / 100) * circ : null;
  const snapColor = snapshot != null ? (snapshot >= 75 ? T.success : snapshot >= 50 ? T.warning : T.danger) : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={half} cy={half} r={r} fill="none" stroke={T.borderLight} strokeWidth={sw} />
      {snapshot != null && (
        <circle cx={half} cy={half} r={r} fill="none" stroke={snapColor} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={snapOffset}
          transform={`rotate(-90 ${half} ${half})`} opacity={0.25} />
      )}
      <circle cx={half} cy={half} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${half} ${half})`}
        style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s" }} />
      <text x={half} y={half - 4} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: size * 0.24, fontWeight: 800, fill: T.text, fontFamily: T.font }}>{Math.round(score)}</text>
      <text x={half} y={half + size * 0.12} textAnchor="middle"
        style={{ fontSize: size * 0.085, fill: T.textMuted, fontFamily: T.font }}>/ 100</text>
    </svg>
  );
}

/* ── Radar / spider chart ── */
function RadarChart({ dims, snapshot, size = 260 }) {
  const labels = ["Borrower", "Affordability", "Collateral", "Policy", "Fraud", "Sensitivity"];
  const keys = ["borrower", "affordability", "collateral", "policy", "fraud", "sensitivity"];
  const half = size / 2;
  const maxR = half - 30;
  const n = 6;

  const toXY = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (val / 100) * maxR;
    return [half + r * Math.cos(angle), half + r * Math.sin(angle)];
  };

  const polyPoints = (values) => keys.map((k, i) => toXY(i, values[k]).join(",")).join(" ");

  // Grid circles
  const gridCircles = [25, 50, 75, 100].map(v => {
    const pts = Array.from({ length: n }, (_, i) => toXY(i, v).join(",")).join(" ");
    return <polygon key={v} points={pts} fill="none" stroke={T.borderLight} strokeWidth="0.8" />;
  });

  // Axis lines
  const axes = keys.map((_, i) => {
    const [x, y] = toXY(i, 100);
    return <line key={i} x1={half} y1={half} x2={x} y2={y} stroke={T.borderLight} strokeWidth="0.5" />;
  });

  // Labels
  const labelEls = labels.map((lbl, i) => {
    const [x, y] = toXY(i, 115);
    const score = dims[keys[i]];
    const color = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;
    return (
      <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 10, fontWeight: 700, fill: color, fontFamily: T.font }}>
        {lbl} ({Math.round(score)})
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridCircles}
      {axes}
      {/* Snapshot polygon (dashed, transparent) */}
      {snapshot && (
        <polygon points={polyPoints(snapshot)} fill={`${T.textMuted}10`}
          stroke={T.textMuted} strokeWidth="1.5" strokeDasharray="4 3" />
      )}
      {/* Current polygon */}
      <polygon points={polyPoints(dims)} fill={`${T.primary}18`}
        stroke={T.primary} strokeWidth="2" style={{ transition: "all 0.3s" }} />
      {/* Current dots */}
      {keys.map((k, i) => {
        const [x, y] = toXY(i, dims[k]);
        const c = dims[k] >= 75 ? T.success : dims[k] >= 50 ? T.warning : T.danger;
        return <circle key={i} cx={x} cy={y} r={4} fill={c} stroke="#fff" strokeWidth="1.5"
          style={{ transition: "all 0.3s" }} />;
      })}
      {labelEls}
    </svg>
  );
}

/* ── Delta badge ── */
function Delta({ current, snapshot }) {
  if (snapshot == null) return null;
  const diff = current - snapshot;
  if (Math.abs(diff) < 0.5) return null;
  const positive = diff > 0;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, marginLeft: 6,
      padding: "1px 6px", borderRadius: 4,
      background: positive ? T.successBg : T.dangerBg,
      color: positive ? T.success : T.danger,
    }}>
      {positive ? "+" : ""}{diff.toFixed(1)}
    </span>
  );
}

/* ── Affordability visual bar ── */
function AffordabilityBar({ income, payment, stressed }) {
  const maxVal = income * 1.05;
  const pw = (payment / maxVal) * 100;
  const sw = (stressed / maxVal) * 100;
  const surplusPct = 100 - pw;
  const surplusVal = income - payment;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Monthly Income Allocation</div>
      {/* Main bar */}
      <div style={{ position: "relative", height: 36, borderRadius: 8, overflow: "hidden", background: T.borderLight }}>
        {/* Payment portion */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pw}%`, background: T.primary, transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>Payment {fmtGBP(payment)}</span>
        </div>
        {/* Surplus portion */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${surplusPct}%`, background: `${T.success}30`, display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.success }}>Surplus {fmtGBP(surplusVal)}</span>
        </div>
        {/* Stressed marker */}
        <div style={{ position: "absolute", left: `${sw}%`, top: -2, bottom: -2, width: 2, background: T.danger, transition: "left 0.3s" }} />
      </div>
      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: T.textMuted }}>
        <span>£0</span>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 3, background: T.primary, borderRadius: 1 }} /> Payment</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 3, background: `${T.success}60`, borderRadius: 1 }} /> Surplus</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 3, background: T.danger, borderRadius: 1 }} /> Stressed</span>
        </div>
        <span>{fmtGBP(income)}/mo</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
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
  const [activePreset, setActivePreset] = useState("base");
  const [snapshot, setSnapshot] = useState(null); // locked comparison state

  const params = { income, loanAmount, propertyValue, rate, term, creditScore, dependants, employmentTenure };
  const analysis = useMemo(() => runAnalysis(params), [income, loanAmount, propertyValue, rate, term, creditScore, dependants, employmentTenure]);
  const snapAnalysis = useMemo(() => snapshot ? runAnalysis(snapshot) : null, [snapshot]);

  const applyPreset = (key) => {
    const p = PRESETS[key];
    setIncome(p.income); setLoanAmount(p.loanAmount); setPropertyValue(p.propertyValue);
    setRate(p.rate); setTerm(p.term); setCreditScore(p.creditScore);
    setDependants(p.dependants); setEmploymentTenure(p.employmentTenure);
    setActivePreset(key);
  };

  const lockSnapshot = () => setSnapshot({ ...params });
  const clearSnapshot = () => setSnapshot(null);

  const dimKeys = ["borrower", "affordability", "collateral", "policy", "fraud", "sensitivity"];
  const dimLabels = { borrower: "Borrower", affordability: "Affordability", collateral: "Collateral", policy: "Policy", fraud: "Fraud", sensitivity: "Sensitivity" };
  const dimIcons = { borrower: Ico.user(12), affordability: Ico.dollar(12), collateral: Ico.shield(12), policy: Ico.check(12), fraud: Ico.lock(12), sensitivity: Ico.zap(12) };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* ── Header + Case Selector + Presets ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700 }}>
            {Ico.sparkle(22)} Real-Time Decisioning Engine
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginLeft: 32, marginTop: 2 }}>
            Adjust parameters, compare scenarios, see the AI model respond — explainable, transparent, auditable
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={selectedLoan} onChange={e => setSelectedLoan(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
            {MOCK_LOANS.map(l => <option key={l.id} value={l.id}>{l.id} — {l.names}</option>)}
          </select>
        </div>
      </div>

      {/* Presets + snapshot controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <div key={key} onClick={() => applyPreset(key)} style={{
            padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: activePreset === key ? T.primary : T.card,
            color: activePreset === key ? "#fff" : T.textSecondary,
            border: `1px solid ${activePreset === key ? T.primary : T.border}`,
            transition: "all 0.15s",
          }}>{p.label}</div>
        ))}
        <div style={{ width: 1, height: 24, background: T.borderLight, margin: "0 4px" }} />
        {!snapshot ? (
          <Btn small ghost icon="eye" onClick={lockSnapshot}>Lock Snapshot</Btn>
        ) : (
          <Btn small icon="x" onClick={clearSnapshot} style={{ background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` }}>Clear Snapshot</Btn>
        )}
        {snapshot && <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Comparing against locked state (dashed outline on radar)</span>}
      </div>

      {/* ═══ ROW 1: Score Hub + Radar ═══ */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {/* Score Hub */}
        <Card style={{ flex: "0 0 340px", display: "flex", alignItems: "center", gap: 20, padding: "20px 24px" }}>
          <ScoreGauge score={analysis.overall} size={130} snapshot={snapAnalysis?.overall} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>AI Score</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ padding: "3px 12px", borderRadius: 6, fontSize: 14, fontWeight: 800, letterSpacing: 0.5, background: analysis.recBg, color: analysis.recColor }}>{analysis.recommendation}</span>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: analysis.riskBg, color: analysis.riskColor }}>{analysis.riskLevel}</span>
              <Delta current={analysis.overall} snapshot={snapAnalysis?.overall} />
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
              6-dimension weighted model · {snapshot ? "comparing vs snapshot" : "live recalculation"}
            </div>
            {/* Compact affordability KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
              {[
                { l: "DTI", v: pct(analysis.dti), c: analysis.dti <= 40 ? T.success : analysis.dti <= 50 ? T.warning : T.danger },
                { l: "LTV", v: pct(analysis.ltv), c: analysis.ltv <= 75 ? T.success : analysis.ltv <= 85 ? T.warning : T.danger },
                { l: "Surplus", v: fmtGBP(analysis.surplus), c: analysis.surplus > 0 ? T.success : T.danger },
              ].map(k => (
                <div key={k.l} style={{ padding: "5px 8px", borderRadius: 6, background: T.bg, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{k.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Radar chart */}
        <Card style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
          <RadarChart dims={analysis} snapshot={snapAnalysis} size={280} />
        </Card>
      </div>

      {/* ═══ ROW 2: Three parameter groups + Affordability/Findings ═══ */}
      <div style={{ display: "flex", gap: 16 }}>

        {/* Three grouped slider cards */}
        <div style={{ display: "flex", gap: 12, flex: "0 0 52%" }}>
          {/* Applicant */}
          <Card style={{ flex: 1, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {Ico.user(13)} Applicant
            </div>
            <Slider label="Income" value={income} min={20000} max={200000} step={1000} format={v => "£" + fmt(v)} onChange={setIncome} />
            <Slider label="Credit Score" value={creditScore} min={300} max={999} onChange={setCreditScore} />
            <Slider label="Tenure" value={employmentTenure} min={0} max={30} format={v => v + "yr"} onChange={setEmploymentTenure} />
            <Slider label="Dependants" value={dependants} min={0} max={6} onChange={setDependants} />
          </Card>

          {/* Loan */}
          <Card style={{ flex: 1, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {Ico.dollar(13)} Loan
            </div>
            <Slider label="Amount" value={loanAmount} min={50000} max={1500000} step={5000} format={v => "£" + fmt(v)} onChange={setLoanAmount} />
            <Slider label="Rate" value={rate} min={2} max={10} step={0.01} format={v => pct(v, 2)} onChange={setRate} />
            <Slider label="Term" value={term} min={5} max={40} format={v => v + "yr"} onChange={setTerm} />
            <div style={{ marginTop: 4 }}>
              <Slider label="Monthly Payment" value={analysis.monthlyPayment} min={0} max={10000} format={v => fmtGBP2(v)} readOnly />
            </div>
          </Card>

          {/* Property */}
          <Card style={{ flex: 1, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {Ico.shield(13)} Property
            </div>
            <Slider label="Value" value={propertyValue} min={100000} max={2000000} step={5000} format={v => "£" + fmt(v)} onChange={setPropertyValue} />
            <Slider label="LTV" value={analysis.ltv} min={0} max={120} format={v => pct(v)} readOnly />
            <div style={{ padding: "10px 12px", borderRadius: 8, background: analysis.ltv <= 75 ? T.successBg : analysis.ltv <= 85 ? T.warningBg : T.dangerBg, marginTop: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Equity Buffer</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: analysis.ltv <= 75 ? T.success : analysis.ltv <= 85 ? T.warning : T.danger }}>
                {fmtGBP(propertyValue - loanAmount)}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{(100 - analysis.ltv).toFixed(1)}% equity</div>
            </div>
          </Card>
        </div>

        {/* Right: Affordability + dimension bars + findings */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Affordability visual */}
          <Card style={{ padding: "14px 18px" }}>
            <AffordabilityBar income={analysis.monthlyIncome} payment={analysis.monthlyPayment} stressed={analysis.stressedPayment} />
            {/* Compact metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
              {[
                { l: "Payment", v: fmtGBP2(analysis.monthlyPayment), c: T.text },
                { l: "Stressed", v: fmtGBP2(analysis.stressedPayment), c: T.danger },
                { l: "DTI Now", v: pct(analysis.dti), c: analysis.dti <= 40 ? T.success : T.warning },
                { l: "DTI +3%", v: pct(analysis.stressedDTI), c: analysis.stressedDTI <= 45 ? T.success : T.danger },
              ].map(k => (
                <div key={k.l} style={{ textAlign: "center", padding: "4px 0" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{k.l}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Dimension bars (compact) */}
          <Card style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Dimension Scores</div>
            {dimKeys.map(k => {
              const score = analysis[k];
              const color = score >= 75 ? T.success : score >= 50 ? T.warning : T.danger;
              return (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 14, display: "flex", color }}>{dimIcons[k]}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, width: 72 }}>{dimLabels[k]}</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${clamp(score, 0, 100)}%`, background: color, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color, width: 24, textAlign: "right" }}>{Math.round(score)}</span>
                  <Delta current={score} snapshot={snapAnalysis?.[k]} />
                </div>
              );
            })}
          </Card>

          {/* Key findings */}
          <Card style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Key Findings</div>
            {analysis.findings.map((f, i) => {
              const warn = f.startsWith("WARNING");
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5, fontSize: 12, lineHeight: 1.4 }}>
                  <span style={{ flexShrink: 0, marginTop: 1, color: warn ? T.danger : T.success }}>
                    {warn ? Ico.alert(12) : Ico.check(12)}
                  </span>
                  <span style={{ color: warn ? T.danger : T.text }}>{f}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}
