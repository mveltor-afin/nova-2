import MessageAttachmentCard from './MessageAttachmentCard';
import type { Message, MessageAttachment } from './types';

export interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  onOpenAttachment: (a: MessageAttachment, m: Message) => void;
}

export default function MessageBubble({
  message,
  isSelf,
  onOpenAttachment,
}: MessageBubbleProps) {
  const variant = isSelf ? 'messages-bubble--self' : 'messages-bubble--other';
  return (
    <div className={`messages-bubble ${variant}`}>
      {message.body && (
        <div className="messages-bubble__body">{message.body}</div>
      )}
      {message.attachments?.map((a) => (
        <div key={a.name} className="messages-bubble__attachment">
          <MessageAttachmentCard
            attachment={a}
            inSelfBubble={isSelf}
            onOpen={(att) => onOpenAttachment(att, message)}
          />
        </div>
      ))}
    </div>
  );
}
