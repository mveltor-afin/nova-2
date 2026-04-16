import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// Smart Money Flow — Safe to Spend Dashboard
// ─────────────────────────────────────────────
const BALANCE = 4832;
const BILLS_COMING = 2985;
const SAFE_TO_SPEND = 1847;
const INCOME = 4167;

const SPENDING_SEGMENTS = [
  { label: "Mortgage", amount: 980, pct: 23, color: "#1A4A54" },
  { label: "Bills", amount: 316, pct: 8, color: "#7C3AED" },
  { label: "Savings", amount: 500, pct: 12, color: "#3B82F6" },
  { label: "Spent", amount: 1024, pct: 25, color: "#F59E0B" },
  { label: "Remaining", amount: 1347, pct: 32, color: "#31B897", pulse: true },
];

const WEEKLY_SPENDING = [
  { label: "Wk 1", amount: 380 },
  { label: "Wk 2", amount: 410 },
  { label: "Wk 3", amount: 478 },
  { label: "This wk", amount: 420 },
];

const UPCOMING_BILLS = [
  { name: "Council Tax", amount: 186, daysAway: 2, emoji: "\uD83C\uDFDB" },
  { name: "Netflix", amount: 15.99, daysAway: 5, emoji: "\uD83C\uDFAC" },
  { name: "Car Insurance", amount: 89, daysAway: 11, emoji: "\uD83D\uDE97" },
  { name: "Energy", amount: 124, daysAway: 18, emoji: "\u26A1" },
];

const AI_NUDGES = [
  {
    text: "Your fixed rate expires in 4 months. Review your options to avoid SVR at 7.99%.",
    action: "Review",
  },
  {
    text: "You spent \u00A358 on Costa this month (4.2 visits/week). A home machine pays for itself in 3 months.",
    action: "See more",
  },
  {
    text: "Your emergency fund covers 3.7 months. Target is 6. Add \u00A3100/mo to reach it by Sep 2027.",
    action: "Set up",
  },
];

const QUICK_ACTIONS = [
  { label: "Send Money", icon: "send" },
  { label: "Statements", icon: "file" },
  { label: "Upload Doc", icon: "upload" },
  { label: "Get Help", icon: "messages" },
];

function formatCurrency(n) {
  if (typeof n === "number" && n % 1 !== 0) {
    return "\u00A3" + n.toFixed(2);
  }
  return "\u00A3" + Math.round(n).toLocaleString("en-GB");
}

function billBorderColor(days) {
  if (days < 3) return T.danger;
  if (days < 7) return T.warning;
  return T.border;
}

const pulseKeyframes = `
@keyframes safePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
@keyframes borderPulse {
  0%, 100% { border-color: #31B897; }
  50% { border-color: rgba(49,184,151,0.4); }
}
`;

