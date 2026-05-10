import type { DateString, Money } from './primitives';

/**
 * AdverseHistory — A30–A40 on the register, plus C4 and C5
 * (which are register-classified as Consents but live with the
 * adverse block because their values are signed alongside the
 * adverse declaration).
 *
 * Always present on a Person — empty arrays + `false` flags for an
 * applicant with clean credit. This avoids `undefined`-vs-empty
 * ambiguity when computing eligibility.
 */
export interface AdverseHistory {
  // === A30–A33 · CCJs / defaults ===
  /** A30 Has the applicant ever had a CCJ? */
  hasCCJ: boolean;
  /** A31 CCJ details — required when hasCCJ = true. */
  ccjs: CCJEntry[];
  /** A32 Has the applicant had any defaults? */
  hasDefaults: boolean;
  /** A33 Default details — required when hasDefaults = true. */
  defaults: DefaultEntry[];

  // === A34–A37 · Bankruptcy / IVA / DMP ===
  /** A34 Has the applicant ever been declared bankrupt? */
  hasBankruptcy: boolean;
  /** A35 Bankruptcy details — required when hasBankruptcy = true. */
  bankruptcies: BankruptcyEntry[];
  /** A36 Has the applicant entered an IVA or Debt Management Plan? */
  hasIVAorDMP: boolean;
  /** A37 IVA / DMP details — required when hasIVAorDMP = true. */
  ivasOrDmps: IVAorDMPEntry[];

  // === A38–A40 · Repossession / arrears / payday loans ===
  /** A38 Property ever repossessed. */
  hasRepossession: boolean;
  /** A39 Currently in mortgage / secured-loan arrears. */
  hasMortgageArrears: boolean;
  /** A40 Payday loan use in last 12 months. */
  paydayLoansLast12Months: boolean;

  // === C4–C5 · Consents bundled with the adverse declaration ===
  /** C4 Consent to credit reference agency hard search. Always required
   *  before DIP can be submitted. */
  creditSearchConsent: boolean;
  /** C5 Consent to share adverse history with chosen lender panel.
   *  Required for full application submission. */
  adverseSharingConsent: boolean;
}

export interface CCJEntry {
  date: DateString;
  amount: Money;
  satisfied: boolean;
  satisfactionDate?: DateString;
}

export interface DefaultEntry {
  date: DateString;
  amount: Money;
  creditor: string;
  satisfied: boolean;
  satisfactionDate?: DateString;
}

export interface BankruptcyEntry {
  /** Date order was made. */
  date: DateString;
  /** Date discharged — required if discharged. */
  dischargeDate?: DateString;
  reason?: string;
}

export interface IVAorDMPEntry {
  type: 'IVA' | 'DMP';
  startDate: DateString;
  endDate?: DateString;
  /** Total balance under the arrangement at start. */
  totalBalance: Money;
  active: boolean;
}
