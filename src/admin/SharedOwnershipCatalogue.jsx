import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// SHARED OWNERSHIP PRODUCTS
// ─────────────────────────────────────────────
const SHARE_BANDS = ["25%", "40%", "50%", "75%"];
const LTV_BANDS = ["≤60%", "60-75%", "75-85%", "85-90%"];

const PRODUCTS = [
  {
    name: "SO 2-Year Fixed",
    code: "SO2F",
    erc: "3%, 2%",
    rates: { "25%": { "≤60%": 4.89, "60-75%": 5.19, "75-85%": 5.49, "85-90%": 5.79 },
             "40%": { "≤60%": 4.79, "60-75%": 5.09, "75-85%": 5.39 },
             "50%": { "≤60%": 4.69, "60-75%": 4.99, "75-85%": 5.29 },
             "75%": { "≤60%": 4.59, "60-75%": 4.89 } },
  },
  {
    name: "SO 5-Year Fixed",
    code: "SO5F",
    erc: "5%, 4%, 3%, 2%, 1%",
    rates: { "25%": { "≤60%": 5.19, "60-75%": 5.49, "75-85%": 5.79, "85-90%": 6.09 },
             "40%": { "≤60%": 5.09, "60-75%": 5.39, "75-85%": 5.69 },
             "50%": { "≤60%": 4.99, "60-75%": 5.29, "75-85%": 5.59 },
             "75%": { "≤60%": 4.89, "60-75%": 5.19 } },
  },
  {
    name: "SO Tracker",
    code: "SOTR",
    erc: "No ERCs",
    rates: { "25%": { "≤60%": 5.49, "60-75%": 5.79, "75-85%": 6.09 },
             "40%": { "≤60%": 5.39, "60-75%": 5.69 },
             "50%": { "≤60%": 5.29, "60-75%": 5.59 },
             "75%": { "≤60%": 5.19, "60-75%": 5.49 } },
  },
];

const CRITERIA = {
  maxLTV: "90% (of purchased share)",
  maxPropertyValue: "£600,000 (regional caps apply)",
  eligibility: "First-time buyers or previous homeowners who cannot afford to buy outright",
  incomeMultiple: "4.49x single / 4.49x joint",
  stressRate: "SVR + 1% or 5.50% floor",
  minAge: 18,
  maxAge: 70,
  housingAssociations: ["L&Q", "Peabody", "Guinness", "Hyde", "Clarion", "Notting Hill Genesis"],
  staircase: "Buy additional shares in 10% increments after 1 year. Full staircasing to 100% available.",
  rent: "Capped at 2.75% of unsold share. Reviewed annually (RPI + 0.5% or CPI + 1%).",
  productFee: "£999",
  reversion: "BBR + 3.99%",
};

const rateColor = (r) => {
  if (r == null) return "#CBD5E1";
  if (r < 5.0) return "#059669";
  if (r <= 5.8) return "#D97706";
  return "#DC2626";
};

