import { useState, type ReactNode } from 'react';
import PlaceholderRow from './PlaceholderRow';
import type { Document } from '../../model/document';
import type { ResolvedPlaceholder } from '../../model/documentPlaceholders';

export interface PlaceholderGroupProps {
  title: string;
  rows: ResolvedPlaceholder[];
  documentsByUuid: Map<string, Document>;
  defaultOpen?: boolean;
  icon: ReactNode;
  onView: (doc: Document) => void;
}

export default function PlaceholderGroup({
  title,
  rows,
  documentsByUuid,
  defaultOpen = false,
  icon,
  onView,
}: PlaceholderGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const fulfilled = rows.filter(
    (r) => r.state === 'done' || r.state === 'awaiting-review',
  ).length;

  return (
    <section className={`placeholder-group ${open ? 'is-open' : 'is-closed'}`}>
      <button
        type="button"
        className="placeholder-group__header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="placeholder-group__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="placeholder-group__title">{title}</span>
        <span className="placeholder-group__count">
          {fulfilled} of {rows.length}
        </span>
        <span className="placeholder-group__chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="placeholder-group__body">
          {rows.map((r) => (
            <PlaceholderRow
              key={r.uniqueKey}
              resolved={r}
              document={r.documentId ? documentsByUuid.get(r.documentId) : undefined}
              onView={onView}
            />
          ))}
        </div>
      )}
    </section>
  );
}
