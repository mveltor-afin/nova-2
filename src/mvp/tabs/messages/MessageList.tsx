import { useEffect, useRef } from 'react';
import MessageGroup from './MessageGroup';
import TypingIndicator from './TypingIndicator';
import type { MessageDayGroup } from './grouping';
import type { Message, MessageAttachment, Participant } from './types';

export interface MessageListProps {
  days: MessageDayGroup[];
  typingParticipant?: Participant;
  onOpenAttachment: (a: MessageAttachment, m: Message) => void;
}

export default function MessageList({
  days,
  typingParticipant,
  onOpenAttachment,
}: MessageListProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // Only on mount — `days` reference is stable for the seed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="messages-list" ref={ref}>
      <div className="messages-list__inner">
        {days.map((d) => (
          <section key={d.dayKey} className="messages-day">
            <div className="messages-day__label">{d.dayKey}</div>
            {d.groups.map((g) => (
              <MessageGroup
                key={g.id}
                sender={g.sender}
                messages={g.messages}
                onOpenAttachment={onOpenAttachment}
              />
            ))}
          </section>
        ))}
        {typingParticipant && (
          <TypingIndicator participant={typingParticipant} />
        )}
      </div>
    </div>
  );
}
