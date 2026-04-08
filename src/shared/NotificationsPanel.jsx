import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// MOCK NOTIFICATIONS
// ─────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  // Today
  { id: 1,  type: "case",     read: false, title: "Case #MH-2041 moved to Underwriting",   desc: "Broker Sarah Chen submitted full application pack.",                    ts: "10 min ago",  group: "Today" },
  { id: 2,  type: "document", read: false, title: "Valuation report uploaded",              desc: "Knight Frank valuation for 42 Elm Road, London SW1.",                   ts: "25 min ago",  group: "Today" },
  { id: 3,  type: "sla",      read: false, title: "SLA Warning: Case #MH-2038",            desc: "DIP response due in 2 hours. Currently unassigned.",                    ts: "42 min ago",  group: "Today" },
  { id: 4,  type: "ai",       read: false, title: "AI flagged income discrepancy",          desc: "Payslip vs. bank statement mismatch on case #MH-2039 (12% variance).", ts: "1 hr ago",    group: "Today" },
  { id: 5,  type: "message",  read: false, title: "New message from James O'Brien",        desc: "Re: Additional docs needed for BTL application.",                       ts: "1 hr ago",    group: "Today" },
  { id: 6,  type: "system",   read: true,  title: "Scheduled maintenance tonight",          desc: "Platform downtime 02:00-03:00 GMT for database migration.",             ts: "2 hr ago",    group: "Today" },
  // Yesterday
  { id: 7,  type: "case",     read: true,  title: "Case #MH-2037 Offer Issued",            desc: "Formal mortgage offer sent to applicant via DocuSign.",                 ts: "Yesterday 16:45", group: "Yesterday" },
  { id: 8,  type: "document", read: true,  title: "3 documents verified by AI",             desc: "Passport, payslip, and P60 auto-verified for case #MH-2040.",          ts: "Yesterday 14:20", group: "Yesterday" },
  { id: 9,  type: "sla",      read: true,  title: "SLA Breach: Case #MH-2033",             desc: "Full application review exceeded 48hr target by 4 hours.",              ts: "Yesterday 11:30", group: "Yesterday" },
  { id: 10, type: "ai",       read: true,  title: "AI risk score updated",                  desc: "Case #MH-2036 risk recalculated after new credit data received.",       ts: "Yesterday 10:15", group: "Yesterday" },
  { id: 11, type: "message",  read: true,  title: "Reply from compliance team",             desc: "AML check cleared for applicant Priya Sharma.",                         ts: "Yesterday 09:00", group: "Yesterday" },
  // This Week
  { id: 12, type: "system",   read: true,  title: "New product rate sheet published",       desc: "Q2 2026 fixed-rate products updated across all tiers.",                 ts: "Mon 17:00",   group: "This Week" },
  { id: 13, type: "case",     read: true,  title: "Case #MH-2030 Disbursed",               desc: "Funds released to solicitor Barker & Associates.",                      ts: "Mon 14:30",   group: "This Week" },
  { id: 14, type: "document", read: true,  title: "Bulk document upload completed",         desc: "12 files uploaded by broker portal for case #MH-2035.",                 ts: "Mon 10:00",   group: "This Week" },
  { id: 15, type: "ai",       read: true,  title: "AI model v3.2 deployed",                 desc: "Updated fraud detection model now active on all new applications.",     ts: "Sun 22:00",   group: "This Week" },
  { id: 16, type: "system",   read: true,  title: "User role updated",                      desc: "Admin promoted Lisa Park to Senior Underwriter.",                       ts: "Sat 09:15",   group: "This Week" },
];

const TABS = ["All", "Unread", "Cases", "Documents", "System"];

const typeIcon = {
  case:     Ico.loans,
  document: Ico.file,
  sla:      Ico.clock,
  message:  Ico.messages,
  ai:       Ico.bot,
  system:   Ico.settings,
};

const typeColor = {
  case:     T.primary,
  document: T.accent,
  sla:      T.warning,
  message:  "#8B5CF6",
  ai:       "#EC4899",
  system:   T.textMuted,
};

