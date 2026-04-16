// ─────────────────────────────────────────────
// NOVA 2.0 — Agentic Data Layer
//
// Unified query functions that traverse the full data model:
//   Customer ↔ Products ↔ Loans ↔ Servicing ↔ Risk ↔ Complaints
//
// Every function returns a complete, traversable object.
// An AI agent can call getCustomerAggregate("CUS-003") and
// get everything in one response. A backend API replaces this later.
// ─────────────────────────────────────────────

import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES, PARTIES_BY_CUSTOMER, PARTY_TYPES } from "./customers";
import { MOCK_LOANS, TEAM_MEMBERS } from "./loans";
import { MOCK_SVC_ACCOUNTS } from "./servicing";

// ── Complaints data (single source of truth) ──
export const COMPLAINTS = {
  "CUS-003": [
    { id: "CMP-001", customerId: "CUS-003", date: "15 Mar 2026", category: "Arrears Handling", severity: "High", status: "Open",
      description: "Customer unhappy with timing of arrears letters — received while vulnerability protocol was active",
      rootCause: "System auto-generated letters not suppressed during vulnerability hold",
      resolution: null, compensation: null, deadline: "14 Apr 2026", handler: "Lucy Chen" },
  ],
  "CUS-006": [
    { id: "CMP-002", customerId: "CUS-006", date: "10 Feb 2026", category: "Account Access", severity: "Medium", status: "Resolved",
      description: "Customer unable to access online portal after account was locked",
      rootCause: "Account lock trigger too aggressive — 2 failed login attempts",
      resolution: "Account unlocked, authentication threshold increased to 5 attempts",
      compensation: "£50 goodwill", deadline: "24 Feb 2026", handler: "Ahmed Hassan" },
    { id: "CMP-003", customerId: "CUS-006", date: "28 Mar 2026", category: "Communication", severity: "High", status: "Open",
      description: "No contact from the bank in 60 days despite arrears. Customer feels abandoned.",
      rootCause: "Under investigation — collections workflow gap",
      resolution: null, compensation: null, deadline: "28 Apr 2026", handler: "Rachel Adams" },
  ],
};

// ─────────────────────────────────────────────
// QUERY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get a complete customer aggregate — everything about a customer in one call.
 */
export function getCustomerAggregate(customerId) {
  const customer = CUSTOMERS.find(c => c.id === customerId);
  if (!customer) return null;

  const allProductIds = [...customer.products, ...customer.pendingProducts];
  const products = PRODUCTS.filter(p => allProductIds.includes(p.id));
  const loans = MOCK_LOANS.filter(l => l.customerId === customerId);
  const servicingAccounts = MOCK_SVC_ACCOUNTS.filter(a => a.customerId === customerId);
  const parties = PARTIES_BY_CUSTOMER[customerId] || [];
  const complaints = COMPLAINTS[customerId] || [];
  const aiActions = AI_ACTIONS[customerId] || [];

  const risk = {
    score: customer.riskScore,
    level: customer.risk,
    vulnerable: customer.vuln,
    inArrears: servicingAccounts.some(a => a.arrears),
    arrearsTotal: servicingAccounts.reduce((sum, a) => {
      if (!a.arrears) return sum;
      return sum + parseInt(a.arrears.replace(/[^0-9]/g, ""), 10);
    }, 0),
    openComplaints: complaints.filter(c => c.status === "Open").length,
    kycStatus: customer.kyc,
    kycExpiry: customer.kycExpiry,
  };

  return {
    customer,
    products,
    loans,
    servicingAccounts,
    parties,
    complaints,
    aiActions,
    risk,
    isBusiness: customer.customerType === "business",
    productCount: products.length,
    totalBalance: products.reduce((sum, p) => {
      const bal = parseFloat((p.balance || "£0").replace(/[£,]/g, ""));
      return sum + (isNaN(bal) ? 0 : bal);
    }, 0),
  };
}

/**
 * Get everything about a case/loan.
 */
