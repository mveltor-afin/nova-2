import { absTime } from '../timeline/helpers';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import type { Message, MessageAttachment, Participant } from './types';

export interface MessageGroupProps {
  sender: Participant;
  messages: Message[];
  onOpenAttachment: (a: MessageAttachment, m: Message) => void;
}

const READ_RECEIPT = (
  <svg
    width="14"
    height="10"
    viewBox="0 0 24 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 9 7 14 14 4" />
    <path d="M10 9 14 13 22 3" />
  </svg>
);

export default function MessageGroup({
  sender,
  messages,
  onOpenAttachment,
}: MessageGroupProps) {
  const isSelf = !!sender.isSelf;
  const first = messages[0];
  const time = absTime(first.ts);

  return (
    <div
      className={`messages-group ${
        isSelf ? 'messages-group--self' : 'messages-group--other'
      }`}
    >
      {!isSelf && (
        <div className="messages-group__avatar">
          <Avatar participant={sender} />
        </div>
      )}

      <div className="messages-group__column">
        {isSelf ? (
          <div className="messages-group__self-meta">
            <span className="messages-group__sender-time">{time}</span>
            <span className="messages-group__read-receipt" aria-label="Read">
              {READ_RECEIPT}
            </span>
          </div>
        ) : (
          <div className="messages-group__sender-line">
            <span className="messages-group__sender-name">{sender.name}</span>
            <span className="messages-group__sender-role">{sender.role}</span>
            <span className="messages-group__sender-time">{time}</span>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isSelf={isSelf}
            onOpenAttachment={onOpenAttachment}
          />
        ))}
      </div>
    </div>
  );
}
