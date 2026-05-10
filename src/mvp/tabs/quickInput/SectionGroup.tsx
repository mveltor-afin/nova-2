import { useState, type ReactNode } from 'react';
import { Chip } from '../../components/atoms';

/**
 * Step 18 — Quick Input section wrapper. Same affordances as the
 * pre-existing `<ManualEntryGroup>` (icon · name · drain chip ·
 * chevron) but the API takes precomputed populated/total numbers
 * directly so each section can derive its own count without going
 * through `countGroup`.
 */
export interface SectionGroupProps {
  id: string;
  name: string;
  icon: ReactNode;
  populated: number;
  total: number;
  defaultOpen?: boolean;
  /** Optional small post-header note (e.g. phase-locked explainer). */
  subtitle?: ReactNode;
  children?: ReactNode;
}

export default function SectionGroup({
  id,
  name,
  icon,
  populated,
  total,
  defaultOpen = false,
  subtitle,
  children,
}: SectionGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const band = total === 0 || populated === 0
    ? 'empty'
    : populated >= total
      ? 'complete'
      : 'partial';

  return (
    <div className={`qi-mgroup qi-section ${open ? 'open' : ''}`} data-group={id}>
      <button
        type="button"
        className="qi-mgroup-head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`qi-section-body-${id}`}
      >
        <span className="qi-mgroup-ico">{icon}</span>
        <span className="qi-mgroup-name">{name}</span>
        {band === 'empty' && <Chip tone="neutral">Empty</Chip>}
        {band === 'partial' && (
          <Chip tone="amber">
            {populated} of {total} filled
          </Chip>
        )}
        {band === 'complete' && <Chip tone="green">Complete</Chip>}
        <span className={`qi-mgroup-chev ${open ? 'rotated' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="qi-mgroup-body" id={`qi-section-body-${id}`}>
          {subtitle && <div className="qi-section__subtitle">{subtitle}</div>}
          {children}
        </div>
      )}
    </div>
  );
}
