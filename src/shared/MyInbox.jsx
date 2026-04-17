import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── colour map by item type ── */
const TYPE_META = {
  mention:  { color: "#7C3AED", label: "@mention" },
  question: { color: "#F59E0B", label: "Question" },
  task:     { color: "#3B82F6", label: "Task" },
  alert:    { color: "#DC2626", label: "Alert" },
  system:   { color: "#6B7280", label: "System" },
};

const PRIORITY_DOT = { urgent: "#DC2626", normal: "#F59E0B", low: "#6B7280" };

/* ── 15 mock inbox items ── */
const ITEMS = [
  { id: 1,  type: "mention",  priority: "urgent", unread: true,  resolved: false, title: "Income discrepancy review requested",      body: "@you: Can you review the income discrepancy on this case? The P60 shows £2,500 less than declared.",                         source: "from Tom Williams in Case AFN-2026-00119",      time: "30 min ago" },
  { id: 2,  type: "question", priority: "normal", unread: true,  resolved: false, title: "BTL stress rate confirmation",              body: "Is the BTL stress rate at 5.5% or has it been updated to 6%?",                                                                  source: "from Lucy Chen in Policy Checker",               time: "1h ago" },
  { id: 3,  type: "task",     priority: "urgent", unread: true,  resolved: false, title: "Underwriting decision — SLA expiring",      body: "Complete underwriting decision for AFN-2026-00142 — SLA expires in 4h",                                                    source: "System",                                         time: "2h ago" },
  { id: 4,  type: "alert",    priority: "urgent", unread: true,  resolved: false, title: "Vulnerability protocol escalation",         body: "Customer CUS-003 vulnerability protocol escalation — 3rd missed payment",                                                  source: "System",                                         time: "3h ago" },
  { id: 5,  type: "mention",  priority: "normal", unread: true,  resolved: false, title: "Valuation report confirmed",                body: "@you: Confirmed the valuation report is in order. Good to proceed.",                                                            source: "from Rachel Adams in Case AFN-2026-00201",       time: "4h ago" },
  { id: 6,  type: "task",     priority: "normal", unread: true,  resolved: false, title: "Broker commission reconciliation",          body: "Review broker commission reconciliation for March",                                                                             source: "System",                                         time: "5h ago" },
  { id: 7,  type: "question", priority: "normal", unread: true,  resolved: false, title: "Self-employed accounts query",              body: "Should we accept the 2-year accounts for the self-employed case or insist on 3?",                                               source: "from James Miller in Case AFN-2026-00135",       time: "6h ago" },
  { id: 8,  type: "system",   priority: "low",    unread: true,  resolved: false, title: "Weekly performance report ready",           body: "Your weekly performance report is ready",                                                                                       source: "System",                                         time: "8h ago" },
  { id: 9,  type: "mention",  priority: "normal", unread: false, resolved: false, title: "Thanks — Mitchell case turnaround",         body: "@you: Thanks for the quick turnaround on the Mitchell case",                                                                    source: "from David Park",                                time: "yesterday" },
  { id: 10, type: "task",     priority: "normal", unread: false, resolved: false, title: "Q1 Consumer Duty report",                   body: "Submit Q1 Consumer Duty report",                                                                                                source: "System",                                         time: "yesterday" },
  { id: 11, type: "alert",    priority: "normal", unread: false, resolved: false, title: "KYC renewal reminder",                      body: "KYC renewal reminder: CUS-006 expires in 30 days",                                                                              source: "System",                                         time: "yesterday" },
  { id: 12, type: "task",     priority: "low",    unread: false, resolved: false, title: "Mandatory compliance training",             body: "Complete mandatory compliance training module",                                                                                  source: "System",                                         time: "2 days ago" },
  { id: 13, type: "system",   priority: "low",    unread: false, resolved: false, title: "Platform update v2.13",                     body: "Platform update v2.13 deployed — see Release Notes",                                                                       source: "System",                                         time: "2 days ago" },
  { id: 14, type: "mention",  priority: "normal", unread: false, resolved: false, title: "Fraud indicator — great catch",             body: "@you: Great catch on the fraud indicator",                                                                                      source: "from Ahmed Hassan",                              time: "3 days ago" },
  { id: 15, type: "task",     priority: "normal", unread: false, resolved: true,  title: "Review Priya Sharma collections case",      body: "Review Priya Sharma collections case",                                                                                          source: "System",                                         time: "3 days ago" },
];

