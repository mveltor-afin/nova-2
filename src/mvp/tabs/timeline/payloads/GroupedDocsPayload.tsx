import type { TimelineDoc } from '../types';

export interface GroupedDocsPayloadProps {
  docs: TimelineDoc[];
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
  onOpen: (doc: TimelineDoc) => void;
}

export default function GroupedDocsPayload({
  docs,
  expanded,
  onToggle,
  compact = false,
  onOpen,
}: GroupedDocsPayloadProps) {
  if (compact) return null;
  return (
    <div className="timeline-group-list">
      <button
        type="button"
        className="timeline-group-list__toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {expanded ? `Collapse` : `Show ${docs.length} files`}
      </button>
      {expanded && (
        <ul className="timeline-group-list__rows">
          {docs.map((d) => (
            <li key={d.name} className="timeline-group-list__row">
              <span className="timeline-group-list__ftype">{d.type}</span>
              <span className="timeline-group-list__name">{d.name}</span>
              <span className="timeline-group-list__meta">
                {d.size} · {d.version}
              </span>
              <button
                type="button"
                className="timeline-group-list__open"
                onClick={() => onOpen(d)}
              >
                Open →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
