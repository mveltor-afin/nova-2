import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

// ─────────────────────────────────────────────
// JOURNEY STAGES
// ─────────────────────────────────────────────
const STAGES = [
  { id: 1, name: "Awareness & Enquiry", icon: "search" },
  { id: 2, name: "Application & Advice", icon: "loans" },
  { id: 3, name: "Assessment & Decision", icon: "shield" },
  { id: 4, name: "Offer & Completion", icon: "check" },
  { id: 5, name: "Ongoing Servicing", icon: "wallet" },
  { id: 6, name: "Retention & Exit", icon: "arrow" },
];

const STAGE_TIMES = {
  1: "3 days", 2: "5 days", 3: "12 days", 4: "4 days", 5: "Ongoing", 6: "14 days",
};

// FCA Consumer Duty outcomes per stage (mock scores)
const STAGE_OUTCOMES = {
  1: { products: 90, price: 85, understanding: 82, support: 88 },
  2: { products: 92, price: 88, understanding: 80, support: 84 },
  3: { products: 94, price: 90, understanding: 78, support: 76 },
  4: { products: 91, price: 87, understanding: 85, support: 82 },
  5: { products: 88, price: 84, understanding: 83, support: 76 },
  6: { products: 82, price: 78, understanding: 75, support: 70 },
};

const OUTCOME_LABELS = {
  products: "Products & Services",
  price: "Price & Value",
  understanding: "Consumer Understanding",
  support: "Consumer Support",
};

// ─────────────────────────────────────────────
// DETERMINE CUSTOMER STAGE
// ─────────────────────────────────────────────
function getCustomerStage(customer) {
  const custProducts = PRODUCTS.filter(p => customer.products.includes(p.id));
  const pendingProducts = PRODUCTS.filter(p => customer.pendingProducts.includes(p.id));

  // Tom & Lucy Brennan — new customer
  if (customer.id === "CUS-007" || customer.segment === "New") return 1;

  // Only pending products
  if (custProducts.length === 0 && pendingProducts.length > 0) return 2;

  // Locked or arrears — retention/exit stage
  const hasLocked = custProducts.some(p => p.status === "Locked");
  const hasArrears = custProducts.some(p => p.status === "Active in Arrears");
  if (hasLocked) return 6;

  // Near rate expiry (within 3 months) — stage 5-6
  const hasNearExpiry = custProducts.some(p => {
    if (!p.rateEnd || p.rateEnd === "SVR" || p.rateEnd === "—") return false;
    const parts = p.rateEnd.split(" ");
    if (parts.length < 3) return false;
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const expiry = new Date(parseInt(parts[2]), months[parts[1]] || 0, parseInt(parts[0]));
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays < 90;
  });

  if (hasNearExpiry) return 5;

  // Active mortgages — ongoing servicing
  const hasActiveMortgage = custProducts.some(p => p.type === "Mortgage" && (p.status === "Active" || p.status === "Active in Arrears"));
  if (hasActiveMortgage) return 5;

  // Pending products with application status
  if (pendingProducts.some(p => p.status === "Application")) return 2;

  return 5;
}

// ─────────────────────────────────────────────
// SCORECARD DATA
// ─────────────────────────────────────────────
function getScorecard(customer) {
  const isVulnerable = customer.vuln;
  const hasArrears = PRODUCTS.filter(p => customer.products.includes(p.id)).some(p => p.arrears);

  return [
    {
      outcome: "Products & Services",
      score: 92,
      color: T.success,
      evidence: "Product matched by AI eligibility engine. 4 alternatives presented.",
    },
    {
      outcome: "Price & Value",
      score: 88,
      color: T.success,
      evidence: "Rate 4.49% is at market median. No cheaper alternative identified.",
    },
    {
      outcome: "Consumer Understanding",
      score: 85,
      color: T.success,
      evidence: "ESIS document issued. Offer letter signed. 2 broker conversations recorded.",
    },
    {
      outcome: "Consumer Support",
      score: isVulnerable || hasArrears ? 68 : 78,
      color: isVulnerable || hasArrears ? T.danger : T.warning,
      evidence: isVulnerable
        ? "Vulnerability flag active. Sentiment declining over 3 interactions. Enhanced protocol required."
        : hasArrears
        ? "1 vulnerability trigger detected — sentiment declining. Proactive outreach recommended."
        : "1 vulnerability trigger detected — sentiment declining. Proactive outreach recommended.",
    },
  ];
}

// ─────────────────────────────────────────────
// RAG DOT
// ─────────────────────────────────────────────
function ragColor(score) {
  if (score >= 80) return T.success;
  if (score >= 60) return T.warning;
  return T.danger;
}

function RagDot({ score, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }} title={`${label}: ${score}`}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%",
        background: ragColor(score),
      }} />
      <span style={{ fontSize: 10, color: T.textMuted }}>{score}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// JOURNEY MAP COMPONENT
