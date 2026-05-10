import { EVENT_TYPES } from './eventTypes';
import type { TimelineEventType } from './types';

export interface TimelineActiveFiltersProps {
  active: Set<TimelineEventType>;
  query: string;
  visibleCount: number;
  totalCount: number;
  onRemoveType: (id: TimelineEventType) => void;
  onClearQuery: () => void;
  onClearAll: () => void;
}

export default function TimelineActiveFilters({
  active,
  query,
  visibleCount,
  totalCount,
  onRemoveType,
  onClearQuery,
  onClearAll,
}: TimelineActiveFiltersProps) {
  if (active.size === 0 && !query) return null;

  return (
    <div
      className="timeline-active-filters"
      role="status"
      aria-label="Active filters"
    >
      {EVENT_TYPES.filter((t) => active.has(t.id)).map((t) => (
        <span
          key={t.id}
          className="timeline-active-filters__pill"
          data-type={t.id}
        >
          <span className="timeline-chip__swatch" aria-hidden="true" />
          {t.label}
          <button
            type="button"
            className="timeline-active-filters__pill-x"
            onClick={() => onRemoveType(t.id)}
            aria-label={`Remove ${t.label} filter`}
          >
            ×
          </button>
        </span>
      ))}
      {query && (
        <span className="timeline-active-filters__pill">
          “{query}”
          <button
            type="button"
            className="timeline-active-filters__pill-x"
            onClick={onClearQuery}
            aria-label="Clear search"
          >
            ×
          </button>
        </span>
      )}
      <button
        type="button"
        className="timeline-active-filters__clear-all"
        onClick={onClearAll}
      >
        Clear all
      </button>
      <span className="timeline-active-filters__count">
        Showing {visibleCount} of {totalCount} events
      </span>
    </div>
  );
}