const tabMatch = (tab, n) => {
  if (tab === "All") return true;
  if (tab === "Unread") return !n.read;
  if (tab === "Cases") return n.type === "case" || n.type === "sla";
  if (tab === "Documents") return n.type === "document";
  if (tab === "System") return n.type === "system" || n.type === "ai";
  return true;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
function NotificationsPanel({ open, onClose, persona }) {
  const [tab, setTab]             = useState("All");
  const [items, setItems]         = useState(MOCK_NOTIFICATIONS);

  if (!open) return null;

  const filtered = items.filter(n => tabMatch(tab, n));
  const groups   = ["Today", "Yesterday", "This Week"].filter(g => filtered.some(n => n.group === g));
  const unreadCount = items.filter(n => !n.read).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss     = id  => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(12,45,59,0.35)", zIndex: 200,
        backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 400, zIndex: 201,
        background: T.bg, borderLeft: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", fontFamily: T.font,
        boxShadow: "-8px 0 30px rgba(12,45,59,0.12)",
        animation: "slideIn .2s ease-out",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.primary }}>{Ico.bell(22)}</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: T.danger, color: "#fff", fontSize: 11, fontWeight: 700,
                padding: "2px 8px", borderRadius: 10, minWidth: 20, textAlign: "center",
              }}>{unreadCount}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span onClick={markAllRead} style={{
              fontSize: 12, color: T.primary, cursor: "pointer", fontWeight: 600,
              textDecoration: "underline", textUnderlineOffset: 2,
            }}>Mark all read</span>
            <div onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: T.textMuted,
              background: T.card, border: `1px solid ${T.border}`,
            }}>{Ico.x(16)}</div>
          </div>
        </div>

        {/* Persona hint */}
        {persona && (
          <div style={{ padding: "8px 20px 0", fontSize: 11, color: T.textMuted }}>
            Showing notifications for <strong style={{ color: T.textSecondary }}>{persona}</strong>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{
          display: "flex", gap: 6, padding: "14px 20px 0", overflowX: "auto",
        }}>
          {TABS.map(t => (
            <div key={t} onClick={() => setTab(t)} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
              whiteSpace: "nowrap",
              background: tab === t ? T.primary : T.card,
              color: tab === t ? "#fff" : T.textSecondary,
              border: `1px solid ${tab === t ? T.primary : T.border}`,
              transition: "all .15s",
            }}>{t}</div>
          ))}
        </div>

        {/* Notification list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 20px" }}>
          {groups.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px", color: T.textMuted,
            }}>
              <div style={{ marginBottom: 12, opacity: 0.5 }}>{Ico.bell(40)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No notifications</div>
              <div style={{ fontSize: 12 }}>
                {tab === "Unread" ? "You're all caught up!" : `No ${tab.toLowerCase()} notifications to show.`}
              </div>
            </div>
          )}

          {groups.map(g => {
            const groupItems = filtered.filter(n => n.group === g);
            return (
              <div key={g}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase",
                  letterSpacing: 0.5, padding: "14px 0 8px",
                }}>{g}</div>

                {groupItems.map(n => {
                  const color = typeColor[n.type] || T.textMuted;
                  const icon  = typeIcon[n.type];
                  return (
                    <div key={n.id} onClick={() => dismiss(n.id)} style={{
                      display: "flex", gap: 12, padding: "12px 14px", marginBottom: 6,
                      borderRadius: 10, cursor: "pointer", background: T.card,
                      border: `1px solid ${n.read ? T.borderLight : `${color}30`}`,
                      transition: "all .15s", position: "relative",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 2px 8px ${T.primaryGlow}`; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {/* Unread dot */}
                      <div style={{
                        position: "absolute", top: 14, left: 6, width: 6, height: 6, borderRadius: 3,
                        background: n.read ? T.borderLight : T.primary,
                      }} />

                      {/* Icon */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0, marginLeft: 4,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}14`, color: color,
                      }}>
                        {icon?.(16)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: n.read ? 500 : 700, color: T.text,
                          lineHeight: 1.35, marginBottom: 3,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{n.title}</div>
                        <div style={{
                          fontSize: 12, color: T.textMuted, lineHeight: 1.4,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>{n.desc}</div>
                        <div style={{
                          fontSize: 11, color: T.textMuted, marginTop: 4, display: "flex",
                          alignItems: "center", gap: 6,
                        }}>
                          {Ico.clock(11)}
                          <span>{n.ts}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                            background: `${color}14`, color: color, marginLeft: "auto",
                          }}>{n.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 20px", borderTop: `1px solid ${T.border}`,
          fontSize: 12, color: T.textMuted, textAlign: "center", background: T.card,
        }}>
          {items.length} total notifications &middot; {unreadCount} unread
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

export default NotificationsPanel;
