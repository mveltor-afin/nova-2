import type { Address, DateString, Money, UUID } from './primitives';

/**
 * Collateral — P1–P33 on the register. The property securing the
 * mortgage. A case may carry more than one Collateral (let-to-buy,
 * portfolio additions) but the MVP Okafor case has exactly one.
 */
export interface Collateral {
  uuid: UUID;

  // === P1–P5 · Identity & address ===
  /** P1 Property address. */
  address: Address;
  /** P2 UPRN (Unique Property Reference Number) — populated from EPC
   *  / Land Registry where available. */
  uprn?: string;
  /** P3 Title number(s). */
  titleNumber?: string;
  /** P4 Tenure. */
  tenure: 'Freehold' | 'Leasehold' | 'Share of Freehold' | 'Commonhold';
  /** P5 Years remaining on lease — required when tenure ≠ Freehold. */
  leaseYearsRemaining?: number;

  // === P6–P10 · Build & type ===
  /** P6 Property type. */
  propertyType:
    | 'Detached House'
    | 'Semi-Detached House'
    | 'Terraced House'
    | 'End-Terrace House'
    | 'Bungalow'
    | 'Flat'
    | 'Maisonette'
    | 'Studio'
    | 'Other';
  /** P7 New build flag (built or substantially refurbished within 24 months). */
  isNewBuild: boolean;
  /** P8 Year built. */
  yearBuilt?: number;
  /** P9 Number of bedrooms. */
  bedrooms?: number;
  /** P10 Construction type (standard / non-standard). */
  constructionType?: 'Standard' | 'Non-Standard';

  // === P11–P15 · Non-standard / risk flags ===
  /** P11 Construction details — required when constructionType = Non-Standard. */
  constructionDetails?: string;
  /** P12 Flood risk (from Land Registry / EA data). */
  floodRisk?: 'None' | 'Low' | 'Medium' | 'High';
  /** P13 In a Conservation Area / Listed. */
  isListedOrConservation?: boolean;
  /** P14 Listed grade — required when isListedOrConservation. */
  listedGrade?: 'I' | 'II*' | 'II';
  /** P15 Ex-council / housing-association built. */
  isExCouncil?: boolean;

  // === P16–P20 · Valuation ===
  /** P16 Estimated open-market value (broker / applicant estimate). */
  estimatedValue: Money;
  /** P17 Purchase price — required for Purchase, undefined for Remortgage. */
  purchasePrice?: Money;
  /** P18 Surveyor's reported value. Lender-provided, populated post-survey. */
  surveyedValue?: Money;
  /** P19 Date of last valuation. */
  lastValuationDate?: DateString;
  /** P20 Type of valuation. */
  valuationType?: 'AVM' | 'Desktop' | 'Drive-by' | 'Full Survey' | 'HomeBuyer' | 'Building Survey';

  // === P21–P25 · Use & occupancy ===
  /** P21 Property use. Determines product family. */
  propertyUse: 'Owner Occupier' | 'Buy-to-Let' | 'Holiday Let' | 'Second Home';
  /** P22 Number of units (HMO / multi-unit blocks). */
  numberOfUnits?: number;
  /** P23 HMO licence held. */
  hasHMOLicence?: boolean;
  /** P24 Currently tenanted. */
  isCurrentlyTenanted?: boolean;
  /** P25 Tenure of existing tenancy (AST / regulated / company let). */
  existingTenancyType?: 'AST' | 'Regulated' | 'Company Let' | 'None';

  // === P26–P29 · EPC & energy ===
  /** P26 EPC rating. */
  epcRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  /** P27 EPC expiry date. */
  epcExpiry?: DateString;
  /** P28 SAP score. */
  sapScore?: number;
  /** P29 Heating type. */
  heatingType?: 'Gas Central' | 'Electric' | 'Oil' | 'LPG' | 'Heat Pump' | 'District' | 'Other';

  // === P30–P33 · Existing finance (remortgage) ===
  /** P30 Existing lender — Remortgage only. */
  existingLender?: string;
  /** P31 Outstanding balance — Remortgage only. */
  existingMortgageBalance?: Money;
  /** P32 Existing mortgage end date — Remortgage only. */
  existingMortgageEndDate?: DateString;
  /** P33 Early Repayment Charge applicable on existing mortgage. */
  existingERCApplicable?: boolean;
}
