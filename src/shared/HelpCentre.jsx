import { useState } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

// ─────────────────────────────────────────────
// CONTEXTUAL HELP DATA
// ─────────────────────────────────────────────
const SCREEN_HELP = {
  needsattention: {
    title: "Needs Attention",
    summary: "Your home screen showing customers and cases that need action, ranked by AI priority.",
    steps: [
      "Cases are sorted by urgency — Critical first, then High",
      "Click any customer card to open their full Customer Hub",
      "AI recommends the next best action for each customer",
      "Red badges indicate overdue items"
    ],
    tips: ["Use Cmd+K to quickly search for any customer by name"]
  },
  uwqueue: {
    title: "Smart Queue",
    summary: "AI-triaged case queue sorted by risk. Fast-track low-risk cases or open the full workstation.",
    steps: [
      "Cases are sorted by risk score — highest risk first",
      "Green 'Fast-Track' badge means AI recommends one-click approval",
      "Amber 'Manual Review' means you need to open the full workstation",
      "SLA timers show time remaining for your decision"
    ],
    tips: ["Fast-track approve saves ~15 minutes per low-risk case"]
  },
  brokerdashboard: {
    title: "Dashboard & Pipeline",
    summary: "Your pipeline overview with visual progress steppers and SLA timers on every case.",
    steps: [
      "Each case card shows a progress stepper: DIP through to Disbursed",
      "Squad badges show your assigned team (Adviser, UW, Ops)",
      "Click any case to open the full application detail",
      "Click '+ New Loan' to start a new application"
    ],
    tips: ["Cases closest to SLA breach appear first"]
  },
  smartapply: {
    title: "Smart Apply",
    summary: "AI-powered 3-phase application flow. Submit a loan in 5 minutes.",
    steps: [
      "Phase 1: Enter basics — income, property value, deposit. Get instant eligibility.",
      "Phase 2: Nova AI pulls data from 6 sources. Review and verify pre-populated fields.",
      "Phase 3: DIP runs automatically. Review summary and submit.",
      "Your application appears in the Intake Queue within 60 seconds."
    ],
    tips: ["73% of fields are auto-populated — only verify, don't retype"]
  },
  servicing: {
    title: "Mortgage Servicing",
    summary: "Search and manage any mortgage account. AI recommends actions.",
    steps: [
      "Use the search bar to find accounts by name, ID, or postcode",
      "Select an account to see full details and squad",
      "The AI Actions panel shows what needs attention on this account",
      "Click any action card to open the interactive modal"
    ],
    tips: ["Actions like Payment Holiday have interactive sliders — drag to see live impact"]
  },
  bdmdashboard: {
    title: "BDM Dashboard",
    summary: "Manage enquiries, broker relationships, and track conversions.",
    steps: [
      "Submit enquiries via 'New Enquiry' — AI checks criteria instantly",
      "Track enquiry conversion: Enquiry -> DIP -> Application -> Complete",
      "The Application column shows when an enquiry becomes a live case",
      "Manage your broker portfolio from the right panel"
    ],
    tips: ["Use Criteria Quick Check for instant answers without creating an enquiry"]
  },
  disbursements: {
    title: "Disbursements",
    summary: "4-eyes authorisation for fund releases. Maker creates, checker approves.",
    steps: [
      "Create a disbursement instruction (Maker role)",
      "A different Finance user must authorise it (Checker role)",
      "Self-authorisation is blocked — you cannot approve your own instruction",
      "Amount thresholds determine how many approvers are needed"
    ],
    tips: ["Pending authorisations appear with amber warning banner"]
  },
  consumerduty: {
    title: "Consumer Duty",
    summary: "Track FCA Consumer Duty compliance across 4 outcome areas.",
    steps: [
      "Monitor scores across Products, Price & Value, Understanding, Support",
      "Each metric shows RAG status, trend, and AI commentary",
      "Vulnerability cases require priority handling",
      "Generate Board Report for quarterly FCA submissions"
    ],
    tips: ["Scores below 80% trigger automatic escalation to the compliance team"]
  },
  allcustomers: {
    title: "All Customers",
    summary: "Full customer directory with search, filters, and quick actions.",
    steps: [
      "Search by name, account number, postcode, or email",
      "Filter by product type, status, or risk level",
      "Click a customer row to open their Customer Hub",
      "Use bulk actions to assign, tag, or export selected customers"
    ],
    tips: ["Type 3+ characters to trigger instant search results"]
  },
  customerhub: {
    title: "Customer Hub",
    summary: "360-degree view of a single customer: products, timeline, squad, and AI insights.",
    steps: [
      "View all products held by this customer in the Products tab",
      "Check the Timeline for a full interaction history",
      "The Squad panel shows who is responsible for this customer",
      "AI Insights surface next best actions and retention signals"
    ],
    tips: ["Customer tier badges (Bronze/Silver/Gold/Platinum) reflect engagement score"]
  },
  intake: {
    title: "Intake Queue",
    summary: "Incoming applications waiting for initial review and assignment.",
    steps: [
      "New applications land here within 60 seconds of submission",
      "AI pre-screens each case and assigns an initial risk score",
      "Click 'Assign' to allocate the case to an underwriter",
      "Drag to reorder priority if needed"
    ],
    tips: ["Cases auto-escalate after 4 hours without assignment"]
  },
  approvals: {
    title: "Approvals",
    summary: "Cases awaiting your approval decision. Review conditions and approve or refer.",
    steps: [
      "Each case shows the underwriter recommendation and conditions",
      "Review attached documents and AI analysis before deciding",
      "Click 'Approve' to issue an offer, or 'Refer' to escalate",
      "Add conditions or notes before finalising your decision"
    ],
    tips: ["Your mandate level determines which case values you can approve"]
  },
  mymi: {
    title: "My MI",
    summary: "Personal management information — your KPIs, targets, and performance trends.",
    steps: [
      "View your daily, weekly, and monthly performance metrics",
      "Compare your stats against team averages",
      "Track SLA compliance and turnaround times",
      "Export your MI data for appraisals or reviews"
    ],
    tips: ["Click any KPI card to drill down into the underlying data"]
  },
  myreports: {
    title: "My Reports",
    summary: "One-click report generation tailored to your persona.",
    steps: [
      "Select a report template from the available options",
      "Configure date range and filters if needed",
      "Click 'Generate' to create the report instantly",
      "Download as PDF or share via email"
    ],
    tips: ["Favourite reports appear at the top for quick access"]
  },
  uwworkstation: {
    title: "UW Workstation",
    summary: "Full underwriting workspace with documents, analysis, and decision tools.",
    steps: [
      "Review the case summary and AI risk assessment at the top",
      "Check each document in the Documents tab — AI highlights issues",
      "Use the Affordability Calculator to verify income vs. expenditure",
      "Record your decision with conditions in the Decision panel"
    ],
    tips: ["AI auto-highlights anomalies in bank statements and payslips"]
  },
  comparison: {
    title: "Comparison Engine",
    summary: "Compare up to 4 products or cases side by side on key criteria.",
    steps: [
      "Select cases or products to compare from the dropdown",
      "Key differences are highlighted in amber",
      "Scroll horizontally to see all comparison columns",
      "Export the comparison as a PDF for broker communication"
    ],
    tips: ["Pin a column to keep it visible while scrolling"]
  },
  policychecker: {
    title: "Policy Checker",
    summary: "Validate a case against lending policy rules. AI flags breaches and near-misses.",
    steps: [
      "Select a case from the dropdown or enter details manually",
      "Policy rules are checked in real-time as you enter data",
      "Green ticks mean pass, red crosses mean breach, amber means near-miss",
      "Click any rule for the full policy wording and guidance"
    ],
    tips: ["Near-miss rules (amber) may still be approvable with a mandate override"]
  },
  incomeanalysis: {
    title: "Income Analysis",
    summary: "Complex income visualisation — employed, self-employed, rental, and portfolio.",
    steps: [
      "Enter or verify income sources for each applicant",
      "AI calculates sustainable income using FCA affordability rules",
      "View the income breakdown chart for a visual summary",
      "Toggle between gross and net views"
    ],
    tips: ["Self-employed income uses a 2-year average by default — override if needed"]
  },
  collections: {
    title: "Collections",
    summary: "Manage arrears cases with AI-recommended recovery strategies.",
    steps: [
      "Cases are sorted by days in arrears — longest first",
      "AI recommends a contact strategy for each case",
      "Log contact attempts and outcomes in the activity feed",
      "Escalate to legal if the case exceeds the threshold"
    ],
    tips: ["Early intervention (under 30 days) has a 78% higher recovery rate"]
  },
  rateswitch: {
    title: "Rate Switch",
    summary: "Process product transfers and rate switches for existing customers.",
    steps: [
      "Search for the customer and select their mortgage account",
      "View available rate options with monthly payment comparison",
      "Select the new rate and confirm the switch date",
      "Generate the rate switch confirmation letter"
    ],
    tips: ["Customers within 3 months of rate expiry get priority processing"]
  },
  eligibility: {
    title: "Eligibility",
    summary: "Quick eligibility check before full application — instant AI decision.",
    steps: [
      "Enter basic details: income, property value, deposit, term",
      "AI checks against all available products in seconds",
      "Green means eligible, amber means conditions apply, red means ineligible",
      "Click 'Proceed to Smart Apply' to start the full application"
    ],
    tips: ["Eligibility results are saved for 30 days — no need to re-enter"]
  },
  commission: {
    title: "Commission Tracker",
    summary: "Track earned, pending, and paid commission across all cases.",
    steps: [
      "View commission by case, month, or product type",
      "Pending commission shows cases awaiting completion",
      "Clawback risk is flagged on cases within the retention period",
      "Export commission statements for tax or accounting"
    ],
    tips: ["Commission is calculated automatically when a case reaches 'Disbursed'"]
  },
  stresstest: {
    title: "Stress Test",
    summary: "Run affordability stress tests at various interest rate scenarios.",
    steps: [
      "Enter the loan amount, term, and current rate",
      "Select stress scenarios: +1%, +2%, +3% or custom",
      "View the impact on monthly payments and affordability ratio",
      "AI flags if the customer fails any regulatory stress threshold"
    ],
    tips: ["FCA requires a minimum +3% stress test for all new lending"]
  },
  pricing: {
    title: "Pricing Engine",
    summary: "Calculate risk-adjusted pricing and margins for new lending.",
    steps: [
      "Enter case details: LTV, product type, term, and risk score",
      "The engine calculates the base rate, margin, and final rate",
      "Compare pricing across multiple scenarios",
      "Submit for approval if the rate is outside standard pricing"
    ],
    tips: ["Pricing exceptions require senior mandate approval"]
  },
};

