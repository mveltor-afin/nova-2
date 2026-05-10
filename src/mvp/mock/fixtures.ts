/**
 * Nova v3 — Step 3 mock fixtures.
 *
 * Canonical Okafor case (`ARR-2026-04-19847`). Wired into the store
 * by [caseStore.ts](../store/caseStore.ts). Designed to exercise
 * every visible state the prototype demonstrates:
 *
 *  - Two applicants (Daniel + Amara) so joint-application UI lights up
 *  - Daniel has populated `professionalDetails` so the Professional
 *    eligibility nudge fires
 *  - Two collaterals (primary + additional security) for multi-property
 *    cards on the Security tab
 *  - Six "real" documents in varied processing states + two illustrative
 *    docs (HEIC mid-OCR; mystery.pdf awaiting manual classification)
 *  - Five Field Review Cards spanning awaiting / accepted / overridden /
 *    conflict states
 *  - One genuine extraction conflict (Daniel basic salary £4,250 from
 *    payslip vs £4,180 derived from bank statement)
 *  - Provenance entries hitting all seven states the brief calls out
 *
 * Provenance keys follow the universal format:
 *   `${entityType}:${entityId}:${registerId}`
 * where `entityType` is one of
 *   Person | Employment | AdverseHistory | Income | Expenditure |
 *   Liability | Collateral | Arrangement | ThirdParty | Consent.
 * For nested sub-entities (Employment / AdverseHistory /
 * ProfessionalDetails) the `entityId` is the parent Person UUID.
 */

import type { Case } from '../model/case';
import type { Party } from '../model/party';
import type { Person } from '../model/person';
import type { Employment } from '../model/employment';
import type { AdverseHistory } from '../model/adverse';
import type { Collateral } from '../model/collateral';
import type { Arrangement } from '../model/arrangement';
import type { ThirdParty } from '../model/thirdparty';
import type { Consent } from '../model/consent';
import type { Document } from '../model/document';
import type { FieldExtraction } from '../model/extraction';
import type { FinancialItem } from '../model/financial';
import type { Provenance } from '../model/provenance';
import type { DIPResult } from '../tabs/products/dipResults';

// ============================================================
// UUIDs as named constants — used as cross-references across the
// fixture so any of them can be edited in one place.
// ============================================================

export const FIXTURE_IDS = {
  // Parties
  partyDaniel: 'party-daniel',
  partyAmara: 'party-amara',
  personDaniel: 'person-daniel-okafor',
  personAmara: 'person-amara-okafor',

  // Collaterals
  collateralCamberwell: 'collateral-camberwell',
  collateralDenmark: 'collateral-denmark',

  // Arrangement
  arrangement: 'arrangement-okafor',

  // Documents
  docFactFind: 'doc-fact-find',
  docPayslip: 'doc-payslip-march-daniel',
  docPassport: 'doc-daniel-passport',
  docScan003: 'doc-scan-003',
  docBankStatement: 'doc-bank-statement-jan-mar',
  docValuation: 'doc-valuation',
  docHeicProcessing: 'doc-chioma-passport-heic',
  docMystery: 'doc-mystery',

  // Extractions
  extDanielFirstName: 'ext-daniel-first-name',
  extDanielEmail: 'ext-daniel-email',
  extDanielSalaryPayslip: 'ext-daniel-salary-payslip',
  extDanielSalaryBank: 'ext-daniel-salary-bank',
  extAmaraMiddleName: 'ext-amara-middle-name',
  extDanielAddress: 'ext-daniel-address',

  // Third parties
  tpSarahChen: 'tp-sarah-chen',
  tpMarcusWebb: 'tp-marcus-webb',
  tpAOkafor: 'tp-a-okafor',
  tpHargreaves: 'tp-james-hargreaves',
  tpElizabeth: 'tp-elizabeth-okafor',
  tpChidera: 'tp-chidera-okafor',

  // Consents
  consentPrivacyDaniel: 'consent-privacy-daniel',
  consentPrivacyAmara: 'consent-privacy-amara',
  consentAMLDaniel: 'consent-aml-daniel',
  consentAMLAmara: 'consent-aml-amara',
  consentOpenBankingJoint: 'consent-open-banking-joint',

  // Financial items — incomes
  incDanielSalary: 'inc-daniel-salary',
  incDanielBonus: 'inc-daniel-bonus',
  incAmaraSalary: 'inc-amara-salary',
  incAmaraBonus: 'inc-amara-bonus',
  // Financial items — expenditure (joint household)
  expCouncilTax: 'exp-council-tax',
  expUtilities: 'exp-utilities',
  expChildcare: 'exp-childcare',
  expFood: 'exp-food',
  expTravel: 'exp-travel',
  // Financial items — liabilities
  liabCreditCardDaniel: 'liab-cc-daniel',
  liabCarFinanceAmara: 'liab-car-amara',
  liabStudentLoanDaniel: 'liab-student-daniel',
} as const;

// ============================================================
// Reference dates. Real ISO strings so timestamps render naturally.
// ============================================================

const NOW = '2026-05-09T09:00:00Z';
const YESTERDAY = '2026-05-08T16:30:00Z';
const TWO_DAYS_AGO = '2026-05-07T11:15:00Z';
const DIP_SUBMITTED_AT = '2026-04-22T14:05:00Z';
const CASE_CREATED_AT = '2026-04-19T10:00:00Z';

// ============================================================
// Daniel Okafor — primary applicant. Solicitor at Clifford Chance.
// ============================================================

