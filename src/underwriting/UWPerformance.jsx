import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── helpers ── */
function HBar({ label, value, max, color, suffix = "" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 100, fontSize: 12, color: T.textMuted, textAlign: "right" }}>{label}</div>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: T.borderLight, position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: color || T.primary, transition: "width 0.4s" }} />
        <span style={{ position: "absolute", top: 3, left: `${Math.min(pct, 90)}%`, marginLeft: 6, fontSize: 11, fontWeight: 700, color: T.text }}>{value}{suffix}</span>
      </div>
    </div>
  );
}

function MiniTable({ headers, rows }) {
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${T.border}`, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
        background: "#F8FAFC", padding: "8px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted,
        textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${T.border}`,
      }}>
        {headers.map((h) => <div key={h}>{h}</div>)}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
          padding: "8px 14px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${T.borderLight}` : "none",
          background: row.bg || (i % 2 === 0 ? "#fff" : "#FAFAFA"),
        }}>
          {row.cells.map((c, j) => (
            <div key={j} style={{ fontWeight: j === 0 ? 600 : 400, color: row.color || T.text }}>{c}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 14 }}>
      {icon}{title}
    </div>
  );
}

function Badge({ text, color, bg }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: bg, color }}>{text}</span>
  );
}

/* ── main component ── */
export default function UWPerformance() {
  const [tab] = useState("month");

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 20, fontWeight: 700 }}>
          {Ico.chart(22)} My Underwriting Performance
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          Decision quality, speed, and portfolio outcomes
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Decisions This Month" value="24" color={T.primary} />
        <KPICard label="Avg Decision Time" value="2.1h" color={T.accent} />
        <KPICard label="Approval Rate" value="75%" color={T.success} />
        <KPICard label="Overturn Rate" value="4.2%" color={T.warning} />
        <KPICard label="AI Agreement" value="88%" color="#7C3AED" />
        <KPICard label="Quality Score" value="94/100" color={T.success} />
      </div>

      {/* ── Decision Breakdown ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.loans(18)} title="Decision Breakdown" />
        <HBar label="Approved" value={18} max={24} color={T.success} />
        <HBar label="Declined" value={3} max={24} color={T.danger} />
        <HBar label="Referred" value={3} max={24} color={T.warning} />
        <div style={{ marginTop: 12, fontSize: 12, color: T.textSecondary, padding: "8px 12px", background: T.primaryLight, borderRadius: 8 }}>
          Your approval rate (75%) is 3% above team average (72%).
        </div>
      </Card>

      {/* ── Decision Speed ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.clock(18)} title="Decision Speed" />
        <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 8 }}>Average decision time by day of week</div>
        <HBar label="Monday" value={1.8} max={3} color={T.primary} suffix="h" />
        <HBar label="Tuesday" value={2.4} max={3} color={T.primary} suffix="h" />
        <HBar label="Wednesday" value={1.9} max={3} color={T.primary} suffix="h" />
        <HBar label="Thursday" value={2.6} max={3} color={T.primary} suffix="h" />
        <HBar label="Friday" value={1.5} max={3} color={T.accent} suffix="h" />
        <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, padding: "8px 12px", background: T.successBg, borderRadius: 8, color: T.success, fontWeight: 500 }}>
            Your average has improved 12% this quarter
          </div>
          <div style={{ fontSize: 12, padding: "8px 12px", background: T.primaryLight, borderRadius: 8, color: T.primary, fontWeight: 500 }}>
            You are the 2nd fastest in the team (avg 2.1h vs team 2.8h)
          </div>
        </div>
      </Card>

      {/* ── AI Agreement ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.bot(18)} title="AI Agreement" />

        {/* Pie-style display */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke={T.borderLight} strokeWidth="10" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#7C3AED" strokeWidth="10"
                strokeDasharray={`${88 * 2.136} ${100 * 2.136}`}
                strokeLinecap="round" transform="rotate(-90 40 40)" />
            </svg>
            <div style={{ position: "absolute", top: 0, left: 0, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#7C3AED" }}>88%</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Agreed with AI: 88% (21 of 24)</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>3 cases overridden this month</div>
          </div>
        </div>

        {/* Overrides breakdown */}
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: T.textSecondary }}>Overrides Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: T.warningBg, border: `1px solid ${T.warningBorder}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>AI said Approve, you Referred: 2 cases</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              AFN-2026-00098 &mdash; Income documentation incomplete, awaiting additional P60<br />
              AFN-2026-00121 &mdash; Property in flood zone 3, required additional valuation
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.danger }}>AI said Approve, you Declined: 1 case</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
              AFN-2026-00087 &mdash; Applicant had undisclosed CCJ found during manual checks
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, padding: "8px 12px", background: T.primaryLight, borderRadius: 8, color: T.textSecondary }}>
          Of the 21 cases where you agreed with AI, 20 are performing. 1 is in early arrears (month 2).
        </div>
      </Card>

      {/* ── Portfolio Performance ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.dollar(18)} title="Portfolio Performance" />
        <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 14, fontWeight: 500 }}>
          Cases you approved in the last 12 months: <strong>142</strong>
        </div>
        <MiniTable
          headers={["Vintage", "Cases", "In Arrears", "Rate", "Status"]}
          rows={[
            { cells: ["0\u20133 months", "38", "0", "0%", "On track"], bg: T.successBg, color: T.success },
            { cells: ["3\u20136 months", "35", "1", "2.9%", "On track"], bg: T.successBg, color: T.success },
            { cells: ["6\u201312 months", "42", "2", "4.8%", "Watch"], bg: T.warningBg, color: "#92400E" },
            { cells: ["12+ months", "27", "1", "3.7%", "On track"], bg: T.successBg, color: T.success },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          <Badge text="Your portfolio arrears rate (3.2%) is below the book average (4.1%)" bg={T.successBg} color={T.success} />
        </div>
      </Card>

      {/* ── Mandate Utilisation ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.shield(18)} title="Mandate Utilisation" />
        <HBar label="L1 Decisions" value={18} max={24} color={T.primary} />
        <HBar label="L2 Escalated" value={4} max={24} color={T.warning} />
        <HBar label="L2 Co-approved" value={2} max={24} color="#7C3AED" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <div style={{ fontSize: 12, padding: "8px 12px", background: T.primaryLight, borderRadius: 8, color: T.textSecondary }}>
            You are authorised for L1 (up to \u00a3500k). 4 cases exceeded your mandate and were escalated.
          </div>
          <div style={{ fontSize: 12, padding: "10px 14px", background: "#EDE9FE", borderRadius: 8, border: "1px solid #C4B5FD", color: "#5B21B6", fontWeight: 500 }}>
            {Ico.sparkle(14)} <strong>Recommendation:</strong> Based on your quality score (94) and 3yr experience, you are eligible for L2 mandate upgrade. Discuss with Credit Risk Head.
          </div>
        </div>
      </Card>

      {/* ── Overturn Tracker ── */}
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle icon={Ico.alert(18)} title="Overturn Tracker" />
        <MiniTable
          headers={["Case ID", "Your Decision", "Overturned To", "Reason", "Date", "Performance"]}
          rows={[
            {
              cells: [
                "AFN-2025-00892",
                "Declined",
                "Approved (Senior UW)",
                "Self-employed income subsequently verified with 3yr SA302s",
                "Jan 2026",
                "3 months, performing",
              ],
            },
          ]}
        />
        <div style={{ marginTop: 14, fontSize: 12, padding: "8px 12px", background: T.successBg, borderRadius: 8, color: T.success, fontWeight: 500 }}>
          Your overturn rate (4.2%) is within acceptable range (&lt;10%). Industry average: 6.8%.
        </div>
      </Card>
    </div>
  );
}
