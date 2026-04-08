import { useState, useEffect, useRef } from "react";
import { T, Ico } from "./tokens";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const CASES = [
  { id: "AFN-2026-00142", title: "AFN-2026-00142", subtitle: "James & Sarah Mitchell — Buy to Let", icon: "loans" },
  { id: "AFN-2026-00138", title: "AFN-2026-00138", subtitle: "David Chen — First Time Buyer", icon: "loans" },
  { id: "AFN-2026-00135", title: "AFN-2026-00135", subtitle: "Priya Sharma — Remortgage", icon: "loans" },
  { id: "AFN-2026-00131", title: "AFN-2026-00131", subtitle: "Oliver & Emma West — Residential", icon: "loans" },
  { id: "AFN-2026-00127", title: "AFN-2026-00127", subtitle: "Fatima Al-Rashid — HMO Purchase", icon: "loans" },
  { id: "AFN-2026-00119", title: "AFN-2026-00119", subtitle: "Robert Taylor — Portfolio Refinance", icon: "loans" },
  { id: "AFN-2026-00112", title: "AFN-2026-00112", subtitle: "Lucy & Tom Harris — Self Build", icon: "loans" },
];

const SCREENS = [
  { id: "dashboard",   title: "Dashboard",          subtitle: "Overview & KPIs",           icon: "dashboard", shortcut: "D" },
  { id: "pipeline",    title: "Pipeline",           subtitle: "Loan pipeline management",  icon: "loans",     shortcut: "P" },
  { id: "servicing",   title: "Servicing",          subtitle: "Active loan servicing",     icon: "dollar",    shortcut: "S" },
  { id: "valuations",  title: "Valuations",         subtitle: "Property valuations",       icon: "chart",     shortcut: "V" },
  { id: "mi",          title: "MI & Reporting",     subtitle: "Management information",    icon: "chart",     shortcut: "M" },
  { id: "users",       title: "Users & Roles",      subtitle: "User management",           icon: "users",     shortcut: "U" },
  { id: "audit",       title: "Audit Log",          subtitle: "System audit trail",        icon: "eye",       shortcut: "A" },
  { id: "customers",   title: "Customers",          subtitle: "Customer directory",        icon: "customers"  },
  { id: "products",    title: "Products",           subtitle: "Lending product config",    icon: "products"   },
  { id: "messages",    title: "Messages",           subtitle: "Internal comms",            icon: "messages"   },
  { id: "settings",    title: "Settings",           subtitle: "Platform configuration",    icon: "settings"   },
  { id: "complaints",  title: "Complaints",         subtitle: "Complaints management",     icon: "alert"      },
  { id: "sessions",    title: "Active Sessions",    subtitle: "Session monitoring",        icon: "lock"       },
  { id: "flags",       title: "Feature Flags",      subtitle: "Feature toggle management", icon: "zap"        },
  { id: "mandates",    title: "Mandates",           subtitle: "Direct debit mandates",     icon: "wallet"     },
];

const ACTIONS = [
  { id: "create-loan",    title: "Create New Loan",    subtitle: "Start a new application",  icon: "plus",     shortcut: "N" },
  { id: "run-dip",        title: "Run DIP",            subtitle: "Decision in Principle",     icon: "zap",      shortcut: "R" },
  { id: "export-pipeline",title: "Export Pipeline",    subtitle: "Download pipeline as CSV",  icon: "download"  },
  { id: "toggle-dark",    title: "Toggle Dark Mode",   subtitle: "Switch appearance theme",   icon: "sparkle"   },
  { id: "assign-case",    title: "Assign Case",        subtitle: "Assign to team member",     icon: "assign"    },
  { id: "send-message",   title: "Send Message",       subtitle: "Internal message",          icon: "send"      },
  { id: "upload-doc",     title: "Upload Document",    subtitle: "Attach file to a case",     icon: "upload"    },
  { id: "search-customer",title: "Search Customer",    subtitle: "Find by name or ID",        icon: "search"    },
];