export default function SharedOwnershipCatalogue() {
  const [selectedShare, setSelectedShare] = useState("25%");
  const [tab, setTab] = useState("rates");

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Products" value={PRODUCTS.length} color="#059669" />
        <KPICard label="Max LTV" value="90%" sub="of purchased share" color={T.primary} />
        <KPICard label="Max Property" value="£600k" sub="regional caps" color="#8B5CF6" />
        <KPICard label="Product Fee" value="£999" color={T.accent} />
        <KPICard label="Partners" value={CRITERIA.housingAssociations.length} sub="housing associations" color="#0EA5E9" />
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {[{ id: "rates", label: "Rates by Share" }, { id: "criteria", label: "Criteria & Staircasing" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 24px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500, fontFamily: T.font,
            color: tab === t.id ? T.primary : T.textMuted,
            borderBottom: tab === t.id ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "rates" && (
        <div>
          {/* Share band selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Share Purchased:</span>
            <div style={{ display: "flex", gap: 0 }}>
              {SHARE_BANDS.map((s, i) => (
                <button key={s} onClick={() => setSelectedShare(s)} style={{
                  padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                  background: selectedShare === s ? T.primary : T.card, color: selectedShare === s ? "#fff" : T.textMuted,
                  border: `1px solid ${selectedShare === s ? T.primary : T.border}`,
                  borderRadius: i === 0 ? "6px 0 0 6px" : i === SHARE_BANDS.length - 1 ? "0 6px 6px 0" : 0,
                }}>{s}</button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 8 }}>
              Rent on remaining {100 - parseInt(selectedShare)}% at 2.75%
            </span>
          </div>

          {/* Rate grid */}
          <Card noPad>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Product</th>
                  <th style={{ textAlign: "left", padding: "10px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Code</th>
                  <th style={{ textAlign: "left", padding: "10px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>ERC</th>
                  {LTV_BANDS.map(b => (
                    <th key={b} style={{ textAlign: "center", padding: "10px 8px", fontSize: 10, fontWeight: 700, color: T.navy }}>{b} LTV</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p, i) => {
                  const shareRates = p.rates[selectedShare] || {};
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, background: i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, fontSize: 13, color: T.navy }}>{p.name}</td>
                      <td style={{ padding: "10px 10px", fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{p.code}</td>
                      <td style={{ padding: "10px 10px", fontSize: 11, color: T.textMuted }}>{p.erc}</td>
                      {LTV_BANDS.map(b => {
                        const rate = shareRates[b];
                        return (
                          <td key={b} style={{ textAlign: "center", padding: "10px 8px" }}>
                            {rate != null
                              ? <span style={{ fontWeight: 700, fontSize: 14, color: rateColor(rate) }}>{rate.toFixed(2)}%</span>
                              : <span style={{ color: "#CBD5E1" }}>—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Rent calculator example */}
          <Card style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Example: {selectedShare} Share on £300,000 property</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Share Value", value: `£${(300000 * parseInt(selectedShare) / 100).toLocaleString()}` },
                { label: "Monthly Rent", value: `£${Math.round(300000 * (100 - parseInt(selectedShare)) / 100 * 0.0275 / 12).toLocaleString()}` },
                { label: "Mortgage (est)", value: `£${Math.round((300000 * parseInt(selectedShare) / 100 * 0.72) * 0.005).toLocaleString()}/mo` },
                { label: "Total Monthly", value: `£${Math.round(300000 * (100 - parseInt(selectedShare)) / 100 * 0.0275 / 12 + (300000 * parseInt(selectedShare) / 100 * 0.72) * 0.005).toLocaleString()}` },
              ].map(f => (
                <div key={f.label} style={{ padding: "10px 14px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{f.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "criteria" && (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", fontFamily: T.font }}>
          {[
            ["Max LTV", CRITERIA.maxLTV],
            ["Max Property Value", CRITERIA.maxPropertyValue],
            ["Eligibility", CRITERIA.eligibility],
            ["Income Multiple", CRITERIA.incomeMultiple],
            ["Stress Rate", CRITERIA.stressRate],
            ["Age Range", `${CRITERIA.minAge} – ${CRITERIA.maxAge}`],
            ["Product Fee", CRITERIA.productFee],
            ["Reversion Rate", CRITERIA.reversion],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: "flex", borderBottom: `1px solid ${T.borderLight}`, background: i % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
              <div style={{ width: "35%", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: T.navy }}>{k}</div>
              <div style={{ width: "65%", padding: "10px 14px", fontSize: 12, color: T.text }}>{v}</div>
            </div>
          ))}
          <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.primary, background: T.primary + "14", borderBottom: `1px solid ${T.borderLight}` }}>Staircasing</div>
          <div style={{ padding: "12px 14px", fontSize: 12, color: T.text, lineHeight: 1.6 }}>{CRITERIA.staircase}</div>
          <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.primary, background: T.primary + "14", borderBottom: `1px solid ${T.borderLight}` }}>Rent</div>
          <div style={{ padding: "12px 14px", fontSize: 12, color: T.text, lineHeight: 1.6 }}>{CRITERIA.rent}</div>
          <div style={{ padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: T.primary, background: T.primary + "14", borderBottom: `1px solid ${T.borderLight}` }}>Housing Association Partners</div>
          <div style={{ padding: "12px 14px", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CRITERIA.housingAssociations.map(ha => (
              <span key={ha} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 8, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>{ha}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
