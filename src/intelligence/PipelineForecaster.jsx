import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const fmt = (n) => "£" + Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });

const SLA_CASES = [
  { id: "AFN-00128", customer: "Sarah Chen", stage: "KYC In Progress", days: 6, deadline: "8 Apr", predicted: "7 Apr", risk: "High", reason: "Awaiting docs from broker — 3 follow-ups sent" },
  { id: "AFN-00131", customer: "David Thompson", stage: "Valuation", days: 9, deadline: "9 Apr", predicted: "11 Apr", risk: "High", reason: "Valuation delayed — surveyor capacity in Bristol area" },
  { id: "AFN-00135", customer: "Priya Patel", stage: "KYC In Progress", days: 4, deadline: "10 Apr", predicted: "10 Apr", risk: "Medium", reason: "Employer verification letter outstanding — chaser sent yesterday" },
  { id: "AFN-00142", customer: "Mark Williams", stage: "Underwriting", days: 3, deadline: "11 Apr", predicted: "12 Apr", risk: "Medium", reason: "Complex income — self-employed with 3 income streams, SA302 under review" },
  { id: "AFN-00147", customer: "Lisa Johnson", stage: "Submitted", days: 5, deadline: "12 Apr", predicted: "11 Apr", risk: "Medium", reason: "Missing bank statements for months 2-3 — broker notified" },
];

const WEEKLY_FORECAST = [
  { week: "7-11 Apr", value: 420000, cases: 2, conf: 510000 },
  { week: "14-18 Apr", value: 510000, cases: 2, conf: 640000 },
  { week: "21-25 Apr", value: 660000, cases: 3, conf: 780000 },
  { week: "28 Apr-2 May", value: 510000, cases: 2, conf: 620000 },
];

const FUNNEL_STAGES = [
  { stage: "DIP", pct: 100, count: 48, value: "£14.2M", dropReason: null },
  { stage: "Submitted", pct: 72, count: 35, value: "£10.2M", dropReason: "28% drop — incomplete documents and broker abandonment" },
  { stage: "KYC", pct: 65, count: 31, value: "£9.3M", dropReason: "7% drop — identity verification failures and address gaps" },
  { stage: "Underwriting", pct: 58, count: 28, value: "£8.4M", dropReason: "7% drop — above historical 4%. Root cause: 3 cases awaiting employer verification letters." },
  { stage: "Offer", pct: 42, count: 20, value: "£6.1M", dropReason: "16% drop — affordability fails, valuation shortfalls" },
  { stage: "Completion", pct: 34, count: 16, value: "£4.9M", dropReason: "8% drop — conveyancing delays and client withdrawals" },
];

const RECOMMENDATIONS = [
  { impact: "High", action: "Contact broker John Watson", detail: "2 cases stalled at doc upload for >5 days. Historical pattern: phone call resolves 80% of doc delays within 24 hours.", icon: "send" },
  { impact: "High", action: "Re-prioritise AFN-00135", detail: "KYC verification due to expire in 48 hours. If expired, full re-check required (adds 5 days).", icon: "alert" },
  { impact: "Medium", action: "Reassign 3 cases from James Mitchell", detail: "James at 110% capacity this week. Amir Hassan has bandwidth for 3 additional cases without SLA risk.", icon: "assign" },
  { impact: "Medium", action: "Escalate Bristol valuation backlog", detail: "3 cases pending valuation in BS postcode area. Alternative surveyor panel member available — would reduce wait from 8 days to 3.", icon: "zap" },
  { impact: "Low", action: "Schedule broker webinar on doc requirements", detail: "42% of doc rejections this month are from the same 4 brokers. Training session could reduce rework by an estimated 30%.", icon: "users" },
];

const TEAM_WORKLOAD = [
  { name: "James Mitchell", current: 12, capacity: 10, pctUsed: 120 },
  { name: "Amir Hassan", current: 7, capacity: 10, pctUsed: 70 },
  { name: "Sophie Clarke", current: 9, capacity: 10, pctUsed: 90 },
  { name: "Tom Bradley", current: 8, capacity: 10, pctUsed: 80 },
];

