import { useState, useMemo, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import {
  PRODUCTS_PRICING, LTV_ADJUSTMENTS, CREDIT_PROFILES as CREDIT_PROFILES_DATA,
  EMPLOYMENT_ADJUSTMENTS, LOYALTY_ADJUSTMENTS, PURPOSE_ADJUSTMENTS, getRate,
  saveDimension, resetAllDimensions,
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

  // --- Core Dimension state ---
  const [ltvDims, setLtvDims] = useState(() => LTV_ADJUSTMENTS.map(l => ({ ...l })));
  const [creditDims, setCreditDims] = useState(() => CREDIT_PROFILES_DATA.map(c => ({ ...c })));
  const [empDims, setEmpDims] = useState(() =>
    Object.entries(EMPLOYMENT_ADJUSTMENTS).map(([k, v]) => ({ label: k, value: v }))
  );
  const [loyaltyDims, setLoyaltyDims] = useState(() =>
    Object.entries(LOYALTY_ADJUSTMENTS).map(([k, v]) => ({ label: k, value: v }))
  );

  // --- Persist property mods ---
  useEffect(() => {
    const obj = {};
    propertyMods.forEach(m => { obj[m.label] = m.value; });
    saveDimension("property", obj);
  }, [propertyMods]);

  // --- Persist EPC mods ---
  useEffect(() => {
    const obj = {};
    epcMods.forEach(m => { obj[m.label.replace("EPC ", "")] = m.value; });
    saveDimension("epc", obj);
  }, [epcMods]);

  // --- Persist core dimensions ---
  useEffect(() => { saveDimension("ltv", ltvDims); }, [ltvDims]);
  useEffect(() => { saveDimension("credit", creditDims); }, [creditDims]);
  useEffect(() => {
    const obj = {};
    empDims.forEach(m => { obj[m.label] = m.value; });
    saveDimension("employment", obj);
  }, [empDims]);
  useEffect(() => {
    const obj = {};
    loyaltyDims.forEach(m => { obj[m.label] = m.value; });
    saveDimension("loyalty", obj);
  }, [loyaltyDims]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Ico.settings(22)}
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>Pricing Configuration</div>
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Configure the pricing rules that drive every rate across the platform. Changes apply to Eligibility Calculator, Broker Smart Apply, Product Catalogue and Rate Matrix.
        </div>
      </div>

      {/* Heatmap, toggles, quick adjust all removed — pricing grids live in Product Catalogue */}
      <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 12 }}>Core Dimension Editor</div>

      {/* LTV Band Adjustments */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>LTV Band Adjustments</div>
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 400 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Band</th>
              <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Adjustment %</th>
            </tr>
          </thead>
          <tbody>
            {ltvDims.map((row, i) => (
              <tr key={row.band}>
                <td style={{ fontSize: 13, fontWeight: 500, padding: "4px 8px" }}>{row.band}</td>
                <td style={{ textAlign: "right", padding: "4px 8px" }}>
                  <input
                    type="number"
                    step="0.05"
                    value={row.adj}
                    onChange={(e) => {
                      const next = [...ltvDims];
                      next[i] = { ...row, adj: parseFloat(e.target.value) || 0 };
                      setLtvDims(next);
                    }}
                    style={{
                      width: 66, padding: "4px 6px", borderRadius: 6,
                      border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                      fontFamily: T.font, textAlign: "right", outline: "none",
                      color: row.adj > 0 ? "#92400E" : row.adj < 0 ? "#065F46" : T.text,
                      background: row.adj > 0 ? "#FFF8E0" : row.adj < 0 ? "#E6F7F3" : T.card,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Credit Profile Adjustments */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Credit Profile Adjustments</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Profile</th>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Description</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Rate Adj %</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Max LTV</th>
              </tr>
            </thead>
            <tbody>
              {creditDims.map((row, i) => (
                <tr key={row.id}>
                  <td style={{ fontSize: 13, fontWeight: 500, padding: "4px 8px", whiteSpace: "nowrap" }}>{row.label}</td>
                  <td style={{ fontSize: 12, color: T.textMuted, padding: "4px 8px" }}>{row.desc}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    <input
                      type="number"
                      step="0.05"
                      value={row.adj}
                      onChange={(e) => {
                        const next = [...creditDims];
                        next[i] = { ...row, adj: parseFloat(e.target.value) || 0 };
                        setCreditDims(next);
                      }}
                      style={{
                        width: 66, padding: "4px 6px", borderRadius: 6,
                        border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                        fontFamily: T.font, textAlign: "right", outline: "none",
                        color: row.adj > 0 ? "#92400E" : row.adj < 0 ? "#065F46" : T.text,
                        background: row.adj > 0 ? "#FFF8E0" : row.adj < 0 ? "#E6F7F3" : T.card,
                      }}
                    />
                  </td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    <input
                      type="number"
                      step="5"
                      value={row.maxLTV || 95}
                      onChange={(e) => {
                        const next = [...creditDims];
                        next[i] = { ...row, maxLTV: parseInt(e.target.value) || 95 };
                        setCreditDims(next);
                      }}
                      style={{
                        width: 60, padding: "4px 6px", borderRadius: 6,
                        border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                        fontFamily: T.font, textAlign: "right", outline: "none",
                        color: T.text, background: T.card,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employment & Loyalty Adjustments side by side */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Employment Adjustments */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Employment Adjustments</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Type</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Adjustment %</th>
              </tr>
            </thead>
            <tbody>
              {empDims.map((row, i) => (
                <tr key={row.label}>
                  <td style={{ fontSize: 13, fontWeight: 500, padding: "4px 8px" }}>{row.label}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    <input
                      type="number"
                      step="0.05"
                      value={row.value}
                      onChange={(e) => {
                        const next = [...empDims];
                        next[i] = { ...row, value: parseFloat(e.target.value) || 0 };
                        setEmpDims(next);
                      }}
                      style={{
                        width: 66, padding: "4px 6px", borderRadius: 6,
                        border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                        fontFamily: T.font, textAlign: "right", outline: "none",
                        color: row.value > 0 ? "#92400E" : row.value < 0 ? "#065F46" : T.text,
                        background: row.value > 0 ? "#FFF8E0" : row.value < 0 ? "#E6F7F3" : T.card,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Loyalty Adjustments */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Loyalty Adjustments</div>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Tier</th>
                <th style={{ textAlign: "right", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "4px 8px" }}>Adjustment %</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyDims.map((row, i) => (
                <tr key={row.label}>
                  <td style={{ fontSize: 13, fontWeight: 500, padding: "4px 8px" }}>{row.label}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>
                    <input
                      type="number"
                      step="0.05"
                      value={row.value}
                      onChange={(e) => {
                        const next = [...loyaltyDims];
                        next[i] = { ...row, value: parseFloat(e.target.value) || 0 };
                        setLoyaltyDims(next);
                      }}
                      style={{
                        width: 66, padding: "4px 6px", borderRadius: 6,
                        border: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600,
                        fontFamily: T.font, textAlign: "right", outline: "none",
                        color: row.value < 0 ? "#065F46" : row.value > 0 ? "#92400E" : T.text,
                        background: row.value < 0 ? "#E6F7F3" : row.value > 0 ? "#FFF8E0" : T.card,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

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

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
        <Btn
          ghost
          onClick={() => { resetAllDimensions(); window.location.reload(); }}
        >
          Reset All to Defaults
        </Btn>
        <Btn
          primary
          onClick={() => { window.location.reload(); }}
        >
          Save &amp; Apply
        </Btn>
      </div>
    </div>
  );
}
