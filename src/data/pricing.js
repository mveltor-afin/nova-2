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

// ─────────────────────────────────────────────
// BUCKET-AWARE ELIGIBILITY
//
// Reads Product Buckets from localStorage and returns
// eligible products with rates, enforcing bucket-level criteria.
// ─────────────────────────────────────────────

// Fallback defaults if localStorage is empty (mirrors ProductBuckets DEFAULT_BUCKETS)
const FALLBACK_LENDING_BUCKETS = [
  { name:"Prime", color:"#059669", maxLTV:75,
    acceptedCreditProfiles:["clean","near_prime"], acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","New Build","Ex-Local Authority"], acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[
      { name:"Standard", conditions:{credit:["clean"],employment:["Employed"]}, adjustmentType:"flat", flatAdj:0 },
      { name:"Self-Employed", conditions:{employment:["Self-Employed","Contractor"]}, adjustmentType:"flat", flatAdj:0.15 },
      { name:"Near Prime", conditions:{credit:["near_prime"]}, adjustmentType:"flat", flatAdj:0.25 },
    ],
    criteria:{ loanSize:{min:"£25,000",max:"£1,000,000"}, age:{min:21,maxAtEnd:75}, incomeMultiple:"4.49x" },
    fees:{ productFee:"£1,495", reversion:"BBR + 3.99%", termRange:"2-40 years" },
    products:[
      { type:"2-Year Fixed", code:"P2F", erc:"3%, 2%", rates:{"≤60%":4.19,"60-75%":4.49} },
      { type:"5-Year Fixed", code:"P5F", erc:"5%, 4%, 3%, 2%, 1%", rates:{"≤60%":4.59,"60-75%":4.89} },
      { type:"2-Year Tracker", code:"PTR", erc:"No ERCs", rates:{"≤60%":4.84,"60-75%":5.14} },
    ],
  },
  { name:"Prime High LTV", color:"#31B897", maxLTV:95,
    acceptedCreditProfiles:["clean","near_prime"], acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","New Build","Ex-Local Authority"], acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[{ name:"Standard", conditions:{}, adjustmentType:"flat", flatAdj:0 }],
    criteria:{ loanSize:{min:"£25,000",max:"£500,000"}, age:{min:21,maxAtEnd:70}, incomeMultiple:"4.49x" },
    fees:{ productFee:"£1,495", reversion:"BBR + 3.99%", termRange:"2-40 years" },
    products:[
      { type:"2-Year Fixed", code:"H2F", erc:"4%, 3%", rates:{"≤60%":4.49,"60-75%":4.79,"75-85%":5.29,"85-90%":5.59,"90-95%":5.99} },
      { type:"5-Year Fixed", code:"H5F", erc:"5%, 4%, 3%, 2%, 1%", rates:{"≤60%":4.89,"60-75%":5.19,"75-85%":5.69,"85-90%":5.99,"90-95%":6.39} },
    ],
  },
  { name:"Professional", color:"#3B82F6", maxLTV:90,
    acceptedCreditProfiles:["clean","near_prime","light_adverse"], acceptedEmployments:["Employed","Self-Employed","Contractor","Retired"],
    acceptedProperties:["Standard","New Build"], acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[{ name:"Standard", conditions:{}, adjustmentType:"flat", flatAdj:0 }],
    criteria:{ loanSize:{min:"£25,000",max:"£2,000,000"}, age:{min:21,maxAtEnd:80}, incomeMultiple:"5.50x" },
    fees:{ productFee:"£1,495", reversion:"BBR + 2.99%", termRange:"2-40 years" },
    products:[
      { type:"2-Year Fixed", code:"D2F", erc:"2%, 1%", rates:{"≤60%":3.69,"60-75%":3.99,"75-85%":4.49,"85-90%":4.79} },
      { type:"5-Year Fixed", code:"D5F", erc:"5%, 4%, 3%, 2%, 1%", rates:{"≤60%":4.09,"60-75%":4.39,"75-85%":4.89,"85-90%":5.19} },
    ],
  },
  { name:"Buy-to-Let", color:"#F59E0B", maxLTV:75,
    acceptedCreditProfiles:["clean","near_prime","light_adverse","adverse","heavy_adverse"],
    acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","New Build","Ex-Local Authority","High-Rise (>6 floors)"],
    acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[
      { name:"Standard", conditions:{}, adjustmentType:"flat", flatAdj:0 },
      { name:"Adverse Credit", conditions:{credit:["adverse","heavy_adverse"]}, adjustmentType:"flat", flatAdj:0.50 },
      { name:"Portfolio (4+)", conditions:{}, adjustmentType:"flat", flatAdj:0.15 },
      { name:"SPV/Ltd", conditions:{}, adjustmentType:"flat", flatAdj:0.10 },
    ],
    criteria:{ loanSize:{min:"£25,000",max:"£2,000,000"}, age:{min:21,maxAtEnd:85}, incomeMultiple:"N/A — ICR 145%" },
    fees:{ productFee:"£1,995", reversion:"BBR + 4.49%", termRange:"5-25 years" },
    products:[
      { type:"2-Year Fixed", code:"B2F", erc:"3%, 2%", rates:{"≤60%":5.19,"60-75%":5.49} },
      { type:"5-Year Fixed", code:"B5F", erc:"5%, 4%, 3%, 2%, 1%", rates:{"≤60%":5.49,"60-75%":5.79} },
      { type:"Tracker", code:"BTR", erc:"No ERCs", rates:{"≤60%":5.49,"60-75%":5.79} },
    ],
  },
  { name:"Commercial Mortgage", color:"#6366F1", maxLTV:75,
    acceptedCreditProfiles:["clean","near_prime"],
    acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","Non-Standard","New Build"],
    acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[
      { name:"Standard", conditions:{}, adjustmentType:"flat", flatAdj:0 },
      { name:"Owner-Occupied", conditions:{}, adjustmentType:"flat", flatAdj:-0.15 },
    ],
    criteria:{ loanSize:{min:"£50,000",max:"£5,000,000"}, age:{min:21,maxAtEnd:75}, incomeMultiple:"Bespoke — cash flow assessed" },
    fees:{ productFee:"£2,495", reversion:"BBR + 4.99%", termRange:"3-25 years" },
    products:[
      { type:"2-Year Fixed", code:"CM2F", erc:"3%, 2%", rates:{"≤60%":5.49,"60-75%":5.99} },
      { type:"5-Year Fixed", code:"CM5F", erc:"5%, 4%, 3%, 2%, 1%", rates:{"≤60%":5.79,"60-75%":6.29} },
      { type:"Tracker", code:"CMTR", erc:"No ERCs", rates:{"≤60%":5.99,"60-75%":6.49} },
    ],
  },
  { name:"Bridging Finance", color:"#DC2626", maxLTV:75,
    acceptedCreditProfiles:["clean","near_prime","light_adverse","adverse"],
    acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","Non-Standard","New Build","Ex-Local Authority"],
    acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[
      { name:"Standard", conditions:{}, adjustmentType:"flat", flatAdj:0 },
      { name:"Adverse", conditions:{credit:["adverse"]}, adjustmentType:"flat", flatAdj:0.25 },
    ],
    criteria:{ loanSize:{min:"£50,000",max:"£5,000,000"}, age:{min:21,maxAtEnd:85}, incomeMultiple:"Exit strategy assessed" },
    fees:{ productFee:"1.5% arrangement fee", reversion:"N/A — short term", termRange:"3-18 months" },
    products:[
      { type:"Regulated Bridge", code:"BRG-R", erc:"1 month interest", rates:{"≤60%":7.50,"60-75%":8.40} },
      { type:"Unregulated Bridge", code:"BRG-U", erc:"1 month interest", rates:{"≤60%":8.40,"60-75%":9.60} },
    ],
  },
  { name:"Development Finance", color:"#0EA5E9", maxLTV:70,
    acceptedCreditProfiles:["clean","near_prime"],
    acceptedEmployments:["Employed","Self-Employed","Contractor"],
    acceptedProperties:["Standard","New Build"],
    acceptedEpc:["A","B","C","D","E","F","G"],
    tiers:[
      { name:"Experienced Developer", conditions:{}, adjustmentType:"flat", flatAdj:-0.20 },
    ],
    criteria:{ loanSize:{min:"£250,000",max:"£10,000,000"}, age:{min:21,maxAtEnd:75}, incomeMultiple:"GDV-based — max 65% LTGDV" },
    fees:{ productFee:"2% arrangement fee", reversion:"N/A — project term", termRange:"6-24 months" },
    products:[
      { type:"Development Facility", code:"DEV-F", erc:"None — exit on sale", rates:{"≤60%":7.20,"60-75%":8.40} },
      { type:"Mezzanine Finance", code:"DEV-M", erc:"None — exit on sale", rates:{"≤60%":10.80,"60-75%":12.00} },
    ],
  },
];

