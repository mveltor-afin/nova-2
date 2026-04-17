import { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import {
  PRODUCTS_PRICING, LTV_ADJUSTMENTS, CREDIT_PROFILES as CREDIT_PROFILES_DATA,
  EMPLOYMENT_ADJUSTMENTS, PURPOSE_ADJUSTMENTS, getRate,
} from "../data/pricing";

const PRODUCTS = Object.keys(PRODUCTS_PRICING);
const PURPOSES = Object.keys(PURPOSE_ADJUSTMENTS);
const EMPLOYMENTS = ["All", ...Object.keys(EMPLOYMENT_ADJUSTMENTS)];

const LTV_BANDS = LTV_ADJUSTMENTS.map(l => l.band);
const LTV_MIDS = LTV_ADJUSTMENTS.map(l => Math.round((l.min + l.max) / 2) || 30); // midpoint for calculation

const CREDIT_PROFILES = CREDIT_PROFILES_DATA.map(c => `${c.label} (${c.desc})`);

// Generate the base rate grid from the pricing engine (Afin Fix 2yr as reference)
const BASE_RATES = CREDIT_PROFILES_DATA.map(credit =>
  LTV_ADJUSTMENTS.map(ltv => {
    const r = getRate({ product: "Afin Fix 2yr 75%", ltv: LTV_MIDS[LTV_ADJUSTMENTS.indexOf(ltv)], credit: credit.id });
    return r.available ? r.rate : null;
  })
);

// Product modifiers derived from base rates vs Afin Fix 2yr
const PRODUCT_MODIFIERS = Object.fromEntries(
  PRODUCTS.map(p => [p, Math.round((PRODUCTS_PRICING[p].baseRate - PRODUCTS_PRICING["Afin Fix 2yr 75%"].baseRate) * 100) / 100])
);

const PURPOSE_MODIFIERS = PURPOSE_ADJUSTMENTS;
const EMPLOYMENT_MODIFIERS = { All: 0, ...EMPLOYMENT_ADJUSTMENTS };

function cellColor(rate) {
  if (rate === null) return { bg: "#F5F5F5", text: "#999" };
  if (rate < 4.5) return { bg: "#E6F7F3", text: "#065F46" };
  if (rate <= 5.5) return { bg: "#FFF8E0", text: "#92400E" };
  if (rate <= 6.5) return { bg: "#FEF3C7", text: "#92400E" };
  return { bg: "#FFF0EF", text: "#991B1B" };
}

const Chip = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "6px 14px",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      border: `1px solid ${active ? T.primary : T.border}`,
      background: active ? T.primary : T.card,
      color: active ? "#fff" : T.text,
      transition: "all 0.15s",
      userSelect: "none",
    }}
  >
    {label}
  </div>
);

