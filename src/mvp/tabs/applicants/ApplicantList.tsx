import { Chip } from '../../components/atoms';
import { useCaseStore } from '../../store/caseStore';
import AddApplicantTrigger from './AddApplicantTrigger';

/**
 * Top-of-tab list of applicant cards. Selecting a card focuses the
 * record below. Polymorphic-ready: each card carries a kind-chip
 * (Person today; SoleTrader / LtdCo / SPV / LLP / Trust later).
 *
 * Avatar gradients:
 *   .av-1  primary applicant   stone-2 → stone-1
 *   .av-2  joint applicant     warm coral → rust
 */
export interface ApplicantListProps {
  selectedPartyUuid: string;
  onSelect: (uuid: string) => void;
}

export default function ApplicantList({
  selectedPartyUuid,
  onSelect,
}: ApplicantListProps) {
  const parties = useCaseStore((s) => s.case.parties);

  return (
    <div className="applicant-list" role="tablist" aria-label="Applicants">
      {parties.map((party, i) => {
        if (party.kind !== 'Person') return null;
        const initials = `${party.person.firstName[0] ?? ''}${party.person.lastName[0] ?? ''}`;
        const fullName = `${party.person.firstName} ${party.person.lastName}`;
        const isActive = party.uuid === selectedPartyUuid;
        return (
          <button
            key={party.uuid}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`applicant-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(party.uuid)}
          >
            <span className={`av-${i + 1}`} aria-hidden="true">
              {initials}
            </span>
            <span className="applicant-card-text">
              <span className="applicant-card-name">{fullName}</span>
              <span className="applicant-card-role">
                {party.isPrimary ? 'Primary applicant' : 'Joint applicant'}
              </span>
            </span>
            <Chip tone="neutral">Person</Chip>
          </button>
        );
      })}
      <AddApplicantTrigger />
    </div>
  );
}
