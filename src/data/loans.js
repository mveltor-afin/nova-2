// ── Team Members ──
export const TEAM_MEMBERS = {
  advisors: [
    { id:"ADV-01", name:"Sarah Thompson", role:"Mortgage Adviser", initials:"ST", active:4, capacity:8, specialism:["Residential","BTL"], phone:"+44 7700 100001", email:"s.thompson@afinbank.com" },
    { id:"ADV-02", name:"Mike Chen",      role:"Mortgage Adviser", initials:"MC", active:6, capacity:8, specialism:["Residential","Shared Ownership"], phone:"+44 7700 100002", email:"m.chen@afinbank.com" },
    { id:"ADV-03", name:"Rachel Adams",   role:"Senior Adviser",   initials:"RA", active:3, capacity:6, specialism:["HNW","Complex"], phone:"+44 7700 100003", email:"r.adams@afinbank.com" },
  ],
  underwriters: [
    { id:"UW-01", name:"James Mitchell",  role:"Underwriter",        initials:"JM", active:6, capacity:10, mandate:"L1", specialism:["Standard","First Time"], phone:"+44 7700 200001", email:"j.mitchell@afinbank.com" },
    { id:"UW-02", name:"Amir Hassan",     role:"Senior Underwriter", initials:"AH", active:4, capacity:8,  mandate:"L2", specialism:["Self-employed","Complex","BTL"], phone:"+44 7700 200002", email:"a.hassan@afinbank.com" },
    { id:"UW-03", name:"Rebecca Lewis",   role:"Underwriter",        initials:"RL", active:5, capacity:10, mandate:"L1", specialism:["Standard","Remortgage"], phone:"+44 7700 200003", email:"r.lewis@afinbank.com" },
  ],
  ops: [
    { id:"OPS-01", name:"Tom Walker",      role:"Customer Care",    initials:"TW", active:5, capacity:12, specialism:["KYC","Documents"], phone:"+44 7700 300001", email:"t.walker@afinbank.com" },
    { id:"OPS-02", name:"Lucy Fernandez",  role:"Customer Care",    initials:"LF", active:3, capacity:12, specialism:["KYC","Valuations"], phone:"+44 7700 300002", email:"l.fernandez@afinbank.com" },
    { id:"OPS-03", name:"Emma Chen",       role:"Senior Ops",       initials:"EC", active:7, capacity:10, specialism:["Complex","Complaints"], phone:"+44 7700 300003", email:"e.chen@afinbank.com" },
  ],
};

