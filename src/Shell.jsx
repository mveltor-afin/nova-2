import { useState, useEffect } from "react";
import { T, Ico, PERSONAS } from "./shared/tokens";
import { Btn, Card, KPICard } from "./shared/primitives";
import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES } from "./data/customers";
import { MOCK_LOANS } from "./data/loans";
import { StatusBadge } from "./shared/tokens";
// Shared overlays
import NotificationsPanel from "./shared/NotificationsPanel";
import CommandPalette from "./shared/CommandPalette";
import NovaCopilot from "./shared/NovaCopilot";
import MessagesScreen from "./shared/MessagesScreen";
// Customers
import CustomerHub from "./customers/CustomerHub";
import CustomerPortal from "./customers/CustomerPortal";
// Products
import MortgagesScreen from "./products/MortgagesScreen";
import SavingsScreen from "./products/SavingsScreen";
import SavingsDashboard from "./products/SavingsDashboard";
import CurrentAccountsScreen from "./products/CurrentAccountsScreen";
import InsuranceScreen from "./products/InsuranceScreen";
import SharedOwnershipScreen from "./products/SharedOwnershipScreen";
import DisbursementsScreen from "./products/DisbursementsScreen";
// Workflows
import IntakeQueue from "./workflows/IntakeQueue";
import ApprovalsScreen from "./workflows/ApprovalsScreen";
import CaseWorkbench from "./workflows/CaseWorkbench";
// Origination
import LoanWizard from "./origination/LoanWizard";
import ApplicationDetail from "./origination/ApplicationDetail";
import EligibilityCalculator from "./origination/EligibilityCalculator";
import SmartPrefill from "./origination/SmartPrefill";
import PropertyScreen from "./origination/PropertyScreen";
import ValuationScreen from "./origination/ValuationScreen";
// Intelligence
import AIDashboard from "./intelligence/AIDashboard";
import RiskAnomalies from "./intelligence/RiskAnomalies";
import PipelineForecaster from "./intelligence/PipelineForecaster";
import PortfolioRiskScreen from "./intelligence/PortfolioRiskScreen";
import BrokerScorecardScreen from "./intelligence/BrokerScorecardScreen";
import AIModelScreen from "./intelligence/AIModelScreen";
import MIScreen from "./intelligence/MIScreen";
// Servicing
import ServicingScreen from "./servicing/ServicingScreen";
import CollectionsScreen from "./servicing/CollectionsScreen";
import RateSwitchPortal from "./servicing/RateSwitchPortal";
// Admin
import UsersRolesScreen from "./admin/UsersRolesScreen";
import TeamHierarchyScreen from "./admin/TeamHierarchyScreen";
import MandatesScreen from "./admin/MandatesScreen";
import SessionsScreen from "./admin/SessionsScreen";
import FeatureFlagsScreen from "./admin/FeatureFlagsScreen";
import AuditScreen from "./admin/AuditScreen";
import AnomalyScreen from "./admin/AnomalyScreen";
import PermissionsScreen from "./admin/PermissionsScreen";
import ComplaintsScreen from "./admin/ComplaintsScreen";
import ConsumerDutyScreen from "./admin/ConsumerDutyScreen";
import RegulatoryReportingScreen from "./admin/RegulatoryReportingScreen";
import IntegrationsScreen from "./admin/IntegrationsScreen";
import SettingsScreen from "./admin/SettingsScreen";
import WorkflowBuilder from "./admin/WorkflowBuilder";
import ProductCatalogue from "./admin/ProductCatalogue";
import DocumentTemplates from "./admin/DocumentTemplates";
import APIHealthDashboard from "./admin/APIHealthDashboard";
import ReportBuilder from "./admin/ReportBuilder";
import CaseJourney from "./admin/CaseJourney";
// Operations
import CommsCentre from "./operations/CommsCentre";
// Shared — new
import OnboardingTour from "./shared/OnboardingTour";
import UniversalSearch from "./shared/UniversalSearch";
import PresenceIndicator from "./shared/PresenceIndicator";
import WhatsNew from "./shared/WhatsNew";
// BDM
import BDMDashboard from "./bdm/BDMDashboard";
import EnquiryForm from "./bdm/EnquiryForm";
import EnquiryDetail from "./bdm/EnquiryDetail";
import CriteriaQuickCheck from "./bdm/CriteriaQuickCheck";
// Round 3 enhancements
import CommissionTracker from "./origination/CommissionTracker";
import MyReports from "./intelligence/MyReports";
import BrokerDashboardV2 from "./origination/BrokerDashboardV2";
import NewCustomerWizard from "./customers/NewCustomerWizard";
import ComplianceCalendar from "./admin/ComplianceCalendar";
import SegmentationEngine from "./admin/SegmentationEngine";
import BrokerOnboarding from "./admin/BrokerOnboarding";
import DataExportCentre from "./admin/DataExportCentre";
import PricingEngine from "./intelligence/PricingEngine";
import StressTestDashboard from "./intelligence/StressTestDashboard";
import BoardPackGenerator from "./intelligence/BoardPackGenerator";

// ─────────────────────────────────────────────
// NOVA 2.0 — MAIN SHELL
// Customer-first mortgage/savings/insurance platform
// ─────────────────────────────────────────────

const PRIORITY_COLORS = {
  Critical: { bg:"#FEE2E2", text:"#991B1B", border:"#FCA5A5" },
  High:     { bg:"#FFF8E0", text:"#92400E", border:"#FFD966" },
  Medium:   { bg:"#DBEAFE", text:"#1E40AF", border:"#93C5FD" },
  Low:      { bg:"#E6F7F3", text:"#065F46", border:"#A3DDD1" },
};

const SEGMENT_COLORS = {
  Premier:  { bg:"#EDE9FE", text:"#5B21B6" },
  Standard: { bg:"#DBEAFE", text:"#1E40AF" },
  "At Risk":{ bg:"#FEE2E2", text:"#991B1B" },
  New:      { bg:"#E6F7F3", text:"#065F46" },
};

