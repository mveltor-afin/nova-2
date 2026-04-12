import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── Mock Data ─────────────────────────────────────────── */

const STAGES = [
  "Application Received",
  "ID&V Check",
  "Income Verification",
  "Valuation",
  "Underwriting",
  "Offer",
  "Completion",
];

const TIME_BANDS = ["<2h", "2-4h", "4-8h", "8-24h", ">24h"];

const HEATMAP_DATA = [
  [2, 1, 0, 0, 0],
  [3, 2, 1, 0, 0],
  [1, 3, 2, 1, 1],
  [0, 1, 2, 1, 0],
  [2, 3, 1, 2, 1],
  [1, 1, 0, 0, 0],
  [4, 2, 1, 0, 0],
];

const HEATMAP_COLORS = ["#31B897", "#6ED4B8", "#FFBF00", "#FF9F43", "#FF6B61"];

const FUNNEL_DATA = [
  { stage: "Application Received", cases: 3, avgWait: 1.2, color: T.success },
  { stage: "ID&V Check", cases: 6, avgWait: 3.1, color: T.success },
  { stage: "Income Verification", cases: 8, avgWait: 8.4, color: T.warning, bottleneck: true },
  { stage: "Valuation", cases: 4, avgWait: 12.1, color: "#FF9F43" },
  { stage: "Underwriting", cases: 9, avgWait: 6.2, color: T.warning },
  { stage: "Offer", cases: 2, avgWait: 2.0, color: T.success },
  { stage: "Completion", cases: 7, avgWait: 1.5, color: T.success },
];

const ESCALATION_QUEUE = [
  { id: "AFN-2025-00891", customer: "Margaret Thornton", stage: "Underwriting", timeInStage: "26h 14m", risk: "High", action: "escalate" },
  { id: "AFN-2026-00119", customer: "David Okoro", stage: "Income Verification", timeInStage: "22h 03m", risk: "High", action: "escalate" },
  { id: "AFN-2026-00187", customer: "Sanjay Gupta", stage: "Valuation", timeInStage: "18h 45m", risk: "Medium", action: "escalate" },
  { id: "AFN-2026-00203", customer: "Claire Brennan", stage: "Income Verification", timeInStage: "12h 30m", risk: "Medium", action: "monitor" },
  { id: "AFN-2026-00215", customer: "Patrick Liu", stage: "Underwriting", timeInStage: "9h 58m", risk: "Low", action: "monitor" },
];

const SQUAD_DATA = [
  { name: "Sarah Thompson", role: "Underwriter", active: 5, max: 6 },
  { name: "Tom Williams", role: "Underwriter", active: 6, max: 6 },
  { name: "Lucy Chen", role: "Ops", active: 3, max: 5 },
  { name: "James Miller", role: "Ops", active: 5, max: 5 },
  { name: "Ahmed Hassan", role: "Customer Care", active: 2, max: 4 },
  { name: "Rachel Adams", role: "Customer Care", active: 4, max: 4 },
];

const ACTIVITY_FEED = [
  { time: "10:42", icon: "check", text: "Income verification completed for", caseId: "AFN-2026-00142", type: "completed" },
  { time: "10:38", icon: "file", text: "Valuation report received for", caseId: "AFN-2026-00201", type: "info" },
  { time: "10:31", icon: "alert", text: "SLA breach alert: in Underwriting for 26h -", caseId: "AFN-2025-00891", type: "breach" },
  { time: "10:25", icon: "zap", text: "Auto-escalation triggered: income docs overdue -", caseId: "AFN-2026-00119", type: "breach" },
  { time: "10:18", icon: "assign", text: "Case reassigned to Sarah Thompson -", caseId: "AFN-2026-00178", type: "info" },
  { time: "10:12", icon: "check", text: "ID&V check passed for", caseId: "AFN-2026-00210", type: "completed" },
  { time: "10:05", icon: "clock", text: "SLA warning: approaching 8h in Valuation -", caseId: "AFN-2026-00187", type: "warning" },
  { time: "09:58", icon: "send", text: "Offer letter dispatched to customer for", caseId: "AFN-2026-00156", type: "completed" },
  { time: "09:50", icon: "alert", text: "Valuation discrepancy flagged for manual review -", caseId: "AFN-2026-00193", type: "warning" },
  { time: "09:44", icon: "check", text: "Completion confirmed - funds released for", caseId: "AFN-2026-00098", type: "completed" },
];

