import { useEffect } from 'react';
import { useCaseDisplay } from '../store/selectors';
import { useCaseStore } from '../store/caseStore';
import type { PrimaryActionMode } from '../store/selectors';

/**
 * Step 22 — submission confirmation modal, parameterised on the
 * primary action mode. Two surfaces:
 *
 *   - dip-advance      → "Proceed to full application?" → dispatches
 *                        `proceedToFullApplication`.
 *   - full-app-submit  → "Submit application?" → dispatches
 *                        `submitFullApplication`.
 */
export interface SubmitConfirmModalProps {
  onClose: () => void;
  mode: PrimaryActionMode;
}

const CLOSE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export default function SubmitConfirmModal({ onClose, mode }: SubmitConfirmModalProps) {
  const display = useCaseDisplay();
  const proceedToFullApplication = useCaseStore(
    (s) => s.proceedToFullApplication,
  );
  const submitFullApplication = useCaseStore((s) => s.submitFullApplication);
  const productLabel = display.selectedProductLabel;

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

  function handleConfirm() {
    if (mode === 'dip-advance') {
      proceedToFullApplication();
    } else {
      submitFullApplication();
    }
    onClose();
  }

  const copy = MODE_COPY[mode];
  const cityHint = display.shortLabel.split('—')[1]?.trim() ?? '';

  return (
    <div className="submit-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="submit-modal"
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="submit-modal-head">
          <div className="submit-modal-titles">
            <div className="submit-modal-eyebrow">{copy.eyebrow}</div>
            <div className="submit-modal-title">
              {display.clientName} · {cityHint}
            </div>
          </div>
          <button
            type="button"
            className="submit-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            {CLOSE_ICON}
          </button>
        </header>

        <div className="submit-modal-body">
          <p className="submit-modal-line">{copy.body(display.clientName, cityHint)}</p>
          <ul className="submit-modal-summary">
            <li>
              <span>Selected product</span>
              <strong>{productLabel}</strong>
            </li>
            <li>
              <span>Loan</span>
              <strong>£{display.loanAmount.toLocaleString('en-GB')}</strong>
            </li>
            <li>
              <span>LTV</span>
              <strong>{display.ltv.toFixed(1)}%</strong>
            </li>
            <li>
              <span>Reference</span>
              <strong>{display.reference}</strong>
            </li>
          </ul>
          <p className="submit-modal-fineprint">{copy.fineprint}</p>
        </div>

        <footer className="submit-modal-foot">
          <button type="button" className="submit-modal-cancel" onClick={onClose}>
            {copy.cancel}
          </button>
          <button type="button" className="submit-modal-confirm" onClick={handleConfirm}>
            {copy.confirm}
          </button>
        </footer>
      </div>
    </div>
  );
}

const MODE_COPY: Record<PrimaryActionMode, {
  eyebrow: string;
  title: string;
  body: (clientName: string, hint: string) => string;
  fineprint: string;
  confirm: string;
  cancel: string;
}> = {
  'dip-advance': {
    eyebrow: 'Proceed to full application',
    title: 'Proceed to full application?',
    body: (clientName, hint) =>
      `Advance ${clientName}${hint ? ` · ${hint}` : ''} from DIP to the full-application stage?`,
    fineprint:
      'The selected DIP product locks against the current case inputs. The broker continues onto the KYC stage; further DIP runs require a return to the DIP phase.',
    confirm: 'Proceed',
    cancel: 'Stay on DIP',
  },
  'full-app-submit': {
    eyebrow: 'Submit application',
    title: 'Submit application?',
    body: (clientName, hint) =>
      `Submit ${clientName}${hint ? ` · ${hint}` : ''} to the underwriter?`,
    fineprint:
      'Once submitted, the underwriter takes ownership of progressing the case. The broker can still edit fields during underwriting; submission is the formal handover.',
    confirm: 'Submit',
    cancel: 'Review further',
  },
};
