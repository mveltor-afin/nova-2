import type { Case } from '../model/case';
import type { Person } from '../model/person';
import type { Party } from '../model/party';

/**
 * Single source of truth for "should this field be visible right now?"
 *
 * Every conditional field on the workspace flows through this helper.
 * Returns `true` by default — fields are visible unless a rule
 * explicitly hides them. The rule body is a switch on the register
 * field ID so reviewers can find the gate for any field by searching
 * for its ID.
 *
 * Some rules need an applicant context (e.g. A26 previous-address
 * gating depends on *which* applicant). For those the caller passes
 * the relevant `partyUuid` via `context.partyUuid`. Field IDs that
 * don't need a party always return the same answer regardless.
 */
export interface ShouldShowContext {
  /** Which Party the field belongs to, when relevant. */
  partyUuid?: string;
  /** Which Collateral the field belongs to, when relevant. */
  collateralUuid?: string;
}

export function shouldShow(
  fieldId: string,
  caseState: Case,
  context: ShouldShowContext = {},
): boolean {
  switch (fieldId) {
    // === Person · address & dependants ===
    case 'A26': {
      // Previous addresses required if at current address < 3 years.
      const person = findPerson(caseState, context.partyUuid);
      if (!person) return false;
      return yearsSince(person.movedInDate) < 3;
    }
    case 'A28': {
      // Ages of dependants only when number of dependants > 0.
      const person = findPerson(caseState, context.partyUuid);
      if (!person) return false;
      return person.numberOfDependants > 0;
    }
    case 'A29': {
      // Relationship to other applicants — only when there are joint applicants.
      return caseState.parties.length > 1;
    }

    // === Adverse history detail rows ===
    case 'A31':
      return personAdverse(caseState, context.partyUuid)?.hasCCJ ?? false;
    case 'A33':
      return personAdverse(caseState, context.partyUuid)?.hasDefaults ?? false;
    case 'A35':
      return personAdverse(caseState, context.partyUuid)?.hasBankruptcy ?? false;
    case 'A37':
      return personAdverse(caseState, context.partyUuid)?.hasIVAorDMP ?? false;

    // === Employment ===
    case 'A49': {
      // Probation end date — only when employed and isPermanent is true
      // (probation is meaningful only on permanent contracts).
      const e = findPerson(caseState, context.partyUuid)?.employment;
      return e?.employmentStatus === 'Employed' && e?.isPermanent === true;
    }
    case 'A56': {
      // Years trading — only for self-employed / director.
      const e = findPerson(caseState, context.partyUuid)?.employment;
      return e?.employmentStatus === 'Self-Employed' || e?.employmentStatus === 'Director';
    }
    case 'A57':
    case 'A58': {
      // Retirement fields — within 10 years of stated retirement age,
      // OR already retired.
      const person = findPerson(caseState, context.partyUuid);
      const e = person?.employment;
      if (!person) return false;
      if (e?.employmentStatus === 'Retired') return true;
      if (e?.expectedRetirementAge && person.dateOfBirth) {
        const currentAge = yearsSince(person.dateOfBirth);
        return e.expectedRetirementAge - currentAge <= 10;
      }
      return false;
    }
    case 'A59':
    case 'A60':
    case 'A61':
    case 'A62':
    case 'A63':
    case 'A64': {
      // Professional details — only for Professional product family.
      // (The Professional eligibility check itself uses these fields
      // populated, but visibility is gated on the chosen family up-front.)
      return caseState.arrangement.productFamily === 'Professional';
    }

    // === Collateral · leasehold ===
    case 'P5': {
      // Lease years — only when tenure is not Freehold.
      const c = findCollateral(caseState, context.collateralUuid);
      return c?.tenure !== undefined && c.tenure !== 'Freehold';
    }
    case 'P11': {
      // Construction details — only when construction is non-standard.
      const c = findCollateral(caseState, context.collateralUuid);
      return c?.constructionType === 'Non-Standard';
    }
    case 'P14': {
      // Listed grade — only when listed/conservation.
      const c = findCollateral(caseState, context.collateralUuid);
      return c?.isListedOrConservation === true;
    }

    // === Collateral · use & tenancy ===
    case 'P22':
    case 'P23': {
      // Units / HMO licence — only for BTL / Holiday Let.
      const c = findCollateral(caseState, context.collateralUuid);
      return c?.propertyUse === 'Buy-to-Let' || c?.propertyUse === 'Holiday Let';
    }
    case 'P25': {
      // Existing tenancy type — only when currently tenanted.
      const c = findCollateral(caseState, context.collateralUuid);
      return c?.isCurrentlyTenanted === true;
    }

    // === Collateral · existing finance (remortgage only) ===
    case 'P30':
    case 'P31':
    case 'P32':
    case 'P33':
      return caseState.arrangement.applicationType === 'Remortgage';

    // === Arrangement · purchase vs remortgage ===
    case 'P17':
      return caseState.arrangement.applicationType === 'Purchase';

    // === Arrangement · part-and-part ===
    case 'M15':
    case 'M16':
      return caseState.arrangement.repaymentType === 'Part-and-Part';

    // === Deposit · gift letter ===
    case 'D4':
      return caseState.arrangement.depositSources.includes('Gift');

    default:
      return true;
  }
}

// === Internal helpers ===

function findPerson(caseState: Case, partyUuid?: string): Person | undefined {
  const party: Party | undefined = partyUuid
    ? caseState.parties.find((p) => p.uuid === partyUuid)
    : caseState.parties.find((p) => p.isPrimary);
  if (!party || party.kind !== 'Person') return undefined;
  return party.person;
}

function personAdverse(caseState: Case, partyUuid?: string) {
  return findPerson(caseState, partyUuid)?.adverseHistory;
}

function findCollateral(caseState: Case, collateralUuid?: string) {
  return collateralUuid
    ? caseState.collaterals.find((c) => c.uuid === collateralUuid)
    : caseState.collaterals[0];
}

function yearsSince(dateString: string): number {
  const then = new Date(dateString).getTime();
  const now = Date.now();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now - then) / (365.25 * 24 * 60 * 60 * 1000);
}
