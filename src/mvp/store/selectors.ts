import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from './caseStore';
import type { CasePhase } from '../types/case';
import type { Case, Phase, FullAppStage } from '../model/case';
import {
  selectLoanAmount,
  selectEffectiveLtv,
} from '../model/arrangementDerived';
import { effectiveSelectedCode } from '../tabs/products/dipResults';

/**
 * Display-layer projections of the rich `Case` model. Existing shell
 * components (ContextHeader, etc.) consume these to avoid drilling
 * into the model internals — and so the simple `CasePhase` enum the
 * shell already speaks (pre-dip / dip / full-app / completion) keeps
 * working as the dev panel mutates the case.
 */
export interface CaseDisplay {
  shortLabel: string;
  clientName: string;
  reference: string;
  loanAmount: number;
  ltv: number;
  selectedProductLabel: string;
  /** Legacy shell phase derived from `stage`. Used by the existing
   *  ring-progress logic. Step 16 introduces the canonical lifecycle
   *  Phase below. */
  phase: CasePhase;
  /** 0–100 progress used by the ring. */
  progress: number;
  /** True when the dev panel is in a DIP-decision sub-state. */
  dipDecision: 'pending' | 'success' | 'fail' | undefined;
  /** Step 16 — canonical lifecycle phase from `case.phase`. Drives the
   *  PhaseIndicator and the disbursed-lock + Submit visibility. */
  lifecyclePhase: Phase;
  fullAppStage: FullAppStage | undefined;
}

/** Map the rich `Case.stage` + `subStage` onto the simple shell phase. */
function mapPhase(stage: string, subStage: string | undefined): CasePhase {
  if (stage === 'Intake' || stage === 'Documents') return 'pre-dip';
  if (stage === 'DIPSubmitted') return 'dip';
  if (stage === 'FullApplication') return 'full-app';
  if (stage === 'Completion') return 'completion';
  // Fallback — shouldn't hit at runtime but keeps the type narrow.
  void subStage;
  return 'pre-dip';
}

function mapDipDecision(subStage: string | undefined) {
  switch (subStage) {
    case 'dip-pending':
      return 'pending' as const;
    case 'dip-success':
      return 'success' as const;
    case 'dip-fail':
      return 'fail' as const;
    default:
      return undefined;
  }
}

/**
 * Derive the small flat shape the shell components expect.
 * Wrapped in `useShallow` because the selector returns a freshly-built
 * object — without shallow equality Zustand v5 treats every render as
 * a state change and the component re-renders forever.
 */
export function useCaseDisplay(): CaseDisplay {
  return useCaseStore(
    useShallow((s): CaseDisplay => {
      const c = s.case;
      const arr = c.arrangement;
      const primary = c.parties.find((p) => p.isPrimary);
      const familyName =
        primary?.kind === 'Person' ? primary.person.lastName : 'Applicant';

      const security = c.collaterals[0];
      const cityHint = security?.address.city;
      const postcodeArea = security?.address.postcode.split(' ')[0] ?? '';

      const productLabel = `${arr.productFamily} · ${arr.rateType}`;

      // Step 14b: loan + LTV are derived from property + deposit live —
      // no longer stored as canonical values on the arrangement.
      const propertyValue = security?.estimatedValue;
      const loanAmount = selectLoanAmount(arr, propertyValue);
      const ltv = selectEffectiveLtv(arr, propertyValue);

      return {
        shortLabel: `${familyName} — ${cityHint ?? ''} ${postcodeArea}`.trim(),
        clientName: `Mr & Mrs ${familyName}`,
        reference: c.reference,
        loanAmount,
        ltv,
        selectedProductLabel: productLabel,
        phase: mapPhase(c.stage, c.subStage),
        progress: computeProgress(c.stage, c.subStage),
        dipDecision: mapDipDecision(c.subStage),
        lifecyclePhase: c.phase,
        fullAppStage: c.fullAppStage,
      };
    }),
  );
}

/**
 * Step 22 — single source of truth for the ContextHeader's primary
 * action button. Phase-driven label + gate, returned together so the
 * caller renders one button.
 *
 * Returns a fresh object each call: invoke inline in render with the
 * selected `case`, do NOT pass the whole result through a Zustand
 * selector without `useShallow` (Gotchas §1).
 */
export type PrimaryActionMode = 'dip-advance' | 'full-app-submit';

export interface PrimaryActionState {
  visible: boolean;
  enabled: boolean;
  label: string;
  mode: PrimaryActionMode;
  /** Reason text shown when disabled. */
  tooltip?: string;
}

export function selectPrimaryActionState(c: Case): PrimaryActionState {
  if (c.phase === 'disbursed') {
    return {
      visible: false,
      enabled: false,
      label: 'Submit application',
      mode: 'full-app-submit',
    };
  }
  if (c.phase === 'full-application') {
    // Step 23 — the button only appears at the Submission stage; once
    // the broker submits, the lender takes ownership and stage
    // advances reach KYC..Completion via dev-panel only.
    if (c.fullAppStage !== 'submission') {
      return {
        visible: false,
        enabled: false,
        label: 'Submit application',
        mode: 'full-app-submit',
      };
    }
    const declarationConfirmed = !!c.consentAssertions.ApplicationDeclaration;
    return {
      visible: true,
      enabled: declarationConfirmed,
      label: 'Submit application',
      mode: 'full-app-submit',
      tooltip: declarationConfirmed
        ? undefined
        : 'Confirm the Application Declaration on the Consents tab to submit',
    };
  }
  // DIP phase
  const selected = effectiveSelectedCode(c);
  if (selected) {
    return {
      visible: true,
      enabled: true,
      label: 'Proceed to full application',
      mode: 'dip-advance',
    };
  }
  return {
    visible: true,
    enabled: false,
    label: 'Proceed to full application',
    mode: 'dip-advance',
    tooltip: dipDisabledReason(c),
  };
}

/**
 * Step 23 — three lock surfaces. `fields` covers Quick Input,
 * Applicants, Security, Connected Parties, Consents and the Products
 * tab pre-summary. `products` flips the Products tab into its
 * read-only summary card. `documents` only locks at disbursed since
 * lenders may request artefacts during underwriting.
 */
export interface CaseLockState {
  fields: boolean;
  products: boolean;
  documents: boolean;
}

export function selectIsCaseLocked(c: Case): CaseLockState {
  if (c.phase === 'disbursed') {
    return { fields: true, products: true, documents: true };
  }
  if (c.phase === 'full-application' && c.fullAppStage !== 'submission') {
    return { fields: true, products: true, documents: false };
  }
  return { fields: false, products: false, documents: false };
}

function dipDisabledReason(c: Case): string {
  if (c.dipResults.length === 0) return 'Run a DIP to continue';
  const approved = c.dipResults.filter((r) => r.status === 'approved');
  if (approved.length === 0) {
    return 'An approved DIP is required to proceed';
  }
  if (!c.arrangement.selectedProductCode) {
    return 'Select an approved option to proceed';
  }
  return 'Selected DIP is out of date — re-run or revert inputs';
}

/**
 * Headline progress percentage. Quick visual approximation — real
 * progress comes from the rules helpers in Step 5.
 */
function computeProgress(stage: string, subStage: string | undefined): number {
  if (stage === 'Intake') return 12;
  if (stage === 'Documents') return 38;
  if (stage === 'DIPSubmitted') {
    if (subStage === 'dip-fail') return 55;
    if (subStage === 'dip-pending') return 60;
    return 64;
  }
  if (stage === 'FullApplication') return 78;
  if (stage === 'Completion') return 100;
  return 0;
}
