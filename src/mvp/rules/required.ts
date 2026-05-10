import type { Case, CaseStage } from '../model/case';
import { shouldShow, type ShouldShowContext } from './visibility';

/**
 * `isRequired(fieldId, case, stage, context?)` — single source of
 * truth for whether a field must be populated for the case to advance
 * past `stage`.
 *
 * Stage semantics:
 *  - `'DIPSubmitted'` — DIP submission gate. Only the register's
 *    DIP-required fields must be populated.
 *  - `'FullApplication'` — full-app submission gate. Adds the rest
 *    of the register's required-by-full-app fields.
 *  - Other stages don't have a hard gate; this helper returns false
 *    for them.
 *
 * If a field is hidden by `shouldShow` it is implicitly *not* required
 * — the visibility rule wins. This keeps the call sites tidy: a UI
 * that hides A26 doesn't also need to remember to skip A26 in
 * required-validation.
 */
export function isRequired(
  fieldId: string,
  caseState: Case,
  stage: CaseStage,
  context: ShouldShowContext = {},
): boolean {
  if (!shouldShow(fieldId, caseState, context)) return false;
  if (stage === 'DIPSubmitted') return DIP_REQUIRED.has(fieldId);
  if (stage === 'FullApplication') {
    return DIP_REQUIRED.has(fieldId) || FULL_APP_REQUIRED.has(fieldId);
  }
  return false;
}

/**
 * DIP-required fields. Mirrors the register's "DIP" column. The set
 * is the minimum needed for Afin's DIP decisioning engine.
 */
export const DIP_REQUIRED = new Set<string>([
  // Person identity & contact
  'A1', 'A2', 'A4', 'A6', 'A10', 'A11', 'A13', 'A19', 'A21',
  'A23', 'A24', 'A25', 'A27',
  // Adverse declaration (yes/no flags only)
  'A30', 'A32', 'A34', 'A36', 'A38', 'A39', 'A40',
  // Employment (basic)
  'A41', 'A42', 'A46', 'A47', 'A51', 'A52',
  // Property (security)
  'P1', 'P4', 'P6', 'P7', 'P16', 'P21',
  // Arrangement
  'M1', 'M2', 'M3', 'M5', 'M6', 'M7', 'M9',
  // Deposit
  'D1', 'D2',
  // Consents
  'C1', 'C4', 'C6',
]);

/**
 * Additional fields required for Full Application submission. Combined
 * with `DIP_REQUIRED` at full-app stage.
 */
export const FULL_APP_REQUIRED = new Set<string>([
  // Person — full identity
  'A3', 'A5', 'A7', 'A8', 'A9', 'A12', 'A14', 'A15', 'A16', 'A17',
  'A22', 'A26', 'A28', 'A29',
  // Adverse — detail rows (gated by visibility)
  'A31', 'A33', 'A35', 'A37',
  // Employment — full
  'A43', 'A44', 'A45', 'A48', 'A49', 'A50', 'A53', 'A54', 'A55',
  'A56', 'A57', 'A58',
  // Professional details (gated by family)
  'A59', 'A60', 'A61', 'A62', 'A63', 'A64',
  // Collateral — full
  'P2', 'P3', 'P5', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14',
  'P15', 'P17', 'P18', 'P19', 'P20', 'P22', 'P23', 'P24', 'P25',
  'P26', 'P27', 'P28', 'P29', 'P30', 'P31', 'P32', 'P33',
  // Arrangement
  'M4', 'M8', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16',
  // Deposit
  'D3', 'D4',
  // Consents
  'C2', 'C3', 'C5', 'C7', 'C8', 'C9',
]);
