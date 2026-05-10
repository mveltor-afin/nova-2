import { useEffect, useRef, useState } from 'react';

export interface MessagesHeaderProps {
  unreadCount: number;
  query: string;
  onQueryChange: (q: string) => void;
  disabled?: boolean;
}

export default function MessagesHeader({
  unreadCount,
  query,
  onQueryChange,
  disabled = false,
}: MessagesHeaderProps) {
  const [searchOpen, setSearchOpen] = useState<boolean>(query.length > 0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    onQueryChange('');
    setSearchOpen(false);
  }

  return (
    <header
      className={`messages-header ${disabled ? 'is-disabled' : ''}`}
      aria-disabled={disabled || undefined}
    >
      <div className="messages-header__inner">
        <h2 className="messages-header__title">Messages</h2>
        {unreadCount > 0 && (
          <span className="messages-header__pill">{unreadCount} new</span>
        )}

        <div className="messages-header__actions">
          {searchOpen ? (
            <input
              ref={inputRef}
              type="search"
              className="messages-header__search-input"
              placeholder="Search messages"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') closeSearch();
              }}
              onBlur={() => {
                if (!query) setSearchOpen(false);
              }}
              disabled={disabled}
            />
          ) : (
            <button
              type="button"
              className="messages-header__icon-btn"
              onClick={() => setSearchOpen(true)}
              disabled={disabled}
              aria-label="Search messages"
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
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