const danielAdverse: AdverseHistory = {
  hasCCJ: false,
  ccjs: [],
  hasDefaults: false,
  defaults: [],
  hasBankruptcy: false,
  bankruptcies: [],
  hasIVAorDMP: false,
  ivasOrDmps: [],
  hasRepossession: false,
  hasMortgageArrears: false,
  paydayLoansLast12Months: false,
  creditSearchConsent: true,
  adverseSharingConsent: true,
};

const danielEmployment: Employment = {
  employmentStatus: 'Employed',
  employerName: 'Clifford Chance LLP',
  employerAddress: {
    line1: '10 Upper Bank Street',
    city: 'London',
    postcode: 'E14 5JJ',
  },
  employerPhone: '+44 20 7006 1000',
  industry: 'Legal Services',
  jobTitle: 'Solicitor',
  startDate: '2018-09-03',
  isPermanent: true,
  noticePeriod: '3 months',
  basicIncome: 4250,
  basicIncomeFrequency: 'Monthly',
  variableIncome: 25000,
  variableIncomeGuaranteed: false,
  otherAllowances: 0,
  expectedRetirementAge: 65,
  isWithinTenYearsOfRetirement: false,
  professionalDetails: {
    category: 'Legal',
    professionalBody: 'SRA',
    membershipNumber: '511234',
    qualificationDate: '2010-09-15',
    inTraining: false,
  },
};

const daniel: Person = {
  uuid: FIXTURE_IDS.personDaniel,

  title: 'Mr',
  firstName: 'Daniel',
  middleNames: 'Chukwuemeka',
  lastName: 'Okafor',
  dateOfBirth: '1985-03-12',
  countryOfBirth: 'United Kingdom',
  gender: 'Male',
  maritalStatus: 'Married',

  nationality: 'British',
  countryOfResidence: 'United Kingdom',
  ukResidencyStatus: 'British Citizen',

  niNumber: 'AB 12 34 56 C',
  passportNumber: '561234789',
  passportExpiry: '2031-08-04',

  mobile: '+44 7700 900123',
  email: 'daniel.okafor@cliffordchance.com',
  preferredContactMethod: 'Email',

  currentAddress: {
    line1: '4 Pimlico Heights',
    line2: 'Lupus Street',
    city: 'London',
    postcode: 'SW1V 3AA',
    country: 'United Kingdom',
    effectiveFrom: '2022-01-15',
  },
  residentialStatus: 'Tenant (Private)',
  movedInDate: '2022-01-15',
  numberOfDependants: 1,
  agesOfDependants: [10],
  relationshipToOtherApplicants: 'Spouse to Amara Okafor',

  adverseHistory: danielAdverse,
  employment: danielEmployment,
};

// ============================================================
// Amara Okafor — joint applicant. Marketing Manager at WPP.
// ============================================================

const amaraAdverse: AdverseHistory = {
  hasCCJ: false,
  ccjs: [],
  hasDefaults: false,
  defaults: [],
  hasBankruptcy: false,
  bankruptcies: [],
  hasIVAorDMP: false,
  ivasOrDmps: [],
  hasRepossession: false,
  hasMortgageArrears: false,
  paydayLoansLast12Months: false,
  creditSearchConsent: true,
  adverseSharingConsent: true,
};

const amaraEmployment: Employment = {
  employmentStatus: 'Employed',
  employerName: 'WPP plc',
  employerAddress: {
    line1: 'Sea Containers House',
    line2: '18 Upper Ground',
    city: 'London',
    postcode: 'SE1 9GL',
  },
  employerPhone: '+44 20 7282 4600',
  industry: 'Marketing & Communications',
  jobTitle: 'Senior Marketing Manager',
  startDate: '2020-06-01',
  isPermanent: true,
  noticePeriod: '1 month',
  basicIncome: 5500,
  basicIncomeFrequency: 'Monthly',
  variableIncome: 8000,
  variableIncomeGuaranteed: true,
  otherAllowances: 0,
  expectedRetirementAge: 65,
  isWithinTenYearsOfRetirement: false,
};

const amara: Person = {
  uuid: FIXTURE_IDS.personAmara,

  title: 'Mrs',
  firstName: 'Amara',
  // middleNames intentionally undefined — illustrates the "low-confidence
  // awaiting review" extraction (smudged on the fact-find PDF).
  lastName: 'Okafor',
  dateOfBirth: '1987-07-22',
  countryOfBirth: 'United Kingdom',
  gender: 'Female',
  maritalStatus: 'Married',

  nationality: 'British',
  countryOfResidence: 'United Kingdom',
  ukResidencyStatus: 'British Citizen',

  niNumber: 'CD 23 45 67 D',

  mobile: '+44 7700 900456',
  email: 'amara.okafor@example.com',
  preferredContactMethod: 'Email',

  currentAddress: {
    line1: '4 Pimlico Heights',
    line2: 'Lupus Street',
    city: 'London',
    postcode: 'SW1V 3AA',
    country: 'United Kingdom',
    effectiveFrom: '2022-01-15',
  },
  residentialStatus: 'Tenant (Private)',
  movedInDate: '2022-01-15',
  numberOfDependants: 1,
  agesOfDependants: [10],
  relationshipToOtherApplicants: 'Spouse to Daniel Okafor',

  adverseHistory: amaraAdverse,
  employment: amaraEmployment,
};

// ============================================================
// Parties
// ============================================================

const parties: Party[] = [
  {
    uuid: FIXTURE_IDS.partyDaniel,
    isPrimary: true,
    kind: 'Person',
    person: daniel,
  },
  {
    uuid: FIXTURE_IDS.partyAmara,
    isPrimary: false,
    kind: 'Person',
    person: amara,
  },
];

