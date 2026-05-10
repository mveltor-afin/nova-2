import type { Case } from './case';
import type { Document, DocumentType } from './document';
import type { Party } from './party';
import { readField } from '../rules/fieldStatus';

type PersonParty = Extract<Party, { kind: 'Person' }>;

/**
 * Step 17 — the document tab is driven by a static catalogue of
 * "placeholders" (one per expected artefact). The catalogue is
 * resolved against a case to produce per-applicant + case-level rows
 * with derived state (empty / uploading / awaiting-review / done).
 *
 * Two paths populate a placeholder:
 *  - Direct upload onto the placeholder → deterministic typed assign
 *  - Drop drawer → AI classification → match-by-expectedType
 *
 * Conditions reference register IDs and are evaluated via
 * `readField` (rules/fieldStatus).
 */

export type DocumentCategory =
  | 'identity'
  | 'income-employed'
  | 'income-self-employed'
  | 'bank-statements'
  | 'property'
  | 'affordability'
  | 'deposit'
  | 'declarations';

export const CATEGORY_ORDER: DocumentCategory[] = [
  'identity',
  'income-employed',
  'income-self-employed',
  'bank-statements',
  'property',
  'affordability',
  'deposit',
  'declarations',
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identity: 'Identity & residency',
  'income-employed': 'Income — Employed',
  'income-self-employed': 'Income — Self-employed',
  'bank-statements': 'Bank statements',
  property: 'Property documents',
  affordability: 'Affordability evidence',
  deposit: 'Deposit evidence',
  declarations: 'Declarations & consents',
};

/** Brief codes — different from the model's `productFamily` enum.
 *  Mapping lives in `productFamilyCode` below. */
export type ProductFamilyCode = 'resi' | 'btl' | 'rb' | 'obtl';

export interface DocumentPlaceholderCondition {
  /** Register id (A/P/M/D/E/T). */
  fieldId: string;
  /** Equality test. Array means "value is one of". */
  equals: unknown | unknown[];
  /** When true, the condition must NOT match. Used for fallback IDs etc. */
  negate?: boolean;
}

export interface DocumentPlaceholderSpec {
  id: string;
  category: DocumentCategory;
  label: string;
  description?: string;
  perApplicant: boolean;
  productFamilies: ProductFamilyCode[];
  mandatory: boolean;
  condition?: DocumentPlaceholderCondition;
  expectedType: DocumentType;
  hint?: string;
}

export type ResolvedPlaceholderState =
  | 'empty'
  | 'uploading'
  | 'classifying'
  | 'awaiting-review'
  | 'done'
  | 'error';

export interface ResolvedPlaceholder {
  spec: DocumentPlaceholderSpec;
  uniqueKey: string;
  applicantId?: string;
  applicantLabel?: string;
  state: ResolvedPlaceholderState;
  documentId?: string;
}

// ============================================================
// Catalogue
// ============================================================

const RESI: ProductFamilyCode[] = ['resi', 'btl', 'rb', 'obtl'];
const RESI_BTL: ProductFamilyCode[] = ['resi', 'btl', 'obtl'];

