import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// RELEASE DATA
// ─────────────────────────────────────────────
const RELEASES = [
  {
    version: "2.13.0",
    date: "10 Apr 2026",
    title: "Per-Persona Releases · Product Wizard · Customer Hub Filtering",
    items: [
      { type: "New", text: "Release Centre is now persona-aware — every role sees only releases relevant to their day-to-day work" },
      { type: "New", text: "Powerful Product Wizard in Admin > Product Catalogue — three-step flow with type-aware parameters for mortgages, notice accounts, fixed term deposits, ISAs, current accounts and insurance" },
      { type: "New", text: "Compliance step on product creation — target market, fair value rating, Consumer Duty outcome mapping" },
      { type: "Improved", text: "Customer Hub: clicking a product now scopes Timeline, Documents, Communications and Integrations to that product only" },
      { type: "Improved", text: "Per-product filter pill on customer detail tabs — clear filter to return to all-product view" },
    ]
  },
  {
    version: "2.12.0",
    date: "10 Apr 2026",
    title: "AI Income Predictor for Underwriters",
    items: [
      { type: "New", text: "AI Income Predictor in Income Analysis — projects 5-year income trajectory based on job title, sector, seniority and years of experience" },
      { type: "New", text: "Sector-weighted growth model with confidence band and peer benchmark range" },
      { type: "New", text: "Sustainability badge driven by predicted growth (Strong / Stable / Modest / Flat)" },
    ]
  },
  {
    version: "2.11.0",
    date: "10 Apr 2026",
    title: "BDM Dashboard Redesign + Pipeline Screen",
    items: [
      { type: "Improved", text: "BDM Dashboard restructured — Today's Focus AI card, This Week meetings strip, full-width Recent Enquiries" },
      { type: "New", text: "Dedicated Pipeline screen for BDMs — conversion funnel, leaderboard, pipeline-by-stage breakdown" },
      { type: "Improved", text: "Removed scrolling pain in BDM right column by splitting into focused screens" },
    ]
  },
  {
    version: "2.10.0",
    date: "9 Apr 2026",
    title: "Instant Navigation",
    items: [
      { type: "Improved", text: "Removed artificial loading delays — page transitions now feel instant (saved 350ms per click)" },
    ]
  },
  {
    version: "2.9.0",
    date: "9 Apr 2026",
    title: "Interactive Enhancements",
    items: [
      { type: "New", text: "6 interactive features added across the platform for smoother day-to-day workflows" },
    ]
  },
  {
    version: "2.8.0",
    date: "9 Apr 2026",
    title: "CTO Refinements — Permissions, Navigation & Modals",
    items: [
      { type: "Improved", text: "Journey Analytics restricted to Admin persona only" },
      { type: "New", text: "Product selector on Journey Analytics — KPIs adapt per product" },
      { type: "Improved", text: "Broker Scorecards moved to BDM-only view" },
      { type: "Improved", text: "Broker view now shows the broker's own customers as prospects (not the bank's full base)" },
      { type: "Improved", text: "BDM New Enquiry now opens as a modal popup" },
    ]
  },
  {
    version: "2.7.0",
    date: "9 Apr 2026",
    title: "Wired Components + Session, Autosave & Inline Help",
    items: [
      { type: "New", text: "Session timeout, autosave drafts, inline contextual help" },
      { type: "Fixed", text: "Wired 8 orphaned components into appropriate screens" },
      { type: "Improved", text: "Persona-filtered content across Release Centre, Help Centre, AI Tips and AI Summaries — brokers no longer see internal data" },
    ]
  },
  {
    version: "2.6.0",
    date: "9 Apr 2026",
    title: "Help Centre, Release Centre & AI Enhancements",
    items: [
      { type: "New", text: "Help Centre with contextual per-screen guides, FAQ, keyboard shortcuts" },
      { type: "New", text: "Release Centre (this screen) replacing simple WhatsNew modal" },
      { type: "New", text: "Toast notifications for all actions" },
      { type: "New", text: "AI screen summaries — dynamic one-liner at top of every screen" },
      { type: "New", text: "Recent activity ribbon — last 5 screens as clickable breadcrumb" },
      { type: "Improved", text: "Contextual AI tips for power-user features" },
    ]
  },
  {
    version: "2.5.0",
    date: "9 Apr 2026",
    title: "Squad Allocation & Income Analysis",
    items: [
      { type: "New", text: "Squad allocation — every case gets Adviser + Underwriter + Customer Care" },
      { type: "New", text: "Income Analysis with complex income visualisation" },
      { type: "Fixed", text: "Policy Checker and Comparison Engine now support all cases via dropdown" },
      { type: "Fixed", text: "All unicode escape sequences replaced with actual characters" },
      { type: "Improved", text: "Parties tab fully built (applicants, solicitor, connected parties)" },
    ]
  },
  {
    version: "2.4.0",
    date: "9 Apr 2026",
    title: "Underwriter Engine & BDM Persona",
    items: [
      { type: "New", text: "AI-powered Underwriter Engine (Smart Queue, Workstation, Comparison, Policy Checker, Performance)" },
      { type: "New", text: "BDM persona with enquiry flow and squad allocation" },
      { type: "Improved", text: "Navigation simplified per persona — fewer clicks, smarter defaults" },
    ]
  },
  {
    version: "2.3.0",
    date: "8 Apr 2026",
    title: "Platform Enhancements & Reporting",
    items: [
      { type: "New", text: "14 platform enhancements (commission tracker, stress testing, pricing engine, board pack, compliance calendar, and more)" },
      { type: "New", text: "My Reports — per-persona one-click reporting" },
      { type: "Improved", text: "Error boundary prevents blank pages on screen crashes" },
    ]
  },
  {
    version: "2.2.0",
    date: "8 Apr 2026",
    title: "Servicing Redesign & Smart Apply",
    items: [
      { type: "New", text: "Servicing redesign — account-centric with AI-driven action modals" },
      { type: "New", text: "Smart Apply — conversational 3-phase application flow" },
      { type: "Improved", text: "Mobile responsive layout for iPhone" },
    ]
  },
  {
    version: "2.1.0",
    date: "7 Apr 2026",
    title: "Customer 360 Hub & Product Types",
    items: [
      { type: "New", text: "Customer 360 Hub with gamification (tiers, badges, payment streaks)" },
      { type: "New", text: "6 product types (Mortgages, Savings, Current Accounts, Insurance, Shared Ownership)" },
      { type: "New", text: "AI Dashboard, Intake Queue, Case Workbench" },
    ]
  },
  {
    version: "2.0.0",
    date: "7 Apr 2026",
    title: "Nova 2.0 Launch",
    items: [
      { type: "New", text: "Nova 2.0 — customer-first architecture" },
      { type: "New", text: "40+ screens, 6 personas" },
      { type: "New", text: "AI-native mortgage lending platform" },
    ]
  },
  {
    version: "1.0.0",
    date: "6 Apr 2026",
    title: "Original Nova Platform",
    items: [
      { type: "New", text: "Original Nova platform (product-first)" },
      { type: "Improved", text: "Migrated to Nova 2.0" },
    ]
  },
];

