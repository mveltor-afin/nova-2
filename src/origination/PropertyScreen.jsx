import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── Mock Data ──────────────────────────────────────── */
const PROPERTY = {
  address: "14 Oak Lane, Bristol BS1 4NZ",
  type: "Semi-detached",
  buildYear: 1994,
  tenure: "Freehold",
  floorArea: "102 sqm (1,098 sq ft)",
  epcRating: "C",
  epcScore: 68,
  councilTaxBand: "D",
  floodRisk: "Zone 1 (Negligible)",
  subsidenceRisk: "Low",
  conservationArea: false,
  listedBuilding: false,
};

const PLANNING_APPS = [
  { ref: "26/00412/F", address: "22 Oak Lane, BS1 4NZ", description: "Single-storey rear extension", status: "Approved", date: "2025-11-14", distance: "0.05 miles" },
  { ref: "25/01887/F", address: "3 Elm Road, BS1 4NQ", description: "Loft conversion with rear dormer", status: "Pending", date: "2026-02-20", distance: "0.18 miles" },
];

const COMPARABLES = [
  { address: "16 Oak Lane", type: "Semi-detached", beds: 3, price: 478000, date: "Nov 2025", distance: "0.02 miles", sqft: 1050 },
  { address: "8 Elm Road",  type: "Semi-detached", beds: 3, price: 492000, date: "Jan 2026", distance: "0.15 miles", sqft: 1120 },
  { address: "5 Oak Lane",  type: "Semi-detached", beds: 3, price: 465000, date: "Sep 2025", distance: "0.08 miles", sqft: 1010 },
  { address: "31 Maple Ave", type: "Terraced",     beds: 3, price: 455000, date: "Oct 2025", distance: "0.22 miles", sqft: 980 },
  { address: "12 Birch Close", type: "Semi-detached", beds: 4, price: 510000, date: "Dec 2025", distance: "0.30 miles", sqft: 1200 },
  { address: "9 Oak Lane",  type: "Semi-detached", beds: 3, price: 472000, date: "Aug 2025", distance: "0.06 miles", sqft: 1040 },
];

const PRICE_HISTORY = [
  { label: "2019", v: 385 },
  { label: "2020", v: 395 },
  { label: "2021", v: 420 },
  { label: "2022", v: 455 },
  { label: "2023", v: 465 },
  { label: "2024", v: 478 },
  { label: "2025", v: 490 },
  { label: "2026 Est", v: 495 },
];

const AREA_STATS = {
  avgPrice: "£412,000",
  yoyGrowth: "+3.8%",
  avgDaysOnMarket: 28,
  rentalYield: "4.6%",
  crimeRate: "Below average",
  schools: '3 rated "Outstanding" within 1 mile',
};

const badge = (text, bg, color) => (
  <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{text}</span>
);