export const DOCUMENT_PLACEHOLDERS: DocumentPlaceholderSpec[] = [
  // === Identity & residency (per applicant) ===
  {
    id: 'identity-passport',
    category: 'identity',
    label: 'Passport',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'Passport',
  },
  {
    id: 'identity-driving-licence',
    category: 'identity',
    label: 'Driving licence',
    description: 'Optional fallback ID — accept when no passport is held.',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'DrivingLicence',
  },
  {
    id: 'identity-brp',
    category: 'identity',
    label: 'BRP / Visa',
    description: 'Required when applicant is non-British or holds a UK visa.',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A14',
      equals: ['British Citizen', 'Settled (ILR)'],
      negate: true,
    },
    expectedType: 'BRP',
  },
  {
    id: 'identity-proof-of-address',
    category: 'identity',
    label: 'Proof of address',
    description: 'Utility bill or council tax dated within 3 months.',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'ProofOfAddress',
  },

  // === Income — Employed (per applicant) ===
  {
    id: 'income-payslips',
    category: 'income-employed',
    label: "Latest 3 months' payslips",
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A41',
      equals: ['Employed', 'Director'],
    },
    expectedType: 'Payslip',
  },
  {
    id: 'income-p60',
    category: 'income-employed',
    label: 'P60 (most recent)',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A41',
      equals: ['Employed', 'Director'],
    },
    expectedType: 'P60',
  },
  {
    id: 'income-employment-contract',
    category: 'income-employed',
    label: 'Employment contract',
    description: 'Open-ended, fixed-term, or IR35 — variant from case answer.',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: false,
    condition: {
      fieldId: 'A41',
      equals: ['Employed', 'Director', 'Contractor'],
    },
    expectedType: 'EmploymentContract',
  },

  // === Income — Self-employed (per applicant) ===
  {
    id: 'income-sa302',
    category: 'income-self-employed',
    label: 'SA302 (last 2 years)',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A41',
      equals: ['Self-Employed', 'Contractor'],
    },
    expectedType: 'SA302',
  },
  {
    id: 'income-tax-year-overview',
    category: 'income-self-employed',
    label: 'Tax Year Overview (last 2 years)',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A41',
      equals: ['Self-Employed', 'Contractor'],
    },
    expectedType: 'TaxYearOverview',
  },
  {
    id: 'income-accountant-cert',
    category: 'income-self-employed',
    label: "Accountant's certificate",
    perApplicant: true,
    productFamilies: RESI,
    mandatory: false,
    condition: {
      fieldId: 'A41',
      equals: ['Self-Employed', 'Director', 'Contractor'],
    },
    expectedType: 'AccountantReference',
  },
  {
    id: 'income-company-accounts',
    category: 'income-self-employed',
    label: "Latest 2 years' filed accounts",
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'A41',
      equals: ['Self-Employed', 'Director'],
    },
    expectedType: 'CompanyAccounts',
  },
  {
    id: 'income-business-bank',
    category: 'income-self-employed',
    label: 'Business bank statements (3 months)',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: false,
    condition: {
      fieldId: 'A41',
      equals: ['Self-Employed', 'Director'],
    },
    expectedType: 'BankStatement',
  },

  // === Bank statements (per applicant) ===
  {
    id: 'bank-personal',
    category: 'bank-statements',
    label: 'Personal bank statements (3 months)',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'BankStatement',
  },

  // === Property documents (case-level) ===
  {
    id: 'property-brochure',
    category: 'property',
    label: 'Property brochure / sales particulars',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'Other',
  },
  {
    id: 'property-ast',
    category: 'property',
    label: 'AST / Tenancy agreement',
    description: 'Required when rental income is declared or for BTL.',
    perApplicant: false,
    productFamilies: ['btl', 'obtl'],
    mandatory: true,
    condition: {
      fieldId: 'P21',
      equals: ['Buy-to-Let'],
    },
    expectedType: 'Other',
  },
  {
    id: 'property-ground-rent',
    category: 'property',
    label: 'Ground rent statement',
    description: 'Leasehold properties only.',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'P4',
      equals: 'Leasehold',
    },
    expectedType: 'Other',
  },
  {
    id: 'property-lease-title',
    category: 'property',
    label: 'Lease / Title document',
    description: 'Leasehold properties only — full register copy.',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'P4',
      equals: 'Leasehold',
    },
    expectedType: 'LandRegistryTitle',
  },
  {
    id: 'property-building-insurance',
    category: 'property',
    label: 'Building insurance schedule',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'Other',
  },
  {
    id: 'property-valuation',
    category: 'property',
    label: 'Lender valuation report',
    description: 'Issued by Afin once instructed — informational placeholder.',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'ValuationReport',
  },

  // === Affordability evidence ===
  {
    id: 'affordability-snl',
    category: 'affordability',
    label: 'Statement of Assets & Liabilities',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'FactFind',
  },
  {
    id: 'affordability-portfolio',
    category: 'affordability',
    label: 'Property Portfolio',
    description: 'Required when an existing portfolio is declared or for BTL.',
    perApplicant: false,
    productFamilies: ['btl', 'obtl'],
    mandatory: true,
    condition: {
      fieldId: 'P21',
      equals: ['Buy-to-Let'],
    },
    expectedType: 'Other',
  },
  {
    id: 'affordability-debt-details',
    category: 'affordability',
    label: 'Debt details',
    description: 'Up to 5 active credit commitments per applicant.',
    perApplicant: true,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'Other',
  },

  // === Deposit evidence (case-level) ===
  {
    id: 'deposit-source',
    category: 'deposit',
    label: 'Source of deposit evidence',
    description: 'Savings statement, sale-of-property completion, etc.',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'DepositSourceEvidence',
  },
  {
    id: 'deposit-gift',
    category: 'deposit',
    label: 'Gift deed',
    description: 'Required when any deposit source is "Gift".',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'D4',
      equals: true,
    },
    expectedType: 'GiftLetter',
  },

  // === Declarations & consents (case-level) ===
  {
    id: 'declaration-application',
    category: 'declarations',
    label: 'Application Declaration',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    expectedType: 'FactFind',
  },
  {
    id: 'declaration-interest-only',
    category: 'declarations',
    label: 'Interest-Only Declaration',
    description: 'Required when repayment type is Interest-only.',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: true,
    condition: {
      fieldId: 'M5',
      equals: 'Interest Only',
    },
    expectedType: 'IDD',
  },
  {
    id: 'declaration-occupier-consent',
    category: 'declarations',
    label: 'Occupier Consent Form',
    description: 'For each non-applicant adult occupier (17+).',
    perApplicant: false,
    productFamilies: RESI,
    mandatory: false,
    expectedType: 'IDD',
  },
  {
    id: 'declaration-exit-strategy',
    category: 'declarations',
    label: 'Exit Strategy evidence',
    description: 'Bridging only — proof of repayment route.',
    perApplicant: false,
    productFamilies: ['rb'],
    mandatory: true,
    expectedType: 'Other',
  },
];

