/**
 * Human-readable labels for register field IDs. Used by review cards,
 * provenance footers, and the audit pack to display things like
 * "Daniel Okafor → First name" instead of "Person:abc-123:A2".
 *
 * Only fields that appear in the canonical Okafor fixture are seeded
 * here — extend as new fields land in real review queues.
 */

export const REGISTER_LABELS: Record<string, string> = {
  // Person — identity & contact
  A1: 'Title',
  A2: 'First name',
  A3: 'Middle names',
  A4: 'Last name',
  A5: 'Previous names',
  A6: 'Date of birth',
  A7: 'Place of birth',
  A8: 'Country of birth',
  A9: 'Gender',
  A10: 'Marital status',
  A11: 'Nationality',
  A13: 'Country of residence',
  A14: 'UK residency status',
  A15: 'NI number',
  A16: 'Passport number',
  A17: 'Passport expiry',
  A19: 'Mobile',
  A21: 'Email',
  A22: 'Preferred contact method',
  A23: 'Current address',
  A24: 'Residential status',
  A25: 'Date moved in',
  A26: 'Previous addresses',
  A27: 'Number of dependants',
  A28: 'Ages of dependants',
  A29: 'Relationship to other applicants',

  // Adverse
  A30: 'Has CCJ',
  A32: 'Has defaults',
  A34: 'Bankruptcy',
  A36: 'IVA / DMP',
  A38: 'Repossession',
  A39: 'Mortgage arrears',
  A40: 'Payday loans (12 mo)',

  // Employment
  A41: 'Employment status',
  A42: 'Employer name',
  A43: 'Employer address',
  A45: 'Industry',
  A46: 'Job title',
  A47: 'Start date',
  A48: 'Permanent',
  A51: 'Basic income',
  A52: 'Income frequency',
  A53: 'Variable income',
  A54: 'Variable income guaranteed',
  A55: 'Other allowances',
  A57: 'Expected retirement age',
  A58: 'Within 10 years of retirement',

  // Professional
  A59: 'Professional category',
  A60: 'Professional body',
  A61: 'Membership number',
  A62: 'Qualification date',

  // Collateral
  P1: 'Property address',
  P4: 'Tenure',
  P5: 'Lease years remaining',
  P6: 'Property type',
  P7: 'New build',
  P10: 'Construction type',
  P11: 'Construction details',
  P16: 'Estimated value',
  P17: 'Purchase price',
  P18: 'Surveyed value',
  P21: 'Property use',
  P22: 'Number of units',
  P23: 'HMO licence',
  P26: 'EPC rating',

  // Arrangement
  M1: 'Arrangement reference',
  M2: 'Application type',
  M3: 'Product family',
  M4: 'Product code',
  M5: 'Repayment type',
  M6: 'Loan amount',
  M7: 'Loan term',
  M9: 'Rate type',
  M10: 'Initial rate',
  M11: 'LTV %',
  M12: 'Product fee',
  M14: 'Indicative monthly payment',
  M17: 'Broker fee',
  M18: 'Product fee handling',
  M19: 'Broker fee handling',

  // Deposit
  D1: 'Deposit amount',
  D2: 'Deposit sources',
  D4: 'Gift letter held',

  // Consents
  C1: 'Privacy notice',
  C2: 'Broker data sharing',
  C4: 'Credit search consent',
  C5: 'Adverse sharing consent',
  C6: 'AML / ID verification',
};

export function labelFor(fieldId: string): string {
  return REGISTER_LABELS[fieldId] ?? fieldId;
}
