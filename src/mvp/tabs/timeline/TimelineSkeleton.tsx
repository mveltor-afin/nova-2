import TimelineActiveFilters from './TimelineActiveFilters';
import TimelineFilterChips from './TimelineFilterChips';
import TimelineToolbar from './TimelineToolbar';

const SKELETON_ROWS: { titleW: number; metaW: number }[] = [
  { titleW: 60, metaW: 38 },
  { titleW: 70, metaW: 32 },
  { titleW: 50, metaW: 42 },
  { titleW: 65, metaW: 28 },
  { titleW: 45, metaW: 36 },
  { titleW: 58, metaW: 34 },
];

export default function TimelineSkeleton() {
  return (
    <div className="timeline-skeleton">
      <TimelineToolbar
        query=""
        onQueryChange={() => {}}
        density="comfortable"
        onDensityChange={() => {}}
        sort="newest"
        onSortChange={() => {}}
        disabled
      />
      <TimelineFilterChips
        active={new Set()}
        onToggle={() => {}}
        disabled
      />
      <TimelineActiveFilters
        active={new Set()}
        query=""
        visibleCount={0}
        totalCount={0}
        onRemoveType={() => {}}
        onClearQuery={() => {}}
        onClearAll={() => {}}
      />
      <div className="timeline-list">
        <div className="timeline-skeleton__day" />
        {SKELETON_ROWS.map((r, i) => (
          <div key={i} className="timeline-skeleton__row">
            <span className="timeline-skeleton__dot" />
            <div className="timeline-skeleton__body">
              <span
                className="timeline-skeleton__line title"
                style={{ width: `${r.titleW}%` }}
              />
              <span
                className="timeline-skeleton__line meta"
                style={{ width: `${r.metaW}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