// ============================================================
// Resolver
// ============================================================

const PRODUCT_FAMILY_CODE: Record<string, ProductFamilyCode> = {
  'Owner Occupier': 'resi',
  Premier: 'resi',
  Professional: 'resi',
  'Buy-to-Let': 'btl',
  Bridging: 'rb',
};

export function productFamilyCode(family: string): ProductFamilyCode {
  return PRODUCT_FAMILY_CODE[family] ?? 'resi';
}

/**
 * Resolve the placeholder catalogue against a case. Filters by
 * product family + condition; expands per-applicant placeholders into
 * one row per applicant; matches each row to a document via the
 * assignment map (with a fallback to first-of-type).
 */
export function resolvePlaceholders(c: Case): ResolvedPlaceholder[] {
  const family = productFamilyCode(c.arrangement.productFamily);
  const persons = c.parties.filter(
    (p): p is PersonParty => p.kind === 'Person',
  );
  const assignments = c.documentPlaceholderAssignments ?? {};

  const usedDocs = new Set<string>();
  const out: ResolvedPlaceholder[] = [];

  for (const spec of DOCUMENT_PLACEHOLDERS) {
    if (!spec.productFamilies.includes(family)) continue;

    if (spec.perApplicant) {
      for (const party of persons) {
        if (!matchesCondition(c, spec.condition, party.uuid)) continue;
        const uniqueKey = `${spec.id}:${party.uuid}`;
        const doc = pickDocument(c, spec, uniqueKey, party.uuid, assignments, usedDocs);
        if (doc) usedDocs.add(doc.uuid);
        out.push({
          spec,
          uniqueKey,
          applicantId: party.uuid,
          applicantLabel: `${party.person.firstName} ${party.person.lastName}`,
          state: deriveState(doc),
          documentId: doc?.uuid,
        });
      }
    } else {
      if (!matchesCondition(c, spec.condition)) continue;
      const uniqueKey = spec.id;
      const doc = pickDocument(c, spec, uniqueKey, undefined, assignments, usedDocs);
      if (doc) usedDocs.add(doc.uuid);
      out.push({
        spec,
        uniqueKey,
        state: deriveState(doc),
        documentId: doc?.uuid,
      });
    }
  }

  return out;
}

