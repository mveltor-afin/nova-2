import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// RELEASE DATA
// ─────────────────────────────────────────────
const RELEASES = [
  {
    version: "2.25.0",
    date: "18 Apr 2026",
    title: "Ops Case Wizard, Team Routing & Pipeline Restructure",
    items: [
      { type: "New", text: "Ops Case Wizard — single 7-step modal covering the full post-UW lifecycle: UW Review → Valuation → Offer & ESIS → Instruct Solicitor → Conveyancing → Pre-Completion → Disbursement" },
      { type: "New", text: "My Cases — personal case queue for UW and Ops. Cases grouped by wizard step with Continue Processing / Open Workstation buttons. All 7 tabs always visible." },
      { type: "New", text: "Team View — team capacity dashboard with per-member cards, specialism pills, capacity bars, and expandable active case lists" },
      { type: "New", text: "AI Case Router — auto-assigns cases based on specialism match (+40), capacity (+30), mandate (+20), performance (+10). Accept individual or batch assignments." },
      { type: "Improved", text: "Ops nav restructured: Pipeline (read-only) → Incoming (UW-approved) → My Cases → Team. Replaced 12+ scattered screens with focused workflow." },
      { type: "Improved", text: "Incoming screen now shows UW decision summary per case: who approved, conditions, risk score, before ops starts processing" },
    ]
  },
  {
    version: "2.24.0",
    date: "18 Apr 2026",
    title: "Offers Management, Pipeline View & ESIS Generation",
    items: [
      { type: "New", text: "Offers Screen — track all active offers with 90-day validity countdown, ESIS status, chase/extend buttons" },
      { type: "New", text: "ESIS document viewer — generates European Standardised Information Sheet with lender details, key features, monthly payment, total payable, ERC schedule, repossession warning" },
      { type: "New", text: "Pipeline View — full case pipeline visible to UW and Ops with 12 columns: DIP status, ESIS, Offer, Solicitor, Adviser, Risk score" },
      { type: "Improved", text: "Pipeline and Offers added to both UW and Ops nav groups" },
    ]
  },
  {
    version: "2.23.0",
    date: "18 Apr 2026",
    title: "Solicitor Panel, Conveyancing Tracker & Squad Enhancement",
    items: [
      { type: "New", text: "Solicitor added to squad — 4th team member on every case (orange colour scheme). 5 firms on panel: Harrison & Co, Blake Lewis, Carter & Webb, Deacon Marsh, Ellis Wright" },
      { type: "New", text: "Solicitor Panel Management — firm table with SRA numbers, specialism, avg completion days, rating, capacity. Status management: Active/Suspended/Under Review" },
      { type: "New", text: "Conveyancing Tracker — 9-stage milestone timeline (Instructed → Completion) with SLA monitoring, buyer/seller solicitor cards, Chase Solicitor button" },
      { type: "Improved", text: "Squad Panel dynamically shows 3 or 4 columns based on whether solicitor is assigned" },
    ]
  },
  {
    version: "2.22.0",
    date: "18 Apr 2026",
    title: "Commercial Lending, Bridging Finance & Loan Wizard Enhancement",
    items: [
      { type: "New", text: "4 new lending buckets: Residential Bridging (regulated), Unregulated Bridging, Commercial Mortgage (office/retail/industrial), Development Finance (staged drawdown)" },
      { type: "New", text: "Loan Wizard lending type selector: Residential, Buy-to-Let, Commercial, Bridging, Development — with entity type for commercial (Ltd/SPV/Partnership)" },
      { type: "New", text: "4 commercial cases in pipeline: BTL portfolio (GreenLeaf Properties), Commercial (Bright Futures), Regulated Bridge (Reynolds), Development SPV (Orion Developments)" },
      { type: "New", text: "Product Catalogue split: Residential tab (Prime, HNW, BTL, Regulated Bridging) and Commercial tab (Unregulated Bridging, Commercial Mortgage, Development Finance)" },
      { type: "Improved", text: "Auto-generated product codes for all lending products (P-2F, B-TR, RB-RG, CM-5F, DF-MZ)" },
      { type: "Improved", text: "Wizard filters products by lending type — selecting Commercial only shows commercial products" },
    ]
  },
  {
    version: "2.21.0",
    date: "18 Apr 2026",
    title: "Customer App, Agentic AI & Platform Cleanup",
    items: [
      { type: "New", text: "Customer App — mobile-first fintech mortgage companion with 8 screens: Home, Eligibility Check, Case Tracker, Mortgage Dashboard (overpayment calculator, rate switch), Savings Hub, Messaging, AI Adviser, Profile" },
      { type: "New", text: "AI Underwriting Copilot — conversational AI in UW Workstation answering case questions with source citations and confidence scores" },
      { type: "New", text: "Smart Document Extraction — LLM document parsing with cross-document validation (employer, income, NI across 4 docs) and 8 anomaly checks (gambling, payday loans, crypto)" },
      { type: "New", text: "Case Orchestration Agent — autonomous workflow management with auto badge, approve/reject for human decisions" },
      { type: "New", text: "Retention Agent — monitors rate expiries, auto-generates offers, churn risk scoring" },
      { type: "New", text: "Collections Agent — graduated 6-step contact strategy with vulnerability detection" },
      { type: "Improved", text: "Platform cleanup — all product names updated to bucket-style, dead code removed, data consistency across 12 files, Change Product modal wired to bucket engine" },
      { type: "Fixed", text: "Broker view stuck on case detail when clicking nav — mode reset on navigation" },
      { type: "Fixed", text: "Change Product not working — pricing engine now seeds bucket defaults in localStorage" },
    ]
  },
  {
    version: "2.20.0",
    date: "18 Apr 2026",
    title: "Savings Catalogue Redesign & UW Workstation Overhaul",
    items: [
      { type: "New", text: "Savings Product Catalogue redesigned — bucket = category (Fixed Term, Notice, Easy Access, LISA), term as product field, balance-based rate tiers (toggle), condition tier wizard with loyalty/wrapper selectors" },
      { type: "New", text: "UW Overview tab — case journey timeline at top, 3-column layout (Product & Pricing, AI Assessment, Applicant), lifecycle removed (not relevant pre-completion)" },
      { type: "New", text: "Savings, Shared Ownership & Insurance product catalogues with subtabs" },
      { type: "Improved", text: "UW tabs simplified to text-only labels. Lifecycle tab removed." },
      { type: "Improved", text: "Permissions expanded to 197 across 8 roles including Product Manager, Risk Analyst, BDM" },
    ]
  },
  {
    version: "2.19.0",
    date: "17 Apr 2026",
    title: "Product Buckets Wired End-to-End & Tier Redesign",
    items: [
      { type: "New", text: "Bucket-aware eligibility wired to all screens — Eligibility Calculator, Smart Apply, Loan Wizard, UW Workstation, Broker Pipeline, Mortgages Screen, Customer Hub" },
      { type: "New", text: "Product × Tier rows in Rates tab — each tier gets its own row with adjustment shown" },
      { type: "Improved", text: "Criteria consolidated — merged redundant dimensions section into Credit, Employment, Property sections" },
      { type: "Improved", text: "Rate Matrix and Pricing Config rewired to read bucket data from localStorage instead of old PRODUCTS_PRICING" },
      { type: "Fixed", text: "All unicode escapes (£, ≤, ·, —, –) replaced with actual characters across 10 files" },
    ]
  },
  {
    version: "2.18.0",
    date: "17 Apr 2026",
    title: "Broker Help Centre & Product AI Assistant",
    items: [
      { type: "New", text: "Broker Help Centre — dedicated modal with two tabs: Product Guide and Ask Nova AI" },
      { type: "New", text: "Product Guide tab — browse all mortgage buckets with live rates, criteria, fees, tiers, and accepted dimensions pulled from Product Catalogue" },
      { type: "New", text: "Ask Nova AI tab — conversational LLM assistant for brokers. Ask about products, rates, eligibility, credit profiles, fees, documents, commission, LTV bands, and pricing tiers" },
      { type: "New", text: "Quick question chips — one-tap common questions for instant answers" },
      { type: "Improved", text: "Help Centre button added to Broker Dashboard header for easy access alongside New Loan" },
    ]
  },
  {
    version: "2.17.0",
    date: "17 Apr 2026",
    title: "Product Buckets Wired to Broker Flow & Pricing Tiers Redesign",
    items: [
      { type: "New", text: "Bucket-aware eligibility — Eligibility Calculator now reads product bucket data and enforces all bucket-level criteria: max LTV, accepted credit profiles, employment, property, EPC, loan size limits, and age caps" },
      { type: "New", text: "Bucket and tier info shown on eligibility results — product code, bucket name badge, applied tier, tier adjustment, and product fee" },
      { type: "Improved", text: "Pricing Tiers redesigned from flat text to styled cards with condition pills, adjustment badges, and colour-coded tier borders" },
      { type: "Improved", text: "Criteria tab consolidated — merged redundant 'Accepted Dimensions' section into Credit, Employment, and Property sections. Added 'Maximum Accepted' credit profile summary row" },
      { type: "Improved", text: "Property Type selector expanded with all dimension values (Standard, Non-Standard, New Build, Ex-Local Authority, High-Rise, BTL)" },
      { type: "Improved", text: "Employment option fixed from 'Contract' to 'Contractor' to match pricing dimensions" },
      { type: "Improved", text: "LoanWizard now passes property type and EPC through to pricing engine (previously collected but not used)" },
      { type: "Fixed", text: "All unicode escape sequences (\\u00a3, \\u2264, \\u00b7, \\u2014, \\u2013) replaced with actual £, ≤, ·, —, – characters across 10 files" },
    ]
  },
  {
    version: "2.16.0",
    date: "16 Apr 2026",
    title: "Unified Data Model, Business Customers & Servicing Enhancements",
    items: [
      { type: "New", text: "Repayment Schedule tab in Mortgage Servicing — full amortisation table, principal vs interest breakdown chart, outstanding balance curve" },
      { type: "New", text: "Business customer support — company type, registration number, directors, industry, turnover, trading years. 2 business customers with BTL and commercial products" },
      { type: "New", text: "Agentic data layer (src/data/index.js) — unified query functions: getCustomerAggregate, getCaseAggregate, getAtRiskCustomers, globalSearch" },
      { type: "New", text: "Mortgage product drill-down — View Customer, View Case, View Servicing buttons from the Mortgages screen" },
      { type: "Improved", text: "Unified data model — customerId and servicingId on every loan, standardised origRef across all data files, unified risk schema" },
      { type: "Improved", text: "ID-based navigation — replaced fragile name-based customer lookups with robust ID-first matching" },
      { type: "Improved", text: "Complaints data extracted from CustomerHub into centralised data layer" },
      { type: "Fixed", text: "Broker dashboard stepper/squad label overlap" },
      { type: "Fixed", text: "Servicing modal uses customerId for account lookup instead of name matching" },
    ]
  },
  {
    version: "2.15.0",
    date: "13 Apr 2026",
    title: "Navigation Overhaul & Case Modals",
    items: [
      { type: "New", text: "Servicing opens as modal overlay from customer view — no context lost" },
      { type: "New", text: "Case/UW Workstation opens as modal from customer view — all 9 tabs work inside the modal" },
      { type: "New", text: "Customer Hub restructured — Overview tab with AI first, Lifecycle timeline, Complaints tab, Communications logging" },
      { type: "New", text: "UW Workstation now has 9 tabs: Evidence, Income, Decision Engine, Documents, Policy, Comparisons, Lifecycle, Consumer Duty, Recommendation" },
      { type: "Improved", text: "Customer name clickable in UW Workstation header — navigates to CustomerHub" },
      { type: "Improved", text: "Origination references clickable — opens the case from customer product cards" },
      { type: "Improved", text: "Decision controls moved to Recommendation tab — right-hand rail removed" },
      { type: "Fixed", text: "7 navigation disconnects fixed across the platform" },
      { type: "Fixed", text: "10 orphaned files deleted" },
    ]
  },
  {
    version: "2.14.0",
    date: "12 Apr 2026",
    title: "Game-Changer Release — 10 Major Enhancements",
    items: [
      { type: "New", text: "Real-Time Decisioning Engine — interactive sliders let underwriters adjust parameters and watch AI risk scores recalculate live with explainable scoring" },
      { type: "New", text: "Document Intelligence — AI-powered extraction, cross-document verification and anomaly detection for payslips, P60s, bank statements, valuations and more" },
      { type: "New", text: "Customer Lifecycle Predictor — predictive timeline showing future events (rate switches, maturities, churn risk) with confidence bands and cross-sell opportunities" },
      { type: "New", text: "Ops Command Centre — real-time SLA heatmap, bottleneck funnel, squad utilisation, auto-escalation queue and live activity feed" },
      { type: "New", text: "Broker Portal — dedicated broker-facing view with instant eligibility checker, live DIP tracker, commission dashboard and product catalogue" },
      { type: "New", text: "Interactive Scenario Modeller — drag sliders for base rate, unemployment, house prices and inflation to see portfolio impact recalculate live" },
      { type: "New", text: "Embedded Compliance Engine — FCA Consumer Duty dashboard with fair value scorecard, vulnerability tracking, outcome monitoring timeline and compliance coverage map" },
      { type: "New", text: "White-Label Theme Editor — customise branding, colours and typography with live preview, pre-built themes and JSON export" },
      { type: "New", text: "API Observatory — live integration health monitor with latency trends, circuit breaker status, degradation alerts and fallback strategies" },
      { type: "New", text: "My Inbox — universal notification hub aggregating @mentions, questions, tasks and alerts across the platform with filter tabs and quick actions" },
    ]
  },
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