const FILTER_TABS = ["All", "Mentions", "Questions", "Tasks", "Alerts", "Resolved"];

const RECENT_ACTIVITY = [
  "Replied to Tom Williams",
  "Completed task: AFN-2026-00142",
  "Acknowledged alert: CUS-003",
  "Answered Lucy Chen's question",
  "Snoozed compliance training reminder",
];

/* ── component ── */
export default function MyInbox() {
  const [filter, setFilter] = useState("All");

  const filtered = ITEMS.filter((item) => {
    if (filter === "All") return !item.resolved;
    if (filter === "Resolved") return item.resolved;
    if (filter === "Mentions") return item.type === "mention" && !item.resolved;
    if (filter === "Questions") return item.type === "question" && !item.resolved;
    if (filter === "Tasks") return item.type === "task" && !item.resolved;
    if (filter === "Alerts") return item.type === "alert" && !item.resolved;
    return true;
  });

  return (
    <div style={{ padding: 32, fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, fontWeight: 700, color: T.text }}>
          {Ico.bell(24)} My Inbox
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6, marginLeft: 34 }}>
          Everything that needs your attention — mentions, questions, tasks and alerts in one place
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Unread" value={8} color={T.primary} />
        <KPICard label="Mentions" value={3} color="#7C3AED" />
        <KPICard label="Questions Pending" value={2} color="#F59E0B" />
        <KPICard label="Tasks Due Today" value={4} color="#3B82F6" />
        <KPICard label="Overdue" value={1} color={T.danger} sub={<span style={{ color: T.danger, fontWeight: 600 }}>Action required</span>} />
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTER_TABS.map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: active ? "none" : `1px solid ${T.border}`,
                background: active ? T.primary : T.card,
                color: active ? "#fff" : T.text,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: T.font,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Main layout: list + sidebar ── */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Inbox Items ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <Card style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 15, color: T.textMuted }}>No items match this filter.</div>
            </Card>
          )}
          {filtered.map((item) => {
            const meta = TYPE_META[item.type];
            return (
              <Card
                key={item.id}
                noPad
                style={{
                  borderLeft: `4px solid ${meta.color}`,
                  background: item.unread ? "rgba(26,74,84,0.04)" : T.card,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>

                  {/* top row: badge, priority, title, timestamp */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {/* type badge */}
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 5,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      background: meta.color + "18",
                      color: meta.color,
                    }}>
                      {meta.label}
                    </span>

                    {/* priority dot */}
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: PRIORITY_DOT[item.priority],
                      flexShrink: 0,
                    }} />

                    {/* title */}
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1 }}>
                      {item.title}
                    </span>

                    {/* resolved tag */}
                    {item.resolved && (
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        background: T.successBg,
                        color: T.success,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}>
                        Resolved
                      </span>
                    )}

                    {/* timestamp */}
                    <span style={{ fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>{item.time}</span>
                  </div>

                  {/* body */}
                  <div style={{
                    fontSize: 13,
                    color: T.textSecondary,
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {item.body}
                  </div>

                  {/* source + actions */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic" }}>{item.source}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn ghost small>Reply</Btn>
                      <Btn ghost small>Mark Done</Btn>
                      <Btn ghost small>Snooze</Btn>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Right Sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, position: "sticky", top: 32, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Quick Stats */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.chart(16)} Quick Stats
            </div>
            {[
              { label: "Response time avg", value: "1.2h" },
              { label: "Resolution rate", value: "94%" },
              { label: "Items this week", value: "23" },
              { label: "Items resolved", value: "19" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{s.value}</span>
              </div>
            ))}
          </Card>

          {/* Recent Activity */}
          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.clock(16)} Recent Activity
            </div>
            {RECENT_ACTIVITY.map((act, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary, marginTop: 5, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.45 }}>{act}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