const GENERIC_HELP = {
  title: "Nova 2.0",
  summary: "This screen is part of Nova 2.0. For specific guidance, contact your team lead.",
  steps: [
    "Use the navigation panel on the left to switch between screens",
    "Press Cmd+K to search for any customer, case, or screen",
    "Check the Help Centre (?) for contextual guidance on any screen"
  ],
  tips: ["Press ? on any screen to open the Help Centre"]
};

// ─────────────────────────────────────────────
// HOW-TO WALKTHROUGHS
// ─────────────────────────────────────────────
const HOW_TOS = [
  {
    title: "Submit your first application",
    steps: [
      "Navigate to Smart Apply from the main menu or press N",
      "Enter the basics: income, property value, deposit, and term",
      "Review the AI-populated fields in Phase 2 — correct any errors",
      "Confirm the DIP result in Phase 3 and click Submit"
    ]
  },
  {
    title: "Fast-track approve a case",
    steps: [
      "Open the Smart Queue and find a case with a green 'Fast-Track' badge",
      "Click the case to review the AI summary and risk assessment",
      "Click 'Approve' to issue the offer — no workstation needed"
    ]
  },
  {
    title: "Request a payment holiday",
    steps: [
      "Open the customer's account in Servicing and click 'Payment Holiday'",
      "Use the slider to select the holiday duration (1-6 months)",
      "Review the impact on term and total interest, then confirm"
    ]
  },
  {
    title: "Switch a customer's rate",
    steps: [
      "Navigate to Rate Switch and search for the customer",
      "Compare available rates and select the best option",
      "Confirm the switch date and generate the confirmation letter"
    ]
  },
  {
    title: "Create a new customer",
    steps: [
      "Click '+ New Customer' from the All Customers screen",
      "Enter the customer's personal details and contact information",
      "Assign the customer to a squad and set their initial tier",
      "Save — the customer is now available across all screens"
    ]
  },
  {
    title: "Generate a report",
    steps: [
      "Navigate to My Reports from the main menu",
      "Select a report template and configure the date range",
      "Click 'Generate' and download or share the result"
    ]
  },
  {
    title: "Reassign a squad member",
    steps: [
      "Open the case or customer and click the Squad panel",
      "Click the reassign icon next to the role you want to change, then select the new team member"
    ]
  },
  {
    title: "Use the AI Copilot",
    steps: [
      "Click the AI Copilot icon in the bottom-right corner of any screen",
      "Type your question in natural language — e.g. 'What is this customer's LTV?'",
      "Review the AI response and click any linked data to navigate directly"
    ]
  },
];

