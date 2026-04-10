import { T, Ico } from "../shared/tokens";
import { Card, KPICard } from "../shared/primitives";

const funnel = [
  { stage: "New Enquiry", count: 12, pct: 100 },
  { stage: "Eligible", count: 8, pct: 67 },
  { stage: "DIP Run", count: 6, pct: 50 },
  { stage: "Application", count: 5, pct: 42 },
  { stage: "Disbursed", count: 3, pct: 25 },
];

const leaderboard = [
  { name: "Rachel Adams", pipeline: "£4.1M", enquiries: 14, current: false },
  { name: "Sarah Thompson", pipeline: "£3.8M", enquiries: 12, current: true },
  { name: "Mike Chen", pipeline: "£2.9M", enquiries: 9, current: false },
  { name: "David Park", pipeline: "£1.6M", enquiries: 5, current: false },
];

const byStage = [
  { stage: "New", count: 2, value: "£860k", color: T.primary },
  { stage: "Eligible / DIP", count: 4, value: "£1.4M", color: T.accent },
  { stage: "Application", count: 3, value: "£1.1M", color: "#7C3AED" },
  { stage: "UW Review", count: 2, value: "£770k", color: T.warning },
  { stage: "Offered", count: 1, value: "£350k", color: T.success },
];

function BDMPipeline() {
  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, marginBottom: 4 }}>Pipeline</h1>
        <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>Conversion funnel, leaderboard and stage breakdown for your patch</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Pipeline Value" value="£3.8M" sub="across 12 enquiries" color={T.primary} />
        <KPICard label="Conversion Rate" value="42%" sub="+5% vs last month" color={T.accent} />
        <KPICard label="Avg. Deal Size" value="£316k" sub="+£12k vs last month" color="#7C3AED" />
        <KPICard label="Cycle Time" value="14 days" sub="DIP → Offer" color={T.success} />
      </div>

      {/* Two-column: Funnel + Leaderboard */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
        {/* Conversion funnel */}
        <Card style={{ flex: 2, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.chart(18)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Conversion Funnel</span>
          </div>
          {funnel.map((s) => (
            <div key={s.stage} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: 600 }}>{s.stage}</span>
                <span style={{ fontWeight: 700, color: T.text }}>{s.count} <span style={{ color: T.textMuted, fontWeight: 500 }}>· {s.pct}%</span></span>
              </div>
              <div style={{ height: 10, background: T.borderLight, borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, width: `${s.pct}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: 12, background: T.warningBg, borderRadius: 8, border: `1px solid ${T.warningBorder}`, fontSize: 12, color: "#92400E", fontWeight: 600 }}>
            ⚠ Drop-off at DIP → Application: 17%. Consider broker training session.
          </div>
        </Card>

        {/* Leaderboard */}
        <Card style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.chart(18)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>BDM Leaderboard</span>
          </div>
          {leaderboard.map((m, i) => (
            <div key={m.name} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, marginBottom: 6,
              background: m.current ? T.primaryLight : "transparent",
              border: m.current ? `1.5px solid ${T.primary}` : "1px solid transparent",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : T.borderLight,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: i < 3 ? "#fff" : T.textMuted }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.current ? T.primary : T.text }}>
                  {m.name}
                  {m.current && <span style={{ fontSize: 9, marginLeft: 6, padding: "1px 6px", borderRadius: 4, background: T.primary, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>You</span>}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{m.pipeline} · {m.enquiries} enquiries</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 12, background: T.primaryLight, borderRadius: 8, fontSize: 12, color: T.primary, fontWeight: 600 }}>
            🎯 You're £300k away from #1 — close 1 more case to overtake Rachel.
          </div>
        </Card>
      </div>

      {/* Pipeline by stage breakdown */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.loans(18)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>Pipeline by Stage</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {byStage.map(s => (
            <div key={s.stage} style={{ flex: 1, padding: 14, borderRadius: 12, background: `${s.color}10`, border: `1px solid ${s.color}30` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{s.stage}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 2 }}>{s.count}</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default BDMPipeline;
