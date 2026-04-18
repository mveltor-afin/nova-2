import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES, TIERS, BADGES } from "../data/customers";
import { COMPLAINTS } from "../data/index";
import JourneyMap from "./JourneyMap";
import ConnectionsTab from "./ConnectionsTab";
import LifecyclePredictor from "./LifecyclePredictor";

// ─── Tier colours ───
const TIER_COLORS = { Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#FFD700", Platinum: "#E5E4E2" };
const TIER_GRADIENTS = {
  Bronze:   "linear-gradient(135deg,#CD7F32,#A0522D)",
  Silver:   "linear-gradient(135deg,#C0C0C0,#A8A8A8)",
  Gold:     "linear-gradient(135deg,#FFD700,#DAA520)",
  Platinum: "linear-gradient(135deg,#E5E4E2,#B0ADA8)",
};

const PRIORITY_COLORS = { Critical: "#DC2626", High: "#F59E0B", Medium: "#3B82F6", Low: "#9CA3AF" };
const ACTION_TYPE_COLORS = {
  retention: "#8B5CF6", "cross-sell": "#0EA5E9", collections: "#DC2626",
  compliance: "#F59E0B", onboarding: "#31B897", "follow-up": "#6366F1", risk: "#EF4444",
};

const KYC_STYLE = {
  Verified: { bg: "#D1FAE5", color: "#065F46" },
  Expired:  { bg: "#FEE2E2", color: "#991B1B" },
  Pending:  { bg: "#FEF3C7", color: "#92400E" },
};

const fmt = v => v; // values already formatted in data

// ─── Helper: initials ───
const initials = name => name.split(/[\s&]+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

// ─── Helper: mock timeline events for a customer ───
function buildTimeline(customer, products) {
  const events = [];
  const pids = [...customer.products, ...customer.pendingProducts];
  const now = new Date(2026, 3, 6);
  const types = { payment: "#31B897", deposit: "#FFBF00", rateChange: "#8B5CF6", comm: "#3B82F6", login: "#6366F1", application: "#0EA5E9", status: "#F59E0B" };

  products.forEach(p => {
    if (p.type === "Mortgage" && p.status !== "Application") {
      for (let i = 0; i < 5; i++) {
        const d = new Date(now); d.setMonth(d.getMonth() - i);
        events.push({ date: d, type: "payment", icon: "dollar", text: `Mortgage payment ${p.payment} received`, product: p.type, productId: p.id, color: types.payment });
      }
      events.push({ date: new Date(2025, 8, 15), type: "rateChange", icon: "zap", text: `Rate review completed - maintained at ${p.rate}`, product: p.type, productId: p.id, color: types.rateChange });
    }
    if (p.type === "Fixed Term Deposit") {
      events.push({ date: new Date(2024, 4, 18), type: "deposit", icon: "dollar", text: `Fixed term deposit opened - ${p.principal} @ ${p.rate}`, product: p.type, productId: p.id, color: types.deposit });
      events.push({ date: new Date(2025, 2, 1), type: "deposit", icon: "chart", text: `Interest credited: ${p.interestEarned}`, product: p.type, productId: p.id, color: types.deposit });
    }
    if (p.type === "Notice Account") {
      events.push({ date: new Date(2025, 6, 10), type: "deposit", icon: "wallet", text: `Notice account deposit +£2,000`, product: p.type, productId: p.id, color: types.deposit });
    }
    if (p.type === "Insurance") {
      events.push({ date: new Date(2025, 10, 1), type: "application", icon: "shield", text: `Insurance policy ${p.status === "Pending Quote" ? "quote requested" : "activated"} - ${p.product}`, product: p.type, productId: p.id, color: types.application });
    }
    if (p.type === "Current Account") {
      events.push({ date: new Date(2026, 2, 28), type: "payment", icon: "wallet", text: `Direct debit: Council Tax - £185`, product: p.type, productId: p.id, color: types.payment });
      events.push({ date: new Date(2026, 2, 25), type: "payment", icon: "wallet", text: `Standing order: Savings transfer - £500`, product: p.type, productId: p.id, color: types.payment });
    }
  });

  // Generic events
  events.push({ date: new Date(2026, 3, 5), type: "login", icon: "eye", text: "Customer logged in via mobile app", product: null, productId: null, color: types.login });
  events.push({ date: new Date(2026, 3, 1), type: "comm", icon: "messages", text: "Monthly statement generated and emailed", product: null, productId: null, color: types.comm });
  events.push({ date: new Date(2026, 2, 20), type: "login", icon: "eye", text: "Customer viewed mortgage details online", product: "Mortgage", productId: null, color: types.login });
  events.push({ date: new Date(2026, 2, 15), type: "comm", icon: "send", text: "Rate switch reminder email sent", product: "Mortgage", productId: null, color: types.comm });
  events.push({ date: new Date(2026, 1, 10), type: "comm", icon: "messages", text: "Customer called - enquired about overpayments", product: "Mortgage", productId: null, color: types.comm });
  events.push({ date: new Date(2026, 0, 5), type: "status", icon: "check", text: "Annual KYC review completed - Verified", product: null, productId: null, color: types.status });
  events.push({ date: new Date(2025, 11, 15), type: "comm", icon: "bell", text: "Christmas savings reminder notification sent", product: null, productId: null, color: types.comm });
  events.push({ date: new Date(2025, 10, 1), type: "login", icon: "eye", text: "Customer updated contact preferences", product: null, productId: null, color: types.login });
  events.push({ date: new Date(2025, 9, 20), type: "application", icon: "file", text: "Document uploaded: Proof of income", product: null, productId: null, color: types.application });
  events.push({ date: new Date(2025, 8, 1), type: "status", icon: "check", text: "Tier upgraded to " + (customer.gamification?.tier || "Bronze"), product: null, productId: null, color: types.status });

  return events.sort((a, b) => b.date - a.date);
}

// ─── Helper: mock documents ───
function buildDocuments(customer, products) {
  const docs = [
    { name: "Photo ID - Passport", product: null, category: "Identity", date: "15 Jan 2024", status: "Verified", confidence: 98 },
    { name: "Proof of Address - Utility Bill", product: null, category: "Identity", date: "15 Jan 2024", status: "Verified", confidence: 95 },
    { name: "Proof of Income - Payslips (3 months)", product: null, category: "Income", date: "20 Jan 2024", status: "Verified", confidence: 92 },
    { name: "Bank Statements (3 months)", product: null, category: "Income", date: "20 Jan 2024", status: "Verified", confidence: 89 },
  ];
  products.forEach(p => {
    if (p.type === "Mortgage") {
      docs.push({ name: "Mortgage Offer Letter", product: p.type, category: "Mortgage", date: "01 Mar 2024", status: "Verified", confidence: 99 });
      docs.push({ name: "Mortgage Deed", product: p.type, category: "Mortgage", date: "15 Apr 2024", status: "Verified", confidence: 97 });
      docs.push({ name: "Property Valuation Report", product: p.type, category: "Mortgage", date: "28 Feb 2024", status: "Verified", confidence: 94 });
      docs.push({ name: "Mortgage Terms & Conditions", product: p.type, category: "Mortgage", date: "01 Mar 2024", status: "Verified", confidence: 99 });
    }
    if (p.type === "Fixed Term Deposit" || p.type === "Notice Account") {
      docs.push({ name: `${p.type} Application Form`, product: p.type, category: "Savings", date: "18 May 2024", status: "Verified", confidence: 96 });
      docs.push({ name: `${p.type} T&C Agreement`, product: p.type, category: "Savings", date: "18 May 2024", status: "Verified", confidence: 99 });
    }
    if (p.type === "Insurance") {
      docs.push({ name: "Insurance Certificate", product: p.type, category: "Insurance", date: "01 Nov 2025", status: p.status === "Pending Quote" ? "Pending" : "Verified", confidence: p.status === "Pending Quote" ? 0 : 97 });
      docs.push({ name: "Policy Schedule", product: p.type, category: "Insurance", date: "01 Nov 2025", status: p.status === "Pending Quote" ? "Pending" : "Verified", confidence: p.status === "Pending Quote" ? 0 : 98 });
    }
  });
  return docs;
}

// ─── Helper: mock communications ───
function buildComms(customer) {
  return [
    { channel: "Email", subject: "Monthly Statement - March 2026", snippet: "Your monthly statement is ready to view...", date: "01 Apr 2026", product: null },
    { channel: "SMS", subject: "Payment Confirmation", snippet: "Your mortgage payment of £980 has been received.", date: "15 Mar 2026", product: "Mortgage" },
    { channel: "Call", subject: "Overpayment Enquiry", snippet: "Customer called re: mortgage overpayment options. Advised on partial overpayment up to 10%...", date: "10 Feb 2026", product: "Mortgage" },
    { channel: "Email", subject: "Rate Switch Reminder", snippet: "Your fixed rate period ends soon. Review your options...", date: "15 Feb 2026", product: "Mortgage" },
    { channel: "Push", subject: "New Savings Rate Available", snippet: "We have new competitive fixed rates for loyal customers.", date: "01 Feb 2026", product: "Savings" },
    { channel: "Email", subject: "Annual Review Invitation", snippet: "Book your annual financial health check with your advisor.", date: "05 Jan 2026", product: null },
    { channel: "System", subject: "KYC Verification Complete", snippet: "Your identity verification has been successfully completed.", date: "05 Jan 2026", product: null },
    { channel: "Call", subject: "Welcome Call", snippet: "Introductory call completed. Customer satisfied with onboarding.", date: "15 Mar 2024", product: null },
    { channel: "Email", subject: "Mortgage Completion Confirmation", snippet: "Congratulations! Your mortgage has completed successfully.", date: "15 Apr 2024", product: "Mortgage" },
    { channel: "SMS", subject: "Direct Debit Setup", snippet: "Your direct debit for mortgage payments has been set up.", date: "20 Apr 2024", product: "Mortgage" },
    { channel: "Email", subject: "Savings Account Opened", snippet: "Your new savings account is now active and ready to use.", date: "18 May 2024", product: "Savings" },
    { channel: "Push", subject: "Tier Upgrade!", snippet: `Congratulations! You've been upgraded to ${customer.gamification?.tier || "Bronze"} tier.`, date: "01 Sep 2025", product: null },
  ];
}

const CHANNEL_COLORS = { Email: "#3B82F6", SMS: "#31B897", Call: "#8B5CF6", Push: "#F59E0B", System: "#6B7280" };
const TABS = ["Overview", "Products", "Connections", "Timeline", "Documents", "Communications", "Customer Service", "Complaints", "Integrations", "Risk"];

/* ─── Mock service interactions per customer ─── */
const SERVICE_HISTORY = {
  "CUS-001": [
    { id: "SVC-001", date: "10 Apr 2026", time: "14:22", type: "Inbound Call", duration: "8 min", agent: "Tom Walker", sentiment: "Positive",
      subject: "Rate switch enquiry", notes: "Customer called to ask about options when her fixed rate expires in Aug. Explained 2yr and 5yr fix options. Customer will discuss with partner and call back.", outcome: "Follow-up Required", followUp: "Call back in 1 week" },
    { id: "SVC-002", date: "15 Mar 2026", time: "10:05", agent: "Tom Walker", type: "Outbound Call", duration: "5 min", sentiment: "Positive",
      subject: "Annual review check-in", notes: "Proactive annual review call. Customer happy with mortgage, considering opening a savings account. Sent savings product brochure via email.", outcome: "Resolved", followUp: null },
    { id: "SVC-003", date: "20 Jan 2026", time: "16:40", agent: "Lucy Fernandez", type: "Email", duration: "—", sentiment: "Neutral",
      subject: "Statement request", notes: "Customer requested a formal mortgage statement for tax purposes. Generated and emailed within 2 hours.", outcome: "Resolved", followUp: null },
  ],
  "CUS-003": [
    { id: "SVC-004", date: "12 Apr 2026", time: "09:15", agent: "Lucy Fernandez", type: "Inbound Call", duration: "22 min", sentiment: "Distressed",
      subject: "Arrears discussion — vulnerability", notes: "Customer called very upset about arrears letters. Explained vulnerability protocol is active. Customer is on long-term sick from work. Discussed repayment options. Customer agreed to £50/week arrangement. Referred to Citizens Advice for additional support.", outcome: "Arrangement Made", followUp: "Review arrangement in 4 weeks" },
    { id: "SVC-005", date: "28 Mar 2026", time: "11:30", agent: "Tom Walker", type: "Outbound Call", duration: "0 min", sentiment: "N/A",
      subject: "Welfare check", notes: "Attempted welfare check — no answer. Left voicemail asking customer to call back at their convenience. No pressure.", outcome: "No Contact", followUp: "Try again in 3 days" },
    { id: "SVC-006", date: "15 Mar 2026", time: "14:00", agent: "Emma Chen", type: "Internal Note", duration: "—", sentiment: "N/A",
      subject: "Vulnerability flag review", notes: "Reviewed vulnerability case. Customer's employer confirmed long-term sick leave. Income protection claim in progress. Recommend maintaining vulnerability protocol and suppressing automated letters.", outcome: "Action Taken", followUp: "Review monthly" },
  ],
  "CUS-006": [
    { id: "SVC-007", date: "5 Apr 2026", time: "15:45", agent: "Tom Walker", type: "Outbound Call", duration: "0 min", sentiment: "N/A",
      subject: "Collections contact attempt", notes: "No answer. No voicemail set up. This is the 4th failed contact attempt in 60 days.", outcome: "No Contact", followUp: "Escalate to collections manager" },
    { id: "SVC-008", date: "10 Feb 2026", time: "10:20", agent: "Lucy Fernandez", type: "Inbound Call", duration: "12 min", sentiment: "Frustrated",
      subject: "Account access complaint", notes: "Customer frustrated about being locked out of online portal after 2 failed login attempts. Reset password and unlocked account. Customer asked why threshold is so low. Logged as complaint CMP-002.", outcome: "Complaint Raised", followUp: null },
  ],
};

// Complaints imported from data/index.js (single source of truth)

// Maps a product type → loose "comm category" used in mock comms data
const TYPE_TO_COMM_CATEGORY = {
  "Mortgage": "Mortgage",
  "Shared Ownership": "Mortgage",
  "Fixed Term Deposit": "Savings",
  "Notice Account": "Savings",
  "Current Account": "Banking",
  "Insurance": "Insurance",
};

// Which integrations are relevant per product type
const INTEGRATIONS_BY_TYPE = {
  "Mortgage": ["Open Banking","Credit Bureau","Land Registry","HMRC","E-Signature"],
  "Shared Ownership": ["Open Banking","Credit Bureau","Land Registry","HMRC","E-Signature"],
  "Fixed Term Deposit": ["Open Banking","KYC","HMRC"],
  "Notice Account": ["Open Banking","KYC","HMRC"],
  "Current Account": ["Open Banking","KYC","HMRC"],
  "Insurance": ["KYC","E-Signature"],
};

// ═════════════════════════════════════════════════════════════════
// CUSTOMER HUB
// ═════════════════════════════════════════════════════════════════
export default function CustomerHub({ customerId, onBack, onOpenCase, onOpenServicing }) {
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return <div style={{ padding: 40, fontFamily: T.font, color: T.text }}>Customer not found.</div>;

  const allProductIds = [...customer.products, ...customer.pendingProducts];
  const customerProducts = PRODUCTS.filter(p => allProductIds.includes(p.id));
  const activeProducts = PRODUCTS.filter(p => customer.products.includes(p.id));
  const pendingProducts = PRODUCTS.filter(p => customer.pendingProducts.includes(p.id));
  const actions = AI_ACTIONS[customerId] || [];
  const tierData = TIERS.find(t => t.name === customer.gamification?.tier) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tierData) + 1];
  const tierColor = TIER_COLORS[tierData.name] || "#CD7F32";

  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [timelineFilter, setTimelineFilter] = useState("All");
  const [staircaseSlider, setStaircaseSlider] = useState(10);

  // Communications — log interaction state
  const [showLogForm, setShowLogForm] = useState(false);
  const [loggedInteractions, setLoggedInteractions] = useState(() => {
    try { const s = localStorage.getItem(`cust-interactions-${customerId}`); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [logForm, setLogForm] = useState({ type: "Call", subject: "", body: "", outcome: "Resolved" });
  const saveInteraction = () => {
    if (!logForm.subject.trim()) return;
    const entry = { ...logForm, id: Date.now(), date: "12 Apr 2026", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), loggedBy: "You" };
    const updated = [entry, ...loggedInteractions];
    setLoggedInteractions(updated);
    try { localStorage.setItem(`cust-interactions-${customerId}`, JSON.stringify(updated)); } catch {}
    setLogForm({ type: "Call", subject: "", body: "", outcome: "Resolved" });
    setShowLogForm(false);
  };

  // Customer Service state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ type: "Inbound Call", subject: "", notes: "", sentiment: "Neutral", outcome: "Resolved", followUp: "" });
  const [serviceInteractions, setServiceInteractions] = useState(() => {
    try { const s = localStorage.getItem(`cust-service-${customerId}`); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const saveServiceInteraction = () => {
    if (!serviceForm.subject.trim()) return;
    const entry = { ...serviceForm, id: `SVC-${Date.now()}`, date: "17 Apr 2026", time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), agent: "You", duration: "—" };
    const updated = [entry, ...serviceInteractions];
    setServiceInteractions(updated);
    try { localStorage.setItem(`cust-service-${customerId}`, JSON.stringify(updated)); } catch {}
    setServiceForm({ type: "Inbound Call", subject: "", notes: "", sentiment: "Neutral", outcome: "Resolved", followUp: "" });
    setShowServiceForm(false);
  };
  const mockServiceHistory = SERVICE_HISTORY[customerId] || [];
  const allServiceInteractions = [...serviceInteractions, ...mockServiceHistory];

  // Complaints state
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ category: "Service", description: "", severity: "Medium" });
  const customerComplaints = COMPLAINTS[customerId] || [];

  const timeline = buildTimeline(customer, activeProducts);
  const documents = buildDocuments(customer, activeProducts);
  const comms = buildComms(customer);

  // ─── Product-scoped filtering ──────────────────────────────
  // When a product card is selected, the Timeline / Documents / Comms /
  // Integrations tabs filter to only items relevant to that product.
  const selectedProductObj = selectedProduct ? PRODUCTS.find(p => p.id === selectedProduct) : null;
  const selectedType = selectedProductObj?.type || null;
  const selectedCommCat = selectedType ? TYPE_TO_COMM_CATEGORY[selectedType] : null;

  const filterTimelineByProduct = (events) => {
    if (!selectedProductObj) return events;
    return events.filter(e =>
      (e.productId && e.productId === selectedProduct) ||
      e.product === selectedType ||
      e.product === selectedCommCat
    );
  };
  const filterDocsByProduct = (docs) => {
    if (!selectedProductObj) return docs;
    return docs.filter(d => d.product === selectedType || d.category === selectedCommCat);
  };
  const filterCommsByProduct = (cs) => {
    if (!selectedProductObj) return cs;
    return cs.filter(c => c.product === selectedType || c.product === selectedCommCat);
  };
  const allowedIntegrations = selectedType ? INTEGRATIONS_BY_TYPE[selectedType] || [] : null;

  // ─── badge helper ───
  const badge = (text, bg, color, style = {}) => (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: bg, color, letterSpacing: 0.3, whiteSpace: "nowrap", ...style }}>{text}</span>
  );

  // ─── product type badge ───
  const productBadge = type => {
    const pt = PRODUCT_TYPES[type];
    if (!pt) return null;
    return badge(pt.label, pt.color + "18", pt.color);
  };

  // ─── risk bar ───
  const riskBar = (score) => {
    const color = score <= 30 ? T.success : score <= 60 ? T.warning : T.danger;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 80, height: 6, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
          <div style={{ width: `${score}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.5s" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}/100</span>
      </div>
    );
  };

  // ─── NPS smiley ───
  const npsSmiley = score => {
    if (score == null) return "—";
    if (score >= 9) return <span>😀 {score}</span>;
    if (score >= 7) return <span>🙂 {score}</span>;
    if (score >= 5) return <span>😐 {score}</span>;
    return <span>😟 {score}</span>;
  };

  // ─── progress bar ───
  const progressBar = (current, max, color, height = 8) => (
    <div style={{ width: "100%", height, borderRadius: height / 2, background: T.bg, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, (current / max) * 100)}%`, height: "100%", borderRadius: height / 2, background: color, transition: "width 0.6s ease" }} />
    </div>
  );

  // ─── payment heatmap ───
  const paymentHeatmap = (streak) => {
    const months = [];
    for (let i = 35; i >= 0; i--) {
      const isPaid = i < streak;
      const isFuture = i >= 36;
      months.push(
        <div key={i} style={{
          width: 18, height: 18, borderRadius: 3,
          background: isFuture ? "#E5E7EB" : isPaid ? "#31B897" : "#FF6B61",
          opacity: isFuture ? 0.4 : 1,
        }} title={isPaid ? "On time" : isFuture ? "Future" : "Missed"} />
      );
    }
    return <div style={{ display: "flex", flexWrap: "wrap", gap: 3, maxWidth: 252 }}>{months}</div>;
  };

  // ═════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", paddingBottom: 40 }}>

      {/* ─── BACK BUTTON ─── */}
      <div style={{ padding: "16px 32px 0" }}>
        <Btn ghost small onClick={onBack} icon="arrowLeft">Back to Customers</Btn>
      </div>

      {/* ═══════════════════════════════════════════
          1. CUSTOMER HEADER
      ═══════════════════════════════════════════ */}
      <div style={{ margin: "16px 32px 0", borderRadius: 18, overflow: "hidden", background: T.card, border: `1px solid ${T.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        {/* Gradient top bar */}
        <div style={{ height: 6, background: TIER_GRADIENTS[tierData.name] || TIER_GRADIENTS.Bronze }} />

        <div style={{ padding: "28px 32px 24px", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            background: TIER_GRADIENTS[tierData.name], color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: 1,
            boxShadow: `0 4px 16px ${tierColor}44`, flexShrink: 0,
          }}>
            {initials(customer.name)}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: T.navy }}>{customer.name}</h1>
              {badge(customer.segment, T.primaryLight, T.primary)}
              {badge(tierData.name, tierColor + "22", tierColor, { border: `1.5px solid ${tierColor}` })}
              {badge(customer.kyc, KYC_STYLE[customer.kyc]?.bg, KYC_STYLE[customer.kyc]?.color)}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 13, color: T.textMuted, flexWrap: "wrap" }}>
              <span>DOB: {customer.dob}</span>
              <span>ID: {customer.id}</span>
              {customer.kycExpiry && <span>KYC Exp: {customer.kycExpiry}</span>}
              <span>Customer since {customer.since}</span>
            </div>

            {/* Contact */}
            <div style={{ display: "flex", gap: 20, marginTop: 10, fontSize: 13, color: T.textSecondary, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.send(14)} {customer.email}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.bell(14)} {customer.phone}</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{customer.address}</div>
          </div>

          {/* Metrics column */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Risk Score</div>
              <div style={{ marginTop: 4 }}>{riskBar(customer.riskScore)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>NPS</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{npsSmiley(customer.nps)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>Relationship Value</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, color: T.primary }}>{customer.ltv}</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "0 32px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn primary small icon="send">Send Message</Btn>
          <Btn small icon="messages" onClick={() => { setActiveTab("Customer Service"); setShowServiceForm(true); }}>Log Call</Btn>
          {activeProducts.some(p => p.type === "Mortgage") && <Btn small icon="wallet" onClick={() => onOpenServicing?.(activeProducts.find(p => p.type === "Mortgage")?.origRef)}>Servicing</Btn>}
          <Btn small danger={customer.vuln} icon="alert">Flag Vulnerability</Btn>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          TABS — everything else is inside a tab
      ═══════════════════════════════════════════
      ═══════════════════════════════════════════ */}
      <div style={{ margin: "28px 32px 0", display: "flex", gap: 4, borderBottom: `2px solid ${T.border}`, overflowX: "auto" }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, fontFamily: T.font,
            color: activeTab === tab ? T.primary : T.textMuted,
            borderBottom: activeTab === tab ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
            marginBottom: -2, transition: "all 0.15s", whiteSpace: "nowrap",
          }}>{tab}</button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div style={{ margin: "0 32px", paddingTop: 24 }}>

        {/* Product-scoped filter pill (visible on Timeline/Documents/Comms/Integrations) */}
        {selectedProductObj && ["Timeline","Documents","Communications","Integrations"].includes(activeTab) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: T.primaryLight, border: `1px solid ${T.primary}33`, borderRadius: 10, marginBottom: 16 }}>
            <span style={{ color: T.primary }}>{Ico.zap(14)}</span>
            <span style={{ fontSize: 12, color: T.text }}>
              Filtering by product: <strong>{selectedProductObj.product}</strong> ({selectedType})
            </span>
            <button onClick={() => setSelectedProduct(null)} style={{
              marginLeft: "auto", background: "transparent", border: `1px solid ${T.primary}55`, color: T.primary,
              borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
            }}>Clear filter ✕</button>
          </div>
        )}


        {/* ═══════ TAB: OVERVIEW ═══════ */}
        {activeTab === "Overview" && (
          <div>
            {/* Lifecycle Predictor — front and centre */}
            <div style={{ marginBottom: 20 }}>
              <LifecyclePredictor customerId={customer.id} />
            </div>

            {/* AI Recommendations */}
            {actions.length > 0 && (
              <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${T.primary}06, ${T.accent}10)`, border: `1px solid ${T.accent}30`, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Ico.sparkle(18)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: T.primary }}>Nova AI — Recommended Actions</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{actions.length} action{actions.length !== 1 ? "s" : ""} identified for this customer</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {actions.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 10, background: T.card, border: `1px solid ${T.borderLight}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                          {badge(a.priority, PRIORITY_COLORS[a.priority] + "18", PRIORITY_COLORS[a.priority])}
                          {badge(a.type, (ACTION_TYPE_COLORS[a.type] || "#666") + "18", ACTION_TYPE_COLORS[a.type] || "#666")}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{a.action}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Impact: {a.impact}</div>
                      </div>
                      <Btn primary small>Take Action</Btn>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {actions.length === 0 && (
              <Card style={{ marginBottom: 20, padding: "16px 20px", background: T.successBg, border: `1px solid ${T.successBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: T.success }}>{Ico.check(16)}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>No outstanding actions — customer is in good standing</span>
                </div>
              </Card>
            )}

            {/* Product summary strip */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {customerProducts.map(p => {
                const pt = PRODUCT_TYPES[p.type] || {};
                return (
                  <div key={p.id} style={{ minWidth: 180, padding: "12px 16px", borderRadius: 10, background: T.card, border: `1px solid ${T.border}`, borderLeft: `4px solid ${pt.color || T.primary}`, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: pt.color, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{pt.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{p.balance || p.premium || p.share || "—"}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      {p.product}
                      {p.bucket && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: (p.bucketColor || T.primary) + "14", color: p.bucketColor || T.primary }}>{p.bucket}</span>}
                      {p.tier && p.tier !== "Standard" && p.tier !== "Base" && <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 4, background: "#EDE9FE", color: "#6D28D9" }}>{p.tier}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <span onClick={() => { setSelectedProduct(p.id); setActiveTab("Products"); }}
                        style={{ fontSize: 10, fontWeight: 700, color: T.primary, cursor: "pointer" }}>View details →</span>
                      {p.origRef && (
                        <span onClick={() => onOpenCase?.(p.origRef)}
                          style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", cursor: "pointer" }}>Case {p.origRef} →</span>
                      )}
                      {p.type === "Mortgage" && p.status !== "Application" && (
                        <span onClick={() => onOpenServicing?.(p.origRef)}
                          style={{ fontSize: 10, fontWeight: 700, color: T.accent, cursor: "pointer" }}>Servicing →</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {customerProducts.length === 0 && <div style={{ fontSize: 13, color: T.textMuted, padding: 12 }}>No active products</div>}
            </div>

            {/* Gamification summary */}
            <Card style={{ marginBottom: 20, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: TIER_GRADIENTS[tierData.name], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>
                    {tierData.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: tierColor }}>{tierData.name} Tier</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{customer.gamification?.points?.toLocaleString() || 0} points · {customer.gamification?.streak || 0} month streak</div>
                  </div>
                </div>
                {nextTier && (
                  <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap" }}>Next: {nextTier.name}</span>
                    {progressBar(customer.gamification?.points || 0, nextTier.minPoints, tierColor)}
                    <span style={{ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap" }}>{nextTier.minPoints - (customer.gamification?.points || 0)} to go</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(customer.gamification?.badges || []).slice(0, 5).map((b, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30` }}>{b}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Journey Map */}
            <JourneyMap customerId={customer.id} />
          </div>
        )}

        {/* ═══════ TAB: PRODUCTS ═══════ */}
        {activeTab === "Products" && (
          <div>
            {/* Product cards strip */}
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
              {customerProducts.map(p => {
                const pt = PRODUCT_TYPES[p.type] || {};
                const isPending = customer.pendingProducts.includes(p.id);
                const isSelected = selectedProduct === p.id;
                return (
                  <div key={p.id} onClick={() => setSelectedProduct(isSelected ? null : p.id)}
                    style={{
                      minWidth: 200, maxWidth: 240, borderRadius: 14, background: T.card,
                      border: isPending ? `2px dashed ${pt.color || T.border}` : isSelected ? `2px solid ${pt.color || T.primary}` : `1px solid ${T.border}`,
                      cursor: "pointer", overflow: "hidden", transition: "all 0.2s",
                      boxShadow: isSelected ? `0 4px 16px ${pt.color}22` : "0 1px 4px rgba(0,0,0,0.04)",
                      transform: isSelected ? "translateY(-2px)" : "none", flexShrink: 0,
                    }}>
                    <div style={{ height: 4, background: pt.color || T.primary }} />
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: pt.color }}>{Ico[pt.icon]?.(16)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pt.color, textTransform: "uppercase", letterSpacing: 0.4 }}>{pt.label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.product}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{p.balance || p.premium || p.share || "—"}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
                        {p.type === "Mortgage" && <span>{p.rate} | Next: {p.nextPayment}</span>}
                        {p.type === "Fixed Term Deposit" && <span>{p.rate} | Mat: {p.maturity}</span>}
                        {p.type === "Notice Account" && <span>{p.rate} | {p.noticePeriod}</span>}
                        {p.type === "Current Account" && <span>SC: {p.sortCode}</span>}
                        {p.type === "Insurance" && <span>Cover: {p.cover}</span>}
                        {p.type === "Shared Ownership" && <span>{p.ownedValue} owned | Rent {p.rent}</span>}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        {isPending && badge("Pending", T.warningBg, T.warning)}
                        {!isPending && badge(p.status, p.status.includes("Arrears") ? T.dangerBg : T.successBg, p.status.includes("Arrears") ? T.danger : T.success)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {customerProducts.length === 0 && <div style={{ padding: 24, fontSize: 13, color: T.textMuted }}>No products yet.</div>}
            </div>

            {selectedProduct ? (() => {
              const p = PRODUCTS.find(pr => pr.id === selectedProduct);
              if (!p) return <div style={{ color: T.textMuted }}>Product not found.</div>;
              const pt = PRODUCT_TYPES[p.type] || {};

              return (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ color: pt.color }}>{Ico[pt.icon]?.(22)}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{p.product}</span>
                    {badge(p.status, p.status.includes("Arrears") ? T.dangerBg : T.successBg, p.status.includes("Arrears") ? T.danger : T.success)}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: T.textMuted }}>{p.id}</span>
                  </div>

                  {/* ── MORTGAGE DETAIL ── */}
                  {p.type === "Mortgage" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Account ID", p.id], ["Status", p.status], ["Balance", p.balance], ["Rate", p.rate],
                          ["LTV", p.ltv], ["Payment", p.payment], ["Next Payment", p.nextPayment],
                          ["Rate End", p.rateEnd], ["Term", p.term],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                        {/* Origination Ref — clickable to open case */}
                        {p.origRef && (
                          <div onClick={() => onOpenCase?.(p.origRef)} style={{ padding: "12px 16px", borderRadius: 10, background: "#EDE9FE", cursor: "pointer", border: "1px solid #C4B5FD" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#7C3AED", letterSpacing: 0.4 }}>Origination Case</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#7C3AED", marginTop: 4 }}>{p.origRef} →</div>
                          </div>
                        )}
                        {/* Servicing link */}
                        {p.type === "Mortgage" && p.status !== "Application" && (
                          <div onClick={() => onOpenServicing?.(p.origRef)} style={{ padding: "12px 16px", borderRadius: 10, background: `${T.accent}12`, cursor: "pointer", border: `1px solid ${T.accent}30` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.accent, letterSpacing: 0.4 }}>Servicing</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.accent, marginTop: 4 }}>View Servicing →</div>
                          </div>
                        )}
                        {p.arrears && (
                          <div style={{ padding: "12px 16px", borderRadius: 10, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.danger, letterSpacing: 0.4 }}>Arrears</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.danger, marginTop: 4 }}>{p.arrears}</div>
                          </div>
                        )}
                      </div>

                      {/* Recent payments */}
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Payments</div>
                      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 24 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ background: T.bg }}>
                            {["Date", "Amount", "Status", "Reference"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {[
                              ["15 Mar 2026", p.payment, "Received", "DD-MTG-0315"],
                              ["15 Feb 2026", p.payment, "Received", "DD-MTG-0215"],
                              ["15 Jan 2026", p.payment, "Received", "DD-MTG-0115"],
                              ["15 Dec 2025", p.payment, "Received", "DD-MTG-1215"],
                              ["15 Nov 2025", p.payment, "Received", "DD-MTG-1115"],
                            ].map(([d, a, s, r], i) => (
                              <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                                <td style={{ padding: "10px 14px" }}>{d}</td>
                                <td style={{ padding: "10px 14px", fontWeight: 700 }}>{a}</td>
                                <td style={{ padding: "10px 14px" }}>{badge("Received", T.successBg, T.success)}</td>
                                <td style={{ padding: "10px 14px", color: T.textMuted }}>{r}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Rate switch options */}
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Rate Switch Options</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
                        {[
                          { name: "2yr Fixed", rate: "4.29%", payment: "£940", saving: "+£40/mo" },
                          { name: "5yr Fixed", rate: "4.69%", payment: "£960", saving: "+£20/mo" },
                          { name: "Tracker (Base+1.5%)", rate: "5.99%", payment: "£1,040", saving: "−£60/mo" },
                        ].map((opt, i) => (
                          <div key={i} style={{ padding: "16px 18px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{opt.name}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>{opt.rate}</div>
                            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>{opt.payment}/mo | {opt.saving}</div>
                            <Btn primary small style={{ marginTop: 10, width: "100%" }}>Select</Btn>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* ── FIXED TERM DEPOSIT DETAIL ── */}
                  {p.type === "Fixed Term Deposit" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Principal", p.principal], ["Balance", p.balance], ["Rate", p.rate],
                          ["Start Date", "18 May 2024"], ["Maturity", p.maturity || "—"],
                          ["Interest Earned", p.interestEarned || "—"],
                          ["Projected Total", p.balance !== "—" ? `£${(parseFloat(p.balance.replace(/[£,]/g, "")) * 1.02).toLocaleString("en-GB", { minimumFractionDigits: 0 })}` : "—"],
                          ["Days to Maturity", p.daysToMaturity != null ? `${p.daysToMaturity} days` : "—"],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      {p.daysToMaturity != null && p.daysToMaturity <= 90 && (
                        <div style={{ padding: "16px 20px", borderRadius: 12, background: T.warningBg, border: `1px solid ${T.warningBorder}`, marginBottom: 24 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.warning }}>Maturity approaching in {p.daysToMaturity} days</div>
                          <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>Contact customer to discuss renewal options.</div>
                        </div>
                      )}

                      {/* Renewal options */}
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Renewal Options</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                        {[
                          { title: "Renew Fixed Term", desc: "Roll into a new fixed term at current best rate (4.65%)", icon: "dollar" },
                          { title: "Withdraw to Account", desc: "Transfer full balance to current/notice account", icon: "download" },
                          { title: "Overpay Mortgage", desc: `Apply ${p.principal} to mortgage — save £8,200 interest`, icon: "loans" },
                        ].map((opt, i) => (
                          <div key={i} style={{ padding: "18px 20px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ color: T.primary }}>{Ico[opt.icon]?.(18)}</span>
                              <span style={{ fontSize: 14, fontWeight: 700 }}>{opt.title}</span>
                            </div>
                            <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4, marginBottom: 12 }}>{opt.desc}</div>
                            <Btn primary small style={{ width: "100%" }}>Select</Btn>
                          </div>
                        ))}
                      </div>

                      {/* Early withdrawal penalty */}
                      <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 10, background: T.dangerBg, border: `1px solid ${T.dangerBorder}` }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.danger }}>Early Withdrawal Penalty</div>
                        <div style={{ fontSize: 12, color: "#991B1B", marginTop: 4 }}>90 days' interest (approx. £{Math.round(parseFloat((p.principal || "£0").replace(/[£,]/g, "")) * parseFloat((p.rate || "0").replace("%", "")) / 100 / 4).toLocaleString()}) will be forfeited if withdrawn before maturity.</div>
                      </div>
                    </>
                  )}

                  {/* ── NOTICE ACCOUNT DETAIL ── */}
                  {p.type === "Notice Account" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Balance", p.balance], ["Rate", p.rate], ["Notice Period", p.noticePeriod],
                          ["Pending Withdrawals", "None"], ["Account ID", p.id],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Transaction History</div>
                      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}` }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ background: T.bg }}>
                            {["Date", "Type", "Amount", "Balance"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {[
                              ["10 Mar 2026", "Deposit", "+£2,000", p.balance],
                              ["15 Jan 2026", "Deposit", "+£1,500", "£8,500"],
                              ["01 Dec 2025", "Interest", "+£28.40", "£7,000"],
                              ["10 Nov 2025", "Deposit", "+£1,000", "£6,971.60"],
                              ["01 Sep 2025", "Interest", "+£21.60", "£5,971.60"],
                            ].map(([d, t, a, b], i) => (
                              <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                                <td style={{ padding: "10px 14px" }}>{d}</td>
                                <td style={{ padding: "10px 14px" }}>{badge(t, t === "Interest" ? T.successBg : "#EEF2FF", t === "Interest" ? T.success : "#4F46E5")}</td>
                                <td style={{ padding: "10px 14px", fontWeight: 700, color: T.success }}>{a}</td>
                                <td style={{ padding: "10px 14px", color: T.textMuted }}>{b}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* ── CURRENT ACCOUNT DETAIL ── */}
                  {p.type === "Current Account" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Balance", p.balance], ["Sort Code", p.sortCode], ["Account No", p.accountNo],
                          ["Rate", p.rate], ["Account ID", p.id],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Transactions</div>
                      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 24 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead><tr style={{ background: T.bg }}>
                            {["Date", "Description", "Amount", "Balance"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>)}
                          </tr></thead>
                          <tbody>
                            {[
                              ["05 Apr 2026", "Salary - TechCorp Ltd", "+£3,450.00", "£4,230.00"],
                              ["01 Apr 2026", "Council Tax", "-£185.00", "£780.00"],
                              ["28 Mar 2026", "Tesco Groceries", "-£67.40", "£965.00"],
                              ["25 Mar 2026", "Standing Order - Savings", "-£500.00", "£1,032.40"],
                              ["20 Mar 2026", "Amazon", "-£29.99", "£1,532.40"],
                            ].map(([d, desc, a, b], i) => (
                              <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                                <td style={{ padding: "10px 14px" }}>{d}</td>
                                <td style={{ padding: "10px 14px" }}>{desc}</td>
                                <td style={{ padding: "10px 14px", fontWeight: 700, color: a.startsWith("+") ? T.success : T.danger }}>{a}</td>
                                <td style={{ padding: "10px 14px", color: T.textMuted }}>{b}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Standing Orders</div>
                          {[
                            { payee: "Savings Transfer", amount: "£500", freq: "Monthly", day: "25th" },
                            { payee: "Gym Membership", amount: "£35", freq: "Monthly", day: "1st" },
                          ].map((so, i) => (
                            <div key={i} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${T.borderLight}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{so.payee}</div>
                                <div style={{ fontSize: 11, color: T.textMuted }}>{so.freq} on {so.day}</div>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{so.amount}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Direct Debits</div>
                          {[
                            { payee: "Council Tax", amount: "£185", freq: "Monthly" },
                            { payee: "Energy Co", amount: "£120", freq: "Monthly" },
                            { payee: "Mobile Phone", amount: "£32", freq: "Monthly" },
                          ].map((dd, i) => (
                            <div key={i} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${T.borderLight}`, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{dd.payee}</div>
                                <div style={{ fontSize: 11, color: T.textMuted }}>{dd.freq}</div>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700 }}>{dd.amount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── INSURANCE DETAIL ── */}
                  {p.type === "Insurance" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Policy Number", p.id], ["Type", p.product], ["Cover", p.cover],
                          ["Premium", p.premium || "—"], ["Excess", "£250"], ["Term", p.term],
                          ["Provider", p.provider], ["Renewal", p.renewal || "—"],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Claims History</div>
                      <div style={{ padding: "20px", borderRadius: 10, border: `1px solid ${T.borderLight}`, color: T.textMuted, fontSize: 13 }}>
                        No claims have been made on this policy.
                      </div>
                    </>
                  )}

                  {/* ── SHARED OWNERSHIP DETAIL ── */}
                  {p.type === "Shared Ownership" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
                        {[
                          ["Share %", p.share], ["Full Value", p.fullValue], ["Owned Value", p.ownedValue],
                          ["Mortgage on Share", p.ownedValue], ["Rent", p.rent],
                          ["Housing Association", p.housingAssoc], ["Status", p.status],
                        ].map(([l, v]) => (
                          <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.bg }}>
                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted, letterSpacing: 0.4 }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 4 }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Staircase History</div>
                      {p.staircaseHistory?.length > 0 ? (
                        <div>TODO staircase history table</div>
                      ) : (
                        <div style={{ padding: "16px 20px", borderRadius: 10, border: `1px solid ${T.borderLight}`, color: T.textMuted, fontSize: 13, marginBottom: 24 }}>No staircasing transactions yet.</div>
                      )}

                      {/* Staircase calculator */}
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Staircase Up Calculator</div>
                      <Card style={{ background: `linear-gradient(135deg, #0EA5E908, #0EA5E912)`, border: `1px solid #0EA5E930` }}>
                        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>Increase ownership share by:</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                          <input type="range" min={5} max={60 - parseInt(p.share)} step={5} value={staircaseSlider} onChange={e => setStaircaseSlider(Number(e.target.value))}
                            style={{ flex: 1, accentColor: "#0EA5E9" }} />
                          <span style={{ fontSize: 22, fontWeight: 800, color: "#0EA5E9", minWidth: 60 }}>+{staircaseSlider}%</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                          {(() => {
                            const currentPct = parseInt(p.share);
                            const newPct = currentPct + staircaseSlider;
                            const fullVal = parseFloat(p.fullValue.replace(/[£,]/g, ""));
                            const newOwned = Math.round(fullVal * newPct / 100);
                            const newRent = Math.round(parseFloat(p.rent.replace(/[£\/mo,]/g, "")) * (100 - newPct) / (100 - currentPct));
                            return [
                              ["New Share", `${newPct}%`],
                              ["New Owned Value", `£${newOwned.toLocaleString()}`],
                              ["Est. New Rent", `£${newRent}/mo`],
                            ].map(([l, v]) => (
                              <div key={l} style={{ padding: "12px 16px", borderRadius: 10, background: T.card }}>
                                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: T.textMuted }}>{l}</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: T.navy, marginTop: 4 }}>{v}</div>
                              </div>
                            ));
                          })()}
                        </div>
                        <Btn primary small style={{ marginTop: 16 }}>Request Staircase Assessment</Btn>
                      </Card>
                    </>
                  )}
                </Card>
              );
            })() : (
              /* No product selected — grid overview */
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: T.textMuted }}>Select a product card above to view full details, or browse the overview below.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                  {customerProducts.map(p => {
                    const pt = PRODUCT_TYPES[p.type] || {};
                    return (
                      <Card key={p.id} style={{ cursor: "pointer", transition: "all 0.15s" }} noPad>
                        <div style={{ height: 4, background: pt.color || T.primary, borderRadius: "14px 14px 0 0" }} />
                        <div style={{ padding: "16px 20px" }} onClick={() => setSelectedProduct(p.id)}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ color: pt.color }}>{Ico[pt.icon]?.(16)}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: pt.color }}>{pt.label}</span>
                            <span style={{ marginLeft: "auto" }}>{badge(p.status, p.status.includes("Arrears") ? T.dangerBg : T.successBg, p.status.includes("Arrears") ? T.danger : T.success)}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{p.product}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: T.primary, marginTop: 6 }}>{p.balance || p.premium || p.share || "—"}</div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{p.id}</div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB: CONNECTIONS ═══════ */}
        {activeTab === "Connections" && (
          <ConnectionsTab customer={customer} />
        )}

        {/* ═══════ TAB: TIMELINE ═══════ */}
        {activeTab === "Timeline" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {["All", ...Object.keys(PRODUCT_TYPES)].map(f => (
                <button key={f} onClick={() => setTimelineFilter(f)} style={{
                  padding: "6px 14px", borderRadius: 8, border: `1px solid ${timelineFilter === f ? T.primary : T.border}`,
                  background: timelineFilter === f ? T.primaryLight : T.card, color: timelineFilter === f ? T.primary : T.textMuted,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                }}>
                  {f === "All" ? "All Events" : PRODUCT_TYPES[f]?.label || f}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: T.border }} />
              {filterTimelineByProduct(timeline)
                .filter(e => timelineFilter === "All" || e.product === timelineFilter)
                .map((e, i) => (
                <div key={i} style={{ marginBottom: 20, position: "relative" }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -28, top: 4, width: 14, height: 14, borderRadius: "50%", background: e.color, border: `2px solid ${T.card}`, boxShadow: `0 0 0 2px ${e.color}40` }} />
                  <div style={{ padding: "12px 18px", borderRadius: 12, background: T.card, border: `1px solid ${T.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ color: e.color }}>{Ico[e.icon]?.(16)}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{e.text}</span>
                      {e.product && productBadge(e.product)}
                    </div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{e.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ TAB: DOCUMENTS ═══════ */}
        {activeTab === "Documents" && (
          <Card noPad>
            <div style={{ borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    {["Name", "Product", "Category", "Date", "Status", "AI Confidence"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterDocsByProduct(documents).map((doc, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                      <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.primary }}>{Ico.file(16)}</span>
                        <span style={{ fontWeight: 600 }}>{doc.name}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>{doc.product ? productBadge(doc.product) : <span style={{ fontSize: 11, color: T.textMuted }}>General</span>}</td>
                      <td style={{ padding: "12px 16px", color: T.textMuted }}>{doc.category}</td>
                      <td style={{ padding: "12px 16px", color: T.textMuted }}>{doc.date}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {badge(doc.status, doc.status === "Verified" ? T.successBg : T.warningBg, doc.status === "Verified" ? T.success : T.warning)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {doc.confidence > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 40, height: 5, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
                              <div style={{ width: `${doc.confidence}%`, height: "100%", borderRadius: 3, background: doc.confidence > 90 ? T.success : doc.confidence > 70 ? T.warning : T.danger }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: doc.confidence > 90 ? T.success : doc.confidence > 70 ? T.warning : T.danger }}>{doc.confidence}%</span>
                          </div>
                        ) : <span style={{ fontSize: 11, color: T.textMuted }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ═══════ TAB: COMMUNICATIONS ═══════ */}
        {activeTab === "Communications" && (
          <div>
            {/* Log Interaction button + form */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Btn primary small icon="plus" onClick={() => setShowLogForm(!showLogForm)}>Log Interaction</Btn>
              <span style={{ fontSize: 12, color: T.textMuted }}>{filterCommsByProduct(comms).length + loggedInteractions.length} total interactions</span>
            </div>

            {showLogForm && (
              <Card style={{ marginBottom: 16, border: `2px solid ${T.primary}30`, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Record New Interaction</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Type</div>
                    <select value={logForm.type} onChange={e => setLogForm(f => ({ ...f, type: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Call", "Email", "Meeting", "Note", "SMS"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Subject</div>
                    <input value={logForm.subject} onChange={e => setLogForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Rate switch discussion"
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Outcome</div>
                    <select value={logForm.outcome} onChange={e => setLogForm(f => ({ ...f, outcome: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Resolved", "Follow-up Required", "Escalated", "No Action", "Voicemail Left", "Customer Callback Requested"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Notes</div>
                  <textarea value={logForm.body} onChange={e => setLogForm(f => ({ ...f, body: e.target.value }))}
                    placeholder="Record the interaction details..." rows={3}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn primary small icon="check" onClick={saveInteraction}>Save Interaction</Btn>
                  <Btn small ghost onClick={() => setShowLogForm(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            {/* Logged interactions (user-created) */}
            {loggedInteractions.map((c, i) => (
              <Card key={`logged-${c.id}`} style={{ padding: "14px 20px", marginBottom: 10, borderLeft: `4px solid ${T.primary}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.primary}18`, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {Ico.messages(18)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      {badge(c.type, `${CHANNEL_COLORS[c.type] || T.primary}18`, CHANNEL_COLORS[c.type] || T.primary)}
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.subject}</span>
                      {badge(c.outcome, c.outcome === "Resolved" ? T.successBg : T.warningBg, c.outcome === "Resolved" ? T.success : T.warning)}
                      <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>Logged by {c.loggedBy}</span>
                    </div>
                    {c.body && <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{c.body}</div>}
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{c.date} at {c.time}</div>
                  </div>
                </div>
              </Card>
            ))}

            {/* System communications */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filterCommsByProduct(comms).map((c, i) => (
                <Card key={i} style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      background: (CHANNEL_COLORS[c.channel] || "#6B7280") + "18", color: CHANNEL_COLORS[c.channel] || "#6B7280", flexShrink: 0,
                    }}>
                      {Ico[c.channel === "Email" ? "send" : c.channel === "Call" ? "messages" : c.channel === "SMS" ? "send" : c.channel === "Push" ? "bell" : "settings"](18)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                        {badge(c.channel, (CHANNEL_COLORS[c.channel] || "#6B7280") + "18", CHANNEL_COLORS[c.channel] || "#6B7280")}
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.subject}</span>
                        {c.product && <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{c.product}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{c.snippet}</div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{c.date}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ TAB: CUSTOMER SERVICE ═══════ */}
        {activeTab === "Customer Service" && (
          <div>
            {/* Header + Log button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Customer Service</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>{allServiceInteractions.length} interactions · {allServiceInteractions.filter(s => s.followUp).length} follow-ups pending</div>
              </div>
              <Btn primary small icon="plus" onClick={() => setShowServiceForm(!showServiceForm)}>Log Interaction</Btn>
            </div>

            {/* Log Interaction Form */}
            {showServiceForm && (
              <Card style={{ marginBottom: 16, border: `2px solid ${T.primary}30`, padding: "16px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Record Customer Interaction</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Type</div>
                    <select value={serviceForm.type} onChange={e => setServiceForm(f => ({ ...f, type: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Inbound Call", "Outbound Call", "Email", "Live Chat", "Internal Note", "Branch Visit"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Customer Sentiment</div>
                    <select value={serviceForm.sentiment} onChange={e => setServiceForm(f => ({ ...f, sentiment: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Positive", "Neutral", "Frustrated", "Distressed", "Angry", "N/A"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Outcome</div>
                    <select value={serviceForm.outcome} onChange={e => setServiceForm(f => ({ ...f, outcome: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Resolved", "Follow-up Required", "Arrangement Made", "Complaint Raised", "Escalated", "No Contact", "Action Taken"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Subject</div>
                  <input value={serviceForm.subject} onChange={e => setServiceForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Rate switch enquiry, payment arrangement, welfare check"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Notes</div>
                  <textarea value={serviceForm.notes} onChange={e => setServiceForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Record the full interaction — what the customer said, what you advised, any actions taken..." rows={4}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Follow-up Action (if required)</div>
                  <input value={serviceForm.followUp} onChange={e => setServiceForm(f => ({ ...f, followUp: e.target.value }))} placeholder="e.g. Call back in 1 week, review arrangement in 4 weeks"
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn primary small icon="check" onClick={saveServiceInteraction}>Save Interaction</Btn>
                  <Btn small ghost onClick={() => setShowServiceForm(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            {/* Service History */}
            {allServiceInteractions.length === 0 && !showServiceForm && (
              <Card style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ color: T.textMuted, marginBottom: 8 }}>{Ico.messages(28)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>No Interactions Recorded</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Use "Log Interaction" to record a call, email or note.</div>
              </Card>
            )}

            {allServiceInteractions.map(s => {
              const sentimentColors = { Positive: T.success, Neutral: T.textMuted, Frustrated: T.warning, Distressed: T.danger, Angry: T.danger, "N/A": T.textMuted };
              const outcomeColors = { Resolved: T.success, "Follow-up Required": T.warning, "Arrangement Made": "#3B82F6", "Complaint Raised": T.danger, Escalated: T.danger, "No Contact": T.textMuted, "Action Taken": T.success };
              const typeIcons = { "Inbound Call": "📞", "Outbound Call": "📱", "Email": "✉️", "Live Chat": "💬", "Internal Note": "📝", "Branch Visit": "🏦" };
              return (
                <Card key={s.id} style={{ marginBottom: 10, padding: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: 4, background: sentimentColors[s.sentiment] || T.textMuted, flexShrink: 0 }} />
                    <div style={{ padding: "14px 18px", flex: 1 }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16 }}>{typeIcons[s.type] || "📋"}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.subject}</span>
                        {badge(s.type, T.primaryLight, T.primary)}
                        {badge(s.sentiment, `${sentimentColors[s.sentiment]}18`, sentimentColors[s.sentiment])}
                        {badge(s.outcome, `${outcomeColors[s.outcome]}18`, outcomeColors[s.outcome])}
                      </div>
                      {/* Notes */}
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6, marginBottom: 10, padding: "10px 14px", background: T.bg, borderRadius: 8 }}>
                        {s.notes}
                      </div>
                      {/* Meta row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, color: T.textMuted, flexWrap: "wrap" }}>
                        <span>{s.date} at {s.time}</span>
                        <span>Agent: <strong style={{ color: T.text }}>{s.agent}</strong></span>
                        {s.duration !== "—" && <span>Duration: {s.duration}</span>}
                      </div>
                      {/* Follow-up */}
                      {s.followUp && (
                        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6, background: T.warningBg, border: `1px solid ${T.warningBorder}`, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: T.warning }}>{Ico.clock(14)}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>Follow-up: {s.followUp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ═══════ TAB: COMPLAINTS ═══════ */}
        {activeTab === "Complaints" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Btn primary small icon="plus" onClick={() => setShowComplaintForm(!showComplaintForm)}>Raise Complaint</Btn>
              <span style={{ fontSize: 12, color: T.textMuted }}>
                {customerComplaints.filter(c => c.status === "Open").length} open · {customerComplaints.filter(c => c.status === "Resolved").length} resolved
              </span>
            </div>

            {showComplaintForm && (
              <Card style={{ marginBottom: 16, border: `2px solid ${T.danger}30`, padding: "16px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Raise New Complaint</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Category</div>
                    <select value={complaintForm.category} onChange={e => setComplaintForm(f => ({ ...f, category: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Service", "Arrears Handling", "Communication", "Account Access", "Fees & Charges", "Product Suitability", "Data & Privacy", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Severity</div>
                    <select value={complaintForm.severity} onChange={e => setComplaintForm(f => ({ ...f, severity: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, background: T.card }}>
                      {["Low", "Medium", "High", "Critical"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Description</div>
                  <textarea value={complaintForm.description} onChange={e => setComplaintForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the complaint in detail..." rows={4}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn small style={{ background: T.danger, color: "#fff", border: "none" }} icon="alert" onClick={() => setShowComplaintForm(false)}>Submit Complaint</Btn>
                  <Btn small ghost onClick={() => setShowComplaintForm(false)}>Cancel</Btn>
                </div>
              </Card>
            )}

            {customerComplaints.length === 0 && !showComplaintForm && (
              <Card style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ color: T.success, marginBottom: 8 }}>{Ico.check(28)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>No Complaints</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>This customer has no recorded complaints.</div>
              </Card>
            )}

            {customerComplaints.map(c => {
              const isOpen = c.status === "Open";
              return (
                <Card key={c.id} style={{ marginBottom: 12, padding: 0, overflow: "hidden", border: `1px solid ${isOpen ? T.dangerBorder : T.border}` }}>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: 4, background: isOpen ? T.danger : T.success, flexShrink: 0 }} />
                    <div style={{ padding: "16px 20px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{c.id}</span>
                        {badge(c.category, T.primaryLight, T.primary)}
                        {badge(c.severity, c.severity === "High" || c.severity === "Critical" ? T.dangerBg : T.warningBg, c.severity === "High" || c.severity === "Critical" ? T.danger : T.warning)}
                        {badge(c.status, isOpen ? T.dangerBg : T.successBg, isOpen ? T.danger : T.success)}
                        <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{c.date}</span>
                      </div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, marginBottom: 10 }}>{c.description}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                        <div>
                          <span style={{ fontWeight: 600, color: T.textMuted }}>Root Cause: </span>
                          <span style={{ color: T.text }}>{c.rootCause || "Under investigation"}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: T.textMuted }}>Handler: </span>
                          <span style={{ color: T.text }}>{c.handler}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: T.textMuted }}>Resolution: </span>
                          <span style={{ color: T.text }}>{c.resolution || "Pending"}</span>
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, color: T.textMuted }}>Response Deadline: </span>
                          <span style={{ color: isOpen && new Date(c.deadline) < new Date() ? T.danger : T.text, fontWeight: 600 }}>{c.deadline}</span>
                        </div>
                        {c.compensation && (
                          <div>
                            <span style={{ fontWeight: 600, color: T.textMuted }}>Compensation: </span>
                            <span style={{ color: T.text }}>{c.compensation}</span>
                          </div>
                        )}
                      </div>
                      {isOpen && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <Btn small primary icon="messages">Add Update</Btn>
                          <Btn small ghost icon="check">Resolve</Btn>
                          <Btn small ghost icon="arrow">Escalate</Btn>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ═══════ TAB: INTEGRATIONS ═══════ */}
        {activeTab === "Integrations" && (() => {
          const custMortgage = customerProducts.find(p => p.type === "Mortgage");
          const hasSavings = customerProducts.some(p => p.type === "Fixed Term Deposit" || p.type === "Notice Account");
          const hasInsurance = customerProducts.some(p => p.type === "Insurance");
          let integrations = [
            { name:"Open Banking", icon:"dollar", status: customer.kyc==="Verified" ? "Connected" : "Not Connected",
              statusColor: customer.kyc==="Verified" ? T.success : T.textMuted,
              detail: customer.kyc==="Verified" ? `HSBC Current Account ****4521 · Last synced: 2h ago · Income: £5,833/mo verified` : "Customer has not connected bank account",
              actions: customer.kyc==="Verified" ? ["Refresh Data","View Transactions","Disconnect"] : ["Send Connection Request"] },
            { name:"Credit Bureau", icon:"shield", status: customer.kyc==="Verified" ? "Report Available" : customer.kyc==="Expired" ? "Expired" : "Not Run",
              statusColor: customer.kyc==="Verified" ? T.success : customer.kyc==="Expired" ? T.danger : T.textMuted,
              detail: customer.kyc==="Verified" ? `Equifax Score: ${customer.riskScore < 30 ? "742 (Good)" : customer.riskScore < 60 ? "620 (Fair)" : "580 (Poor)"} · Last pulled: ${customer.since} · No adverse` : customer.kyc==="Expired" ? "Credit report expired — re-pull required" : "Credit check not yet initiated",
              actions: ["Pull Report","View Full Report"] },
            { name:"Land Registry", icon:"file", status: custMortgage ? "Verified" : "N/A",
              statusColor: custMortgage ? T.success : T.textMuted,
              detail: custMortgage ? `Title: ${customer.address} · Freehold · No existing charges · Owner verified` : "No mortgage product — Land Registry not applicable",
              actions: custMortgage ? ["View Title","Refresh"] : [] },
            { name:"HMRC", icon:"check", status: customer.kyc==="Verified" ? "Verified" : "Not Checked",
              statusColor: customer.kyc==="Verified" ? T.success : T.textMuted,
              detail: customer.kyc==="Verified" ? "Employment confirmed · Tax code 1257L · PAYE active · Income matches declared" : "HMRC verification not yet run",
              actions: customer.kyc==="Verified" ? ["View Details","Re-verify"] : ["Run Verification"] },
            { name:"Companies House", icon:"products", status: "Not Applicable",
              statusColor: T.textMuted,
              detail: "Customer is employed — Companies House check not required",
              actions: [] },
            { name:"E-Signature", icon:"send", status: custMortgage && custMortgage.status === "Active" ? "Completed" : custMortgage ? "Pending" : "N/A",
              statusColor: custMortgage && custMortgage.status === "Active" ? T.success : custMortgage ? T.warning : T.textMuted,
              detail: custMortgage && custMortgage.status === "Active" ? "Offer letter: Signed 14 Feb 2026 · Mortgage deed: Signed 14 Feb 2026" : custMortgage ? "Offer letter sent — awaiting signature" : "No documents pending signature",
              actions: custMortgage ? ["View Envelope","Resend Reminder"] : [] },
            { name:"KYC", icon:"shield", status: customer.kyc==="Verified" ? "Verified" : customer.kyc==="Expired" ? "Expired" : "Pending",
              statusColor: customer.kyc==="Verified" ? T.success : customer.kyc==="Expired" ? T.danger : T.warning,
              detail: `Identity verified via partner KYC provider · Last refresh: ${customer.since}`,
              actions: ["Refresh","View Audit"] },
          ];
          if (allowedIntegrations) {
            integrations = integrations.filter(i => allowedIntegrations.includes(i.name));
          }
          return (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                {Ico.zap(20)}
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>Integrations for {customer.name}</div>
                  <div style={{ fontSize:12, color:T.textMuted }}>{integrations.filter(i=>i.status!=="Not Applicable"&&i.status!=="N/A"&&i.status!=="Not Connected"&&i.status!=="Not Run"&&i.status!=="Not Checked").length} of {integrations.length} connected</div>
                </div>
              </div>
              {integrations.map((intg, i) => (
                <Card key={i} style={{ marginBottom:12, padding:0, overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"stretch" }}>
                    <div style={{ width:4, background:intg.statusColor, flexShrink:0 }} />
                    <div style={{ flex:1, padding:"16px 20px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`${intg.statusColor}15`,
                            display:"flex", alignItems:"center", justifyContent:"center", color:intg.statusColor }}>
                            {Ico[intg.icon]?.(18)}
                          </div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700 }}>{intg.name}</div>
                            <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:5,
                              background:`${intg.statusColor}15`, color:intg.statusColor }}>{intg.status}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:T.textSecondary, lineHeight:1.6, padding:"8px 12px",
                        background:T.bg, borderRadius:8, marginBottom:intg.actions.length?10:0 }}>
                        {intg.detail}
                      </div>
                      {intg.actions.length > 0 && (
                        <div style={{ display:"flex", gap:8 }}>
                          {intg.actions.map((a, j) => (
                            <Btn key={j} small ghost={j>0} primary={j===0}>{a}</Btn>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          );
        })()}

        {/* ═══════ TAB: RISK & VULNERABILITY ═══════ */}
        {activeTab === "Risk" && (
          <div>
            {/* Risk Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Overall Risk", value: customer.risk, score: customer.riskScore },
                { label: "Financial Stability", value: customer.riskScore <= 30 ? "Stable" : customer.riskScore <= 60 ? "Moderate" : "Unstable", score: customer.riskScore <= 30 ? 20 : customer.riskScore <= 60 ? 55 : 80 },
                { label: "Payment Reliability", value: customer.gamification?.streak > 12 ? "Excellent" : customer.gamification?.streak > 6 ? "Good" : "Poor", score: customer.gamification?.streak > 12 ? 10 : customer.gamification?.streak > 6 ? 35 : 75 },
                { label: "Concentration Risk", value: customerProducts.length > 3 ? "Low" : customerProducts.length > 1 ? "Medium" : "High", score: customerProducts.length > 3 ? 15 : customerProducts.length > 1 ? 45 : 70 },
              ].map((r, i) => {
                const color = r.score <= 30 ? T.success : r.score <= 60 ? T.warning : T.danger;
                return (
                  <Card key={i}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>{r.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color }}>{r.value}</span>
                    </div>
                    {riskBar(r.score)}
                  </Card>
                );
              })}
            </div>

            {/* Vulnerability Screening */}
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Vulnerability Screening</div>
            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Current Status</div>
                  {customer.vuln
                    ? badge("Vulnerability Flagged", T.dangerBg, T.danger)
                    : badge("No Flags", T.successBg, T.success)}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Trigger Words Detected</div>
                  <div style={{ fontSize: 13, color: T.text }}>{customer.vuln ? "Financial difficulty, struggling, worried" : "None detected"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Support Needs</div>
                  <div style={{ fontSize: 13, color: T.text }}>{customer.vuln ? "Payment plan, financial counselling referral" : "No additional support needed"}</div>
                </div>
              </div>
            </Card>

            {/* Consumer Duty Outcomes */}
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Consumer Duty Outcomes</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { outcome: "Products & Services", status: customer.riskScore <= 50 ? "Met" : "At Risk", desc: "Products are appropriate for customer needs and circumstances." },
                { outcome: "Price & Value", status: "Met", desc: "Customer is on a competitive rate relative to their risk profile." },
                { outcome: "Consumer Understanding", status: customer.kyc === "Verified" ? "Met" : "Review", desc: "Customer has been provided clear, timely communications." },
                { outcome: "Consumer Support", status: customer.vuln ? "Action Needed" : "Met", desc: customer.vuln ? "Vulnerability identified - enhanced support required." : "Customer can access support easily and receives timely responses." },
              ].map((cd, i) => (
                <Card key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{cd.outcome}</span>
                    {badge(cd.status, cd.status === "Met" ? T.successBg : cd.status === "At Risk" ? T.warningBg : T.dangerBg, cd.status === "Met" ? T.success : cd.status === "At Risk" ? T.warning : T.danger)}
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.4 }}>{cd.desc}</div>
                </Card>
              ))}
            </div>

            <Btn danger small icon="alert">Flag Vulnerability</Btn>
          </div>
        )}

        {/* Lifecycle is now embedded in the Overview tab */}
      </div>
    </div>
  );
}
