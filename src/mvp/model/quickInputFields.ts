import type { Phase } from './case';

/**
 * Step 18 — Quick Input phase-gating helpers.
 *
 * The handoff's `rules/required.ts` already separates fields into
 * DIP-required vs Full-app-required sets. This module reuses those
 * sets to decide, for any given field, whether the Quick Input tab
 * should render it as **editable**, **locked** (DIP-stamped, no
 * further edits without revert), or **hidden** (not yet relevant).
 *
 * Resi is the demo path; product-family-specific exceptions (BTL,
 * RB, OBTL) are absorbed by the existing `rules/visibility.ts` which
 * runs before this gate.
 */

export type PhaseMode = 'editable' | 'locked' | 'hidden';

const DIP_FIELDS = new Set<string>([
  'A1', 'A2', 'A4', 'A6', 'A10', 'A11', 'A13', 'A19', 'A21',
  'A23', 'A23.city', 'A23.postcode', 'A24', 'A25', 'A27',
  'A30', 'A32', 'A34', 'A36', 'A38', 'A39', 'A40',
  'A41', 'A42', 'A46', 'A47', 'A51', 'A52',
  'P1', 'P1.city', 'P1.postcode', 'P4', 'P6', 'P7', 'P16', 'P21',
  'M1', 'M2', 'M3', 'M5', 'M6', 'M7', 'M9',
  'D1', 'D2',
  'C1', 'C4', 'C6',
  // Strip-owned (Step 14b): property + deposit are the strip's
  // canonical inputs. Loan amount is derived from them.
  'M17', 'M18', 'M19',
]);

const FULL_APP_FIELDS = new Set<string>([
  'A3', 'A5', 'A7', 'A8', 'A9', 'A12', 'A14', 'A15', 'A16', 'A17',
  'A22', 'A26', 'A28', 'A29',
  'A31', 'A33', 'A35', 'A37',
  'A43', 'A44', 'A45', 'A48', 'A49', 'A50', 'A53', 'A54', 'A55',
  'A56', 'A57', 'A58',
  'A59', 'A60', 'A61', 'A62', 'A63', 'A64',
  'P2', 'P3', 'P5', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14',
  'P15', 'P17', 'P18', 'P19', 'P20', 'P22', 'P23', 'P24', 'P25',
  'P26', 'P27', 'P28', 'P29', 'P30', 'P31', 'P32', 'P33',
  'M4', 'M8', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16',
  'D3', 'D4',
  'C2', 'C3', 'C5', 'C7', 'C8', 'C9',
  // Income & affordability that's full-app-only.
  'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9',
  'E10', 'E11', 'E12', 'E13', 'E14',
  'L1', 'L2', 'L3', 'L4', 'L5',
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9',
]);

/**
 * Decide whether a Quick Input field is editable, locked, or hidden
 * given the current lifecycle phase. Strip-owned fields stay
 * editable until disbursed, since the broker's "what-if" panel is
 * always-on per Step 14b — but they too lock when the case is fully
 * disbursed.
 */
export function phaseMode(fieldId: string, phase: Phase): PhaseMode {
  if (phase === 'disbursed') return 'locked';
  if (phase === 'full-application') {
    if (DIP_FIELDS.has(fieldId)) return 'locked';
    return 'editable';
  }
  // dip
  if (FULL_APP_FIELDS.has(fieldId) && !DIP_FIELDS.has(fieldId)) {
    return 'hidden';
  }
  return 'editable';
}

/** True when a section has at least one editable or locked field
 *  (i.e. should render at all under the current phase). */
export function sectionHasContent(
  fieldIds: string[],
  phase: Phase,
): boolean {
  return fieldIds.some((f) => phaseMode(f, phase) !== 'hidden');
}

/**
 * Step 20 — multi-field groups for completeness weighting.
 *
 * A group represents a single logical "field" (e.g. a full name, a
 * full address) made up of several register entries. The group as a
 * whole counts as **one** unit toward the denominator; its numerator
 * is the fraction of *required* sub-fields populated.
 *
 * `replaces` lists register IDs covered by this group — those IDs
 * are removed from the standalone-field iteration so we don't
 * double-count.
 */
export interface FieldGroupSubField {
  /** Register id (or compound id like 'A23.city'). Read via
   *  `rules/fieldStatus.isFieldPopulated`. */
  fieldId: string;
  /** Required sub-fields contribute to both numerator and denominator
   *  of the group's fractional weight; optional sub-fields contribute
   *  to neither. Allows a "middle name" optional within a Full Name
   *  group without dragging the broker's score down. */
  required: boolean;
}

export interface FieldGroup {
  groupId: string;
  /** When true, the group is evaluated once per applicant. */
  partyScoped: boolean;
  subFields: FieldGroupSubField[];
  /** Register IDs covered by this group; these are dropped from the
   *  standalone iteration so the same data point isn't counted twice. */
  replaces: string[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    groupId: 'FullName',
    partyScoped: true,
    subFields: [
      { fieldId: 'A2', required: true },
      { fieldId: 'A3', required: false },
      { fieldId: 'A4', required: true },
    ],
    replaces: ['A2', 'A3', 'A4'],
  },
  {
    groupId: 'CurrentAddress',
    partyScoped: true,
    subFields: [
      { fieldId: 'A23', required: true },
      { fieldId: 'A23.line2', required: false },
      { fieldId: 'A23.city', required: true },
      { fieldId: 'A23.postcode', required: true },
    ],
    replaces: ['A23'],
  },
  {
    groupId: 'PropertyAddress',
    partyScoped: false,
    subFields: [
      { fieldId: 'P1', required: true },
      { fieldId: 'P1.city', required: true },
      { fieldId: 'P1.postcode', required: true },
    ],
    replaces: ['P1'],
  },
];

/** Register-id prefixes that scope per-applicant. The completeness
 *  computation multiplies by applicant count for these. */
export function isPartyScopedFieldId(fieldId: string): boolean {
  if (fieldId.startsWith('A')) return true;
  if (fieldId === 'C4' || fieldId === 'C5') return true;
  return false;
}
