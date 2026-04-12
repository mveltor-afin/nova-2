import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────────
const PRESETS = {
  "Base Case":        { baseRate: 4.75, unemployment: 4.2,  housePriceChange: 2,   inflation: 2.5 },
  "Mild Recession":   { baseRate: 6.0,  unemployment: 6.5,  housePriceChange: -5,  inflation: 4.0 },
  "Severe Recession": { baseRate: 8.0,  unemployment: 10.0, housePriceChange: -20, inflation: 7.0 },
  "Rate Shock":       { baseRate: 7.5,  unemployment: 5.0,  housePriceChange: -8,  inflation: 5.5 },
};

const BASE = PRESETS["Base Case"];

// ─────────────────────────────────────────────
// SLIDER CONFIG
// ─────────────────────────────────────────────
const SLIDERS = [
  { key: "baseRate",         label: "Base Rate",          min: 0,   max: 10, step: 0.25, suffix: "%" },
  { key: "unemployment",     label: "Unemployment Rate",  min: 2,   max: 15, step: 0.5,  suffix: "%" },
  { key: "housePriceChange", label: "House Price Change", min: -30, max: 20, step: 1,    suffix: "%", signed: true },
  { key: "inflation",        label: "Inflation",          min: 0,   max: 12, step: 0.5,  suffix: "%" },
];

// ─────────────────────────────────────────────
// CALCULATIONS
// ─────────────────────────────────────────────
function calcMetrics(v) {
  const portfolioValue = 850 * (1 + v.housePriceChange / 100);
  const expectedLoss = portfolioValue * (v.unemployment / 100 * 0.02 + Math.max(0, v.baseRate - 5) * 0.005);
  const provisionCharge = expectedLoss * 0.45;
  const capitalRatio = Math.max(0, 14.2 - v.unemployment * 0.3 - Math.max(0, -v.housePriceChange) * 0.15);
  const arrearsRate = 2.1 + v.unemployment * 0.4 + Math.max(0, v.baseRate - 5) * 0.8;
  const avgLTV = 68 + Math.max(0, -v.housePriceChange) * 0.8;
  const netInterestMargin = 1.85 - Math.max(0, v.baseRate - 5) * 0.12 + Math.max(0, v.baseRate - 4) * 0.05;
  return { portfolioValue, expectedLoss, provisionCharge, capitalRatio, arrearsRate, avgLTV, netInterestMargin };
}

const baseMetrics = calcMetrics(BASE);