const TYPE_BADGE = {
  New:      { bg: "#D1FAE5", color: "#065F46" },
  Improved: { bg: "#DBEAFE", color: "#1E40AF" },
  Fixed:    { bg: "#FEF3C7", color: "#92400E" },
};

const FILTER_TABS = ["All", "New Features", "Improvements", "Bug Fixes"];
const typeForFilter = { "New Features": "New", "Improvements": "Improved", "Bug Fixes": "Fixed" };

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
// Per-persona relevance filter — each role sees what matters to their day-to-day.
// SHARED items (cross-cutting platform improvements) are visible to everyone.
const SHARED_KEYWORDS = [
  "navigation","help centre","release centre","toast","session","autosave",
  "mobile","instant","ux","layout","kpi","theme","onboarding","persona",
  "error boundary","responsive","performance","ai summaries","activity ribbon",
  "tips","wizard","modal","breadcrumb","journey",
];

const PERSONA_KEYWORDS = {
  Broker: ["smart apply","eligibility","commission","broker","dip","application","pipeline","portal","prospect","scenario","scorecard"],
  BDM: ["bdm","enquiry","broker","pipeline","leaderboard","scorecard","funnel","meeting","focus","squad","prospect","conversion"],
  Underwriter: ["underwriter","uw","policy","income","verification","comparison","workstation","queue","approval","case","predictor","stress","decision","risk","needs attention"],
  "Risk Analyst": ["risk","stress","compliance","consumer duty","fair value","vulnerability","outcome","monitoring","duty","fca","scorecard"],
  Finance: ["disbursement","commission","reconcil","payment","accounting","reporting","report","mi","stress","pricing"],
  Ops: ["servicing","payment","arrears","direct debit","case","needs attention","kyc","intake","customer care","squad","parties"],
  "Customer Care": ["servicing","customer","squad","kyc","comm","communication","payment","needs attention","care"],
  Admin: null, // null = see everything
};

