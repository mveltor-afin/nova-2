/**
 * Submission gate — computes the ranked list of blockers preventing
 * the case from being submitted to the underwriter. Used by the
 * ContextHeader Submit button to drive its disabled / tooltip / modal
 * states.
 *
 * Priority order (lowest priority wins for ranking):
 *   1. Conflicts        (must be resolved before anything else)
 *   2. Missing required documents (e.g. Passport, Payslip, Fact-find)
 *   3. Awaiting review  (proposed extractions sitting in the queue)
 *   4. Missing required values (DIP-mandatory register fields)
 *   5. No product selected
 *   6. Application Declaration not signed
 */

import type { Case } from '../model/case';
import type { DocumentType } from '../model/document';
import { isFieldPopulated } from './fieldStatus';
import { effectiveSelectedCode } from '../tabs/products/dipResults';

export interface SubmissionBlocker {
  id: string;
  priority: number;
  message: string;
}

const REQUIRED_DOCS: DocumentType[] = ['Passport', 'Payslip', 'FactFind'];

/** Compact subset of DIP-mandatory fields used for the gate check.
 *  Mirrors `rules/required.ts` DIP_REQUIRED but inline so we don't
 *  re-export the private set. */
const GATE_FIELDS: { id: string; partyScoped?: boolean }[] = [
  { id: 'A1', partyScoped: true },
  { id: 'A2', partyScoped: true },
  { id: 'A4', partyScoped: true },
  { id: 'A6', partyScoped: true },
  { id: 'A11', partyScoped: true },
  { id: 'A19', partyScoped: true },
  { id: 'A21', partyScoped: true },
  { id: 'A23', partyScoped: true },
  { id: 'A41', partyScoped: true },
  { id: 'A42', partyScoped: true },
  { id: 'P1' },
  { id: 'P4' },
  { id: 'P6' },
  { id: 'P16' },
  { id: 'P21' },
  { id: 'M1' },
  { id: 'M2' },
  { id: 'M3' },
  { id: 'M5' },
  { id: 'M6' },
  { id: 'M7' },
  { id: 'M9' },
  { id: 'D1' },
  { id: 'D2' },
];

export function computeBlockers(caseState: Case): SubmissionBlocker[] {
  const blockers: SubmissionBlocker[] = [];

  // 1. Conflicts — extraction groups with 2+ rows where at least one
  //    is still proposed.
  const groups = new Map<string, number>();
  const proposedKeys = new Set<string>();
  for (const e of caseState.extractions) {
    const k = `${e.targetEntity}:${e.targetEntityId}:${e.targetAttribute}`;
    groups.set(k, (groups.get(k) ?? 0) + 1);
    if (e.status === 'Proposed') proposedKeys.add(k);
  }
  let conflictCount = 0;
  for (const [k, count] of groups) {
    if (count > 1 && proposedKeys.has(k)) conflictCount++;
  }
  if (conflictCount > 0) {
    blockers.push({
      id: 'conflicts',
      priority: 1,
      message: `Resolve ${conflictCount} field conflict${
        conflictCount === 1 ? '' : 's'
      }`,
    });
  }

  // 2. Missing required docs.
  const missingDocs = REQUIRED_DOCS.filter(
    (t) => !caseState.documents.some((d) => d.type === t),
  );
  if (missingDocs.length > 0) {
    blockers.push({
      id: 'missing-docs',
      priority: 2,
      message: `Upload required document${
        missingDocs.length === 1 ? '' : 's'
      }: ${missingDocs.join(', ')}`,
    });
  }

  // 3. Awaiting review — proposed extractions outside conflict groups.
  const awaitingReview = caseState.extractions.filter((e) => {
    if (e.status !== 'Proposed') return false;
    const k = `${e.targetEntity}:${e.targetEntityId}:${e.targetAttribute}`;
    return (groups.get(k) ?? 0) <= 1;
  });
  if (awaitingReview.length > 0) {
    blockers.push({
      id: 'awaiting-review',
      priority: 3,
      message: `Clear ${awaitingReview.length} field${
        awaitingReview.length === 1 ? '' : 's'
      } awaiting review`,
    });
  }

  // 4. Missing required values.
  const persons = caseState.parties.filter((p) => p.kind === 'Person');
  let missingFieldCount = 0;
  for (const f of GATE_FIELDS) {
    if (f.partyScoped) {
      for (const p of persons) {
        if (!isFieldPopulated(caseState, f.id, p.uuid)) missingFieldCount++;
      }
    } else if (!isFieldPopulated(caseState, f.id)) {
      missingFieldCount++;
    }
  }
  if (missingFieldCount > 0) {
    blockers.push({
      id: 'missing-values',
      priority: 4,
      message: `Populate ${missingFieldCount} required field${
        missingFieldCount === 1 ? '' : 's'
      }`,
    });
  }

  // 5. No product selected — uses the *effective* selection so a
  // stale-but-stored code blocks submission.
  if (!effectiveSelectedCode(caseState)) {
    blockers.push({
      id: 'no-product',
      priority: 5,
      message: caseState.arrangement.selectedProductCode
        ? 'Selected product DIP is stale — re-run or revert inputs'
        : 'Select a product on the Products tab',
    });
  }

  // 6. Application Declaration.
  if (!caseState.consentAssertions.ApplicationDeclaration) {
    blockers.push({
      id: 'no-app-declaration',
      priority: 6,
      message: 'Sign the Application Declaration',
    });
  }

  return blockers.sort((a, b) => a.priority - b.priority);
}

export function isSubmittable(caseState: Case): boolean {
  return computeBlockers(caseState).length === 0;
}