// ============================================================
// Collaterals — primary security + additional (OBTL-illustrative)
// ============================================================

const camberwell: Collateral = {
  uuid: FIXTURE_IDS.collateralCamberwell,
  address: {
    line1: '17 Camberwell Grove',
    city: 'London',
    postcode: 'SE5 8JA',
    country: 'United Kingdom',
  },
  uprn: '100021456789',
  titleNumber: 'TGL123456',
  tenure: 'Freehold',
  propertyType: 'Terraced House',
  isNewBuild: false,
  yearBuilt: 1840,
  bedrooms: 4,
  constructionType: 'Standard',
  floodRisk: 'Low',
  isListedOrConservation: true,
  listedGrade: 'II',
  isExCouncil: false,
  estimatedValue: 510000,
  purchasePrice: 510000,
  surveyedValue: 505000,
  lastValuationDate: '2026-05-02',
  valuationType: 'HomeBuyer',
  propertyUse: 'Owner Occupier',
  isCurrentlyTenanted: false,
  epcRating: 'C',
  epcExpiry: '2031-04-18',
  sapScore: 71,
  heatingType: 'Gas Central',
};

const denmark: Collateral = {
  uuid: FIXTURE_IDS.collateralDenmark,
  address: {
    line1: 'Flat 4',
    line2: '22 Denmark Hill',
    city: 'London',
    postcode: 'SE5 8RZ',
    country: 'United Kingdom',
  },
  titleNumber: 'TGL789012',
  tenure: 'Leasehold',
  leaseYearsRemaining: 95,
  propertyType: 'Flat',
  isNewBuild: false,
  yearBuilt: 1965,
  bedrooms: 2,
  constructionType: 'Standard',
  floodRisk: 'None',
  isListedOrConservation: false,
  isExCouncil: false,
  estimatedValue: 285000,
  propertyUse: 'Buy-to-Let',
  isCurrentlyTenanted: true,
  existingTenancyType: 'AST',
  epcRating: 'D',
  heatingType: 'Electric',
};

const collaterals: Collateral[] = [camberwell, denmark];

// ============================================================
// Arrangement
// ============================================================

const arrangement: Arrangement = {
  uuid: FIXTURE_IDS.arrangement,
  arrangementReference: 'ARR-2026-04-19847',
  applicationType: 'Purchase',
  productFamily: 'Owner Occupier',
  selectedProductCode: 'AFIN-PREM-OO-2YF-429',
  repaymentType: 'Capital & Interest',
  // Step 14b — loan amount is now derived from
  // `collateral.estimatedValue (£510,000) - depositAmount (£125,000)
  // = £385,000`. Property + deposit are the canonical inputs.
  loanTermYears: 25,
  rateType: '2yr Fixed',
  initialRate: 4.29,
  ltvPercent: 75.5,
  productFee: 999,
  productFeeAddedToLoan: false,
  indicativeMonthlyPayment: 2094,
  // Step 14 — Configuration Strip defaults.
  brokerFee: 0,
  productFeeHandling: 'upfront',
  brokerFeeHandling: 'upfront',
  depositAmount: 125000,
  depositSources: ['Savings', 'Gift'],
  depositSourceDetail:
    'Daniel: £75,000 from joint savings; Amara: £20,000 from ISA; Elizabeth Okafor (Daniel’s mother): £30,000 gifted (gift letter on file).',
  giftLetterHeld: true,
};

// ============================================================
// Third parties — Connected Parties tab
// ============================================================

const thirdParties: ThirdParty[] = [
  {
    uuid: FIXTURE_IDS.tpSarahChen,
    role: 'Solicitor',
    name: 'Chen & Partners',
    contactName: 'Sarah Chen',
    email: 'sarah.chen@chenpartners.co.uk',
    phone: '+44 20 7946 1212',
    address: {
      line1: '12 Bedford Square',
      city: 'London',
      postcode: 'WC1B 3JA',
    },
    actsFor: 'Applicants 1 & 2',
    roleDetails: { regulatorNumber: 'SRA 624891', onLenderPanel: true },
  },
  {
    uuid: FIXTURE_IDS.tpMarcusWebb,
    role: 'EstateAgent',
    name: 'Webb Residential',
    contactName: 'Marcus Webb',
    email: 'marcus.webb@webbresidential.co.uk',
    phone: '+44 20 3137 5050',
    actsFor: 'Vendor of 17 Camberwell Grove',
  },
  {
    uuid: FIXTURE_IDS.tpAOkafor,
    role: 'MortgageBroker',
    name: 'Afolabi Okafor — Bridgewater Mortgages',
    contactName: 'A. Okafor',
    email: 'afolabi@bridgewatermortgages.co.uk',
    phone: '+44 20 7946 0024',
    actsFor: 'Self · credit intermediary',
  },
  {
    uuid: FIXTURE_IDS.tpHargreaves,
    role: 'Other',
    name: 'Mr James Hargreaves',
    contactName: 'James Hargreaves',
    actsFor: 'Property owner — additional security · 22 Denmark Hill (OBTL-illustrative)',
  },
  {
    uuid: FIXTURE_IDS.tpElizabeth,
    role: 'Other',
    name: 'Elizabeth Okafor',
    contactName: 'Elizabeth Okafor',
    actsFor: 'Source of deposit · gift donor (Daniel’s mother)',
  },
  {
    uuid: FIXTURE_IDS.tpChidera,
    role: 'Other',
    name: 'Chidera Okafor',
    contactName: 'Chidera Okafor',
    actsFor: 'Occupant 17+ at 17 Camberwell Grove',
  },
];

