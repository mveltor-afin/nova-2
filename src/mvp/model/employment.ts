import type { Address, DateString, Money, Frequency } from './primitives';

/**
 * Employment — A41–A58 on the Nova Data Point Register, with
 * `ProfessionalDetails` (A59–A64) nested underneath. Composed onto
 * `Person.employment` (and `Person.secondaryEmployment` for second
 * jobs).
 *
 * The shape supports every employmentStatus the register lists, but
 * downstream visibility rules suppress fields that don't apply to the
 * chosen status (e.g. a salaried applicant doesn't fill in
 * `selfEmployedYearsTrading`).
 */
export type EmploymentStatus =
  | 'Employed'
  | 'Self-Employed'
  | 'Director'
  | 'Contractor'
  | 'Retired'
  | 'Unemployed'
  | 'Homemaker'
  | 'Student'
  | 'Other';

export interface Employment {
  // === A41–A45 · Status & employer ===
  /** A41 Employment status. Drives visibility for the rest of the block. */
  employmentStatus: EmploymentStatus;
  /** A42 Employer name (or trading name for self-employed). */
  employerName?: string;
  /** A43 Employer address. */
  employerAddress?: Address;
  /** A44 Employer phone (for verification calls). */
  employerPhone?: string;
  /** A45 Industry / sector. */
  industry?: string;

  // === A46–A50 · Role & tenure ===
  /** A46 Job title. */
  jobTitle?: string;
  /** A47 Date employment started. */
  startDate?: DateString;
  /** A48 Whether employment is permanent. */
  isPermanent?: boolean;
  /** A49 Probation period end date — required if isPermanent and within probation. */
  probationEndDate?: DateString;
  /** A50 Notice period (e.g. "1 month", "3 months"). */
  noticePeriod?: string;

  // === A51–A55 · Income ===
  /** A51 Basic / gross income. */
  basicIncome?: Money;
  /** A52 Income frequency. */
  basicIncomeFrequency?: Frequency;
  /** A53 Bonus / overtime / commission (annualised). */
  variableIncome?: Money;
  /** A54 Whether variable income is guaranteed (vs discretionary). */
  variableIncomeGuaranteed?: boolean;
  /** A55 Other allowances (car, shift, London weighting etc.). */
  otherAllowances?: Money;

  // === A56–A58 · Self-employment & retirement ===
  /** A56 Self-employed: number of years trading. Required when
   *  employmentStatus = 'Self-Employed' or 'Director'. */
  selfEmployedYearsTrading?: number;
  /** A57 Retirement: expected retirement age. Required for affordability
   *  when applicant is within 10 years of stated retirement age. */
  expectedRetirementAge?: number;
  /** A58 Retirement: derived flag — is the applicant within 10 years of
   *  retirement? Computed by `rules/visibility.ts` from A57 + DOB.
   *  Stored on the record so provenance can mark it `Derived`. */
  isWithinTenYearsOfRetirement?: boolean;

  // === A59–A64 · Professional details (nested) ===
  /** Only populated when the applicant qualifies for the Professional
   *  product family (medical, legal, finance, accountancy etc.).
   *  Visibility gated by `rules/visibility.ts` on `A59`. */
  professionalDetails?: ProfessionalDetails;
}

/**
 * ProfessionalDetails — A59–A64. Sub-record nested under Employment.
 * Required to qualify for the Professional product family (75% LTV
 * cap with reduced affordability stress).
 */
export interface ProfessionalDetails {
  /** A59 Professional category. */
  category:
    | 'Medical'
    | 'Dental'
    | 'Legal'
    | 'Accountancy'
    | 'Finance'
    | 'Architecture'
    | 'Engineering'
    | 'Other';
  /** A60 Professional body / regulator (e.g. GMC, SRA, ICAEW). */
  professionalBody?: string;
  /** A61 Membership / registration number. */
  membershipNumber?: string;
  /** A62 Date qualified. */
  qualificationDate?: DateString;
  /** A63 Whether currently in training (e.g. junior doctor, trainee solicitor).
   *  Drives a different income-uplift rule on Premier Professional. */
  inTraining?: boolean;
  /** A64 Expected qualification date — required when inTraining = true. */
  expectedQualificationDate?: DateString;
}
