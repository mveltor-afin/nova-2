import { EVENT_TYPES } from './eventTypes';
import type { TimelineEventType } from './types';

export interface TimelineFilterChipsProps {
  active: Set<TimelineEventType>;
  onToggle: (id: TimelineEventType) => void;
  disabled?: boolean;
}

export default function TimelineFilterChips({
  active,
  onToggle,
  disabled = false,
}: TimelineFilterChipsProps) {
  return (
    <div
      className={`timeline-chips ${disabled ? 'is-disabled' : ''}`}
      role="group"
      aria-label="Filter timeline by event type"
      aria-disabled={disabled || undefined}
    >
      {EVENT_TYPES.map((t) => {
        const isOn = active.has(t.id);
        return (
          <button
            key={t.id}
            type="button"
            className={`timeline-chip ${isOn ? 'is-on' : ''}`}
            aria-pressed={isOn}
            onClick={() => onToggle(t.id)}
            disabled={disabled}
            data-type={t.id}
          >
            <span className="timeline-chip__swatch" aria-hidden="true" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