function PipelineForecaster() {
  const [expandedRec, setExpandedRec] = useState(null);
  const maxBarValue = Math.max(...WEEKLY_FORECAST.map((w) => w.conf));

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {Ico.chart(24)}
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Pipeline Forecaster</h1>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, background: T.primaryLight, padding: "3px 10px", borderRadius: 12, marginLeft: 8 }}>Nova AI</span>
        </div>
        <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>AI-powered pipeline prediction, SLA monitoring, and capacity planning</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        <KPICard label="Predicted Completions" value="£2.1M" sub="±15% confidence" color={T.primary} />
        <KPICard label="SLA Breach Risk" value="3" sub="cases at risk" color={T.danger} />
        <KPICard label="Avg Days to Completion" value="18.4" sub="vs 21.2 last month" color={T.accent} />
        <KPICard label="Conversion Rate Forecast" value="34%" sub="DIP to Completion" color={T.warning} />
      </div>

      {/* SLA Breach Predictions */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          {Ico.alert(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>SLA Breach Predictions</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: T.dangerBg, color: T.danger, marginLeft: 4 }}>3 at risk</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Case ID", "Customer", "Current Stage", "Days", "SLA Deadline", "Predicted", "Risk", "Reason", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontWeight: 700, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLA_CASES.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "10px 10px", fontWeight: 700, color: T.primary, whiteSpace: "nowrap" }}>{c.id}</td>
                  <td style={{ padding: "10px 10px", fontWeight: 600, whiteSpace: "nowrap" }}>{c.customer}</td>
                  <td style={{ padding: "10px 10px", whiteSpace: "nowrap" }}>
                    <span style={{ background: T.primaryLight, color: T.primary, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{c.stage}</span>
                  </td>
                  <td style={{ padding: "10px 10px", fontWeight: 600 }}>{c.days}</td>
                  <td style={{ padding: "10px 10px", whiteSpace: "nowrap" }}>{c.deadline}</td>
                  <td style={{ padding: "10px 10px", whiteSpace: "nowrap", fontWeight: 600, color: c.risk === "High" ? T.danger : T.warning }}>{c.predicted}</td>
                  <td style={{ padding: "10px 10px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: c.risk === "High" ? T.dangerBg : T.warningBg,
                      color: c.risk === "High" ? T.danger : T.warning,
                    }}>{c.risk}</span>
                  </td>
                  <td style={{ padding: "10px 10px", fontSize: 11, color: T.textSecondary, maxWidth: 260 }}>{c.reason}</td>
                  <td style={{ padding: "10px 10px" }}>
                    <Btn small primary>Intervene</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Completion Forecast */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          {Ico.chart(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>Completion Forecast — Next 4 Weeks</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end", height: 200, padding: "0 10px" }}>
          {WEEKLY_FORECAST.map((w, i) => {
            const barH = (w.value / maxBarValue) * 160;
            const confH = (w.conf / maxBarValue) * 160;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>{fmt(w.value)}</div>
                <div style={{ position: "relative", width: "100%", maxWidth: 80, height: 160, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  {/* Confidence band */}
                  <div style={{
                    position: "absolute", bottom: 0, width: "100%", height: confH,
                    background: "rgba(26,74,84,0.06)", borderRadius: "6px 6px 0 0",
                  }} />
                  {/* Main bar */}
                  <div style={{
                    position: "relative", width: "60%", height: barH,
                    background: `linear-gradient(180deg, ${T.primary}, ${T.primaryDark})`,
                    borderRadius: "6px 6px 0 0",
                  }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary }}>{w.week}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{w.cases} cases</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 14, fontSize: 11, color: T.textMuted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: T.primary, display: "inline-block" }} /> Predicted
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(26,74,84,0.1)", display: "inline-block" }} /> Confidence Band
          </span>
        </div>
      </Card>

      {/* Conversion Funnel */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          {Ico.products(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>Conversion Funnel (with Predicted Drop-off)</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {FUNNEL_STAGES.map((s, i) => {
            const widthPct = 8 + s.pct * 0.88;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  height: 48, borderRadius: i === 0 ? "8px 0 0 8px" : i === FUNNEL_STAGES.length - 1 ? "0 8px 8px 0" : 0,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                  opacity: 0.2 + (s.pct / 100) * 0.8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1 }}>{s.pct}%</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: T.text }}>{s.stage}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.count} cases</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{s.value}</div>
              </div>
            );
          })}
        </div>
        {/* Drop-off insights */}
        {FUNNEL_STAGES.filter((s) => s.dropReason).map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", marginBottom: 6,
            background: s.stage === "Underwriting" ? T.warningBg : T.primaryLight,
            borderRadius: 8, fontSize: 12,
            border: s.stage === "Underwriting" ? `1px solid ${T.warningBorder}` : "none",
          }}>
            <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.sparkle(14)}</span>
            <span>
              <strong>{s.stage}:</strong> {s.dropReason}
            </span>
          </div>
        ))}
      </Card>

      {/* Capacity Planning */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {Ico.users(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>Capacity Planning</span>
        </div>
        <div style={{
          background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))",
          border: `1px solid ${T.primaryGlow}`, borderRadius: 10, padding: 16, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {Ico.sparkle(16)}
            <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textSecondary, margin: 0 }}>
              Based on current pipeline velocity, the underwriting team will hit <strong>95% capacity by Thursday</strong>. Consider:
              (1) redistributing 3 cases from James Mitchell to Amir Hassan,
              (2) deferring non-urgent referrals to next week.
            </p>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Team Workload Forecast</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEAM_WORKLOAD.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 140, fontSize: 13, fontWeight: 600 }}>{t.name}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: T.borderLight, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min(t.pctUsed, 100)}%`, borderRadius: 4,
                  background: t.pctUsed > 100 ? T.danger : t.pctUsed > 85 ? T.warning : T.accent,
                }} />
              </div>
              <div style={{ width: 80, fontSize: 12, textAlign: "right" }}>
                <span style={{ fontWeight: 700, color: t.pctUsed > 100 ? T.danger : t.pctUsed > 85 ? T.warning : T.text }}>{t.current}</span>
                <span style={{ color: T.textMuted }}>/{t.capacity}</span>
              </div>
              <div style={{
                width: 40, fontSize: 11, fontWeight: 700, textAlign: "right",
                color: t.pctUsed > 100 ? T.danger : t.pctUsed > 85 ? T.warning : T.accent,
              }}>{t.pctUsed}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          {Ico.sparkle(20)}
          <span style={{ fontSize: 16, fontWeight: 700 }}>AI Recommendations</span>
          <span style={{ fontSize: 11, color: T.textMuted }}>Ranked by impact</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RECOMMENDATIONS.map((r, i) => (
            <div key={i} style={{
              border: `1px solid ${r.impact === "High" ? T.dangerBorder : r.impact === "Medium" ? T.warningBorder : T.border}`,
              borderRadius: 10, padding: 16,
              background: r.impact === "High" ? "rgba(255,107,97,0.03)" : r.impact === "Medium" ? "rgba(255,191,0,0.03)" : T.card,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: T.primary }}>{Ico[r.icon]?.(16)}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.action}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: r.impact === "High" ? T.dangerBg : r.impact === "Medium" ? T.warningBg : T.primaryLight,
                    color: r.impact === "High" ? T.danger : r.impact === "Medium" ? T.warning : T.primary,
                  }}>{r.impact}</span>
                </div>
                <Btn small primary>Take Action</Btn>
              </div>
              <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6, paddingLeft: 26 }}>{r.detail}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default PipelineForecaster;
