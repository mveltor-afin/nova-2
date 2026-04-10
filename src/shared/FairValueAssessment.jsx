import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// FAIR VALUE ASSESSMENT — Consumer Duty embeddable component
// ─────────────────────────────────────────────

function FairValueAssessment({ product = "Afin Fix 2yr 75%", rate = "4.49%", amount = "£350,000" }) {
  const [saved, setSaved] = useState(false);

  // Parse numeric rate for comparisons
  const numRate = parseFloat(rate);
  const marketAvg = 4.42;
  const cheapest = 4.19;
  const mostExpensive = 4.89;
  const medianCustomer = 4.39;
  const variance = numRate - medianCustomer;

  // Determine market position
  const diff = numRate - marketAvg;
  const position = diff <= -0.1
    ? { label: "Below market — favourable", color: T.success, bg: T.successBg }
    : diff <= 0.15
      ? { label: "At market", color: T.success, bg: T.successBg }
      : { label: "Above market", color: T.warning, bg: T.warningBg };

  // Fairness check
  const isFair = variance <= 0.5;
  const fairness = isFair
    ? { label: "Fair", color: T.success, bg: T.successBg }
    : { label: "Unfair", color: T.danger, bg: T.dangerBg };

  // Total cost calculations
  const monthly = 1948;
  const totalOverTerm = 584400;
  const totalInterest = 234400;
  const cheapestDiff = 8400;

  const badge = (text, color, bg) => (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: bg, color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );

  const row = (label, value, extra) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.borderLight}` }}>
      <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{value}</span>
        {extra}
      </div>
    </div>
  );

  return (
    <Card>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
          {Ico.shield(20)}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Fair Value Assessment</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>{product} &middot; {rate} &middot; {amount}</div>
        </div>
      </div>

      {/* Market Comparison */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Market Comparison
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: "4px 14px", marginBottom: 18 }}>
        {row("This product", `${numRate.toFixed(2)}%`)}
        {row("Market average", `${marketAvg.toFixed(2)}%`)}
        {row("Cheapest competitor", `${cheapest.toFixed(2)}% (Nationwide)`)}
        {row("Most expensive", `${mostExpensive.toFixed(2)}% (HSBC)`)}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0" }}>
          <span style={{ fontSize: 13, color: T.textMuted }}>Position</span>
          {badge(position.label, position.color, position.bg)}
        </div>
      </div>

      {/* Customer Comparison */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Customer Comparison
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: T.text, marginBottom: 8 }}>
          Other Afin customers with similar LTV and profile pay: <strong>4.39%&ndash;4.59%</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: T.textMuted }}>Variance: +{variance.toFixed(2)}% vs median customer</span>
          {badge(fairness.label, fairness.color, fairness.bg)}
        </div>
      </div>

      {/* Total Cost of Product */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Total Cost of Product
      </div>
      <div style={{ background: T.bg, borderRadius: 10, padding: "4px 14px", marginBottom: 18 }}>
        {row("Monthly payment", `£${monthly.toLocaleString()}`)}
        {row("Total over term", `£${totalOverTerm.toLocaleString()}`)}
        {row("Total interest", `£${totalInterest.toLocaleString()}`)}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0" }}>
          <span style={{ fontSize: 13, color: T.textMuted }}>Compared to cheapest alternative</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>+£{cheapestDiff.toLocaleString()} over term</span>
            {badge("Significant", T.warning, T.warningBg)}
          </div>
        </div>
      </div>

      {/* AI Fair Value Verdict */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        AI Fair Value Verdict
      </div>
      <div style={{
        background: isFair ? T.successBg : T.dangerBg,
        border: `1px solid ${isFair ? T.successBorder : T.dangerBorder}`,
        borderRadius: 10, padding: 14, marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ marginTop: 2, color: isFair ? T.success : T.danger }}>{Ico.bot(18)}</div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
            {isFair ? (
              <>
                This product represents <strong>FAIR VALUE</strong>. Rate is within market range. No cheaper suitable alternative identified for this LTV and term combination. Consumer is not disadvantaged.
              </>
            ) : (
              <>
                <strong>WARNING:</strong> Customer is paying {variance.toFixed(1)}% above market median for their profile. Consider: rate match or alternative product recommendation required under Consumer Duty.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Record Assessment button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn
          primary
          icon="check"
          disabled={saved}
          onClick={() => setSaved(true)}
        >
          {saved ? "Assessment Recorded" : "Record Assessment"}
        </Btn>
      </div>
    </Card>
  );
}

export default FairValueAssessment;
