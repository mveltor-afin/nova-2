import type { TimelineDensity, TimelineSort } from './types';

export interface TimelineToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  density: TimelineDensity;
  onDensityChange: (d: TimelineDensity) => void;
  sort: TimelineSort;
  onSortChange: (s: TimelineSort) => void;
  /** Disabled cosmetic copy used by the loading skeleton. */
  disabled?: boolean;
}

export default function TimelineToolbar({
  query,
  onQueryChange,
  density,
  onDensityChange,
  sort,
  onSortChange,
  disabled = false,
}: TimelineToolbarProps) {
  return (
    <div
      className={`timeline-toolbar ${disabled ? 'is-disabled' : ''}`}
      aria-disabled={disabled || undefined}
    >
      <label className="timeline-toolbar__search">
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
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Search timeline"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
          aria-label="Search timeline"
        />
        <kbd className="timeline-toolbar__kbd" aria-hidden="true">⌘K</kbd>
      </label>

      <div
        className="timeline-toolbar__seg"
        role="radiogroup"
        aria-label="Density"
      >
        <button
          type="button"
          role="radio"
          aria-checked={density === 'comfortable'}
          className={`timeline-toolbar__seg-btn ${
            density === 'comfortable' ? 'is-on' : ''
          }`}
          onClick={() => onDensityChange('comfortable')}
          disabled={disabled}
        >
          Comfortable
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={density === 'compact'}
          className={`timeline-toolbar__seg-btn ${
            density === 'compact' ? 'is-on' : ''
          }`}
          onClick={() => onDensityChange('compact')}
          disabled={disabled}
        >
          Compact
        </button>
      </div>

      <div
        className="timeline-toolbar__seg"
        role="radiogroup"
        aria-label="Sort"
      >
        <button
          type="button"
          role="radio"
          aria-checked={sort === 'newest'}
          className={`timeline-toolbar__seg-btn ${
            sort === 'newest' ? 'is-on' : ''
          }`}
          onClick={() => onSortChange('newest')}
          disabled={disabled}
        >
          Newest
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={sort === 'oldest'}
          className={`timeline-toolbar__seg-btn ${
            sort === 'oldest' ? 'is-on' : ''
          }`}
          onClick={() => onSortChange('oldest')}
          disabled={disabled}
        >
          Oldest
        </button>
      </div>

      <button
        type="button"
        className="timeline-toolbar__more"
        onClick={() =>
          console.warn('[Timeline stub] More filters not wired')
        }
        disabled={disabled}
      >
        More filters
      </button>
    </div>
  );
}
