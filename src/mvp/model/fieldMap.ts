/**
 * Register-ID → model-path setters per entity type. Inverse of
 * `rules/fieldStatus.ts` which reads. The store's `setManualField`
 * dispatches through this map immutably (spread all the way down).
 *
 * Compound IDs (e.g. "P1.line1") split a single register row into
 * separate UI inputs that each write a sub-property. Drain counts
 * (`fieldStatus.readField`) still key off the parent register ID.
 */

import type { Person } from './person';
import type { Employment } from './employment';
import type { Collateral } from './collateral';
import type { Arrangement } from './arrangement';
import type { ThirdParty } from './thirdparty';

export type EntityRef =
  | { entityType: 'Person'; entityId: string }
  | { entityType: 'Collateral'; entityId: string }
  | { entityType: 'Arrangement'; entityId: string }
  | { entityType: 'ThirdParty'; entityId: string }
  | { entityType: 'Case'; entityId: string };

type FieldSetter<E> = (entity: E, value: unknown) => E;

// ============================================================
// Person — A1–A29 (excluding Address-on-self), plus nested
// Employment via A41–A56. Setters guarantee a populated
// employment record when writing employment fields against a
// person who didn't have one.
// ============================================================

const DEFAULT_EMPLOYMENT: Employment = {
  employmentStatus: 'Employed',
};

function withEmployment(
  p: Person,
  patch: Partial<Employment>,
): Person {
  return {
    ...p,
    employment: { ...(p.employment ?? DEFAULT_EMPLOYMENT), ...patch },
  };
}

