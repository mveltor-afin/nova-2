import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── Outcome data ── */
const OUTCOMES = {
  "Products & Services": {
    metrics: [
      { name: "Products meet target market needs", score: 94, rag: "green", trend: "up", comment: "All mortgage products reviewed against target market definitions in Q1." },
      { name: "Distribution strategy appropriate", score: 91, rag: "green", trend: "up", comment: "Broker and direct channels aligned with product complexity levels." },
      { name: "Product governance reviews on schedule", score: 88, rag: "green", trend: "flat", comment: "3 of 4 annual reviews completed. BTL review due Apr 2026." },
      { name: "No foreseeable harm identified", score: 95, rag: "green", trend: "up", comment: "No products flagged for potential customer harm in current period." },
      { name: "Customer outcomes monitored post-sale", score: 86, rag: "amber", trend: "down", comment: "Post-completion survey response rate dropped to 34%. Action plan in place." },
      { name: "Vulnerable customer product suitability", score: 90, rag: "green", trend: "flat", comment: "All vulnerable customer cases reviewed for product appropriateness." },
    ],
  },
  "Price & Value": {
    metrics: [
      { name: "Fair value assessment completed", score: 82, rag: "amber", trend: "flat", comment: "Arrangement fees benchmarked against market. SVR spread under review." },
      { name: "No excessive fees identified", score: 88, rag: "green", trend: "up", comment: "ERC structures within industry norms for all active products." },
      { name: "Price differential justification", score: 79, rag: "amber", trend: "down", comment: "Channel pricing differences require stronger justification documentation." },
      { name: "Value chain cost transparency", score: 85, rag: "amber", trend: "flat", comment: "Broker proc fee disclosure compliance at 92%. Target is 100%." },
      { name: "Ongoing value monitoring", score: 90, rag: "green", trend: "up", comment: "Quarterly value assessments now automated for all fixed-rate products." },
    ],
  },
  "Consumer Understanding": {
    metrics: [
      { name: "Communications tested for clarity", score: 92, rag: "green", trend: "up", comment: "Offer letters redesigned and tested with consumer panel in Feb 2026." },
      { name: "Key information accessible", score: 88, rag: "green", trend: "flat", comment: "KFI readability scores improved. Average Flesch score now 62." },
      { name: "Risk warnings prominent", score: 91, rag: "green", trend: "up", comment: "Your home may be repossessed warning placement verified across all channels." },
      { name: "Digital journey comprehension", score: 84, rag: "amber", trend: "down", comment: "Online application drop-off at T&C stage increased 3%. UX review initiated." },
      { name: "Jargon-free language compliance", score: 86, rag: "amber", trend: "flat", comment: "12 legacy documents still contain complex terminology. Rewrite programme underway." },
      { name: "Multi-channel format availability", score: 89, rag: "green", trend: "up", comment: "Large print and audio formats now available for all key documents." },
    ],
  },
  "Consumer Support": {
    metrics: [
      { name: "Contact centre wait times", score: 72, rag: "red", trend: "down", comment: "Average wait time 8m 20s, up from 5m 45s. Recruitment of 4 FTEs approved." },
      { name: "Complaint resolution timeliness", score: 81, rag: "amber", trend: "flat", comment: "89% resolved within 8-week FCA deadline. 1 case currently breaching." },
      { name: "Forbearance options offered proactively", score: 85, rag: "amber", trend: "up", comment: "Early arrears contact rate improved to 94% within 14 days of missed payment." },
      { name: "Account switching/exit ease", score: 78, rag: "red", trend: "down", comment: "Redemption statement turnaround at 6 days vs 3-day target. Process review underway." },
      { name: "Vulnerable customer support", score: 83, rag: "amber", trend: "flat", comment: "TEXAS framework adopted. 78% of front-line staff certified, target 100% by Jun 2026." },
      { name: "Post-sale service quality", score: 76, rag: "red", trend: "down", comment: "Annual statement errors affected 2.1% of accounts. Root cause identified and fixed." },
    ],
  },
};

const VULNERABILITY_CASES = [
  { id: "VUL-014", customer: "Margaret Frost", category: "Health", status: "Open", logged: "02 Apr 2026", response: "Same day" },
  { id: "VUL-013", customer: "Brian Lowe", category: "Life Event", status: "Open", logged: "30 Mar 2026", response: "1 day" },
  { id: "VUL-012", customer: "Yasmin Ali", category: "Financial", status: "In Review", logged: "25 Mar 2026", response: "Same day" },
  { id: "VUL-011", customer: "Derek Shaw", category: "Capability", status: "Resolved", logged: "18 Mar 2026", response: "2 days" },
  { id: "VUL-010", customer: "Carol Bennett", category: "Health", status: "Resolved", logged: "10 Mar 2026", response: "Same day" },
];

const MONTHLY_SCORES = [
  { month: "Oct", score: 82 }, { month: "Nov", score: 83 }, { month: "Dec", score: 84 },
  { month: "Jan", score: 85 }, { month: "Feb", score: 86 }, { month: "Mar", score: 87 },
];

