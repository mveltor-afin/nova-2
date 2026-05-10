/**
 * Step 19b — single horizontal strip of sub-tabs. No overflow menu,
 * no truncation, no "contains:" line. On narrow viewports the strip
 * scrolls horizontally so the layout never breaks; on the standard
 * workspace canvas (~1440px) all 9 fit without scrolling.
 */
export type SubTabId =
  | 'personal'
  | 'address'
  | 'identity'
  | 'employment'
  | 'income'
  | 'expenditure'
  | 'liabilities'
  | 'adverse'
  | 'professional';

interface SubTabDef {
  id: SubTabId;
  label: string;
}

export interface SubTabPillsProps {
  active: SubTabId;
  onChange: (id: SubTabId) => void;
  /** Set of sub-tab ids that currently need broker attention. */
  attentionSet: Set<SubTabId>;
}

const TABS: SubTabDef[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'address', label: 'Address' },
  { id: 'identity', label: 'Identity' },
  { id: 'employment', label: 'Employment' },
  { id: 'income', label: 'Income' },
  { id: 'expenditure', label: 'Expenditure' },
  { id: 'liabilities', label: 'Liabilities' },
  { id: 'adverse', label: 'Adverse' },
  { id: 'professional', label: 'Professional' },
];

export default function SubTabPills({
  active,
  onChange,
  attentionSet,
}: SubTabPillsProps) {
  return (
    <div className="sub-pills-wrap">
      <div className="sub-pills sub-pills--full" role="tablist">
        {TABS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            role="tab"
            aria-selected={active === pill.id}
            className={`sub-pill ${active === pill.id ? 'active' : ''}`}
            onClick={() => onChange(pill.id)}
          >
            {pill.label}
            {attentionSet.has(pill.id) && (
              <span className="sub-pill-dot" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const ALL_SUBTABS: SubTabDef[] = TABS;
