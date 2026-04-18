import { useState, useEffect } from "react";
import { T, Ico, PERSONAS } from "./shared/tokens";
import { Btn, Card } from "./shared/primitives";
import { PRODUCTS, AI_ACTIONS, CUSTOMERS } from "./data/customers";
import { MOCK_LOANS } from "./data/loans";
// Shared overlays
import NotificationsPanel from "./shared/NotificationsPanel";
import MessagesScreen from "./shared/MessagesScreen";
import ErrorBoundary from "./shared/ErrorBoundary";
// Customers
import CustomerHub from "./customers/CustomerHub";
// CustomerPortal replaced by CustomerApp (customer-app/CustomerApp.jsx)
import NeedsAttentionScreen from "./customers/NeedsAttentionScreen";
import AllCustomersScreen from "./customers/AllCustomersScreen";
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
import BrokerLoansScreen from "./origination/BrokerLoansScreen";
import BrokerProspects from "./origination/BrokerProspects";
import BrokerCustomerHub from "./origination/BrokerCustomerHub";
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
import { MOCK_SVC_ACCOUNTS } from "./data/servicing";
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
import SettingsScreen from "./admin/SettingsScreen";
import WorkflowBuilder from "./admin/WorkflowBuilder";
import ProductCatalogue from "./admin/ProductCatalogue";
import RateMatrix from "./admin/RateMatrix";
import ProductPerformance from "./admin/ProductPerformance";
import PricingMatrix from "./admin/PricingMatrix";
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
import HelpCentre from "./shared/HelpCentre";
import ReleaseCentre from "./shared/ReleaseCentre";
import AISummary from "./shared/AISummary";
import RecentActivity from "./shared/RecentActivity";
import AITips from "./shared/AITips";
import VulnerabilityBanner from "./shared/VulnerabilityBanner";
import StatusBar from "./shared/StatusBar";
import SkeletonLoader from "./shared/SkeletonLoader";
// Customer Journey
import JourneyAnalytics from "./intelligence/JourneyAnalytics";
// BDM
import BDMDashboard from "./bdm/BDMDashboard";
import BDMPipeline from "./bdm/BDMPipeline";
import EnquiryForm from "./bdm/EnquiryForm";
import EnquiryDetail from "./bdm/EnquiryDetail";
import CriteriaQuickCheck from "./bdm/CriteriaQuickCheck";
// Underwriting Engine
import SmartQueue from "./underwriting/SmartQueue";
import UWWorkstation from "./underwriting/UWWorkstation";
// ComparisonEngine, PolicyChecker now embedded as tabs inside UWWorkstation
import UWPerformance from "./underwriting/UWPerformance";
// IncomeAnalysis now embedded as a tab inside UWWorkstation
// Customer Portal screens removed — customer app is a separate standalone app
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
// Game-changer enhancements (v2.14)
// DecisionEngine + DocumentIntelligence are now embedded inside UWWorkstation as tabs
// LifecyclePredictor used in CustomerHub only — removed from UW Workstation (not relevant pre-completion)
import CommandCentre from "./operations/CommandCentre";

import ScenarioModeller from "./intelligence/ScenarioModeller";
import ComplianceEngine from "./shared/ComplianceEngine";
import ThemeEditor from "./admin/ThemeEditor";
import ApiObservatory from "./admin/ApiObservatory";
import MyInbox from "./shared/MyInbox";
// Customer App (v2.20)
import CustomerApp from "./customer-app/CustomerApp";
// Agentic AI features (v2.19)
import CaseOrchestrationAgent from "./shared/CaseOrchestrationAgent";
import RetentionAgent from "./shared/RetentionAgent";
import CollectionsAgent from "./shared/CollectionsAgent";
import SmartDocumentExtraction from "./shared/SmartDocumentExtraction";
// Re-exports from extracted screens (for copilot panel)
import { getNeedsAttention, PRIORITY_COLORS } from "./customers/NeedsAttentionScreen";

// ─────────────────────────────────────────────
// NOVA 2.0 — MAIN SHELL
// Customer-first mortgage/savings/insurance platform
// ─────────────────────────────────────────────

