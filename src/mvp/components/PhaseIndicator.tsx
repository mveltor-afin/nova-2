import {
  FULL_APP_STAGES,
  FULL_APP_STAGE_LABELS,
  type FullAppStage,
  type Phase,
} from '../model/case';

/**
 * ContextHeader's phase indicator. Two visualisations stack:
 *
 *   1. `.nova-flow-toggle` — DIP / Full Application pair, the active
 *      side filled. Always renders unless the case is disbursed.
 *   2. `.nova-stage-rail`  — five-stop rail with state labels above
 *      each stop name (COMPLETE · IN PROGRESS · NEXT · PENDING).
 *      Only renders when `phase === 'full-application'`.
 *
 * Disbursed uses the terminal `.phase-indicator--disbursed` pill —
 * a distinct visual moment so the broker knows the case is closed.
 *
 * Read-only — phase advancement happens through the dev panel until
 * real-flow transitions land in a future step.
 */
export interface PhaseIndicatorProps {
  phase: Phase;
  fullAppStage?: FullAppStage;
}

export default function PhaseIndicator({
  phase,
  fullAppStage,
}: PhaseIndicatorProps) {
  if (phase === 'disbursed') {
    return (
      <div
        className="phase-indicator phase-indicator--disbursed"
        role="status"
        aria-label="Phase: Disbursed, case closed"
      >
        <span className="phase-indicator__check" aria-hidden="true">
          {CHECK_ICON}
        </span>
        Disbursed · Case closed
      </div>
    );
  }

  const isDip = phase === 'dip';
  const isFullApp = phase === 'full-application';
  const currentIdx = isFullApp
    ? FULL_APP_STAGES.indexOf(fullAppStage ?? 'kyc')
    : -1;

  return (
    <>
      <div className="nova-flow-toggle" role="tablist" aria-label="Application phase">
        <button
          type="button"
          role="tab"
          aria-selected={isDip}
          className={isDip ? 'active' : ''}
        >
          {isDip && <span className="phase-indicator__dot" aria-hidden="true" />}
          DIP
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isFullApp}
          className={isFullApp ? 'active' : ''}
        >
          {isFullApp && <span className="phase-indicator__dot" aria-hidden="true" />}
          Full Application
        </button>
      </div>

      {isFullApp && (
        <div className="nova-stage-rail" role="list">
          {FULL_APP_STAGES.map((stage, i) => {
            const isDone = i < currentIdx;
            const isNow = i === currentIdx;
            const isNext = i === currentIdx + 1;
            return (
              <div
                key={stage}
                className={`nova-stage ${isDone ? 'done' : ''} ${isNow ? 'now' : ''}`}
                role="listitem"
                aria-current={isNow ? 'step' : undefined}
              >
                <span className="num">{isDone ? '✓' : i + 1}</span>
                <span className="lbl-wrap">
                  <span className="lbl-min">
                    {isDone
                      ? 'Complete'
                      : isNow
                        ? 'In progress'
                        : isNext
                          ? 'Next'
                          : 'Pending'}
                  </span>
                  <span className="lbl-name">{FULL_APP_STAGE_LABELS[stage]}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const CHECK_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
