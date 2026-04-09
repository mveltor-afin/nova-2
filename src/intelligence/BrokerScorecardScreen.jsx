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

const BROKERS = [
  { rank: 1, firm: "Pinnacle Mortgages Ltd", volume: 4200000, cases: 38, conversion: 42, kycPass: 96, docQuality: 94, quality: 95, trend: "up" },
  { rank: 2, firm: "Sterling Financial Partners", volume: 3850000, cases: 34, conversion: 40, kycPass: 94, docQuality: 91, quality: 92, trend: "up" },
  { rank: 3, firm: "Apex Broker Group", volume: 3200000, cases: 29, conversion: 38, kycPass: 90, docQuality: 88, quality: 88, trend: "same" },
  { rank: 4, firm: "Meridian Home Finance", volume: 2900000, cases: 26, conversion: 36, kycPass: 92, docQuality: 86, quality: 86, trend: "up" },
  { rank: 5, firm: "Hartwell & Co", volume: 2600000, cases: 24, conversion: 35, kycPass: 88, docQuality: 84, quality: 84, trend: "down" },
  { rank: 6, firm: "Crown Mortgage Solutions", volume: 2100000, cases: 22, conversion: 33, kycPass: 85, docQuality: 80, quality: 80, trend: "same" },
  { rank: 7, firm: "Beacon Financial Services", volume: 1800000, cases: 20, conversion: 31, kycPass: 82, docQuality: 78, quality: 76, trend: "down" },
  { rank: 8, firm: "Northstar Lending", volume: 1500000, cases: 18, conversion: 28, kycPass: 78, docQuality: 74, quality: 72, trend: "down" },
  { rank: 9, firm: "Thames Valley Mortgages", volume: 1200000, cases: 16, conversion: 25, kycPass: 74, docQuality: 70, quality: 68, trend: "down" },
  { rank: 10, firm: "Pacific Home Loans", volume: 950000, cases: 14, conversion: 22, kycPass: 70, docQuality: 65, quality: 62, trend: "down" },
  { rank: 11, firm: "Horizon Brokers", volume: 720000, cases: 11, conversion: 18, kycPass: 65, docQuality: 60, quality: 55, trend: "down" },
];

const DETAIL_MONTHLY = [
  { label: "Nov", v: 4 }, { label: "Dec", v: 3 }, { label: "Jan", v: 5 },
  { label: "Feb", v: 6 }, { label: "Mar", v: 7 }, { label: "Apr", v: 4 },
];

const DETAIL_PRODUCT_MIX = [
  { label: "Fix 2yr", v: 14 }, { label: "Fix 5yr", v: 10 }, { label: "Tracker", v: 8 }, { label: "SVR", v: 6 },
];

const DECLINE_REASONS = [
  { reason: "Affordability", count: 4 },
  { reason: "Credit history", count: 3 },
  { reason: "Incomplete documentation", count: 2 },
  { reason: "Valuation shortfall", count: 1 },
];

const SLA_COMPLIANCE = [
  { stage: "DIP Response (<4h)", pct: 98 },
  { stage: "Full App Acknowledgement (<24h)", pct: 95 },
  { stage: "Offer Issuance (<5d)", pct: 88 },
  { stage: "Completion (<30d)", pct: 82 },
];

const qualityColor = (score) => score >= 85 ? T.success : score >= 70 ? T.warning : T.danger;
const qualityBg = (score) => score >= 85 ? T.successBg : score >= 70 ? T.warningBg : T.dangerBg;
const trendArrow = (t) => t === "up" ? "↑" : t === "down" ? "↓" : "→";
const trendColor = (t) => t === "up" ? T.success : t === "down" ? T.danger : T.textMuted;
const fmtVol = (v) => v >= 1000000 ? `£${(v / 1000000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`;

const thStyle = { textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "8px 12px", borderBottom: `2px solid ${T.border}`, textTransform: "uppercase", letterSpacing: 0.5 };
const tdStyle = { fontSize: 13, padding: "10px 12px", borderBottom: `1px solid ${T.borderLight}`, color: T.text };

function BrokerScorecardScreen() {
  const [selected, setSelected] = useState(null);
  const [flagged, setFlagged] = useState({});

  const broker = selected !== null ? BROKERS[selected] : null;

  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>Broker Scorecard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Performance analytics and quality monitoring across the broker panel</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Active Brokers" value="142" sub="registered panel" color={T.primary} />
        <KPICard label="Avg Conversion" value="34%" sub="DIP to completion" color={T.accent} />
        <KPICard label="Top Broker Volume" value="£4.2M" sub="Pinnacle Mortgages" color="#8B5CF6" />
        <KPICard label="Quality Score Avg" value="82%" sub="across all brokers" color={T.warning} />
      </div>

      {/* League Table */}
      <Card noPad style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>Broker League Table</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Click a row for detailed breakdown</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Firm</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Volume</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Cases</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Conv %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>KYC Pass %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Doc Quality</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Quality Score</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {BROKERS.map((b, i) => (
                <tr key={i} onClick={() => setSelected(i)}
                  style={{ cursor: "pointer", background: selected === i ? T.primaryLight : flagged[i] ? T.dangerBg : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (selected !== i) e.currentTarget.style.background = T.primaryLight; }}
                  onMouseLeave={e => { if (selected !== i) e.currentTarget.style.background = flagged[i] ? T.dangerBg : "transparent"; }}>
                  <td style={{ ...tdStyle, fontWeight: 600, width: 40 }}>{b.rank}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {b.firm}
                    {flagged[i] && <span style={{ marginLeft: 8, fontSize: 10, background: T.dangerBg, color: T.danger, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>FLAGGED</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmtVol(b.volume)}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.cases}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.conversion}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.kycPass}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.docQuality}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: qualityBg(b.quality), color: qualityColor(b.quality) }}>
                      {b.quality}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontSize: 16, fontWeight: 700, color: trendColor(b.trend) }}>{trendArrow(b.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Panel */}
      {broker && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{broker.firm}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Rank #{broker.rank} — Quality Score: {broker.quality}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {broker.quality < 70 && !flagged[selected] && (
                <Btn small danger onClick={() => setFlagged(p => ({ ...p, [selected]: true }))}>
                  {Ico.alert(14)} Flag for Review
                </Btn>
              )}
              <Btn small ghost onClick={() => setSelected(null)}>Close</Btn>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Monthly Submissions</div>
              <BarChart data={DETAIL_MONTHLY} color={T.primary} height={90} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Product Mix</div>
              <BarChart data={DETAIL_PRODUCT_MIX} color={T.accent} height={90} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Decline Reasons</div>
              {DECLINE_REASONS.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{d.reason}</span>
                  <span style={{ fontWeight: 600, color: T.text }}>{d.count}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>SLA Compliance</div>
              {SLA_COMPLIANCE.map((s, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: T.textSecondary }}>{s.stage}</span>
                    <span style={{ fontWeight: 700, color: s.pct >= 95 ? T.success : s.pct >= 85 ? T.warning : T.danger }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: T.borderLight, borderRadius: 3 }}>
                    <div style={{ height: 5, borderRadius: 3, background: s.pct >= 95 ? T.success : s.pct >= 85 ? T.warning : T.danger, width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BrokerScorecardScreen;
