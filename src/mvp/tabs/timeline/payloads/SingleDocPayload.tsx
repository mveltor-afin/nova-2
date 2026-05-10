import type { TimelineDoc } from '../types';

export interface SingleDocPayloadProps {
  doc: TimelineDoc;
  compact?: boolean;
  onOpen: (doc: TimelineDoc) => void;
}

export default function SingleDocPayload({
  doc,
  compact = false,
  onOpen,
}: SingleDocPayloadProps) {
  if (compact) return null;
  return (
    <button
      type="button"
      className="timeline-doc-card"
      onClick={() => onOpen(doc)}
    >
      <span className="timeline-doc-card__ftype">{doc.type}</span>
      <span className="timeline-doc-card__name">{doc.name}</span>
      <span className="timeline-doc-card__meta">
        {doc.size} · {doc.version}
        {doc.pages !== undefined ? ` · ${doc.pages} pages` : ''}
      </span>
      <span className="timeline-doc-card__open">Open →</span>
    </button>
  );
}
