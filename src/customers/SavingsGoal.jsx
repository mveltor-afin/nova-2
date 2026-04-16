import React from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const ACCOUNTS = [
  { id: "SAV-001", name: "2yr Fixed", rate: 4.85, balance: 26824, principal: 25000, interestEarned: 1824, maturityDate: "18 May 2026", daysToMaturity: 40, type: "fixed" },
  { id: "SAV-002", name: "90-Day Notice", rate: 3.20, balance: 10500, principal: null, interestEarned: null, maturityDate: null, daysToMaturity: null, type: "notice" },
];

const TOTAL     = 37324;
const GOAL      = 50000;
const MONTHLY   = 500;
const REMAINING = GOAL - TOTAL;
const PCT       = Math.round((TOTAL / GOAL) * 100);

const fmt = v => "£" + v.toLocaleString("en-GB");

// ─────────────────────────────────────────────
// Savings Ring (SVG)
// ─────────────────────────────────────────────
function SavingsRing() {
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (TOTAL / GOAL) * circumference;
  const gradientId = "ring-grad";

  return (
    <div style={{ textAlign: "center", margin: "28px 0" }}>
      <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={T.primary} />
            <stop offset="100%" stopColor={T.accent} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={T.border} strokeWidth={stroke} />
        {/* Progress */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={`url(#${gradientId})`} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Centre text */}
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" fontSize="36" fontWeight="700" fontFamily={T.font} fill={T.text}>{PCT}%</text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="12" fontFamily={T.font} fill={T.textMuted}>of {fmt(GOAL)} goal</text>
      </svg>

      <div style={{ fontSize: 15, fontWeight: 600, color: T.primary, marginTop: 12 }}>{fmt(REMAINING)} to go</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>
        At your current rate ({fmt(MONTHLY)}/mo), you'll reach your goal by Mar 2028
      </div>
      <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, marginTop: 4 }}>
        Add £100 more per month to reach it by Oct 2027 — 5 months earlier
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function SavingsGoal() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: T.font }}>

      {/* ── Header ── */}
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 20 }}>Your Savings</div>

      {/* ── Total Savings Hero ── */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
        borderRadius: 16, padding: "28px 32px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.75, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Total Savings</div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, color: T.accent }}>{fmt(TOTAL)}</div>
        <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Across 2 accounts</div>
      </div>

      {/* ── Savings Ring ── */}
      <Card style={{ marginBottom: 24 }}>
        <SavingsRing />
      </Card>

      {/* ── Account Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {ACCOUNTS.map(acc => (
          <Card key={acc.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{acc.name} @ {acc.rate}%</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{acc.id}</div>
              </div>
              {acc.type === "fixed" && acc.daysToMaturity != null && (
                <span style={{
                  background: T.warningBg, color: "#92400E",
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                }}>
                  Matures in {acc.daysToMaturity} days
                </span>
              )}
            </div>

            <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 10 }}>{fmt(acc.balance)}</div>

            {acc.type === "fixed" && (
              <>
                <div style={{ display: "flex", gap: 20, fontSize: 12, color: T.textMuted, marginBottom: 10 }}>
                  <span>Principal: {fmt(acc.principal)}</span>
                  <span>Interest earned: <span style={{ color: T.success, fontWeight: 600 }}>{fmt(acc.interestEarned)}</span></span>
                </div>
                {/* Maturity progress bar */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>Maturity: {acc.maturityDate}</div>
                  <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                    {/* ~95% through the 2yr term (approx 40 days left of ~730) */}
                    <div style={{ height: "100%", width: "95%", borderRadius: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />
                  </div>
                </div>
              </>
            )}

            {acc.type === "notice" && (
              <div style={{ fontSize: 12, color: T.textMuted }}>Notice account — 90 day withdrawal notice</div>
            )}

            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.primary, cursor: "pointer" }}>View Details →</span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Interest Earned Card ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: T.textMuted, marginBottom: 8 }}>Interest Earned</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: T.success, marginBottom: 6 }}>£1,824 <span style={{ fontSize: 13, fontWeight: 500, color: T.textMuted }}>this year</span></div>
        <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 4 }}>That's £5.00/day in interest</div>
        <div style={{ fontSize: 13, color: T.textMuted }}>Projected by year end: <span style={{ fontWeight: 600, color: T.text }}>£2,190</span></div>
      </Card>

      {/* ── AI Suggestion Card ── */}
      <Card style={{ marginBottom: 24, borderColor: "#C6F6D5", borderWidth: 2 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ color: T.accent }}>{Ico.sparkle(20)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>AI Suggestion</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, marginBottom: 14 }}>
              Your fixed deposit matures in 40 days. Reinvesting at the current 2yr rate (4.85%) would earn £2,520 over the next term. Want us to auto-renew?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn primary>Auto-renew</Btn>
              <Btn ghost>Review options</Btn>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn primary style={{ padding: "14px 28px", fontSize: 14 }}>Add Money</Btn>
        <Btn ghost style={{ padding: "14px 28px", fontSize: 14 }}>Open New Account</Btn>
      </div>
    </div>
  );
}
