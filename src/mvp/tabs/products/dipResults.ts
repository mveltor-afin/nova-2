/**
 * Types + helpers for the DIP Decisions panel. A `DIPResult` is
 * persisted on `case.dipResults`; freshness is **derived** by
 * comparing each result's `inputsSnapshot` to the live arrangement —
 * never stored on the result itself.
 */

import type { DateTimeString } from '../../model/primitives';
import type { Case } from '../../model/case';
import { findProduct, PRODUCTS } from './catalogue';

export type DIPStatus = 'approved' | 'declined' | 'referred';

export type FeeHandling = 'capitalise' | 'upfront';

/**
 * What constitutes a "DIP-relevant" input change. Step 14b reshapes
 * this: loan amount + raw LTV are gone (both are derived); the
 * canonical inputs are propertyValue + depositAmount + termYears +
 * brokerFee + the two fee-handling choices. Six fields total.
 *
 * Effective loan and effective LTV are derived per render, never
 * stored on the snapshot — `isStale` compares the six stored inputs.
 */
export interface DIPInputs {
  propertyValue: number;
  depositAmount: number;
  termYears: number;
  brokerFee: number;
  productFeeHandling: FeeHandling;
  brokerFeeHandling: FeeHandling;
}

export interface DIPResult {
  id: string;
  productId: string;
  status: DIPStatus;
  decidedAt: DateTimeString;
  inputsSnapshot: DIPInputs;
  pricing?: {
    initialRatePct: number;
    revertRatePct: number;
    monthlyPayment: number;
    arrangementFee: number;
    totalCostOverDeal: number;
    ercSummary: string;
  };
  declineReason?: string;
  referralReason?: string;
}

/** Strict equality on all six inputs in scope. */
export function isStale(result: DIPResult, current: DIPInputs): boolean {
  const s = result.inputsSnapshot;
  return (
    s.propertyValue !== current.propertyValue ||
    s.depositAmount !== current.depositAmount ||
    s.termYears !== current.termYears ||
    s.brokerFee !== current.brokerFee ||
    s.productFeeHandling !== current.productFeeHandling ||
    s.brokerFeeHandling !== current.brokerFeeHandling
  );
}

/** Pull the six live DIP-relevant inputs out of the case. */
export function readInputs(c: Case): DIPInputs {
  const arrangement = c.arrangement;
  return {
    propertyValue: c.collaterals[0]?.estimatedValue ?? 0,
    depositAmount: arrangement.depositAmount,
    termYears: arrangement.loanTermYears,
    brokerFee: arrangement.brokerFee,
    productFeeHandling: arrangement.productFeeHandling,
    brokerFeeHandling: arrangement.brokerFeeHandling,
  };
}

/**
 * Sort order: approved-fresh → approved-stale → referred → declined.
 * Within approved-fresh, ascending total cost over deal period.
 */
export function sortDecisions(
  results: DIPResult[],
  current: DIPInputs,
): DIPResult[] {
  const decorate = results.map((r) => ({
    r,
    stale: isStale(r, current),
  }));
  return decorate
    .sort((a, b) => bucket(a) - bucket(b) || tieBreak(a.r, b.r))
    .map((d) => d.r);

  function bucket(d: { r: DIPResult; stale: boolean }): number {
    if (d.r.status === 'approved' && !d.stale) return 0;
    if (d.r.status === 'approved' && d.stale) return 1;
    if (d.r.status === 'referred') return 2;
    return 3; // declined
  }
  function tieBreak(a: DIPResult, b: DIPResult): number {
    const ac = a.pricing?.totalCostOverDeal ?? Number.POSITIVE_INFINITY;
    const bc = b.pricing?.totalCostOverDeal ?? Number.POSITIVE_INFINITY;
    return ac - bc;
  }
}

// ============================================================
// Outcome strategy — drives the next DIP run from the dev panel.
// 'auto' rotates Approve → Decline → Refer → Approve…
// ============================================================

export type DIPOutcomeStrategy = 'auto' | 'approved' | 'declined' | 'referred';

const AUTO_CYCLE: DIPStatus[] = ['approved', 'declined', 'referred'];

export function resolveOutcome(
  strategy: DIPOutcomeStrategy,
  autoIndex: number,
): DIPStatus {
  if (strategy === 'auto') return AUTO_CYCLE[autoIndex % AUTO_CYCLE.length];
  return strategy;
}

// ============================================================
// Mock pricing — derives a plausible quote from product + inputs
// ============================================================

export function buildPricing(
  productInitialRate: number,
  productFee: number,
  inputs: DIPInputs,
): NonNullable<DIPResult['pricing']> {
  // Step 14b: loan amount is derived from the snapshot's property +
  // deposit. Clamp to zero so a deposit ≥ property doesn't break
  // the amortisation formula.
  const loanAmount = Math.max(0, inputs.propertyValue - inputs.depositAmount);
  const monthlyRate = productInitialRate / 100 / 12;
  const n = inputs.termYears * 12;
  const monthly =
    monthlyRate === 0
      ? loanAmount / n
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1);
  const dealYears = guessDealYears(productInitialRate);
  const totalCost = monthly * 12 * dealYears + productFee;
  return {
    initialRatePct: productInitialRate,
    revertRatePct: 7.99,
    monthlyPayment: Math.round(monthly),
    arrangementFee: productFee,
    totalCostOverDeal: Math.round(totalCost),
    ercSummary: ercSummary(dealYears),
  };
}

function guessDealYears(_rate: number): number {
  // Could be smarter — but the rate-type label lives on the catalogue,
  // not here. Default to 2 years; callers can override via the deal
  // term embedded in the product if needed.
  return 2;
}

function ercSummary(dealYears: number): string {
  if (dealYears >= 5) return '3% / 2% / 1.5% / 1% / 0.5%';
  if (dealYears >= 3) return '3% / 2% / 1%';
  return '2% / 1%';
}

// ============================================================
// Effective selection — derived, not stored.
// `case.arrangement.selectedProductCode` is the broker's stated
// preference; the *effective* selection is that code only when it
// points at a fresh-approved DIP result. This lets staleness
// transparently "clear" the selection (and revert "restores" it)
// without ever dropping the stored value.
// ============================================================

export function effectiveSelectedCode(c: Case): string | undefined {
  const code = c.arrangement.selectedProductCode;
  if (!code) return undefined;
  const productId = productIdFromCode(code);
  if (!productId) return undefined;
  const result = c.dipResults.find((r) => r.productId === productId);
  if (!result) return undefined;
  if (result.status !== 'approved') return undefined;
  if (isStale(result, readInputs(c))) return undefined;
  return code;
}

export function productIdFromCode(code: string): string | undefined {
  for (const p of PRODUCTS) {
    if (p.code === code) return p.id;
  }
  return undefined;
}

/** Helper used by `setSelectedProduct` to gate against stale / non-
 *  approved targets. Returns true when the code currently points at
 *  a fresh-approved DIP result. */
export function isFreshApproved(c: Case, code: string): boolean {
  const productId = productIdFromCode(code);
  if (!productId) return false;
  const result = c.dipResults.find((r) => r.productId === productId);
  if (!result) return false;
  if (result.status !== 'approved') return false;
  return !isStale(result, readInputs(c));
}

// `findProduct` is re-exported so consumers don't need to import from two modules.
export { findProduct };