// ============================================================
// Consents (case-level — C4/C5 live on AdverseHistory above)
// ============================================================

const consents: Consent[] = [
  {
    uuid: FIXTURE_IDS.consentPrivacyDaniel,
    kind: 'PrivacyNotice',
    partyUuid: FIXTURE_IDS.partyDaniel,
    granted: true,
    timestamp: CASE_CREATED_AT,
    channel: 'Fact-find form, page 1',
  },
  {
    uuid: FIXTURE_IDS.consentPrivacyAmara,
    kind: 'PrivacyNotice',
    partyUuid: FIXTURE_IDS.partyAmara,
    granted: true,
    timestamp: CASE_CREATED_AT,
    channel: 'Fact-find form, page 1',
  },
  {
    uuid: FIXTURE_IDS.consentAMLDaniel,
    kind: 'AML_ID',
    partyUuid: FIXTURE_IDS.partyDaniel,
    granted: true,
    timestamp: CASE_CREATED_AT,
  },
  {
    uuid: FIXTURE_IDS.consentAMLAmara,
    kind: 'AML_ID',
    partyUuid: FIXTURE_IDS.partyAmara,
    granted: true,
    timestamp: CASE_CREATED_AT,
  },
  {
    uuid: FIXTURE_IDS.consentOpenBankingJoint,
    kind: 'OpenBanking',
    partyUuid: FIXTURE_IDS.partyDaniel,
    granted: true,
    timestamp: '2026-04-21T09:30:00Z',
    channel: 'Open Banking flow · TrueLayer',
  },
];

// ============================================================
// Documents
// ============================================================

const documents: Document[] = [
  // 1. Fact-find — 18 extracted values across all entities, 2 conflicts.
  {
    uuid: FIXTURE_IDS.docFactFind,
    filename: 'okafor-fact-find.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1_842_312,
    pageCount: 12,
    source: 'BrokerUpload',
    type: 'FactFind',
    label: 'Fact-find · Okafor',
    uploadedAt: '2026-04-20T11:14:00Z',
    uploadedBy: 'A. Okafor (broker)',
    classificationType: 'FactFind',
    classificationConfidence: 98,
    classificationSource: 'AI text',
    ocrRequired: false,
    extractionStatus: 'PartiallyComplete',
    extractionStatusMessage: '2 conflicts pending broker review',
  },
  // 2. Daniel's payslip — March, 8 fields routed to Income.
  {
    uuid: FIXTURE_IDS.docPayslip,
    filename: 'payslip-march-daniel.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 412_507,
    pageCount: 1,
    source: 'BrokerUpload',
    type: 'Payslip',
    label: 'Payslip · Daniel · March 2026',
    uploadedAt: '2026-04-20T11:18:00Z',
    uploadedBy: 'A. Okafor (broker)',
    classificationType: 'Payslip',
    classificationConfidence: 96,
    classificationSource: 'AI text',
    ocrRequired: false,
    extractionStatus: 'Complete',
  },
  // 3. Daniel's passport — 3 fields routed to Identity.
  {
    uuid: FIXTURE_IDS.docPassport,
    filename: 'daniel-passport.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 2_154_983,
    pageCount: 1,
    source: 'BrokerUpload',
    type: 'Passport',
    label: 'Passport · Daniel',
    uploadedAt: '2026-04-20T11:22:00Z',
    uploadedBy: 'A. Okafor (broker)',
    classificationType: 'Passport',
    classificationConfidence: 99,
    classificationSource: 'AI image',
    ocrRequired: true,
    ocrConfidence: 94,
    extractionStatus: 'Complete',
  },
  // 4. Couldn't classify — low image quality. Awaiting manual classification.
  {
    uuid: FIXTURE_IDS.docScan003,
    filename: 'scan_003.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 612_002,
    pageCount: 1,
    source: 'ApplicantUpload',
    type: 'Other',
    label: 'Unclassified upload',
    uploadedAt: '2026-04-21T08:42:00Z',
    uploadedBy: 'Daniel Okafor (applicant)',
    classificationType: undefined,
    classificationConfidence: 12,
    classificationSource: 'AI image',
    ocrRequired: true,
    ocrConfidence: 28,
    extractionStatus: 'Skipped',
    extractionStatusMessage: 'Low image quality — broker to classify manually',
  },
  // 5. Joint bank statement — 18 expense + liability values, 1 conflict.
  {
    uuid: FIXTURE_IDS.docBankStatement,
    filename: 'joint-bank-statement-jan-mar.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1_245_891,
    pageCount: 24,
    source: 'BrokerUpload',
    type: 'BankStatement',
    label: 'Joint bank statement · Jan–Mar 2026',
    uploadedAt: '2026-04-21T09:05:00Z',
    uploadedBy: 'A. Okafor (broker)',
    classificationType: 'BankStatement',
    classificationConfidence: 92,
    classificationSource: 'AI text',
    ocrRequired: false,
    extractionStatus: 'PartiallyComplete',
    extractionStatusMessage: '1 conflict with payslip-derived income',
  },
  // 6. Lender valuation report — 6 property values.
  {
    uuid: FIXTURE_IDS.docValuation,
    filename: 'valuation.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 998_134,
    pageCount: 8,
    source: 'LenderIssued',
    type: 'ValuationReport',
    label: 'Valuation · 17 Camberwell Grove',
    uploadedAt: '2026-05-02T15:18:00Z',
    uploadedBy: 'Afin Bank',
    classificationType: 'ValuationReport',
    classificationConfidence: 91,
    classificationSource: 'AI text',
    ocrRequired: false,
    extractionStatus: 'Complete',
  },

  // === Special-state docs (loaded via dev panel) ===

  // 7. HEIC mid-OCR — "Reading…" spinner.
  {
    uuid: FIXTURE_IDS.docHeicProcessing,
    filename: 'chioma-passport-scan.heic',
    mimeType: 'image/heic',
    sizeBytes: 3_420_007,
    pageCount: 1,
    source: 'ApplicantUpload',
    type: 'Passport',
    label: 'Passport scan · processing',
    uploadedAt: NOW,
    uploadedBy: 'Chidera Okafor (applicant link)',
    classificationType: 'Passport',
    classificationConfidence: 78,
    classificationSource: 'AI image',
    ocrRequired: true,
    ocrConfidence: 45,
    extractionStatus: 'Running',
    extractionStatusMessage: 'Reading scan…',
  },
  // 8. mystery.pdf — class=?, awaiting broker manual classification.
  {
    uuid: FIXTURE_IDS.docMystery,
    filename: 'mystery.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 514_002,
    pageCount: 3,
    source: 'ApplicantUpload',
    type: 'Other',
    label: 'Unclassified PDF',
    uploadedAt: NOW,
    uploadedBy: 'Daniel Okafor (applicant)',
    classificationType: undefined,
    classificationConfidence: 18,
    classificationSource: 'AI text',
    ocrRequired: false,
    extractionStatus: 'Pending',
    extractionStatusMessage: 'Unable to classify — broker action required',
  },
];

