import type { DateString, Money, UUID } from './primitives';

/**
 * Arrangement — M1–M16 on the register, plus D1–D4 (deposit /
 * source-of-funds rows that travel with the mortgage request).
 *
 * One Arrangement per Case. The product *family* is captured here
 * (Owner Occupier / Buy-to-Let / Bridging / Premier / Professional);
 * the specific lender product is selected later in the Products tab
 * but a placeholder slot is included for `selectedProductCode`.
 */
export interface Arrangement {
  uuid: UUID;

  // === M1–M5 · Application identity & basics ===
  /** M1 Arrangement reference (`ARR-YYYY-MM-NNNNN`). */
  arrangementReference: string;
  /** M2 Application type. */
  applicationType: 'Purchase' | 'Remortgage' | 'Further Advance' | 'Product Transfer';
  /** M3 Product family — drives the eligibility ruleset. */
  productFamily: 'Owner Occupier' | 'Buy-to-Let' | 'Bridging' | 'Premier' | 'Professional';
  /** M4 Selected product code, once chosen. Empty until the Products tab
   *  has been resolved. */
  selectedProductCode?: string;
  /** M5 Repayment type. */
  repaymentType: 'Capital & Interest' | 'Interest Only' | 'Part-and-Part';

  // === M6–M10 · Loan amount (derived), term, rate ===
  // Step 14b: M6 loan amount is no longer stored — it's derived from
  // `collateral.estimatedValue - arrangement.depositAmount`. The
  // Configuration Strip writes property value and deposit; loan amount
  // falls out via `selectLoanAmount`.
  /** M7 Loan term in years. */
  loanTermYears: number;
  /** M8 Loan term in months — for sub-year residual (5y 6m etc.). */
  loanTermMonths?: number;
  /** M9 Initial interest rate type. */
  rateType: '2yr Fixed' | '3yr Fixed' | '5yr Fixed' | '10yr Fixed' | 'Tracker' | 'Discount' | 'SVR';
  /** M10 Initial rate %, where known. Populated once the product is selected. */
  initialRate?: number;

  // === M11–M14 · LTV, fees, payments (some derived) ===
  /** M11 LTV % — derived from `loanAmount / Collateral.estimatedValue`,
   *  but stored on the record so provenance can mark it Derived. */
  ltvPercent?: number;
  /** M12 Product fee (added to loan or paid up-front). */
  productFee?: Money;
  /** M13 Whether product fee is added to the loan. */
  productFeeAddedToLoan?: boolean;
  /** M14 Indicative monthly payment — derived from rate, term and amount. */
  indicativeMonthlyPayment?: Money;

  // === M15–M16 · Part-and-Part split ===
  /** M15 Capital & interest portion (when rateType is Part-and-Part). */
  partAndPartCapitalAmount?: Money;
  /** M16 Interest only portion (when rateType is Part-and-Part). */
  partAndPartInterestOnlyAmount?: Money;

  // === M17–M19 · Configuration Strip (Step 14) ===
  /** M17 Broker fee (advisor's charge). Default 0. */
  brokerFee: Money;
  /** M18 Whether the product fee is capitalised into the loan or paid up-front. */
  productFeeHandling: 'capitalise' | 'upfront';
  /** M19 Whether the broker fee is capitalised into the loan or paid up-front. */
  brokerFeeHandling: 'capitalise' | 'upfront';

  // === D1–D4 · Deposit & source of funds ===
  /** D1 Deposit amount. */
  depositAmount: Money;
  /** D2 Source(s) of deposit — multi-select. */
  depositSources: DepositSource[];
  /** D3 Deposit source detail (free-text for "Gift", "Sale of property" etc.). */
  depositSourceDetail?: string;
  /** D4 Gift letter held (required when depositSources includes 'Gift'). */
  giftLetterHeld?: boolean;
}

export type DepositSource =
  | 'Savings'
  | 'Gift'
  | 'Sale of Property'
  | 'Inheritance'
  | 'Equity from Other Property'
  | 'Help to Buy ISA / LISA'
  | 'Bonus / Lump Sum'
  | 'Other';
