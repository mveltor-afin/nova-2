import type { Address, EmailAddress, PhoneNumber, UUID } from './primitives';

/**
 * ThirdParty — T1–T13 on the register. Anyone touching the case
 * who is not an Applicant / Party — solicitor, surveyor, estate
 * agent, accountant, packager, intermediary contact at the lender.
 *
 * One Case carries an array of ThirdParty. Role-specific extra
 * fields live on a discriminated `roleDetails` so e.g. solicitor
 * SRA numbers don't pollute the surveyor record.
 */
export type ThirdPartyRole =
  /** T1 Solicitor / conveyancer */
  | 'Solicitor'
  /** T2 Surveyor / valuer */
  | 'Surveyor'
  /** T3 Estate agent (selling) */
  | 'EstateAgent'
  /** T4 Accountant */
  | 'Accountant'
  /** T5 Packager */
  | 'Packager'
  /** T6 Lender contact */
  | 'LenderContact'
  /** T7 Insurance broker / GI provider */
  | 'InsuranceProvider'
  /** T8 IFA / wealth manager */
  | 'IFA'
  /** T9 Mortgage broker (other side, where applicable) */
  | 'MortgageBroker'
  /** T10 Vendor / seller */
  | 'Vendor'
  /** T11 Letting agent (BTL) */
  | 'LettingAgent'
  /** T12 Property manager (BTL) */
  | 'PropertyManager'
  /** T13 Other */
  | 'Other';

export interface ThirdParty {
  uuid: UUID;
  role: ThirdPartyRole;
  /** Display name (firm or individual). */
  name: string;
  /** Primary contact person at the firm. */
  contactName?: string;
  email?: EmailAddress;
  phone?: PhoneNumber;
  address?: Address;
  /** Free-text label shown on the document rail / messages tab to
   *  identify which party this third party belongs to (e.g.
   *  "Applicant 1's solicitor"). */
  actsFor?: string;
  /** Role-specific details that are nullable for most roles but
   *  required for one. Discriminated on `role`. */
  roleDetails?: SolicitorDetails | SurveyorDetails | AccountantDetails;
}

export interface SolicitorDetails {
  /** SRA / Law Society number. */
  regulatorNumber?: string;
  /** Whether on the lender's panel. */
  onLenderPanel?: boolean;
}

export interface SurveyorDetails {
  /** RICS number. */
  ricsNumber?: string;
}

export interface AccountantDetails {
  /** Body — ICAEW / ACCA / CIMA etc. */
  professionalBody?: string;
  /** Membership number. */
  membershipNumber?: string;
}