/**
 * Return docs not currently filling any resolved placeholder. Excludes
 * Nova-generated artefacts (audit pack, DIP cert) since those belong
 * on Downloads, not the inbox.
 */
export function unclassifiedDocuments(
  c: Case,
  resolved: ResolvedPlaceholder[],
): Document[] {
  const used = new Set(
    resolved.map((r) => r.documentId).filter((x): x is string => !!x),
  );
  return c.documents.filter((d) => {
    if (used.has(d.uuid)) return false;
    if (d.source === 'NovaGenerated' || d.source === 'LenderIssued') return false;
    return true;
  });
}

function matchesCondition(
  c: Case,
  cond: DocumentPlaceholderCondition | undefined,
  partyUuid?: string,
): boolean {
  if (!cond) return true;
  const value = readField(c, cond.fieldId, partyUuid);
  const match = Array.isArray(cond.equals)
    ? (cond.equals as unknown[]).includes(value)
    : value === cond.equals;
  return cond.negate ? !match : match;
}

function pickDocument(
  c: Case,
  spec: DocumentPlaceholderSpec,
  uniqueKey: string,
  applicantId: string | undefined,
  assignments: Record<string, string>,
  usedDocs: Set<string>,
): Document | undefined {
  const explicitId = Object.entries(assignments).find(
    ([, key]) => key === uniqueKey,
  )?.[0];
  if (explicitId) {
    const doc = c.documents.find((d) => d.uuid === explicitId);
    if (doc) return doc;
  }

  const candidates = c.documents.filter((d) => {
    if (usedDocs.has(d.uuid)) return false;
    if (assignments[d.uuid] && assignments[d.uuid] !== uniqueKey) return false;
    if (d.source === 'NovaGenerated' || d.source === 'LenderIssued') {
      return spec.expectedType === d.type;
    }
    const t = d.type;
    const ct = d.classificationType;
    return t === spec.expectedType || ct === spec.expectedType;
  });
  if (candidates.length === 0) return undefined;
  if (!applicantId) return candidates[0];

  const byApplicant = candidates.find((d) =>
    looksLikeApplicantDoc(c, d, applicantId),
  );
  return byApplicant ?? candidates[0];
}

function looksLikeApplicantDoc(
  c: Case,
  doc: Document,
  applicantId: string,
): boolean {
  if (
    c.extractions.some(
      (e) =>
        e.documentId === doc.uuid &&
        e.targetEntity === 'Person' &&
        e.targetEntityId === applicantId,
    )
  ) {
    return true;
  }
  const party = c.parties.find((p) => p.uuid === applicantId);
  if (!party || party.kind !== 'Person') return false;
  const first = party.person.firstName.toLowerCase();
  return doc.filename.toLowerCase().includes(first);
}

function deriveState(doc: Document | undefined): ResolvedPlaceholderState {
  if (!doc) return 'empty';
  if (doc.extractionStatus === 'Errored') return 'error';
  if (doc.extractionStatus === 'Running') return 'classifying';
  if (
    doc.extractionStatus === 'Pending' &&
    !doc.classificationType
  ) {
    return 'classifying';
  }
  if (doc.extractionStatus === 'PartiallyComplete') return 'awaiting-review';
  return 'done';
}
