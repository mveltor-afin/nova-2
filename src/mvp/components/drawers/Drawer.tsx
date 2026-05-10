import { useEffect, type ReactNode } from 'react';

/**
 * Base shell for every drawer in the workspace. Right-side slide-in
 * panel with a backdrop overlay; click-outside and Esc close it.
 *
 * The drawer is mounted by the parent (e.g. `Drawers.tsx`); this
 * component simply renders the chrome around the content. Child
 * drawers compose this by passing `title`, `onClose`, and content.
 */
export interface DrawerProps {
  /** Drawer title — appears in the sticky header. */
  title: ReactNode;
  /** Optional eyebrow/subtitle row beneath the title. */
  subtitle?: ReactNode;
  /** Width in CSS units. Defaults to 480px. */
  width?: number | string;
  /** Click-out / Esc / close-button handler. */
  onClose: () => void;
  /** Footer content (Accept all, Resolve conflicts etc.). Optional. */
  footer?: ReactNode;
  children: ReactNode;
  /** Override the wrapper class for variant-specific styling. */
  variant?: string;
}

const CLOSE_ICON = (
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
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function Drawer({
  title,
  subtitle,
  width = 480,
  onClose,
  footer,
  children,
  variant,
}: DrawerProps) {
  // Esc to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const cls = ['drawer-panel', variant].filter(Boolean).join(' ');
  const widthValue = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className="drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className={cls}
        style={{ width: widthValue }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="drawer-head">
          <div className="drawer-head-text">
            <h3 className="drawer-title">{title}</h3>
            {subtitle && <div className="drawer-subtitle">{subtitle}</div>}
          </div>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            {CLOSE_ICON}
          </button>
        </header>

        <div className="drawer-body">{children}</div>

        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </div>
  );
}