// ============================================================
// Field Review Cards (FieldExtraction rows)
// ============================================================

const extractions: FieldExtraction[] = [
  // Card 1 · Already-accepted (high confidence, auto-applied).
  {
    uuid: FIXTURE_IDS.extDanielFirstName,
    documentId: FIXTURE_IDS.docPassport,
    evidencePageNumber: 1,
    evidenceSnippet: 'Surname: OKAFOR  ·  Given names: DANIEL CHUKWUEMEKA',
    targetEntity: 'Person',
    targetEntityId: FIXTURE_IDS.personDaniel,
    targetAttribute: 'A2',
    proposedValue: 'Daniel',
    proposedValueDisplay: 'Daniel',
    confidence: 99,
    method: 'AI image',
    status: 'Accepted',
    resolvedValue: 'Daniel',
    resolvedValueDisplay: 'Daniel',
    resolvedBy: 'A. Okafor (broker)',
    resolvedAt: '2026-04-20T11:25:00Z',
  },

  // Card 2 · Manually-overridden — broker corrected the AI value.
  {
    uuid: FIXTURE_IDS.extDanielEmail,
    documentId: FIXTURE_IDS.docFactFind,
    evidencePageNumber: 2,
    evidenceSnippet: 'Email: danielokafor@gmail.com (handwritten)',
    targetEntity: 'Person',
    targetEntityId: FIXTURE_IDS.personDaniel,
    targetAttribute: 'A21',
    proposedValue: 'danielokafor@gmail.com',
    proposedValueDisplay: 'danielokafor@gmail.com',
    confidence: 76,
    method: 'AI text',
    status: 'Overridden',
    resolvedValue: 'daniel.okafor@cliffordchance.com',
    resolvedValueDisplay: 'daniel.okafor@cliffordchance.com',
    resolvedBy: 'A. Okafor (broker)',
    resolvedAt: YESTERDAY,
  },

  // Card 3 · Awaiting-review · HIGH confidence — yellow review zone.
  {
    uuid: FIXTURE_IDS.extDanielAddress,
    documentId: FIXTURE_IDS.docFactFind,
    evidencePageNumber: 2,
    evidenceSnippet: 'Current address: 4 Pimlico Heights, Lupus Street, London SW1V 3AA',
    targetEntity: 'Person',
    targetEntityId: FIXTURE_IDS.personDaniel,
    targetAttribute: 'A23',
    proposedValue: {
      line1: '4 Pimlico Heights',
      line2: 'Lupus Street',
      city: 'London',
      postcode: 'SW1V 3AA',
    },
    proposedValueDisplay: '4 Pimlico Heights, Lupus Street, London SW1V 3AA',
    confidence: 88,
    method: 'AI text',
    status: 'Proposed',
  },

  // Card 4 · Awaiting-review · LOW confidence — red zone (smudged ink).
  {
    uuid: FIXTURE_IDS.extAmaraMiddleName,
    documentId: FIXTURE_IDS.docFactFind,
    evidencePageNumber: 1,
    evidenceSnippet: '[Middle names field — text smudged, partial read: "N…ola"]',
    targetEntity: 'Person',
    targetEntityId: FIXTURE_IDS.personAmara,
    targetAttribute: 'A3',
    proposedValue: 'Nkechi',
    proposedValueDisplay: 'Nkechi',
    confidence: 55,
    method: 'OCR',
    status: 'Proposed',
  },

  // Card 5 · CONFLICT — Daniel A51 basic salary monthly.
  // Two extractions for the same target attribute. The payslip value
  // has already been auto-accepted onto the field; the bank-statement
  // value is `Proposed` and surfaces as a yellow conflict card.
  {
    uuid: FIXTURE_IDS.extDanielSalaryPayslip,
    documentId: FIXTURE_IDS.docPayslip,
    evidencePageNumber: 1,
    evidenceSnippet: 'Basic Pay: £4,250.00\nDate: 27 March 2026',
    targetEntity: 'Employment',
    targetEntityId: FIXTURE_IDS.personDaniel,
    targetAttribute: 'A51',
    proposedValue: 4250,
    proposedValueDisplay: '£4,250.00 / month',
    confidence: 96,
    method: 'AI text',
    status: 'AutoAccepted',
    resolvedValue: 4250,
    resolvedValueDisplay: '£4,250.00 / month',
    resolvedBy: 'system',
    resolvedAt: '2026-04-20T11:19:00Z',
  },
  {
    uuid: FIXTURE_IDS.extDanielSalaryBank,
    documentId: FIXTURE_IDS.docBankStatement,
    evidencePageNumber: 4,
    evidenceSnippet: 'Salary credit · CLIFFORD CHANCE LLP · £4,180.00 (27 Mar)',
    targetEntity: 'Employment',
    targetEntityId: FIXTURE_IDS.personDaniel,
    targetAttribute: 'A51',
    proposedValue: 4180,
    proposedValueDisplay: '£4,180.00 / month',
    confidence: 92,
    method: 'AI text',
    status: 'Proposed',
  },
];

