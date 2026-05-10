import type { Case } from '../model/case';
import { DIP_REQUIRED, FULL_APP_REQUIRED } from './required';
import { isFieldPopulated } from './fieldStatus';
import { shouldShow } from './visibility';
import {
  FIELD_GROUPS,
  isPartyScopedFieldId,
  type FieldGroup,
} from '../model/quickInputFields';
import { resolvePlaceholders } from '../model/documentPlaceholders';

/**
 * Step 20 — single phase-aware completeness number for the
 * ContextHeader. Pure function; safe to call in render with a
 * stable `case` reference.
 */
export interface CompletenessBreakdown {
  numerator: number;
  denominator: number;
  percentage: number;
  fieldsPopulated: number;
  fieldsTotal: number;
  docsFulfilled: number;
  docsTotal: number;
}

const ZERO: CompletenessBreakdown = {
  numerator: 0,
  denominator: 0,
  percentage: 0,
  fieldsPopulated: 0,
  fieldsTotal: 0,
  docsFulfilled: 0,
  docsTotal: 0,
};

const COMPLETE: CompletenessBreakdown = {
  ...ZERO,
  percentage: 100,
};

export function computeCompleteness(c: Case): CompletenessBreakdown {
  if (c.phase === 'disbursed') return COMPLETE;

  const mandatorySet = phaseMandatorySet(c.phase);
  const persons = c.parties
    .filter((p) => p.kind === 'Person')
    .map((p) => p.uuid);

  let numerator = 0;
  let denominator = 0;
  let fieldsPopulated = 0;
  let fieldsTotal = 0;
  let docsFulfilled = 0;
  let docsTotal = 0;
  const consumed = new Set<string>();

  for (const group of FIELD_GROUPS) {
    if (!groupAppliesAtPhase(group, mandatorySet)) continue;
    if (group.partyScoped) {
      for (const partyUuid of persons) {
        const { weight } = evaluateGroup(group, c, partyUuid);
        numerator += weight;
        denominator += 1;
        fieldsPopulated += weight;
        fieldsTotal += 1;
      }
    } else {
      const { weight } = evaluateGroup(group, c, undefined);
      numerator += weight;
      denominator += 1;
      fieldsPopulated += weight;
      fieldsTotal += 1;
    }
    for (const id of group.replaces) consumed.add(id);
  }

  for (const fieldId of mandatorySet) {
    if (consumed.has(fieldId)) continue;
    if (isPartyScopedFieldId(fieldId)) {
      for (const partyUuid of persons) {
        if (!shouldShow(fieldId, c, { partyUuid })) continue;
        denominator += 1;
        fieldsTotal += 1;
        if (isFieldPopulated(c, fieldId, partyUuid)) {
          numerator += 1;
          fieldsPopulated += 1;
        }
      }
    } else {
      if (!shouldShow(fieldId, c)) continue;
      denominator += 1;
      fieldsTotal += 1;
      if (isFieldPopulated(c, fieldId)) {
        numerator += 1;
        fieldsPopulated += 1;
      }
    }
  }

  const placeholders = resolvePlaceholders(c);
  for (const r of placeholders) {
    if (!r.spec.mandatory) continue;
    docsTotal += 1;
    denominator += 1;
    if (r.state === 'done' || r.state === 'awaiting-review') {
      docsFulfilled += 1;
      numerator += 1;
    }
  }

  const percentage =
    denominator > 0 ? Math.round((100 * numerator) / denominator) : 0;
  return {
    numerator,
    denominator,
    percentage,
    fieldsPopulated,
    fieldsTotal,
    docsFulfilled,
    docsTotal,
  };
}

function phaseMandatorySet(phase: Case['phase']): Set<string> {
  // Step 22 — consents are tracked via the Application Declaration
  // gate (and per-tile UI on the Consents tab); they don't belong in
  // the data-completeness gauge.
  const filterConsents = (id: string): boolean => !id.startsWith('C');
  if (phase === 'dip') {
    return new Set([...DIP_REQUIRED].filter(filterConsents));
  }
  if (phase === 'full-application') {
    const merged = new Set<string>();
    for (const f of DIP_REQUIRED) if (filterConsents(f)) merged.add(f);
    for (const f of FULL_APP_REQUIRED) if (filterConsents(f)) merged.add(f);
    return merged;
  }
  return new Set<string>();
}

function groupAppliesAtPhase(group: FieldGroup, mandatory: Set<string>): boolean {
  return group.replaces.some((id) => mandatory.has(id));
}

function evaluateGroup(
  group: FieldGroup,
  c: Case,
  partyUuid: string | undefined,
): { weight: number } {
  const visibleRequired = group.subFields.filter(
    (s) => s.required && shouldShow(s.fieldId.split('.')[0], c, { partyUuid }),
  );
  if (visibleRequired.length === 0) return { weight: 0 };
  const populated = visibleRequired.filter((s) =>
    isFieldPopulated(c, s.fieldId, partyUuid),
  ).length;
  return { weight: populated / visibleRequired.length };
}