const getCustomerProducts = (cust) => PRODUCTS.filter(p => cust.products.includes(p.id));

// Inline "Live" indicator for KPI labels and similar
export const LiveBadge = ({ updated }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, color:T.textMuted, marginLeft:6 }}>
    <span style={{ width:6, height:6, borderRadius:3, background:T.success, animation:"pulse 2s infinite" }} />
    Live · {updated}
  </span>
);

export default function Shell({ userType }) {
  const [persona, setPersona] = useState(userType === "external" ? "Broker" : "Ops");
  const [screen, setScreen] = useState(() => {
    const initialPersona = userType === "external" ? "Broker" : "Ops";
    const saved = localStorage.getItem(`nova_last_screen_${initialPersona}`);
    if (saved) return saved;
    return userType === "external" ? "brokerdashboard" : "needsattention";
  });
  const [personaOpen, setPersonaOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [contextCustomer, setContextCustomer] = useState(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mode, setMode] = useState("shell"); // "shell" | "wizard" | "casedetail"
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [servicingAccountId, setServicingAccountId] = useState(null);
  const [showServicingModal, setShowServicingModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseLoanForModal, setCaseLoanForModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(() => {
    const seen = localStorage.getItem("nova_whats_new_seen");
    return seen !== "2.18.0";
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [screenHistory, setScreenHistory] = useState([]);

  // Responsive: detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Persist last screen per persona
  useEffect(() => {
    if (screen) localStorage.setItem(`nova_last_screen_${persona}`, screen);
  }, [screen, persona]);

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

  // Shared handler for selecting a customer
  const handleSelectCustomer = (c) => { setContextCustomer(c); setScreen("customerhub"); };

  // ── Nav groups — simplified per-persona ──
  const navGroups = isBroker
    ? [
        { group:"HOME", items:[
          { id:"brokerdashboard", label:"Dashboard & Pipeline", icon:"dashboard" },
          { id:"smartapply",      label:"Smart Apply",          icon:"sparkle" },
          { id:"eligibility",     label:"Eligibility Check",    icon:"zap" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"brokerprospects", label:"My Customers",  icon:"customers" },
        ]},
        { group:"INSIGHTS", items:[
          { id:"mymi",            label:"My MI",        icon:"chart" },
          { id:"myreports",      label:"My Reports",   icon:"file" },
          { id:"commission",      label:"Commission",   icon:"dollar" },
          { id:"messages",        label:"Messages",     icon:"messages", badge:3 },
          { id:"myinbox",         label:"My Inbox",     icon:"bell", badge:8 },
        ]},
        { group:null, items:[
          { id:"releases", label:"Releases", icon:"sparkle" },
          { id:"settings", label:"Settings", icon:"settings" },
        ]},
      ]
    : persona === "BDM"
    ? [
        { group:"MY WORK", items:[
          { id:"bdmdashboard",    label:"Dashboard",         icon:"dashboard" },
          { id:"bdmpipeline",     label:"Pipeline",          icon:"chart" },
          { id:"criteriacheck",   label:"Criteria Check",    icon:"zap" },
        ]},
        { group:"BROKERS", items:[
          { id:"brokerscorecard", label:"My Brokers",        icon:"customers" },
          { id:"allcustomers",    label:"Customers",         icon:"users" },
          { id:"messages",        label:"Messages",          icon:"messages", badge:2 },
        ]},
        { group:"INSIGHTS", items:[
          { id:"mymi",            label:"My MI",             icon:"chart" },
          { id:"myreports",      label:"My Reports",        icon:"file" },
          { id:"myinbox",         label:"My Inbox",          icon:"bell", badge:8 },
        ]},
        { group:null, items:[
          { id:"releases",        label:"Releases",          icon:"sparkle" },
          { id:"settings",        label:"Settings",          icon:"settings" },
        ]},
      ]
    : persona === "Underwriter"
    ? [
        // Underwriter: AI-powered credit decision engine
        { group:"UNDERWRITING", items:[
          { id:"uwqueue",           label:"Smart Queue",           icon:"shield", badge:5 },
          { id:"approvals",         label:"Approvals",             icon:"check" },
        ]},
        { group:"CUSTOMERS", items:[
          { id:"needsattention",  label:"Needs Attention",    icon:"alert", badge:needsAttentionCount },
          { id:"allcustomers",    label:"All Customers",      icon:"customers" },
        ]},
        { group:"INTELLIGENCE", items:[
          { id:"uwperformance",   label:"My Performance",     icon:"chart" },
          { id:"smartdocs",       label:"Smart Doc Extraction",icon:"sparkle" },
          { id:"mymi",            label:"My MI",              icon:"chart" },
          { id:"myreports",       label:"My Reports",         icon:"file" },
          { id:"aidashboard",     label:"AI Dashboard",       icon:"sparkle" },
          { id:"messages",        label:"Messages",           icon:"messages", badge:5 },
          { id:"myinbox",         label:"My Inbox",           icon:"bell", badge:8 },
        ]},
        { group:"SERVICING", items:[
          { id:"servicing",       label:"Mortgage Servicing",  icon:"wallet" },
        ]},
        { group:null, items:[
          { id:"releases",        label:"Releases",           icon:"sparkle" },
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : persona === "Finance"
    ? [
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
          { id:"savingsdashboard", label:"Savings Operations",  icon:"dollar" },
          { id:"servicing",       label:"Mortgage Servicing",  icon:"wallet" },
        ]},
        { group:"RISK & ANALYTICS", items:[
          { id:"portfoliorisk",    label:"Portfolio Risk",      icon:"shield" },
          { id:"stresstest",       label:"Stress Testing",      icon:"alert" },
          { id:"scenariomodeller", label:"Scenario Modeller",   icon:"chart" },
          { id:"pricing",          label:"Pricing Engine",      icon:"dollar" },
          { id:"mymi",             label:"My MI",               icon:"chart" },
          { id:"myreports",       label:"My Reports",          icon:"file" },
        ]},
        { group:"TOOLS", items:[
          { id:"boardpack",        label:"Board Pack",          icon:"file" },
          { id:"compliance_cal",   label:"Compliance Calendar", icon:"clock" },
          { id:"complianceengine", label:"Compliance Engine",   icon:"shield" },
          { id:"messages",         label:"Messages",            icon:"messages", badge:5 },
          { id:"myinbox",          label:"My Inbox",            icon:"bell", badge:8 },
        ]},
        { group:null, items:[
          { id:"releases",        label:"Releases",           icon:"sparkle" },
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : persona === "Risk Analyst"
    ? [
        { group:"COMPLIANCE HUB", items:[
          { id:"consumerduty",    label:"Consumer Duty",       icon:"shield" },
          { id:"regulatory",      label:"Regulatory",          icon:"file" },
          { id:"compliance_cal",  label:"Compliance Calendar", icon:"clock" },
        ]},
        { group:"RISK ANALYSIS", items:[
          { id:"portfoliorisk",    label:"Portfolio Risk",      icon:"shield" },
          { id:"stresstest",       label:"Stress Testing",      icon:"alert" },
          { id:"scenariomodeller", label:"Scenario Modeller",   icon:"chart" },
          { id:"riskanomaly",      label:"Risk & Anomalies",    icon:"alert" },
          { id:"aimodels",         label:"AI Models",           icon:"sparkle" },
          { id:"complianceengine", label:"Compliance Engine",   icon:"shield" },
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
          { id:"myinbox",         label:"My Inbox",           icon:"bell", badge:8 },
          { id:"releases",        label:"Releases",           icon:"sparkle" },
          { id:"settings",        label:"Settings",           icon:"settings" },
        ]},
      ]
    : persona === "Product Manager"
    ? [
        { group:"PRODUCTS", items:[
          { id:"products",          label:"Product Catalogue",   icon:"products" },
          { id:"pricingmatrix",     label:"Pricing Config",      icon:"dashboard" },
          { id:"ratematrix",        label:"Rate Matrix",         icon:"chart" },
          { id:"productperformance",label:"Product Performance", icon:"dashboard" },
        ]},
        { group:"MARKET", items:[
          { id:"pricing",           label:"Market Comparison",   icon:"dollar" },
          { id:"mymi",              label:"MI & Analytics",      icon:"chart" },
          { id:"myreports",         label:"Reports",             icon:"file" },
        ]},
        { group:null, items:[
          { id:"messages",          label:"Messages",            icon:"messages" },
          { id:"releases",          label:"Releases",            icon:"sparkle" },
          { id:"settings",          label:"Settings",            icon:"settings" },
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
          { id:"collections",    label:"Collections",          icon:"alert" },
          { id:"rateswitch",     label:"Rate Switches",        icon:"arrow" },
          ...(persona === "Ops" ? [
            { id:"complaints",    label:"Complaints",           icon:"alert" },
          ] : []),
        ]},
        { group:"INTELLIGENCE", items:[
          { id:"aidashboard",     label:"AI Dashboard",         icon:"sparkle" },
          { id:"mymi",            label:"My MI",                icon:"chart" },
          { id:"myreports",      label:"My Reports",           icon:"file" },
          ...(persona === "Admin" ? [
            { id:"journeyanalytics",label:"Journey Analytics",  icon:"eye" },
            { id:"forecaster",    label:"Pipeline Forecaster",  icon:"chart" },
          ] : []),
          { id:"messages",        label:"Messages",             icon:"messages", badge:5 },
          { id:"myinbox",         label:"My Inbox",             icon:"bell", badge:8 },
        ]},
        ...((persona === "Ops" || persona === "Admin") ? [{
          group:"OPS TOOLKIT", items:[
            { id:"commandcentre",  label:"Command Centre",      icon:"dashboard" },
            { id:"orchestrationagent", label:"AI Case Agent",   icon:"sparkle" },
            { id:"retentionagent", label:"Retention Agent",      icon:"chart" },
            { id:"collectionsagent", label:"Collections Agent",  icon:"alert" },
            { id:"commscentre",    label:"Comms Centre",        icon:"send" },
            { id:"doctemplates",   label:"Doc Templates",       icon:"file" },
            { id:"casejourney",    label:"Case Journey",        icon:"clock" },
            { id:"complianceengine",label:"Compliance Engine",  icon:"shield" },
            { id:"brokeronboard", label:"Broker Onboarding",    icon:"assign" },
            { id:"segmentation",  label:"Segmentation",          icon:"customers" },
          ],
        }] : []),
        ...(persona === "Admin" ? [{
          group:"PEOPLE", collapsed:true, items:[
            { id:"usersroles",    label:"Users & Roles",        icon:"users" },
            { id:"permissions",   label:"Permissions",           icon:"shield" },
            { id:"team",          label:"Team Hierarchy",        icon:"assign" },
          ],
        },
        {
          group:"PLATFORM", collapsed:true, items:[
            { id:"workflows",      label:"Workflow Builder",      icon:"zap" },
            { id:"products",       label:"Product Catalogue",     icon:"products" },
            { id:"themeeditor",    label:"Theme Editor",          icon:"settings" },
            { id:"flags",          label:"Feature Flags",         icon:"zap" },
            { id:"mandates",       label:"Mandates",              icon:"shield" },
            { id:"reportbuilder",  label:"Report Builder",        icon:"chart" },
            { id:"apihealth",      label:"API Health",            icon:"zap" },
            { id:"apiobservatory", label:"API Observatory",       icon:"eye" },
            { id:"dataexport",     label:"Data Export",            icon:"download" },
            { id:"audit",          label:"Audit & Sessions",      icon:"clock" },
            { id:"anomalies",      label:"AI Anomalies",          icon:"alert" },
          ],
        },
        {
          group:"FINANCE & RISK", collapsed:true, items:[
            { id:"portfoliorisk",    label:"Portfolio Risk",        icon:"shield" },
            { id:"stresstest",       label:"Stress Testing",        icon:"alert" },
            { id:"scenariomodeller", label:"Scenario Modeller",     icon:"chart" },
            { id:"pricing",          label:"Pricing Engine",        icon:"dollar" },
            { id:"boardpack",        label:"Board Pack",            icon:"file" },
            { id:"compliance_cal",   label:"Compliance Calendar",   icon:"clock" },
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
                const lastScreen = localStorage.getItem(`nova_last_screen_${p}`);
                setScreen(lastScreen || (p === "Broker" ? "brokerdashboard" : p === "BDM" ? "bdmdashboard" : p === "Underwriter" ? "uwqueue" : p === "Finance" ? "disbursements" : p === "Risk Analyst" ? "consumerduty" : p === "Product Manager" ? "products" : "needsattention"));
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
              <div key={item.id} onClick={() => { setMode("shell"); setSelectedLoan(null); setScreen(item.id); setScreenHistory(h => [{ id:item.id, label:item.label, time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }, ...h.filter(x=>x.id!==item.id)].slice(0,5)); if (isMobile) setSidebarOpen(false); }}
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
          {isMobile && (
            <div onClick={() => setSidebarOpen(true)} style={{ cursor:"pointer", color:T.text, display:"flex", padding:4 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:T.textMuted, overflow:"hidden" }}>
            {(isMobile ? crumbs.slice(-1) : crumbs).map((c, i) => (
              <span key={i} style={{ display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
                {i > 0 && <span style={{ color:T.border }}>/</span>}
                <span style={{ color: i === (isMobile ? 0 : crumbs.length - 1) ? T.text : T.textMuted, fontWeight:600 }}>{c}</span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 10 : 14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding: isMobile ? "6px" : "6px 14px", borderRadius:8, border:`1px solid ${T.border}`, cursor:"pointer", background:"#F8FAFC" }}
            onClick={() => setShowCommandPalette(true)}>
            <span style={{ color:T.textMuted, display:"flex" }}>{Ico.search(14)}</span>
            {!isMobile && <span style={{ fontSize:12, color:T.textMuted }}>Search...</span>}
            {!isMobile && <span style={{ fontSize:10, color:T.textMuted, background:T.bg, padding:"1px 6px", borderRadius:4, fontWeight:600, marginLeft:8, fontFamily:"monospace" }}>⌘K</span>}
          </div>
          <div onClick={() => setShowWhatsNew(true)} style={{ cursor:"pointer", color:T.textMuted, display:"flex", padding:4 }} title="What's New">
            {Ico.sparkle(16)}
          </div>
          <div onClick={() => setShowHelp(true)} style={{ cursor:"pointer", color:T.textMuted, display:"flex", padding:4 }} title="Help">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          </div>
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

  // ── Placeholder screen ──
  const PlaceholderScreen = ({ id, label }) => {
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
      case "needsattention":  return <NeedsAttentionScreen onSelectCustomer={handleSelectCustomer} />;
      case "allcustomers":    return <AllCustomersScreen onSelectCustomer={handleSelectCustomer} />;
      case "brokerprospects": return <BrokerProspects onSelectProspect={(p) => { setSelectedProspect(p); setScreen("brokerhub"); }} />;
      case "brokerhub":       return <BrokerCustomerHub prospect={selectedProspect} onBack={() => setScreen("brokerprospects")} />;
      case "brokerdashboard": return <BrokerDashboardV2 onNewLoan={() => setMode("wizard")} onOpenCase={(loan) => { setSelectedLoan(loan); setMode("casedetail"); }} />;
      case "myapplications":  return <BrokerLoansScreen onOpenCase={(loan) => { setSelectedLoan(loan); setMode("casedetail"); }} onNewLoan={() => setMode("wizard")} />;
      case "smartapply":      return <SmartPrefill />;
      case "customerhub":     return contextCustomer ? <CustomerHub customerId={contextCustomer.id}
            onBack={() => { setContextCustomer(null); setScreen("allcustomers"); }}
            onOpenCase={(origRef) => {
              const loan = MOCK_LOANS.find(l => l.id === origRef || l.origRef === origRef);
              if (loan) { setCaseLoanForModal(loan); setShowCaseModal(true); }
            }}
            onOpenServicing={(productId) => {
              const cust = contextCustomer;
              const svcAcc = MOCK_SVC_ACCOUNTS.find(a =>
                a.customerId === cust.id || (productId && a.origRef === productId)
              );
              setServicingAccountId(svcAcc?.id || null);
              setShowServicingModal(true);
            }}
          /> : <AllCustomersScreen onSelectCustomer={handleSelectCustomer} />;
      case "customerportal":  return <CustomerApp />;
      // Products
      case "mortgages":       return <MortgagesScreen
            onViewCustomer={(cust) => { setContextCustomer(cust); setScreen("customerhub"); }}
            onViewCase={(origRef) => {
              const loan = MOCK_LOANS.find(l => l.id === origRef || l.origRef === origRef);
              if (loan) { setCaseLoanForModal(loan); setShowCaseModal(true); }
            }}
            onViewServicing={(origRef) => {
              const svcAcc = MOCK_SVC_ACCOUNTS.find(a => a.origRef === origRef);
              setServicingAccountId(svcAcc?.id || null);
              setShowServicingModal(true);
            }} />;
      case "savings":         return <SavingsScreen onViewCustomer={(cust) => { setContextCustomer(cust); setScreen("customerhub"); }} />;
      case "savingsdashboard":return <SavingsDashboard />;
      case "currentaccounts": return <CurrentAccountsScreen />;
      case "insurance":       return <InsuranceScreen />;
      case "sharedownership": return <SharedOwnershipScreen />;
      case "disbursements":   return <DisbursementsScreen />;
      // Servicing
      case "servicing":       return <ServicingScreen initialAccountId={servicingAccountId}
            onViewApplication={(originRef) => {
              const loan = MOCK_LOANS.find(l => l.origRef === originRef || l.id === originRef);
              if (loan) { setSelectedLoan(loan); setScreen("uwworkstation"); }
            }}
            onViewCustomer={(name) => {
              const cust = CUSTOMERS.find(c => c.id === name) || CUSTOMERS.find(c => c.name === name);
              if (cust) { setContextCustomer(cust); setScreen("customerhub"); }
            }} />;
      case "collections":     return <CollectionsScreen />;
      case "rateswitch":      return <RateSwitchPortal />;
      // Workflows
      case "intake":          return <IntakeQueue />;
      case "approvals":       return <ApprovalsScreen />;
      case "caseworkbench":   return <CaseWorkbench />;
      case "valuations":      return <ValuationScreen />;
      case "property":        return <PropertyScreen />;
      case "eligibility":     return <EligibilityCalculator />;
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
      case "releases":        return <ReleaseCentre persona={persona} />;
      case "journeyanalytics": return <JourneyAnalytics />;
      case "workflows":       return <WorkflowBuilder />;
      case "products":        return <ProductCatalogue />;
      case "pricingmatrix":   return <PricingMatrix />;
      case "ratematrix":      return <RateMatrix />;
      case "productperformance": return <ProductPerformance />;
      case "doctemplates":    return <DocumentTemplates />;
      case "commscentre":     return <CommsCentre />;
      case "apihealth":       return <APIHealthDashboard />;
      case "reportbuilder":   return <ReportBuilder />;
      case "casejourney":     return <CaseJourney />;
      // AI Agents
      case "orchestrationagent": return <CaseOrchestrationAgent />;
      case "retentionagent":     return <RetentionAgent />;
      case "collectionsagent":   return <CollectionsAgent />;
      case "smartdocs":          return <SmartDocumentExtraction />;
      case "commission":      return <CommissionTracker />;
      // BDM
      case "bdmdashboard":   return <BDMDashboard onNewEnquiry={() => setShowEnquiryModal(true)} onOpenEnquiry={(enq) => { setScreen("enquirydetail"); }} />;
      case "bdmpipeline":    return <BDMPipeline />;
      case "enquirydetail":  return <EnquiryDetail enquiry={null} onBack={() => setScreen("bdmdashboard")} />;
      case "criteriacheck":  return <CriteriaQuickCheck />;
      // Underwriting Engine
      case "uwqueue":        return <SmartQueue onOpenCase={(loan) => { setSelectedLoan(loan); setScreen("uwworkstation"); }} />;
      case "uwworkstation":  return <UWWorkstation loan={selectedLoan || MOCK_LOANS[0]} onBack={() => setScreen("uwqueue")} onDecisionMade={() => setScreen("uwqueue")}
            onViewCustomer={(nameOrId) => {
              const cust = CUSTOMERS.find(c => c.id === nameOrId) || CUSTOMERS.find(c => c.name === nameOrId);
              if (cust) { setContextCustomer(cust); setScreen("customerhub"); }
            }} />;
      // comparison + policychecker are now tabs inside UWWorkstation
      case "uwperformance":  return <UWPerformance />;
      // incomeanalysis is now a tab inside UWWorkstation
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
      // Customer Portal removed — separate standalone app
      // Game-changer enhancements (v2.14)
      // DecisionEngine + DocumentIntelligence are now tabs inside UWWorkstation
      // lifecyclepredictor is now a tab inside UWWorkstation
      case "commandcentre":     return <CommandCentre />;

      case "scenariomodeller":  return <ScenarioModeller />;
      case "complianceengine":  return <ComplianceEngine />;
      case "themeeditor":       return <ThemeEditor />;
      case "apiobservatory":    return <ApiObservatory />;
      case "myinbox":           return <MyInbox />;
      default: {
        let label = screen;
        for (const g of navGroups) {
          const found = g.items.find(i => i.id === screen);
          if (found) { label = found.label; break; }
        }
        return <PlaceholderScreen id={screen} label={label} />;
      }
    }
  };

  // Full-screen mode for case detail only (wizard is now a modal — see below)
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

  const errorResetScreen = isBroker ? "brokerdashboard" : persona === "BDM" ? "bdmdashboard" : "needsattention";

  return (
    <div style={{ display:"flex", height:"100vh", width:"100vw", fontFamily:T.font, background:T.bg, color:T.text, overflow:"hidden" }}>
      <style>{`
        @keyframes celebrate { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
      <Sidebar />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
        <TopBar />
        <ContextBar />
        {/* Main content */}
        <div style={{ flex:1, padding: isMobile ? "16px 12px" : "24px 30px", overflowY:"auto", background:T.bg }}>
          <RecentActivity history={screenHistory} onNavigate={(id) => setScreen(id)} />
          {contextCustomer && <VulnerabilityBanner customer={contextCustomer} />}
          <AISummary screenId={screen} persona={persona} />
          <AITips screenId={screen} persona={persona} />
          <PresenceIndicator screenId={screen} currentUser={isBroker ? "John Watson" : `${persona} User`} />
          <ErrorBoundary onReset={() => setScreen(errorResetScreen)}>
            {renderScreen()}
          </ErrorBoundary>
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
      <WhatsNew open={showWhatsNew} onClose={() => { setShowWhatsNew(false); localStorage.setItem("nova_whats_new_seen", "2.18.0"); }} />
      <HelpCentre open={showHelp} onClose={() => setShowHelp(false)} screenId={screen} persona={persona} />
      <StatusBar persona={persona} />

      {/* ─── Loan Wizard Modal ─── */}
      {mode === "wizard" && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={() => setMode("shell")} style={{ position:"absolute", inset:0, background:"rgba(12,45,59,0.55)", backdropFilter:"blur(6px)" }} />
          <div style={{ position:"relative", background:T.card, borderRadius:18, width:"94vw", maxWidth:1200, height:"92vh", maxHeight:900,
            boxShadow:"0 20px 80px rgba(0,0,0,0.3)", border:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* Modal header */}
            <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color:"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ico.plus(20)}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>Create New Loan</div>
                  <div style={{ fontSize:12, opacity:0.8 }}>Application wizard — your work is auto-saved</div>
                </div>
              </div>
              <div onClick={() => setMode("shell")} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                {Ico.x(18)}
              </div>
            </div>
            {/* Wizard content */}
            <div style={{ flex:1, overflow:"auto", background:T.bg }}>
              <LoanWizard onCancel={() => setMode("shell")} onComplete={() => setMode("shell")} />
            </div>
          </div>
        </div>
      )}
      {showOnboarding && <OnboardingTour persona={persona} onComplete={() => { setShowOnboarding(false); localStorage.setItem("nova_onboarding_done","1"); }} />}

      {/* ─── Case / UW Workstation Modal (opens over CustomerHub) ─── */}
      {showCaseModal && caseLoanForModal && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={() => setShowCaseModal(false)} style={{ position:"absolute", inset:0, background:"rgba(12,45,59,0.55)", backdropFilter:"blur(6px)" }} />
          <div style={{ position:"relative", background:T.card, borderRadius:18, width:"96vw", maxWidth:1440, height:"94vh", maxHeight:960,
            boxShadow:"0 20px 80px rgba(0,0,0,0.3)", border:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"14px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color:"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ico.shield(20)}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>{caseLoanForModal.id} — {caseLoanForModal.names}</div>
                  <div style={{ fontSize:12, opacity:0.8 }}>{caseLoanForModal.amount} · {caseLoanForModal.product}</div>
                </div>
              </div>
              <div onClick={() => setShowCaseModal(false)} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                {Ico.x(18)}
              </div>
            </div>
            <div style={{ flex:1, overflow:"auto", background:T.bg, padding:"0 16px" }}>
              <UWWorkstation loan={caseLoanForModal} onBack={() => setShowCaseModal(false)} onDecisionMade={() => setShowCaseModal(false)}
                onViewCustomer={(name) => {
                  setShowCaseModal(false);
                  const cust = CUSTOMERS.find(c => c.id === name) || CUSTOMERS.find(c => c.name === name);
                  if (cust) { setContextCustomer(cust); setScreen("customerhub"); }
                }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Servicing Modal (opens over CustomerHub) ─── */}
      {showServicingModal && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={() => setShowServicingModal(false)} style={{ position:"absolute", inset:0, background:"rgba(12,45,59,0.55)", backdropFilter:"blur(6px)" }} />
          <div style={{ position:"relative", background:T.card, borderRadius:18, width:"96vw", maxWidth:1400, height:"94vh", maxHeight:960,
            boxShadow:"0 20px 80px rgba(0,0,0,0.3)", border:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"14px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color:"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ico.wallet(20)}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>Mortgage Servicing</div>
                  <div style={{ fontSize:12, opacity:0.8 }}>Account detail — payments, rate switches, actions</div>
                </div>
              </div>
              <div onClick={() => setShowServicingModal(false)} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                {Ico.x(18)}
              </div>
            </div>
            <div style={{ flex:1, overflow:"auto", background:T.bg }}>
              <ServicingScreen initialAccountId={servicingAccountId}
                onViewApplication={(originRef) => {
                  setShowServicingModal(false);
                  const loan = MOCK_LOANS.find(l => l.origRef === originRef || l.id === originRef);
                  if (loan) { setCaseLoanForModal(loan); setShowCaseModal(true); }
                }}
                onViewCustomer={(name) => {
                  setShowServicingModal(false);
                  const cust = CUSTOMERS.find(c => c.id === name) || CUSTOMERS.find(c => c.name === name);
                  if (cust) { setContextCustomer(cust); setScreen("customerhub"); }
                }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── BDM Enquiry Modal ─── */}
      {showEnquiryModal && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={() => setShowEnquiryModal(false)} style={{ position:"absolute", inset:0, background:"rgba(12,45,59,0.55)", backdropFilter:"blur(6px)" }} />
          <div style={{ position:"relative", background:T.card, borderRadius:18, width:"94vw", maxWidth:1100, height:"92vh", maxHeight:900,
            boxShadow:"0 20px 80px rgba(0,0,0,0.3)", border:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"16px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color:"#fff" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {Ico.plus(20)}
                </div>
                <div>
                  <div style={{ fontSize:16, fontWeight:700 }}>New Enquiry</div>
                  <div style={{ fontSize:12, opacity:0.8 }}>AI criteria check + squad allocation</div>
                </div>
              </div>
              <div onClick={() => setShowEnquiryModal(false)} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff" }}>
                {Ico.x(18)}
              </div>
            </div>
            <div style={{ flex:1, overflow:"auto", background:T.bg }}>
              <EnquiryForm onBack={() => setShowEnquiryModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
