// ─────────────────────────────────────────────
// PERSONA FILTER — Content filtering by persona and screen
// ─────────────────────────────────────────────

export const PERSONA_CONTENT = {
  releases: {
    Broker: [
      { version: "2.6.0", items: ["Smart Apply improvements — faster eligibility check", "Commission tracker now shows Gold tier progress", "Help Centre with product guides and FAQ"] },
      { version: "2.5.0", items: ["Your assigned team (squad) now visible on every case card", "Pipeline progress steppers show exactly where each case is"] },
      { version: "2.4.0", items: ["New Eligibility Check — instant product matching before you apply", "Smart Apply — submit applications in 5 minutes with AI assistance"] },
      { version: "2.2.0", items: ["Mobile-friendly layout — use Nova on your phone or tablet"] },
      { version: "2.0.0", items: ["Nova 2.0 launched — new dashboard with pipeline overview"] },
    ],
    BDM: [
      { version: "2.6.0", items: ["Help Centre with BDM-specific guides", "Release notes filtered to your role"] },
      { version: "2.5.0", items: ["Squad allocation — every enquiry gets a named Adviser, Underwriter, and Customer Care member"] },
      { version: "2.4.0", items: ["New: BDM Dashboard with enquiry pipeline and broker portfolio", "Criteria Quick Check for instant broker answers", "Enquiry form with AI criteria assessment and squad allocation"] },
    ],
    Underwriter: [
      { version: "2.6.0", items: ["Consumer Duty outcome recording embedded in decision workflow", "Fair Value assessment on every case", "Help Centre with UW-specific guides"] },
      { version: "2.5.0", items: ["Income Analysis — complex income visualisation for self-employed and joint applications", "Policy Checker and Case Comparison now work across all cases with dropdown selector", "Squad panel shows your team on every case"] },
      { version: "2.4.0", items: ["AI-powered Underwriter Engine: Smart Queue, Workstation, Comparison Engine, Policy Checker, Performance Dashboard", "Fast-track approval for low-risk cases — one click from the queue"] },
    ],
    Ops: [
      { version: "2.6.0", items: ["Customer journey tracking with Consumer Duty scores per stage", "Vulnerability banner with enhanced support protocols", "Help Centre with Ops-specific guides"] },
      { version: "2.5.0", items: ["Squad panel visible in Servicing — see who originated each account", "Collections and Rate Switches restored to your sidebar"] },
      { version: "2.4.0", items: ["Servicing redesigned — search-first navigation, AI-driven action modals", "Intake Queue with AI pre-processing — 67% of checks done before you see the case"] },
    ],
    Finance: [
      { version: "2.6.0", items: ["Fair Value assessment embedded in product selection", "Journey Analytics dashboard for board reporting", "Help Centre with Finance-specific guides"] },
      { version: "2.5.0", items: ["Savings Operations added to your sidebar"] },
      { version: "2.4.0", items: ["Stress Testing dashboard with 6 adverse scenarios", "Pricing Engine with rate modelling and market comparison", "Board Pack Generator — one-click 24-page report"] },
    ],
    Admin: [
      { version: "2.6.0", items: ["Consumer Duty outcome tracking across all stages", "Journey Analytics dashboard", "Help Centre, Release Centre, AI Tips for all users", "Toast notifications for all actions"] },
      { version: "2.5.0", items: ["Squad allocation system — Adviser + Underwriter + Customer Care per case", "Platform cleanup — error boundary, route consolidation, Shell.jsx reduced 32%"] },
      { version: "2.4.0", items: ["11 platform enhancements: Workflow Builder, Product Catalogue, Document Templates, Comms Centre, API Health, Report Builder, Case Journey, Compliance Calendar, Segmentation Engine, Data Export, Broker Onboarding"] },
    ],
    "Risk Analyst": [
      { version: "2.6.0", items: ["Consumer Duty journey analytics with heatmap across stages and outcomes", "Vulnerability-aware UI across entire platform", "Fair Value assessment engine"] },
      { version: "2.5.0", items: ["Stress Testing and Portfolio Risk dashboards in your sidebar"] },
      { version: "2.4.0", items: ["Consumer Duty, Regulatory Reporting, Compliance Calendar in your nav"] },
    ],
  },

  helpScreens: {
    Broker: ["brokerdashboard", "smartapply", "eligibility", "allcustomers", "mymi", "myreports", "commission", "messages", "settings", "releases"],
    BDM: ["bdmdashboard", "newenquiry", "criteriacheck", "brokerscorecard", "allcustomers", "messages", "mymi", "myreports", "settings", "releases"],
    Underwriter: ["uwqueue", "uwworkstation", "approvals", "comparison", "policychecker", "incomeanalysis", "uwperformance", "needsattention", "allcustomers", "mymi", "myreports", "aidashboard", "servicing", "messages", "settings", "releases"],
    Ops: ["needsattention", "allcustomers", "intake", "approvals", "valuations", "servicing", "collections", "rateswitch", "complaints", "commscentre", "doctemplates", "casejourney", "mymi", "myreports", "messages", "settings", "releases"],
    Finance: ["disbursements", "approvals", "needsattention", "allcustomers", "mortgages", "savings", "savingsdashboard", "servicing", "portfoliorisk", "stresstest", "pricing", "mymi", "myreports", "brokerscorecard", "boardpack", "compliance_cal", "messages", "settings", "releases"],
    Admin: ["needsattention", "allcustomers", "intake", "approvals", "mortgages", "savings", "servicing", "aidashboard", "mymi", "myreports", "usersroles", "permissions", "team", "mandates", "sessions", "flags", "audit", "anomalies", "workflows", "products", "reportbuilder", "apihealth", "brokeronboard", "segmentation", "dataexport", "portfoliorisk", "stresstest", "pricing", "boardpack", "compliance_cal", "commscentre", "doctemplates", "casejourney", "messages", "settings", "releases"],
    "Risk Analyst": ["consumerduty", "regulatory", "compliance_cal", "portfoliorisk", "stresstest", "riskanomaly", "aimodels", "needsattention", "allcustomers", "servicing", "mymi", "myreports", "messages", "settings", "releases"],
  },

  aiTips: {
    Broker: ["brokerdashboard", "smartapply", "eligibility", "commission", "myreports"],
    BDM: ["bdmdashboard", "criteriacheck", "newenquiry"],
    Underwriter: ["uwqueue", "uwworkstation", "comparison", "policychecker", "incomeanalysis"],
    Ops: ["needsattention", "intake", "servicing", "collections", "commscentre"],
    Finance: ["disbursements", "stresstest", "pricing", "boardpack"],
    Admin: ["needsattention", "workflows", "products", "reportbuilder", "apihealth"],
    "Risk Analyst": ["consumerduty", "riskanomaly", "stresstest", "portfoliorisk"],
  },

  aiSummaries: {
    Broker: ["brokerdashboard", "smartapply", "eligibility", "allcustomers", "mymi", "commission", "myreports", "messages"],
    BDM: ["bdmdashboard", "criteriacheck", "allcustomers", "mymi", "myreports"],
    Underwriter: ["uwqueue", "uwworkstation", "approvals", "comparison", "policychecker", "incomeanalysis", "uwperformance", "needsattention", "servicing", "mymi"],
    Ops: ["needsattention", "allcustomers", "intake", "approvals", "servicing", "collections", "rateswitch", "mymi", "commscentre"],
    Finance: ["disbursements", "approvals", "needsattention", "mortgages", "savings", "savingsdashboard", "portfoliorisk", "stresstest", "pricing", "mymi"],
    Admin: ["needsattention", "allcustomers", "intake", "aidashboard", "mymi", "portfoliorisk", "stresstest"],
    "Risk Analyst": ["consumerduty", "regulatory", "portfoliorisk", "stresstest", "riskanomaly", "needsattention", "mymi"],
  },
};

// Helper: check if content should show for this persona + screen
export function shouldShowForPersona(type, persona, screenId) {
  const allowed = PERSONA_CONTENT[type]?.[persona];
  if (!allowed) return true; // no filter defined = show all
  if (Array.isArray(allowed[0]?.items || allowed[0])) {
    // releases format
    return true; // always show releases, but filtered content
  }
  return allowed.includes(screenId);
}

// Helper: get persona-filtered releases
export function getPersonaReleases(persona) {
  return PERSONA_CONTENT.releases[persona] || PERSONA_CONTENT.releases.Admin;
}