// ============================================================
// Financial items — Income, Expenditure, Liabilities
// ============================================================

const financialItems: FinancialItem[] = [
  // Incomes
  {
    kind: 'Income',
    uuid: FIXTURE_IDS.incDanielSalary,
    partyUuid: FIXTURE_IDS.partyDaniel,
    category: 'Salary',
    amount: 4250,
    frequency: 'Monthly',
    verified: true,
  },
  {
    kind: 'Income',
    uuid: FIXTURE_IDS.incDanielBonus,
    partyUuid: FIXTURE_IDS.partyDaniel,
    category: 'Bonus',
    amount: 25000,
    frequency: 'Annual',
    verified: false,
  },
  {
    kind: 'Income',
    uuid: FIXTURE_IDS.incAmaraSalary,
    partyUuid: FIXTURE_IDS.partyAmara,
    category: 'Salary',
    amount: 5500,
    frequency: 'Monthly',
    verified: true,
  },
  {
    kind: 'Income',
    uuid: FIXTURE_IDS.incAmaraBonus,
    partyUuid: FIXTURE_IDS.partyAmara,
    category: 'Bonus',
    amount: 8000,
    frequency: 'Annual',
    verified: true,
  },
  // Expenditure (joint household)
  {
    kind: 'Expenditure',
    uuid: FIXTURE_IDS.expCouncilTax,
    partyUuid: 'joint',
    category: 'CouncilTax',
    amount: 215,
    frequency: 'Monthly',
  },
  {
    kind: 'Expenditure',
    uuid: FIXTURE_IDS.expUtilities,
    partyUuid: 'joint',
    category: 'Utilities',
    amount: 285,
    frequency: 'Monthly',
  },
  {
    kind: 'Expenditure',
    uuid: FIXTURE_IDS.expChildcare,
    partyUuid: 'joint',
    category: 'Childcare',
    amount: 950,
    frequency: 'Monthly',
  },
  {
    kind: 'Expenditure',
    uuid: FIXTURE_IDS.expFood,
    partyUuid: 'joint',
    category: 'Food',
    amount: 720,
    frequency: 'Monthly',
  },
  {
    kind: 'Expenditure',
    uuid: FIXTURE_IDS.expTravel,
    partyUuid: 'joint',
    category: 'Travel',
    amount: 340,
    frequency: 'Monthly',
  },
  // Liabilities
  {
    kind: 'Liability',
    uuid: FIXTURE_IDS.liabCreditCardDaniel,
    partyUuid: FIXTURE_IDS.partyDaniel,
    category: 'CreditCard',
    label: 'Barclaycard Platinum',
    balance: 2400,
    monthlyPayment: 120,
    toBeRepaidOnCompletion: false,
  },
  {
    kind: 'Liability',
    uuid: FIXTURE_IDS.liabCarFinanceAmara,
    partyUuid: FIXTURE_IDS.partyAmara,
    category: 'CarFinance',
    label: 'VW Finance · Polo PCP',
    balance: 11_400,
    monthlyPayment: 285,
    endDate: '2027-08-30',
    toBeRepaidOnCompletion: false,
  },
  {
    kind: 'Liability',
    uuid: FIXTURE_IDS.liabStudentLoanDaniel,
    partyUuid: FIXTURE_IDS.partyDaniel,
    category: 'StudentLoan',
    label: 'Plan 2 student loan',
    balance: 32_500,
    monthlyPayment: 175,
    toBeRepaidOnCompletion: false,
  },
];

// ============================================================
// Provenance map — only the entries needed to demonstrate the seven
// states the brief calls out. Other populated fields default to
// "unspecified" provenance (the UI will treat these as Manual entries
// by the broker).
//
// The seven states:
//  1. AI-extracted          → Document, AI text, conf ≥ 90
//  2. OCR-assisted          → Document, method 'OCR', conf 70–89
//  3. Broker-confirmed      → Document, paired with Accepted extraction
//  4. Broker-edited         → Manual after an extraction was overridden
//  5. Manually-entered      → Manual, no upstream extraction
//  6. Locked-at-DIP         → Locked, lockedAt = DIP submission time
//  7. Updated-post-DIP      → Manual, enteredAt > DIP submission time
// ============================================================