// ─────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ─────────────────────────────────────────────
const SHORTCUTS = [
  { keys: "Cmd+K", label: "Universal search" },
  { keys: "Escape", label: "Close modal/panel" },
  { keys: "?", label: "Open Help Centre" },
  { keys: "N", label: "New (context-dependent)" },
  { keys: "Cmd+Enter", label: "Submit / Confirm action" },
  { keys: "Cmd+E", label: "Export current view" },
  { keys: "Cmd+/", label: "Toggle AI Copilot" },
  { keys: "G then D", label: "Go to Dashboard" },
  { keys: "G then S", label: "Go to Servicing" },
  { keys: "G then Q", label: "Go to Smart Queue" },
];

// ─────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────
const FAQS = [
  { q: "What is a squad?", a: "A squad is the team of people assigned to a case or customer. Every case has an Adviser (broker-side), an Underwriter, and a Customer Care agent. The squad ensures clear ownership and accountability throughout the lifecycle of a case." },
  { q: "How does AI fast-track work?", a: "When a case scores below a risk threshold (typically under 30), Nova AI recommends fast-track approval. This means the underwriter can approve with a single click without opening the full workstation. AI has already verified documents, checked policy, and confirmed affordability." },
  { q: "What happens when I override an AI recommendation?", a: "Your override is logged for audit purposes. You will be asked to provide a reason. The case continues with your manual decision. Override patterns are monitored by the compliance team for quality assurance." },
  { q: "How are SLA timers calculated?", a: "SLA timers start when a case enters a stage (e.g. DIP received) and count down to the target completion time for that stage. Times vary by stage and product type. Amber warnings appear at 75% elapsed, red at 90%." },
  { q: "Can I reassign a case to a different underwriter?", a: "Yes. Open the case, click the Squad panel, and use the reassign icon next to the Underwriter role. You can only reassign to underwriters with the appropriate mandate level for that case value." },
  { q: "What is the mandate level system?", a: "Mandate levels determine the maximum case value an underwriter can approve independently. Level 1: up to 500k. Level 2: up to 1M. Level 3: up to 2.5M. Level 4: unlimited. Cases above your mandate require a second signature." },
  { q: "How do I export data?", a: "Most screens have an Export button (or press Cmd+E). You can export to CSV, PDF, or Excel. Exports respect your current filters, so apply filters first to export a subset of data." },
  { q: "What does the risk score mean?", a: "The risk score (0-100) is an AI-calculated metric combining credit risk, fraud signals, affordability stress, and policy compliance. Lower scores mean lower risk. Scores above 70 require senior underwriter review." },
  { q: "How is commission calculated?", a: "Commission is calculated as a percentage of the loan amount at the point of disbursement. Rates vary by product type and volume tier. Clawback applies if the mortgage is redeemed within the retention period (typically 24 months)." },
  { q: "Who can see my performance metrics?", a: "Your own metrics are visible to you, your line manager, and the Admin persona. Team-level aggregates are visible to all team members. Individual metrics are never shared with brokers or external parties." },
];

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
const TABS = ["Quick Guide", "How-To", "Shortcuts", "FAQ"];

