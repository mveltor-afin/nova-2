import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const BarChart = ({ data, color, height = 80, labelKey = "label", valueKey = "v", unit = "" }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{unit}{d[valueKey]}</div>
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

const LTV_DATA = [
  { label: "<60%", v: 45 },
  { label: "60-70%", v: 38 },
  { label: "70-80%", v: 28 },
  { label: "80-90%", v: 12 },
  { label: ">90%", v: 3 },
];

const RATE_EXPIRY = [
  { label: "Q2 2026", v: 14 },
  { label: "Q3 2026", v: 8 },
  { label: "Q4 2026", v: 12 },
  { label: "Q1 2027", v: 22 },
];

const GEO_DATA = [
  { region: "London & South East", pct: 34 },
  { region: "North West", pct: 18 },
  { region: "West Midlands", pct: 14 },
  { region: "Yorkshire", pct: 12 },
  { region: "East of England", pct: 9 },
];

const PRODUCT_MIX = [
  { product: "Fix 2yr", count: 48, pct: 38, color: T.primary },
  { product: "Fix 5yr", count: 36, pct: 29, color: "#8B5CF6" },
  { product: "Tracker", count: 26, pct: 21, color: T.accent },
  { product: "SVR", count: 16, pct: 12, color: T.warning },
];

const ARREARS_DATA = [
  { band: "0-30 days", accounts: 6, value: "£312k" },
  { band: "30-60 days", accounts: 3, value: "£178k" },
  { band: "60-90 days", accounts: 1, value: "£65k" },
  { band: "90+ days", accounts: 1, value: "£42k" },
];

const thStyle = { textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "8px 12px", borderBottom: `2px solid ${T.border}`, textTransform: "uppercase", letterSpacing: 0.5 };
const tdStyle = { fontSize: 13, padding: "10px 12px", borderBottom: `1px solid ${T.borderLight}`, color: T.text };

function PortfolioRiskScreen() {
  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>Portfolio Risk Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Book composition, concentration risk and arrears monitoring</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Total Book" value="£45.2M" sub="126 accounts" color={T.primary} />
        <KPICard label="Avg LTV" value="71%" sub="weighted by balance" color={T.accent} />
        <KPICard label="Wtd Avg Rate" value="4.82%" sub="across all products" color="#8B5CF6" />
        <KPICard label="Impairment Provision" value="£186k" sub="IFRS 9 ECL" color={T.warning} />
        <KPICard label="90+ Day Arrears" value="0.8%" sub="1 account" color={T.danger} />
      </div>

      {/* LTV Distribution & Rate Expiry */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>LTV Distribution</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Account count by LTV band</div>
          <BarChart data={LTV_DATA} color={T.primary} height={110} />
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>Rate Expiry Curve</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Accounts by expiry quarter</div>
          <BarChart data={RATE_EXPIRY} color={T.warning} height={110} />
        </Card>
      </div>

      {/* Geographic Concentration & Product Mix */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.text }}>Geographic Concentration</div>
          {GEO_DATA.map((g, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: T.textSecondary }}>{g.region}</span>
                <span style={{ fontWeight: 700, color: T.text }}>{g.pct}%</span>
              </div>
              <div style={{ height: 6, background: T.borderLight, borderRadius: 3 }}>
                <div style={{ height: 6, borderRadius: 3, background: T.primary, width: `${g.pct}%`, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.text }}>Product Mix</div>
          {PRODUCT_MIX.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: T.text }}>{p.product}</span>
                  <span style={{ color: T.textMuted }}>{p.count} accounts ({p.pct}%)</span>
                </div>
                <div style={{ height: 5, background: T.borderLight, borderRadius: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, background: p.color, width: `${p.pct}%`, transition: "width 0.4s" }} />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Arrears Ageing & Stress Test */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card noPad>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>Arrears Ageing</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Outstanding by days past due</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Band</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Accounts</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {ARREARS_DATA.map((a, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{a.band}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{a.accounts}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: a.band === "90+ days" ? T.danger : T.text }}>{a.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.warningBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.warning }}>
              {Ico.alert(20)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: T.text }}>Stress Test Summary</div>
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
                Under a <strong>+2% rate scenario</strong>, 4 accounts move from performing to watchlist.
                Estimated additional impairment provision of £48k. No accounts breach covenant thresholds.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <Btn small icon="download">Export Report</Btn>
                <Btn small ghost>View Details</Btn>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PortfolioRiskScreen;