const KYC_COLORS = {
  Verified: { bg:"#D1FAE5", text:"#065F46" },
  Expired:  { bg:"#FEE2E2", text:"#991B1B" },
  Pending:  { bg:"#FEF3C7", text:"#92400E" },
};

const RISK_COLORS = {
  Low:    { bg:"#D1FAE5", text:"#065F46" },
  Medium: { bg:"#FEF3C7", text:"#92400E" },
  High:   { bg:"#FEE2E2", text:"#991B1B" },
};

const TIER_COLORS = {
  Bronze:   "#CD7F32",
  Silver:   "#C0C0C0",
  Gold:     "#FFD700",
  Platinum: "#8B5CF6",
};

// Helpers
const Badge = ({ bg, text, children }) => (
  <span style={{ background:bg, color:text, padding:"3px 10px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>{children}</span>
);

const getCustomerProducts = (cust) => PRODUCTS.filter(p => cust.products.includes(p.id));
const getProductTypes = (cust) => {
  const prods = getCustomerProducts(cust);
  const types = [...new Set(prods.map(p => p.type))];
  return types;
};

// Customers that need attention (Critical or High AI actions)
const getNeedsAttention = () => {
  const results = [];
  for (const cust of CUSTOMERS) {
    const actions = AI_ACTIONS[cust.id];
    if (!actions) continue;
    const urgent = actions.filter(a => a.priority === "Critical" || a.priority === "High");
    if (urgent.length > 0) {
      results.push({ customer: cust, actions: urgent, topAction: urgent[0] });
    }
  }
  return results;
};

export default function Shell({ userType }) {
  const [persona, setPersona] = useState(userType === "external" ? "Broker" : "Ops");
  const [screen, setScreen] = useState(userType === "external" ? "brokerdashboard" : "needsattention");
  const [personaOpen, setPersonaOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [contextCustomer, setContextCustomer] = useState(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mode, setMode] = useState("shell"); // "shell" | "wizard" | "casedetail"
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(`nova_onboarding_done`));

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleGroup = (g) => setCollapsedGroups(p => ({ ...p, [g]: !p[g] }));

  // Cmd+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isBroker = persona === "Broker";
  const needsAttentionCount = getNeedsAttention().length;

  // ── Nav groups — simplified per-persona ──
  const navGroups = isBroker
    ? [
        // Broker: 3 things — submit, track, earn
        { group:"HOME", items:[
          { id:"brokerdashboard", label:"Dashboard & Pipeline", icon:"dashboard" },
          { id:"smartapply",      label:"Smart Apply",          icon:"sparkle" },
          { id:"eligibility",     label:"Eligibility Check",    icon:"zap" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"brokercustomers", label:"My Customers",  icon:"customers" },
        ]},
        { group:"INSIGHTS", items:[
          { id:"brokermi",       label:"My MI",        icon:"chart" },
          { id:"myreports",      label:"My Reports",   icon:"file" },
          { id:"commission",     label:"Commission",   icon:"dollar" },
          { id:"messages",       label:"Messages",     icon:"messages", badge:3 },
        ]},
        { group:null, items:[
          { id:"settings", label:"Settings", icon:"settings" },
        ]},
      ]
    : persona === "BDM"
    ? [
        // BDM: enquiries, broker relationships, criteria checks
        { group:"MY WORK", items:[
          { id:"bdmdashboard",    label:"Dashboard",         icon:"dashboard" },
          { id:"newenquiry",      label:"New Enquiry",       icon:"plus" },
          { id:"criteriacheck",   label:"Criteria Check",    icon:"zap" },
        ]},
        { group:"BROKERS", items:[
          { id:"allcustomers",    label:"My Brokers",        icon:"customers" },
          { id:"messages",        label:"Messages",          icon:"messages", badge:2 },
        ]},
        { group:"INSIGHTS", items:[
          { id:"mymi",            label:"My MI",             icon:"chart" },
          { id:"myreports",       label:"My Reports",        icon:"file" },
        ]},
        { group:null, items:[
          { id:"settings",        label:"Settings",          icon:"settings" },
        ]},
      ]
    : persona === "Underwriter"
    ? [
        // Underwriter: queue → case → decision. That's it.
        { group:"MY WORK", items:[
          { id:"intake",          label:"My Queue",           icon:"shield", badge:3 },
          { id:"approvals",       label:"Approvals",          icon:"check" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"needsattention",  label:"Needs Attention",    icon:"alert", badge:needsAttentionCount },
          { id:"allcustomers",    label:"All Customers",      icon:"customers" },
        ]},
        { group:"INTELLIGENCE", items:[
          { id:"aidashboard",     label:"AI Dashboard",       icon:"sparkle" },
          { id:"mymi",            label:"My MI",              icon:"chart" },
          { id:"myreports",      label:"My Reports",         icon:"file" },
          { id:"messages",        label:"Messages",           icon:"messages", badge:5 },
        ]},
        { group:"SERVICING", items:[
          { id:"servicing",       label:"Mortgage Servicing",  icon:"wallet" },
        ]},
        { group:null, items:[
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : persona === "Finance"
    ? [
        // Finance: disbursements first, then risk tools
        { group:"MY WORK", items:[
          { id:"disbursements",   label:"Disbursements",      icon:"dollar" },
          { id:"approvals",       label:"Approvals",          icon:"check" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"needsattention",  label:"Needs Attention",    icon:"alert", badge:needsAttentionCount },
          { id:"allcustomers",    label:"All Customers",      icon:"customers" },
        ]},
        { group:"PRODUCTS", items:[
          { id:"mortgages",       label:"Mortgages",           icon:"loans" },
          { id:"savings",         label:"Savings",             icon:"dollar" },
          { id:"servicing",       label:"Mortgage Servicing",  icon:"wallet" },
        ]},
        { group:"RISK & ANALYTICS", items:[
          { id:"portfoliorisk",   label:"Portfolio Risk",      icon:"shield" },
          { id:"stresstest",      label:"Stress Testing",      icon:"alert" },
          { id:"pricing",         label:"Pricing Engine",      icon:"dollar" },
          { id:"mymi",            label:"My MI",               icon:"chart" },
          { id:"myreports",      label:"My Reports",          icon:"file" },
          { id:"brokerscorecard", label:"Broker Scorecard",    icon:"customers" },
        ]},
        { group:"TOOLS", items:[
          { id:"boardpack",       label:"Board Pack",          icon:"file" },
          { id:"compliance_cal",  label:"Compliance Calendar", icon:"clock" },
          { id:"messages",        label:"Messages",            icon:"messages", badge:5 },
        ]},
        { group:null, items:[
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : persona === "Risk Analyst"
    ? [
        // Risk Analyst: compliance hub + risk tools
        { group:"COMPLIANCE HUB", items:[
          { id:"consumerduty",    label:"Consumer Duty",       icon:"shield" },
          { id:"regulatory",      label:"Regulatory",          icon:"file" },
          { id:"compliance_cal",  label:"Compliance Calendar", icon:"clock" },
        ]},
        { group:"RISK ANALYSIS", items:[
          { id:"portfoliorisk",   label:"Portfolio Risk",      icon:"shield" },
          { id:"stresstest",      label:"Stress Testing",      icon:"alert" },
          { id:"riskanomaly",     label:"Risk & Anomalies",    icon:"alert" },
          { id:"aimodels",        label:"AI Models",           icon:"sparkle" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"needsattention",  label:"Needs Attention",     icon:"alert", badge:needsAttentionCount },
          { id:"allcustomers",    label:"All Customers",       icon:"customers" },
        ]},
        { group:"SERVICING", items:[
          { id:"servicing",       label:"Mortgage Servicing",  icon:"wallet" },
        ]},
        { group:null, items:[
          { id:"mymi",            label:"My MI",              icon:"chart" },
          { id:"myreports",      label:"My Reports",         icon:"file" },
          { id:"messages",        label:"Messages",           icon:"messages", badge:5 },
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : [
        // Ops & Admin — shared base, Admin gets extra sections
        { group:"MY CUSTOMERS", items:[
          { id:"needsattention",  label:"Needs Attention",     icon:"alert", badge:needsAttentionCount },
          { id:"allcustomers",    label:"All Customers",       icon:"customers" },
          { id:"newcustomer",     label:"New Customer",        icon:"plus" },
        ]},
        { group:"WORKFLOWS", items:[
          { id:"intake",          label:"Intake Queue",        icon:"zap", badge:3 },
          { id:"approvals",       label:"Approvals",           icon:"check" },
          ...(persona === "Ops" || persona === "Admin" ? [
            { id:"valuations",    label:"Valuations & Property",icon:"eye" },
          ] : []),
        ]},
        { group:"PRODUCTS", items:[
          { id:"mortgages",       label:"Mortgages",            icon:"loans" },
          { id:"savings",         label:"Savings",              icon:"dollar" },
          { id:"currentaccounts", label:"Current Accounts",     icon:"wallet" },
          { id:"insurance",       label:"Insurance",            icon:"shield" },
          { id:"sharedownership", label:"Shared Ownership",     icon:"assign" },
        ]},
        { group:"SERVICING", items:[
          { id:"servicing",       label:"Mortgage Servicing",   icon:"wallet" },
          ...(persona === "Ops" ? [
            { id:"complaints",    label:"Complaints",           icon:"alert" },
          ] : []),
        ]},
        { group:"INTELLIGENCE", items:[
          { id:"aidashboard",     label:"AI Dashboard",         icon:"sparkle" },
          { id:"mymi",            label:"My MI",                icon:"chart" },
          { id:"myreports",      label:"My Reports",           icon:"file" },
          ...(persona === "Admin" ? [
            { id:"forecaster",    label:"Pipeline Forecaster",  icon:"chart" },
            { id:"brokerscorecard",label:"Broker Scorecard",    icon:"customers" },
          ] : []),
          { id:"messages",        label:"Messages",             icon:"messages", badge:5 },
        ]},
        ...((persona === "Ops" || persona === "Admin") ? [{
          group:"OPS TOOLKIT", items:[
            { id:"commscentre",    label:"Comms Centre",        icon:"send" },
            { id:"doctemplates",   label:"Doc Templates",       icon:"file" },
            { id:"casejourney",    label:"Case Journey",        icon:"clock" },
          ],
        }] : []),
        ...(persona === "Admin" ? [{
          group:"PEOPLE", collapsed:true, items:[
            { id:"usersroles",    label:"Users & Roles",        icon:"users" },
            { id:"permissions",   label:"Permissions",           icon:"shield" },
            { id:"team",          label:"Team Hierarchy",        icon:"assign" },
            { id:"brokeronboard", label:"Broker Onboarding",    icon:"assign" },
            { id:"segmentation",  label:"Segmentation",          icon:"customers" },
          ],
        },
        {
          group:"PLATFORM", collapsed:true, items:[
            { id:"workflows",     label:"Workflow Builder",      icon:"zap" },
            { id:"products",      label:"Product Catalogue",     icon:"products" },
            { id:"flags",         label:"Feature Flags",         icon:"zap" },
            { id:"mandates",      label:"Mandates",              icon:"shield" },
            { id:"reportbuilder", label:"Report Builder",        icon:"chart" },
            { id:"apihealth",     label:"API Health",            icon:"zap" },
            { id:"dataexport",    label:"Data Export",            icon:"download" },
            { id:"audit",         label:"Audit & Sessions",      icon:"clock" },
            { id:"anomalies",     label:"AI Anomalies",          icon:"alert" },
          ],
        },
        {
          group:"FINANCE & RISK", collapsed:true, items:[
            { id:"portfoliorisk", label:"Portfolio Risk",        icon:"shield" },
            { id:"stresstest",    label:"Stress Testing",        icon:"alert" },
            { id:"pricing",       label:"Pricing Engine",        icon:"dollar" },
            { id:"boardpack",     label:"Board Pack",            icon:"file" },
            { id:"compliance_cal",label:"Compliance Calendar",   icon:"clock" },
          ],
        }] : []),
        { group:null, items:[
          { id:"settings",        label:"Settings",             icon:"settings" },
        ]},
      ];

  // ── Breadcrumb ──
  const getBreadcrumb = () => {
    const parts = ["Nova 2.0"];
    for (const g of navGroups) {
      const found = g.items.find(i => i.id === screen);
      if (found) {
        if (g.group) parts.push(g.group.charAt(0) + g.group.slice(1).toLowerCase());
        parts.push(found.label);
        break;
      }
    }
    return parts;
  };

  // ── Sidebar ──
  const Sidebar = () => (
    <>
    {/* Mobile backdrop */}
    {isMobile && sidebarOpen && (
      <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:199 }} />
    )}
    <div style={{
      width:252, background:`linear-gradient(180deg,${T.navy},#0C1829)`, color:"#fff", display:"flex", flexDirection:"column", flexShrink:0, height:"100vh",
      ...(isMobile ? { position:"fixed", left:0, top:0, zIndex:200, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition:"transform 0.25s ease" } : { position:"sticky", top:0 }),
    }}>
      {/* Logo */}
      <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${T.primary},${T.accent})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>N</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, letterSpacing:-0.3 }}>Nova <span style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.4)" }}>2.0</span></div>
            <div style={{ fontSize:10, color:"#64748B", letterSpacing:0.5, textTransform:"uppercase" }}>Afin Bank</div>
          </div>
          {isMobile && <span onClick={() => setSidebarOpen(false)} style={{ marginLeft:"auto", cursor:"pointer", color:"rgba(255,255,255,0.5)", fontSize:20 }}>×</span>}
        </div>
      </div>

      {/* Persona switcher */}
      <div style={{ padding:"10px 10px 4px" }}>
        <div onClick={() => setPersonaOpen(!personaOpen)}
          style={{ padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", cursor:"pointer",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            border:"1px solid rgba(255,255,255,0.08)", transition:"all 0.15s" }}>
          <div>
            <div style={{ fontSize:10, color:"#64748B", textTransform:"uppercase", letterSpacing:0.5 }}>Viewing as</div>
            <div style={{ fontSize:13, fontWeight:600, color:"#CBD5E1" }}>{persona}</div>
          </div>
          <span style={{ color:"#64748B", fontSize:10, transition:"transform 0.2s", transform:personaOpen?"rotate(180deg)":"rotate(0)" }}>&#x25BC;</span>
        </div>
        {personaOpen && (
          <div style={{ marginTop:4, background:"#1E293B", borderRadius:8, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)" }}>
            {PERSONAS.map(p => (
              <div key={p} onClick={() => {
                setPersona(p); setPersonaOpen(false);
                setScreen(p === "Broker" ? "brokerdashboard" : p === "BDM" ? "bdmdashboard" : p === "Underwriter" ? "intake" : p === "Finance" ? "disbursements" : p === "Risk Analyst" ? "consumerduty" : "needsattention");
                setCollapsedGroups({});
                setContextCustomer(null);
              }}
                style={{ padding:"8px 12px", cursor:"pointer", fontSize:13,
                  fontWeight:p===persona?600:400, color:p===persona?T.accent:"#94A3B8",
                  background:p===persona?"rgba(49,184,151,0.08)":"transparent",
                  transition:"background 0.12s" }}
                onMouseEnter={e => { if (p !== persona) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (p !== persona) e.currentTarget.style.background = "transparent"; }}>
                {p}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav style={{ flex:1, padding:"6px 8px", display:"flex", flexDirection:"column", gap:0, overflowY:"auto" }}>
        {navGroups.filter(g => g.visible !== false).map((group, gi) => (
          <div key={gi}>
            {group.group && (
              <div onClick={() => toggleGroup(group.group)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px 4px",
                  cursor:"pointer", userSelect:"none" }}>
                <span style={{ fontSize:10, fontWeight:700, color:"#4A5568", textTransform:"uppercase", letterSpacing:1 }}>{group.group}</span>
                <span style={{ fontSize:9, color:"#4A5568", transition:"transform 0.2s",
                  transform:(collapsedGroups[group.group] ?? group.collapsed)?"rotate(-90deg)":"rotate(0)" }}>&#x25BC;</span>
              </div>
            )}
            {!(collapsedGroups[group.group] ?? group.collapsed) && group.items.map(item => (
              <div key={item.id} onClick={() => { setScreen(item.id); if (isMobile) setSidebarOpen(false); }}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", borderRadius:8,
                  cursor:"pointer", fontSize:13, fontWeight:500, transition:"all 0.12s",
                  color: screen===item.id ? "#fff" : "#7B8BA3",
                  background: screen===item.id ? "rgba(255,255,255,0.08)" : "transparent",
                  marginBottom:1 }}
                onMouseEnter={e => { if (screen !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (screen !== item.id) e.currentTarget.style.background = "transparent"; }}>
                {item.icon && Ico[item.icon]?.(15)}
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && <span style={{ background:"#EF4444", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:10, minWidth:16, textAlign:"center" }}>{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff" }}>
          {isBroker ? "JW" : persona[0]}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:500, color:"#E2E8F0" }}>{isBroker ? "John Watson" : `${persona} User`}</div>
          <div style={{ fontSize:10, color:"#64748B" }}>{isBroker ? "FCA: 123456" : "Afin Bank"}</div>
        </div>
      </div>
    </div>
    </>
  );

  // ── Top Bar ──
  const TopBar = () => {
    const crumbs = getBreadcrumb();
    return (
      <div style={{ height:56, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "0 16px" : "0 28px", background:T.card, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Hamburger on mobile */}
          {isMobile && (
            <div onClick={() => setSidebarOpen(true)} style={{ cursor:"pointer", color:T.text, display:"flex", padding:4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </div>
          )}
          {/* Breadcrumbs */}
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:T.textMuted, overflow:"hidden" }}>
            {(isMobile ? crumbs.slice(-1) : crumbs).map((c, i) => (
              <span key={i} style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                {i > 0 && <span style={{ color:T.border }}>/</span>}
                <span style={{ color: i === (isMobile ? 0 : crumbs.length - 1) ? T.text : T.textMuted, fontWeight:600 }}>{c}</span>
              </span>
            ))}
          </div>
        </div>
        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 10 : 14 }}>
          {/* Search trigger — icon only on mobile */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding: isMobile ? "6px" : "6px 14px", borderRadius:8, border:`1px solid ${T.border}`, cursor:"pointer", background:"#F8FAFC" }}
            onClick={() => setShowCommandPalette(true)}>
            <span style={{ color:T.textMuted, display:"flex" }}>{Ico.search(14)}</span>
            {!isMobile && <span style={{ fontSize:12, color:T.textMuted }}>Search...</span>}
            {!isMobile && <span style={{ fontSize:10, color:T.textMuted, background:T.bg, padding:"1px 6px", borderRadius:4, fontWeight:600, marginLeft:8, fontFamily:"monospace" }}>⌘K</span>}
          </div>
          {/* What's New */}
          <div onClick={() => setShowWhatsNew(true)} style={{ cursor:"pointer", color:T.textMuted, display:"flex", padding:4 }} title="What's New">
            {Ico.sparkle(16)}
          </div>
          {/* Notifications */}
          <div onClick={() => setShowNotifications(true)} style={{ position:"relative", cursor:"pointer", color:T.textMuted, display:"flex", padding:4 }}>
            {Ico.bell(18)}
            <div style={{ position:"absolute", top:2, right:2, width:8, height:8, borderRadius:4, background:"#EF4444", border:"2px solid #fff" }} />
          </div>
        </div>
      </div>
    );
  };

  // ── Context Bar ──
  const ContextBar = () => {
    if (!contextCustomer) return null;
    const custProducts = getCustomerProducts(contextCustomer);
    return (
      <div style={{ height:40, background:"linear-gradient(135deg, rgba(26,74,84,0.06), rgba(49,184,151,0.04))", borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
          <span style={{ color:T.accent, display:"flex" }}>{Ico.user(14)}</span>
          <span style={{ fontWeight:600, color:T.text }}>Working on: {contextCustomer.name}</span>
          <span style={{ color:T.textMuted }}>({contextCustomer.id})</span>
          <span style={{ color:T.border }}>|</span>
          <span style={{ color:T.textMuted }}>{custProducts.length} product{custProducts.length !== 1 ? "s" : ""}</span>
        </div>
        <span onClick={() => setContextCustomer(null)} style={{ fontSize:11, color:T.textMuted, cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
          {Ico.x(12)} Clear
        </span>
      </div>
    );
  };

  // ── SCREENS ──

  // Needs Attention (default home for internal users)
  const NeedsAttentionScreen = () => {
    const items = getNeedsAttention();
    return (
      <div>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px", color:T.text }}>Needs Attention</h1>
          <p style={{ margin:0, fontSize:13, color:T.textMuted }}>{items.length} customers require action today</p>
        </div>

        <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
          <KPICard label="Critical" value={String(items.filter(i => i.topAction.priority === "Critical").length)} sub="Immediate action" color="#EF4444" />
          <KPICard label="High Priority" value={String(items.filter(i => i.topAction.priority === "High").length)} sub="Within 24 hours" color="#F59E0B" />
          <KPICard label="Total Actions" value={String(items.reduce((s, i) => s + i.actions.length, 0))} sub="Across all customers" color={T.primary} />
          <KPICard label="Arrears" value={
            "£" + PRODUCTS.filter(p => p.arrears).reduce((s, p) => s + parseInt(p.arrears.replace(/[£,]/g, "")), 0).toLocaleString()
          } sub="Total outstanding" color="#EF4444" />
        </div>

        <Card noPad>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.text }}>Customers Requiring Action</span>
            <span style={{ fontSize:12, color:T.textMuted }}>{items.length} customer{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map((item, idx) => {
            const { customer: c, actions, topAction } = item;
            const prods = getCustomerProducts(c);
            const pc = PRIORITY_COLORS[topAction.priority];
            return (
              <div key={c.id} onClick={() => { setContextCustomer(c); setScreen("customerhub"); }}
                style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"16px 20px",
                  borderTop: idx ? `1px solid ${T.borderLight}` : "none", cursor:"pointer",
                  transition:"background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,
                  display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700, flexShrink:0 }}>
                  {c.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{c.name}</span>
                    <span style={{ fontSize:11, color:T.textMuted }}>{c.id}</span>
                    <Badge bg={SEGMENT_COLORS[c.segment]?.bg} text={SEGMENT_COLORS[c.segment]?.text}>{c.segment}</Badge>
                    {c.vuln && <Badge bg="#FEE2E2" text="#991B1B">Vulnerable</Badge>}
                  </div>
                  <div style={{ fontSize:12, color:T.textMuted, marginBottom:8 }}>
                    {prods.length} product{prods.length !== 1 ? "s" : ""} &middot; {c.since} &middot; LTV {c.ltv}
                  </div>
                  {/* Top action */}
                  <div style={{ padding:"10px 14px", borderRadius:8, background:pc.bg, border:`1px solid ${pc.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <Badge bg={pc.bg} text={pc.text}>{topAction.priority}</Badge>
                      <span style={{ fontSize:11, color:pc.text, fontWeight:500 }}>{topAction.type}</span>
                    </div>
                    <div style={{ fontSize:13, color:pc.text, fontWeight:500, lineHeight:1.5 }}>{topAction.action}</div>
                    <div style={{ fontSize:11, color:pc.text, opacity:0.7, marginTop:4 }}>Impact: {topAction.impact}</div>
                  </div>
                  {actions.length > 1 && (
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>+ {actions.length - 1} more action{actions.length - 1 > 1 ? "s" : ""}</div>
                  )}
                </div>
                {/* Risk badge */}
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                  <Badge bg={RISK_COLORS[c.risk]?.bg} text={RISK_COLORS[c.risk]?.text}>Risk: {c.risk}</Badge>
                  <Badge bg={KYC_COLORS[c.kyc]?.bg} text={KYC_COLORS[c.kyc]?.text}>KYC: {c.kyc}</Badge>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    );
  };

  // All Customers
  const AllCustomersScreen = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px", color:T.text }}>All Customers</h1>
          <p style={{ margin:0, fontSize:13, color:T.textMuted }}>{CUSTOMERS.length} customers across all segments</p>
        </div>
        <Btn primary icon="plus">New Customer</Btn>
      </div>
      <Card noPad>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Name","Segment","Products","Risk","KYC","NPS","Rel. Value","Tier"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c, i) => {
              const prods = getCustomerProducts(c);
              const types = getProductTypes(c);
              return (
                <tr key={c.id} onClick={() => { setContextCustomer(c); setScreen("customerhub"); }}
                  style={{ cursor:"pointer", borderTop:`1px solid ${T.borderLight}`, transition:"background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,
                        display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {c.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>{c.id} &middot; Since {c.since}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={SEGMENT_COLORS[c.segment]?.bg} text={SEGMENT_COLORS[c.segment]?.text}>{c.segment}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{prods.length}</span>
                      <div style={{ display:"flex", gap:3 }}>
                        {types.map((t, ti) => (
                          <span key={ti} style={{ color:PRODUCT_TYPES[t]?.color || T.textMuted, display:"flex" }} title={PRODUCT_TYPES[t]?.label}>
                            {Ico[PRODUCT_TYPES[t]?.icon]?.(12)}
                          </span>
                        ))}
                      </div>
                      {c.pendingProducts.length > 0 && (
                        <span style={{ fontSize:10, color:T.warning, fontWeight:600 }}>+{c.pendingProducts.length} pending</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={RISK_COLORS[c.risk]?.bg} text={RISK_COLORS[c.risk]?.text}>{c.risk}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={KYC_COLORS[c.kyc]?.bg} text={KYC_COLORS[c.kyc]?.text}>{c.kyc}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:13, fontWeight:600, color: c.nps == null ? T.textMuted : c.nps >= 9 ? T.success : c.nps >= 7 ? T.text : T.danger }}>
                      {c.nps != null ? c.nps : "—"}
                    </span>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.ltv}</span>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:TIER_COLORS[c.gamification.tier], letterSpacing:0.3 }}>
                      {c.gamification.tier}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // Broker Dashboard — origination pipeline
  const openLoan = (loan) => { setSelectedLoan(loan); setMode("casedetail"); };

  const BrokerDashboard = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>Good morning</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Here's your pipeline overview</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn primary iconNode={Ico.plus(16)} onClick={() => setMode("wizard")}>New Loan</Btn>
        </div>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <KPICard label="Active Cases" value={String(MOCK_LOANS.length)} sub="2 need attention" color={T.primary} />
        <KPICard label="Total Pipeline" value="£2.35M" sub="across all cases" color="#8B5CF6" />
        <KPICard label="Avg DIP Time" value="4.2 min" sub="↓ 92% vs manual" color={T.success} />
        <KPICard label="This Month" value="£890K" sub="3 completions" color={T.warning} />
      </div>
      <div style={{ display:"flex", gap:18 }}>
        <div style={{ flex:2 }}>
          <Card noPad>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:600 }}>Recent Cases</span>
              <span style={{ fontSize:12, color:T.primary, cursor:"pointer", fontWeight:500 }} onClick={() => setScreen("myapplications")}>View all →</span>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr style={{ background:"#F8FAFC" }}>
                {["Case ID","Customer","Amount","Status","Updated"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"9px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {MOCK_LOANS.slice(0,5).map((loan,i) => (
                  <tr key={i} onClick={() => openLoan(loan)} style={{ cursor:"pointer", borderTop:`1px solid ${T.borderLight}` }}>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:T.primary }}>{loan.id}</td>
                    <td style={{ padding:"12px 16px", fontSize:13 }}>{loan.names}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:500 }}>{loan.amount}</td>
                    <td style={{ padding:"12px 16px" }}><StatusBadge status={loan.status} /></td>
                    <td style={{ padding:"12px 16px", fontSize:12, color:T.textMuted }}>{loan.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        <div style={{ flex:1 }}>
          <Card>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Notifications</div>
            {[
              { text:"Offer issued for AFN-2026-00139", time:"1h ago", color:T.success },
              { text:"DIP approved: Afin Fix 2yr 75%", time:"3h ago", color:T.primary },
              { text:"Document flagged on AFN-00135", time:"1d ago", color:T.warning },
              { text:"New message from Afin Ops", time:"2d ago", color:T.primary },
            ].map((n,i) => (
              <div key={i} style={{ padding:"10px 0", borderTop:i?`1px solid ${T.borderLight}`:"none", display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:8, height:8, borderRadius:4, marginTop:5, flexShrink:0, background:n.color }} />
                <div><div style={{ fontSize:13 }}>{n.text}</div><div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{n.time}</div></div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );

  // Broker Loans Screen — full pipeline
  const BrokerLoansScreen = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My Applications</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Manage your loan applications</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn primary iconNode={Ico.plus(16)} onClick={() => setMode("wizard")}>Create Loan</Btn>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.card, borderRadius:9, border:`1px solid ${T.border}` }}>
            {Ico.search(15)}<input placeholder="Search…" style={{ border:"none", background:"transparent", outline:"none", fontSize:13, width:160, fontFamily:T.font }} />
          </div>
        </div>
      </div>
      <Card noPad>
        <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:6, flexWrap:"wrap" }}>
          {["All","DIP","Submitted","KYC","Underwriting","Offer","Completion","Disbursed"].map((f,i) => (
            <span key={f} style={{ padding:"4px 12px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background:i===0?T.navy:T.bg, color:i===0?"#fff":T.textSecondary }}>{f}</span>
          ))}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>
            {["Case ID","Customer(s)","Product","Amount","Term","Rate","Type","Status","Updated"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 12px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {MOCK_LOANS.map((loan,i) => (
              <tr key={i} onClick={() => openLoan(loan)} style={{ cursor:"pointer", borderTop:`1px solid ${T.borderLight}` }}>
                <td style={{ padding:"11px 12px", fontWeight:600, color:T.primary, fontSize:13 }}>{loan.id}</td>
                <td style={{ padding:"11px 12px", fontSize:13 }}>{loan.names}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.product}</td>
                <td style={{ padding:"11px 12px", fontWeight:500 }}>{loan.amount}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.term}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.rate}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.type}</td>
                <td style={{ padding:"11px 12px" }}><StatusBadge status={loan.status} /></td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // Placeholder screen
  const PlaceholderScreen = ({ id, label }) => {
    // Find icon for screen
    let iconName = "dashboard";
    for (const g of navGroups) {
      const found = g.items.find(i => i.id === id);
      if (found) { iconName = found.icon; break; }
    }
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:72, height:72, borderRadius:18, background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:T.primary }}>
            {Ico[iconName]?.(32)}
          </div>
          <h2 style={{ fontSize:20, fontWeight:700, color:T.text, margin:"0 0 6px" }}>{label}</h2>
          <p style={{ fontSize:14, color:T.textMuted, margin:0 }}>Coming in Nova 2.0</p>
          <div style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:8, background:T.bg, border:`1px solid ${T.border}` }}>
            <span style={{ color:T.accent, display:"flex" }}>{Ico.sparkle(14)}</span>
            <span style={{ fontSize:12, color:T.textMuted, fontWeight:500 }}>This screen is under development</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Screen router ──
  const renderScreen = () => {
    switch (screen) {
      case "needsattention":  return <NeedsAttentionScreen />;
      case "allcustomers":    return <AllCustomersScreen />;
      case "brokerdashboard": return <BrokerDashboardV2 onNewLoan={() => setMode("wizard")} onOpenCase={(loan) => { setSelectedLoan(loan); setMode("casedetail"); }} />;
      // Broker aliases
      case "brokermi":        return <MIScreen persona="Broker" />;
      case "myapplications":  return <BrokerLoansScreen />;
      case "brokercustomers": return <AllCustomersScreen />;
      case "brokersettings":  return <SettingsScreen />;
      case "smartapply":      return <SmartPrefill />;
      case "customerhub":     return contextCustomer ? <CustomerHub customerId={contextCustomer.id} onBack={() => { setContextCustomer(null); setScreen("allcustomers"); }} /> : <AllCustomersScreen />;
      case "customerportal":  return <CustomerPortal />;
      // Products
      case "mortgages":       return <MortgagesScreen />;
      case "savings":         return <SavingsScreen />;
      case "savingsdashboard":return <SavingsDashboard />;
      case "currentaccounts": return <CurrentAccountsScreen />;
      case "insurance":       return <InsuranceScreen />;
      case "sharedownership": return <SharedOwnershipScreen />;
      case "disbursements":   return <DisbursementsScreen />;
      // Servicing
      case "servicing":       return <ServicingScreen />;
      case "collections":     return <CollectionsScreen />;
      case "rateswitch":      return <RateSwitchPortal />;
      // Workflows
      case "intake":          return <IntakeQueue />;
      case "approvals":       return <ApprovalsScreen />;
      case "caseworkbench":   return <CaseWorkbench />;
      case "valuations":      return <ValuationScreen />;
      case "property":        return <PropertyScreen />;
      case "eligibility":     return <EligibilityCalculator />;
      case "smartapply":      return <SmartPrefill />;
      // Intelligence
      case "aidashboard":     return <AIDashboard />;
      case "riskanomaly":     return <RiskAnomalies />;
      case "forecaster":      return <PipelineForecaster />;
      case "portfoliorisk":   return <PortfolioRiskScreen />;
      case "brokerscorecard": return <BrokerScorecardScreen />;
      case "aimodels":        return <AIModelScreen />;
      case "mymi":            return <MIScreen persona={persona} />;
      case "messages":        return <MessagesScreen />;
      // Admin
      case "usersroles":      return <UsersRolesScreen />;
      case "permissions":     return <PermissionsScreen />;
      case "team":            return <TeamHierarchyScreen />;
      case "mandates":        return <MandatesScreen />;
      case "sessions":        return <SessionsScreen />;
      case "flags":           return <FeatureFlagsScreen />;
      case "audit":           return <AuditScreen />;
      case "anomalies":       return <AnomalyScreen />;
      case "integrations":    return (
        <div style={{ textAlign:"center", padding:60 }}>
          <Card style={{ maxWidth:500, margin:"0 auto", padding:40 }}>
            <div style={{ marginBottom:16 }}>{Ico.zap(40)}</div>
            <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px" }}>Integrations Moved</h2>
            <p style={{ fontSize:13, color:T.textMuted, marginBottom:20, lineHeight:1.6 }}>
              Integration data is now shown per customer. Open a customer from All Customers and click the Integrations tab to see their Open Banking, Credit Bureau, Land Registry, HMRC, and E-Signature status.
            </p>
            <Btn primary onClick={() => setScreen("allcustomers")}>Go to All Customers</Btn>
          </Card>
        </div>
      );
      case "settings":        return <SettingsScreen />;
      case "workflows":       return <WorkflowBuilder />;
      case "products":        return <ProductCatalogue />;
      case "doctemplates":    return <DocumentTemplates />;
      case "commscentre":     return <CommsCentre />;
      case "apihealth":       return <APIHealthDashboard />;
      case "reportbuilder":   return <ReportBuilder />;
      case "casejourney":     return <CaseJourney />;
      case "commission":      return <CommissionTracker />;
      // BDM
      case "bdmdashboard":   return <BDMDashboard onNewEnquiry={() => setScreen("newenquiry")} onOpenEnquiry={(enq) => { setScreen("enquirydetail"); }} />;
      case "newenquiry":     return <EnquiryForm onBack={() => setScreen("bdmdashboard")} />;
      case "enquirydetail":  return <EnquiryDetail enquiry={null} onBack={() => setScreen("bdmdashboard")} />;
      case "criteriacheck":  return <CriteriaQuickCheck />;
      case "myreports":      return <MyReports persona={persona} />;
      case "newcustomer":     return <NewCustomerWizard onComplete={() => setScreen("allcustomers")} onCancel={() => setScreen("allcustomers")} />;
      case "brokeronboard":   return <BrokerOnboarding />;
      case "segmentation":    return <SegmentationEngine />;
      case "dataexport":      return <DataExportCentre />;
      case "pricing":         return <PricingEngine />;
      case "stresstest":      return <StressTestDashboard />;
      case "boardpack":       return <BoardPackGenerator />;
      case "compliance_cal":  return <ComplianceCalendar />;
      // Compliance
      case "complaints":      return <ComplaintsScreen />;
      case "consumerduty":    return <ConsumerDutyScreen />;
      case "regulatory":      return <RegulatoryReportingScreen />;
      default: {
        // Find label from nav
        let label = screen;
        for (const g of navGroups) {
          const found = g.items.find(i => i.id === screen);
          if (found) { label = found.label; break; }
        }
        return <PlaceholderScreen id={screen} label={label} />;
      }
    }
  };

  // Full-screen modes (wizard / case detail)
  if (mode === "wizard") {
    return <LoanWizard onCancel={() => setMode("shell")} onComplete={() => setMode("shell")} />;
  }
  if (mode === "casedetail" && selectedLoan) {
    return (
      <div style={{ display:"flex", height:"100vh", width:"100vw", fontFamily:T.font, background:T.bg, color:T.text, overflow:"hidden" }}>
        <Sidebar />
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          <TopBar />
          <div style={{ flex:1, padding: isMobile ? "16px 12px" : "24px 30px", overflowY:"auto", background:T.bg }}>
            <ApplicationDetail
              loan={selectedLoan}
              persona={persona}
              onBack={() => { setMode("shell"); setSelectedLoan(null); }}
              onCreateLoan={() => setMode("wizard")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", fontFamily:T.font, background:T.bg, color:T.text, overflow:"hidden" }}>
      <Sidebar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
        <TopBar />
        <ContextBar />
        {/* Main content */}
        <div style={{ flex:1, padding: isMobile ? "16px 12px" : "24px 30px", overflowY:"auto", background:T.bg }}>
          <PresenceIndicator screenId={screen} currentUser={isBroker ? "John Watson" : `${persona} User`} />
          {renderScreen()}
        </div>
      </div>

      {/* Nova AI Copilot FAB */}
      <div onClick={() => setShowCopilot(!showCopilot)}
        style={{ position:"fixed", bottom:28, right:28, width:52, height:52, borderRadius:16,
          background:`linear-gradient(135deg,${T.accent},#27a080)`, display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", boxShadow:"0 4px 24px rgba(49,184,151,0.35)", color:"#fff", zIndex:100,
          transition:"transform 0.2s, box-shadow 0.2s",
          transform: showCopilot ? "scale(0.95)" : "scale(1)" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(49,184,151,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = showCopilot ? "scale(0.95)" : "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(49,184,151,0.35)"; }}>
        {Ico.sparkle(22)}
      </div>

      {/* Copilot panel */}
      {showCopilot && (
        <div style={{ position:"fixed", bottom:92, right:28, width:380, maxHeight:520, borderRadius:16,
          background:T.card, border:`1px solid ${T.border}`, boxShadow:"0 8px 40px rgba(0,0,0,0.12)",
          display:"flex", flexDirection:"column", zIndex:99, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:T.accent, display:"flex" }}>{Ico.sparkle(18)}</span>
              <span style={{ fontWeight:700, fontSize:14, color:T.text }}>Nova AI</span>
              <span style={{ fontSize:10, color:T.textMuted, background:T.bg, padding:"2px 8px", borderRadius:4, fontWeight:600 }}>Copilot</span>
            </div>
            <span onClick={() => setShowCopilot(false)} style={{ cursor:"pointer", color:T.textMuted, display:"flex" }}>{Ico.x(16)}</span>
          </div>
          <div style={{ flex:1, padding:20, overflowY:"auto" }}>
            <div style={{ fontSize:13, color:T.textMuted, lineHeight:1.7 }}>
              {contextCustomer ? (
                <>
                  <div style={{ fontWeight:600, color:T.text, marginBottom:8 }}>Context: {contextCustomer.name}</div>
                  {AI_ACTIONS[contextCustomer.id] ? (
                    AI_ACTIONS[contextCustomer.id].map((a, i) => (
                      <div key={i} style={{ padding:"10px 12px", borderRadius:8, background:PRIORITY_COLORS[a.priority]?.bg || T.bg,
                        border:`1px solid ${PRIORITY_COLORS[a.priority]?.border || T.border}`, marginBottom:8 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:PRIORITY_COLORS[a.priority]?.text, marginBottom:4 }}>{a.priority} - {a.type}</div>
                        <div style={{ fontSize:12, color:PRIORITY_COLORS[a.priority]?.text, lineHeight:1.5 }}>{a.action}</div>
                      </div>
                    ))
                  ) : (
                    <div>No AI actions for this customer.</div>
                  )}
                </>
              ) : (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:T.text, marginBottom:8 }}>How can I help?</div>
                  <div>Select a customer for context-aware suggestions, or ask me anything about your portfolio.</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8 }}>
            <input placeholder="Ask Nova AI..." style={{ flex:1, padding:"8px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:13, fontFamily:T.font, outline:"none", background:T.bg }} />
            <div style={{ width:34, height:34, borderRadius:8, background:`linear-gradient(135deg,${T.accent},#27a080)`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
              {Ico.send(14)}
            </div>
          </div>
        </div>
      )}

      {/* Overlays */}
      <NotificationsPanel open={showNotifications} onClose={() => setShowNotifications(false)} persona={persona} />
      <UniversalSearch open={showCommandPalette} onClose={() => setShowCommandPalette(false)}
        onAction={(a) => { setShowCommandPalette(false); if (a.type==="screen") setScreen(a.id); if (a.type==="customer") { setContextCustomer(a.data); setScreen("customerhub"); } }} />
      <WhatsNew open={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
      {showOnboarding && <OnboardingTour persona={persona} onComplete={() => { setShowOnboarding(false); localStorage.setItem("nova_onboarding_done","1"); }} />}
    </div>
  );
}
