import { absTime, formatRel } from './helpers';
import EmailPayload from './payloads/EmailPayload';
import GroupedDocsPayload from './payloads/GroupedDocsPayload';
import SingleDocPayload from './payloads/SingleDocPayload';
import type {
  TimelineDoc,
  TimelineDensity,
  TimelineEvent,
  TimelineEventPayload,
} from './types';

export interface TimelineEventRowProps {
  event: TimelineEvent;
  density: TimelineDensity;
  emailExpanded: boolean;
  groupExpanded: boolean;
  onToggleEmail: () => void;
  onToggleGroup: () => void;
  onOpenDoc: (doc: TimelineDoc, ctx: TimelineEvent) => void;
}

export default function TimelineEventRow({
  event,
  density,
  emailExpanded,
  groupExpanded,
  onToggleEmail,
  onToggleGroup,
  onOpenDoc,
}: TimelineEventRowProps) {
  const compact = density === 'compact';
  const isStatus = event.type === 'status';
  const cls = ['timeline-event', isStatus ? 'is-status' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cls} data-type={event.type}>
      <div className="timeline-event__dot-wrap" aria-hidden="true">
        <span className="timeline-event__dot" />
      </div>

      <div className="timeline-event__body">
        <div className="timeline-event__title-line">
          <span className="timeline-event__title">{event.title}</span>
          {event.badges?.includes('AI') && (
            <span className="timeline-badge ai">AI</span>
          )}
          {event.badges?.includes('System') && (
            <span className="timeline-badge system">SYSTEM</span>
          )}
        </div>

        {event.desc && !compact && (
          <p className="timeline-event__desc">{event.desc}</p>
        )}

        {event.payload && (
          <PayloadSlot
            event={event}
            compact={compact}
            emailExpanded={emailExpanded}
            groupExpanded={groupExpanded}
            onToggleEmail={onToggleEmail}
            onToggleGroup={onToggleGroup}
            onOpenDoc={(d) => onOpenDoc(d, event)}
          />
        )}

        <div className="timeline-event__meta">
          <span className="timeline-event__meta-who">{event.who}</span>
          {event.source && (
            <>
              <span className="timeline-event__meta-sep" aria-hidden="true">
                ·
              </span>
              <span>{event.source}</span>
            </>
          )}
          <span className="timeline-event__meta-sep" aria-hidden="true">·</span>
          <span className="timeline-event__meta-mono">
            {formatRel(event.ts)} · {absTime(event.ts)}
          </span>
          {event.meta &&
            Object.entries(event.meta).map(([k, v]) => (
              <span key={k} className="timeline-event__meta-kv">
                <span className="timeline-event__meta-sep" aria-hidden="true">
                  ·
                </span>
                <span className="timeline-event__meta-key">{k}:</span>
                <span className="timeline-event__meta-val">{v}</span>
              </span>
            ))}
        </div>
      </div>
    </article>
  );
}

function PayloadSlot({
  event,
  compact,
  emailExpanded,
  groupExpanded,
  onToggleEmail,
  onToggleGroup,
  onOpenDoc,
}: {
  event: TimelineEvent;
  compact: boolean;
  emailExpanded: boolean;
  groupExpanded: boolean;
  onToggleEmail: () => void;
  onToggleGroup: () => void;
  onOpenDoc: (doc: TimelineDoc) => void;
}) {
  const p = event.payload as TimelineEventPayload;
  if ('single' in p) {
    return <SingleDocPayload doc={p.single} compact={compact} onOpen={onOpenDoc} />;
  }
  if ('docs' in p) {
    return (
      <GroupedDocsPayload
        docs={p.docs}
        expanded={groupExpanded}
        onToggle={onToggleGroup}
        compact={compact}
        onOpen={onOpenDoc}
      />
    );
  }
  return (
    <EmailPayload
      payload={p}
      expanded={emailExpanded}
      onToggle={onToggleEmail}
      compact={compact}
      onOpenAttachment={onOpenDoc}
    />
  );
}