const provenanceMap: Record<string, Provenance> = {
  // 1 · AI-extracted (high-confidence, auto-applied) — Daniel A23 currentAddress.
  [`Person:${FIXTURE_IDS.personDaniel}:A23`]: {
    source: 'Document',
    documentId: FIXTURE_IDS.docFactFind,
    documentLabel: 'okafor-fact-find.pdf · p.2',
    pageNumber: 2,
    confidence: 92,
    method: 'AI text',
    evidenceSnippet:
      'Current address: 4 Pimlico Heights, Lupus Street, London SW1V 3AA',
  },

  // 2 · OCR-assisted — Daniel A6 dateOfBirth from passport image.
  [`Person:${FIXTURE_IDS.personDaniel}:A6`]: {
    source: 'Document',
    documentId: FIXTURE_IDS.docPassport,
    documentLabel: 'daniel-passport.jpg · p.1',
    pageNumber: 1,
    confidence: 85,
    method: 'OCR',
    evidenceSnippet: 'Date of birth: 12 MAR 1985',
  },

  // 3 · Broker-confirmed — Daniel A2 firstName. Document-source provenance,
  //     extraction record (above) shows status='Accepted' by broker.
  [`Person:${FIXTURE_IDS.personDaniel}:A2`]: {
    source: 'Locked',
    lockedAt: DIP_SUBMITTED_AT,
  },

  // (Note: A2 above doubles as the LOCKED-AT-DIP example. Identity
  //  fields are conventionally frozen at DIP submission. The
  //  broker-confirmed example uses A4 lastName instead.)
  [`Person:${FIXTURE_IDS.personDaniel}:A4`]: {
    source: 'Document',
    documentId: FIXTURE_IDS.docPassport,
    documentLabel: 'daniel-passport.jpg · p.1',
    pageNumber: 1,
    confidence: 99,
    method: 'AI image',
    evidenceSnippet: 'Surname: OKAFOR',
  },

  // 4 · Broker-edited — Daniel A21 email. AI proposed gmail; broker
  //     overrode to corporate. Provenance switches to Manual + the
  //     extraction record carries the override history.
  [`Person:${FIXTURE_IDS.personDaniel}:A21`]: {
    source: 'Manual',
    enteredBy: 'A. Okafor (broker)',
    enteredAt: YESTERDAY,
  },

  // 5 · Manually-entered — Daniel A46 jobTitle "Solicitor".
  //     No upstream document. THIS triggers the Professional nudge
  //     (jobTitle = Solicitor + employer = Clifford Chance LLP).
  [`Employment:${FIXTURE_IDS.personDaniel}:A46`]: {
    source: 'Manual',
    enteredBy: 'A. Okafor (broker)',
    enteredAt: TWO_DAYS_AGO,
  },

  // 6 · Locked-at-DIP — covered by A2 above (kept here for reference).
  // 7 · Updated-post-DIP — Daniel A53 variableIncome (£25k bonus).
  //     Broker keyed this AFTER DIP submission.
  [`Employment:${FIXTURE_IDS.personDaniel}:A53`]: {
    source: 'Manual',
    enteredBy: 'A. Okafor (broker)',
    enteredAt: NOW,
  },

  // Bonus entries to round out the demo:

  // Daniel A51 basic income — Document provenance pointing to payslip,
  // even though there's a competing bank-statement extraction in the
  // conflict queue.
  [`Employment:${FIXTURE_IDS.personDaniel}:A51`]: {
    source: 'Document',
    documentId: FIXTURE_IDS.docPayslip,
    documentLabel: 'payslip-march-daniel.pdf · p.1',
    pageNumber: 1,
    confidence: 96,
    method: 'AI text',
    evidenceSnippet: 'Basic Pay: £4,250.00',
  },

  // Camberwell estimated value — Document provenance, valuation report.
  [`Collateral:${FIXTURE_IDS.collateralCamberwell}:P16`]: {
    source: 'Document',
    documentId: FIXTURE_IDS.docValuation,
    documentLabel: 'valuation.pdf · p.3',
    pageNumber: 3,
    confidence: 91,
    method: 'AI text',
    evidenceSnippet: 'Open market value: £510,000',
  },

  // LTV — Derived from loanAmount / Collateral.estimatedValue.
  [`Arrangement:${FIXTURE_IDS.arrangement}:M11`]: {
    source: 'Derived',
    derivedFrom: 'M6 Loan amount (£385,000) ÷ P16 Estimated value (£510,000) × 100',
  },

  // Indicative monthly payment — Derived from loan, term, rate.
  [`Arrangement:${FIXTURE_IDS.arrangement}:M14`]: {
    source: 'Derived',
    derivedFrom: 'M6 £385,000, M7 25y, M10 4.29% — C&I payment formula',
  },
};

// ============================================================
// DIP results — Step 13
// Seed with 3 completed DIPs so the Decisions panel renders on
// first load. Inputs match the canonical arrangement (£385k loan,
// 75.5% LTV, 25y term) — every result is initially fresh.
// ============================================================

const DIP_INPUTS_SNAPSHOT = {
  // Step 14b — loan amount is now derived (£510,000 - £125,000 = £385,000).
  propertyValue: 510000,
  depositAmount: 125000,
  termYears: 25,
  brokerFee: 0,
  productFeeHandling: 'upfront' as const,
  brokerFeeHandling: 'upfront' as const,
};

