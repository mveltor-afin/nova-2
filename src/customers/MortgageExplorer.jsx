import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// Mortgage Explorer — Emma Wilson
// ─────────────────────────────────────────────
const BALANCE = 156200;
const RATE = 4.49;
const TERM_YEARS = 14;
const MONTHLY_PAYMENT = 980;
const LTV = 58;
const PRODUCT = "Afin Fix 2yr 75%";

function calcMonthlyPayment(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return months > 0 ? principal / months : 0;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calcMonthsToPayoff(principal, annualRate, monthlyPay) {
  const r = annualRate / 100 / 12;
  if (r === 0) return monthlyPay > 0 ? Math.ceil(principal / monthlyPay) : Infinity;
  if (monthlyPay <= principal * r) return Infinity;
  return Math.ceil(-Math.log(1 - (principal * r) / monthlyPay) / Math.log(1 + r));
}

function calcTotalInterest(principal, annualRate, months) {
  const payment = calcMonthlyPayment(principal, annualRate, months);
  return payment * months - principal;
}

function calcBalanceOverTime(principal, annualRate, monthlyPay, maxMonths) {
  const r = annualRate / 100 / 12;
  const points = [];
  let bal = principal;
  for (let m = 0; m <= maxMonths; m++) {
    points.push({ month: m, balance: Math.max(0, bal) });
    if (bal <= 0) break;
    const interest = bal * r;
    bal = bal - (monthlyPay - interest);
  }
  return points;
}

function formatCurrency(n) {
  return "£" + Math.round(n).toLocaleString("en-GB");
}

function monthYearFromNow(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function MortgageExplorer() {
  const [overpayment, setOverpayment] = useState(0);
  const [simRate, setSimRate] = useState(RATE);

  const originalMonths = TERM_YEARS * 12;

  // ── Overpayment calculations ──
  const overpaymentResults = useMemo(() => {
    const totalMonthly = MONTHLY_PAYMENT + overpayment;
    const newMonths = calcMonthsToPayoff(BALANCE, RATE, totalMonthly);
    const monthsSaved = originalMonths - newMonths;
    const yearsSaved = (monthsSaved / 12);
    const originalInterest = calcTotalInterest(BALANCE, RATE, originalMonths);
    const newInterest = totalMonthly * newMonths - BALANCE;
    const interestSaved = originalInterest - newInterest;
    const totalSaving = interestSaved;
    return {
      newMonths: Math.max(0, newMonths),
      monthsSaved: Math.max(0, monthsSaved),
      yearsSaved: Math.max(0, yearsSaved),
      interestSaved: Math.max(0, interestSaved),
      totalSaving: Math.max(0, totalSaving),
      originalPayoff: monthYearFromNow(originalMonths),
      newPayoff: monthYearFromNow(Math.max(0, newMonths)),
    };
  }, [overpayment, originalMonths]);

  // ── Rate scenario calculations ──
  const rateResults = useMemo(() => {
    const newPayment = calcMonthlyPayment(BALANCE, simRate, originalMonths);
    const diff = newPayment - MONTHLY_PAYMENT;
    return {
      newPayment,
      diff,
      annualImpact: diff * 12,
    };
  }, [simRate, originalMonths]);

  // ── Balance curves for timeline chart ──
  const curves = useMemo(() => {
    const original = calcBalanceOverTime(BALANCE, RATE, MONTHLY_PAYMENT, originalMonths);
    const withOp = calcBalanceOverTime(BALANCE, RATE, MONTHLY_PAYMENT + overpayment, originalMonths);
    return { original, withOp };
  }, [overpayment, originalMonths]);

  // ── SVG helpers ──
  const chartW = 560;
  const chartH = 220;
  const chartPadL = 60;
  const chartPadR = 20;
  const chartPadT = 20;
  const chartPadB = 35;
  const plotW = chartW - chartPadL - chartPadR;
  const plotH = chartH - chartPadT - chartPadB;

  function toX(month) {
    return chartPadL + (month / originalMonths) * plotW;
  }
  function toY(bal) {
    return chartPadT + plotH - (bal / BALANCE) * plotH;
  }

  function pathFromPoints(pts) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.month).toFixed(1)},${toY(p.balance).toFixed(1)}`).join(" ");
  }

  function areaFromPoints(pts) {
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.month).toFixed(1)},${toY(p.balance).toFixed(1)}`).join(" ");
    const lastPt = pts[pts.length - 1];
    return `${line} L${toX(lastPt.month).toFixed(1)},${toY(0).toFixed(1)} L${toX(0).toFixed(1)},${toY(0).toFixed(1)} Z`;
  }

  const sliderTrack = {
    width: "100%", height: 6, appearance: "none", WebkitAppearance: "none",
    background: T.border, borderRadius: 3, outline: "none", cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: T.font }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'Space Grotesk', " + T.font }}>
          Your Mortgage
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{PRODUCT}</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: T.primary, marginTop: 8, letterSpacing: -1 }}>
          {formatCurrency(BALANCE)}
        </div>
      </div>

      {/* ── Key Facts ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Rate" value={`${RATE}%`} color={T.primary} />
        <KPICard label="Monthly" value={`£${MONTHLY_PAYMENT}`} color={T.accent} />
        <KPICard label="Term" value={`${TERM_YEARS} yrs`} color={T.warning} />
        <KPICard label="LTV" value={`${LTV}%`} color="#7C3AED" />
      </div>

      {/* ── Overpayment Simulator ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ color: T.primary }}>{Ico.sparkle(20)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>What if you overpaid?</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <input
              type="range" min={0} max={500} step={25} value={overpayment}
              onChange={e => setOverpayment(Number(e.target.value))}
              style={sliderTrack}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
              <span>£0</span><span>£500/mo</span>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.primary, minWidth: 90, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
            +£{overpayment}
          </div>
        </div>

        {overpayment > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: T.successBg, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Years Saved</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.success }}>{overpaymentResults.yearsSaved.toFixed(1)}</div>
              </div>
              <div style={{ background: T.successBg, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Interest Saved</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.success }}>{formatCurrency(overpaymentResults.interestSaved)}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.text, marginBottom: 8 }}>
              <span>New payoff: <strong>{overpaymentResults.newPayoff}</strong></span>
              <span style={{ color: T.textMuted }}>Original: {overpaymentResults.originalPayoff}</span>
            </div>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 18 }}>
              Total cost saving: <strong style={{ color: T.success }}>{formatCurrency(overpaymentResults.totalSaving)}</strong>
            </div>

            {/* Visual bar comparison */}
            <svg width="100%" viewBox="0 0 500 56" style={{ display: "block" }}>
              {/* Original term bar */}
              <rect x="80" y="4" width="400" height="20" rx="4" fill={T.border} />
              <text x="76" y="18" textAnchor="end" fontSize="10" fill={T.textMuted} fontFamily={T.font}>Original</text>
              <text x="484" y="18" textAnchor="end" fontSize="10" fill={T.textMuted} fontFamily={T.font}>{TERM_YEARS} yrs</text>
              {/* New term bar */}
              {(() => {
                const ratio = overpaymentResults.newMonths / originalMonths;
                const barW = Math.max(20, 400 * ratio);
                const newYrs = (overpaymentResults.newMonths / 12).toFixed(1);
                return (
                  <>
                    <rect x="80" y="32" width={barW} height="20" rx="4" fill={T.success} />
                    <text x="76" y="46" textAnchor="end" fontSize="10" fill={T.success} fontWeight="600" fontFamily={T.font}>With +£{overpayment}</text>
                    <text x={80 + barW + 4} y="46" fontSize="10" fill={T.success} fontWeight="600" fontFamily={T.font}>{newYrs} yrs</text>
                  </>
                );
              })()}
            </svg>
          </>
        )}

        {overpayment === 0 && (
          <div style={{ fontSize: 13, color: T.textMuted, textAlign: "center", padding: 20 }}>
            Move the slider to see how overpaying can save you time and money.
          </div>
        )}
      </Card>

      {/* ── Rate Scenario Simulator ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>
          What if rates change?
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <input
              type="range" min={200} max={1000} step={25} value={Math.round(simRate * 100)}
              onChange={e => setSimRate(Number(e.target.value) / 100)}
              style={sliderTrack}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
              <span>2%</span><span>10%</span>
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.primary, minWidth: 80, textAlign: "right", fontFamily: "'Space Mono', monospace" }}>
            {simRate.toFixed(2)}%
          </div>
        </div>

        <div style={{ background: T.primaryLight, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            At {simRate.toFixed(2)}%: monthly payment
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: T.primary }}>
            {formatCurrency(rateResults.newPayment)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ background: rateResults.diff > 0 ? T.dangerBg : T.successBg, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Change / month</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: rateResults.diff > 0 ? T.danger : T.success }}>
              {rateResults.diff >= 0 ? "+" : ""}{formatCurrency(rateResults.diff)}
            </div>
          </div>
          <div style={{ background: rateResults.diff > 0 ? T.dangerBg : T.successBg, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Annual impact</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: rateResults.diff > 0 ? T.danger : T.success }}>
              {rateResults.annualImpact >= 0 ? "+" : ""}{formatCurrency(rateResults.annualImpact)}
            </div>
          </div>
        </div>

        {/* Bar chart: current vs simulated */}
        <svg width="100%" viewBox="0 0 500 80" style={{ display: "block" }}>
          {(() => {
            const maxPay = Math.max(MONTHLY_PAYMENT, rateResults.newPayment, 1);
            const barMax = 360;
            const curW = (MONTHLY_PAYMENT / maxPay) * barMax;
            const newW = (rateResults.newPayment / maxPay) * barMax;
            return (
              <>
                <text x="0" y="18" fontSize="11" fill={T.textMuted} fontFamily={T.font}>Current</text>
                <rect x="90" y="6" width={curW} height="18" rx="4" fill={T.border} />
                <text x={92 + curW} y="19" fontSize="11" fill={T.text} fontWeight="600" fontFamily={T.font}>£{MONTHLY_PAYMENT}</text>

                <text x="0" y="50" fontSize="11" fill={T.textMuted} fontFamily={T.font}>Simulated</text>
                <rect x="90" y="38" width={newW} height="18" rx="4" fill={rateResults.diff > 0 ? T.danger : T.success} />
                <text x={92 + newW} y="51" fontSize="11" fill={T.text} fontWeight="600" fontFamily={T.font}>{formatCurrency(rateResults.newPayment)}</text>
              </>
            );
          })()}
        </svg>
      </Card>

      {/* ── Payoff Timeline ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>
          Payoff Timeline
        </div>

        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: "block" }}>
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const val = BALANCE * frac;
            const y = toY(val);
            return (
              <g key={frac}>
                <line x1={chartPadL} y1={y} x2={chartW - chartPadR} y2={y} stroke={T.borderLight} strokeWidth="0.5" />
                <text x={chartPadL - 6} y={y + 4} textAnchor="end" fontSize="9" fill={T.textMuted} fontFamily={T.font}>
                  {formatCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {Array.from({ length: Math.min(8, TERM_YEARS + 1) }, (_, i) => {
            const yr = Math.round((i / 7) * TERM_YEARS);
            return (
              <text key={yr} x={toX(yr * 12)} y={chartH - 5} textAnchor="middle" fontSize="9" fill={T.textMuted} fontFamily={T.font}>
                {yr}yr
              </text>
            );
          })}

          {/* Savings gap area (between the two curves) */}
          {overpayment > 0 && (() => {
            const origPts = curves.original;
            const opPts = curves.withOp;
            const minLen = Math.min(origPts.length, opPts.length);
            let d = "";
            for (let i = 0; i < minLen; i++) {
              d += `${i === 0 ? "M" : "L"}${toX(origPts[i].month).toFixed(1)},${toY(origPts[i].balance).toFixed(1)} `;
            }
            for (let i = minLen - 1; i >= 0; i--) {
              d += `L${toX(opPts[i].month).toFixed(1)},${toY(opPts[i].balance).toFixed(1)} `;
            }
            d += "Z";
            return <path d={d} fill="rgba(49,184,151,0.12)" />;
          })()}

          {/* Original curve — dashed grey */}
          <path d={pathFromPoints(curves.original)} fill="none" stroke={T.border} strokeWidth="2" strokeDasharray="6 3" />

          {/* Overpayment curve — solid primary with filled area */}
          <path d={areaFromPoints(curves.withOp)} fill={`rgba(26,74,84,0.08)`} />
          <path d={pathFromPoints(curves.withOp)} fill="none" stroke={T.primary} strokeWidth="2.5" />

          {/* Legend */}
          <line x1={chartPadL + 10} y1={12} x2={chartPadL + 30} y2={12} stroke={T.border} strokeWidth="2" strokeDasharray="4 2" />
          <text x={chartPadL + 34} y={15} fontSize="9" fill={T.textMuted} fontFamily={T.font}>Without overpayment</text>

          <line x1={chartPadL + 190} y1={12} x2={chartPadL + 210} y2={12} stroke={T.primary} strokeWidth="2.5" />
          <text x={chartPadL + 214} y={15} fontSize="9" fill={T.primary} fontWeight="600" fontFamily={T.font}>
            With £{overpayment}/mo overpayment
          </text>
        </svg>
      </Card>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn primary icon="dollar">Make an Overpayment</Btn>
        <Btn ghost icon="messages">Talk to an Adviser</Btn>
      </div>
    </div>
  );
}
