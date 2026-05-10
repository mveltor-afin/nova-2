import { useEffect } from 'react';
import { useCaseDisplay } from '../../store/selectors';
import { useCaseStore } from '../../store/caseStore';
import { findProduct } from './catalogue';
import type { DIPResult } from './dipResults';

/**
 * Full-screen DIP certificate preview modal. Three variants — body
 * content branches by `result.status`. Decline and referral reasons
 * surface in the certificate.
 */
export interface DIPCertModalProps {
  result: DIPResult;
  onClose: () => void;
}

export default function DIPCertModal({ result, onClose }: DIPCertModalProps) {
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
    <div className="dip-cert-modal__overlay" onClick={onClose} role="presentation">
      <div
        className="dip-cert-modal"
        role="dialog"
        aria-modal="true"
        aria-label="DIP certificate"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dip-cert-modal__head">
          <div className="dip-cert-modal__brand">Afin Bank</div>
          <button
            type="button"
            className="dip-cert-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="dip-cert-modal__document">
          <div className="dip-cert-modal__doc-eyebrow">
            Decision in Principle Certificate
          </div>
          <h2 className="dip-cert-modal__doc-title">
            {product?.name ?? result.productId}
          </h2>
          <div className="dip-cert-modal__doc-ref">{reference}</div>

          <section className="dip-cert-modal__doc-section">
            <div className={`dip-cert-modal__verdict v-${result.status}`}>
              <span className="dip-cert-modal__verdict-dot" aria-hidden="true" />
              {verdictLabel(result.status)}
              <span className="dip-cert-modal__verdict-date">
                {new Date(result.decidedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </section>

          <section className="dip-cert-modal__doc-section">
            <h3>Applicants</h3>
            <p>{display.clientName}</p>
          </section>

          <section className="dip-cert-modal__doc-section">
            <h3>Application</h3>
            <dl className="dip-cert-modal__doc-grid">
              <div>
                <dt>Loan amount</dt>
                <dd>£{certLoanAmount(result).toLocaleString('en-GB')}</dd>
              </div>
              <div>
                <dt>LTV at DIP</dt>
                <dd>{certEffectiveLtv(result).toFixed(1)}%</dd>
              </div>
              <div>
                <dt>Term</dt>
                <dd>{result.inputsSnapshot.termYears} years</dd>
              </div>
              <div>
                <dt>Repayment</dt>
                <dd>{product?.interestType ?? 'Capital & Interest'}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>{reference}</dd>
              </div>
            </dl>
          </section>

          {result.status === 'approved' && result.pricing && (
            <section className="dip-cert-modal__doc-section">
              <h3>Indicative terms</h3>
              <dl className="dip-cert-modal__doc-grid">
                <div>
                  <dt>Initial rate</dt>
                  <dd>{result.pricing.initialRatePct.toFixed(2)}%</dd>
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
                  <dt>ERCs</dt>
                  <dd>{result.pricing.ercSummary}</dd>
                </div>
              </dl>
            </section>
          )}

          {result.status === 'declined' && result.declineReason && (
            <section className="dip-cert-modal__doc-section">
              <h3>Decline reason</h3>
              <p className="dip-cert-modal__doc-reason">
                {result.declineReason}
              </p>
            </section>
          )}

          {result.status === 'referred' && result.referralReason && (
            <section className="dip-cert-modal__doc-section">
              <h3>Referral reason</h3>
              <p className="dip-cert-modal__doc-reason">
                {result.referralReason}
              </p>
            </section>
          )}

          <footer className="dip-cert-modal__doc-foot">
            This DIP is indicative and valid for 30 days from the date above.
            It does not constitute a binding mortgage offer. Subject to
            satisfactory full underwriting, valuation, and completion of
            outstanding documentation.
          </footer>
        </div>
      </div>
    </div>
  );
}

function verdictLabel(status: DIPResult['status']): string {
  if (status === 'approved') return 'DIP approved';
  if (status === 'declined') return 'DIP declined';
  return 'DIP referred to underwriter';
}

// Step 14b: snapshot stores property + deposit; the cert derives loan
// + effective LTV at render time so the certificate reflects exactly
// what the DIP engine was given.
function certLoanAmount(result: DIPResult): number {
  const s = result.inputsSnapshot;
  return Math.max(0, s.propertyValue - s.depositAmount);
}

function certEffectiveLtv(result: DIPResult): number {
  const s = result.inputsSnapshot;
  if (s.propertyValue <= 0) return 0;
  const loan = certLoanAmount(result);
  const brokerSlice = s.brokerFeeHandling === 'capitalise' ? s.brokerFee : 0;
  return ((loan + brokerSlice) / s.propertyValue) * 100;
}