/* ── Styles ─────────────────────────────────────────────── */

const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text };

const FEED_BORDER = { completed: T.success, warning: T.warning, breach: T.danger, info: "#3B82F6" };

/* ── Helpers ────────────────────────────────────────────── */

const riskBadge = (risk) => {
  const map = { High: { bg: T.dangerBg, color: T.danger }, Medium: { bg: T.warningBg, color: T.warning }, Low: { bg: T.successBg, color: T.success } };
  const s = map[risk] || map.Low;
  return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{risk}</span>;
};

const squadStatus = (active, max) => {
  const pct = (active / max) * 100;
  if (pct >= 100) return { label: "At Capacity", bg: T.dangerBg, color: T.danger };
  if (pct >= 90) return { label: "Overloaded", bg: T.dangerBg, color: T.danger };
  if (pct >= 70) return { label: "Busy", bg: T.warningBg, color: T.warning };
  return { label: "Available", bg: T.successBg, color: T.success };
};

const capacityColor = (active, max) => {
  const pct = (active / max) * 100;
  if (pct > 90) return T.danger;
  if (pct >= 70) return T.warning;
  return T.success;
};

/* ── Component ──────────────────────────────────────────── */

export default function CommandCentre() {
  const [selectedCell, setSelectedCell] = useState(null);

  const maxFunnel = Math.max(...FUNNEL_DATA.map(d => d.cases));

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.navy }}>
          {Ico.dashboard(24)} Operations Command Centre
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Real-time operational intelligence — SLA tracking, bottleneck detection, squad utilisation
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Cases in Flight" value="47" color={T.primary} />
        <KPICard label="Within SLA" value="39" color={T.success} sub="83% of active" />
        <KPICard label="SLA Breaching" value="5" color={T.warning} sub="Action required" />
        <KPICard label="SLA Breached" value="3" color={T.danger} sub="Escalated" />
        <KPICard label="Avg Cycle Time" value="4.2 days" color={T.primary} sub="Target: 5 days" />
        <KPICard label="Squad Utilisation" value="78%" color={T.accent} sub="6 active members" />
      </div>

      {/* Row 1: SLA Heatmap + Bottleneck Funnel */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>

        {/* SLA Heatmap */}
        <Card style={{ flex: "3 1 500px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
              {Ico.chart(18)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>SLA Heatmap</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Cases by stage and time in stage</div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            {/* Column Headers */}
            <div style={{ display: "grid", gridTemplateColumns: "160px repeat(5, 48px)", gap: 4, marginBottom: 4 }}>
              <div />
              {TIME_BANDS.map(band => (
                <div key={band} style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textAlign: "center", letterSpacing: 0.3 }}>{band}</div>
              ))}
            </div>

            {/* Rows */}
            {STAGES.map((stage, ri) => (
              <div key={stage} style={{ display: "grid", gridTemplateColumns: "160px repeat(5, 48px)", gap: 4, marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {stage}
                </div>
                {HEATMAP_DATA[ri].map((count, ci) => {
                  const isSelected = selectedCell && selectedCell[0] === ri && selectedCell[1] === ci;
                  return (
                    <div
                      key={ci}
                      onClick={() => setSelectedCell(isSelected ? null : [ri, ci])}
                      style={{
                        width: 48, height: 48, borderRadius: 6,
                        background: count === 0 ? "#F3F2ED" : HEATMAP_COLORS[ci],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: count === 0 ? T.textMuted : "#fff",
                        cursor: "pointer",
                        outline: isSelected ? `3px solid ${T.primary}` : "none",
                        outlineOffset: -1,
                        opacity: count === 0 ? 0.6 : 1,
                        transition: "outline 0.15s, transform 0.15s",
                        transform: isSelected ? "scale(1.08)" : "scale(1)",
                      }}
                    >
                      {count}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Time:</span>
            {TIME_BANDS.map((band, i) => (
              <div key={band} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: HEATMAP_COLORS[i] }} />
                <span style={{ fontSize: 10, color: T.textMuted }}>{band}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Bottleneck Funnel */}
        <Card style={{ flex: "2 1 320px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
              {Ico.alert(18)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Bottleneck Funnel</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Where cases are getting stuck</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FUNNEL_DATA.map((item) => {
              const widthPct = Math.max((item.cases / maxFunnel) * 100, 15);
              return (
                <div
                  key={item.stage}
                  style={{
                    borderLeft: item.bottleneck ? `4px solid ${T.danger}` : "4px solid transparent",
                    paddingLeft: 12,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{item.stage}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.bottleneck && (
                        <span style={{
                          background: T.dangerBg, color: T.danger, padding: "2px 8px", borderRadius: 4,
                          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                        }}>
                          BOTTLENECK
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: T.textMuted }}>{item.cases} cases</span>
                    </div>
                  </div>
                  <div style={{ background: "#F3F2ED", borderRadius: 6, height: 24, overflow: "hidden" }}>
                    <div style={{
                      width: `${widthPct}%`, height: "100%", borderRadius: 6,
                      background: item.color, display: "flex", alignItems: "center", justifyContent: "flex-end",
                      paddingRight: 8, transition: "width 0.3s",
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                        avg {item.avgWait}h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 2: Auto-Escalation Queue + Squad Utilisation */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>

        {/* Auto-Escalation Queue */}
        <Card style={{ flex: "55 1 460px", minWidth: 0 }} noPad>
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: T.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.danger }}>
                {Ico.zap(18)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Auto-Escalation Queue</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>AI has identified 5 cases requiring immediate attention</div>
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAF7" }}>
                  <th style={thStyle}>Case ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Time in Stage</th>
                  <th style={thStyle}>Risk</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {ESCALATION_QUEUE.map((row) => (
                  <tr
                    key={row.id}
                    style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>{row.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{row.customer}</td>
                    <td style={tdStyle}>{row.stage}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: row.action === "escalate" ? T.danger : T.warning }}>{row.timeInStage}</td>
                    <td style={tdStyle}>{riskBadge(row.risk)}</td>
                    <td style={tdStyle}>
                      {row.action === "escalate" ? (
                        <Btn small danger icon="zap">Escalate Now</Btn>
                      ) : (
                        <Btn small style={{ background: T.warningBg, color: T.warning, border: `1px solid ${T.warningBorder}` }} icon="eye">Monitor</Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Squad Utilisation */}
        <Card style={{ flex: "45 1 360px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
              {Ico.users(18)}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Squad Utilisation</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Team capacity and workload</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SQUAD_DATA.map((member) => {
              const status = squadStatus(member.active, member.max);
              const barColor = capacityColor(member.active, member.max);
              const pct = (member.active / member.max) * 100;
              return (
                <div key={member.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{member.name}</span>
                      <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 6 }}>({member.role})</span>
                    </div>
                    <span style={{
                      background: status.bg, color: status.color,
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, background: "#F3F2ED", borderRadius: 6, height: 10, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", borderRadius: 6,
                        background: barColor, transition: "width 0.3s",
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, minWidth: 40, textAlign: "right" }}>
                      {member.active}/{member.max}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3: Live Activity Feed */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
            {Ico.clock(18)}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Live Activity Feed</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>Latest operational events across all stages</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ACTIVITY_FEED.map((event, i) => {
            const borderColor = FEED_BORDER[event.type] || FEED_BORDER.info;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  borderLeft: `4px solid ${borderColor}`,
                  borderBottom: i < ACTIVITY_FEED.length - 1 ? `1px solid ${T.borderLight}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, minWidth: 42 }}>{event.time}</span>
                <span style={{ color: borderColor, display: "flex", alignItems: "center" }}>
                  {Ico[event.icon]?.(16)}
                </span>
                <span style={{ fontSize: 13, color: T.text, flex: 1 }}>
                  {event.text}{" "}
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: T.primary, cursor: "pointer" }}>
                    {event.caseId}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
