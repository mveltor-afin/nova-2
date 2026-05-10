import { useRef, useEffect } from 'react';

export interface ComposerProps {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const STUB = (action: string) =>
  console.warn(`[Messages stub] ${action} not wired`);

export default function Composer({
  value,
  onChange,
  onSend,
  disabled = false,
}: ComposerProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className={`messages-composer ${disabled ? 'is-disabled' : ''}`}>
      <button
        type="button"
        className="messages-composer__attach-btn"
        onClick={() => STUB('attach')}
        disabled={disabled}
        aria-label="Attach file"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>

      <textarea
        ref={ref}
        className="messages-composer__textarea"
        placeholder="Type a message…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
        disabled={disabled}
      />

      <button
        type="button"
        className="messages-composer__emoji-btn"
        onClick={() => STUB('emoji')}
        disabled={disabled}
        aria-label="Insert emoji"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      <button
        type="button"
        className="messages-composer__send-btn"
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send message"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
