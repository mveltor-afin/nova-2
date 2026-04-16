import React from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// CUSTOMER DASHBOARD — Direct Customer Portal
// Emma Wilson (CUS-001) personal banking view
// ─────────────────────────────────────────────

const emma = {
  name: "Emma",
  mortgage: { id: "MTG-001", product: "Afin Fix 2yr 75%", balance: 156200, rate: 4.49, payment: 980, nextPayment: "15 May", rateEnd: "20 Aug 2026", ltv: 58, term: "14 yrs" },
  savings: [
    { id: "SAV-001", product: "2yr Fixed @ 4.85%", balance: 26824, rate: 4.85, maturity: "18 May 2026", interestEarned: 1824 },
    { id: "SAV-002", product: "90-Day Notice @ 3.20%", balance: 10500, rate: 3.20 },
  ],
  origRef: "AFN-2026-00128",
};

const totalSavings = emma.savings.reduce((s, a) => s + a.balance, 0);
const totalInterest = emma.savings.reduce((s, a) => s + (a.interestEarned || 0), 0);

// Rate expiry check — within 6 months?
const rateEndDate = new Date("2026-08-20");
const now = new Date();
const monthsToExpiry = (rateEndDate.getFullYear() - now.getFullYear()) * 12 + (rateEndDate.getMonth() - now.getMonth());
const showRateAlert = monthsToExpiry <= 6 && monthsToExpiry >= 0;

const fmt = (n) => "£" + n.toLocaleString("en-GB");

export default function CustomerDashboard({ onNavigate }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px", fontFamily: T.font }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>
          Good morning, {emma.name}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Here's your financial snapshot
        </div>
      </div>

      {/* ── Rate Alert ── */}
      {showRateAlert && (
        <div style={{
          background: T.warningBg, border: `1px solid ${T.warningBorder}`, borderRadius: 12,
          padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.warning }}>{Ico.alert(20)}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>
              Your fixed rate expires on 20 Aug 2026 — review your options
            </span>
          </div>
          <Btn small primary onClick={() => onNavigate?.("rateReview")}>Review Options</Btn>
        </div>
      )}

      {/* ── Product Cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>

        {/* Mortgage */}
        <Card style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ color: T.primary }}>{Ico.loans(18)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Mortgage</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 4 }}>{fmt(emma.mortgage.balance)}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
            {emma.mortgage.rate}% fixed &middot; {emma.mortgage.term} remaining
          </div>
          <div style={{ fontSize: 13, color: T.text, marginBottom: 14 }}>
            Next payment: <strong>{fmt(emma.mortgage.payment)}</strong> on {emma.mortgage.nextPayment}
          </div>
          {/* LTV Progress */}
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
            <span>LTV</span><span>{emma.mortgage.ltv}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
            <div style={{ width: `${emma.mortgage.ltv}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.success}, ${T.primary})` }} />
          </div>
        </Card>

        {/* Savings */}
        <Card style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ color: "#FFBF00" }}>{Ico.dollar(18)}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Savings</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 4 }}>{fmt(totalSavings)}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>2 accounts</div>
          <div style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>
            +{fmt(totalInterest)} interest earned this year
          </div>
        </Card>

        {/* Insurance Cross-sell */}
        <div style={{
          flex: 1, minWidth: 240, borderRadius: 14, padding: 24,
          border: `2px dashed ${T.border}`, background: "#FAFAF7",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: T.danger }}>{Ico.shield(18)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Get Insurance</span>
            </div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55, marginBottom: 16 }}>
              You don't have life cover. Protect your {fmt(emma.mortgage.balance).replace(",", "k").replace(/\d{3}$/, "")}k mortgage from <strong>£12/mo</strong>.
            </div>
          </div>
          <Btn small primary onClick={() => onNavigate?.("apply-insurance")}>Get a Quote</Btn>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Make a Payment", icon: "dollar", nav: "payment" },
          { label: "View Statements", icon: "file", nav: "statements" },
          { label: "Upload Document", icon: "upload", nav: "upload" },
          { label: "Message Us", icon: "messages", nav: "messages" },
        ].map((a) => (
          <Btn key={a.label} icon={a.icon} onClick={() => onNavigate?.(a.nav)} style={{ flex: 1, minWidth: 140, justifyContent: "center" }}>
            {a.label}
          </Btn>
        ))}
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

        {/* Upcoming Payments */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ color: T.primary }}>{Ico.clock(18)}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Upcoming Payments</span>
          </div>
          {[
            { label: "Mortgage payment", amount: "£980", date: "15 May 2026", icon: "loans" },
            { label: "Mortgage payment", amount: "£980", date: "15 Jun 2026", icon: "loans" },
            { label: "Savings maturity", amount: "£26,824", date: "18 May 2026", icon: "dollar" },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0",
              borderBottom: i < 2 ? `1px solid ${T.borderLight}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: T.textMuted }}>{Ico[p.icon]?.(16)}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{p.date}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{p.amount}</div>
            </div>
          ))}
        </Card>

        {/* AI Insight */}
        <Card style={{
          flex: 1, minWidth: 280,
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
          border: "none", color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ color: "#FFBF00" }}>{Ico.sparkle(20)}</span>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>AI Insight</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, marginBottom: 20, opacity: 0.95 }}>
            Your mortgage rate expires in 4 months. Based on current rates, switching to a 5yr fix could save you <strong>£180/month</strong>. Want us to review your options?
          </div>
          <Btn small onClick={() => onNavigate?.("rateReview")} style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)",
          }}>
            Yes, review
          </Btn>
        </Card>
      </div>
    </div>
  );
}
