import { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// PERMISSION DATA
// ─────────────────────────────────────────────
const ROLES = ["Broker", "Underwriter", "Operations", "Administration", "Finance"];
const CRUD = ["c", "r", "u", "d"];
const CRUD_LABELS = { c: "C", r: "R", u: "U", d: "D" };

const PERMISSION_CATEGORIES = [
  { category: "Onboarding and Registration", permissions: [
    { id:"P001", name:"Broker self-registration", desc:"Broker creates their own account on the portal" },
    { id:"P002", name:"Broker onboarding approval / rejection", desc:"Review and approve or reject broker applications" },
    { id:"P003", name:"Broker profile management", desc:"View and maintain broker profile records" },
  ]},
  { category: "Dashboard and Case Pipeline", permissions: [
    { id:"P004", name:"Dashboard – own pipeline (broker)", desc:"Broker sees only their own cases" },
    { id:"P005", name:"Dashboard – all cases (internal)", desc:"Full case portfolio view for internal staff" },
    { id:"P006", name:"Disbursement queue", desc:"Cases cleared and awaiting funds release" },
  ]},
  { category: "Customer Management", permissions: [
    { id:"P007", name:"Edit customer record", desc:"Modify customer fields, custom fields and notification settings" },
    { id:"P008", name:"Delete customer record", desc:"Delete a customer with no linked accounts or transactions" },
    { id:"P009", name:"Approve customer", desc:"Change customer from pending approval to approved" },
    { id:"P010", name:"Reject customer", desc:"Reject an unapproved customer" },
    { id:"P011", name:"Exit customer", desc:"Change a customer to Exited status" },
    { id:"P012", name:"Blacklist customer", desc:"Change a customer to Blacklisted status" },
    { id:"P013", name:"Undo customer state change", desc:"Undo approval or blacklisting of a customer" },
    { id:"P014", name:"Edit customer ID", desc:"Manually edit the system-generated customer ID" },
    { id:"P015", name:"Change customer type", desc:"Change the type of customer (retail to commercial)" },
    { id:"P016", name:"Manage customer association", desc:"Branch/Centre/Credit Officer association on customers" },
    { id:"P017", name:"View group / company details", desc:"Access group/company overview and lists" },
    { id:"P018", name:"Create group / company", desc:"Create new customer group or company record" },
    { id:"P019", name:"Edit group / company", desc:"Modify group/company members and information" },
    { id:"P020", name:"Delete group / company", desc:"Delete a group with no linked accounts" },
    { id:"P021", name:"Change group type", desc:"Change the type of group" },
    { id:"P022", name:"Manage group association", desc:"Branch/Centre/CO association on groups" },
    { id:"P023", name:"Edit group ID", desc:"Manually edit the system-generated group ID" },
  ]},
  { category: "Case Creation", permissions: [
    { id:"P024", name:"Create loan / customer record", desc:"Initiate new lending case" },
    { id:"P025", name:"Soft credit search (auto-trigger in DIP)", desc:"Triggered automatically when broker runs a DIP" },
  ]},
  { category: "Fact Find and Documents", permissions: [
    { id:"P026", name:"Fact Find upload", desc:"Primary customer data collection document" },
    { id:"P027", name:"Fact Find AI results", desc:"AI extracted structured data from the fact find" },
    { id:"P028", name:"Document AI analysis", desc:"AI risk flags from uploaded documents" },
    { id:"P029", name:"View documents", desc:"View any attachments across customers and accounts" },
    { id:"P030", name:"Upload / attach documents", desc:"Add and attach files to cases, customers or accounts" },
    { id:"P031", name:"Edit attached documents", desc:"Edit metadata on attached files" },
    { id:"P032", name:"Delete documents", desc:"Permanently delete attached files" },
  ]},
  { category: "Decision in Principle", permissions: [
    { id:"P033", name:"Run DIP per product", desc:"Broker initiated DIP, triggers soft credit search automatically" },
    { id:"P034", name:"DIP history (own cases)", desc:"Broker reads their own DIP records only" },
    { id:"P035", name:"DIP history (all cases)", desc:"Internal access to full DIP history across all brokers" },
    { id:"P036", name:"Download ESIS / DIP letter", desc:"Export DIP decision document" },
  ]},
  { category: "Application Submission", permissions: [
    { id:"P037", name:"Submit full lending application", desc:"Broker submits, triggers formal underwriting workflow" },
    { id:"P038", name:"Application timeline (broker view)", desc:"Broker timeline, with internal entries hidden" },
    { id:"P039", name:"Application timeline (internal view)", desc:"All internal entries visible" },
    { id:"P040", name:"Internal case notes", desc:"Internal notes, with finance as read only" },
  ]},
  { category: "Messaging and Communications", permissions: [
    { id:"P041", name:"In-app instant messaging", desc:"Two way messaging thread on a case" },
    { id:"P042", name:"View comments", desc:"Access comments tab for customers, users, branches and products" },
    { id:"P043", name:"Create comments", desc:"Add new comments on cases, customers or accounts" },
    { id:"P044", name:"Edit comments", desc:"Modify existing comments" },
    { id:"P045", name:"Delete comments", desc:"Remove existing comments" },
    { id:"P046", name:"Create communication templates", desc:"Create email and SMS notification templates" },
    { id:"P047", name:"Edit communication templates", desc:"Edit, deactivate and delete communication templates" },
    { id:"P048", name:"Send manual SMS (future)", desc:"Send ad-hoc SMS to customers" },
    { id:"P049", name:"Send manual email", desc:"Send ad-hoc emails to customers" },
    { id:"P050", name:"View communication history", desc:"View history of SMS/emails/webhooks" },
    { id:"P051", name:"Resend failed messages", desc:"Retry failed notification messages" },
  ]},
  { category: "KYC and AML", permissions: [
    { id:"P052", name:"KYC initiation (Mitek)", desc:"Trigger biometric identity verification" },
    { id:"P053", name:"AML check (ComplyAdvantage)", desc:"Sanctions, PEP and adverse media screening" },
    { id:"P054", name:"Credit check results", desc:"Bureau credit search and scoring" },
  ]},
  { category: "Credit Analysis", permissions: [
    { id:"P055", name:"Credit analysis dashboard", desc:"Full affordability assessment" },
    { id:"P056", name:"Valuation upload and completion", desc:"Property valuation record and sign-off" },
  ]},
  { category: "Approval and Decline", permissions: [
    { id:"P057", name:"1st approval (within lending mandate)", desc:"Underwriter approves per delegated mandate threshold" },
    { id:"P058", name:"Lending mandate configuration", desc:"Define and manage approval authority thresholds" },
    { id:"P059", name:"2nd / escalated approval", desc:"Admin acts as second approver above UW mandate" },
    { id:"P060", name:"Decline with recorded reason", desc:"Formal decline with reason code; creates audit record" },
    { id:"P061", name:"Generate offer letter", desc:"Create and issue formal mortgage offer document" },
    { id:"P062", name:"Accept / reject offer (customer action)", desc:"Broker updates offer status on behalf of the customer" },
  ]},
  { category: "Connected Parties", permissions: [
    { id:"P063", name:"Solicitor details", desc:"Solicitor firm and contact linked to a case" },
    { id:"P064", name:"Connected party search and linking", desc:"Link guarantors, companies and related parties" },
  ]},
  { category: "Pre-completion", permissions: [
    { id:"P065", name:"Pre-completion checklist", desc:"Action items gating disbursement" },
  ]},
  { category: "Disbursements", permissions: [
    { id:"P066", name:"Disbursement initiation", desc:"Finance creates and submits funds release instruction" },
    { id:"P067", name:"Disbursement 4-eye approval", desc:"A second Finance user (not the initiator) approves release" },
  ]},
  { category: "Case Management", permissions: [
    { id:"P068", name:"Case assignment / reassignment", desc:"Assign cases to internal team members" },
    { id:"P069", name:"Workload dashboard", desc:"Team capacity and queue management" },
    { id:"P070", name:"Audit / transaction lookup", desc:"Filter and find transactions across the platform" },
    { id:"P071", name:"View tasks", desc:"View tasks linked to cases, customers or accounts" },
    { id:"P072", name:"Create tasks", desc:"Add new tasks to cases, customers or accounts" },
    { id:"P073", name:"Edit / complete tasks", desc:"Update and complete tasks" },
    { id:"P074", name:"Delete tasks", desc:"Permanently remove tasks" },
  ]},
  { category: "Broker Management", permissions: [
    { id:"P075", name:"Broker record management", desc:"Create, edit and deactivate broker accounts" },
  ]},
  { category: "Loan Accounts", permissions: [
    { id:"P076", name:"View loan account details", desc:"Access loan account overview and account lists" },
    { id:"P077", name:"Create loan account", desc:"Open a new loan account in the system" },
    { id:"P078", name:"Edit loan account", desc:"Modify account fields and parameters on unapproved loans" },
    { id:"P079", name:"Delete loan account", desc:"Delete account with no transactions" },
    { id:"P080", name:"Enter repayments", desc:"Post repayment transactions to a loan account" },
    { id:"P081", name:"Edit repayment schedule", desc:"Modify items on a fixed loan repayment schedule" },
    { id:"P082", name:"Approve loan account", desc:"Approve loans in pending approval state" },
    { id:"P083", name:"Request loan approval", desc:"Submit loans in partial application state for approval" },
    { id:"P084", name:"Disburse loan", desc:"Disburse loans in approved state" },
    { id:"P085", name:"Withdraw loan account", desc:"Withdraw a loan not yet disbursed" },
    { id:"P086", name:"Undo withdraw loan account", desc:"Reverse the withdrawal of a loan" },
    { id:"P087", name:"Set loan incomplete", desc:"Revert loan from pending approval to partial application" },
    { id:"P088", name:"Reject loan account", desc:"Reject loans in pending approval or partial application state" },
    { id:"P089", name:"Undo reject loan account", desc:"Reverse the rejection of a loan" },
    { id:"P090", name:"Close repaid loan account", desc:"Close a fully repaid loan account" },
    { id:"P091", name:"Write-off loan account", desc:"Write off a loan with pending balance" },
    { id:"P092", name:"Pay off loan account", desc:"Completely settle a loan account" },
    { id:"P093", name:"Undo close loan account", desc:"Reverse non-write-off loan closures" },
    { id:"P094", name:"Undo write-off loan", desc:"Reverse a loan write-off" },
    { id:"P095", name:"Refinance loan account", desc:"Use the Refinance option on an existing loan" },
    { id:"P096", name:"Reschedule loan account", desc:"Use the Reschedule option on an existing loan" },
    { id:"P097", name:"Apply accrued interest (loans)", desc:"Charge interest accrued to date to the loan" },
    { id:"P098", name:"Apply loan account fees", desc:"Charge manual fees to a loan account" },
    { id:"P099", name:"Apply loan adjustments / reversals", desc:"Reverse loan transactions and undo approvals" },
    { id:"P100", name:"Backdate loan transactions", desc:"Post transactions with a past date" },
    { id:"P101", name:"Set settlement accounts", desc:"Set a savings account as settlement for a loan" },
    { id:"P102", name:"Collect securities", desc:"Collect secured amounts from savings on write-off" },
    { id:"P103", name:"View loan securities", desc:"View the securities tab on a loan account" },
    { id:"P104", name:"Create loan securities", desc:"Add securities to a loan account" },
    { id:"P105", name:"Edit loan securities", desc:"Modify securities on a loan account" },
    { id:"P106", name:"Delete loan securities", desc:"Remove securities from a loan account" },
    { id:"P107", name:"Lock loan account", desc:"Set account to Locked; no automated transactions posted" },
    { id:"P108", name:"Post transactions on locked accounts", desc:"Post repayments/fees to a locked account" },
    { id:"P109", name:"Edit loan tranches", desc:"Modify tranches on an existing loan account" },
    { id:"P110", name:"Edit penalty rate", desc:"Change the penalty rate on an active loan" },
    { id:"P111", name:"Set disbursement conditions", desc:"Define and override disbursement details on a loan" },
    { id:"P112", name:"Edit loan transactions", desc:"Edit custom fields on posted loan transactions" },
    { id:"P113", name:"Bulk loan corrections", desc:"Backdate or reverse transactions in bulk on loan accounts" },
    { id:"P114", name:"Edit revolving credit interest rate", desc:"Edit interest rate on active revolving credit loans" },
    { id:"P115", name:"Edit periodic payment for active accounts", desc:"Modify periodic payment amount on active accounts" },
    { id:"P116", name:"Edit principal payment (revolving credit)", desc:"Edit principal payment on active revolving credit" },
    { id:"P117", name:"Repayments with custom amount allocation", desc:"Perform repayments with custom allocation rules" },
    { id:"P118", name:"Manage loan association", desc:"Manage branch/centre/CO associations on loans" },
    { id:"P119", name:"Make withdrawal / redraw", desc:"Perform redraw withdrawal on a loan account" },
  ]},
  { category: "Deposit Accounts", permissions: [
    { id:"P120", name:"View deposit account details", desc:"Access deposit account overview and account lists" },
    { id:"P121", name:"Create deposit account", desc:"Open a new deposit account" },
    { id:"P122", name:"Edit deposit account", desc:"Modify an existing deposit account" },
    { id:"P123", name:"Delete deposit account", desc:"Delete a deposit account with no transactions" },
    { id:"P124", name:"Make deposit", desc:"Post a deposit transaction" },
    { id:"P125", name:"Make withdrawal", desc:"Post a withdrawal transaction" },
    { id:"P126", name:"Make early withdrawal", desc:"Withdraw before the maturity date" },
    { id:"P127", name:"Approve deposit account", desc:"Approve deposit accounts in pending approval state" },
    { id:"P128", name:"Activate maturity", desc:"Set maturity date on fixed deposits and savings plans" },
    { id:"P129", name:"Close deposit account", desc:"Close a zero-balance deposit or write-off overdraft" },
    { id:"P130", name:"Apply deposit account fees", desc:"Charge manual fees to a deposit account" },
    { id:"P131", name:"Re-open deposit account", desc:"Reopen a closed deposit account" },
    { id:"P132", name:"Apply deposit adjustments / reversals", desc:"Reverse deposit transactions and undo approvals" },
    { id:"P133", name:"Lock deposit account", desc:"Restrict transactions on a deposit account" },
    { id:"P134", name:"Unlock deposit account", desc:"Re-enable transactions on a locked deposit account" },
    { id:"P135", name:"Undo write-off (deposit/overdraft)", desc:"Reverse write-off on an overdraft account" },
    { id:"P136", name:"Backdate deposit transactions", desc:"Post deposit transactions with a past date" },
    { id:"P137", name:"Intra-customer transfers", desc:"Transfer between accounts belonging to the same customer" },
    { id:"P138", name:"Inter-customer transfers", desc:"Transfer between accounts belonging to different customers" },
    { id:"P139", name:"Post transactions on dormant accounts", desc:"Post to accounts inactive beyond the dormancy threshold" },
    { id:"P140", name:"Apply accrued interest (deposits)", desc:"Charge interest accrued to date on a deposit" },
    { id:"P141", name:"Edit deposit transactions", desc:"Edit custom fields on posted deposit transactions" },
    { id:"P142", name:"Bulk deposit corrections", desc:"Backdate or reverse transactions in bulk on deposit accounts" },
    { id:"P143", name:"Undo maturity", desc:"Reverse the maturity activation on a deposit" },
    { id:"P144", name:"Block and seize funds", desc:"Block and seize funds on a deposit account" },
  ]},
  { category: "Reporting and MI", permissions: [
    { id:"P145", name:"MI reports – own performance", desc:"Individual KPIs and conversion metrics" },
    { id:"P146", name:"MI reports – full platform analytics", desc:"Portfolio, pipeline and broker analytics" },
    { id:"P147", name:"View historical data", desc:"Access historical records and data across the platform" },
    { id:"P148", name:"View reports / dashboard indicators", desc:"Access dashboard indicators and reports" },
    { id:"P149", name:"Create reports", desc:"Add new custom indicator reports" },
    { id:"P150", name:"Edit reports", desc:"Modify existing reports and indicators" },
    { id:"P151", name:"Delete reports", desc:"Remove reports and custom indicators" },
    { id:"P152", name:"Export to Excel", desc:"Export custom views, reports and accounting data to Excel" },
  ]},
  { category: "System Configuration", permissions: [
    { id:"P153", name:"Product configuration (rates, LTV, rules)", desc:"Full lifecycle management of product rules on Nova platform" },
    { id:"P154", name:"System settings and integrations", desc:"API keys, environment config and integration toggles" },
    { id:"P155", name:"User and role administration", desc:"Create, modify and deactivate users and roles" },
    { id:"P156", name:"Manage user profiles", desc:"Edit user profiles; non-admins limited to own profile" },
    { id:"P157", name:"View branch details", desc:"Access branch information in the organisation menu" },
    { id:"P158", name:"Create branches", desc:"Add new branches to the organisation" },
    { id:"P159", name:"Edit branches", desc:"Modify branch details" },
    { id:"P160", name:"View centre details", desc:"Access centre information in the organisation menu" },
    { id:"P161", name:"Create centres", desc:"Add new centres to the organisation" },
    { id:"P162", name:"Edit centres", desc:"Modify centre details" },
    { id:"P163", name:"Create platform users", desc:"Add new users to the system" },
    { id:"P164", name:"Edit platform users", desc:"Modify existing user accounts" },
    { id:"P165", name:"View user details", desc:"Access user profiles in the organisation menu" },
  ]},
];

const ALL_PERMISSIONS = PERMISSION_CATEGORIES.flatMap(c => c.permissions);
const TOTAL = ALL_PERMISSIONS.length;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initState() {
  const s = {};
  ALL_PERMISSIONS.forEach(p => {
    s[p.id] = {};
    ROLES.forEach(r => { s[p.id][r] = { c: false, r: false, u: false, d: false }; });
  });
  return s;
}

function computeStats(perms) {
  const stats = {};
  ROLES.forEach(role => {
    let configured = 0;
    ALL_PERMISSIONS.forEach(p => {
      if (CRUD.some(op => perms[p.id]?.[role]?.[op])) configured++;
    });
    stats[role] = configured;
  });
  let totalConfigured = 0;
  ALL_PERMISSIONS.forEach(p => {
    if (ROLES.some(role => CRUD.some(op => perms[p.id]?.[role]?.[op]))) totalConfigured++;
  });
  stats._total = totalConfigured;
  return stats;
}

function computeAIInsight(perms) {
  let noRole = 0, adminOnly = 0, brokerHasDelete = false;
  ALL_PERMISSIONS.forEach(p => {
    const hasAny = ROLES.some(role => CRUD.some(op => perms[p.id]?.[role]?.[op]));
    if (!hasAny) noRole++;
    const onlyAdmin = ROLES.every(role => {
      if (role === "Administration") return true;
      return !CRUD.some(op => perms[p.id]?.[role]?.[op]);
    }) && CRUD.some(op => perms[p.id]?.["Administration"]?.[op]);
    if (onlyAdmin) adminOnly++;
    if (perms[p.id]?.["Broker"]?.d) brokerHasDelete = true;
  });
  const parts = [];
  parts.push(`${noRole} permissions have no role assigned.`);
  if (adminOnly > 0) parts.push(`${adminOnly} permissions are admin-only.`);
  if (!brokerHasDelete) parts.push("Broker role has no delete permissions (aligned with least-privilege principle).");
  else parts.push("Warning: Broker role has delete permissions assigned.");
  return parts.join(" ");
}

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────
const CrudCell = ({ on, onClick, size = 22 }) => (
  <div onClick={onClick} style={{
    width: size, height: size, borderRadius: 4, cursor: "pointer",
    background: on ? T.success : "transparent",
    border: `1.5px solid ${on ? T.success : T.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.12s",
  }}>
    {on && <svg width={size - 8} height={size - 8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
  </div>
);

const SmallCrudCell = ({ on, onClick }) => (
  <div onClick={onClick} style={{
    width: 16, height: 16, borderRadius: 3, cursor: "pointer",
    background: on ? T.success : "transparent",
    border: `1.5px solid ${on ? T.success : "#ccc"}`,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.12s", margin: "0 1px",
  }}>
    {on && <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>}
  </div>
);

const Toast = ({ message, onClose }) => (
  <div style={{
    position: "fixed", bottom: 32, right: 32, background: T.primary, color: "#fff",
    padding: "14px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    fontFamily: T.font, boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
    display: "flex", alignItems: "center", gap: 10, zIndex: 9999,
  }}>
    {Ico.check(16)} {message}
    <span onClick={onClose} style={{ cursor: "pointer", marginLeft: 8, opacity: 0.7 }}>{Ico.x(14)}</span>
  </div>
);

const ProgressBar = ({ value, max, color = T.success }) => (
  <div style={{ height: 6, background: T.borderLight, borderRadius: 3, flex: 1, minWidth: 60 }}>
    <div style={{ height: "100%", borderRadius: 3, background: color, width: `${max ? (value / max) * 100 : 0}%`, transition: "width 0.3s" }} />
  </div>
);

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function PermissionsScreen() {
  const [perms, setPerms] = useState(initState);
  const [activeRole, setActiveRole] = useState("All Roles");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [toast, setToast] = useState(null);

  const stats = useMemo(() => computeStats(perms), [perms]);
  const aiInsight = useMemo(() => computeAIInsight(perms), [perms]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return PERMISSION_CATEGORIES;
    const q = search.toLowerCase();
    return PERMISSION_CATEGORIES.map(cat => ({
      ...cat,
      permissions: cat.permissions.filter(p =>
        p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.permissions.length > 0);
  }, [search]);

  const toggle = (pid, role, op) => {
    setPerms(prev => ({
      ...prev,
      [pid]: { ...prev[pid], [role]: { ...prev[pid][role], [op]: !prev[pid][role][op] } },
    }));
  };

  const toggleCategoryColumn = (cat, role, op) => {
    const allOn = cat.permissions.every(p => perms[p.id]?.[role]?.[op]);
    setPerms(prev => {
      const next = { ...prev };
      cat.permissions.forEach(p => {
        next[p.id] = { ...next[p.id], [role]: { ...next[p.id][role], [op]: !allOn } };
      });
      return next;
    });
  };

  const toggleCollapse = (catName) => {
    setCollapsed(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => showToast("Permission matrix saved successfully");
  const handleReset = () => { setPerms(initState()); showToast("Permissions reset to defaults"); };

  const tabs = ["All Roles", ...ROLES];
  const isSingleRole = activeRole !== "All Roles";

  // ─── RENDER ───
  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: "0 0 40px 0" }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.shield(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Permission Sets</h1>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 32 }}>
            {TOTAL} permissions across {PERMISSION_CATEGORIES.length} categories
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn small icon="download" onClick={() => showToast("Matrix exported to Excel")}>Export Matrix</Btn>
          <Btn small onClick={handleReset}>Reset to Default</Btn>
          <Btn small primary onClick={handleSave}>Save Changes</Btn>
        </div>
      </div>

      {/* ROLE TABS */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `2px solid ${T.borderLight}` }}>
        {tabs.map(tab => {
          const active = tab === activeRole;
          return (
            <div key={tab} onClick={() => setActiveRole(tab)} style={{
              padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: active ? T.primary : T.textMuted,
              borderBottom: active ? `2px solid ${T.primary}` : "2px solid transparent",
              marginBottom: -2, transition: "all 0.15s",
              background: active ? T.primaryLight : "transparent", borderRadius: "8px 8px 0 0",
            }}>
              {tab}
              {tab !== "All Roles" && (
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>{stats[tab] || 0}/{TOTAL}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 16, position: "relative", maxWidth: 400 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.textMuted }}>{Ico.search(16)}</div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search permissions by name or ID..."
          style={{
            width: "100%", padding: "10px 12px 10px 36px", borderRadius: 9,
            border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
            color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* STATS BAR */}
      <Card style={{ marginBottom: 16, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, minWidth: 180 }}>
            {stats._total} of {TOTAL} permissions configured
          </div>
          {ROLES.map(role => (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 140 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, minWidth: 80 }}>{role}</span>
              <ProgressBar value={stats[role] || 0} max={TOTAL} />
              <span style={{ fontSize: 10, color: T.textMuted, minWidth: 32 }}>{stats[role] || 0}/{TOTAL}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* AI INSIGHT */}
      <Card style={{ marginBottom: 20, padding: "14px 20px", background: "rgba(26,74,84,0.04)", borderColor: T.primaryLight }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.sparkle(16)}</span>
          <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
            <strong style={{ color: T.primary }}>Nova AI:</strong> {aiInsight}
          </div>
        </div>
      </Card>

      {/* PERMISSION MATRIX */}
      {isSingleRole ? (
        /* ─── SINGLE ROLE VIEW ─── */
        <div>
          {filteredCategories.map(cat => {
            const isCollapsed = collapsed[cat.category];
            return (
              <Card key={cat.category} style={{ marginBottom: 12, padding: 0 }}>
                {/* Category Header */}
                <div
                  onClick={() => toggleCollapse(cat.category)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px", cursor: "pointer", userSelect: "none",
                    borderBottom: isCollapsed ? "none" : `1px solid ${T.borderLight}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2.5"
                      style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{cat.category}</span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>({cat.permissions.length})</span>
                  </div>
                  {/* Category-level CRUD toggles */}
                  <div style={{ display: "flex", gap: 12 }} onClick={e => e.stopPropagation()}>
                    {CRUD.map(op => {
                      const allOn = cat.permissions.every(p => perms[p.id]?.[activeRole]?.[op]);
                      return (
                        <div key={op} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{CRUD_LABELS[op]}</span>
                          <CrudCell on={allOn} onClick={() => toggleCategoryColumn(cat, activeRole, op)} size={18} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Permission Rows */}
                {!isCollapsed && (
                  <div>
                    {/* Column headers */}
                    <div style={{ display: "flex", alignItems: "center", padding: "6px 20px 6px 44px", background: T.bg }}>
                      <div style={{ flex: 1 }} />
                      <div style={{ display: "flex", gap: 12 }}>
                        {CRUD.map(op => (
                          <div key={op} style={{ width: 22, textAlign: "center", fontSize: 10, fontWeight: 700, color: T.textMuted }}>{CRUD_LABELS[op]}</div>
                        ))}
                      </div>
                    </div>
                    {cat.permissions.map((perm, i) => (
                      <div key={perm.id} style={{
                        display: "flex", alignItems: "center", padding: "10px 20px 10px 44px",
                        borderBottom: i < cat.permissions.length - 1 ? `1px solid ${T.borderLight}` : "none",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, fontFamily: "monospace" }}>{perm.id}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{perm.name}</span>
                          </div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, marginLeft: 42 }}>{perm.desc}</div>
                        </div>
                        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                          {CRUD.map(op => (
                            <CrudCell key={op} on={perms[perm.id]?.[activeRole]?.[op]} onClick={() => toggle(perm.id, activeRole, op)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* ─── ALL ROLES MATRIX VIEW ─── */
        <Card noPad style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font, minWidth: 1100 }}>
              <thead>
                <tr style={{ background: T.primary, color: "#fff" }}>
                  <th style={{ ...thStyle, minWidth: 240, textAlign: "left", position: "sticky", left: 0, background: T.primary, zIndex: 2 }}>Permission</th>
                  {ROLES.map(role => (
                    <th key={role} colSpan={4} style={{ ...thStyle, textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
                      {role}
                    </th>
                  ))}
                </tr>
                <tr style={{ background: T.primaryDark, color: "rgba(255,255,255,0.7)" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: T.primaryDark, zIndex: 2, fontSize: 9 }}></th>
                  {ROLES.map(role => (
                    CRUD.map(op => (
                      <th key={`${role}-${op}`} style={{ ...thStyle, textAlign: "center", fontSize: 9, fontWeight: 700, padding: "4px 2px", width: 28 }}>
                        {CRUD_LABELS[op]}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(cat => (
                  <>
                    {/* Category header row */}
                    <tr key={`cat-${cat.category}`}>
                      <td colSpan={1 + ROLES.length * 4} style={{
                        padding: "10px 16px", fontWeight: 700, fontSize: 12, color: T.primary,
                        background: T.primaryLight, borderBottom: `1px solid ${T.borderLight}`,
                        position: "sticky", left: 0,
                      }}>
                        {cat.category}
                        <span style={{ fontWeight: 400, color: T.textMuted, marginLeft: 8, fontSize: 10 }}>({cat.permissions.length})</span>
                      </td>
                    </tr>
                    {/* Permission rows */}
                    {cat.permissions.map((perm, i) => (
                      <tr key={perm.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.primaryLight; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{
                          padding: "8px 16px", position: "sticky", left: 0, background: "inherit",
                          zIndex: 1, minWidth: 240, maxWidth: 300,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 9, color: T.textMuted, fontFamily: "monospace", fontWeight: 600 }}>{perm.id}</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {perm.name}
                            </span>
                          </div>
                        </td>
                        {ROLES.map(role =>
                          CRUD.map(op => (
                            <td key={`${perm.id}-${role}-${op}`} style={{
                              textAlign: "center", padding: "6px 2px",
                              borderLeft: op === "c" ? `1px solid ${T.borderLight}` : "none",
                            }}>
                              <SmallCrudCell on={perms[perm.id]?.[role]?.[op]} onClick={() => toggle(perm.id, role, op)} />
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TOAST */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

const thStyle = {
  padding: "10px 12px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.3,
  whiteSpace: "nowrap",
};

export default PermissionsScreen;