const BROKER_HELP_SCREENS = ["brokerdashboard","smartapply","eligibility","allcustomers","mymi","myreports","commission","messages","settings","releases"];
const BROKER_HOWTO_WHITELIST = ["Submit your first application", "Use the AI Copilot", "Generate a report"];
const BROKER_FAQ_BLACKLIST = ["What is the mandate level system?", "How does AI fast-track work?"];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function HelpCentre({ open, onClose, screenId, persona }) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [expandedHowTo, setExpandedHowTo] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  if (!open) return null;

  const q = search.toLowerCase().trim();
  const isBrokerPersona = persona === "Broker";
  const screenKey = (screenId || "").toLowerCase().replace(/[\s-]/g, "");
  const help = (isBrokerPersona && !BROKER_HELP_SCREENS.includes(screenKey))
    ? GENERIC_HELP
    : (SCREEN_HELP[screenKey] || GENERIC_HELP);

  // ── filter helpers ──
  const personaFilteredHowTos = isBrokerPersona
    ? HOW_TOS.filter(h => BROKER_HOWTO_WHITELIST.includes(h.title))
    : HOW_TOS;
  const filteredHowTos = personaFilteredHowTos.filter(h =>
    !q || h.title.toLowerCase().includes(q) || h.steps.some(s => s.toLowerCase().includes(q))
  );
  const personaFilteredFaqs = isBrokerPersona
    ? FAQS.filter(f => !BROKER_FAQ_BLACKLIST.includes(f.q))
    : FAQS;
  const filteredFaqs = personaFilteredFaqs.filter(f =>
    !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
  );
  const filteredShortcuts = SHORTCUTS.filter(s =>
    !q || s.keys.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
  );
  const guideMatchesSearch = !q || help.title.toLowerCase().includes(q) || help.summary.toLowerCase().includes(q) ||
    help.steps.some(s => s.toLowerCase().includes(q)) || (help.tips || []).some(t => t.toLowerCase().includes(q));

  const panelStyle = {
    position: "fixed", top: 0, right: 0, width: 420, height: "100vh", zIndex: 200,
    background: T.bg, borderLeft: `1px solid ${T.border}`,
    display: "flex", flexDirection: "column", fontFamily: T.font,
    boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
    animation: "slideInRight 0.25s ease",
  };

  const backdropStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 199,
    background: "rgba(12,45,59,0.18)", backdropFilter: "blur(2px)",
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                {Ico.search(18)}
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Help Centre</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4 }}>{Ico.x(20)}</button>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, borderRadius: 10, border: `1px solid ${T.border}`, padding: "0 12px", marginBottom: 16 }}>
            <span style={{ color: T.textMuted }}>{Ico.search(16)}</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search help articles, shortcuts, guides..."
              style={{ flex: 1, padding: "10px 0", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(14)}</button>}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}` }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: "none", border: "none", borderBottom: tab === i ? `2px solid ${T.primary}` : "2px solid transparent",
                color: tab === i ? T.primary : T.textMuted, fontFamily: T.font, transition: "all 0.15s",
              }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>

          {/* ── Quick Guide ── */}
          {tab === 0 && (
            guideMatchesSearch ? (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{help.title}</div>
                <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 20 }}>{help.summary}</div>

                <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Steps</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {help.steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 8, background: T.primaryLight, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, paddingTop: 2 }}>{s}</div>
                    </div>
                  ))}
                </div>

                {help.tips && help.tips.length > 0 && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Tips</div>
                    {help.tips.map((tip, i) => (
                      <Card key={i} style={{ background: T.primaryLight, border: `1px solid ${T.primary}22`, marginBottom: 8, padding: 14 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: T.accent, flexShrink: 0 }}>{Ico.sparkle(16)}</span>
                          <span style={{ fontSize: 12, color: T.primary, lineHeight: 1.5 }}>{tip}</span>
                        </div>
                      </Card>
                    ))}
                  </>
                )}

                {persona && (
                  <div style={{ marginTop: 20, padding: 12, borderRadius: 10, background: T.warningBg, border: `1px solid ${T.warningBorder}`, fontSize: 12, color: T.text }}>
                    Viewing as <strong>{persona}</strong>. Some features may vary by role.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted, fontSize: 13 }}>No guide content matches your search.</div>
            )
          )}

          {/* ── How-To ── */}
          {tab === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredHowTos.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted, fontSize: 13 }}>No walkthroughs match your search.</div>
              )}
              {filteredHowTos.map((h, i) => {
                const isOpen = expandedHowTo === i;
                return (
                  <Card key={i} style={{ padding: 0, cursor: "pointer", overflow: "hidden" }}>
                    <div onClick={() => setExpandedHowTo(isOpen ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.primaryLight, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{h.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: T.textMuted, background: T.bg, padding: "2px 8px", borderRadius: 6 }}>{h.steps.length} steps</span>
                        <span style={{ color: T.textMuted, transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", display: "flex" }}>{Ico.arrow(14)}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.borderLight}` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 14 }}>
                          {h.steps.map((s, j) => (
                            <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{j + 1}</div>
                              <span style={{ fontSize: 13, color: T.text, lineHeight: 1.5, paddingTop: 1 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* ── Shortcuts ── */}
          {tab === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {filteredShortcuts.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: T.textMuted, fontSize: 13 }}>No shortcuts match your search.</div>
              )}
              {filteredShortcuts.map((s, i) => (
                <Card key={i} style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{
                    display: "inline-block", fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13, fontWeight: 700,
                    background: T.bg, color: T.primary, padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.border}`,
                    textAlign: "center", letterSpacing: 0.3,
                  }}>{s.keys}</span>
                  <span style={{ fontSize: 12, color: T.textMuted, textAlign: "center" }}>{s.label}</span>
                </Card>
              ))}
            </div>
          )}

          {/* ── FAQ ── */}
          {tab === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredFaqs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted, fontSize: 13 }}>No FAQs match your search.</div>
              )}
              {filteredFaqs.map((f, i) => {
                const isOpen = expandedFaq === i;
                return (
                  <Card key={i} style={{ padding: 0, cursor: "pointer", overflow: "hidden" }}>
                    <div onClick={() => setExpandedFaq(isOpen ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1 }}>{f.q}</span>
                      <span style={{ color: T.textMuted, transform: isOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s", display: "flex", flexShrink: 0, marginLeft: 8 }}>{Ico.arrow(14)}</span>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${T.borderLight}` }}>
                        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7, paddingTop: 12 }}>{f.a}</div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>Nova 2.0 Help Centre</span>
          <span style={{ fontSize: 11, color: T.textMuted }}>Press ? to toggle</span>
        </div>
      </div>
    </>
  );
}
