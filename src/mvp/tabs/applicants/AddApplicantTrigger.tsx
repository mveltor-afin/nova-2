import { useCaseStore } from '../../store/caseStore';

/**
 * Step 19 — Renders the "+ Add applicant" affordance when the case
 * has exactly one applicant. At cap (2), nothing renders.
 */
export default function AddApplicantTrigger() {
  const applicantCount = useCaseStore(
    (s) => s.case.parties.filter((p) => p.kind === 'Person').length,
  );
  const openDrawer = useCaseStore((s) => s.openDrawer);

  if (applicantCount >= 2) return null;

  return (
    <button
      type="button"
      className="add-applicant-trigger"
      onClick={() => openDrawer({ kind: 'add-applicant' })}
      title="Add a second applicant (max 2 per case)"
    >
      <span className="add-applicant-trigger__plus" aria-hidden="true">+</span>
      <span>Add applicant</span>
    </button>
  );
}
