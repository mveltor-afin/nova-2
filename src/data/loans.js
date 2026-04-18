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
  { id: "AFN-2026-00142", customerId: "CUS-002", servicingId: "M-001234", names: "James & Sarah Mitchell", product: "2-Year Fixed", amount: "£350,000", term: "25 yrs", rate: "4.49%", type: "C&I", status: "Underwriting", updated: "2h ago", riskScore: 18, riskLevel: "Low",
    bucket: "Prime", bucketColor: "#059669", tier: "Standard", code: "P2F", erc: "3%, 2%", productFee: "£1,495", creditProfile: "clean", propertyType: "Standard", epcRating: "C", ltv: 72,
    squad: { adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id: "AFN-2026-00139", customerId: "CUS-003", servicingId: "M-001891", names: "Priya Sharma", product: "2-Year Tracker", amount: "£275,000", term: "30 yrs", rate: "5.14%", type: "C&I", status: "Offer_Issued", updated: "1d ago", riskScore: 78, riskLevel: "High",
    bucket: "Prime", bucketColor: "#059669", tier: "Near Prime", code: "PTR", erc: "No ERCs", productFee: "£1,495", creditProfile: "near_prime", propertyType: "Standard", epcRating: "D", ltv: 68,
    squad: { adviser:"ADV-02", underwriter:"UW-03", ops:"OPS-02" } },
  { id: "AFN-2026-00135", customerId: "CUS-004", servicingId: "M-002456", names: "David Chen", product: "5-Year Fixed", amount: "£425,000", term: "25 yrs", rate: "5.69%", type: "Interest Only", status: "KYC_In_Progress", updated: "3d ago", riskScore: 12, riskLevel: "Low",
    bucket: "Prime High LTV", bucketColor: "#31B897", tier: "Standard", code: "H5F", erc: "5%, 4%, 3%, 2%, 1%", productFee: "£1,495", creditProfile: "clean", propertyType: "New Build", epcRating: "B", ltv: 85,
    squad: { adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-02" } },
  { id: "AFN-2026-00128", customerId: "CUS-001", servicingId: "M-002891", names: "Emma Wilson", product: "2-Year Fixed", amount: "£290,000", term: "20 yrs", rate: "4.19%", type: "C&I", status: "Disbursed", updated: "1w ago", riskScore: 14, riskLevel: "Low",
    bucket: "Prime", bucketColor: "#059669", tier: "Green Discount", code: "P2F", erc: "3%, 2%", productFee: "£1,495", creditProfile: "clean", propertyType: "Standard", epcRating: "A", ltv: 58,
    squad: { adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id: "AFN-2026-00125", customerId: "CUS-005", servicingId: "M-003567", names: "Aisha Patel", product: "2-Year Fixed", amount: "£510,000", term: "25 yrs", rate: "3.69%", type: "C&I", status: "Approved", updated: "4d ago", riskScore: 22, riskLevel: "Low",
    bucket: "Professional", bucketColor: "#3B82F6", tier: "Standard", code: "D2F", erc: "2%, 1%", productFee: "£1,495", creditProfile: "clean", propertyType: "Standard", epcRating: "C", ltv: 65,
    squad: { adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-03" } },
  { id: "AFN-2026-00119", customerId: "CUS-006", servicingId: "M-003124", names: "Robert Hughes", product: "—", amount: "£180,000", term: "15 yrs", rate: "—", type: "C&I", status: "Referred", updated: "5d ago", riskScore: 82, riskLevel: "High",
    bucket: null, bucketColor: null, tier: null, code: null, erc: null, productFee: null, creditProfile: "adverse", propertyType: "Non-Standard", epcRating: "F", ltv: 88,
    squad: { adviser:"ADV-02", underwriter:"UW-02", ops:"OPS-01" } },
  { id: "AFN-2026-00115", customerId: null, servicingId: "M-003890", names: "Sophie & Jack Brown", product: "2-Year Fixed", amount: "£320,000", term: "30 yrs", rate: "5.59%", type: "C&I", status: "DIP_Approved", updated: "6d ago", riskScore: 45, riskLevel: "Medium",
    bucket: "Prime High LTV", bucketColor: "#31B897", tier: "FTB 90%+", code: "H2F", erc: "4%, 3%", productFee: "£1,495", creditProfile: "clean", propertyType: "Standard", epcRating: "D", ltv: 90,
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
  { time: "20 Feb, 14:32", type: "dip", text: "DIP executed: 2-Year Fixed (Prime) — Approved", actor: "Broker", color: "#0EA5E9" },
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

// WIZARD_PRODUCTS generated dynamically — tries bucket engine first, falls back to legacy.
import { getEligibleProducts, calcMonthlyPayment, PRODUCTS_PRICING, getBucketEligibleProducts } from "./pricing";

export function getWizardProducts({ ltv = 72, credit = "clean", employment = "Employed", property = "Standard", epc = "D", loanAmount = 350000, term = 25 } = {}) {
  // Try bucket-aware engine first
  const bucketResults = getBucketEligibleProducts({ ltv, credit, employment, property, epc, loanAmount, termYears: term });
  if (bucketResults.length > 0) {
    return bucketResults.map(bp => ({
      name: bp.product,
      type: bp.product.includes("Track") ? "Tracker" : "Fixed",
      repay: "C&I",
      rate: bp.available ? bp.rate + "%" : "—",
      monthly: bp.available ? "£" + calcMonthlyPayment(loanAmount, bp.rate, term).toLocaleString("en-GB") : "—",
      erc: bp.erc || "—",
      elig: bp.available ? "green" : "red",
      note: bp.available ? null : bp.reason,
      available: bp.available,
      bucket: bp.bucket, bucketColor: bp.bucketColor, tier: bp.tier, code: bp.code,
      productFee: bp.fees?.productFee,
    }));
  }

  // Fallback to legacy pricing engine
  const eligible = getEligibleProducts({ ltv, credit, employment, property, epc });
  return eligible.map(p => {
    const prod = PRODUCTS_PRICING[p.product];
    const monthly = p.available ? calcMonthlyPayment(loanAmount, p.rate, term) : 0;
    return {
      name: p.product,
      type: p.product.includes("Track") ? "Tracker" : "Fixed",
      repay: p.product.includes("BTL") || p.product.includes("IO") ? "IO" : "C&I",
      rate: p.available ? p.rate + "%" : "—",
      monthly: p.available ? "£" + monthly.toLocaleString("en-GB") : "—",
      erc: prod?.ercSchedule || "—",
      elig: p.available ? "green" : "red",
      note: p.available ? (prod?.eligibility || null) : p.reason,
      available: p.available,
    };
  });
}

// Static fallback (default profile: Clean, 72% LTV, Employed)
export const WIZARD_PRODUCTS = getWizardProducts();
