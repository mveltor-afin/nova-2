export const MOCK_LOANS = [
  { id: "AFN-2026-00142", names: "James & Sarah Mitchell", product: "Afin Fix 2yr 75%", amount: "£350,000", term: "25 yrs", rate: "4.49%", type: "C&I", status: "Underwriting", updated: "2h ago" },
  { id: "AFN-2026-00139", names: "Priya Sharma", product: "Afin Track SVR", amount: "£275,000", term: "30 yrs", rate: "5.14%", type: "C&I", status: "Offer_Issued", updated: "1d ago" },
  { id: "AFN-2026-00135", names: "David Chen", product: "Afin Fix 5yr 90%", amount: "£425,000", term: "25 yrs", rate: "5.29%", type: "Interest Only", status: "KYC_In_Progress", updated: "3d ago" },
  { id: "AFN-2026-00128", names: "Emma & Tom Wilson", product: "Afin Fix 2yr 75%", amount: "£290,000", term: "20 yrs", rate: "4.49%", type: "C&I", status: "Disbursed", updated: "1w ago", servicingId: "M-002891" },
  { id: "AFN-2026-00125", names: "Aisha Patel", product: "Afin Fix 5yr 75%", amount: "£510,000", term: "25 yrs", rate: "4.89%", type: "C&I", status: "Approved", updated: "4d ago" },
  { id: "AFN-2026-00119", names: "Robert Hughes", product: "—", amount: "£180,000", term: "15 yrs", rate: "—", type: "C&I", status: "Referred", updated: "5d ago" },
  { id: "AFN-2026-00115", names: "Sophie & Jack Brown", product: "Afin Fix 2yr 90%", amount: "£320,000", term: "30 yrs", rate: "5.29%", type: "C&I", status: "DIP_Approved", updated: "6d ago" },
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