export const MOCK_LOANS = [
  { id: "AFN-2026-00142", names: "James & Sarah Mitchell", product: "Afin Fix 2yr 75%", amount: "£350,000", term: "25 yrs", rate: "4.49%", type: "C&I", status: "Underwriting", updated: "2h ago",
    squad: { adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id: "AFN-2026-00139", names: "Priya Sharma", product: "Afin Track SVR", amount: "£275,000", term: "30 yrs", rate: "5.14%", type: "C&I", status: "Offer_Issued", updated: "1d ago",
    squad: { adviser:"ADV-02", underwriter:"UW-03", ops:"OPS-02" } },
  { id: "AFN-2026-00135", names: "David Chen", product: "Afin Fix 5yr 90%", amount: "£425,000", term: "25 yrs", rate: "5.29%", type: "Interest Only", status: "KYC_In_Progress", updated: "3d ago",
    squad: { adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-02" } },
  { id: "AFN-2026-00128", names: "Emma & Tom Wilson", product: "Afin Fix 2yr 75%", amount: "£290,000", term: "20 yrs", rate: "4.49%", type: "C&I", status: "Disbursed", updated: "1w ago", servicingId: "M-002891",
    squad: { adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id: "AFN-2026-00125", names: "Aisha Patel", product: "Afin Fix 5yr 75%", amount: "£510,000", term: "25 yrs", rate: "4.89%", type: "C&I", status: "Approved", updated: "4d ago",
    squad: { adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-03" } },
  { id: "AFN-2026-00119", names: "Robert Hughes", product: "—", amount: "£180,000", term: "15 yrs", rate: "—", type: "C&I", status: "Referred", updated: "5d ago",
    squad: { adviser:"ADV-02", underwriter:"UW-02", ops:"OPS-01" } },
  { id: "AFN-2026-00115", names: "Sophie & Jack Brown", product: "Afin Fix 2yr 90%", amount: "£320,000", term: "30 yrs", rate: "5.29%", type: "C&I", status: "DIP_Approved", updated: "6d ago",
    squad: { adviser:"ADV-01", underwriter:"UW-03", ops:"OPS-03" } },
];

export const MOCK_DOCS = [
  { name: "Fact_Find_Mitchell.pdf", category: "Fact Find", confidence: 98, status: "Verified", ai: "All sections complete. Income matches payslips." },
  { name: "Payslip_Mar_2026.pdf", category: "Payslip", confidence: 96, status: "Verified", ai: "Employer: TechCorp Ltd. Gross: £5,833/mo." },
  { name: "Bank_Statement_Feb.pdf", category: "Bank Statement", confidence: 94, status: "Verified", ai: "HSBC current account. Regular salary credit." },
  { name: "P60_2025.pdf", category: "P60", confidence: 91, status: "Flagged", ai: "Flag: £2,500 less than declared salary — verify." },
  { name: "ID_Passport_James.jpg", category: "ID Document", confidence: 99, status: "Verified", ai: "UK Passport. Name matches. Expiry: 2031." },
  { name: "Proof_Address_Utility.pdf", category: "Proof of Address", confidence: 88, status: "Flagged", ai: "Flag: Utility bill older than 3 months." },
];

export const MOCK_TIMELINE = [
  { time: "20 Feb, 14:32", type: "dip", text: "DIP executed: Afin Fix 2yr 75% — Approved", actor: "Broker", color: "#0EA5E9" },
  { time: "20 Feb, 14:00", type: "doc", text: "3 documents uploaded: Payslip, Bank Statement, P60", actor: "Broker", color: "#8B5CF6" },
  { time: "20 Feb, 10:15", type: "ai", text: "AI parsed fact-find: 42 fields populated (confidence: 94%)", actor: "System", color: "#F59E0B" },
  { time: "19 Feb, 16:45", type: "msg", text: "Broker: Could you confirm the ERC on the 5yr fixed?", actor: "Broker", color: "#10B981" },
  { time: "19 Feb, 16:20", type: "msg", text: "Afin: ERC is 5/4/3/2/1% over the fixed period.", actor: "Afin Ops", color: "#10B981" },
  { time: "19 Feb, 13:45", type: "status", text: "Loan created by broker", actor: "Broker", color: "#64748B" },
];

export const WIZARD_STEPS = [
  { id: "type", label: "Applicant Type" }, { id: "applicant1", label: "Applicant 1" },
  { id: "applicant2", label: "Applicant 2" }, { id: "credit", label: "Credit Check" },
  { id: "documents", label: "Document Upload" }, { id: "aiReview", label: "AI Review" },
  { id: "additional", label: "Additional Info" }, { id: "products", label: "Product Selection" },
  { id: "dip", label: "DIP Assessment" }, { id: "dipHistory", label: "DIP History" },
  { id: "consent", label: "Consents" }, { id: "submit", label: "Submit" },
];

export const WIZARD_PRODUCTS = [
  { name: "Afin Fix 2yr 75%", type: "Fixed", repay: "C&I", rate: "4.49%", monthly: "£1,948", erc: "3% yr1, 2% yr2", elig: "green" },
  { name: "Afin Fix 5yr 75%", type: "Fixed", repay: "C&I", rate: "4.89%", monthly: "£2,019", erc: "5/4/3/2/1%", elig: "green" },
  { name: "Afin Track SVR 75%", type: "Tracker", repay: "C&I", rate: "5.14%", monthly: "£2,063", erc: "None", elig: "green" },
  { name: "Afin Fix 2yr 90%", type: "Fixed", repay: "C&I", rate: "5.29%", monthly: "£2,090", erc: "4% yr1, 3% yr2", elig: "green" },
  { name: "Afin Pro Fix 2yr", type: "Fixed", repay: "Both", rate: "3.99%", monthly: "£1,860", erc: "3% yr1, 2% yr2", elig: "yellow", note: "Professional qualification required" },
  { name: "Afin HNW Fix 5yr", type: "Fixed", repay: "Both", rate: "4.29%", monthly: "£1,912", erc: "5/4/3/2/1%", elig: "yellow", note: "HNW: £300k income or £3m assets" },
  { name: "Afin Fix 2yr 60%", type: "Fixed", repay: "C&I", rate: "4.19%", monthly: "£1,896", erc: "2% yr1, 1% yr2", elig: "red", note: "LTV 72% exceeds max 60%" },
  { name: "Afin BTL Tracker", type: "Tracker", repay: "IO", rate: "5.99%", monthly: "£1,747", erc: "3% yr1", elig: "red", note: "BTL only; property type not accepted" },
];
