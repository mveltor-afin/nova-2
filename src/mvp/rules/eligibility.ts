import type { Case } from '../model/case';

/**
 * `evaluateProducts(case)` — returns one row per product family with
 * a verdict + the reasons behind it.
 *
 * The thresholds below are PLACEHOLDERS for the MVP. Real Afin
 * eligibility is far richer (income multiples, stress rates, source
 * of deposit, EPC bands etc.); this helper only models the rules the
 * Step 2 brief calls out so the Products tab can render meaningful
 * traffic-light verdicts later.
 *
 * Rules (placeholders, all subject to change):
 *  · Owner Occupier (Standard) — eligible up to 95% LTV
 *  · Premier — eligible up to 80% LTV
 *  · Professional — eligible up to 75% LTV AND ProfessionalDetails
 *    populated for at least one applicant
 *  · Buy-to-Let — only when Collateral.propertyUse === 'Buy-to-Let'
 *  · Bridging — only when arrangement.applicationType requires it
 *    (placeholder: never auto-eligible in the MVP, brokers select it
 *    manually for short-term needs)
 */

export type ProductFamily =
  | 'Owner Occupier'
  | 'Buy-to-Let'
  | 'Bridging'
  | 'Premier'
  | 'Professional';

export type EligibilityVerdict = 'eligible' | 'ineligible' | 'review';

export interface ProductEligibility {
  family: ProductFamily;
  verdict: EligibilityVerdict;
  /** Human-readable reasons supporting the verdict. The Products tab
   *  surfaces these as small chips beneath each row. */
  reasons: string[];
}

export function evaluateProducts(caseState: Case): ProductEligibility[] {
  const ltv = computeLTV(caseState);
  const propertyUse = caseState.collaterals[0]?.propertyUse;
  const hasProfessional = caseState.parties.some(
    (p) => p.kind === 'Person' && !!p.person.employment?.professionalDetails,
  );

  return [
    evaluateOwnerOccupier(ltv, propertyUse),
    evaluatePremier(ltv, propertyUse),
    evaluateProfessional(ltv, hasProfessional, propertyUse),
    evaluateBuyToLet(propertyUse),
    evaluateBridging(),
  ];
}

// === Per-family helpers ===

function evaluateOwnerOccupier(
  ltv: number | undefined,
  propertyUse: string | undefined,
): ProductEligibility {
  const reasons: string[] = [];
  if (propertyUse && propertyUse !== 'Owner Occupier') {
    reasons.push(`Property use is ${propertyUse}, not Owner Occupier`);
    return { family: 'Owner Occupier', verdict: 'ineligible', reasons };
  }
  if (ltv === undefined) {
    reasons.push('LTV not yet computed');
    return { family: 'Owner Occupier', verdict: 'review', reasons };
  }
  if (ltv > 95) {
    reasons.push(`LTV ${ltv.toFixed(1)}% exceeds 95% cap`);
    return { family: 'Owner Occupier', verdict: 'ineligible', reasons };
  }
  reasons.push(`LTV ${ltv.toFixed(1)}% within 95% cap`);
  return { family: 'Owner Occupier', verdict: 'eligible', reasons };
}

function evaluatePremier(
  ltv: number | undefined,
  propertyUse: string | undefined,
): ProductEligibility {
  const reasons: string[] = [];
  if (propertyUse && propertyUse !== 'Owner Occupier') {
    reasons.push('Premier is Owner Occupier only');
    return { family: 'Premier', verdict: 'ineligible', reasons };
  }
  if (ltv === undefined) {
    reasons.push('LTV not yet computed');
    return { family: 'Premier', verdict: 'review', reasons };
  }
  if (ltv > 80) {
    reasons.push(`LTV ${ltv.toFixed(1)}% exceeds 80% Premier cap`);
    return { family: 'Premier', verdict: 'ineligible', reasons };
  }
  reasons.push(`LTV ${ltv.toFixed(1)}% within 80% Premier cap`);
  return { family: 'Premier', verdict: 'eligible', reasons };
}

function evaluateProfessional(
  ltv: number | undefined,
  hasProfessional: boolean,
  propertyUse: string | undefined,
): ProductEligibility {
  const reasons: string[] = [];
  if (propertyUse && propertyUse !== 'Owner Occupier') {
    reasons.push('Professional is Owner Occupier only');
    return { family: 'Professional', verdict: 'ineligible', reasons };
  }
  if (!hasProfessional) {
    reasons.push('No applicant has Professional details populated');
    return { family: 'Professional', verdict: 'review', reasons };
  }
  if (ltv === undefined) {
    reasons.push('LTV not yet computed');
    return { family: 'Professional', verdict: 'review', reasons };
  }
  if (ltv > 75) {
    reasons.push(`LTV ${ltv.toFixed(1)}% exceeds 75% Professional cap`);
    return { family: 'Professional', verdict: 'ineligible', reasons };
  }
  reasons.push(`LTV ${ltv.toFixed(1)}% within 75% Professional cap`);
  reasons.push('Qualifying profession on case');
  return { family: 'Professional', verdict: 'eligible', reasons };
}

function evaluateBuyToLet(propertyUse: string | undefined): ProductEligibility {
  const reasons: string[] = [];
  if (propertyUse !== 'Buy-to-Let') {
    reasons.push('Property use is not Buy-to-Let');
    return { family: 'Buy-to-Let', verdict: 'ineligible', reasons };
  }
  reasons.push('Property use is Buy-to-Let');
  return { family: 'Buy-to-Let', verdict: 'eligible', reasons };
}

function evaluateBridging(): ProductEligibility {
  return {
    family: 'Bridging',
    verdict: 'review',
    reasons: ['Bridging is broker-selected; not auto-evaluated in the MVP'],
  };
}

// === Shared helpers ===

function computeLTV(caseState: Case): number | undefined {
  // Step 14b: loan amount is derived (property − deposit). Eligibility
  // checks raw LTV here, not the broker-fee-adjusted effective LTV.
  const value = caseState.collaterals[0]?.estimatedValue;
  if (!value) return undefined;
  const loan = Math.max(0, value - caseState.arrangement.depositAmount);
  if (loan <= 0) return undefined;
  return (loan / value) * 100;
}
