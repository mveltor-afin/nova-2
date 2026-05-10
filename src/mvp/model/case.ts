import type { DateTimeString } from './primitives';
import type { Party } from './party';
import type { Collateral } from './collateral';
import type { Arrangement } from './arrangement';
import type { ThirdParty } from './thirdparty';
import type { Consent } from './consent';
import type { Document } from './document';
import type { FieldExtraction } from './extraction';
import type { FinancialItem } from './financial';
import type { Provenance } from './provenance';
import type { DIPResult } from '../tabs/products/dipResults';

/**
 * Case — the single top-level container for every value that travels
 * with one Arrangement. The whole MVP store is `{ case: Case }`.
 *
 * Provenance is stored *out-of-band* in `provenanceMap` rather than
 * sprinkled across every field. The key format is:
 *
 *   `${entityType}:${entityId}:${registerId}`
 *
 * e.g. `Person:abc-123-def:A2`, `Collateral:xyz-789:P16`,
 *      `Arrangement:arrangement-uuid:M6`, `Income:liab-uuid:I1`.
 *
 * This keeps the typed entity records lean (so the type system can
 * police DIP-vs-Full-app required fields) while still giving the
 * universal `<Provenance />` component a single lookup path.
 */
export interface Case {
  // === Identity & lifecycle ===
  /** `ARR-YYYY-MM-NNNNN`. Always equals `arrangement.arrangementReference`
   *  but duplicated here for ergonomic top-level access. */
  reference: string;
  /** Lifecycle stage (5-stage rail). */
  stage: CaseStage;
  /** Sub-stage within Documents / Full application (for the progress ring). */
  subStage?: string;
  /** When the case was created (broker started intake). */
  createdAt: DateTimeString;
  /** Last activity timestamp. Drives "Updated 2 minutes ago" pills. */
  updatedAt: DateTimeString;
  /** Who owns the case (broker display name). */
  ownerName?: string;

  // === Top-level entities ===
  arrangement: Arrangement;
  /** Applicants. The MVP populates 1–2 `kind: 'Person'` entries; other
   *  party kinds are typed but not selectable. Exactly one isPrimary. */
  parties: Party[];
  /** Property security. MVP has exactly one. */
  collaterals: Collateral[];
  /** Solicitors, surveyors, packagers etc. */
  thirdParties: ThirdParty[];
  /** Case-level consents (C1–C3, C6–C9). C4/C5 live on `AdverseHistory`. */
  consents: Consent[];
  /** Uploaded + generated + lender-issued documents. The Documents and
   *  Downloads tabs filter this single array by `source`. */
  documents: Document[];
  /** AI-extraction queue (proposed values awaiting broker resolution
   *  + the historical record after resolution). */
  extractions: FieldExtraction[];
  /** Income / Expenditure / Liability rows, all on one array. Each
   *  row carries `partyUuid` to scope it to an applicant or 'joint'. */
  financialItems: FinancialItem[];

  // === Universal provenance lookup ===
  /** Keyed by `${entityType}:${entityId}:${registerId}`. */
  provenanceMap: Record<string, Provenance>;

  // === Consents tab — flat assertion map ===
  /**
   * Asserted/declined state for each Consents-tab tile, keyed by tile id
   * (e.g. `OpenBanking`, `ApplicationDeclaration`). Distinct from the
   * structured `consents[]` array which carries per-party signed records;
   * this flat map drives the Step 12 UI.
   */
  consentAssertions: Record<string, boolean>;

  // === Submission ===
  /** When set, the case has been submitted to the underwriter. */
  submittedAt?: DateTimeString;
  // Step 23 — `fullAppSubmitted` removed; the stage rail carries the
  // same information (`stage !== 'submission'` ⇒ submitted).

  // === Step 16 — Lifecycle phase (independent of `stage` / `subStage`,
  // which track DIP run state within the DIP phase). ===
  /** Current lifecycle phase. */
  phase: Phase;
  /** Active stop on the Full Application stepper. Required when
   *  `phase === 'full-application'`, undefined otherwise. */
  fullAppStage?: FullAppStage;

  // === Products / DIP results (Step 13) ===
  /**
   * One DIP result per product code at any time. Re-running a product
   * replaces its prior result. Freshness is derived per-card by
   * comparing each `inputsSnapshot` to the live arrangement.
   */
  dipResults: DIPResult[];

  // === Step 21 — Preferred payment date (Consents tab) ===
  /** Day of month (1–28) the broker picks for the standing-order
   *  payment. Capped at 28 to avoid Feb edge cases; lender confirms
   *  availability post-completion. */
  preferredPaymentDate?: number;

  // === Documents tab assignments (Step 17) ===
  /**
   * Documents tab placeholder assignments. Keyed by `Document.uuid`,
   * value is a `ResolvedPlaceholder.uniqueKey` (e.g.
   * `identity-passport:person-daniel-okafor`). Stored out-of-band so
   * the Document model itself stays type-clean and so an unassigned
   * doc lands in the Unclassified section by default.
   */
  documentPlaceholderAssignments?: Record<string, string>;
}

/**
 * Legacy 5-stage rail enum. Kept as the DIP-run-state lookup the dev
 * panel writes to (Intake / Documents / DIPSubmitted / FullApplication /
 * Completion). Step 16 introduces a separate `Phase` field for the
 * lifecycle indicator — the two are orthogonal.
 */
export type CaseStage =
  | 'Intake'
  | 'Documents'
  | 'DIPSubmitted'
  | 'FullApplication'
  | 'Completion';

/**
 * Step 16 — lifecycle phase shown by the ContextHeader's PhaseIndicator.
 * Distinct from `CaseStage` (DIP run state) and from `submittedAt`
 * (records "submitted to underwriter" but doesn't drive UI state on its
 * own).
 */
export type Phase = 'dip' | 'full-application' | 'disbursed';

/** Step 23 — six stops on the Full Application stepper. The new
 *  leading `submission` stop is the broker's stage: complete consents
 *  + Application Declaration, then click Submit to advance to KYC.
 *  Stages KYC → Completion are lender-driven (dev-panel advance in
 *  the wireframe). */
export type FullAppStage =
  | 'submission'
  | 'kyc'
  | 'underwriting'
  | 'offer'
  | 'valuation'
  | 'completion';

export const FULL_APP_STAGES: FullAppStage[] = [
  'submission',
  'kyc',
  'underwriting',
  'offer',
  'valuation',
  'completion',
];

export const FULL_APP_STAGE_LABELS: Record<FullAppStage, string> = {
  submission: 'Submission',
  kyc: 'KYC',
  underwriting: 'Underwriting',
  offer: 'Offer',
  valuation: 'Valuation',
  completion: 'Completion',
};
