import type { DateString, Frequency, Money, UUID } from './primitives';

/**
 * FinancialItem — discriminated union covering Incomes (I1–I22),
 * Expenditure (E1–E14), and Liabilities (L1–L11). Each `Person` (or
 * the joint case where shared) owns an array of `FinancialItem`.
 *
 * Modelled as a tagged union rather than three parallel arrays so a
 * single `<FinancialRow />` component can render the whole budget
 * sheet, and so provenance keys read uniformly:
 * `Income:<uuid>:I3`, `Expenditure:<uuid>:E2`, `Liability:<uuid>:L4`.
 */
export type FinancialItem = Income | Expenditure | Liability;

// === I1–I22 · Income ===

/** Granular income categories from the register. The MVP UI
 *  collapses related rows under headings ("Employment", "Pension",
 *  "Investment", "Benefit", "Other") but the underlying ID is kept. */
export type IncomeCategory =
  /** I1 Salary (gross) */
  | 'Salary'
  /** I2 Bonus */
  | 'Bonus'
  /** I3 Overtime */
  | 'Overtime'
  /** I4 Commission */
  | 'Commission'
  /** I5 Allowances (car, shift, London weighting) */
  | 'Allowances'
  /** I6 Self-employed net profit */
  | 'SelfEmployedProfit'
  /** I7 Director's dividends */
  | 'Dividends'
  /** I8 Director's salary (where separate from I1) */
  | 'DirectorSalary'
  /** I9 Rental income (BTL / lodger) */
  | 'Rental'
  /** I10 State pension */
  | 'StatePension'
  /** I11 Private pension */
  | 'PrivatePension'
  /** I12 Workplace pension drawdown */
  | 'WorkplacePension'
  /** I13 Investment income (interest, share dividends) */
  | 'InvestmentIncome'
  /** I14 Trust income */
  | 'TrustIncome'
  /** I15 Maintenance received */
  | 'Maintenance'
  /** I16 Child Benefit */
  | 'ChildBenefit'
  /** I17 Universal Credit / Tax Credits */
  | 'UniversalCredit'
  /** I18 Disability benefit */
  | 'DisabilityBenefit'
  /** I19 Carer's allowance */
  | 'CarersAllowance'
  /** I20 Foster income */
  | 'FosterIncome'
  /** I21 Foreign income */
  | 'ForeignIncome'
  /** I22 Other income (free-text) */
  | 'OtherIncome';

export interface Income {
  kind: 'Income';
  uuid: UUID;
  /** Owning party — for joint accounts one Income row may have
   *  `partyUuid: 'joint'` (handled by visibility rules at render time). */
  partyUuid: UUID | 'joint';
  category: IncomeCategory;
  /** Free-text label shown on the budget sheet, defaults from category. */
  label?: string;
  amount: Money;
  frequency: Frequency;
  /** Whether the income is verified by document (payslip, SA302 etc.).
   *  Mirrors document linkage; provenance lives on the field. */
  verified?: boolean;
}

// === E1–E14 · Expenditure ===

export type ExpenditureCategory =
  /** E1 Council Tax */
  | 'CouncilTax'
  /** E2 Utilities (gas, electric, water) */
  | 'Utilities'
  /** E3 Buildings & contents insurance (existing) */
  | 'Insurance'
  /** E4 Childcare */
  | 'Childcare'
  /** E5 School / private education fees */
  | 'SchoolFees'
  /** E6 Travel & commuting */
  | 'Travel'
  /** E7 Food & housekeeping */
  | 'Food'
  /** E8 Mobile / broadband / TV */
  | 'Communications'
  /** E9 Subscriptions */
  | 'Subscriptions'
  /** E10 Pension contributions (post-tax) */
  | 'PensionContributions'
  /** E11 Maintenance paid */
  | 'MaintenancePaid'
  /** E12 Charitable giving (committed) */
  | 'CharitableGiving'
  /** E13 Ground rent / service charge */
  | 'GroundRentServiceCharge'
  /** E14 Other essential expenditure */
  | 'OtherExpenditure';

export interface Expenditure {
  kind: 'Expenditure';
  uuid: UUID;
  partyUuid: UUID | 'joint';
  category: ExpenditureCategory;
  label?: string;
  amount: Money;
  frequency: Frequency;
}

// === L1–L11 · Liabilities ===

export type LiabilityCategory =
  /** L1 Credit card balance */
  | 'CreditCard'
  /** L2 Personal loan */
  | 'PersonalLoan'
  /** L3 Car finance (HP / PCP) */
  | 'CarFinance'
  /** L4 Student loan */
  | 'StudentLoan'
  /** L5 Hire purchase */
  | 'HirePurchase'
  /** L6 Existing mortgage (BTL or owner-occupied retained) */
  | 'ExistingMortgage'
  /** L7 Second-charge / secured loan */
  | 'SecuredLoan'
  /** L8 Overdraft */
  | 'Overdraft'
  /** L9 Family / private loan */
  | 'PrivateLoan'
  /** L10 Buy-now-pay-later */
  | 'BNPL'
  /** L11 Other unsecured liability */
  | 'OtherLiability';

export interface Liability {
  kind: 'Liability';
  uuid: UUID;
  partyUuid: UUID | 'joint';
  category: LiabilityCategory;
  label?: string;
  /** Outstanding balance. */
  balance: Money;
  /** Contractual monthly payment (lender DTI uses this). */
  monthlyPayment: Money;
  /** Set to true for items the applicant is consolidating into the
   *  new mortgage — visibility rule hides post-completion duplicates. */
  toBeRepaidOnCompletion?: boolean;
  /** Originally-agreed end date (for term loans). */
  endDate?: DateString;
}