export default function PricingMatrix() {
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [purpose, setPurpose] = useState("Purchase");
  const [employment, setEmployment] = useState("All");
  const [hoveredCell, setHoveredCell] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [appliedAdjust, setAppliedAdjust] = useState(0);

  const [propertyMods, setPropertyMods] = useState([
    { label: "Standard Construction", value: 0.0 },
    { label: "Non-Standard (timber/steel)", value: 0.25 },
    { label: "New Build", value: 0.10 },
    { label: "Ex-Local Authority", value: 0.15 },
    { label: "High-Rise (>6 floors)", value: 0.30 },
  ]);

  const [epcMods, setEpcMods] = useState([
    { label: "EPC A", value: -0.15, note: "best discount" },
    { label: "EPC B", value: -0.10, note: null },
    { label: "EPC C", value: -0.05, note: null },
    { label: "EPC D", value: 0.0, note: "standard" },
    { label: "EPC E-G", value: 0.10, note: "energy risk premium" },
  ]);

  const [loyaltyMods] = useState([
    { label: "New Customer", value: 0.0 },
    { label: "Existing (1 product)", value: -0.05 },
    { label: "Multi-Product (2+)", value: -0.10 },
    { label: "Premier/Platinum", value: -0.15 },
    { label: "Product Switcher (retention)", value: -0.20 },
  ]);

  const totalModifier = useMemo(
    () => (PRODUCT_MODIFIERS[product] || 0) + (PURPOSE_MODIFIERS[purpose] || 0) + (EMPLOYMENT_MODIFIERS[employment] || 0) + appliedAdjust,
    [product, purpose, employment, appliedAdjust]
  );

  const grid = useMemo(() => {
    return BASE_RATES.map((row) =>
      row.map((base) => {
        if (base === null) return null;
        return Math.round((base + totalModifier) * 100) / 100;
      })
    );
  }, [totalModifier]);

  const availableCells = useMemo(() => grid.flat().filter((v) => v !== null), [grid]);
  const avgRate = useMemo(
    () => (availableCells.length ? (availableCells.reduce((a, b) => a + b, 0) / availableCells.length).toFixed(2) : "—"),
    [availableCells]
  );

  const previewGrid = useMemo(() => {
    return BASE_RATES.map((row) =>
      row.map((base) => {
        if (base === null) return null;
        return Math.round((base + totalModifier - appliedAdjust + sliderValue) * 100) / 100;
      })
    );
  }, [totalModifier, appliedAdjust, sliderValue]);

  const previewCells = useMemo(() => previewGrid.flat().filter((v) => v !== null), [previewGrid]);
  const previewAvg = useMemo(
    () => (previewCells.length ? (previewCells.reduce((a, b) => a + b, 0) / previewCells.length).toFixed(2) : "—"),
    [previewCells]
  );

  const activeModifiers = [];
  if (PRODUCT_MODIFIERS[product] !== 0) activeModifiers.push({ label: product, value: PRODUCT_MODIFIERS[product] });
  if (PURPOSE_MODIFIERS[purpose] !== 0) activeModifiers.push({ label: purpose, value: PURPOSE_MODIFIERS[purpose] });
  if (EMPLOYMENT_MODIFIERS[employment] !== 0) activeModifiers.push({ label: employment, value: EMPLOYMENT_MODIFIERS[employment] });
  if (appliedAdjust !== 0) activeModifiers.push({ label: "Quick Adjust", value: appliedAdjust });

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Pricing Matrix</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Multi-dimensional rate explorer — see the full pricing landscape
        </div>
      </div>

      {/* Dimension Toggles */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
          {/* Product dropdown */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Product</div>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                fontSize: 13,
                fontFamily: T.font,
                color: T.text,
                background: T.card,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Purpose chips */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Loan Purpose</div>
            <div style={{ display: "flex", gap: 6 }}>
              {PURPOSES.map((p) => (
                <Chip key={p} label={p} active={purpose === p} onClick={() => setPurpose(p)} />
              ))}
            </div>
          </div>

          {/* Employment chips */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Employment</div>
            <div style={{ display: "flex", gap: 6 }}>
              {EMPLOYMENTS.map((e) => (
                <Chip key={e} label={e} active={employment === e} onClick={() => setEmployment(e)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Heatmap Grid */}
      <Card style={{ marginBottom: 20, overflow: "auto" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Rate by LTV x Credit Profile</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 3, width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "6px 8px", minWidth: 200 }}>Credit Profile</th>
                {LTV_BANDS.map((b) => (
                  <th key={b} style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textAlign: "center", padding: "6px 4px", minWidth: 60 }}>{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CREDIT_PROFILES.map((profile, ri) => (
                <tr key={profile}>
                  <td style={{ fontSize: 12, fontWeight: 500, color: T.text, padding: "4px 8px", whiteSpace: "nowrap" }}>{profile}</td>
                  {LTV_BANDS.map((band, ci) => {
                    const rate = grid[ri][ci];
                    const c = cellColor(rate);
                    const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                    return (
                      <td
                        key={ci}
                        onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ position: "relative", padding: 0 }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 44,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 600,
                            background: c.bg,
                            color: c.text,
                            transition: "all 0.12s",
                            transform: isHovered && rate !== null ? "scale(1.08)" : "scale(1)",
                            boxShadow: isHovered && rate !== null ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                            cursor: rate !== null ? "pointer" : "default",
                            margin: "0 auto",
                          }}
                        >
                          {rate !== null ? rate.toFixed(2) : "—"}
                        </div>
                        {isHovered && rate !== null && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "calc(100% + 6px)",
                              left: "50%",
                              transform: "translateX(-50%)",
                              background: T.navy,
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "5px 10px",
                              borderRadius: 6,
                              whiteSpace: "nowrap",
                              zIndex: 20,
                              pointerEvents: "none",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            }}
                          >
                            {band} x {profile.split(" (")[0]} = {rate != null ? rate.toFixed(2) : "N/A"}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modifier Summary Strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "12px 18px",
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 600, color: T.textMuted }}>Base:</span>
        <span style={{ fontWeight: 600 }}>{product}</span>
        <span style={{ color: T.border }}>·</span>
        <span style={{ fontWeight: 600, color: T.textMuted }}>Purpose:</span>
        <span style={{ fontWeight: 600 }}>{purpose}</span>
        <span style={{ color: T.border }}>·</span>
        <span style={{ fontWeight: 600, color: T.textMuted }}>Employment:</span>
        <span style={{ fontWeight: 600 }}>{employment}</span>
        {activeModifiers.map((m) => (
          <span
            key={m.label}
            style={{
              marginLeft: 8,
              padding: "3px 10px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              background: T.warningBg,
              color: "#92400E",
            }}
          >
            {m.value > 0 ? "+" : ""}{(m.value || 0).toFixed(2)}% {m.label} modifier applied
          </span>
        ))}
      </div>

      {/* Rate Adjustment Panel */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Quick Adjust</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Apply rate change across all cells</div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, minWidth: 42 }}>-0.50%</span>
          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={Math.round(sliderValue * 100)}
            onChange={(e) => setSliderValue(Number(e.target.value) / 100)}
            style={{ flex: 1, accentColor: T.primary, cursor: "pointer" }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, minWidth: 42, textAlign: "right" }}>+0.50%</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 13, color: T.text }}>
            <span style={{ fontWeight: 700 }}>{sliderValue > 0 ? "+" : ""}{sliderValue.toFixed(2)}%</span>
            <span style={{ color: T.textMuted, marginLeft: 8 }}>
              This would change {previewCells.length} cells, avg new rate: {previewAvg}%
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              ghost
              small
              onClick={() => {
                setSliderValue(0);
                setAppliedAdjust(0);
              }}
            >
              Reset
            </Btn>
            <Btn
              primary
              small
              onClick={() => {
                setAppliedAdjust(sliderValue);
              }}
            >
              Apply
            </Btn>
          </div>
        </div>
      </Card>

      {/* Additional Dimension Cards */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Property Type Modifiers */}
        <Card style={{ flex: 1, minWidth: 320 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Property Type Modifiers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {propertyMods.map((mod, i) => (
              <div key={mod.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{mod.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    step="0.05"
                    value={mod.value}
                    onChange={(e) => {
                      const next = [...propertyMods];
                      next[i] = { ...mod, value: parseFloat(e.target.value) || 0 };
                      setPropertyMods(next);
                    }}
                    style={{
                      width: 64,
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: `1px solid ${T.border}`,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: T.font,
                      textAlign: "right",
                      outline: "none",
                      color: mod.value > 0 ? "#92400E" : mod.value < 0 ? "#065F46" : T.text,
                      background: mod.value > 0 ? "#FFF8E0" : mod.value < 0 ? "#E6F7F3" : T.card,
                    }}
                  />
                  <span style={{ fontSize: 12, color: T.textMuted }}>%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Green/EPC Incentive */}
        <Card style={{ flex: 1, minWidth: 320 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Green / EPC Incentive</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {epcMods.map((mod, i) => (
              <div key={mod.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{mod.label}</span>
                  {mod.note && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: mod.value < 0 ? "#E6F7F3" : mod.value > 0 ? "#FFF0EF" : "#F5F5F5",
                        color: mod.value < 0 ? "#065F46" : mod.value > 0 ? "#991B1B" : "#999",
                      }}
                    >
                      {mod.note}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    step="0.05"
                    value={mod.value}
                    onChange={(e) => {
                      const next = [...epcMods];
                      next[i] = { ...mod, value: parseFloat(e.target.value) || 0 };
                      setEpcMods(next);
                    }}
                    style={{
                      width: 64,
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: `1px solid ${T.border}`,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: T.font,
                      textAlign: "right",
                      outline: "none",
                      color: mod.value < 0 ? "#065F46" : mod.value > 0 ? "#991B1B" : T.text,
                      background: mod.value < 0 ? "#E6F7F3" : mod.value > 0 ? "#FFF0EF" : T.card,
                    }}
                  />
                  <span style={{ fontSize: 12, color: T.textMuted }}>%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Customer Loyalty Modifiers */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Customer Loyalty Modifiers</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {loyaltyMods.map((mod) => (
            <div
              key={mod.label}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: mod.value < 0 ? "#F0FDF9" : T.card,
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 200,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{mod.label}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: mod.value < 0 ? "#065F46" : T.textMuted,
                }}
              >
                {mod.value === 0 ? "+0.00%" : `${mod.value.toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insight Card */}
      <Card
        style={{
          borderLeft: `4px solid ${T.accent}`,
          background: "#F6FFF9",
          marginBottom: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.sparkle(18)}
          <span style={{ fontSize: 15, fontWeight: 700 }}>AI Insights</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: T.text,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 10,
              border: `1px solid ${T.successBorder}`,
            }}
          >
            <span style={{ fontWeight: 700 }}>Rate gap analysis:</span> 73% of your Clean/≤60% applications are converting at 4.19%. However, Clean/60-75% at 4.49% has a 58% conversion — 0.06% above market median. Reducing to 4.43% would add ~12 completions/quarter.
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: T.text,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: 10,
              border: `1px solid ${T.successBorder}`,
            }}
          >
            <span style={{ fontWeight: 700 }}>Competitive edge:</span> The Self-Employed modifier at +0.20% is below the market average of +0.35%. This is driving 22% of your self-employed volume — maintain this competitive advantage.
          </div>
        </div>
      </Card>
    </div>
  );
}
