/**
 * Nova v3 — Case domain types (Step 1 minimal shape).
 * Fleshed out with sub-tab data, products, parties, consents, documents in Step 2.
 */

export type CasePhase = 'pre-dip' | 'dip' | 'full-app' | 'completion';

export type ProductFamily = 'owner-occupier' | 'btl' | 'rb' | 'obtl';

/**
 * Polymorphic Party model. MVP ships Person only.
 * SoleTrader/LtdCo/SPV/LLP/Trust are designed-in placeholders.
 */
export type ApplicantType = 'Person' | 'SoleTrader' | 'LtdCo' | 'SPV' | 'LLP' | 'Trust';

export interface Applicant {
  id: string;
  type: ApplicantType;
  firstName: string;
  lastName: string;
  initials: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  address: string;
  postcode: string;
  role: 'primary' | 'additional';
}

export interface Case {
  id: string;
  reference: string;
  clientName: string;
  shortLabel: string;
  phase: CasePhase;
  progress: number;
  loanAmount: number;
  ltv: number;
  productFamily: ProductFamily;
  selectedProductLabel: string;

  applicants: Applicant[];
  properties: Property[];
}
