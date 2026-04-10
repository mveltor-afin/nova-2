import { useState, useRef, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";
import { MOCK_LOANS } from "../data/loans";
import { MOCK_SVC_ACCOUNTS } from "../data/servicing";

// ─────────────────────────────────────────────
// UNIVERSAL SEARCH — Full search overlay
// ─────────────────────────────────────────────

// Orphaned / context-dependent routes that should NOT appear in universal search.
// They remain navigable via direct routing inside the shell.
const HIDDEN_SCREEN_IDS = new Set([
  "caseworkbench",
  "customerhub",
  "customerportal",
  "enquirydetail",
  "integrations",
  "myapplications",
  "property",
  "sessions",
  "uwworkstation",
]);

const SCREENS = [
  { id: "dashboard", name: "Dashboard", icon: "dashboard" },
  { id: "pipeline", name: "Pipeline", icon: "loans" },
  { id: "customers", name: "Customers", icon: "customers" },
  { id: "products", name: "Products", icon: "products" },
  { id: "servicing", name: "Servicing", icon: "dollar" },
  { id: "messages", name: "Messages", icon: "messages" },
  { id: "settings", name: "Settings", icon: "settings" },
  { id: "apply", name: "Smart Apply", icon: "zap" },
  { id: "eligibility", name: "Eligibility Check", icon: "check" },
  { id: "admin", name: "Admin Panel", icon: "shield" },
  { id: "mi", name: "MI & Analytics", icon: "chart" },
  { id: "notifications", name: "Notifications", icon: "bell" },
  { id: "ai-copilot", name: "Nova AI Copilot", icon: "sparkle" },
].filter(s => !HIDDEN_SCREEN_IDS.has(s.id));

const ACTIONS = [
  { id: "create-loan", name: "Create loan", icon: "plus", shortcut: "Ctrl+N" },
  { id: "request-holiday", name: "Request payment holiday", icon: "clock" },
  { id: "run-dip", name: "Run DIP", icon: "zap" },
  { id: "switch-rate", name: "Switch rate", icon: "arrow" },
  { id: "flag-vulnerability", name: "Flag vulnerability", icon: "alert" },
  { id: "upload-doc", name: "Upload document", icon: "upload" },
  { id: "send-message", name: "Send message", icon: "send" },
  { id: "export-report", name: "Export report", icon: "download" },
  { id: "run-eligibility", name: "Run eligibility check", icon: "check" },
  { id: "new-customer", name: "Create new customer", icon: "assign" },
];

function matchText(text, query) {
  if (!text || !query) return false;
  return String(text).toLowerCase().includes(query.toLowerCase());
}

function UniversalSearch({ open, onClose, onAction }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim();

  // Build results
  const results = [];

  if (q.length > 0) {
    // Customers
    const customerHits = (CUSTOMERS || []).filter(c =>
      matchText(c.name, q) || matchText(c.email, q) || matchText(c.phone, q) ||
      matchText(c.id, q) || matchText(c.address, q)
    ).slice(0, 5);
    if (customerHits.length) {
      results.push({ type: "header", label: "Customers" });
      customerHits.forEach(c => results.push({
        type: "customer", id: c.id, title: c.name,
        subtitle: `${c.id} • ${c.segment} • ${c.email}`,
        icon: "user", data: c,
      }));
    }

    // Cases (loans)
    const caseHits = (MOCK_LOANS || []).filter(l =>
      matchText(l.id, q) || matchText(l.names, q) || matchText(l.product, q)
    ).slice(0, 5);
    if (caseHits.length) {
      results.push({ type: "header", label: "Cases" });
      caseHits.forEach(l => results.push({
        type: "case", id: l.id, title: `${l.id} — ${l.names}`,
        subtitle: `${l.product} • ${l.amount} • ${l.status?.replace(/_/g, " ")}`,
        icon: "loans", data: l,
      }));
    }

    // Accounts (servicing + products)
    const accountHits = (MOCK_SVC_ACCOUNTS || []).filter(a =>
      matchText(a.id, q) || matchText(a.name, q) || matchText(a.product, q)
    ).slice(0, 5);
    const productHits = (PRODUCTS || []).filter(p =>
      matchText(p.id, q) || matchText(p.product, q) || matchText(p.customerId, q)
    ).slice(0, 3);
    const combinedAccounts = [
      ...accountHits.map(a => ({ type: "account", id: a.id, title: `${a.id} — ${a.name}`, subtitle: `${a.product} • ${a.balance} • ${a.state}`, icon: "dollar", data: a })),
      ...productHits.filter(p => !accountHits.some(a => a.id === p.id)).map(p => ({ type: "account", id: p.id, title: `${p.id} — ${p.product}`, subtitle: `${p.type} • ${p.balance} • ${p.status}`, icon: "wallet", data: p })),
    ].slice(0, 5);
    if (combinedAccounts.length) {
      results.push({ type: "header", label: "Accounts" });
      combinedAccounts.forEach(a => results.push(a));
    }

    // Screens — exclude hidden/orphaned routes even if something manages to reference them
    const screenHits = SCREENS.filter(s =>
      !HIDDEN_SCREEN_IDS.has(s.id) && (matchText(s.name, q) || matchText(s.id, q))
    ).slice(0, 4);
    if (screenHits.length) {
      results.push({ type: "header", label: "Screens" });
      screenHits.forEach(s => results.push({
        type: "screen", id: s.id, title: s.name,
        subtitle: "Navigate to screen", icon: s.icon, data: s,
      }));
    }

    // Actions
    const actionHits = ACTIONS.filter(a => matchText(a.name, q)).slice(0, 4);
    if (actionHits.length) {
      results.push({ type: "header", label: "Actions" });
      actionHits.forEach(a => results.push({
        type: "action", id: a.id, title: a.name,
        subtitle: a.shortcut || "Quick action", icon: a.icon, data: a,
        shortcut: a.shortcut,
      }));
    }
  }

  // Selectable items only (exclude headers)
  const selectableItems = results.filter(r => r.type !== "header");

  const handleSelect = (item) => {
    if (!item || item.type === "header") return;
    setRecentSearches(prev => {
      const next = [item, ...prev.filter(r => r.id !== item.id)].slice(0, 5);
      return next;
    });
    onAction?.({ type: item.type, id: item.id, data: item.data });
    onClose?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, selectableItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectableItems.length > 0) {
      e.preventDefault();
      handleSelect(selectableItems[activeIdx]);
    }
  };

  // Keep active item in view
  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector("[data-active='true']");
      if (active) active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  let selectableIdx = -1;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(12,45,59,0.55)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh", fontFamily: T.font,
      }}
    >
      <div style={{
        width: 560, maxWidth: "94vw", background: T.card, borderRadius: 16,
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "hidden",
        animation: "usSlideDown 0.2s ease",
      }}>
        <style>{`
          @keyframes usSlideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        `}</style>

        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}`,
        }}>
          <span style={{ color: T.textMuted, flexShrink: 0 }}>{Ico.search(20)}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search customers, cases, accounts, actions..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 15,
              fontFamily: T.font, color: T.text, background: "transparent",
            }}
          />
          <div style={{
            fontSize: 10, color: T.textMuted, background: T.bg,
            padding: "3px 8px", borderRadius: 4, fontWeight: 600, flexShrink: 0,
          }}>ESC</div>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 420, overflowY: "auto", padding: "8px 0" }}>
          {q.length === 0 && recentSearches.length > 0 && (
            <>
              <div style={{
                padding: "8px 20px 4px", fontSize: 10, fontWeight: 700,
                color: T.textMuted, letterSpacing: 0.6, textTransform: "uppercase",
              }}>Recent</div>
              {recentSearches.map((r, i) => (
                <div
                  key={r.id + i}
                  onClick={() => handleSelect(r)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 20px", cursor: "pointer",
                    background: "transparent", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ color: T.textMuted, flexShrink: 0 }}>{Ico[r.icon]?.(16)}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{r.title}</span>
                  <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{Ico.clock(12)}</span>
                </div>
              ))}
            </>
          )}

          {q.length === 0 && recentSearches.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ color: T.textMuted, marginBottom: 8 }}>{Ico.search(28)}</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>
                Start typing to search across customers, cases, accounts, and actions
              </div>
            </div>
          )}

          {q.length > 0 && results.length === 0 && (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <div style={{ color: T.textMuted, marginBottom: 8 }}>{Ico.search(28)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>
                No results for "{q}"
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6 }}>
                Try searching by customer name, case ID (AFN-...), account ID (M-...),<br />
                or an action like "create loan" or "switch rate"
              </div>
            </div>
          )}

          {q.length > 0 && results.map((item, i) => {
            if (item.type === "header") {
              return (
                <div key={item.label} style={{
                  padding: `${i === 0 ? 4 : 12}px 20px 4px`,
                  fontSize: 10, fontWeight: 700, color: T.textMuted,
                  letterSpacing: 0.6, textTransform: "uppercase",
                }}>
                  {item.label}
                </div>
              );
            }

            selectableIdx++;
            const isActive = selectableIdx === activeIdx;

            return (
              <div
                key={item.type + item.id}
                data-active={isActive}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIdx(results.filter(r => r.type !== "header").indexOf(item))}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 20px", cursor: "pointer",
                  background: isActive ? T.primaryLight : "transparent",
                  borderLeft: isActive ? `3px solid ${T.primary}` : "3px solid transparent",
                  transition: "all 0.1s",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isActive ? T.primaryGlow : T.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isActive ? T.primary : T.textMuted, flexShrink: 0,
                }}>
                  {Ico[item.icon]?.(16)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.subtitle}
                  </div>
                </div>
                {item.shortcut && (
                  <span style={{
                    fontSize: 10, color: T.textMuted, background: T.bg,
                    padding: "2px 8px", borderRadius: 4, fontWeight: 600, flexShrink: 0,
                  }}>{item.shortcut}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {q.length > 0 && selectableItems.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "10px 20px", borderTop: `1px solid ${T.borderLight}`,
            fontSize: 11, color: T.textMuted,
          }}>
            <span><b style={{ fontFamily: "monospace", background: T.bg, padding: "1px 5px", borderRadius: 3 }}>&uarr;&darr;</b> navigate</span>
            <span><b style={{ fontFamily: "monospace", background: T.bg, padding: "1px 5px", borderRadius: 3 }}>&crarr;</b> select</span>
            <span><b style={{ fontFamily: "monospace", background: T.bg, padding: "1px 5px", borderRadius: 3 }}>esc</b> close</span>
            <span style={{ marginLeft: "auto" }}>{selectableItems.length} result{selectableItems.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default UniversalSearch;
