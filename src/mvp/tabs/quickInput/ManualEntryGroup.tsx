import { useState, type ReactNode } from 'react';
import { Chip } from '../../components/atoms';
import type { GroupSummary } from '../../rules/fieldStatus';

/**
 * Generic collapsible group used for the four manual-entry sections.
 * Header: leading icon · group name · summary chip · chevron.
 * Body: form fields (caller renders).
 */
export interface ManualEntryGroupProps {
  /** Stable id used as the React key. */
  id: string;
  name: string;
  icon: ReactNode;
  summary: GroupSummary;
  /** When `true`, group starts open. */
  defaultOpen?: boolean;
  children?: ReactNode;
}

const CHEVRON = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function ManualEntryGroup({
  id,
  name,
  icon,
  summary,
  defaultOpen = false,
  children,
}: ManualEntryGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`qi-mgroup ${open ? 'open' : ''}`} data-group={id}>
      <button
        type="button"
        className="qi-mgroup-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`qi-mgroup-body-${id}`}
      >
        <span className="qi-mgroup-ico">{icon}</span>
        <span className="qi-mgroup-name">{name}</span>
        <SummaryChip summary={summary} />
        <span className={`qi-mgroup-chev ${open ? 'rotated' : ''}`}>
          {CHEVRON}
        </span>
      </button>
      {open && (
        <div className="qi-mgroup-body" id={`qi-mgroup-body-${id}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function SummaryChip({ summary }: { summary: GroupSummary }) {
  if (summary.band === 'empty') {
    return <Chip tone="neutral">Empty</Chip>;
  }
  if (summary.band === 'complete') {
    return <Chip tone="green">Complete</Chip>;
  }
  return (
    <Chip tone="amber">
      {summary.populated} of {summary.total} filled
    </Chip>
  );
}
