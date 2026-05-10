import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../../store/caseStore';
import { isFieldPopulated } from '../../rules/fieldStatus';
import type { Case } from '../../model/case';

/**
 * Compact tally summarising current case completeness:
 *   "12 fields populated · 5 awaiting review · 2 conflicts"
 *
 * Each count is a click-through. The first opens the global Field
 * Review drawer; the next two open the same drawer with a filter.
 * The trailing link jumps to the Applicants tab.
 */

const POPULATED_FIELDS: { fieldId: string; partyScoped?: boolean }[] = [
  // Core identity
  { fieldId: 'A1', partyScoped: true },
  { fieldId: 'A2', partyScoped: true },
  { fieldId: 'A4', partyScoped: true },
  { fieldId: 'A6', partyScoped: true },
  { fieldId: 'A11', partyScoped: true },
  { fieldId: 'A19', partyScoped: true },
  { fieldId: 'A21', partyScoped: true },
  { fieldId: 'A23', partyScoped: true },
  // Employment
  { fieldId: 'A41', partyScoped: true },
  { fieldId: 'A42', partyScoped: true },
  { fieldId: 'A46', partyScoped: true },
  { fieldId: 'A51', partyScoped: true },
  // Property
  { fieldId: 'P1' },
  { fieldId: 'P4' },
  { fieldId: 'P6' },
  { fieldId: 'P16' },
  { fieldId: 'P21' },
  // Arrangement (M6 loan amount is derived from P16 + D1 — Step 14b —
  // so it's not counted here; P16 + D1 below are the authored inputs).
  { fieldId: 'M1' },
  { fieldId: 'M2' },
  { fieldId: 'M3' },
  { fieldId: 'M5' },
  { fieldId: 'M7' },
  { fieldId: 'M9' },
  // Deposit
  { fieldId: 'D1' },
  { fieldId: 'D2' },
];

function countPopulated(c: Case): number {
  let n = 0;
  const persons = c.parties.filter((p) => p.kind === 'Person');
  for (const f of POPULATED_FIELDS) {
    if (f.partyScoped) {
      for (const p of persons) {
        if (isFieldPopulated(c, f.fieldId, p.uuid)) n++;
      }
    } else if (isFieldPopulated(c, f.fieldId)) {
      n++;
    }
  }
  return n;
}

export default function TallyBar() {
  const caseState = useCaseStore((s) => s.case);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const navigate = useNavigate();

  const populated = countPopulated(caseState);
  const awaitingReview = caseState.extractions.filter(
    (e) => e.status === 'Proposed',
  ).length;

  // Conflicts = distinct target fields with 2+ extractions where at least
  // one is still proposed.
  const conflictKeys = new Set<string>();
  const groups = new Map<string, number>();
  for (const e of caseState.extractions) {
    const k = `${e.targetEntity}:${e.targetEntityId}:${e.targetAttribute}`;
    groups.set(k, (groups.get(k) ?? 0) + 1);
  }
  for (const [k, count] of groups) {
    if (count > 1) {
      const proposed = caseState.extractions.some(
        (e) =>
          `${e.targetEntity}:${e.targetEntityId}:${e.targetAttribute}` === k &&
          e.status === 'Proposed',
      );
      if (proposed) conflictKeys.add(k);
    }
  }
  const conflicts = conflictKeys.size;

  return (
    <div className="qi-tally" role="status">
      <button
        type="button"
        className="qi-tally-stat"
        onClick={() => openDrawer({ kind: 'field-review', filter: 'all' })}
      >
        <strong>{populated}</strong>
        <span> fields populated</span>
      </button>

      <span className="qi-tally-sep" aria-hidden="true">·</span>

      <button
        type="button"
        className="qi-tally-stat"
        onClick={() => openDrawer({ kind: 'field-review', filter: 'pending' })}
      >
        <strong>{awaitingReview}</strong>
        <span> awaiting review</span>
      </button>

      <span className="qi-tally-sep" aria-hidden="true">·</span>

      <button
        type="button"
        className="qi-tally-stat"
        onClick={() =>
          openDrawer({ kind: 'field-review', filter: 'conflicts' })
        }
      >
        <strong>{conflicts}</strong>
        <span> conflicts</span>
      </button>

      <button
        type="button"
        className="tally-link"
        onClick={() => navigate('/applicants')}
      >
        View on Applicants <span className="tally-link-arrow">→</span>
      </button>
    </div>
  );
}