const filterForPersona = (items, persona) => {
  const personaKeywords = PERSONA_KEYWORDS[persona];
  if (personaKeywords === null || personaKeywords === undefined) return items;
  const allowed = [...personaKeywords, ...SHARED_KEYWORDS];
  return items.filter(item => allowed.some(kw => item.text.toLowerCase().includes(kw)));
};

export default function ReleaseCentre({ persona }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(RELEASES[0]?.version || null);
  const [readVersions, setReadVersions] = useState([]);

  const q = search.toLowerCase().trim();
  const activeType = typeForFilter[filter] || null;

  const filteredReleases = RELEASES.map(r => {
    const items = filterForPersona(r.items, persona).filter(item => {
      const matchesType = !activeType || item.type === activeType;
      const matchesSearch = !q || item.text.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.version.includes(q);
      return matchesType && matchesSearch;
    });
    return { ...r, items };
  }).filter(r => r.items.length > 0);

  const markAllRead = () => setReadVersions(RELEASES.map(r => r.version));
  const isUnread = (v) => !readVersions.includes(v);

  return (
    <div style={{ fontFamily: T.font, maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {Ico.sparkle(22)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Release Centre</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>Platform updates, new features, and improvements</div>
            </div>
          </div>
          <Btn small ghost onClick={markAllRead} icon="check">Mark all as read</Btn>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: "0 14px", marginBottom: 16 }}>
        <span style={{ color: T.textMuted }}>{Ico.search(16)}</span>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search releases by keyword..."
          style={{ flex: 1, padding: "11px 0", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }}
        />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(14)}</button>}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
        {FILTER_TABS.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "none", border: "none", borderBottom: filter === t ? `2px solid ${T.primary}` : "2px solid transparent",
            color: filter === t ? T.primary : T.textMuted, fontFamily: T.font, transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* Releases */}
      {filteredReleases.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted, fontSize: 14 }}>No releases match your search or filter.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredReleases.map(r => {
          const isOpen = expanded === r.version;
          const unread = isUnread(r.version);
          return (
            <Card key={r.version} style={{ padding: 0, overflow: "hidden", border: unread ? `1px solid ${T.primary}33` : undefined }}>
              {/* Release header */}
              <div
                onClick={() => {
                  setExpanded(isOpen ? null : r.version);
                  if (!readVersions.includes(r.version)) setReadVersions(prev => [...prev, r.version]);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                    background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, color: "#fff", letterSpacing: 0.3,
                  }}>v{r.version}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{r.title}</span>
                  {unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, flexShrink: 0 }} />}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{r.date}</span>
                  <span style={{ color: T.textMuted, transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", display: "flex" }}>{Ico.arrow(14)}</span>
                </div>
              </div>

              {/* Release detail */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${T.borderLight}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 }}>
                    {r.items.map((item, j) => {
                      const badge = TYPE_BADGE[item.type] || TYPE_BADGE.New;
                      return (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                            background: badge.bg, color: badge.color, flexShrink: 0, marginTop: 2,
                            textTransform: "uppercase", letterSpacing: 0.4, lineHeight: "14px",
                          }}>{item.type}</span>
                          <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 12, color: T.textMuted }}>
        Nova 2.0 — {RELEASES.length} releases
      </div>
    </div>
  );
}
