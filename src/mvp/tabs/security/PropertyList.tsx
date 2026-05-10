import { useCaseStore } from '../../store/caseStore';
import type { Collateral } from '../../model/collateral';

/**
 * Property card list at the top of the Security tab.
 *  · 28px-ish address heading (`.pc-addr`)
 *  · role chip (`.pc-role`)
 *  · meta row with `.pc-pip` (done for freehold, partial for leasehold) + tenure + value
 *  · trailing dashed `+ Add property` card
 */
export interface PropertyListProps {
  selectedUuid: string;
  onSelect: (uuid: string) => void;
}

export default function PropertyList({ selectedUuid, onSelect }: PropertyListProps) {
  const collaterals = useCaseStore((s) => s.case.collaterals);

  return (
    <div className="property-row" role="tablist" aria-label="Securities">
      {collaterals.map((c, i) => (
        <PropertyCard
          key={c.uuid}
          c={c}
          isPrimary={i === 0}
          isActive={c.uuid === selectedUuid}
          onClick={() => onSelect(c.uuid)}
        />
      ))}
      <button type="button" className="add-card">
        <span className="add-card-plus">+</span>
        <span>Add property</span>
      </button>
    </div>
  );
}

function PropertyCard({
  c,
  isPrimary,
  isActive,
  onClick,
}: {
  c: Collateral;
  isPrimary: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  // pip is done for freehold, partial for leasehold (proxy for "tenure
  // detail still needed" — the lease years remaining is required).
  const pipState = c.tenure === 'Freehold' ? 'done' : 'partial';
  const role = isPrimary ? 'Primary security' : 'Additional security';
  const value = c.estimatedValue
    ? `£${c.estimatedValue.toLocaleString('en-GB')}`
    : '—';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={`property-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="pc-addr">{c.address.line1}</div>
      <div className="pc-role">{role}</div>
      <div className="pc-meta">
        <span className={`pc-pip ${pipState}`} aria-hidden="true" />
        <span>{c.tenure}</span>
        <span className="pc-meta-sep" />
        <span>{value}</span>
        <span className="pc-meta-sep" />
        <span>{c.address.postcode}</span>
      </div>
    </button>
  );
}