const personFieldMap: Record<string, FieldSetter<Person>> = {
  // Identity
  A1: (p, v) => ({ ...p, title: v as Person['title'] }),
  A2: (p, v) => ({ ...p, firstName: String(v ?? '') }),
  A3: (p, v) => ({ ...p, middleNames: String(v ?? '') || undefined }),
  A4: (p, v) => ({ ...p, lastName: String(v ?? '') }),
  A5: (p, v) => {
    const trimmed = String(v ?? '').trim();
    return { ...p, previousNames: trimmed ? [trimmed] : undefined };
  },
  A6: (p, v) => ({ ...p, dateOfBirth: String(v ?? '') }),
  A7: (p, v) => ({ ...p, placeOfBirth: String(v ?? '') || undefined }),
  A8: (p, v) => ({ ...p, countryOfBirth: String(v ?? '') || undefined }),
  A9: (p, v) => ({ ...p, gender: v as Person['gender'] }),
  A10: (p, v) => ({ ...p, maritalStatus: v as Person['maritalStatus'] }),
  A11: (p, v) => ({ ...p, nationality: String(v ?? '') }),
  A12: (p, v) => ({ ...p, secondNationality: String(v ?? '') || undefined }),
  A13: (p, v) => ({ ...p, countryOfResidence: String(v ?? '') }),
  A14: (p, v) => ({ ...p, ukResidencyStatus: v as Person['ukResidencyStatus'] }),
  A15: (p, v) => ({ ...p, niNumber: String(v ?? '') || undefined }),
  A16: (p, v) => ({ ...p, passportNumber: String(v ?? '') || undefined }),
  A17: (p, v) => ({ ...p, passportExpiry: String(v ?? '') || undefined }),
  A19: (p, v) => ({ ...p, mobile: String(v ?? '') }),
  A20: (p, v) => ({ ...p, landline: String(v ?? '') || undefined }),
  A21: (p, v) => ({ ...p, email: String(v ?? '') }),
  A22: (p, v) =>
    ({ ...p, preferredContactMethod: v as Person['preferredContactMethod'] }),

  // Address — A23 splits across line1/line2/city/postcode via compound
  // ids; the read side (`fieldStatus.readPersonField`) keys off A23
  // (line1) so the drain count stays unaffected.
  A23: (p, v) => ({
    ...p,
    currentAddress: { ...p.currentAddress, line1: String(v ?? '') },
  }),
  'A23.line2': (p, v) => ({
    ...p,
    currentAddress: { ...p.currentAddress, line2: String(v ?? '') || undefined },
  }),
  'A23.city': (p, v) => ({
    ...p,
    currentAddress: { ...p.currentAddress, city: String(v ?? '') },
  }),
  'A23.postcode': (p, v) => ({
    ...p,
    currentAddress: { ...p.currentAddress, postcode: String(v ?? '') },
  }),
  A24: (p, v) => ({ ...p, residentialStatus: v as Person['residentialStatus'] }),
  A25: (p, v) => ({ ...p, movedInDate: String(v ?? '') }),
  A27: (p, v) => ({ ...p, numberOfDependants: Number(v) || 0 }),

  // Employment (nested)
  A41: (p, v) => withEmployment(p, { employmentStatus: v as Employment['employmentStatus'] }),
  A42: (p, v) => withEmployment(p, { employerName: String(v ?? '') || undefined }),
  A43: (p, v) =>
    withEmployment(p, {
      employerAddress: {
        ...(p.employment?.employerAddress ?? { line1: '', city: '', postcode: '' }),
        line1: String(v ?? ''),
      },
    }),
  A44: (p, v) => withEmployment(p, { employerPhone: String(v ?? '') || undefined }),
  A45: (p, v) => withEmployment(p, { industry: String(v ?? '') || undefined }),
  A46: (p, v) => withEmployment(p, { jobTitle: String(v ?? '') || undefined }),
  A47: (p, v) => withEmployment(p, { startDate: String(v ?? '') || undefined }),
  A51: (p, v) =>
    withEmployment(p, { basicIncome: Number(v) || undefined }),
  A52: (p, v) =>
    withEmployment(p, {
      basicIncomeFrequency: v as Employment['basicIncomeFrequency'],
    }),
  A53: (p, v) => withEmployment(p, { variableIncome: Number(v) || undefined }),
  A54: (p, v) =>
    withEmployment(p, { variableIncomeGuaranteed: Boolean(v) }),
  A55: (p, v) => withEmployment(p, { otherAllowances: Number(v) || undefined }),
  A57: (p, v) =>
    withEmployment(p, { expectedRetirementAge: Number(v) || undefined }),
  A58: (p, v) =>
    withEmployment(p, { isWithinTenYearsOfRetirement: Boolean(v) }),
  A59: (p, v) =>
    withEmployment(p, {
      professionalDetails: {
        ...(p.employment?.professionalDetails ?? { category: '' }),
        category: String(v ?? ''),
      } as NonNullable<Employment['professionalDetails']>,
    }),
  A60: (p, v) =>
    withEmployment(p, {
      professionalDetails: {
        ...(p.employment?.professionalDetails ?? { category: '' }),
        professionalBody: String(v ?? '') || undefined,
      } as NonNullable<Employment['professionalDetails']>,
    }),
  A61: (p, v) =>
    withEmployment(p, {
      professionalDetails: {
        ...(p.employment?.professionalDetails ?? { category: '' }),
        membershipNumber: String(v ?? '') || undefined,
      } as NonNullable<Employment['professionalDetails']>,
    }),
  A62: (p, v) =>
    withEmployment(p, {
      professionalDetails: {
        ...(p.employment?.professionalDetails ?? { category: '' }),
        qualificationDate: String(v ?? '') || undefined,
      } as NonNullable<Employment['professionalDetails']>,
    }),

  // Adverse history flags — broker-asserted booleans.
  A30: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasCCJ: Boolean(v) },
  }),
  A32: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasDefaults: Boolean(v) },
  }),
  A34: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasBankruptcy: Boolean(v) },
  }),
  A36: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasIVAorDMP: Boolean(v) },
  }),
  A38: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasRepossession: Boolean(v) },
  }),
  A39: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, hasMortgageArrears: Boolean(v) },
  }),
  A40: (p, v) => ({
    ...p,
    adverseHistory: {
      ...p.adverseHistory,
      paydayLoansLast12Months: Boolean(v),
    },
  }),
  C4: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, creditSearchConsent: Boolean(v) },
  }),
  C5: (p, v) => ({
    ...p,
    adverseHistory: { ...p.adverseHistory, adverseSharingConsent: Boolean(v) },
  }),
};

// ============================================================
// Collateral — P1, P4–P26 (subset; the active surfaces).
// ============================================================

const collateralFieldMap: Record<string, FieldSetter<Collateral>> = {
  P1: (c, v) => ({ ...c, address: { ...c.address, line1: String(v ?? '') } }),
  'P1.city': (c, v) => ({ ...c, address: { ...c.address, city: String(v ?? '') } }),
  'P1.postcode': (c, v) => ({
    ...c,
    address: { ...c.address, postcode: String(v ?? '') },
  }),
  P4: (c, v) => ({ ...c, tenure: v as Collateral['tenure'] }),
  P5: (c, v) => ({ ...c, leaseYearsRemaining: Number(v) || undefined }),
  P6: (c, v) => ({ ...c, propertyType: v as Collateral['propertyType'] }),
  P7: (c, v) => ({ ...c, isNewBuild: Boolean(v) }),
  P9: (c, v) => ({ ...c, bedrooms: Number(v) || undefined }),
  P10: (c, v) => ({ ...c, constructionType: v as Collateral['constructionType'] }),
  P12: (c, v) => ({ ...c, floodRisk: v as Collateral['floodRisk'] }),
  P16: (c, v) => ({ ...c, estimatedValue: Number(v) || 0 }),
  P17: (c, v) => ({ ...c, purchasePrice: Number(v) || undefined }),
  P21: (c, v) => ({ ...c, propertyUse: v as Collateral['propertyUse'] }),
  P26: (c, v) => ({ ...c, epcRating: v as Collateral['epcRating'] }),
};

