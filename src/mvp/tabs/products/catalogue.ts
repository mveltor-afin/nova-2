/**
 * Catalogue of mortgage products on the Products tab. Shared between
 * the comparison table and the DIP Decisions panel — both surfaces
 * need the human-readable product name, rate, fees, and rate type.
 *
 * Static for the MVP. The rules-engine team will source this from
 * Afin's product service later.
 */

/** How the loan principal is repaid for this product. */
export type InterestType = 'Capital & Interest' | 'Interest Only';

export interface ProductRow {
  id: string;
  code: string;
  name: string;
  rateType: string;
  rate: string;
  /** Numeric form of the headline initial rate, used by pricing mocks. */
  initialRate?: number;
  monthly: string;
  ercs: string;
  fees: string;
  productFee?: number;
  maxLoan: string;
  /** Capital & Interest vs Interest Only. Surfaced as a column on the
   *  comparison table and as a row on each DIP Decision card. */
  interestType: InterestType;
  /** Static eligibility for the MVP — not driven by rules/eligibility.ts. */
  eligibility?: 'eligible' | 'ineligible';
  ineligibleChip?: string;
  ineligibleReason?: string;
  declinedReason?: string;
}

export const PRODUCTS: ProductRow[] = [
  {
    id: 'premier-2yr-fixed',
    code: 'AFIN-PREM-OO-2YF-429',
    name: 'Premier 2-yr fixed',
    rateType: '2yr Fixed',
    rate: '4.29%',
    initialRate: 4.29,
    monthly: '£1,894',
    ercs: '2% / 1%',
    fees: '£999',
    productFee: 999,
    maxLoan: '£425,000',
    interestType: 'Capital & Interest',
    eligibility: 'eligible',
  },
  {
    id: 'standard-5yr-fixed',
    code: 'AFIN-STD-OO-5YF-454',
    name: 'Standard 5-yr fixed',
    rateType: '5yr Fixed',
    rate: '4.54%',
    initialRate: 4.54,
    monthly: '£1,948',
    ercs: '3% / 2% / 1%',
    fees: '£0',
    productFee: 0,
    maxLoan: '£400,000',
    interestType: 'Capital & Interest',
    eligibility: 'eligible',
  },
  {
    id: 'premier-5yr-fixed',
    code: 'AFIN-PREM-OO-5YF-419',
    name: 'Premier 5-yr fixed',
    rateType: '5yr Fixed',
    rate: '4.19%',
    initialRate: 4.19,
    monthly: '—',
    ercs: '2% / 1%',
    fees: '£999',
    productFee: 999,
    maxLoan: '£425,000',
    interestType: 'Interest Only',
    eligibility: 'eligible',
    declinedReason: 'LTV exceeds Premier threshold.',
  },
  {
    id: 'standard-2yr-tracker',
    code: 'AFIN-STD-OO-2YT',
    name: 'Standard 2-yr tracker',
    rateType: 'Tracker',
    rate: '3.94% (BBR + 1.44%)',
    initialRate: 3.94,
    monthly: '—',
    ercs: '0%',
    fees: '£499',
    productFee: 499,
    maxLoan: '£400,000',
    interestType: 'Capital & Interest',
    eligibility: 'eligible',
  },
  {
    id: 'standard-3yr-fixed',
    code: 'AFIN-STD-OO-3YF-444',
    name: 'Standard 3-yr fixed',
    rateType: '3yr Fixed',
    rate: '4.44%',
    initialRate: 4.44,
    monthly: '£1,929',
    ercs: '3% / 2% / 1%',
    fees: '£499',
    productFee: 499,
    maxLoan: '£400,000',
    interestType: 'Capital & Interest',
    eligibility: 'eligible',
  },
  {
    id: 'professional-2yr-fixed',
    code: 'AFIN-PROF-OO-2YF',
    name: 'Professional 2-yr fixed',
    rateType: '2yr Fixed',
    rate: '4.09%',
    initialRate: 4.09,
    monthly: '—',
    ercs: '2% / 1%',
    fees: '£999',
    productFee: 999,
    maxLoan: '£425,000',
    interestType: 'Capital & Interest',
    eligibility: 'ineligible',
    // Chip text intentionally preserved from the v3 proposal — the
    // canonical case carries 75.5% LTV. Rules engine team supplies
    // real verdicts later; for screenshot fidelity we keep "80%" here.
    ineligibleChip: 'LTV exceeds 75% — current LTV 80%',
    ineligibleReason: 'LTV exceeds 75% limit',
  },
];

const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function findProduct(id: string): ProductRow | undefined {
  return PRODUCT_BY_ID.get(id);
}