// ─────────────────────────────────────────────
export default function JourneyMap({ customerId }) {
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) {
    return (
      <Card>
        <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>
          Customer not found.
        </div>
      </Card>
    );
  }

  const currentStage = getCustomerStage(customer);
  const scorecard = getScorecard(customer);
  const isVulnerable = customer.vuln;

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Vulnerability Banner */}
      {isVulnerable && (
        <div style={{
          background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 10,
          padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: T.danger }}>{Ico.alert(18)}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.danger }}>
            Vulnerability Protocol Active — all interactions must follow enhanced support procedures.
          </span>
        </div>
      )}

      {/* Journey Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ color: T.primary }}>{Ico.arrow(20)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Customer Journey</span>
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20, marginLeft: 28 }}>
        {customer.name} — Stage {currentStage} of 6
      </div>

      {/* Horizontal Stage Flow */}
      <Card style={{ marginBottom: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: 800 }}>
          {STAGES.map((stage, idx) => {
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isFuture = stage.id > currentStage;
            const outcomes = STAGE_OUTCOMES[stage.id];

            const circleSize = 48;
            const circleColor = isCompleted ? T.success : isCurrent ? T.primary : T.border;
            const iconColor = isCompleted || isCurrent ? "#fff" : T.textMuted;

            return (
              <div key={stage.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {/* Connector line */}
                {idx > 0 && (
                  <div style={{
                    position: "absolute", top: circleSize / 2, left: 0, right: "50%",
                    height: 3, background: isCompleted || isCurrent ? T.success : T.borderLight,
                    zIndex: 0,
                  }} />
                )}
                {idx < STAGES.length - 1 && (
                  <div style={{
                    position: "absolute", top: circleSize / 2, left: "50%", right: 0,
                    height: 3, background: isCompleted ? T.success : T.borderLight,
                    zIndex: 0,
                  }} />
                )}

                {/* Circle */}
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: "50%",
                  background: circleColor, display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1, position: "relative",
                  boxShadow: isCurrent ? `0 0 0 4px ${T.primaryGlow}, 0 0 16px ${T.primaryGlow}` : "none",
                  animation: isCurrent ? "pulse 2s infinite" : "none",
                }}>
                  <span style={{ color: iconColor }}>
                    {isCompleted ? Ico.check(20) : Ico[stage.icon]?.(20)}
                  </span>
                </div>

                {/* Stage label */}
                <div style={{
                  fontSize: 11, fontWeight: 600, color: isCurrent ? T.primary : isFuture ? T.textMuted : T.text,
                  textAlign: "center", marginTop: 8, lineHeight: 1.3, maxWidth: 110,
                }}>
                  {stage.name}
                </div>

                {/* Time in stage */}
                <div style={{
                  fontSize: 10, color: T.textMuted, marginTop: 4,
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  {Ico.clock(10)} {STAGE_TIMES[stage.id]}
                </div>

                {/* Outcome dots */}
                <div style={{
                  display: "flex", flexDirection: "column", gap: 2, marginTop: 8,
                  opacity: isFuture ? 0.4 : 1,
                }}>
                  <RagDot score={outcomes.products} label="Products & Services" />
                  <RagDot score={outcomes.price} label="Price & Value" />
                  <RagDot score={outcomes.understanding} label="Consumer Understanding" />
                  <RagDot score={outcomes.support} label="Consumer Support" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: "flex", gap: 16, marginTop: 20, paddingTop: 14,
          borderTop: `1px solid ${T.borderLight}`, justifyContent: "center",
        }}>
          {[
            { color: T.success, label: "Score > 80" },
            { color: T.warning, label: "Score 60-80" },
            { color: T.danger, label: "Score < 60" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: T.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Consumer Duty Scorecard */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ color: T.primary }}>{Ico.shield(20)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Consumer Duty Scorecard</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {scorecard.map(item => (
          <Card key={item.outcome} style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: item.color }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              {item.outcome}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: T.text }}>{item.score}</span>
              <span style={{ fontSize: 12, color: T.textMuted }}>/100</span>
              <div style={{
                marginLeft: "auto", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                background: item.score >= 80 ? T.successBg : item.score >= 60 ? T.warningBg : T.dangerBg,
                color: item.score >= 80 ? T.success : item.score >= 60 ? T.warning : T.danger,
              }}>
                {item.score >= 80 ? "Good" : item.score >= 60 ? "Needs Attention" : "At Risk"}
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>
              {item.evidence}
            </div>
          </Card>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 4px rgba(26,74,84,0.18), 0 0 16px rgba(26,74,84,0.18); }
          50% { box-shadow: 0 0 0 8px rgba(26,74,84,0.08), 0 0 24px rgba(26,74,84,0.12); }
          100% { box-shadow: 0 0 0 4px rgba(26,74,84,0.18), 0 0 16px rgba(26,74,84,0.18); }
        }
      `}</style>
    </div>
  );
}