// ============================================================
// Arrangement — M1–M19 (incl. Step 14 fields), D1–D4.
// ============================================================

const arrangementFieldMap: Record<string, FieldSetter<Arrangement>> = {
  M1: (a, v) => ({ ...a, arrangementReference: String(v ?? '') }),
  M2: (a, v) => ({ ...a, applicationType: v as Arrangement['applicationType'] }),
  M3: (a, v) => ({ ...a, productFamily: v as Arrangement['productFamily'] }),
  M5: (a, v) => ({ ...a, repaymentType: v as Arrangement['repaymentType'] }),
  // Step 14b: M6 loan amount is derived from property + deposit; not
  // writable. The strip dispatches setPropertyValue / setArrangementInput
  // for those instead.
  M7: (a, v) => ({ ...a, loanTermYears: Math.max(1, Number(v) || 1) }),
  M9: (a, v) => ({ ...a, rateType: v as Arrangement['rateType'] }),
  M10: (a, v) => ({ ...a, initialRate: Number(v) || undefined }),
  M11: (a, v) => ({
    ...a,
    ltvPercent: Math.max(0, Math.min(100, Number(v) || 0)),
  }),
  M12: (a, v) => ({ ...a, productFee: Number(v) || undefined }),
  M17: (a, v) => ({ ...a, brokerFee: Math.max(0, Number(v) || 0) }),
  M18: (a, v) =>
    ({ ...a, productFeeHandling: v as Arrangement['productFeeHandling'] }),
  M19: (a, v) =>
    ({ ...a, brokerFeeHandling: v as Arrangement['brokerFeeHandling'] }),
  D1: (a, v) => ({ ...a, depositAmount: Math.max(0, Number(v) || 0) }),
  D4: (a, v) => ({ ...a, giftLetterHeld: Boolean(v) }),
};

// ============================================================
// ThirdParty — keyed by property name rather than register IDs
// since T1–T13 conflate role + contact details. The Connected
// Parties drawer dispatches via these property keys.
// ============================================================

const thirdPartyFieldMap: Record<string, FieldSetter<ThirdParty>> = {
  name: (tp, v) => ({ ...tp, name: String(v ?? '') }),
  contactName: (tp, v) => ({ ...tp, contactName: String(v ?? '') || undefined }),
  email: (tp, v) => ({ ...tp, email: String(v ?? '') || undefined }),
  phone: (tp, v) => ({ ...tp, phone: String(v ?? '') || undefined }),
  actsFor: (tp, v) => ({ ...tp, actsFor: String(v ?? '') || undefined }),
  'address.line1': (tp, v) => ({
    ...tp,
    address: {
      ...(tp.address ?? { line1: '', city: '', postcode: '' }),
      line1: String(v ?? ''),
    },
  }),
  'address.city': (tp, v) => ({
    ...tp,
    address: {
      ...(tp.address ?? { line1: '', city: '', postcode: '' }),
      city: String(v ?? ''),
    },
  }),
  'address.postcode': (tp, v) => ({
    ...tp,
    address: {
      ...(tp.address ?? { line1: '', city: '', postcode: '' }),
      postcode: String(v ?? ''),
    },
  }),
};

// ============================================================
// Dispatch
// ============================================================

export function getPersonSetter(fieldId: string): FieldSetter<Person> | undefined {
  return personFieldMap[fieldId];
}
export function getCollateralSetter(
  fieldId: string,
): FieldSetter<Collateral> | undefined {
  return collateralFieldMap[fieldId];
}
export function getArrangementSetter(
  fieldId: string,
): FieldSetter<Arrangement> | undefined {
  return arrangementFieldMap[fieldId];
}
export function getThirdPartySetter(
  fieldId: string,
): FieldSetter<ThirdParty> | undefined {
  return thirdPartyFieldMap[fieldId];
}