function PropertyScreen() {
  const [searchValue, setSearchValue] = useState(PROPERTY.address);
  const [showPlanning, setShowPlanning] = useState(false);

  const avgComparable = Math.round(COMPARABLES.reduce((s, c) => s + c.price, 0) / COMPARABLES.length);

  // BarChart (from MIScreen pattern)
  const BarChart = ({ data, color, height = 80, labelKey = "label", valueKey = "v", unit = "" }) => {
    const max = Math.max(...data.map(d => d[valueKey]), 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{unit}{d[valueKey]}k</div>
            <div style={{ width: "100%", background: `${color}20`, borderRadius: "4px 4px 0 0", position: "relative", height: height - 28 }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0",
                background: color, height: `${(d[valueKey] / max) * 100}%`, transition: "height 0.4s" }} />
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", lineHeight: 1.2 }}>{d[labelKey]}</div>
          </div>
        ))}
      </div>
    );
  };

  const detailRow = (label, value, extra) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.borderLight}` }}>
      <span style={{ fontSize: 13, color: T.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>{value}{extra}</span>
    </div>
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Property Intelligence</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Zoopla &amp; Rightmove integration — automated valuation and comparable analysis</p>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 9, padding: "0 12px", background: T.card }}>
            <span style={{ color: T.textMuted, marginRight: 8 }}>{Ico.search(16)}</span>
            <input
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Enter postcode or full address"
              style={{ flex: 1, padding: "10px 0", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, color: T.text, background: "transparent" }}
            />
          </div>
          <Btn primary icon="search">Search</Btn>
        </div>
      </Card>

      {/* Valuation Summary KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Afin AVM"           value={"£495,000"}  sub="AI automated valuation"     color={T.primary} />
        <KPICard label="Zoopla Estimate"    value={"£488,000"}  sub="87% confidence"             color="#7B61FF" />
        <KPICard label="Rightmove Estimate" value={"£492,000"}  sub="based on comparables"       color="#00DEB6" />
        <KPICard label="Surveyor Report"    value={"£485,000"}  sub="RICS Level 3"               color={T.warning} />
        <KPICard label="Avg Comparable"     value={`£${avgComparable.toLocaleString()}`} sub="6 comparable sales" color={T.accent} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Zoopla Integration */}
        <Card style={{ borderTop: "4px solid #7B61FF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ background: "#7B61FF", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Zoopla</div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Property Estimate</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginBottom: 4 }}>{"£"}488,000</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Range: {"£"}465,000 — {"£"}510,000</div>

          {detailRow("12-month change", "+4.2%", badge("+£{19,600}", T.successBg, T.success))}
          {detailRow("5-year change", "+12.1%", badge("+£{52,600}", T.successBg, T.success))}
          {detailRow("Zed-Index (BS1)", "£412,000")}
          {detailRow("Last listed", "Sep 2019 at £385,000")}
          {detailRow("Area demand", "High", badge("Avg 22 days to sell", T.successBg, T.success))}
        </Card>

        {/* Rightmove Comparable Sales */}
        <Card style={{ borderTop: "4px solid #00DEB6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ background: "#00DEB6", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Rightmove</div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Comparable Sales</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Address","Type","Beds","Sale Price","Date","Distance"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 6px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARABLES.map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{c.address}</td>
                    <td style={{ padding: "8px 6px" }}>{c.type}</td>
                    <td style={{ padding: "8px 6px" }}>{c.beds}</td>
                    <td style={{ padding: "8px 6px", fontWeight: 600 }}>{"£"}{c.price.toLocaleString()}</td>
                    <td style={{ padding: "8px 6px", color: T.textMuted }}>{c.date}</td>
                    <td style={{ padding: "8px 6px", color: T.textMuted }}>{c.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "10px 6px", borderTop: `2px solid ${T.border}`, fontSize: 12 }}>
            <span style={{ fontWeight: 700 }}>Avg comparable price</span>
            <span style={{ fontWeight: 700 }}>{"£"}{avgComparable.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 6px", fontSize: 12, color: T.textMuted }}>
            <span>Avg price per sq ft</span>
            <span style={{ fontWeight: 600, color: T.text }}>{"£"}{Math.round(avgComparable / 1060)}/sq ft</span>
          </div>
        </Card>
      </div>

      {/* Price History */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Price History</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Estimated property value over time ({"£"}k)</div>
        <BarChart data={PRICE_HISTORY} color={T.primary} height={120} unit={"£"} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Property Details & Risk */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Property Details &amp; Risk</div>
          {detailRow("Property type", PROPERTY.type)}
          {detailRow("Build year", PROPERTY.buildYear)}
          {detailRow("Tenure", PROPERTY.tenure)}
          {detailRow("Floor area (est)", PROPERTY.floorArea)}
          {detailRow("EPC Rating", `${PROPERTY.epcRating} — ${PROPERTY.epcScore}`, badge(PROPERTY.epcRating, T.warningBg, T.warning))}
          {detailRow("Council Tax Band", PROPERTY.councilTaxBand)}
          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: 700 }}>Environmental Risk</div>
          {detailRow("Flood risk", PROPERTY.floodRisk, badge("Negligible", T.successBg, T.success))}
          {detailRow("Subsidence risk", PROPERTY.subsidenceRisk, badge("Low", T.successBg, T.success))}
          {detailRow("Conservation area", "No")}
          {detailRow("Listed building", "No")}
          <div style={{ marginTop: 12 }}>
            <div
              onClick={() => setShowPlanning(!showPlanning)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", cursor: "pointer", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ fontSize: 13, color: T.textMuted }}>Planning applications (500m)</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>
                {PLANNING_APPS.length} found {showPlanning ? "▲" : "▼"}
              </span>
            </div>
            {showPlanning && (
              <div style={{ padding: "12px 0" }}>
                {PLANNING_APPS.map((p, i) => (
                  <div key={i} style={{ padding: "8px 0", borderBottom: i < PLANNING_APPS.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.ref} — {p.address}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>{p.description}</div>
                    <div style={{ fontSize: 11, display: "flex", gap: 8 }}>
                      {badge(p.status, p.status === "Approved" ? T.successBg : T.warningBg, p.status === "Approved" ? T.success : T.warning)}
                      <span style={{ color: T.textMuted }}>{p.date} — {p.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Area Analytics */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Area Analytics — BS1</div>
          {detailRow("Avg price (BS1)", AREA_STATS.avgPrice)}
          {detailRow("YoY growth", AREA_STATS.yoyGrowth, badge("+3.8%", T.successBg, T.success))}
          {detailRow("Avg days on market", AREA_STATS.avgDaysOnMarket)}
          {detailRow("Rental yield estimate", AREA_STATS.rentalYield)}
          {detailRow("Crime rate", AREA_STATS.crimeRate, badge("Low", T.successBg, T.success))}
          {detailRow("Schools (Outstanding)", AREA_STATS.schools)}
        </Card>
      </div>

      {/* AI Commentary */}
      <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.accent}40` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ color: T.accent, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(20)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: T.primary }}>AI Property Commentary</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
              Property value of {"£"}485,000–{"£"}495,000 is supported by 6 comparable sales averaging {"£"}{avgComparable.toLocaleString()}.
              The 3% premium is consistent with the property's superior condition rating and freehold tenure.
              BS1 is a strong market with 28 avg days to sell. No environmental risks detected.
              EPC C is typical for 1990s build — no impact on lending.
              <span style={{ fontWeight: 700 }}> Recommend: Accept surveyor value of {"£"}485,000 for LTV calculation.</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PropertyScreen;
