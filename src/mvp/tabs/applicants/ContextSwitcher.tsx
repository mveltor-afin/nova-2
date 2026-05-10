import { useCaseStore } from '../../store/caseStore';
import type { SubTabId } from './SubTabPills';

/**
 * Small toggle above the sub-tab content. Daniel / Amara / Joint
 * (Joint only on Income, Expenditure, Liabilities — the affordability
 * sub-tabs).
 */

export type ContextChoice = string | 'joint';

export interface ContextSwitcherProps {
  selected: ContextChoice;
  onSelect: (choice: ContextChoice) => void;
  subTab: SubTabId;
}

const JOINT_ENABLED: SubTabId[] = ['income', 'expenditure', 'liabilities'];

export default function ContextSwitcher({
  selected,
  onSelect,
  subTab,
}: ContextSwitcherProps) {
  const parties = useCaseStore((s) => s.case.parties);
  const showJoint = JOINT_ENABLED.includes(subTab);

  return (
    <div className="context-switcher" role="tablist" aria-label="Applicant context">
      {parties.map((party) => {
        if (party.kind !== 'Person') return null;
        const fullName = `${party.person.firstName} ${party.person.lastName}`;
        const isActive = selected === party.uuid;
        return (
          <button
            key={party.uuid}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`context-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(party.uuid)}
          >
            {fullName}
          </button>
        );
      })}
      {showJoint && (
        <button
          type="button"
          role="tab"
          aria-selected={selected === 'joint'}
          className={`context-pill joint ${selected === 'joint' ? 'active' : ''}`}
          onClick={() => onSelect('joint')}
        >
          Joint view
          <span className="context-pill-aside">(where applicable)</span>
        </button>
      )}
    </div>
  );
}