export function getCaseAggregate(caseRef) {
  const loan = MOCK_LOANS.find(l => l.id === caseRef);
  if (!loan) return null;

  const customer = loan.customerId ? CUSTOMERS.find(c => c.id === loan.customerId) : null;
  const servicing = MOCK_SVC_ACCOUNTS.find(a => a.origRef === loan.id || a.id === loan.servicingId);
  const squad = resolveSquad(loan.squad);

  return {
    loan,
    customer,
    servicing,
    squad,
    risk: {
      score: loan.riskScore,
      level: loan.riskLevel,
      customerRisk: customer?.risk,
      customerVuln: customer?.vuln,
      inArrears: !!servicing?.arrears,
    },
  };
}

/**
 * Get all at-risk customers.
 */
export function getAtRiskCustomers() {
  return CUSTOMERS
    .map(c => {
      const agg = getCustomerAggregate(c.id);
      return { ...agg, isAtRisk: true };
    })
    .filter(a => a.risk.score > 60 || a.risk.inArrears || a.risk.vulnerable || a.risk.openComplaints > 0)
    .sort((a, b) => b.risk.score - a.risk.score);
}

/**
 * Get all business customers.
 */
export function getBusinessCustomers() {
  return CUSTOMERS.filter(c => c.customerType === "business").map(c => getCustomerAggregate(c.id));
}

/**
 * Get all consumer customers.
 */
export function getConsumerCustomers() {
  return CUSTOMERS.filter(c => c.customerType === "consumer").map(c => getCustomerAggregate(c.id));
}

/**
 * Find a servicing account by any key.
 */
export function findServicingAccount({ customerId, origRef, accountId }) {
  if (accountId) return MOCK_SVC_ACCOUNTS.find(a => a.id === accountId);
  if (customerId) return MOCK_SVC_ACCOUNTS.find(a => a.customerId === customerId);
  if (origRef) return MOCK_SVC_ACCOUNTS.find(a => a.origRef === origRef);
  return null;
}

/**
 * Find a loan by any reference.
 */
export function findLoan({ caseId, origRef, customerId }) {
  if (caseId) return MOCK_LOANS.find(l => l.id === caseId);
  if (origRef) return MOCK_LOANS.find(l => l.id === origRef);
  if (customerId) return MOCK_LOANS.filter(l => l.customerId === customerId);
  return null;
}

/**
 * Resolve squad member IDs to full team member objects.
 */
export function resolveSquad(squadIds) {
  if (!squadIds) return null;
  const all = [...TEAM_MEMBERS.advisors, ...TEAM_MEMBERS.underwriters, ...TEAM_MEMBERS.ops];
  return {
    adviser: all.find(m => m.id === squadIds.adviser),
    underwriter: all.find(m => m.id === squadIds.underwriter),
    ops: all.find(m => m.id === squadIds.ops),
  };
}

/**
 * Search across all data.
 */
export function globalSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results = [];

  CUSTOMERS.forEach(c => {
    const searchable = [c.name, c.id, c.email, c.segment, c.customerType].filter(Boolean).join(" ").toLowerCase();
    if (searchable.includes(q))
      results.push({ type: "customer", id: c.id, label: c.name, sub: `${c.id} · ${c.customerType === "business" ? "Business" : c.segment}`, data: c });
  });

  MOCK_LOANS.forEach(l => {
    if (l.id.toLowerCase().includes(q) || l.names.toLowerCase().includes(q))
      results.push({ type: "case", id: l.id, label: l.id, sub: `${l.names} · ${l.amount}`, data: l });
  });

  MOCK_SVC_ACCOUNTS.forEach(a => {
    if (a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.origRef.toLowerCase().includes(q))
      results.push({ type: "servicing", id: a.id, label: a.id, sub: `${a.name} · ${a.product}`, data: a });
  });

  return results;
}

// Re-export for convenience
export { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES, PARTIES_BY_CUSTOMER, PARTY_TYPES };
export { MOCK_LOANS, TEAM_MEMBERS };
export { MOCK_SVC_ACCOUNTS };
