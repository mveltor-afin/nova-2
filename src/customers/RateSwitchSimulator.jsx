import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// Monthly payment: P * r(1+r)^n / ((1+r)^n - 1)
// ─────────────────────────────────────────────
function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = v => "£" + Math.round(v).toLocaleString("en-GB");
const fmtDec = v => "£" + v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─────────────────────────────────────────────
// Emma's current mortgage
// ─────────────────────────────────────────────
const BALANCE = 156200;
const YEARS   = 14;
const CURRENT_RATE = 4.49;
const SVR_RATE     = 7.99;

const OPTIONS = [
  { id: "2yr",     name: "2yr Fixed",                rate: 4.29, erc: "2% for 2 years",      security: null },
  { id: "5yr",     name: "5yr Fixed",                rate: 4.89, erc: "3% for 5 years",      security: "5 years rate security" },
  { id: "tracker", name: "Tracker (Base + 0.75%)",   rate: 5.50, erc: "None",                security: null },
];

export default function RateSwitchSimulator() {
  const [selectedOption, setSelectedOption] = useState(null);

  const currentMonthly = useMemo(() => calcMonthly(BALANCE, CURRENT_RATE, YEARS), []);
  const svrMonthly     = useMemo(() => calcMonthly(BALANCE, SVR_RATE, YEARS), []);

  const optionCalcs = useMemo(() =>
    OPTIONS.map(o => {
      const monthly = calcMonthly(BALANCE, o.rate, YEARS);
      const diff = monthly - currentMonthly;
      const totalOverTerm = monthly * YEARS * 12;
      return { ...o, monthly, diff, totalOverTerm };
    }), [currentMonthly]);

  const selected = optionCalcs.find(o => o.id === selectedOption);

  const currentAnnual   = currentMonthly * 12;
  const currentTotal    = currentMonthly * YEARS * 12;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", fontFamily: T.font }}>

      {/* ── Alert Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #FFBF00, #FFD966)",
        borderRadius: 14, padding: "20px 24px", marginBottom: 24,
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <span style={{ marginTop: 2 }}>{Ico.alert(22)}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
            Your fixed rate expires on 20 Aug 2026
          </div>
          <div style={{ fontSize: 13, color: T.navy, lineHeight: 1.5 }}>
            You have 4 months to choose your next deal — or you'll revert to SVR at 7.99%.
          </div>
        </div>
      </div>

      {/* ── Current vs SVR ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {/* Current */}
        <Card style={{ flex: 1, borderColor: T.success, borderWidth: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.success, marginBottom: 10 }}>Current</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: T.text }}>{fmt(Math.round(currentMonthly))}<span style={{ fontSize: 14, fontWeight: 500, color: T.textMuted }}>/mo</span></div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{CURRENT_RATE}% — Afin Fix 2yr 75%</div>
        </Card>

        {/* SVR */}
        <Card style={{ flex: 1, borderColor: T.danger, borderWidth: 2, position: "relative" }}>
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: T.dangerBg, color: T.danger, fontSize: 12, fontWeight: 700,
            padding: "4px 10px", borderRadius: 8,
          }}>+{fmt(Math.round(svrMonthly - currentMonthly))}/mo</div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.danger, marginBottom: 10 }}>If you do nothing (SVR)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: T.text }}>{fmt(Math.round(svrMonthly))}<span style={{ fontSize: 14, fontWeight: 500, color: T.textMuted }}>/mo</span></div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{SVR_RATE}% — Standard Variable Rate</div>
        </Card>
      </div>

      {/* ── Your Options ── */}
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 14 }}>Your Options</div>
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        {optionCalcs.map(o => {
          const active = selectedOption === o.id;
          const saves = o.diff < 0;
          return (
            <div key={o.id} onClick={() => setSelectedOption(o.id)} style={{
              flex: 1, background: T.card, borderRadius: 14, padding: 20, cursor: "pointer",
              border: `2px solid ${active ? T.primary : T.border}`,
              boxShadow: active ? `0 0 0 3px ${T.primaryGlow}` : "none",
              transition: "all 0.15s",
            }}>
              {/* Radio dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: `2px solid ${active ? T.primary : T.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {active && <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.primary }} />}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{o.name}</span>
              </div>

              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>{o.rate}%</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 6 }}>{fmt(Math.round(o.monthly))}<span style={{ fontSize: 13, fontWeight: 500, color: T.textMuted }}>/mo</span></div>

              <div style={{
                fontSize: 12, fontWeight: 600,
                color: saves ? T.success : T.danger,
                marginBottom: 8,
              }}>
                vs current: {saves ? "-" : "+"}{fmt(Math.abs(Math.round(o.diff)))}/mo
              </div>

              <div style={{ fontSize: 11, color: T.textMuted }}>
                Total over term: {fmt(Math.round(o.totalOverTerm))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Comparison Detail ── */}
      {selected && (
        <>
          <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
              {/* Current column */}
              <div style={{ flex: 1, padding: 24, borderRight: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.textMuted, marginBottom: 16 }}>Current</div>
                {[
                  ["Rate", `${CURRENT_RATE}%`],
                  ["Monthly Payment", fmt(Math.round(currentMonthly))],
                  ["Annual Cost", fmt(Math.round(currentAnnual))],
                  ["Total Over Term", fmt(Math.round(currentTotal))],
                  ["ERC", "Expires Aug 2026"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* New column */}
              <div style={{ flex: 1, padding: 24, background: T.primaryLight }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.primary, marginBottom: 16 }}>New</div>
                {[
                  ["Rate", `${selected.rate}%`],
                  ["Monthly Payment", fmt(Math.round(selected.monthly))],
                  ["Annual Cost", fmt(Math.round(selected.monthly * 12))],
                  ["Total Over Term", fmt(Math.round(selected.totalOverTerm))],
                  ["ERC", selected.erc],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ fontSize: 12, color: T.textMuted }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saving / cost summary */}
            <div style={{
              padding: "16px 24px",
              background: selected.diff < 0 ? T.successBg : T.warningBg,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: selected.diff < 0 ? T.success : "#92400E" }}>
                {selected.diff < 0
                  ? `Monthly saving: ${fmt(Math.abs(Math.round(selected.diff)))}`
                  : `Monthly cost: +${fmt(Math.round(selected.diff))}${selected.security ? ` (but ${selected.security})` : ""}`}
              </span>
            </div>
          </Card>

          {/* ── AI Insight ── */}
          <Card style={{ marginBottom: 24, borderColor: T.accent, borderWidth: 2 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ color: T.accent }}>{Ico.sparkle(20)}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>What this means for you</div>
                <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
                  {selected.id === "2yr" && "Switching to the 2yr fix saves you £29/mo immediately. Your rate is locked for 2 years, giving you certainty until 2028. If rates drop further, you could remortgage again at that point."}
                  {selected.id === "5yr" && "Switching to the 5yr fix costs £22/mo more but locks your rate for 5 years. If base rate rises by 1%, you'll save £85/mo vs the tracker — and £248/mo vs SVR. Peace of mind has real value."}
                  {selected.id === "tracker" && "The tracker starts at 5.50% but moves with the base rate. If the Bank of England cuts by 0.50%, your payment drops to £988/mo — cheaper than a fix. But if rates rise 1%, you'd pay £1,112/mo."}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Btn primary style={{ padding: "14px 32px", fontSize: 15 }}>I want this deal</Btn>
        <Btn ghost style={{ padding: "14px 32px", fontSize: 15 }}>Talk to an adviser</Btn>
      </div>
    </div>
  );
}
