import { useEffect } from 'react';
import { useCaseDisplay } from '../../store/selectors';
import { useCaseStore } from '../../store/caseStore';
import { findProduct } from './catalogue';
import type { DIPResult } from './dipResults';

/**
 * Full-screen ESIS preview modal. Pulls applicant + arrangement
 * context from the store and the product / pricing from the supplied
 * `DIPResult`. Mock body — enough to look like an ESIS at glance.
 */
export interface ESISModalProps {
  result: DIPResult;
  onClose: () => void;
}

export default function ESISModal({ result, onClose }: ESISModalProps) {
  const display = useCaseDisplay();
  const reference = useCaseStore((s) => s.case.reference);
  const product = findProduct(result.productId);

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
    <div className="esis-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="esis-modal"
        role="dialog"
        aria-modal="true"
        aria-label="ESIS"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="esis-modal__head">
          <div className="esis-modal__brand">Afin Bank</div>
          <button
            type="button"
            className="esis-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="esis-modal__document">
          <div className="esis-modal__doc-eyebrow">European Standardised Information Sheet</div>
          <h2 className="esis-modal__doc-title">
            {product?.name ?? result.productId}
          </h2>
          <div className="esis-modal__doc-ref">{reference}</div>

          <section className="esis-modal__doc-section">
            <h3>Applicants</h3>
            <p>{display.clientName}</p>
            <p className="esis-modal__doc-muted">
              Issued {new Date(result.decidedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })} · Indicative · Subject to full underwriting.
            </p>
          </section>

          <section className="esis-modal__doc-section">
            <h3>The mortgage</h3>
            <dl className="esis-modal__doc-grid">
              <div>
                <dt>Loan amount</dt>
                <dd>£{display.loanAmount.toLocaleString('en-GB')}</dd>
              </div>
              <div>
                <dt>LTV</dt>
                <dd>{display.ltv.toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Term</dt>
                <dd>
                  {result.inputsSnapshot.termYears} years
                </dd>
              </div>
              <div>
                <dt>Repayment</dt>
                <dd>{product?.interestType ?? 'Capital & Interest'}</dd>
              </div>
            </dl>
          </section>

          {result.pricing && (
            <section className="esis-modal__doc-section">
              <h3>Pricing &amp; cost</h3>
              <dl className="esis-modal__doc-grid">
                <div>
                  <dt>Initial rate</dt>
                  <dd>{result.pricing.initialRatePct.toFixed(2)}%</dd>
                </div>
                <div>
                  <dt>Reverts to</dt>
                  <dd>{result.pricing.revertRatePct.toFixed(2)}% (SVR)</dd>
                </div>
                <div>
                  <dt>Monthly payment</dt>
                  <dd>
                    £{result.pricing.monthlyPayment.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div>
                  <dt>Arrangement fee</dt>
                  <dd>
                    £{result.pricing.arrangementFee.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div>
                  <dt>Total over deal period</dt>
                  <dd>
                    £{result.pricing.totalCostOverDeal.toLocaleString('en-GB')}
                  </dd>
                </div>
                <div>
                  <dt>Early repayment charges</dt>
                  <dd>{result.pricing.ercSummary}</dd>
                </div>
              </dl>
            </section>
          )}

          <section className="esis-modal__doc-section">
            <h3>What you should know</h3>
            <ul className="esis-modal__doc-list">
              <li>This is an indicative offer based on the broker's inputs at DIP time.</li>
              <li>Final terms are confirmed in the binding mortgage offer post-underwriting.</li>
              <li>The reversion rate is subject to change in line with Afin's SVR policy.</li>
              <li>Early repayment charges apply during the fixed-rate period as listed above.</li>
            </ul>
          </section>

          <footer className="esis-modal__doc-foot">
            Afin Bank plc · Registered in England · Authorised by the PRA · Regulated by the FCA and PRA · ARR-ref {reference}
          </footer>
        </div>
      </div>
    </div>
  );
}
