import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Chip } from '../../components/atoms';
import { useCaseStore } from '../../store/caseStore';
import {
  effectiveSelectedCode,
  productIdFromCode,
} from './dipResults';
import { findProduct } from './catalogue';
import ESISModal from './ESISModal';
import DIPCertModal from './DIPCertModal';
import type { DIPResult } from './dipResults';

/**
 * Step 23 — read-only chosen-product summary. Replaces the full
 * Products tab UI once the broker has submitted (full-app stage
 * advances past `submission`). The selected DIP is the immutable
 * record of what the lender received.
 */
export default function ProductSummary() {
  const { result, code, productLabel, submittedAt } = useCaseStore(
    useShallow((s) => {
      const c = s.case;
      const code = effectiveSelectedCode(c) ?? c.arrangement.selectedProductCode;
      const productId = code ? productIdFromCode(code) : undefined;
      const result =
        productId
          ? c.dipResults.find((r) => r.productId === productId && r.status === 'approved')
          : undefined;
      return {
        result,
        code,
        productLabel: code,
        submittedAt: result?.decidedAt,
      };
    }),
  );
  const [esisOpen, setEsisOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  if (!result) {
    return (
      <div className="product-summary product-summary--missing">
        Submitted product details unavailable.
      </div>
    );
  }

  const product = findProduct(result.productId);
  if (!product) {
    return (
      <div className="product-summary product-summary--missing">
        Submitted product details unavailable.
      </div>
    );
  }

  const inputs = result.inputsSnapshot;
  const loanAmount = Math.max(0, inputs.propertyValue - inputs.depositAmount);
  void productLabel;
  void code;
  const submittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="product-summary">
      <header className="product-summary__head">
        <span className="product-summary__eyebrow">Submitted product</span>
        <Chip tone="green">Approved · Submitted {submittedDate}</Chip>
      </header>

      <h2 className="product-summary__title">{product.name}</h2>
      <div className="product-summary__subtitle">
        Owner Occupier · {product.interestType}
      </div>

      <dl className="product-summary__pricing">
        <div>
          <dt>Initial rate</dt>
          <dd>{result.pricing?.initialRatePct.toFixed(2) ?? '—'}%</dd>
        </div>
        <div>
          <dt>Reverts to</dt>
          <dd>{result.pricing?.revertRatePct.toFixed(2) ?? '—'}%</dd>
        </div>
        <div>
          <dt>Monthly</dt>
          <dd>£{result.pricing?.monthlyPayment.toLocaleString('en-GB') ?? '—'}</dd>
        </div>
        <div>
          <dt>Arrangement fee</dt>
          <dd>£{result.pricing?.arrangementFee.toLocaleString('en-GB') ?? '—'}</dd>
        </div>
        <div>
          <dt>Total cost</dt>
          <dd>
            £{result.pricing?.totalCostOverDeal.toLocaleString('en-GB') ?? '—'}
          </dd>
        </div>
        <div>
          <dt>ERC</dt>
          <dd>{result.pricing?.ercSummary ?? '—'}</dd>
        </div>
      </dl>

      <div className="product-summary__divider" />

      <h3 className="product-summary__section-title">Submitted inputs</h3>
      <dl className="product-summary__inputs">
        <div>
          <dt>Property value</dt>
          <dd>£{inputs.propertyValue.toLocaleString('en-GB')}</dd>
        </div>
        <div>
          <dt>Deposit</dt>
          <dd>£{inputs.depositAmount.toLocaleString('en-GB')}</dd>
        </div>
        <div>
          <dt>Loan amount</dt>
          <dd>£{loanAmount.toLocaleString('en-GB')}</dd>
        </div>
        <div>
          <dt>Term</dt>
          <dd>{inputs.termYears} years</dd>
        </div>
        <div>
          <dt>Broker fee</dt>
          <dd>
            {inputs.brokerFee > 0
              ? `£${inputs.brokerFee.toLocaleString('en-GB')} · ${
                  inputs.brokerFeeHandling === 'capitalise'
                    ? 'Add to loan'
                    : 'Pay upfront'
                }`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Product fee</dt>
          <dd>
            {inputs.productFeeHandling === 'capitalise'
              ? 'Add to loan'
              : 'Pay upfront'}
          </dd>
        </div>
      </dl>

      <div className="product-summary__actions">
        <button
          type="button"
          className="dc-btn ghost"
          onClick={() => setEsisOpen(true)}
        >
          View ESIS
        </button>
        <button
          type="button"
          className="dc-btn ghost"
          onClick={() => setCertOpen(true)}
        >
          View DIP certificate
        </button>
      </div>

      <p className="product-summary__caption">
        Application submitted {submittedDate}. Product cannot be changed at
        this stage.
      </p>

      {esisOpen && (
        <ESISModal
          result={result as DIPResult}
          onClose={() => setEsisOpen(false)}
        />
      )}
      {certOpen && (
        <DIPCertModal
          result={result as DIPResult}
          onClose={() => setCertOpen(false)}
        />
      )}
    </div>
  );
}
