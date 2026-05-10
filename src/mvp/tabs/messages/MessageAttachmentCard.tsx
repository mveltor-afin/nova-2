import type { MessageAttachment } from './types';

export interface MessageAttachmentCardProps {
  attachment: MessageAttachment;
  inSelfBubble: boolean;
  onOpen: (a: MessageAttachment) => void;
}

const STUB = (action: string) =>
  console.warn(`[Messages stub] ${action} not wired`);

export default function MessageAttachmentCard({
  attachment,
  inSelfBubble,
  onOpen,
}: MessageAttachmentCardProps) {
  return (
    <button
      type="button"
      className={`messages-attachment ${
        inSelfBubble ? 'messages-attachment--in-self' : ''
      }`}
      onClick={() => onOpen(attachment)}
    >
      <span className="messages-attachment__ftype">{attachment.type}</span>
      <span className="messages-attachment__text">
        <span className="messages-attachment__name">{attachment.name}</span>
        <span className="messages-attachment__size">
          {attachment.size}
          {attachment.pages !== undefined ? ` · ${attachment.pages} pages` : ''}
        </span>
      </span>
      <span
        className="messages-attachment__download-btn"
        role="button"
        aria-label="Download"
        onClick={(e) => {
          e.stopPropagation();
          STUB('attachment download');
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </span>
    </button>
  );
}
