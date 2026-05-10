import Avatar from './Avatar';
import type { Participant } from './types';

export interface TypingIndicatorProps {
  participant: Participant;
}

export default function TypingIndicator({ participant }: TypingIndicatorProps) {
  return (
    <div
      className="messages-typing"
      role="status"
      aria-live="polite"
      aria-label={`${participant.name} is typing`}
    >
      <Avatar participant={participant} size={32} showPresence={false} />
      <div className="messages-typing__bubble">
        <span className="messages-typing__dot" />
        <span className="messages-typing__dot" />
        <span className="messages-typing__dot" />
      </div>
      <span className="messages-typing__label">
        {participant.name} is typing…
      </span>
    </div>
  );
}
