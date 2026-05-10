import type { ReactNode } from 'react';

/**
 * One-action-at-a-time prompt. Yellow-tinted glass card with a square
 * icon, eyebrow + title + body, and a single-action link. Optional
 * dismiss "×" on the right.
 *
 * The Standalone v3 stylesheet pins the colours: tint
 * `rgba(242, 179, 61, 0.10)` and border `rgba(242, 179, 61, 0.28)`.
 */
export interface NudgeCardProps {
  /** Small uppercase eyebrow — e.g. `"ELIGIBILITY"`. */
  eyebrow?: string;
  /** Main heading — single line. */
  title: string;
  /** Supporting copy — string or richer node. */
  body?: ReactNode;
  /** Action link copy. Required for the action variant. */
  actionLabel?: string;
  /** Action click. */
  onAction?: () => void;
  /** Renders the small "×" dismiss button on the right. */
  onDismiss?: () => void;
  /** Custom icon. Defaults to a generic "spark" glyph. */
  icon?: ReactNode;
  className?: string;
}

const DEFAULT_ICON = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const DISMISS_ICON = (
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
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default function NudgeCard({
  eyebrow,
  title,
  body,
  actionLabel,
  onAction,
  onDismiss,
  icon,
  className,
}: NudgeCardProps) {
  const cls = ['nudge', className].filter(Boolean).join(' ');
  return (
    <div className={cls} role="status">
      <div className="nudge-ico">{icon ?? DEFAULT_ICON}</div>
      <div className="nudge-body">
        {eyebrow && <div className="lbl">{eyebrow}</div>}
        <h4>{title}</h4>
        {body && <p>{body}</p>}
      </div>
      <div className="nudge-actions">
        {actionLabel && onAction && (
          <button
            type="button"
            className="nudge-action"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="nudge-dismiss"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            {DISMISS_ICON}
          </button>
        )}
      </div>
    </div>
  );
}