export default function SmartMoneyFlow({ onNavigate }) {
  const weeklyMax = Math.max(...WEEKLY_SPENDING.map(w => w.amount));
  const thisWeek = WEEKLY_SPENDING[WEEKLY_SPENDING.length - 1].amount;
  const lastWeek = WEEKLY_SPENDING[WEEKLY_SPENDING.length - 2].amount;
  const weekDiffPct = Math.abs(Math.round(((thisWeek - lastWeek) / lastWeek) * 100));
  const weekDown = thisWeek < lastWeek;
  const dailyAvg = Math.round(thisWeek / 7);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: T.font }}>
      <style>{pulseKeyframes}</style>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'Space Grotesk', " + T.font }}>
          Good morning, Emma
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Wednesday 16 April</div>
      </div>

      {/* ── Safe to Spend Hero ── */}
      <Card style={{
        marginBottom: 24,
        background: `linear-gradient(135deg, ${T.primaryLight}, ${T.successBg})`,
        border: `1px solid ${T.successBorder}`,
        textAlign: "center",
        padding: "32px 24px",
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: 2, color: T.textMuted, marginBottom: 8,
        }}>
          SAFE TO SPEND
        </div>
        <div style={{
          fontSize: 48, fontWeight: 700, color: T.primary,
          fontFamily: "'Space Mono', monospace",
          letterSpacing: -2,
          animation: "safePulse 3s ease-in-out infinite",
        }}>
          {formatCurrency(SAFE_TO_SPEND)}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>
          Balance: {formatCurrency(BALANCE)} &middot; Bills coming: {formatCurrency(BILLS_COMING)}
        </div>
      </Card>

      {/* ── Money Flow Visualisation ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>
          This Month's Money Flow
        </div>

        {/* Income bar (reference) */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            background: `linear-gradient(90deg, ${T.success}, #28a07e)`,
            borderRadius: 6, height: 32, width: "100%",
            display: "flex", alignItems: "center", padding: "0 12px",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Income {formatCurrency(INCOME)}</span>
          </div>
        </div>

        {/* Spending segments */}
        <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
          {SPENDING_SEGMENTS.map(seg => (
            <div key={seg.label} style={{
              flex: seg.pct,
              background: seg.color,
              borderRadius: 4,
              height: 28,
              minWidth: 4,
              position: "relative",
              border: seg.pulse ? "2px solid #31B897" : "none",
              animation: seg.pulse ? "borderPulse 2s ease-in-out infinite" : "none",
            }} />
          ))}
        </div>

        {/* Labels */}
        <div style={{ display: "flex", gap: 3 }}>
          {SPENDING_SEGMENTS.map(seg => (
            <div key={seg.label} style={{ flex: seg.pct, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: seg.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {seg.label}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{formatCurrency(seg.amount)}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 8,
          background: T.successBg, fontSize: 12, color: T.text,
        }}>
          You've saved <strong>12%</strong> of your income this month — above the UK average of 10%.
        </div>
      </Card>

      {/* ── Spending Pulse ── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>This week:</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: T.primary }}>{formatCurrency(thisWeek)}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <span style={{ color: weekDown ? T.success : T.danger, fontSize: 13, fontWeight: 600 }}>
            {weekDown ? "\u2193" : "\u2191"} {weekDiffPct}% {weekDown ? "less" : "more"} than last week
          </span>
        </div>

        {/* Mini bar chart */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 80, marginBottom: 12 }}>
          {WEEKLY_SPENDING.map((w, i) => {
            const h = (w.amount / weeklyMax) * 64;
            const isThis = i === WEEKLY_SPENDING.length - 1;
            return (
              <div key={w.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  height: h, borderRadius: 4,
                  background: isThis ? T.primary : T.border,
                  marginBottom: 6,
                  transition: "height 0.3s",
                }} />
                <div style={{ fontSize: 10, color: isThis ? T.primary : T.textMuted, fontWeight: isThis ? 700 : 500 }}>
                  {w.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: T.textMuted }}>
          Daily average: <strong style={{ color: T.text }}>{formatCurrency(dailyAvg)}</strong>
        </div>
      </Card>

      {/* ── Upcoming Bills Countdown ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>Upcoming Bills</div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {UPCOMING_BILLS.map(bill => (
            <div key={bill.name} style={{
              minWidth: 130, background: T.card, borderRadius: 12,
              border: `2px solid ${billBorderColor(bill.daysAway)}`,
              padding: 14, flexShrink: 0,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{bill.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 2 }}>{bill.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.primary, marginBottom: 4 }}>{formatCurrency(bill.amount)}</div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: bill.daysAway < 3 ? T.danger : bill.daysAway < 7 ? T.warning : T.textMuted,
              }}>
                in {bill.daysAway} day{bill.daysAway !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Nudges ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ color: T.primary }}>{Ico.sparkle(18)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Smart Nudges</span>
        </div>
        {AI_NUDGES.map((nudge, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: 10,
            border: `1px solid ${T.border}`,
            borderLeft: "4px solid #A3E635",
            padding: "14px 16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{nudge.text}</div>
            <Btn small ghost style={{ whiteSpace: "nowrap", flexShrink: 0 }}>{nudge.action}</Btn>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: "flex", justifyContent: "space-around", gap: 12 }}>
        {QUICK_ACTIONS.map(qa => (
          <div
            key={qa.label}
            onClick={() => onNavigate?.(qa.label)}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: T.primaryLight, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: T.primary, margin: "0 auto 6px",
              border: `1px solid ${T.border}`,
              transition: "background 0.15s",
            }}>
              {Ico[qa.icon]?.(20)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{qa.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
