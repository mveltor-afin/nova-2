// ─────────────────────────────────────────────
// NOVA — Shared Pricing Engine
//
// Single source of truth for all rate calculations.
// Dimensions are CONFIGURABLE — edited via Pricing Matrix UI,
// persisted in localStorage, with hardcoded defaults as fallback.
//
// To edit: Product Manager → Pricing Matrix → Dimension Editor
// Changes propagate to: Eligibility Calculator, Broker Smart Apply,
// Product Catalogue, Rate Matrix, UW Workstation.
// ─────────────────────────────────────────────

// ── localStorage helpers ──
function loadDimension(key, fallback) {
  try {
    const stored = localStorage.getItem(`pricing_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

export function saveDimension(key, value) {
  try { localStorage.setItem(`pricing_${key}`, JSON.stringify(value)); } catch {}
}

// ── Defaults (used if localStorage is empty) ──
const DEFAULT_PRODUCTS_PRICING = {
  "Afin Fix 2yr 75%":  { baseRate: 4.19, maxLTV: 75,  category: "Lending", ercSchedule: "3% / 2%" },
  "Afin Fix 5yr 75%":  { baseRate: 4.59, maxLTV: 75,  category: "Lending", ercSchedule: "5/4/3/2/1%" },
  "Afin Track SVR 75%":{ baseRate: 4.84, maxLTV: 75,  category: "Lending", ercSchedule: "None" },
  "Afin Fix 2yr 90%":  { baseRate: 4.49, maxLTV: 90,  category: "Lending", ercSchedule: "4% / 3%" },
  "Afin Pro Fix 2yr":  { baseRate: 3.69, maxLTV: 85,  category: "Lending", ercSchedule: "3% / 2%", eligibility: "Professional only" },
  "Afin HNW Fix 5yr":  { baseRate: 3.99, maxLTV: 85,  category: "Lending", ercSchedule: "5/4/3/2/1%", eligibility: "HNW only" },
  "Afin BTL Tracker":  { baseRate: 5.49, maxLTV: 75,  category: "Lending", ercSchedule: "3%", eligibility: "BTL only" },
  "Afin Shared Ownership":{ baseRate: 4.99, maxLTV: 95, category: "Lending", ercSchedule: "3% / 2%" },
};

const DEFAULT_LTV = [
  { band: "≤60%",  min: 0,  max: 60,  adj: 0.00 },
  { band: "60-75%", min: 60, max: 75,  adj: 0.30 },
  { band: "75-85%", min: 75, max: 85,  adj: 0.80 },
  { band: "85-90%", min: 85, max: 90,  adj: 1.10 },
  { band: "90-95%", min: 90, max: 95,  adj: 1.50 },
];

const DEFAULT_CREDIT = [
  { id: "clean",         label: "Clean",          desc: "No adverse ever",                          adj: 0.00 },
  { id: "near_prime",    label: "Near Prime",     desc: "1 missed payment >12 months ago",          adj: 0.25 },
  { id: "light_adverse", label: "Light Adverse",  desc: "1 CCJ <£500, satisfied >12 months",       adj: 0.50, maxLTV: 85 },
  { id: "adverse",       label: "Adverse",        desc: "1-2 CCJs <£1k, satisfied >6 months",      adj: 0.75, maxLTV: 80 },
  { id: "heavy_adverse", label: "Heavy Adverse",  desc: "Defaults satisfied >24 months",            adj: 1.25, maxLTV: 75 },
  { id: "specialist",    label: "Specialist",     desc: "IVA/DMP discharged >3 years",              adj: 1.75, maxLTV: 65 },
  { id: "fresh_start",   label: "Fresh Start",    desc: "Bankruptcy discharged >6 years",           adj: 2.50, maxLTV: 60 },
];

const DEFAULT_EMPLOYMENT = { "Employed": 0.00, "Self-Employed": 0.20, "Contractor": 0.15 };
const DEFAULT_PROPERTY = { "Standard": 0.00, "Non-Standard": 0.25, "New Build": 0.10, "Ex-Local Authority": 0.15, "High-Rise (>6 floors)": 0.30 };
const DEFAULT_EPC = { "A": -0.15, "B": -0.10, "C": -0.05, "D": 0.00, "E": 0.10, "F": 0.10, "G": 0.10 };
const DEFAULT_LOYALTY = { "New": 0.00, "Existing": -0.05, "Multi-Product": -0.10, "Premier": -0.15, "Switcher": -0.20 };
const DEFAULT_PURPOSE = { "Purchase": 0.00, "Remortgage": -0.10, "BTL": 0.50 };

// ── Live exports — read from localStorage, fallback to defaults ──
export const PRODUCTS_PRICING    = loadDimension("products", DEFAULT_PRODUCTS_PRICING);
export const LTV_ADJUSTMENTS     = loadDimension("ltv", DEFAULT_LTV);
export const CREDIT_PROFILES     = loadDimension("credit", DEFAULT_CREDIT);
export const EMPLOYMENT_ADJUSTMENTS = loadDimension("employment", DEFAULT_EMPLOYMENT);
export const PROPERTY_ADJUSTMENTS   = loadDimension("property", DEFAULT_PROPERTY);
export const EPC_ADJUSTMENTS        = loadDimension("epc", DEFAULT_EPC);
export const LOYALTY_ADJUSTMENTS    = loadDimension("loyalty", DEFAULT_LOYALTY);
export const PURPOSE_ADJUSTMENTS    = loadDimension("purpose", DEFAULT_PURPOSE);

/**
 * Reset all dimensions to defaults (clears localStorage overrides).
 */
export function resetAllDimensions() {
  ["products","ltv","credit","employment","property","epc","loyalty","purpose"].forEach(k => {
    try { localStorage.removeItem(`pricing_${k}`); } catch {}
  });
}

// ─────────────────────────────────────────────
// QUERY FUNCTIONS
// ─────────────────────────────────────────────

function getLTVBand(ltv) {
  return LTV_ADJUSTMENTS.find(b => ltv > b.min && ltv <= b.max) || LTV_ADJUSTMENTS[0];
}

function getCreditProfile(creditId) {
  return CREDIT_PROFILES.find(c => c.id === creditId) || CREDIT_PROFILES[0];
}

/**
 * Get the rate for a specific product + customer profile.
 * Returns { rate, available, breakdown }
 */
export function getRate({
  product,
  ltv = 60,
  credit = "clean",
  employment = "Employed",
  property = "Standard",
  epc = "D",
  loyalty = "New",
  purpose = "Purchase",
}) {
  const prod = PRODUCTS_PRICING[product];
  if (!prod) return { rate: null, available: false, reason: "Product not found" };

  const creditProfile = getCreditProfile(credit);
  const ltvBand = getLTVBand(ltv);

  // Check LTV eligibility
  if (ltv > prod.maxLTV) return { rate: null, available: false, reason: `LTV ${ltv}% exceeds product max ${prod.maxLTV}%` };
  if (creditProfile.maxLTV && ltv > creditProfile.maxLTV) return { rate: null, available: false, reason: `LTV ${ltv}% exceeds ${creditProfile.label} max ${creditProfile.maxLTV}%` };

  const baseRate = prod.baseRate;
  const ltvAdj = ltvBand.adj;
  const creditAdj = creditProfile.adj;
  const empAdj = EMPLOYMENT_ADJUSTMENTS[employment] || 0;
  const propAdj = PROPERTY_ADJUSTMENTS[property] || 0;
  const epcAdj = EPC_ADJUSTMENTS[epc] || 0;
  const loyaltyAdj = LOYALTY_ADJUSTMENTS[loyalty] || 0;
  const purposeAdj = PURPOSE_ADJUSTMENTS[purpose] || 0;

  const totalRate = Math.round((baseRate + ltvAdj + creditAdj + empAdj + propAdj + epcAdj + loyaltyAdj + purposeAdj) * 100) / 100;

  return {
    rate: totalRate,
    available: true,
    breakdown: {
      base: baseRate,
      ltv: { band: ltvBand.band, adj: ltvAdj },
      credit: { profile: creditProfile.label, adj: creditAdj },
      employment: { type: employment, adj: empAdj },
      property: { type: property, adj: propAdj },
      epc: { rating: epc, adj: epcAdj },
      loyalty: { tier: loyalty, adj: loyaltyAdj },
      purpose: { type: purpose, adj: purposeAdj },
    },
    productData: prod,
  };
}

/**
 * Get all eligible products for a customer profile.
 * Returns array of { product, rate, available, breakdown }
 */
export function getEligibleProducts({
  ltv = 60,
  credit = "clean",
  employment = "Employed",
  property = "Standard",
  epc = "D",
  loyalty = "New",
  purpose = "Purchase",
}) {
  return Object.keys(PRODUCTS_PRICING).map(product => ({
    product,
    ...getRate({ product, ltv, credit, employment, property, epc, loyalty, purpose }),
  })).sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return (a.rate || 99) - (b.rate || 99);
  });
}

/**
 * Get a detailed rate breakdown for the UW workstation.
 * Returns an array of { label, value, adj } for display.
 */
export function getRateBreakdown({
  product,
  ltv = 60,
  credit = "clean",
  employment = "Employed",
  property = "Standard",
  epc = "D",
  loyalty = "New",
  purpose = "Purchase",
}) {
  const result = getRate({ product, ltv, credit, employment, property, epc, loyalty, purpose });
  if (!result.available) return { rate: null, available: false, reason: result.reason, items: [] };

  const b = result.breakdown;
  const items = [
    { label: "Base Rate", value: `${b.base}%`, adj: 0, note: product },
  ];
  if (b.ltv.adj !== 0) items.push({ label: `LTV Band (${b.ltv.band})`, value: `+${b.ltv.adj}%`, adj: b.ltv.adj });
  if (b.credit.adj !== 0) items.push({ label: `Credit: ${b.credit.profile}`, value: `+${b.credit.adj}%`, adj: b.credit.adj });
  if (b.employment.adj !== 0) items.push({ label: `Employment: ${b.employment.type}`, value: `+${b.employment.adj}%`, adj: b.employment.adj });
  if (b.property.adj !== 0) items.push({ label: `Property: ${b.property.type}`, value: `+${b.property.adj}%`, adj: b.property.adj });
  if (b.epc.adj !== 0) items.push({ label: `EPC ${b.epc.rating}`, value: `${b.epc.adj > 0 ? "+" : ""}${b.epc.adj}%`, adj: b.epc.adj });
  if (b.loyalty.adj !== 0) items.push({ label: `Loyalty: ${b.loyalty.tier}`, value: `${b.loyalty.adj}%`, adj: b.loyalty.adj });
  if (b.purpose.adj !== 0) items.push({ label: `Purpose: ${b.purpose.type}`, value: `${b.purpose.adj > 0 ? "+" : ""}${b.purpose.adj}%`, adj: b.purpose.adj });

  items.push({ label: "Final Rate", value: `${result.rate}%`, adj: null, isTotal: true });

  return { rate: result.rate, available: true, items };
}

/**
 * Calculate monthly payment.
 */
export function calcMonthlyPayment(principal, annualRate, termYears) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}
