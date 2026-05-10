import { useEffect } from 'react';

/**
 * Lightweight centred modal used to mock previewing a generated
 * artefact (DIP cert, ESIS). The brief explicitly calls for "a styled
 * card with the doc title and 'Preview placeholder'" — kept faithful.
 */
export interface DocPreviewModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const CLOSE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function DocPreviewModal({
  title,
  subtitle,
  onClose,
}: DocPreviewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="doc-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="doc-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="doc-modal-head">
          <div className="doc-modal-titles">
            <div className="doc-modal-title">{title}</div>
            {subtitle && <div className="doc-modal-sub">{subtitle}</div>}
          </div>
          <button
            type="button"
            className="doc-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            {CLOSE_ICON}
          </button>
        </header>

        <div className="doc-modal-body">
          <div className="doc-modal-page">
            <div className="doc-modal-page-margin top">
              <span className="doc-modal-pseudo">Afin Bank · {title}</span>
              <span className="doc-modal-pseudo">Ref · ARR-2026-04-19847</span>
            </div>
            <div className="doc-modal-page-body">
              <div className="doc-modal-placeholder">Preview placeholder</div>
              <p className="doc-modal-hint">
                The real {title} renders from the DIP / mortgage offer engine
                after submission. This demo shows the shell only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