function loadBuckets() {
  try {
    const s = localStorage.getItem("product_buckets");
    if (s) return JSON.parse(s);
    // Seed localStorage with defaults so all screens can read them
    try { localStorage.setItem("product_buckets", JSON.stringify(FALLBACK_LENDING_BUCKETS)); } catch {}
    return FALLBACK_LENDING_BUCKETS;
  } catch { return FALLBACK_LENDING_BUCKETS; }
}

const LTV_BAND_MAX = { "≤60%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };

function ltvToBand(ltv) {
  if (ltv <= 60) return "≤60%";
  if (ltv <= 75) return "60-75%";
  if (ltv <= 85) return "75-85%";
  if (ltv <= 90) return "85-90%";
  return "90-95%";
}

/**
 * Get eligible products from product buckets.
 * Enforces: maxLTV, acceptedCreditProfiles, acceptedEmployments,
 * acceptedProperties, acceptedEpc, loan size limits, age limits.
 *
 * Returns array of { bucket, product, rate, available, reason, erc, tier, tierAdj }
 */
export function getBucketEligibleProducts({
  ltv = 60,
  credit = "clean",
  employment = "Employed",
  property = "Standard",
  epc = "D",
  loanAmount = 0,
  age = 0,
  termYears = 25,
}) {
  const buckets = loadBuckets();
  if (!buckets || buckets.length === 0) return [];

  const results = [];
  const band = ltvToBand(ltv);

  for (const bucket of buckets) {
    // Check bucket-level LTV
    if (ltv > (bucket.maxLTV || 75)) {
      bucket.products?.forEach(p => results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
        rate: null, available: false, reason: `LTV ${ltv.toFixed(0)}% exceeds ${bucket.name} max ${bucket.maxLTV}%`,
        erc: p.erc,
      }));
      continue;
    }

    // Check accepted credit profile
    if (bucket.acceptedCreditProfiles && !bucket.acceptedCreditProfiles.includes(credit)) {
      const profile = CREDIT_PROFILES.find(c => c.id === credit);
      bucket.products?.forEach(p => results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
        rate: null, available: false, reason: `${profile?.label || credit} not accepted by ${bucket.name}`,
        erc: p.erc,
      }));
      continue;
    }

    // Check accepted employment
    if (bucket.acceptedEmployments && !bucket.acceptedEmployments.includes(employment)) {
      bucket.products?.forEach(p => results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
        rate: null, available: false, reason: `${employment} not accepted by ${bucket.name}`,
        erc: p.erc,
      }));
      continue;
    }

    // Check accepted property type
    if (bucket.acceptedProperties && !bucket.acceptedProperties.includes(property)) {
      bucket.products?.forEach(p => results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
        rate: null, available: false, reason: `${property} not accepted by ${bucket.name}`,
        erc: p.erc,
      }));
      continue;
    }

    // Check accepted EPC
    if (bucket.acceptedEpc && !bucket.acceptedEpc.includes(epc)) {
      bucket.products?.forEach(p => results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
        rate: null, available: false, reason: `EPC ${epc} not accepted by ${bucket.name}`,
        erc: p.erc,
      }));
      continue;
    }

    // Check loan size limits
    if (loanAmount > 0 && bucket.criteria?.loanSize) {
      const parseAmount = (s) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;
      const minLoan = parseAmount(bucket.criteria.loanSize.min);
      const maxLoan = parseAmount(bucket.criteria.loanSize.max);
      if (minLoan && loanAmount < minLoan) {
        bucket.products?.forEach(p => results.push({
          bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
          rate: null, available: false, reason: `Loan £${loanAmount.toLocaleString()} below ${bucket.name} minimum £${minLoan.toLocaleString()}`,
          erc: p.erc,
        }));
        continue;
      }
      if (maxLoan && loanAmount > maxLoan) {
        bucket.products?.forEach(p => results.push({
          bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
          rate: null, available: false, reason: `Loan £${loanAmount.toLocaleString()} exceeds ${bucket.name} maximum £${maxLoan.toLocaleString()}`,
          erc: p.erc,
        }));
        continue;
      }
    }

    // Check age limits
    if (age > 0 && bucket.criteria?.age) {
      if (age < (bucket.criteria.age.min || 0)) {
        bucket.products?.forEach(p => results.push({
          bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
          rate: null, available: false, reason: `Age ${age} below ${bucket.name} minimum ${bucket.criteria.age.min}`,
          erc: p.erc,
        }));
        continue;
      }
      const ageAtEnd = age + termYears;
      if (ageAtEnd > (bucket.criteria.age.maxAtEnd || 999)) {
        bucket.products?.forEach(p => results.push({
          bucket: bucket.name, bucketColor: bucket.color, product: p.type, code: p.code,
          rate: null, available: false, reason: `Age ${ageAtEnd} at end of term exceeds ${bucket.name} max ${bucket.criteria.age.maxAtEnd}`,
          erc: p.erc,
        }));
        continue;
      }
    }

    // Bucket is eligible — find matching tier and calculate rates for each product
    const tiers = bucket.tiers || [];
    let matchedTier = null;
    let matchedTierIdx = -1;
    for (let tIdx = tiers.length - 1; tIdx >= 0; tIdx--) {
      const tier = tiers[tIdx];
      const conds = tier.conditions || {};
      let match = true;
      if (conds.credit?.length && !conds.credit.includes(credit)) match = false;
      if (conds.employment?.length && !conds.employment.includes(employment)) match = false;
      if (conds.property?.length && !conds.property.includes(property)) match = false;
      if (conds.epc?.length && !conds.epc.includes(epc)) match = false;
      if (match) { matchedTier = tier; matchedTierIdx = tIdx; break; }
    }

    for (const prod of (bucket.products || [])) {
      const baseRate = prod.rates?.[band];
      if (baseRate == null) {
        results.push({
          bucket: bucket.name, bucketColor: bucket.color, product: prod.type, code: prod.code,
          rate: null, available: false, reason: `${prod.type} not offered at ${band} LTV`,
          erc: prod.erc,
        });
        continue;
      }

      let tierAdj = 0;
      if (matchedTier) {
        if (matchedTier.adjustmentType === "flat") {
          tierAdj = parseFloat(matchedTier.flatAdj) || 0;
        } else {
          tierAdj = parseFloat(matchedTier.gridAdj?.[prod.type]?.[band]) || parseFloat(matchedTier.flatAdj) || 0;
        }
      }

      const finalRate = Math.round((baseRate + tierAdj) * 100) / 100;
      results.push({
        bucket: bucket.name, bucketColor: bucket.color, product: prod.type, code: prod.code,
        rate: finalRate, available: true, erc: prod.erc,
        tier: matchedTier?.name || "Base", tierAdj,
        baseRate, maxLTV: bucket.maxLTV,
        incomeMultiple: bucket.criteria?.incomeMultiple,
        fees: bucket.fees,
      });
    }
  }

  // Sort: available first, then by rate
  return results.sort((a, b) => {
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    return (a.rate || 99) - (b.rate || 99);
  });
}
