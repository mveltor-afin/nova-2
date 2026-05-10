import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../store/caseStore';
import { PRODUCTS } from '../products/catalogue';

/**
 * Step 18 — inline product picker for the Quick Input Loan group.
 * At DIP phase the picker writes through directly; at full-app it
 * delegates to the existing freshness-gated `pickProduct` mutator
 * (so a stale or non-approved product can't be picked silently).
 */
export default function ProductPicker() {
  const { selectedCode, phase } = useCaseStore(
    useShallow((s) => ({
      selectedCode: s.case.arrangement.selectedProductCode,
      phase: s.case.phase,
    })),
  );
  const pickProduct = useCaseStore((s) => s.pickProduct);

  const [open, setOpen] = useState(false);
  const current = PRODUCTS.find((p) => p.code === selectedCode);

  return (
    <div className="qi-product-picker">
      <label className="qi-field-label" htmlFor="qi-product-picker-button">
        Product
      </label>
      <button
        id="qi-product-picker-button"
        type="button"
        className={`qi-product-picker__current ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="qi-product-picker__current-label">
          {current ? current.name : 'No product selected'}
        </span>
        {current && (
          <span className="qi-product-picker__current-meta">
            {current.rate} · {current.rateType} · Fee {current.fees}
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`qi-product-picker__chev ${open ? 'rotated' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="qi-product-picker__menu" role="listbox">
          {PRODUCTS.map((p) => {
            const ineligible = p.eligibility === 'ineligible';
            const isCurrent = p.code === selectedCode;
            const disabled = ineligible || (phase !== 'dip' && !isCurrent);
            return (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={isCurrent}
                disabled={disabled}
                className={`qi-product-picker__option ${
                  isCurrent ? 'is-current' : ''
                } ${ineligible ? 'is-ineligible' : ''}`}
                onClick={() => {
                  if (!disabled) {
                    pickProduct(p.code);
                    setOpen(false);
                  }
                }}
              >
                <span className="qi-product-picker__option-row1">
                  <span className="qi-product-picker__option-name">
                    {p.name}
                  </span>
                  <span className="qi-product-picker__option-rate">
                    {p.rate}
                  </span>
                </span>
                <span className="qi-product-picker__option-row2">
                  <span>{p.rateType}</span>
                  <span>·</span>
                  <span>Fee {p.fees}</span>
                  <span>·</span>
                  <span>{p.interestType}</span>
                  {ineligible && (
                    <span className="qi-product-picker__option-flag">
                      Ineligible
                    </span>
                  )}
                  {!ineligible && phase !== 'dip' && !isCurrent && (
                    <span className="qi-product-picker__option-flag">
                      Run a DIP to switch
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
