/**
 * Single source of truth for "is this register field populated?"
 *
 * Used by the manual-entry groups on the Quick input tab to compute
 * each group's drain count, and (later) by completeness rails on the
 * Applicants / Security tabs.
 */

import type { Case } from '../model/case';
import type { Person } from '../model/person';
import type { Collateral } from '../model/collateral';
import type { Arrangement } from '../model/arrangement';
import type { ExpenditureCategory } from '../model/financial';

export function isFieldPopulated(
  caseState: Case,
  fieldId: string,
  partyUuid?: string,
): boolean {
  const value = readField(caseState, fieldId, partyUuid);
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function readField(
  caseState: Case,
  fieldId: string,
  partyUuid?: string,
): unknown {
  if (fieldId.startsWith('A') || fieldId === 'C4' || fieldId === 'C5') {
    const party = resolveParty(caseState, partyUuid);
    if (!party) return undefined;
    return readPersonField(party, fieldId);
  }
  if (fieldId.startsWith('P')) {
    const collateral = caseState.collaterals[0];
    if (!collateral) return undefined;
    return readCollateralField(collateral, fieldId);
  }
  if (fieldId.startsWith('M') || fieldId.startsWith('D')) {
    // Step 14b: M6 loan amount is derived from property value + deposit.
    if (fieldId === 'M6') {
      const propertyValue = caseState.collaterals[0]?.estimatedValue ?? 0;
      return Math.max(0, propertyValue - caseState.arrangement.depositAmount);
    }
    return readArrangementField(caseState.arrangement, fieldId);
  }
  if (fieldId.startsWith('E')) {
    return readExpenditureField(caseState, fieldId);
  }
  if (fieldId.startsWith('T')) {
    return readThirdPartyField(caseState, fieldId);
  }
  return undefined;
}

function resolveParty(caseState: Case, partyUuid?: string): Person | undefined {
  const party = partyUuid
    ? caseState.parties.find((p) => p.uuid === partyUuid)
    : caseState.parties.find((p) => p.isPrimary);
  if (!party || party.kind !== 'Person') return undefined;
  return party.person;
}

function readPersonField(p: Person, fieldId: string): unknown {
  switch (fieldId) {
    case 'A1': return p.title;
    case 'A2': return p.firstName;
    case 'A3': return p.middleNames;
    case 'A4': return p.lastName;
    case 'A5': return p.previousNames?.[0];
    case 'A6': return p.dateOfBirth;
    case 'A8': return p.countryOfBirth;
    case 'A10': return p.maritalStatus;
    case 'A11': return p.nationality;
    case 'A13': return p.countryOfResidence;
    case 'A14': return p.ukResidencyStatus;
    case 'A15': return p.niNumber;
    case 'A16': return p.passportNumber;
    case 'A17': return p.passportExpiry;
    case 'A19': return p.mobile;
    case 'A21': return p.email;
    case 'A23': return p.currentAddress?.line1;
    case 'A24': return p.residentialStatus;
    case 'A25': return p.movedInDate;
    case 'A27': return p.numberOfDependants;
    case 'A41': return p.employment?.employmentStatus;
    case 'A42': return p.employment?.employerName;
    case 'A43': return p.employment?.employerAddress?.line1;
    case 'A44': return p.employment?.employerPhone;
    case 'A45': return p.employment?.industry;
    case 'A46': return p.employment?.jobTitle;
    case 'A47': return p.employment?.startDate;
    case 'A51': return p.employment?.basicIncome;
    case 'A52': return p.employment?.basicIncomeFrequency;
    case 'A53': return p.employment?.variableIncome;
    case 'A54': return p.employment?.variableIncomeGuaranteed;
    case 'A57': return p.employment?.expectedRetirementAge;
    case 'A58': return p.employment?.isWithinTenYearsOfRetirement;
    case 'A59': return p.employment?.professionalDetails?.category;
    case 'A60': return p.employment?.professionalDetails?.professionalBody;
    case 'A61': return p.employment?.professionalDetails?.membershipNumber;
    case 'A62': return p.employment?.professionalDetails?.qualificationDate;
    case 'A30': return p.adverseHistory.hasCCJ;
    case 'A32': return p.adverseHistory.hasDefaults;
    case 'A34': return p.adverseHistory.hasBankruptcy;
    case 'A36': return p.adverseHistory.hasIVAorDMP;
    case 'A38': return p.adverseHistory.hasRepossession;
    case 'A39': return p.adverseHistory.hasMortgageArrears;
    case 'A40': return p.adverseHistory.paydayLoansLast12Months;
    case 'C4': return p.adverseHistory.creditSearchConsent;
    case 'C5': return p.adverseHistory.adverseSharingConsent;
    default: return undefined;
  }
}

function readCollateralField(c: Collateral, fieldId: string): unknown {
  switch (fieldId) {
    case 'P1': return c.address.line1;
    case 'P4': return c.tenure;
    case 'P5': return c.leaseYearsRemaining;
    case 'P6': return c.propertyType;
    case 'P7': return c.isNewBuild;
    case 'P9': return c.bedrooms;
    case 'P10': return c.constructionType;
    case 'P12': return c.floodRisk;
    case 'P16': return c.estimatedValue;
    case 'P17': return c.purchasePrice;
    case 'P21': return c.propertyUse;
    case 'P26': return c.epcRating;
    default: return undefined;
  }
}

function readArrangementField(a: Arrangement, fieldId: string): unknown {
  switch (fieldId) {
    case 'M1': return a.arrangementReference;
    case 'M2': return a.applicationType;
    case 'M3': return a.productFamily;
    case 'M5': return a.repaymentType;
    // M6 loan amount is handled by `readField` before dispatching here
    // — derived from property value + deposit (Step 14b).
    case 'M7': return a.loanTermYears;
    case 'M9': return a.rateType;
    case 'M10': return a.initialRate;
    case 'M11': return a.ltvPercent;
    case 'M17': return a.brokerFee > 0 ? a.brokerFee : undefined;
    case 'M18': return a.productFeeHandling;
    case 'M19': return a.brokerFeeHandling;
    case 'D1': return a.depositAmount;
    case 'D2': return a.depositSources?.length;
    case 'D4': return a.giftLetterHeld;
    default: return undefined;
  }
}

const EXPENDITURE_FIELD_TO_CATEGORY: Record<string, ExpenditureCategory> = {
  E1: 'CouncilTax',
  E2: 'Utilities',
  E3: 'Insurance',
  E4: 'Childcare',
  E5: 'SchoolFees',
  E6: 'Travel',
  E7: 'Food',
  E8: 'Communications',
  E9: 'Subscriptions',
  E10: 'PensionContributions',
  E11: 'MaintenancePaid',
  E12: 'CharitableGiving',
  E13: 'GroundRentServiceCharge',
  E14: 'OtherExpenditure',
};

function readExpenditureField(c: Case, fieldId: string): unknown {
  const cat = EXPENDITURE_FIELD_TO_CATEGORY[fieldId];
  if (!cat) return undefined;
  const item = c.financialItems.find(
    (i) => i.kind === 'Expenditure' && i.category === cat,
  );
  return item ? (item as { amount: number }).amount : undefined;
}

const THIRD_PARTY_FIELD_TO_ROLE: Record<string, string> = {
  T1: 'Solicitor',
  T2: 'Surveyor',
  T3: 'EstateAgent',
  T4: 'Accountant',
  T5: 'Packager',
  T6: 'LenderContact',
  T7: 'InsuranceProvider',
  T8: 'IFA',
  T9: 'MortgageBroker',
  T10: 'Vendor',
  T11: 'LettingAgent',
  T12: 'PropertyManager',
};

function readThirdPartyField(c: Case, fieldId: string): unknown {
  const role = THIRD_PARTY_FIELD_TO_ROLE[fieldId];
  if (!role) return undefined;
  return c.thirdParties.find((tp) => tp.role === role)?.name;
}

/** Group-level summary used by the Quick input drain chip. */
export interface GroupSummary {
  populated: number;
  total: number;
  /** 'empty' | 'partial' | 'complete'. */
  band: 'empty' | 'partial' | 'complete';
}

export function countGroup(
  caseState: Case,
  fields: { fieldId: string; partyScoped?: boolean }[],
): GroupSummary {
  const persons = caseState.parties.filter((p) => p.kind === 'Person');
  let populated = 0;
  let total = 0;
  for (const f of fields) {
    if (f.partyScoped) {
      for (const party of persons) {
        total++;
        if (isFieldPopulated(caseState, f.fieldId, party.uuid)) populated++;
      }
    } else {
      total++;
      if (isFieldPopulated(caseState, f.fieldId)) populated++;
    }
  }
  const band: GroupSummary['band'] =
    populated === 0 ? 'empty' : populated === total ? 'complete' : 'partial';
  return { populated, total, band };
}