// Build a flat list with category info
const ALL_ITEMS = [
  ...CASES.map(c => ({ ...c, category: "Cases", type: "case" })),
  ...SCREENS.map(s => ({ ...s, category: "Screens", type: "screen" })),
  ...ACTIONS.map(a => ({ ...a, category: "Actions", type: "action" })),
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
function CommandPalette({ open, onClose, onAction }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter items
  const filtered = query.trim()
    ? ALL_ITEMS.filter(i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        i.id.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ITEMS;

  // Group by category, preserving order
  const groups = [];
  const seen = new Set();
  for (const item of filtered) {
    if (!seen.has(item.category)) {
      seen.add(item.category);
      groups.push({ label: item.category, items: [] });
    }
    groups.find(g => g.label === item.category).items.push(item);
  }

  // Flat list for keyboard nav
  const flatFiltered = groups.flatMap(g => g.items);

  // Reset on open / query change
  useEffect(() => { setActiveIdx(0); }, [query]);
  useEffect(() => {
    if (open) { setQuery(""); setActiveIdx(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  // Keyboard
  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatFiltered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && flatFiltered[activeIdx]) {
      e.preventDefault();
      const item = flatFiltered[activeIdx];
      onAction?.({ type: item.type, id: item.id });
      onClose?.();
    }
    else if (e.key === "Escape") { onClose?.(); }
  };

  if (!open) return null;

  let runIdx = 0;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(12,45,59,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, maxHeight: 420, background: T.card, borderRadius: 16,
        boxShadow: "0 24px 64px rgba(12,45,59,0.25), 0 0 0 1px rgba(12,45,59,0.08)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: T.font,
      }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}`,
        }}>
          <span style={{ color: T.textMuted, flexShrink: 0 }}>{Ico.search(18)}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search cases, screens, actions..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 15,
              fontFamily: T.font, color: T.text, background: "transparent",
            }}
          />
          <kbd style={{
            fontSize: 11, color: T.textMuted, background: T.bg,
            padding: "2px 7px", borderRadius: 5, border: `1px solid ${T.borderLight}`,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {groups.length === 0 && (
            <div style={{ padding: "32px 18px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
              No results for "{query}"
            </div>
          )}
          {groups.map(group => {
            return (
              <div key={group.label}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase",
                  letterSpacing: 0.8, padding: "10px 18px 4px",
                }}>{group.label}</div>
                {group.items.map(item => {
                  const idx = runIdx++;
                  const isActive = idx === activeIdx;
                  return (
                    <div
                      key={item.id}
                      data-idx={idx}
                      onClick={() => { onAction?.({ type: item.type, id: item.id }); onClose?.(); }}
                      onMouseEnter={() => setActiveIdx(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 18px", margin: "0 6px", borderRadius: 10,
                        cursor: "pointer", transition: "background 0.1s",
                        background: isActive ? T.primaryLight : "transparent",
                      }}
                    >
                      <span style={{
                        width: 32, height: 32, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isActive ? T.primaryGlow : T.bg,
                        color: isActive ? T.primary : T.textMuted, flexShrink: 0,
                      }}>
                        {Ico[item.icon]?.(16)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.subtitle}
                        </div>
                      </div>
                      {item.shortcut && (
                        <kbd style={{
                          fontSize: 11, fontWeight: 600, color: T.textMuted, background: T.bg,
                          padding: "2px 7px", borderRadius: 5, border: `1px solid ${T.borderLight}`,
                          flexShrink: 0,
                        }}>{item.shortcut}</kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, padding: "10px 18px",
          borderTop: `1px solid ${T.borderLight}`, fontSize: 11, color: T.textMuted,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: T.bg, border: `1px solid ${T.borderLight}`, fontSize: 10 }}>↑↓</kbd> navigate
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: T.bg, border: `1px solid ${T.borderLight}`, fontSize: 10 }}>↵</kbd> select
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <kbd style={{ padding: "1px 5px", borderRadius: 4, background: T.bg, border: `1px solid ${T.borderLight}`, fontSize: 10 }}>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
