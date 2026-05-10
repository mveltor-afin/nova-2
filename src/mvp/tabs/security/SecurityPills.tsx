/**
 * Five sub-tab pills for Security: Property · Tenure · Attributes ·
 * Occupancy · Insurance. No overflow on this tab in v3.
 */

export type SecuritySubTab =
  | 'property'
  | 'tenure'
  | 'attributes'
  | 'occupancy'
  | 'insurance';

const PILLS: { id: SecuritySubTab; label: string }[] = [
  { id: 'property', label: 'Property' },
  { id: 'tenure', label: 'Tenure' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'occupancy', label: 'Occupancy' },
  { id: 'insurance', label: 'Insurance' },
];

export interface SecurityPillsProps {
  active: SecuritySubTab;
  onChange: (id: SecuritySubTab) => void;
}

export default function SecurityPills({ active, onChange }: SecurityPillsProps) {
  return (
    <div className="sub-pills" role="tablist" aria-label="Security sections">
      {PILLS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={active === p.id}
          className={`sub-pill ${active === p.id ? 'active' : ''}`}
          onClick={() => onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
