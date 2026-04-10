import React, { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// TOGGLE OPTIONS
// ─────────────────────────────────────────────
const TOGGLE_STATES = {
  positive: { label: null, color: T.success, bg: T.successBg, icon: "check" },
  review:   { label: null, color: T.warning, bg: T.warningBg, icon: "alert" },
  negative: { label: null, color: T.danger,  bg: T.dangerBg,  icon: "x" },
};

const REVIEW_REASONS = [
  "Select reason...",
  "Product complexity exceeds customer profile",
  "Customer expressed uncertainty",
  "Alternative product may be more suitable",
  "Affordability concerns identified",
  "Vulnerability indicator detected",
  "Terms not fully understood by customer",
  "Other — add manual note",
];

// ─────────────────────────────────────────────
// AI PRE-ASSESSMENT
// ─────────────────────────────────────────────
function getPreAssessment(stage, action) {
  return {
    products: "positive",
    price: "positive",
    understanding: "positive",
    support: "positive",
  };
}

// ─────────────────────────────────────────────
// OUTCOME TRACKER COMPONENT
// ─────────────────────────────────────────────
export default function OutcomeTracker({ stage, customerId, action }) {
  const preAssessment = getPreAssessment(stage, action);

  const [outcomes, setOutcomes] = useState({
    products: preAssessment.products,
    price: preAssessment.price,
    understanding: preAssessment.understanding,
    support: preAssessment.support,
  });

  const [reasons, setReasons] = useState({
    products: "", price: "", understanding: "", support: "",
  });

  const [checklist, setChecklist] = useState({
    esis: false, keyTerms: false, coolingOff: false,
  });

  const [saved, setSaved] = useState(false);
  const [vulnerabilityDetected] = useState(false);

  const setOutcome = (key, value) => {
    setOutcomes(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const setReason = (key, value) => {
    setReasons(prev => ({ ...prev, [key]: value }));
  };

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  // Toggle button renderer
  const ToggleRow = ({ outcomeKey, positiveLabel, reviewLabel, negativeLabel }) => {
    const current = outcomes[outcomeKey];
    const needsReason = current === "review" || current === "negative";

    return (
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "positive", label: positiveLabel, color: T.success, bg: T.successBg, icon: "check" },
            { key: "review", label: reviewLabel, color: T.warning, bg: T.warningBg, icon: "alert" },
            { key: "negative", label: negativeLabel, color: T.danger, bg: T.dangerBg, icon: "x" },
          ].map(opt => {
            const isActive = current === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setOutcome(outcomeKey, opt.key)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  padding: "6px 8px", borderRadius: 7, fontSize: 10, fontWeight: 600,
                  border: isActive ? `2px solid ${opt.color}` : `1px solid ${T.borderLight}`,
                  background: isActive ? opt.bg : T.card,
                  color: isActive ? opt.color : T.textMuted,
                  cursor: "pointer", fontFamily: T.font, transition: "all 0.15s",
                }}
              >
                <span style={{ color: isActive ? opt.color : T.textMuted }}>{Ico[opt.icon]?.(12)}</span>
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Mandatory reason dropdown */}
        {needsReason && outcomeKey !== "understanding" && (
          <select
            value={reasons[outcomeKey]}
            onChange={e => setReason(outcomeKey, e.target.value)}
            style={{
              width: "100%", marginTop: 6, padding: "6px 10px", borderRadius: 7,
              border: `1px solid ${T.border}`, fontSize: 11, fontFamily: T.font,
              color: T.text, background: T.card, outline: "none",
            }}
          >
            {REVIEW_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </div>
    );
  };

  return (
    <Card style={{ maxWidth: 480, position: "relative", overflow: "hidden" }}>
      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: T.primary }}>{Ico.shield(18)}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Consumer Duty — Outcome Recording</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>
            Stage: {stage || "General"} {action ? `| Action: ${action}` : ""}
          </div>
        </div>
        <div style={{
          marginLeft: "auto", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: "linear-gradient(135deg, rgba(26,74,84,0.1), rgba(49,184,151,0.1))",
          color: T.primary,
        }}>
          AI Pre-filled
        </div>
      </div>

      {/* 1. Products & Services */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
          1. Products & Services
          <span style={{ fontWeight: 400, color: T.textMuted }}> — Was the product suitable for this customer?</span>
        </div>
        <ToggleRow
          outcomeKey="products"
          positiveLabel="Suitable"
          reviewLabel="Review Required"
          negativeLabel="Unsuitable"
        />
      </div>

      {/* 2. Price & Value */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
          2. Price & Value
          <span style={{ fontWeight: 400, color: T.textMuted }}> — Does the product represent fair value?</span>
        </div>
        <ToggleRow
          outcomeKey="price"
          positiveLabel="Fair Value"
          reviewLabel="Review Required"
          negativeLabel="Unfair"
        />
        <div style={{
          marginTop: 6, padding: "6px 10px", borderRadius: 6,
          background: T.primaryLight, fontSize: 10, color: T.textSecondary,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ color: T.primary }}>{Ico.bot(12)}</span>
          Rate 4.49% is within market range (4.19%–4.89%). AI assessment: Fair value.
        </div>
      </div>

      {/* 3. Consumer Understanding */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
          3. Consumer Understanding
          <span style={{ fontWeight: 400, color: T.textMuted }}> — Does the customer understand the product?</span>
        </div>
        <ToggleRow
          outcomeKey="understanding"
          positiveLabel="Confirmed"
          reviewLabel="Unclear"
          negativeLabel="Not Evidenced"
        />
        {/* Checklist */}
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { key: "esis", label: "ESIS provided" },
            { key: "keyTerms", label: "Key terms explained" },
            { key: "coolingOff", label: "Cooling-off period noted" },
          ].map(item => (
            <label
              key={item.key}
              onClick={() => toggleCheck(item.key)}
              style={{
                display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                fontSize: 11, color: checklist[item.key] ? T.text : T.textMuted,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                border: `1.5px solid ${checklist[item.key] ? T.success : T.border}`,
                background: checklist[item.key] ? T.successBg : T.card,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                {checklist[item.key] && <span style={{ color: T.success }}>{Ico.check(10)}</span>}
              </div>
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* 4. Consumer Support */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
          4. Consumer Support
          <span style={{ fontWeight: 400, color: T.textMuted }}> — Has the customer been adequately supported?</span>
        </div>
        <ToggleRow
          outcomeKey="support"
          positiveLabel="Adequate"
          reviewLabel="Needs Attention"
          negativeLabel="Inadequate"
        />
        {/* Vulnerability check */}
        <div style={{
          marginTop: 6, padding: "6px 10px", borderRadius: 6,
          background: vulnerabilityDetected ? T.dangerBg : T.successBg,
          border: `1px solid ${vulnerabilityDetected ? T.dangerBorder : T.successBorder}`,
          fontSize: 10, fontWeight: 600,
          color: vulnerabilityDetected ? T.danger : T.success,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span>{vulnerabilityDetected ? Ico.alert(12) : Ico.shield(12)}</span>
          {vulnerabilityDetected
            ? "Vulnerability flag active — enhanced support required"
            : "No vulnerability indicators detected"}
        </div>
      </div>

      {/* Save button and toast */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Btn primary icon="shield" onClick={handleSave} style={{ flex: 1 }}>
          Record Outcomes
        </Btn>
      </div>

      {saved && (
        <div style={{
          marginTop: 10, padding: "8px 14px", borderRadius: 8,
          background: T.successBg, border: `1px solid ${T.successBorder}`,
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 600, color: T.success,
        }}>
          {Ico.check(14)} Consumer Duty outcomes recorded successfully for {stage || "this stage"}.
        </div>
      )}
    </Card>
  );
}