// ─────────────────────────────────────────────
// LTV DISTRIBUTION
// ─────────────────────────────────────────────
function ltvDistribution(housePriceChange) {
  const shift = Math.max(0, -housePriceChange) * 1.2;
  const raw = [
    Math.max(2, 35 - shift * 0.9),
    Math.max(2, 25 - shift * 0.5),
    Math.max(2, 20 + shift * 0.2),
    Math.max(2, 12 + shift * 0.5),
    Math.max(1, 8 + shift * 0.7),
  ];
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map(r => +(r / total * 100).toFixed(1));
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const fmt = (v, dp = 1) => v.toFixed(dp);
const fmtM = v => `£${Math.abs(v) < 1 ? fmt(v * 1000, 0) + "K" : fmt(v) + "M"}`;

function delta(current, base, invert) {
  const d = current - base;
  if (Math.abs(d) < 0.01) return null;
  const positive = invert ? d < 0 : d > 0;
  return { label: (d > 0 ? "+" : "") + fmt(d, 2), color: positive ? T.success : T.danger };
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function ScenarioModeller() {
  const [vars, setVars] = useState({ ...BASE });
  const [activePreset, setActivePreset] = useState("Base Case");

  const metrics = useMemo(() => calcMetrics(vars), [vars.baseRate, vars.unemployment, vars.housePriceChange, vars.inflation]);
  const ltv = useMemo(() => ltvDistribution(vars.housePriceChange), [vars.housePriceChange]);

  const setSlider = (key, val) => {
    setVars(prev => ({ ...prev, [key]: parseFloat(val) }));
    setActivePreset(null);
  };

  const applyPreset = name => {
    setVars({ ...PRESETS[name] });
    setActivePreset(name);
  };

  // Determine severity for commentary
  const severity = activePreset === "Base Case" ? "base"
    : activePreset === "Mild Recession" ? "mild"
    : activePreset === "Severe Recession" ? "severe"
    : activePreset === "Rate Shock" ? "rateShock"
    : metrics.capitalRatio < 9 ? "severe"
    : metrics.arrearsRate > 5 ? "mild"
    : "base";

  // Waterfall values
  const startVal = 850;
  const hpImpact = 850 * (vars.housePriceChange / 100);
  const creditLoss = -metrics.expectedLoss;
  const provisions = -metrics.provisionCharge;
  const netPosition = startVal + hpImpact + creditLoss + provisions;

  // KPI definitions
  const kpis = [
    { label: "Portfolio Value", value: fmtM(metrics.portfolioValue), color: T.primary, d: delta(metrics.portfolioValue, baseMetrics.portfolioValue, false) },
    { label: "Expected Loss", value: fmtM(metrics.expectedLoss), color: T.danger, d: delta(metrics.expectedLoss, baseMetrics.expectedLoss, true) },
    { label: "Provision Charge", value: fmtM(metrics.provisionCharge), color: T.warning, d: delta(metrics.provisionCharge, baseMetrics.provisionCharge, true) },
    { label: "Capital Ratio", value: fmt(metrics.capitalRatio) + "%", color: metrics.capitalRatio < 8 ? T.danger : T.success, d: delta(metrics.capitalRatio, baseMetrics.capitalRatio, false) },
    { label: "Arrears Rate", value: fmt(metrics.arrearsRate) + "%", color: metrics.arrearsRate > 5 ? T.danger : T.warning, d: delta(metrics.arrearsRate, baseMetrics.arrearsRate, true) },
    { label: "Avg LTV", value: fmt(metrics.avgLTV) + "%", color: metrics.avgLTV > 80 ? T.danger : T.primary, d: delta(metrics.avgLTV, baseMetrics.avgLTV, true) },
    { label: "NIM", value: fmt(metrics.netInterestMargin, 2) + "%", color: T.accent, d: delta(metrics.netInterestMargin, baseMetrics.netInterestMargin, false) },
  ];

  // LTV bar config
  const ltvBands = [
    { label: "<60% LTV",  color: T.success },
    { label: "60-70%",    color: T.success },
    { label: "70-80%",    color: T.warning },
    { label: "80-90%",    color: "#F59E0B" },
    { label: ">90%",      color: T.danger },
  ];

  // Waterfall chart data
  const waterfallItems = [
    { label: "Starting Value", value: startVal, cumStart: 0 },
    { label: "House Price Impact", value: hpImpact, cumStart: hpImpact >= 0 ? startVal : startVal + hpImpact },
    { label: "Credit Losses", value: creditLoss, cumStart: startVal + hpImpact + creditLoss },
    { label: "Provisions", value: provisions, cumStart: startVal + hpImpact + creditLoss + provisions },
    { label: "Net Position", value: netPosition, cumStart: 0 },
  ];

  // SVG waterfall dimensions
  const wfW = 520, wfH = 260, wfPadL = 120, wfPadR = 60, wfBarH = 32, wfGap = 12;
  const allVals = [startVal, netPosition, ...waterfallItems.map(i => i.cumStart), ...waterfallItems.map(i => i.cumStart + Math.abs(i.value))];
  const wfMax = Math.max(...allVals) * 1.05;
  const wfScale = (wfW - wfPadL - wfPadR) / wfMax;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {Ico.chart(22)}
          <span style={{ fontSize: 22, fontWeight: 700 }}>Scenario Modeller</span>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginLeft: 32 }}>
          Interactive stress testing — drag sliders to model macro scenarios and see portfolio impact in real time
        </div>
      </div>

      {/* Preset Chips */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.keys(PRESETS).map(name => (
          <div
            key={name}
            onClick={() => applyPreset(name)}
            style={{
              padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s", userSelect: "none",
              background: activePreset === name ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : T.card,
              color: activePreset === name ? "#fff" : T.text,
              border: `1px solid ${activePreset === name ? T.primary : T.border}`,
              boxShadow: activePreset === name ? `0 2px 10px ${T.primaryGlow}` : "none",
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Sliders */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 28 }}>
          {SLIDERS.map(s => {
            const val = vars[s.key];
            const display = s.signed && val > 0 ? `+${fmt(val, s.step < 1 ? 2 : 0)}` : fmt(val, s.step < 1 ? 2 : 0);
            return (
              <div key={s.key}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 10 }}>
                  {display}{s.suffix}
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={val}
                  onChange={e => setSlider(s.key, e.target.value)}
                  style={{ width: "100%", accentColor: T.primary, cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  <span>{s.min}{s.suffix}</span>
                  <span>{s.max}{s.suffix}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {kpis.map(k => (
          <KPICard
            key={k.label}
            label={k.label}
            value={k.value}
            color={k.color}
            sub={k.d ? (
              <span style={{ color: k.d.color, fontWeight: 600 }}>
                {k.d.label} vs base
              </span>
            ) : "No change"}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Waterfall Chart */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.chart(16)}
            Portfolio Impact Waterfall
          </div>
          <svg width="100%" viewBox={`0 0 ${wfW} ${wfH}`} style={{ display: "block" }}>
            {waterfallItems.map((item, i) => {
              const y = i * (wfBarH + wfGap) + 10;
              const isTotal = i === 0 || i === waterfallItems.length - 1;
              const barColor = isTotal ? T.primary : item.value >= 0 ? T.success : T.danger;
              const barX = isTotal ? 0 : (item.value >= 0 ? item.cumStart - Math.abs(item.value) : item.cumStart);
              const barWidth = isTotal ? item.value * wfScale : Math.abs(item.value) * wfScale;

              return (
                <g key={i}>
                  <text x={wfPadL - 8} y={y + wfBarH / 2 + 4} textAnchor="end" fontSize="11" fill={T.textMuted} fontFamily={T.font}>
                    {item.label}
                  </text>
                  <rect
                    x={wfPadL + (isTotal ? 0 : barX * wfScale)}
                    y={y}
                    width={Math.max(2, barWidth)}
                    height={wfBarH}
                    rx={4}
                    fill={barColor}
                    opacity={0.85}
                  />
                  <text
                    x={wfPadL + (isTotal ? barWidth : barX * wfScale + barWidth) + 6}
                    y={y + wfBarH / 2 + 4}
                    fontSize="11"
                    fontWeight="600"
                    fill={T.text}
                    fontFamily={T.font}
                  >
                    {item.value >= 0 ? "" : "-"}{fmtM(Math.abs(item.value))}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>

        {/* LTV Distribution */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.shield(16)}
            Risk Distribution
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ltvBands.map((band, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>{band.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{ltv[i]}% of book</span>
                </div>
                <div style={{ height: 22, background: T.bg, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${ltv[i]}%`,
                    background: band.color,
                    borderRadius: 6,
                    transition: "width 0.3s ease",
                    opacity: 0.8,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Commentary */}
      <Card style={{ borderLeft: `4px solid ${severity === "severe" ? T.danger : severity === "mild" ? T.warning : severity === "rateShock" ? "#F59E0B" : T.success}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {Ico.sparkle(18)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>AI Commentary</span>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginLeft: 8,
            background: severity === "severe" ? T.dangerBg : severity === "mild" ? T.warningBg : severity === "rateShock" ? T.warningBg : T.successBg,
            color: severity === "severe" ? T.danger : severity === "mild" ? T.warning : severity === "rateShock" ? T.warning : T.success,
          }}>
            {severity === "base" ? "LOW RISK" : severity === "mild" ? "MODERATE RISK" : severity === "severe" ? "HIGH RISK" : "ELEVATED RISK"}
          </span>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: T.textSecondary }}>
          {severity === "base" && (
            <span>
              Portfolio is well-positioned under current conditions. Capital ratio at {fmt(metrics.capitalRatio)}% provides comfortable buffer above regulatory minimum of 8%.
              Net interest margin of {fmt(metrics.netInterestMargin, 2)}% supports sustainable profitability. No immediate action required.
            </span>
          )}
          {severity === "mild" && (
            <span>
              Moderate stress scenario. Arrears expected to rise to {fmt(metrics.arrearsRate)}%. Recommend reviewing concentration in high-LTV lending.
              Capital ratio remains above regulatory minimum at {fmt(metrics.capitalRatio)}%. Expected losses of {fmtM(metrics.expectedLoss)} are within tolerance
              but warrant enhanced monitoring of vulnerable segments.
            </span>
          )}
          {severity === "severe" && (
            <span>
              Severe stress scenario. Expected losses of {fmtM(metrics.expectedLoss)}. Capital ratio at {fmt(metrics.capitalRatio)}% — {metrics.capitalRatio < 8 ? "below" : "approaching"} regulatory minimum.
              Recommend: (1) Tighten LTV limits to 80% maximum, (2) Increase provisions by {fmtM(metrics.provisionCharge - baseMetrics.provisionCharge)},
              (3) Pause new lending above 85% LTV. Average LTV of {fmt(metrics.avgLTV)}% indicates significant negative equity risk.
            </span>
          )}
          {severity === "rateShock" && (
            <span>
              Rate shock scenario. NIM compressed to {fmt(metrics.netInterestMargin, 2)}%. Arrears driven by payment shock at {fmt(metrics.arrearsRate)}%.
              Recommend reviewing tracker book exposure and stress-testing individual cases above 4.5x income multiple.
              Portfolio value impact of {fmtM(Math.abs(850 - metrics.portfolioValue))} reflects repricing pressure across the book.
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}
