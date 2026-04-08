import { useState } from "react";
import { T, Ico } from "./tokens";
import { Card } from "./primitives";

// ─────────────────────────────────────────────
// MOCK EVENTS
// ─────────────────────────────────────────────
const MOCK_EVENTS = [
  { id: 1,  cat: "Cases",     icon: "loans",    actor: "Sarah Chen",       text: "Submitted full application for case #MH-2041",                  ts: "10 min ago",        color: T.primary },
  { id: 2,  cat: "Documents", icon: "upload",   actor: "James O'Brien",   text: "Uploaded valuation report (Knight Frank) for #MH-2041",          ts: "18 min ago",        color: T.accent },
  { id: 3,  cat: "AI",        icon: "bot",      actor: "Helix AI",         text: "Auto-verified passport and payslip for applicant Priya Sharma",  ts: "25 min ago",        color: "#EC4899" },
  { id: 4,  cat: "Cases",     icon: "loans",    actor: "Mark Davies",      text: "Moved case #MH-2038 to Underwriting stage",                     ts: "42 min ago",        color: T.primary },
  { id: 5,  cat: "System",    icon: "settings", actor: "System",           text: "SLA warning triggered for case #MH-2038 (DIP response due)",    ts: "1 hr ago",          color: T.warning },
  { id: 6,  cat: "Auth",      icon: "lock",     actor: "Lisa Park",        text: "Logged in from 192.168.1.45 (London office)",                   ts: "1 hr ago",          color: "#8B5CF6" },
  { id: 7,  cat: "AI",        icon: "sparkle",  actor: "Helix AI",         text: "Flagged income discrepancy on case #MH-2039 (12% variance)",    ts: "1.5 hr ago",        color: "#EC4899" },
  { id: 8,  cat: "Documents", icon: "file",     actor: "Auto-classifier",  text: "Classified 8 documents for case #MH-2040 with 97% confidence",  ts: "2 hr ago",          color: T.accent },
  { id: 9,  cat: "Cases",     icon: "check",    actor: "David Walsh",      text: "Approved case #MH-2037 — formal offer generated",               ts: "3 hr ago",          color: T.primary },
  { id: 10, cat: "System",    icon: "shield",   actor: "Compliance Bot",   text: "AML check passed for applicant Raj Patel",                      ts: "3.5 hr ago",        color: T.warning },
  { id: 11, cat: "Auth",      icon: "lock",     actor: "Admin",            text: "Promoted Lisa Park to Senior Underwriter role",                  ts: "4 hr ago",          color: "#8B5CF6" },
  { id: 12, cat: "Cases",     icon: "dollar",   actor: "Finance Team",     text: "Disbursed funds for case #MH-2030 to Barker & Associates",      ts: "Yesterday 16:45",   color: T.primary },
  { id: 13, cat: "Documents", icon: "download", actor: "Broker Portal",    text: "Bulk download: 12 files exported for case #MH-2035",            ts: "Yesterday 14:20",   color: T.accent },
  { id: 14, cat: "AI",        icon: "zap",      actor: "Helix AI",         text: "Risk score recalculated for case #MH-2036 after new credit data",ts: "Yesterday 10:15",   color: "#EC4899" },
  { id: 15, cat: "System",    icon: "settings", actor: "System",           text: "Product rate sheet v2.4 published for Q2 2026",                  ts: "Mon 17:00",         color: T.warning },
  { id: 16, cat: "Auth",      icon: "eye",      actor: "Audit Logger",     text: "Exported compliance report for March 2026",                      ts: "Mon 11:30",         color: "#8B5CF6" },
  { id: 17, cat: "Cases",     icon: "loans",    actor: "Sarah Chen",       text: "Created new DIP application for client Emma Wilson",             ts: "Mon 09:00",         color: T.primary },
  { id: 18, cat: "AI",        icon: "bot",      actor: "Helix AI",         text: "Fraud detection model v3.2 deployed to production",              ts: "Sun 22:00",         color: "#EC4899" },
  { id: 19, cat: "Documents", icon: "file",     actor: "DocuSign",         text: "Mortgage offer signed by applicant for case #MH-2029",           ts: "Sat 15:30",         color: T.accent },
  { id: 20, cat: "System",    icon: "alert",    actor: "System",           text: "Scheduled maintenance completed — all services operational",     ts: "Sat 03:15",         color: T.warning },
];

const FILTER_TABS = ["All", "Cases", "Documents", "AI", "System", "Auth"];

const catColor = c => ({
  Cases: T.primary, Documents: T.accent, AI: "#EC4899",
  System: T.warning, Auth: "#8B5CF6",
}[c] || T.textMuted);

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export function ActivityFeed({ events: externalEvents, maxItems = 10, showFilters = true }) {
  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(maxItems);

  const allEvents = externalEvents || MOCK_EVENTS;
  const filtered  = filter === "All" ? allEvents : allEvents.filter(e => e.cat === filter);
  const visible   = filtered.slice(0, visibleCount);
  const hasMore   = visibleCount < filtered.length;

  return (
    <Card noPad>
      {/* Filter row */}
      {showFilters && (
        <div style={{
          padding: "14px 16px", borderBottom: `1px solid ${T.border}`,
          display: "flex", gap: 6, overflowX: "auto",
        }}>
          {FILTER_TABS.map(t => (
            <div key={t} onClick={() => { setFilter(t); setVisibleCount(maxItems); }} style={{
              padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap",
              background: filter === t ? T.primary : T.card,
              color: filter === t ? "#fff" : T.textSecondary,
              border: `1px solid ${filter === t ? T.primary : T.border}`,
              transition: "all .15s",
            }}>{t}</div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div style={{ padding: "16px 20px" }}>
        {visible.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted }}>
            <div style={{ marginBottom: 8, opacity: 0.5 }}>{Ico.clock(32)}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No activity found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>No {filter.toLowerCase()} events to display.</div>
          </div>
        )}

        {visible.map((ev, i) => {
          const color = ev.color || catColor(ev.cat);
          const icon  = Ico[ev.icon];
          const isLast = i === visible.length - 1;

          return (
            <div key={ev.id} style={{ display: "flex", gap: 14, position: "relative", minHeight: 56 }}>
              {/* Timeline rail */}
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0,
              }}>
                {/* Dot / icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${color}14`, color: color, zIndex: 1,
                }}>
                  {icon?.(15)}
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, background: T.borderLight, marginTop: 2, marginBottom: 2, borderRadius: 1,
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, color: T.text, lineHeight: 1.45, fontWeight: 500,
                }}>
                  <strong style={{ fontWeight: 700 }}>{ev.actor}</strong>{" "}
                  {ev.text}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginTop: 5,
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, color: T.textMuted,
                  }}>
                    {Ico.clock(11)}
                    {ev.ts}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: `${catColor(ev.cat)}18`, color: catColor(ev.cat),
                  }}>{ev.cat}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      {hasMore && (
        <div style={{
          padding: "12px 16px", borderTop: `1px solid ${T.border}`,
          textAlign: "center",
        }}>
          <span onClick={() => setVisibleCount(prev => prev + maxItems)} style={{
            fontSize: 13, fontWeight: 600, color: T.primary, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {Ico.plus(14)} Load more ({filtered.length - visibleCount} remaining)
          </span>
        </div>
      )}

      {/* Footer count */}
      <div style={{
        padding: "10px 16px", borderTop: `1px solid ${T.borderLight}`,
        fontSize: 11, color: T.textMuted, textAlign: "center",
      }}>
        Showing {visible.length} of {filtered.length} events
      </div>
    </Card>
  );
}

export default ActivityFeed;
