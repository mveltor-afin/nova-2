import { useCaseStore } from '../../store/caseStore';
import {
  type DIPResult,
  type DIPInputs,
  isStale,
} from './dipResults';
import { findProduct } from './catalogue';

/**
 * Single decision card. Variants:
 *   approved-fresh  → pricing block + Use / View ESIS / View DIP cert
 *   approved-stale  → pricing greyed + Re-run / Revert + amber warning bar
 *   declined        → reason + View DIP cert
 *   referred        → reason + View DIP cert
 *
 * Selection state mirrors the table: the card with `code === selectedCode`
 * gets the green outline + Selected pip. Selection only permitted on
 * approved-fresh cards (gating lives in `setSelectedProduct`).
 */
export interface DIPDecisionCardProps {
  result: DIPResult;
  inputs: DIPInputs;
  onOpenESIS: (result: DIPResult) => void;
  onOpenDIPCert: (result: DIPResult) => void;
}

export default function DIPDecisionCard({
  result,
  inputs,
  onOpenESIS,
  onOpenDIPCert,
}: DIPDecisionCardProps) {
  const selectedCode = useCaseStore(
    (s) => s.case.arrangement.selectedProductCode,
  );
  const setSelectedProduct = useCaseStore((s) => s.setSelectedProduct);
  const runDIP = useCaseStore((s) => s.runDIP);
  const revertCaseInputsToDIP = useCaseStore((s) => s.revertCaseInputsToDIP);

  const product = findProduct(result.productId);
  const stale = isStale(result, inputs);
  const isApproved = result.status === 'approved';
  const isFresh = isApproved && !stale;
  // Effective selection — only show the green outline + Selected pip
  // when the stored code matches AND the result is fresh-approved.
  // The stored code stays put through stale; staleness clears the
  // visible selection automatically.
  const isSelected = !!product && isFresh && selectedCode === product.code;

  const variantClass = `dip-decision-card is-${result.status}${
    stale ? ' is-stale' : ''
  }${isSelected ? ' is-selected' : ''}`;

  const decidedDate = new Date(result.decidedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  function handleSelect() {
    if (!product) return;
    setSelectedProduct({
      code: product.code,
      rateType: product.rateType,
      initialRate: product.initialRate,
      productFee: product.productFee,
    });
  }

  return (
    <article className={variantClass}>
      <header className="dip-decision-card__head">
        <div className="dip-decision-card__name">
          {product?.name ?? result.productId}
        </div>
        <div className="dip-decision-card__chips">
          <span className={`dip-decision-card__status status-${result.status}`}>
            <span className="dip-decision-card__status-dot" aria-hidden="true" />
            {statusLabel(result.status)}
            {result.status === 'approved' && ` · ${decidedDate}`}
          </span>
          {product && (
            <span
              className={`interest-chip interest-${
                product.interestType === 'Capital & Interest' ? 'ci' : 'io'
              }`}
              title={product.interestType}
            >
              {product.interestType === 'Capital & Interest'
                ? 'C&I'
                : 'Interest only'}
            </span>
          )}
          {isSelected && (
            <span className="dip-decision-card__selected">Selected</span>
          )}
        </div>
      </header>

      {stale && (
        <div className="dip-decision-card__warning">
          <span className="dip-decision-card__warning-icon" aria-hidden="true">
            ⚠
          </span>
          Inputs changed — re-run to confirm.
        </div>
      )}

      {isApproved && result.pricing && (
        <dl className="dip-decision-card__pricing">
          <div>
            <dt>Initial rate</dt>
            <dd>{result.pricing.initialRatePct.toFixed(2)}%</dd>
          </div>
          <div>
            <dt>Reverts to</dt>
            <dd>{result.pricing.revertRatePct.toFixed(2)}%</dd>
          </div>
          <div>
            <dt>Monthly</dt>
            <dd>£{result.pricing.monthlyPayment.toLocaleString('en-GB')}</dd>
          </div>
          <div>
            <dt>Arrangement fee</dt>
            <dd>£{result.pricing.arrangementFee.toLocaleString('en-GB')}</dd>
          </div>
          <div>
            <dt>Total over deal</dt>
            <dd>£{result.pricing.totalCostOverDeal.toLocaleString('en-GB')}</dd>
          </div>
          <div>
            <dt>ERCs</dt>
            <dd>{result.pricing.ercSummary}</dd>
          </div>
        </dl>
      )}

      {result.status === 'declined' && result.declineReason && (
        <p className="dip-decision-card__reason">{result.declineReason}</p>
      )}

      {result.status === 'referred' && result.referralReason && (
        <p className="dip-decision-card__reason">{result.referralReason}</p>
      )}

      <div className="dip-decision-card__actions">
        {isFresh && !isSelected && (
          <button
            type="button"
            className="dip-card-btn primary"
            onClick={handleSelect}
          >
            Use for full application
          </button>
        )}
        {isFresh && isSelected && (
          <span className="dip-card-btn primary disabled" aria-disabled="true">
            In use for full app
          </span>
        )}
        {isApproved && stale && (
          <>
            <button
              type="button"
              className="dip-card-btn primary"
              onClick={() => runDIP(result.productId)}
            >
              Re-run with current inputs
            </button>
            <button
              type="button"
              className="dip-card-btn ghost"
              onClick={() => revertCaseInputsToDIP(result.id)}
            >
              Revert case inputs to use this
            </button>
          </>
        )}
        {isApproved && (
          <>
            <button
              type="button"
              className="dip-card-btn ghost"
              onClick={() => onOpenESIS(result)}
            >
              View ESIS
            </button>
            <button
              type="button"
              className="dip-card-btn ghost"
              onClick={() => onOpenDIPCert(result)}
            >
              View DIP certificate
            </button>
          </>
        )}
        {!isApproved && (
          <button
            type="button"
            className="dip-card-btn ghost"
            onClick={() => onOpenDIPCert(result)}
          >
            View DIP certificate
          </button>
        )}
      </div>
    </article>
  );
}

function statusLabel(status: DIPResult['status']): string {
  if (status === 'approved') return 'Approved';
  if (status === 'declined') return 'Declined';
  return 'Referred';
}