function ConsumerDutyScreen() {
  const [activeTab, setActiveTab] = useState("Products & Services");
  const tabKeys = Object.keys(OUTCOMES);

  const ragColor = r => ({ green: T.success, amber: T.warning, red: T.danger }[r]);
  const ragBg    = r => ({ green: T.successBg, amber: T.warningBg, red: T.dangerBg }[r]);
  const trendIcon = t => t === "up" ? "\u2191" : t === "down" ? "\u2193" : "\u2192";
  const trendColor = t => t === "up" ? T.success : t === "down" ? T.danger : T.textMuted;

  const maxBar = 160;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Consumer Duty Dashboard</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            FCA Consumer Duty outcome monitoring and evidence tracker
          </p>
        </div>
        <Btn primary icon="file">Generate Board Report</Btn>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Overall Score"       value="87%"  sub="+2pp vs last quarter" color={T.primary} />
        <KPICard label="Products & Services"  value="92%"  sub="6 metrics tracked"   color={T.success} />
        <KPICard label="Price & Value"        value="85%"  sub="2 amber flags"        color={T.warning} />
        <KPICard label="Understanding"        value="88%"  sub="improving trend"      color={T.accent} />
        <KPICard label="Consumer Support"     value="79%"  sub="3 red flags"          color={T.danger} />
      </div>

      {/* Monthly trend chart */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: T.text }}>Overall Outcome Score Trend</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 120 }}>
          {MONTHLY_SCORES.map(m => {
            const h = (m.score / 100) * 110;
            return (
              <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 4 }}>{m.score}%</div>
                <div style={{ width: "100%", maxWidth: 48, height: h, borderRadius: "6px 6px 0 0",
                  background: m.month === "Mar" ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : T.border,
                  transition: "height 0.3s" }} />
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{m.month}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Outcome tabs */}
      <Card noPad>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tabKeys.map(t => (
            <div key={t} onClick={() => setActiveTab(t)}
              style={{ padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: activeTab === t ? T.primary : T.card, color: activeTab === t ? "#fff" : T.textSecondary,
                border: `1px solid ${activeTab === t ? T.primary : T.border}` }}>{t}</div>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {OUTCOMES[activeTab].metrics.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0",
              borderBottom: i < OUTCOMES[activeTab].metrics.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
              {/* RAG dot */}
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: ragColor(m.rag), flexShrink: 0 }} />
              {/* Name & comment */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{m.comment}</div>
              </div>
              {/* Progress bar */}
              <div style={{ width: maxBar, flexShrink: 0 }}>
                <div style={{ height: 8, borderRadius: 4, background: T.bg, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.score}%`, borderRadius: 4, background: ragColor(m.rag), transition: "width 0.3s" }} />
                </div>
              </div>
              {/* Score */}
              <div style={{ width: 50, textAlign: "right", fontSize: 14, fontWeight: 700, color: T.text, flexShrink: 0 }}>{m.score}%</div>
              {/* Trend */}
              <div style={{ width: 24, textAlign: "center", fontSize: 16, fontWeight: 700, color: trendColor(m.trend), flexShrink: 0 }}>
                {trendIcon(m.trend)}
              </div>
              {/* RAG badge */}
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                background: ragBg(m.rag), color: ragColor(m.rag), textTransform: "uppercase", flexShrink: 0 }}>{m.rag}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Vulnerability tracking */}
      <Card noPad style={{ marginTop: 20 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Vulnerability Tracking</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Open cases and response time monitoring</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>2</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>Open</div>
            </div>
            <div style={{ width: 1, background: T.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>4</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>Categories</div>
            </div>
            <div style={{ width: 1, background: T.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.success }}>1.0d</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>Avg Response</div>
            </div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {["ID", "Customer", "Category", "Status", "Logged", "Response Time"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600,
                  color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VULNERABILITY_CASES.map(v => (
              <tr key={v.id} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 600, color: T.primary, fontFamily: "monospace" }}>{v.id}</td>
                <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.text }}>{v.customer}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: vulCatBg(v.category), color: vulCatColor(v.category) }}>{v.category}</span>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: v.status === "Resolved" ? T.successBg : v.status === "In Review" ? T.warningBg : "#DBEAFE",
                    color: v.status === "Resolved" ? T.success : v.status === "In Review" ? T.warning : "#1E40AF" }}>{v.status}</span>
                </td>
                <td style={{ padding: "11px 16px", fontSize: 12, color: T.textMuted }}>{v.logged}</td>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 600, color: T.success }}>{v.response}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ── helpers ── */
function vulCatColor(cat) {
  return { Health: T.danger, "Life Event": "#8B5CF6", Financial: T.warning, Capability: T.primary }[cat] || T.textMuted;
}
function vulCatBg(cat) {
  return { Health: T.dangerBg, "Life Event": "#8B5CF618", Financial: T.warningBg, Capability: `${T.primary}18` }[cat] || "#E5E7EB";
}

export default ConsumerDutyScreen;