const dipResults: DIPResult[] = [
  {
    id: 'dip-result-premier-2yr',
    productId: 'premier-2yr-fixed',
    status: 'approved',
    decidedAt: '2026-05-07T09:14:00Z',
    inputsSnapshot: DIP_INPUTS_SNAPSHOT,
    pricing: {
      initialRatePct: 4.29,
      revertRatePct: 7.99,
      monthlyPayment: 1894,
      arrangementFee: 999,
      // 2-year fixed deal cost: 24 monthly + arrangement fee.
      totalCostOverDeal: 1894 * 24 + 999,
      ercSummary: '2% / 1%',
    },
  },
  {
    id: 'dip-result-standard-5yr',
    productId: 'standard-5yr-fixed',
    status: 'approved',
    decidedAt: '2026-05-07T09:21:00Z',
    inputsSnapshot: DIP_INPUTS_SNAPSHOT,
    pricing: {
      initialRatePct: 4.54,
      revertRatePct: 7.99,
      monthlyPayment: 1948,
      arrangementFee: 0,
      // 5-year fixed deal cost: 60 monthly + zero arrangement fee.
      totalCostOverDeal: 1948 * 60,
      ercSummary: '3% / 2% / 1%',
    },
  },
  {
    id: 'dip-result-premier-5yr',
    productId: 'premier-5yr-fixed',
    status: 'declined',
    decidedAt: '2026-05-07T09:30:00Z',
    inputsSnapshot: DIP_INPUTS_SNAPSHOT,
    declineReason:
      'LTV 75.5% exceeds the Premier 5-yr fixed threshold of 70%. Reduce loan or top up deposit to qualify.',
  },
];

// ============================================================
// Final Case fixture
// ============================================================

export const okaforCase: Case = {
  reference: 'ARR-2026-04-19847',
  stage: 'FullApplication',
  subStage: 'dip-success',
  createdAt: CASE_CREATED_AT,
  updatedAt: NOW,
  ownerName: 'A. Okafor',

  arrangement,
  parties,
  collaterals,
  thirdParties,
  consents,
  documents,
  extractions,
  financialItems,
  provenanceMap,

  // Consents-tab UI assertions (Step 12). Defaults derived from the
  // canonical fixture: Open Banking already granted via `consents[]`,
  // Application Declaration deliberately unsigned so the submission
  // gate has at least one blocker on first render.
  consentAssertions: {
    OpenBanking: true,
    VulnerabilityFlag: false,
    IncomeReductionExpectation: false,
    CriminalConvictionDeclaration: true,
    PreferredPaymentDate: true,
    IntentToOverpay: false,
    BTLPropertyObligations: false,
    ApplicationDeclaration: false,
  },

  dipResults,

  // Step 16 — start the case in DIP phase. Dev panel advances it.
  phase: 'dip',

  // Step 21 — broker's preferred standing-order payment date.
  preferredPaymentDate: 1,


  // Step 17 — pre-seed obvious placeholder fills so the broker sees a
  // partially-loaded shopping list on first render. Anything the
  // resolver can't pin to a placeholder lands in Unclassified.
  documentPlaceholderAssignments: {
    [FIXTURE_IDS.docPassport]: `identity-passport:${FIXTURE_IDS.partyDaniel}`,
    [FIXTURE_IDS.docPayslip]: `income-payslips:${FIXTURE_IDS.partyDaniel}`,
    [FIXTURE_IDS.docBankStatement]: `bank-personal:${FIXTURE_IDS.partyDaniel}`,
    [FIXTURE_IDS.docFactFind]: 'affordability-snl',
    [FIXTURE_IDS.docValuation]: 'property-valuation',
  },
};

// ============================================================
// Dev panel state — see store/caseStore.ts for the mutators.
// ============================================================

export type DevDIPState =
  /** DIP not yet submitted (Documents stage). */
  | 'not-submitted'
  /** DIP submitted, awaiting decision. */
  | 'pending'
  /** DIP accepted — case can move to full app. */
  | 'success'
  /** DIP declined / referred. */
  | 'fail'
  /** Full application stage. */
  | 'full-app';

export type DevDocState =
  | 'pending'
  | 'classifying'
  | 'ocr'
  | 'extracting'
  | 'done';

export interface DevPanelState {
  /** Currently-selected DIP / lifecycle state. */
  dipState: DevDIPState;
  /** Doc state being demonstrated on the in-flight HEIC scan. */
  docState: DevDocState;
  /** Whether the bank-statement vs payslip salary conflict is injected. */
  conflictInjected: boolean;
  /** Whether the dev panel is open. */
  isOpen: boolean;
  /** Drives the outcome of the next DIP run via `runDIP`. `auto`
   *  rotates Approve → Decline → Refer using `autoOutcomeIndex`. */
  nextDIPOutcome: import('../tabs/products/dipResults').DIPOutcomeStrategy;
  /** Round-robin counter for the `auto` outcome strategy. Bumped by
   *  the store each time a DIP completes under `auto`. */
  autoOutcomeIndex: number;
  /** Step 24 — when true, the Timeline tab renders its skeleton
   *  loading state in place of the real timeline. Dev-only. */
  timelineForceLoading: boolean;
  /** Step 25 — same pattern for the Messages tab. */
  messagesForceLoading: boolean;
  /** Step 25 — drives the typing indicator on the Messages tab.
   *  Default `true` so the design lands as in the reference; toggle
   *  off to capture the no-typing variant. */
  messagesShowTyping: boolean;
}

export const initialDevPanelState: DevPanelState = {
  dipState: 'full-app',
  docState: 'extracting',
  conflictInjected: true,
  isOpen: false,
  nextDIPOutcome: 'auto',
  autoOutcomeIndex: 0,
  timelineForceLoading: false,
  messagesForceLoading: false,
  messagesShowTyping: true,
};
