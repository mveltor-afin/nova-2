import { useCaseStore } from '../../store/caseStore';
import { useShallow } from 'zustand/react/shallow';
import { selectLoanAmount } from '../../model/arrangementDerived';

/**
 * Compact pill-tag identity bar at the top of Quick input. Each tag
 * is case-level and editable inline (Step 6 wires the pencil affordance
 * but keeps the actual edit modal as a Step 7 follow-up — clicking
 * the pencil today emits a console hint).
 *
 * Tags 3 and 4 (Indicative loan, Indicative property) carry a
 * dashed border to flag the values as still-indicative, per v3.
 */

const PENCIL_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

function formatGBP(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}

export default function IdentityBar() {
  const display = useCaseStore(
    useShallow((s) => {
      const c = s.case;
      const primary = c.parties.find((p) => p.isPrimary);
      const familyName =
        primary?.kind === 'Person' ? primary.person.lastName : 'Applicant';
      const security = c.collaterals[0];
      // Step 14b — loan is derived from property + deposit live.
      const loanAmount = selectLoanAmount(c.arrangement, security?.estimatedValue);
      return {
        clientName: `Mr & Mrs ${familyName}`,
        productFamily: c.arrangement.productFamily,
        loanAmount,
        propertyLine: security
          ? `${security.address.line1}, ${security.address.postcode}`
          : '—',
      };
    }),
  );

  return (
    <div className="qi-bar" role="toolbar" aria-label="Case identity">
      <Tag label="Clients" value={display.clientName} />
      <Tag label="Product" value={display.productFamily} />
      <Tag label="Indicative loan" value={formatGBP(display.loanAmount)} indicative />
      <Tag label="Indicative property" value={display.propertyLine} indicative />
    </div>
  );
}

function Tag({
  label,
  value,
  indicative,
}: {
  label: string;
  value: string;
  indicative?: boolean;
}) {
  return (
    <button
      type="button"
      className={`qi-tag ${indicative ? 'indicative' : ''}`}
      onClick={() => {
        // Step 7 will open the edit modal. For now, no-op.
      }}
    >
      <span className="qi-lbl">{label}</span>
      <span className="qi-val">{value}</span>
      <span className="qi-edit" aria-label={`Edit ${label}`}>
        {PENCIL_ICON}
      </span>
    </button>
  );
}
