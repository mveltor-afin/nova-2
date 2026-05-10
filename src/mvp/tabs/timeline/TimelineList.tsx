import TimelineEventRow from './TimelineEvent';
import type { TimelineDayGroup } from './helpers';
import type {
  TimelineDoc,
  TimelineDensity,
  TimelineEvent,
} from './types';

export interface TimelineListProps {
  groups: TimelineDayGroup[];
  density: TimelineDensity;
  expandedIds: Set<string>;
  groupOpenIds: Set<string>;
  onToggleEmail: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onOpenDoc: (doc: TimelineDoc, ctx: TimelineEvent) => void;
}

export default function TimelineList({
  groups,
  density,
  expandedIds,
  groupOpenIds,
  onToggleEmail,
  onToggleGroup,
  onOpenDoc,
}: TimelineListProps) {
  if (groups.length === 0) return null;
  return (
    <div
      className={`timeline-list ${
        density === 'compact' ? 'timeline-list--compact' : ''
      }`}
    >
      {groups.map((g) => (
        <section key={g.key} className="timeline-day">
          <div className="timeline-day__label">{g.key}</div>
          {g.events.map((e) => (
            <TimelineEventRow
              key={e.id}
              event={e}
              density={density}
              emailExpanded={expandedIds.has(e.id)}
              groupExpanded={groupOpenIds.has(e.id)}
              onToggleEmail={() => onToggleEmail(e.id)}
              onToggleGroup={() => onToggleGroup(e.id)}
              onOpenDoc={onOpenDoc}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
