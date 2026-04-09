import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const PRODUCTS = [
  { name: "Afin Fix 2yr 60%", rate: 4.19, margin: 0.94, competitor: 4.15, position: "At market" },
  { name: "Afin Fix 2yr 75%", rate: 4.49, margin: 1.24, competitor: 4.45, position: "At market" },
  { name: "Afin Fix 2yr 90%", rate: 5.29, margin: 2.04, competitor: 5.35, position: "Below market" },
  { name: "Afin Fix 5yr 60%", rate: 4.39, margin: 1.14, competitor: 4.29, position: "Above market" },
  { name: "Afin Fix 5yr 75%", rate: 4.89, margin: 1.64, competitor: 4.85, position: "At market" },
  { name: "Afin Fix 5yr 90%", rate: 5.59, margin: 2.34, competitor: 5.65, position: "Below market" },
  { name: "Afin Track SVR", rate: 7.99, margin: 4.74, competitor: 7.49, position: "Above market" },
  { name: "Afin Track Base+", rate: 4.74, margin: 1.49, competitor: 4.69, position: "At market" },
];

const COMPETITORS = [
  { name: "Nationwide", rate: 4.39 },
  { name: "Halifax", rate: 4.45 },
  { name: "Barclays", rate: 4.52 },
  { name: "HSBC", rate: 4.59 },
];

const BASE_RATE = 3.25;

function getPosition(proposed, competitorAvg) {
  const diff = proposed - competitorAvg;
  if (diff < -0.1) return "Below market (competitive)";
  if (diff > 0.1) return "Above market";
  return "At market";
}

function getPositionColor(pos) {
  if (pos.includes("Below")) return T.success;
  if (pos.includes("Above")) return T.danger;
  return T.warning;
}

export default function PricingEngine() {
  const [selectedProduct, setSelectedProduct] = useState("Afin Fix 2yr 75%");
  const [proposedRate, setProposedRate] = useState(4.29);

  const product = PRODUCTS.find(p => p.name === selectedProduct);
  const currentRate = product?.rate || 4.49;
  const competitorAvg = product?.competitor || 4.45;

  const rateChange = proposedRate - currentRate;
  const volumeImpact = Math.round(rateChange < 0 ? Math.abs(rateChange) / 0.01 * 0.75 : -(rateChange / 0.01 * 0.5));
  const monthlyPaymentChange = Math.round(rateChange * 350000 / 1200);
  const marginImpact = Math.round(rateChange * 100000000 / 100 / 100);
  const newApps = rateChange < 0 ? `+${Math.round(Math.abs(rateChange) / 0.01 * 0.15)}` : `${Math.round(rateChange / 0.01 * -0.1)}`;
  const newPosition = getPosition(proposedRate, competitorAvg);
  const breakEvenVolume = rateChange < 0 ? Math.round(Math.abs(rateChange) / currentRate * 100 * 6) : 0;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.navy }}>Pricing Engine</h1>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Model rate changes and forecast impact</div>
      </div>

      {/* Current rates table */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.chart(18)} Current Rates</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Product", "Current Rate", "Margin over Base", "Competitor Avg", "Position"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, background: p.name === selectedProduct ? T.primaryLight : "transparent" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "10px 12px" }}>{p.rate.toFixed(2)}%</td>
                  <td style={{ padding: "10px 12px" }}>{p.margin.toFixed(2)}%</td>
                  <td style={{ padding: "10px 12px" }}>{p.competitor.toFixed(2)}%</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, color: getPositionColor(p.position), background: getPositionColor(p.position) + "18" }}>{p.position}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 10 }}>Base rate: {BASE_RATE.toFixed(2)}% (Bank of England)</div>
      </Card>

      {/* Rate Modelling */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.zap(18)} Rate Modelling</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Select Product</label>
            <select
              value={selectedProduct}
              onChange={e => {
                setSelectedProduct(e.target.value);
                const p = PRODUCTS.find(pr => pr.name === e.target.value);
                setProposedRate(Math.round((p.rate - 0.20) * 100) / 100);
              }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, background: T.card }}
            >
              {PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#F8F7F4", borderRadius: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Current Rate</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>{currentRate.toFixed(2)}%</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Proposed New Rate</label>
              <span style={{ fontSize: 16, fontWeight: 700, color: rateChange < 0 ? T.success : rateChange > 0 ? T.danger : T.text }}>{proposedRate.toFixed(2)}%</span>
            </div>
            <input
              type="range" min="3.50" max="6.00" step="0.05"
              value={proposedRate}
              onChange={e => setProposedRate(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: T.primary }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted }}>
              <span>3.50%</span><span>6.00%</span>
            </div>
          </div>

          <Btn primary style={{ width: "100%" }}>Apply New Rate</Btn>
        </Card>

        {/* Live impact */}
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Live Impact Forecast</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Rate Change", value: `${rateChange >= 0 ? "+" : ""}${rateChange.toFixed(2)}%`, color: rateChange < 0 ? T.success : rateChange > 0 ? T.danger : T.text },
              { label: "Projected Volume Impact", value: `${volumeImpact >= 0 ? "+" : ""}${volumeImpact}%`, color: volumeImpact > 0 ? T.success : T.danger },
              { label: "Monthly Payment Change", value: `${monthlyPaymentChange >= 0 ? "+" : ""}£${Math.abs(monthlyPaymentChange)} per £350k loan`, color: monthlyPaymentChange < 0 ? T.success : T.danger },
              { label: "Margin Impact", value: `${marginImpact >= 0 ? "+" : ""}£${Math.abs(marginImpact).toLocaleString()}/year per £100M book`, color: marginImpact > 0 ? T.success : T.danger },
              { label: "Projected New Applications", value: `${newApps} per month`, color: newApps.startsWith("+") ? T.success : T.danger },
              { label: "Market Position", value: newPosition, color: getPositionColor(newPosition) },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#FAFAF8", borderRadius: 8, border: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          {rateChange < 0 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: T.successBg, borderRadius: 8, border: `1px solid ${T.successBorder}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.success, marginBottom: 2 }}>Break-even Analysis</div>
              <div style={{ fontSize: 12, color: T.text }}>Volume increase of {breakEvenVolume}% needed to offset margin reduction. Projected: +{Math.abs(volumeImpact)}%. {Math.abs(volumeImpact) >= breakEvenVolume ? "Net positive." : "Net negative — consider a smaller reduction."}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Competitor comparison */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.users(18)} Competitor Comparison — {selectedProduct}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 10, background: T.primaryLight, border: `2px solid ${T.primary}`, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Afin (Proposed)</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: T.primary }}>{proposedRate.toFixed(2)}%</div>
          </div>
          {COMPETITORS.map((c, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>{c.name}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>{c.rate.toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insight */}
      <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.primary}22` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 8, background: T.primaryLight, flexShrink: 0 }}>{Ico.sparkle(20)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 4 }}>AI Pricing Insight</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
              Reducing Fix 2yr to 4.29% would make Afin the 2nd cheapest in market. Based on broker behaviour data, this is projected to increase DIP volume by 15% and completions by 8%. The margin reduction of £12,000 per £100M is offset by projected volume gains within 6 weeks.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
