import type { ReactNode } from 'react';
import Provenance, { type ProvenanceProps } from './Provenance';

/**
 * The atomic field row used everywhere on the workspace. Renders
 * label · value · provenance footer, with the state-specific dressing
 * for the six register-defined field states.
 *
 * The `state` prop drives both the visual treatment and which extra
 * affordances appear (upload / type-in / resolve / accept-reject).
 */
export type FieldRowState =
  /** Default — value present, provenance shown beneath. */
  | 'populated'
  /** AI-proposed, mid-confidence — yellow review wash, accept/reject. */
  | 'awaiting-review'
  /** Required but empty — coral wash, inline upload + type-in CTAs. */
  | 'missing'
  /** Two competing extractions — coral border, value redacted, Resolve CTA. */
  | 'conflict'
  /** Frozen at DIP — lock icon, read-only. */
  | 'locked'
  /** Manually overridden — small banner above the row. */
  | 'manual-override';

export interface FieldRowProps {
  label: string;
  /** Optional small suffix appended to the label (e.g. " — OBTL only").
   *  Rendered with subdued styling. */
  labelSuffix?: ReactNode;
  /** Value to display. Strings render plain; ReactNode for richer cases
   *  (links, money formatting, multi-line addresses). */
  value?: ReactNode;
  state?: FieldRowState;
  /** Provenance footer. Omit on `missing` and `conflict` rows. */
  provenance?: ProvenanceProps;

  // === State-specific affordances ===

  /** `missing` — upload-CTA click. Renders "Upload payslip" pill button. */
  onUpload?: () => void;
  /** `missing` — manual-entry click. Renders "type it in" link. */
  onTypeIn?: () => void;
  /** `missing` — short hint sentence beneath the placeholder. */
  hint?: string;
  /** `missing` — placeholder text shown in italic. Defaults to "Awaiting upload". */
  placeholder?: string;

  /** `conflict` — opens the conflict-resolution modal. */
  onResolve?: () => void;
  /** `conflict` — short summary of the disagreement (one sentence). */
  conflictSummary?: string;

  /** `awaiting-review` — accept the AI proposal. */
  onAccept?: () => void;
  /** `awaiting-review` — reject / replace. */
  onReject?: () => void;

  /** `manual-override` — banner copy. Defaults to a generic line. */
  overrideMessage?: ReactNode;

  className?: string;
}

const LOCK_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function FieldRow({
  label,
  labelSuffix,
  value,
  state = 'populated',
  provenance,
  onUpload,
  onTypeIn,
  hint,
  placeholder = 'Awaiting upload',
  onResolve,
  conflictSummary,
  onAccept,
  onReject,
  overrideMessage,
  className,
}: FieldRowProps) {
  const stateClass =
    state === 'awaiting-review'
      ? 'review'
      : state === 'missing'
        ? 'needs'
        : state === 'conflict'
          ? 'conflict'
          : state === 'locked'
            ? 'locked'
            : state === 'manual-override'
              ? 'manual-override'
              : '';

  const cls = ['field', stateClass, className].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      {state === 'manual-override' && (
        <div className="field-override-banner" role="note">
          {overrideMessage ?? 'Manual override · differs from extracted value'}
        </div>
      )}

      <span className="lbl">
        {label}
        {state === 'locked' && <span className="lbl-lock">{LOCK_ICON}</span>}
        {labelSuffix && <span className="lbl-suffix">{labelSuffix}</span>}
      </span>

      {state === 'missing' ? (
        <div className="val needs-val">
          <span className="placeholder">{placeholder}</span>
          {onUpload && (
            <button type="button" className="upload-cta" onClick={onUpload}>
              Upload
            </button>
          )}
          {onTypeIn && (
            <button type="button" className="typein-link" onClick={onTypeIn}>
              or type it in
            </button>
          )}
        </div>
      ) : state === 'conflict' ? (
        <div className="val conflict-val">
          <span className="redacted">— —</span>
          {onResolve && (
            <button type="button" className="resolve-link" onClick={onResolve}>
              Resolve
            </button>
          )}
        </div>
      ) : (
        <span className="val">{value}</span>
      )}

      {state === 'missing' && hint && <span className="hint">{hint}</span>}
      {state === 'conflict' && conflictSummary && (
        <span className="conflict-hint">{conflictSummary}</span>
      )}

      {state === 'awaiting-review' && (onAccept || onReject) && (
        <div className="review-actions">
          {onReject && (
            <button type="button" className="review-reject" onClick={onReject}>
              Reject
            </button>
          )}
          {onAccept && (
            <button type="button" className="review-accept" onClick={onAccept}>
              Accept
            </button>
          )}
        </div>
      )}

      {provenance && state !== 'missing' && state !== 'conflict' && (
        <Provenance {...provenance} />
      )}
    </div>
  );
}
