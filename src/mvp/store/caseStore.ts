import { create } from 'zustand';

import type {
  Case,
  CaseStage,
  Phase,
  FullAppStage,
} from '../model/case';
import { FULL_APP_STAGES } from '../model/case';
import type { FieldExtraction } from '../model/extraction';
import type { Money } from '../model/primitives';
import type { Arrangement } from '../model/arrangement';
import {
  okaforCase,
  initialDevPanelState,
  FIXTURE_IDS,
  type DevPanelState,
  type DevDIPState,
  type DevDocState,
} from '../mock/fixtures';
import {
  type DIPResult,
  type DIPOutcomeStrategy,
  type DIPInputs,
  buildPricing,
  readInputs,
  resolveOutcome,
  isFreshApproved,
} from '../tabs/products/dipResults';
import { findProduct, PRODUCTS } from '../tabs/products/catalogue';
import {
  type EntityRef,
  getPersonSetter,
  getCollateralSetter,
  getArrangementSetter,
  getThirdPartySetter,
} from '../model/fieldMap';
import type { Provenance } from '../model/provenance';
import type { Person } from '../model/person';
import type { Party } from '../model/party';

// Re-export so consumers don't have to dig into model/fieldMap.
export type { EntityRef };

// === Drawer state ===

/**
 * Discriminated union of every drawer the workspace can have open at
 * once. Only one is visible at a time — opening a new one replaces
 * the previous. `kind: 'none'` means closed.
 */
export type DrawerState =
  | { kind: 'none' }
  | {
      kind: 'field-review';
      filter?: 'all' | 'pending' | 'conflicts';
      /** When set, queue is scoped to extractions from this document only. */
      documentId?: string;
    }
  | {
      kind: 'source-evidence';
      documentId: string;
      pageNumber?: number;
      snippet?: string;
      /** Optional extraction UUID to anchor the drawer on a specific row. */
      extractionId?: string;
    }
  | {
      kind: 'conflict-resolver';
      targetEntity: string;
      targetEntityId: string;
      targetAttribute: string;
    }
  | {
      kind: 'party-details';
      /** The ThirdParty.uuid being expanded. Special "tbc-valuer" sentinel
       *  for the placeholder TBC card on Connected Parties. */
      partyUuid: string;
    }
  | {
      /** Step 19 — minimal-fields drawer to create a second applicant.
       *  Only Title + Full name + DOB. Capped to 2 applicants. */
      kind: 'add-applicant';
    };

interface CaseStore {
  case: Case;

  // === UI state ===
  documentRailExpanded: boolean;
  setDocumentRailExpanded: (b: boolean) => void;

  // === Dev panel state + mutators ===
  dev: DevPanelState;
  setDevPanelOpen: (open: boolean) => void;
  setDIPState: (state: DevDIPState) => void;
  setDocState: (state: DevDocState) => void;
  toggleConflict: () => void;
  /** Step 24 — toggle the Timeline tab's forced loading state. */
  setTimelineForceLoading: (value: boolean) => void;
  /** Step 25 — toggle the Messages tab's forced loading state. */
  setMessagesForceLoading: (value: boolean) => void;
  /** Step 25 — toggle the typing indicator on the Messages tab. */
  setMessagesShowTyping: (value: boolean) => void;

  // === Drawers ===
  drawer: DrawerState;
  openDrawer: (drawer: DrawerState) => void;
  closeDrawer: () => void;

  // === Extraction mutators ===
  /** Accept the AI-proposed value as-is. */
  acceptExtraction: (extractionUuid: string) => void;
  /** Reject the proposal entirely (broker says "this isn't relevant"). */
  rejectExtraction: (extractionUuid: string) => void;
  /** Override the AI-proposed value with a manual entry. */
  overrideExtraction: (extractionUuid: string, newValue: unknown, displayValue?: string) => void;
  /** Resolve a two-source conflict: choose one extraction, drop the other. */
  resolveConflict: (
    targetEntity: string,
    targetEntityId: string,
    targetAttribute: string,
    chosenExtractionUuid: string,
  ) => void;

