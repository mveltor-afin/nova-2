import type { TimelineDoc, TimelineEventPayload } from '../types';

type EmailPayload = Extract<TimelineEventPayload, { from: string }>;

export interface EmailPayloadProps {
  payload: EmailPayload;
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
  onOpenAttachment: (doc: TimelineDoc) => void;
}

const STUB = (action: string) =>
  console.warn(`[Timeline stub] ${action} not wired`);

export default function EmailPayload({
  payload,
  expanded,
  onToggle,
  compact = false,
  onOpenAttachment,
}: EmailPayloadProps) {
  if (!expanded) {
    if (compact) return null;
    return (
      <div className="timeline-email">
        {payload.preview && (
          <p className="timeline-email__preview">{payload.preview}</p>
        )}
        <button
          type="button"
          className="timeline-email__toggle"
          onClick={onToggle}
        >
          Open thread
        </button>
      </div>
    );
  }

  return (
    <div className="timeline-email is-expanded">
      <dl className="timeline-email__head">
        <div>
          <dt>From</dt>
          <dd>{payload.from}</dd>
        </div>
        <div>
          <dt>To</dt>
          <dd>{payload.to}</dd>
        </div>
        {payload.cc && (
          <div>
            <dt>Cc</dt>
            <dd>{payload.cc}</dd>
          </div>
        )}
        <div>
          <dt>Subject</dt>
          <dd>{payload.subject}</dd>
        </div>
      </dl>

      {!compact && payload.body && (
        <div className="timeline-email__body-text">
          {payload.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {payload.attachments && payload.attachments.length > 0 && (
        <div className="timeline-email__attachments">
          {payload.attachments.map((d) => (
            <button
              key={d.name}
              type="button"
              className="timeline-email__attachment"
              onClick={() => onOpenAttachment(d)}
            >
              <span className="timeline-email__attachment-ftype">{d.type}</span>
              <span className="timeline-email__attachment-name">{d.name}</span>
              <span className="timeline-email__attachment-size">{d.size}</span>
            </button>
          ))}
        </div>
      )}

      <div className="timeline-email__actions">
        <button
          type="button"
          className="timeline-email__action primary"
          onClick={() => STUB('Reply')}
        >
          Reply
        </button>
        <button
          type="button"
          className="timeline-email__action"
          onClick={() => STUB('Reply all')}
        >
          Reply all
        </button>
        <button
          type="button"
          className="timeline-email__action"
          onClick={() => STUB('Forward')}
        >
          Forward
        </button>
        <button
          type="button"
          className="timeline-email__action ghost-right"
          onClick={() => STUB('Open in mail viewer')}
        >
          Open in mail viewer
        </button>
        <button
          type="button"
          className="timeline-email__toggle close"
          onClick={onToggle}
        >
          Collapse
        </button>
      </div>
    </div>
  );
}
