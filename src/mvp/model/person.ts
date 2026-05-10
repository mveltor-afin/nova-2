import type {
  Address,
  DateString,
  EmailAddress,
  PhoneNumber,
  UUID,
} from './primitives';
import type { Employment } from './employment';
import type { AdverseHistory } from './adverse';

/**
 * Person — the only Party kind currently used by the MVP.
 *
 * Field IDs in comments map to the Nova Data Point Register rows
 * A1–A40. A41–A64 live on the nested `Employment` record (which
 * itself nests `ProfessionalDetails` for A59–A64).
 *
 * Field shape follows the register's "DIP / Full app" columns:
 *  - DIP-required fields are non-optional `T`
 *  - Full-app-only fields are `T | undefined` (optional)
 *  - Fields that depend on other answers (e.g. previous address) are
 *    optional and gated by `rules/visibility.ts`
 */
export interface Person {
  uuid: UUID;

  // === A1–A10 · Identity ===
  /** A1 Title */
  title: 'Mr' | 'Mrs' | 'Miss' | 'Ms' | 'Mx' | 'Dr' | 'Other';
  /** A2 First name */
  firstName: string;
  /** A3 Middle names */
  middleNames?: string;
  /** A4 Last name */
  lastName: string;
  /** A5 Previous names (maiden, deed-poll, etc.) — Full app only. */
  previousNames?: string[];
  /** A6 Date of birth */
  dateOfBirth: DateString;
  /** A7 Place of birth — Full app only. */
  placeOfBirth?: string;
  /** A8 Country of birth */
  countryOfBirth?: string;
  /** A9 Gender */
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  /** A10 Marital status */
  maritalStatus: 'Single' | 'Married' | 'Civil Partnership' | 'Divorced' | 'Widowed' | 'Separated' | 'Cohabiting';

  // === A11–A14 · Nationality / residency ===
  /** A11 Nationality (ISO 3166-1 alpha-2 or free-text). */
  nationality: string;
  /** A12 Second nationality, where applicable. */
  secondNationality?: string;
  /** A13 Country of residence (for tax purposes). */
  countryOfResidence: string;
  /** A14 UK residency status. */
  ukResidencyStatus?:
    | 'British Citizen'
    | 'Settled (ILR)'
    | 'Pre-Settled'
    | 'Skilled Worker Visa'
    | 'Other Visa'
    | 'Non-Resident';

  // === A15–A18 · Government identifiers ===
  /** A15 National Insurance number. */
  niNumber?: string;
  /** A16 Passport number — Full app only. */
  passportNumber?: string;
  /** A17 Passport expiry — Full app only. */
  passportExpiry?: DateString;
  /** A18 Driving licence number — Full app only. */
  drivingLicenceNumber?: string;

  // === A19–A22 · Contact ===
  /** A19 Mobile number. */
  mobile: PhoneNumber;
  /** A20 Landline number. */
  landline?: PhoneNumber;
  /** A21 Email address. */
  email: EmailAddress;
  /** A22 Preferred contact method. */
  preferredContactMethod?: 'Email' | 'Mobile' | 'Landline' | 'Post';

  // === A23–A29 · Address history & dependants ===
  /** A23 Current address. */
  currentAddress: Address;
  /** A24 Residential status at current address. */
  residentialStatus: 'Owner' | 'Mortgaged' | 'Tenant (Private)' | 'Tenant (Council/HA)' | 'Living with parents' | 'Other';
  /** A25 Date moved into current address. */
  movedInDate: DateString;
  /** A26 Previous addresses — required if at current address < 3 years.
   *  Visibility gated by `rules/visibility.ts` on `A26`. */
  previousAddresses?: Address[];
  /** A27 Number of dependants. */
  numberOfDependants: number;
  /** A28 Ages of dependants — Full app only, visibility gated when A27 > 0. */
  agesOfDependants?: number[];
  /** A29 Relationship to other applicants on the same case (e.g. "Spouse",
   *  "Civil Partner", "Sibling"). Required when there are joint applicants. */
  relationshipToOtherApplicants?: string;

  // === A30–A40 · Adverse history (composed) ===
  /** A30–A40 plus C4/C5 (consents that travelled with adverse history).
   *  Always present — empty record for clean credit. */
  adverseHistory: AdverseHistory;

  // === A41–A64 · Employment & income (composed) ===
  /** Primary employment record. A41–A58 live here, with A59–A64
   *  nested under `ProfessionalDetails` when employmentStatus is a
   *  qualifying profession. Optional at DIP for some product families,
   *  but required by Full app. Visibility gated per-field. */
  employment?: Employment;
  /** Secondary employment, where the applicant has multiple roles.
   *  Same shape as primary; gated by visibility rules. */
  secondaryEmployment?: Employment;
}