  // === Step 19 — Applicants cap + add-applicant flow ===
  /** Append a second applicant. Returns `{ ok: true, uuid }` on
   *  success, `{ ok: false, reason: 'cap-reached' }` when the case
   *  already has two applicants. Cap is hard at 2 across product
   *  families. */
  addApplicant: (input: {
    title: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) =>
    | { ok: true; uuid: string }
    | { ok: false; reason: 'cap-reached' };

  // === Connected Parties auto-create ===
  /** Inline-create a third-party reference (property owner, donor,
   *  occupant, vulnerable-customer-support contact). Returns the
   *  generated UUID so the caller can render the green "Connected
   *  Parties record created" confirmation linked to it. */
  addPartyReference: (input: {
    name: string;
    role:
      | 'PropertyOwner'
      | 'Donor'
      | 'Occupant'
      | 'VulnerableSupport'
      | 'Other';
    actsFor: string;
  }) => string;

  // === Products ===
  /** Set the case's selected product code and rate type. Called from
   *  the Products tab when the broker picks a product for the full app. */
  setSelectedProduct: (input: {
    code: string;
    rateType: string;
    initialRate?: number;
    productFee?: Money;
  }) => void;
  /** Step 18 — pick a product from Quick Input. At DIP phase the
   *  freshness gate is bypassed so the broker can change family
   *  before any DIP runs; at full-app phase it delegates to
   *  `setSelectedProduct` (which keeps the freshness gate). */
  pickProduct: (code: string) => void;

  // === Documents ===
  /** Append a document to the case (called from drop / browse). */
  addDocument: (doc: import('../model/document').Document) => void;
  /** Patch a document in place (used by the AI-pipeline simulator). */
  updateDocument: (
    uuid: string,
    patch: Partial<import('../model/document').Document>,
  ) => void;
  /** Remove a document. Quietly drops associated extractions too. */
  removeDocument: (uuid: string) => void;

  // === Step 17 — Documents tab placeholder assignments ===
  /** Pin a document to a resolved placeholder (`uniqueKey`). When
   *  `placeholderKey` is undefined, the document is unpinned and
   *  drops to the Unclassified section. */
  assignDocumentToPlaceholder: (
    documentId: string,
    placeholderKey: string | undefined,
  ) => void;

  // === Consents + submission ===
  /** Toggle a consent tile (assert or withdraw). */
  assertConsent: (id: string, granted: boolean) => void;
  /** Step 21 — set the preferred standing-order payment day. Clamped
   *  to 1–28 to avoid Feb edge cases. */
  setPreferredPaymentDate: (day: number) => void;
  /** Step 22 — advance from DIP to Full Application (stage `kyc`).
   *  Caller is expected to have validated the gate (selected
   *  approved-fresh DIP exists); the mutator is a no-op when phase
   *  isn't 'dip'. */
  proceedToFullApplication: () => void;
  /** Step 22 — flip the full-application submission flag. The
   *  Application Declaration must be confirmed; gate is checked
   *  here to keep the contract honest if called directly. */
  submitFullApplication: () => void;
  /** Submit the application. Stamps `submittedAt`, drops a success
   *  banner, and adds the audit-pack download. */
  submitCase: () => void;
  /** Banner state — set transiently after submission. */
  submitBannerVisible: boolean;
  dismissSubmitBanner: () => void;

  // === Step 13 — DIP runs + arrangement steppers ===
  /** ProductIds currently mid-run. The Set is replaced (not mutated)
   *  on every change so Zustand selectors notice. */
  runningDIPs: ReadonlySet<string>;
  /** Kick off a DIP simulation for `productId`. Resolves after 4–6s
   *  to a `DIPResult` whose status follows `dev.nextDIPOutcome`. */
  runDIP: (productId: string) => void;
  /** Restore the inputs snapshot captured by `dipResultId` onto the
   *  live arrangement. Other cards' freshness is recomputed. */
  revertCaseInputsToDIP: (dipResultId: string) => void;
  /** Set the dev-panel outcome strategy for the next DIP run. */
  setNextDIPOutcome: (strategy: DIPOutcomeStrategy) => void;
  /** Write through to the arrangement from the Configuration Strip
   *  (Step 14) or anywhere that edits a DIP-relevant input. Triggers
   *  staleness on any DIP result whose snapshot now differs. The
   *  effective selection (derived) automatically clears in render.
   *
   *  Step 14b: `loanAmount` is no longer a writable field — it's
   *  derived from property value + deposit. The `'depositAmount'`
   *  case writes deposit directly. */
  setArrangementInput: (
    field:
      | 'depositAmount'
      | 'ltv'
      | 'termYears'
      | 'brokerFee'
      | 'productFeeHandling'
      | 'brokerFeeHandling',
    value: number | 'capitalise' | 'upfront',
  ) => void;
  /** Step 14b: write the indicative collateral's `estimatedValue`
   *  immutably. The Strip's Property value input dispatches here. */
  setPropertyValue: (collateralId: string, value: number) => void;

  // === Step 19b — Financial items write-through ===
  /** Set or upsert an Income / Expenditure amount on `financialItems`.
   *  For Income, partyUuid scopes to the applicant; for Expenditure
   *  the household scope means partyUuid is unused (joint). The
   *  `setFinancialItemAmount` mutator preserves any existing meta
   *  (frequency, label) on Income rows. */
  setFinancialItemAmount: (input: {
    kind: 'Income' | 'Expenditure';
    category: string;
    partyUuid?: string;
    amount: number;
  }) => void;

  // === Step 15 — Generic field write-through ===
  /** Resolve a register-id → model-path setter via `model/fieldMap.ts`,
   *  apply it immutably, and stamp `provenanceMap` with `Manual` (or
   *  `manual-override` when overwriting prior Document lineage). */
  setManualField: (ref: EntityRef, fieldId: string, value: unknown) => void;

  // === Step 16 — Lifecycle phase ===
  /** Set the phase atomically. Clears `fullAppStage` when phase isn't
   *  full-application; defaults to `kyc` if entering full-application
   *  without a stage argument. */
  setPhase: (phase: Phase, fullAppStage?: FullAppStage) => void;
  /** Move the full-app stepper one stop forward. From `completion`,
   *  transitions phase → 'disbursed' (terminal). No-op otherwise. */
  advanceFullAppStage: () => void;
  /** Step the full-app stepper backwards. From `disbursed`, returns
   *  to full-application at `completion`. From `kyc`, returns to DIP. */
  regressFullAppStage: () => void;
}

// === Maps from dev-panel friendly states to model state ===

function applyDIPState(
  caseState: Case,
  dipState: DevDIPState,
): { stage: CaseStage; subStage?: string } {
  switch (dipState) {
    case 'not-submitted':
      return { stage: 'Documents', subStage: undefined };
    case 'pending':
      return { stage: 'DIPSubmitted', subStage: 'dip-pending' };
    case 'success':
      return { stage: 'DIPSubmitted', subStage: 'dip-success' };
    case 'fail':
      return { stage: 'DIPSubmitted', subStage: 'dip-fail' };
    case 'full-app':
      return { stage: 'FullApplication', subStage: 'dip-success' };
  }
}

/** Project the dev-panel doc state onto the in-flight HEIC document. */
function applyDocState(caseState: Case, docState: DevDocState): Case {
  const next = caseState.documents.map((doc) => {
    if (doc.uuid !== FIXTURE_IDS.docHeicProcessing) return doc;
    switch (docState) {
      case 'pending':
        return {
          ...doc,
          classificationConfidence: undefined,
          classificationType: undefined,
          ocrRequired: false,
          ocrConfidence: undefined,
          extractionStatus: 'Pending' as const,
          extractionStatusMessage: 'Queued for classification',
        };
      case 'classifying':
        return {
          ...doc,
          classificationConfidence: undefined,
          classificationType: undefined,
          extractionStatus: 'Pending' as const,
          extractionStatusMessage: 'Classifying…',
        };
      case 'ocr':
        return {
          ...doc,
          classificationType: 'Passport' as const,
          classificationConfidence: 78,
          ocrRequired: true,
          ocrConfidence: 45,
          extractionStatus: 'Running' as const,
          extractionStatusMessage: 'Reading scan…',
        };
      case 'extracting':
        return {
          ...doc,
          classificationType: 'Passport' as const,
          classificationConfidence: 78,
          ocrRequired: true,
          ocrConfidence: 88,
          extractionStatus: 'Running' as const,
          extractionStatusMessage: 'Extracting fields…',
        };
      case 'done':
        return {
          ...doc,
          classificationType: 'Passport' as const,
          classificationConfidence: 96,
          ocrRequired: true,
          ocrConfidence: 95,
          extractionStatus: 'Complete' as const,
          extractionStatusMessage: undefined,
        };
    }
  });
  return { ...caseState, documents: next };
}

/**
 * Add or remove the bank-statement extraction that competes with the
 * payslip-derived salary value. When toggled off, only the payslip
 * extraction remains and the conflict card disappears.
 */
function applyConflictInjection(caseState: Case, injected: boolean): Case {
  const hasConflict = caseState.extractions.some(
    (e) => e.uuid === FIXTURE_IDS.extDanielSalaryBank,
  );
  if (injected === hasConflict) return caseState;

  if (injected) {
    // Re-add the bank-statement extraction. Use the canonical row.
    const reinstated: FieldExtraction = {
      uuid: FIXTURE_IDS.extDanielSalaryBank,
      documentId: FIXTURE_IDS.docBankStatement,
      evidencePageNumber: 4,
      evidenceSnippet:
        'Salary credit · CLIFFORD CHANCE LLP · £4,180.00 (27 Mar)',
      targetEntity: 'Employment',
      targetEntityId: FIXTURE_IDS.personDaniel,
      targetAttribute: 'A51',
      proposedValue: 4180,
      proposedValueDisplay: '£4,180.00 / month',
      confidence: 92,
      method: 'AI text',
      status: 'Proposed',
    };
    return {
      ...caseState,
      extractions: [...caseState.extractions, reinstated],
    };
  }
  return {
    ...caseState,
    extractions: caseState.extractions.filter(
      (e) => e.uuid !== FIXTURE_IDS.extDanielSalaryBank,
    ),
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function roleLabel(role: string): string {
  switch (role) {
    case 'PropertyOwner':
      return 'Property owner';
    case 'Donor':
      return 'Donor';
    case 'Occupant':
      return 'Occupant 17+';
    case 'VulnerableSupport':
      return 'Vulnerable-customer support';
    default:
      return role;
  }
}

function updateExtraction(
  caseState: Case,
  uuid: string,
  patch: Partial<FieldExtraction>,
): Case {
  return {
    ...caseState,
    extractions: caseState.extractions.map((e) =>
      e.uuid === uuid ? { ...e, ...patch } : e,
    ),
  };
}

/**
 * Build a `DIPResult` for a completed run. Status determined by the
 * dev panel's outcome strategy. Pricing only set on approved.
 */
function buildDIPResult(
  productId: string,
  status: DIPResult['status'],
  inputs: DIPInputs,
): DIPResult {
  const product = findProduct(productId);
  const id = `dip-result-${productId}-${Date.now()}`;
  const decidedAt = nowIso();
  if (status === 'approved' && product) {
    return {
      id,
      productId,
      status: 'approved',
      decidedAt,
      inputsSnapshot: { ...inputs },
      pricing: buildPricing(
        product.initialRate ?? 5.0,
        product.productFee ?? 0,
        inputs,
      ),
    };
  }
  if (status === 'declined') {
    return {
      id,
      productId,
      status: 'declined',
      decidedAt,
      inputsSnapshot: { ...inputs },
      declineReason:
        product?.declinedReason ??
        'Affordability outside lender criteria for the current inputs.',
    };
  }
  return {
    id,
    productId,
    status: 'referred',
    decidedAt,
    inputsSnapshot: { ...inputs },
    referralReason:
      'Sent to underwriter for manual review — typically resolves within 24 hours.',
  };
}

/** Maps the strip's narrow field union back to the underlying register
 *  ID, so `setArrangementInput` can also stamp Manual provenance. */
const ARRANGEMENT_INPUT_TO_REGISTER_ID: Record<string, string> = {
  depositAmount: 'D1',
  ltv: 'M11',
  termYears: 'M7',
  brokerFee: 'M17',
  productFeeHandling: 'M18',
  brokerFeeHandling: 'M19',
};

/**
 * Stamp Manual provenance for a register field. If a prior `Document`
 * provenance existed, switch to `manual-override` and KEEP the document
 * fields so the original lineage stays auditable.
 */
function stampManualProvenance(
  map: Record<string, Provenance>,
  ref: EntityRef,
  fieldId: string,
): Record<string, Provenance> {
  const key = `${ref.entityType}:${ref.entityId}:${fieldId}`;
  const prior = map[key];
  const stamp = {
    enteredBy: 'A. Okafor (broker)',
    enteredAt: nowIso(),
  };
  if (prior?.source === 'Document') {
    return {
      ...map,
      [key]: { ...prior, source: 'manual-override', ...stamp },
    };
  }
  return { ...map, [key]: { source: 'Manual', ...stamp } };
}

/**
 * Apply a single arrangement-input edit immutably. Centralised so the
 * Configuration Strip (Step 14) and any other writer share the same
 * clamping behaviour.
 */
function applyArrangementInput(
  arr: Arrangement,
  field:
    | 'depositAmount'
    | 'ltv'
    | 'termYears'
    | 'brokerFee'
    | 'productFeeHandling'
    | 'brokerFeeHandling',
  value: number | 'capitalise' | 'upfront',
): Arrangement {
  switch (field) {
    case 'depositAmount':
      return { ...arr, depositAmount: Math.max(0, value as number) };
    case 'ltv':
      return { ...arr, ltvPercent: Math.max(0, Math.min(100, value as number)) };
    case 'termYears':
      return { ...arr, loanTermYears: Math.max(1, value as number) };
    case 'brokerFee':
      return { ...arr, brokerFee: Math.max(0, value as number) };
    case 'productFeeHandling':
      return { ...arr, productFeeHandling: value as 'capitalise' | 'upfront' };
    case 'brokerFeeHandling':
      return { ...arr, brokerFeeHandling: value as 'capitalise' | 'upfront' };
  }
}

/** Module-level timers for in-flight DIP simulations. The store is a
 *  singleton, so a Map keyed by productId is enough to clear timers
 *  when the same product is re-run before its prior simulation
 *  resolved. */
const dipTimers = new Map<string, number>();

// === Store ===

export const useCaseStore = create<CaseStore>((set, get) => ({
  case: okaforCase,
  documentRailExpanded: false,
  setDocumentRailExpanded: (b) => set({ documentRailExpanded: b }),

  dev: initialDevPanelState,
  setDevPanelOpen: (open) =>
    set((s) => ({ dev: { ...s.dev, isOpen: open } })),
  setDIPState: (dipState) =>
    set((s) => {
      const { stage, subStage } = applyDIPState(s.case, dipState);
      return {
        case: { ...s.case, stage, subStage },
        dev: { ...s.dev, dipState },
      };
    }),
  setDocState: (docState) =>
    set((s) => ({
      case: applyDocState(s.case, docState),
      dev: { ...s.dev, docState },
    })),
  setTimelineForceLoading: (value) =>
    set((s) => ({ dev: { ...s.dev, timelineForceLoading: value } })),
  setMessagesForceLoading: (value) =>
    set((s) => ({ dev: { ...s.dev, messagesForceLoading: value } })),
  setMessagesShowTyping: (value) =>
    set((s) => ({ dev: { ...s.dev, messagesShowTyping: value } })),
  toggleConflict: () =>
    set((s) => {
      const next = !s.dev.conflictInjected;
      return {
        case: applyConflictInjection(s.case, next),
        dev: { ...s.dev, conflictInjected: next },
      };
    }),

  drawer: { kind: 'none' },
  openDrawer: (drawer) => set({ drawer }),
  closeDrawer: () => set({ drawer: { kind: 'none' } }),

  acceptExtraction: (extractionUuid) =>
    set((s) => {
      const ext = s.case.extractions.find((e) => e.uuid === extractionUuid);
      if (!ext) return s;
      return {
        case: updateExtraction(s.case, extractionUuid, {
          status: 'Accepted',
          resolvedValue: ext.proposedValue,
          resolvedValueDisplay: ext.proposedValueDisplay,
          resolvedBy: 'A. Okafor (broker)',
          resolvedAt: nowIso(),
        }),
      };
    }),
  rejectExtraction: (extractionUuid) =>
    set((s) => ({
      case: updateExtraction(s.case, extractionUuid, {
        status: 'Rejected',
        resolvedBy: 'A. Okafor (broker)',
        resolvedAt: nowIso(),
      }),
    })),
  overrideExtraction: (extractionUuid, newValue, displayValue) =>
    set((s) => ({
      case: updateExtraction(s.case, extractionUuid, {
        status: 'Overridden',
        resolvedValue: newValue,
        resolvedValueDisplay: displayValue ?? String(newValue),
        resolvedBy: 'A. Okafor (broker)',
        resolvedAt: nowIso(),
      }),
    })),
  setSelectedProduct: ({ code, rateType, initialRate, productFee }) =>
    set((s) => {
      // Gate: only allow selection when the target has a fresh-approved
      // DIPResult. Without this, a stale or declined card could be
      // selected via direct mutator call.
      if (!isFreshApproved(s.case, code)) return s;
      return {
        case: {
          ...s.case,
          arrangement: {
            ...s.case.arrangement,
            selectedProductCode: code,
            rateType: rateType as Arrangement['rateType'],
            ...(initialRate !== undefined ? { initialRate } : {}),
            ...(productFee !== undefined ? { productFee } : {}),
          },
        },
      };
    }),
  pickProduct: (code) =>
    set((s) => {
      const product = PRODUCTS.find((p) => p.code === code);
      if (!product) return s;
      const phase = s.case.phase;
      if (phase !== 'dip') {
        if (!isFreshApproved(s.case, code)) return s;
      }
      return {
        case: {
          ...s.case,
          arrangement: {
            ...s.case.arrangement,
            selectedProductCode: code,
            rateType: product.rateType as Arrangement['rateType'],
            ...(product.initialRate !== undefined
              ? { initialRate: product.initialRate }
              : {}),
            ...(product.productFee !== undefined
              ? { productFee: product.productFee }
              : {}),
          },
        },
      };
    }),

  submitBannerVisible: false,
  dismissSubmitBanner: () => set({ submitBannerVisible: false }),
  assertConsent: (id, granted) =>
    set((s) => ({
      case: {
        ...s.case,
        consentAssertions: { ...s.case.consentAssertions, [id]: granted },
      },
    })),
  setPreferredPaymentDate: (day) =>
    set((s) => {
      const clamped = Math.max(1, Math.min(28, Math.round(day)));
      return {
        case: {
          ...s.case,
          preferredPaymentDate: clamped,
          consentAssertions: {
            ...s.case.consentAssertions,
            PreferredPaymentDate: true,
          },
        },
      };
    }),
  proceedToFullApplication: () =>
    set((s) => {
      if (s.case.phase !== 'dip') return s;
      return {
        case: {
          ...s.case,
          phase: 'full-application',
          fullAppStage: 'submission',
        },
      };
    }),
  submitFullApplication: () =>
    set((s) => {
      if (s.case.phase !== 'full-application') return s;
      if (s.case.fullAppStage !== 'submission') return s;
      if (!s.case.consentAssertions.ApplicationDeclaration) return s;
      return { case: { ...s.case, fullAppStage: 'kyc' } };
    }),
  submitCase: () =>
    set((s) => {
      if (s.case.submittedAt) return s;
      const submittedAt = nowIso();
      const auditPackDoc: import('../model/document').Document = {
        uuid: `doc-audit-${submittedAt}`,
        filename: 'okafor-audit-pack.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2_400_000,
        pageCount: 24,
        source: 'NovaGenerated',
        type: 'AuditPack',
        label: 'Audit pack · Okafor',
        uploadedAt: submittedAt,
        uploadedBy: 'Nova',
        extractionStatus: 'Complete',
      };
      return {
        case: {
          ...s.case,
          submittedAt,
          documents: [...s.case.documents, auditPackDoc],
        },
        submitBannerVisible: true,
      };
    }),

  addDocument: (doc) =>
    set((s) => ({
      case: { ...s.case, documents: [...s.case.documents, doc] },
    })),
  updateDocument: (uuid, patch) =>
    set((s) => ({
      case: {
        ...s.case,
        documents: s.case.documents.map((d) =>
          d.uuid === uuid ? { ...d, ...patch } : d,
        ),
      },
    })),
  removeDocument: (uuid) =>
    set((s) => {
      const map = { ...(s.case.documentPlaceholderAssignments ?? {}) };
      delete map[uuid];
      return {
        case: {
          ...s.case,
          documents: s.case.documents.filter((d) => d.uuid !== uuid),
          extractions: s.case.extractions.filter((e) => e.documentId !== uuid),
          documentPlaceholderAssignments: map,
        },
      };
    }),
  assignDocumentToPlaceholder: (documentId, placeholderKey) =>
    set((s) => {
      const map = { ...(s.case.documentPlaceholderAssignments ?? {}) };
      if (placeholderKey === undefined) {
        delete map[documentId];
      } else {
        for (const [docId, key] of Object.entries(map)) {
          if (key === placeholderKey && docId !== documentId) delete map[docId];
        }
        map[documentId] = placeholderKey;
      }
      return {
        case: { ...s.case, documentPlaceholderAssignments: map },
      };
    }),

  addApplicant: ({ title, firstName, lastName, dateOfBirth }) => {
    const state = get();
    const applicantCount = state.case.parties.filter(
      (p) => p.kind === 'Person',
    ).length;
    if (applicantCount >= 2) {
      return { ok: false as const, reason: 'cap-reached' as const };
    }
    const uuid = `person-${Math.random().toString(36).slice(2, 10)}`;
    const newPerson: Person = {
      uuid,
      title: title as Person['title'],
      firstName,
      lastName,
      dateOfBirth,
      maritalStatus: 'Single',
      nationality: '',
      countryOfResidence: 'United Kingdom',
      mobile: '',
      email: '',
      currentAddress: { line1: '', city: '', postcode: '', country: 'United Kingdom' },
      residentialStatus: 'Tenant (Private)',
      movedInDate: '',
      numberOfDependants: 0,
      adverseHistory: {
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
        creditSearchConsent: false,
        adverseSharingConsent: false,
      },
    };
    const newParty: Party = {
      uuid,
      kind: 'Person',
      isPrimary: false,
      person: newPerson,
    };
    set((s) => ({
      case: { ...s.case, parties: [...s.case.parties, newParty] },
    }));
    return { ok: true as const, uuid };
  },

  addPartyReference: ({ name, role, actsFor }) => {
    const uuid = `tp-${Math.random().toString(36).slice(2, 10)}`;
    // The model's ThirdParty.role enum doesn't include the inline-create
    // relationship vocabulary (PropertyOwner / Donor / Occupant / etc.);
    // map them into 'Other' and surface the relationship via `actsFor`.
    set((s) => ({
      case: {
        ...s.case,
        thirdParties: [
          ...s.case.thirdParties,
          {
            uuid,
            role: 'Other',
            name,
            contactName: name,
            actsFor: `${roleLabel(role)} · ${actsFor}`,
          },
        ],
      },
    }));
    return uuid;
  },
  // === Step 13 ===
  runningDIPs: new Set<string>(),
  setNextDIPOutcome: (strategy) =>
    set((s) => ({ dev: { ...s.dev, nextDIPOutcome: strategy } })),
  runDIP: (productId) => {
    // Cancel any prior simulation for this product.
    const prior = dipTimers.get(productId);
    if (prior !== undefined) {
      window.clearTimeout(prior);
      dipTimers.delete(productId);
    }
    set((s) => {
      const next = new Set(s.runningDIPs);
      next.add(productId);
      return { runningDIPs: next };
    });
    const ms = 4000 + Math.floor(Math.random() * 2000);
    const t = window.setTimeout(() => {
      const state = get();
      const inputs = readInputs(state.case);
      const status = resolveOutcome(
        state.dev.nextDIPOutcome,
        state.dev.autoOutcomeIndex,
      );
      const result = buildDIPResult(productId, status, inputs);
      set((s) => {
        const filtered = s.case.dipResults.filter((r) => r.productId !== productId);
        const nextRunning = new Set(s.runningDIPs);
        nextRunning.delete(productId);
        return {
          case: { ...s.case, dipResults: [...filtered, result] },
          runningDIPs: nextRunning,
          dev: {
            ...s.dev,
            autoOutcomeIndex:
              s.dev.nextDIPOutcome === 'auto'
                ? s.dev.autoOutcomeIndex + 1
                : s.dev.autoOutcomeIndex,
          },
        };
      });
      dipTimers.delete(productId);
    }, ms);
    dipTimers.set(productId, t);
  },
  revertCaseInputsToDIP: (dipResultId) =>
    set((s) => {
      const result = s.case.dipResults.find((r) => r.id === dipResultId);
      if (!result) return s;
      const c = s.case;
      const arr = c.arrangement;
      const snap = result.inputsSnapshot;
      // Selection is *derived* (effectiveSelectedCode) — we never
      // touch `arrangement.selectedProductCode` here. After reverting,
      // a previously-selected fresh card will pass the freshness check
      // again → effective selection restores automatically.
      // Step 14b: property value lives on the indicative collateral;
      // deposit on the arrangement. Loan amount is derived.
      const collateralId = c.collaterals[0]?.uuid;
      const collaterals = collateralId
        ? c.collaterals.map((col) =>
            col.uuid === collateralId
              ? { ...col, estimatedValue: snap.propertyValue }
              : col,
          )
        : c.collaterals;
      return {
        case: {
          ...c,
          collaterals,
          arrangement: {
            ...arr,
            depositAmount: snap.depositAmount,
            loanTermYears: snap.termYears,
            brokerFee: snap.brokerFee,
            productFeeHandling: snap.productFeeHandling,
            brokerFeeHandling: snap.brokerFeeHandling,
          },
        },
      };
    }),
  setArrangementInput: (field, value) =>
    set((s) => {
      const arr = s.case.arrangement;
      const nextArr = applyArrangementInput(arr, field, value);
      // Selection is derived; staleness automatically clears the visible
      // selection without dropping the stored code, so revert can restore it.
      // Also stamp Manual provenance for the underlying register field so
      // the Quick Input drain count + the Provenance footer (now hidden
      // for Manual per Step 15) reflect the broker's edit.
      const fieldId = ARRANGEMENT_INPUT_TO_REGISTER_ID[field];
      const provMap = fieldId
        ? stampManualProvenance(
            s.case.provenanceMap,
            { entityType: 'Arrangement', entityId: arr.uuid },
            fieldId,
          )
        : s.case.provenanceMap;
      return {
        case: {
          ...s.case,
          arrangement: nextArr,
          provenanceMap: provMap,
        },
      };
    }),

  setPropertyValue: (collateralId, value) =>
    set((s) => {
      const safe = Math.max(0, value);
      const collaterals = s.case.collaterals.map((c) =>
        c.uuid === collateralId ? { ...c, estimatedValue: safe } : c,
      );
      const provMap = stampManualProvenance(
        s.case.provenanceMap,
        { entityType: 'Collateral', entityId: collateralId },
        'P16',
      );
      return {
        case: { ...s.case, collaterals, provenanceMap: provMap },
      };
    }),

  setFinancialItemAmount: ({ kind, category, partyUuid, amount }) =>
    set((s) => {
      const safe = Math.max(0, amount);
      const items = s.case.financialItems;
      const idx = items.findIndex((i) => {
        if (i.kind !== kind) return false;
        if ((i as { category: string }).category !== category) return false;
        if (kind === 'Income') {
          return (i as { partyUuid: string }).partyUuid === (partyUuid ?? 'joint');
        }
        return true;
      });
      let next: typeof items;
      if (idx >= 0) {
        next = items.map((i, n) =>
          n === idx ? ({ ...i, amount: safe } as typeof i) : i,
        );
      } else if (kind === 'Income') {
        next = [
          ...items,
          {
            kind: 'Income',
            uuid: `inc-${Math.random().toString(36).slice(2, 10)}`,
            partyUuid: (partyUuid ?? 'joint') as `inc-${string}` | 'joint',
            category: category as never,
            amount: safe,
            frequency: 'Monthly',
          },
        ];
      } else {
        next = [
          ...items,
          {
            kind: 'Expenditure',
            uuid: `exp-${Math.random().toString(36).slice(2, 10)}`,
            partyUuid: 'joint',
            category: category as never,
            amount: safe,
            frequency: 'Monthly',
          },
        ];
      }
      return { case: { ...s.case, financialItems: next } };
    }),

  setManualField: (ref, fieldId, value) =>
    set((s) => {
      const c = s.case;
      let nextCase: Case = c;
      switch (ref.entityType) {
        case 'Person': {
          const setter = getPersonSetter(fieldId);
          if (!setter) return s;
          nextCase = {
            ...c,
            parties: c.parties.map((party) => {
              if (party.uuid !== ref.entityId) return party;
              if (party.kind !== 'Person') return party;
              return { ...party, person: setter(party.person, value) };
            }),
          };
          break;
        }
        case 'Collateral': {
          const setter = getCollateralSetter(fieldId);
          if (!setter) return s;
          nextCase = {
            ...c,
            collaterals: c.collaterals.map((col) =>
              col.uuid === ref.entityId ? setter(col, value) : col,
            ),
          };
          break;
        }
        case 'Arrangement': {
          const setter = getArrangementSetter(fieldId);
          if (!setter) return s;
          nextCase = { ...c, arrangement: setter(c.arrangement, value) };
          break;
        }
        case 'ThirdParty': {
          const setter = getThirdPartySetter(fieldId);
          if (!setter) return s;
          nextCase = {
            ...c,
            thirdParties: c.thirdParties.map((tp) =>
              tp.uuid === ref.entityId ? setter(tp, value) : tp,
            ),
          };
          break;
        }
        default:
          return s;
      }
      return {
        case: {
          ...nextCase,
          provenanceMap: stampManualProvenance(
            nextCase.provenanceMap,
            ref,
            fieldId,
          ),
        },
      };
    }),

  setPhase: (phase, fullAppStage) =>
    set((s) => ({
      case: {
        ...s.case,
        phase,
        fullAppStage:
          phase === 'full-application'
            ? (fullAppStage ?? s.case.fullAppStage ?? 'submission')
            : undefined,
      },
    })),
  advanceFullAppStage: () =>
    set((s) => {
      const c = s.case;
      if (c.phase === 'dip') {
        return {
          case: { ...c, phase: 'full-application', fullAppStage: 'submission' },
        };
      }
      if (c.phase === 'full-application') {
        const idx = FULL_APP_STAGES.indexOf(c.fullAppStage ?? 'submission');
        if (idx < FULL_APP_STAGES.length - 1) {
          return {
            case: { ...c, fullAppStage: FULL_APP_STAGES[idx + 1] },
          };
        }
        return { case: { ...c, phase: 'disbursed', fullAppStage: undefined } };
      }
      return s; // disbursed → no further forward step
    }),
  regressFullAppStage: () =>
    set((s) => {
      const c = s.case;
      if (c.phase === 'disbursed') {
        return { case: { ...c, phase: 'full-application', fullAppStage: 'completion' } };
      }
      if (c.phase === 'full-application') {
        const idx = FULL_APP_STAGES.indexOf(c.fullAppStage ?? 'submission');
        if (idx > 0) {
          return { case: { ...c, fullAppStage: FULL_APP_STAGES[idx - 1] } };
        }
        return { case: { ...c, phase: 'dip', fullAppStage: undefined } };
      }
      return s; // dip → no further backward step
    }),

  resolveConflict: (targetEntity, targetEntityId, targetAttribute, chosenExtractionUuid) =>
    set((s) => {
      const competing = s.case.extractions.filter(
        (e) =>
          e.targetEntity === targetEntity &&
          e.targetEntityId === targetEntityId &&
          e.targetAttribute === targetAttribute,
      );
      const next = s.case.extractions.map((e) => {
        if (!competing.includes(e)) return e;
        if (e.uuid === chosenExtractionUuid) {
          return {
            ...e,
            status: 'Accepted' as const,
            resolvedValue: e.proposedValue,
            resolvedValueDisplay: e.proposedValueDisplay,
            resolvedBy: 'A. Okafor (broker)',
            resolvedAt: nowIso(),
          };
        }
        return {
          ...e,
          status: 'Rejected' as const,
          resolvedBy: 'A. Okafor (broker)',
          resolvedAt: nowIso(),
        };
      });
      return { case: { ...s.case, extractions: next } };
    }),
}));
