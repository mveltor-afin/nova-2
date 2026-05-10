import { useState, type CSSProperties } from 'react';
import { useCaseDisplay, selectPrimaryActionState } from '../store/selectors';
import { useCaseStore } from '../store/caseStore';
import { computeCompleteness } from '../rules/completeness';
import SubmitConfirmModal from './SubmitConfirmModal';
import PhaseIndicator from './PhaseIndicator';

function formatGBP(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`;
}

function formatLTV(ltv: number): string {
  return `${ltv.toFixed(1)}%`;
}

export default function ContextHeader() {
  const display = useCaseDisplay();
  const submittedAt = useCaseStore((s) => s.case.submittedAt);
  // Select the stable `case` reference and compute derived shapes in
  // render — Step 22's selector returns a fresh object so it's called
  // here, not via a Zustand selector (Gotchas §1).
  const caseState = useCaseStore((s) => s.case);
  const completeness = computeCompleteness(caseState);
  const primaryAction = selectPrimaryActionState(caseState);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitted = !!submittedAt;

  return (
    <header className="nova-context-header">
      <div className="nova-head-row">
        <div>
          <div className="nova-crumbs">
            Applications <span className="sep">›</span>{' '}
            <strong>{display.shortLabel}</strong>
          </div>

          <div className="nova-app-title">
            {display.clientName}
            <span className="nova-ref-badge">{display.reference}</span>
            {submitted && (
              <span className="nova-submitted-badge">Submitted</span>
            )}
          </div>

          <div className="nova-facts">
            <span>
              <span className="lbl">Loan</span>
              <span className="val">{formatGBP(display.loanAmount)}</span>
            </span>
            <span className="nova-facts-sep" />
            <span>
              <span className="lbl">LTV</span>
              <span className="val">{formatLTV(display.ltv)}</span>
            </span>
            <span className="nova-facts-sep" />
            <span>
              <span className="lbl">Product</span>
              <span className="val">{display.selectedProductLabel}</span>
            </span>
          </div>

          <div className="nova-flow-bar">
            <PhaseIndicator
              phase={display.lifecyclePhase}
              fullAppStage={display.fullAppStage}
            />
          </div>
        </div>

        <div className="nova-cta-cluster">
          <div
            className="nova-ring"
            style={
              { '--p': submitted ? 100 : completeness.percentage } as CSSProperties
            }
            aria-label={`Case progress ${
              submitted ? 100 : completeness.percentage
            }%`}
          >
            <span className="pct">
              {submitted ? 100 : completeness.percentage}%
            </span>
            <div className="nova-ring-tooltip" role="tooltip">
              {display.lifecyclePhase === 'disbursed' ? (
                <span>Case complete</span>
              ) : (
                <>
                  <div>
                    {Math.round(completeness.fieldsPopulated)} of{' '}
                    {completeness.fieldsTotal} fields ·{' '}
                    {completeness.docsFulfilled} of {completeness.docsTotal}{' '}
                    documents
                  </div>
                  <div className="nova-ring-tooltip__phase">
                    {display.lifecyclePhase === 'dip'
                      ? 'DIP-stage mandatories'
                      : 'Full-app mandatories'}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="nova-submit-wrap">
            {submitted ? (
              <div className="nova-submitted-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Submitted to underwriter
              </div>
            ) : primaryAction.visible ? (
              <>
                <button
                  className="nova-submit-btn allow-when-locked"
                  disabled={!primaryAction.enabled}
                  onClick={() =>
                    primaryAction.enabled && setConfirmOpen(true)
                  }
                  title={primaryAction.tooltip}
                >
                  {primaryAction.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
                {!primaryAction.enabled && primaryAction.tooltip && (
                  <div className="nova-submit-tooltip" role="tooltip">
                    <div className="nova-submit-tooltip-title">
                      Cannot proceed yet
                    </div>
                    <ul className="nova-submit-tooltip-list">
                      <li>{primaryAction.tooltip}</li>
                    </ul>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <SubmitConfirmModal
          mode={primaryAction.mode}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </header>
  );
}
