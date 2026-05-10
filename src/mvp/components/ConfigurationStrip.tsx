import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../store/caseStore';
import Provenance, { type ProvenanceProps } from './atoms/Provenance';
import type { Provenance as ProvenanceRecord } from '../model/provenance';

/**
 * Shared Configuration Strip — mounts on Quick Input (top of the
 * Loan & terms group) and on Products (above the DIP Decisions
 * panel). Single source of truth at `case.arrangement` and
 * `case.collaterals[0]` so edits in either place propagate.
 *
 * Step 14b reshape:
 *   Row 1 — Property value · Deposit · Loan amount (derived) · Term
 *   Row 2 — Broker fee · Product fee handling · Broker fee handling
 *   Right panel — Effective loan + Effective LTV (vertical stack,
 *                 larger numerals, vertical divider on the left).
 *
 * Loan amount is no longer a writable field — it falls out of
 * `propertyValue - depositAmount`. Brokers think property + deposit;
 * loan amount is the consequence.
 */
export default function ConfigurationStrip() {
  const {
    propertyValue,
    depositAmount,
    termYears,
    brokerFee,
    productFeeHandling,
    brokerFeeHandling,
    collateralId,
    arrangementId,
    provProperty,
    provDeposit,
    provTerm,
    provBrokerFee,
    provProductHandling,
    provBrokerHandling,
  } = useCaseStore(
    useShallow((s) => {
      const arr = s.case.arrangement;
      const arrId = arr.uuid;
      const col = s.case.collaterals[0];
      const colId = col?.uuid ?? '';
      return {
        propertyValue: col?.estimatedValue ?? 0,
        depositAmount: arr.depositAmount,
        termYears: arr.loanTermYears,
        brokerFee: arr.brokerFee,
        productFeeHandling: arr.productFeeHandling,
        brokerFeeHandling: arr.brokerFeeHandling,
        collateralId: colId,
        arrangementId: arrId,
        provProperty:
          s.case.provenanceMap[`Collateral:${colId}:P16`],
        provDeposit:
          s.case.provenanceMap[`Arrangement:${arrId}:D1`],
        provTerm: s.case.provenanceMap[`Arrangement:${arrId}:M7`],
        provBrokerFee:
          s.case.provenanceMap[`Arrangement:${arrId}:M17`],
        provProductHandling:
          s.case.provenanceMap[`Arrangement:${arrId}:M18`],
        provBrokerHandling:
          s.case.provenanceMap[`Arrangement:${arrId}:M19`],
      };
    }),
  );
  const setArrangementInput = useCaseStore((s) => s.setArrangementInput);
  const setPropertyValue = useCaseStore((s) => s.setPropertyValue);
  void arrangementId;

  // Derived chips — loan / effective loan / effective LTV. Inline math
  // mirrors `model/arrangementDerived.ts`.
  const loanAmount = Math.max(0, propertyValue - depositAmount);
  const brokerSlice = brokerFeeHandling === 'capitalise' ? brokerFee : 0;
  const effectiveLoan = loanAmount + brokerSlice;
  const effectiveLtv =
    propertyValue > 0 ? (effectiveLoan / propertyValue) * 100 : 0;

  const brokerHandlingDisabled = brokerFee === 0;

  return (
    <section className="config-strip" aria-label="Configuration strip">
      <div className="config-strip__controls">
        {/* Row 1 — financials */}
        <div className="config-strip__row">
          <NumberControl
            id="property-value"
            label="Property value"
            prefix="£"
            value={propertyValue}
            onChange={(v) => collateralId && setPropertyValue(collateralId, v)}
            provenance={provProperty}
          />
          <NumberControl
            id="deposit"
            label="Deposit"
            prefix="£"
            value={depositAmount}
            onChange={(v) => setArrangementInput('depositAmount', v)}
            provenance={provDeposit}
          />
          <DerivedDisplay
            label="Loan amount"
            value={`£${loanAmount.toLocaleString('en-GB')}`}
            caption="auto-calculated"
          />
          <NumberControl
            id="term"
            label="Term"
            suffix="yrs"
            value={termYears}
            onChange={(v) => setArrangementInput('termYears', v)}
            provenance={provTerm}
            min={1}
            max={40}
          />
        </div>

        {/* Row 2 — fees & strategy */}
        <div className="config-strip__row config-strip__row--strategy">
          <NumberControl
            id="broker-fee"
            label="Broker fee"
            prefix="£"
            value={brokerFee}
            onChange={(v) => setArrangementInput('brokerFee', v)}
            provenance={provBrokerFee}
          />
          <SegmentedControl
            label="Product fee handling"
            value={productFeeHandling}
            onChange={(v) => setArrangementInput('productFeeHandling', v)}
            provenance={provProductHandling}
          />
          <SegmentedControl
            label="Broker fee handling"
            value={brokerFeeHandling}
            onChange={(v) => setArrangementInput('brokerFeeHandling', v)}
            provenance={provBrokerHandling}
            disabled={brokerHandlingDisabled}
            disabledHint="Set a broker fee to choose how it's paid"
          />
        </div>
      </div>

      <aside className="config-strip__results" aria-label="Live results">
        <div className="config-strip__results-item">
          <span className="config-strip__results-label">Effective loan</span>
          <span className="config-strip__results-value">
            £{effectiveLoan.toLocaleString('en-GB')}
          </span>
        </div>
        <div className="config-strip__results-item">
          <span className="config-strip__results-label">Effective LTV</span>
          <span className="config-strip__results-value">
            {effectiveLtv.toFixed(1)}%
          </span>
        </div>
      </aside>
    </section>
  );
}

// ============================================================
// Strip primitives
// ============================================================

function NumberControl({
  id,
  label,
  prefix,
  suffix,
  value,
  onChange,
  provenance,
  min,
  max,
}: {
  id: string;
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  provenance: ProvenanceRecord | undefined;
  min?: number;
  max?: number;
}) {
  return (
    <div className="config-strip__group">
      <label htmlFor={id} className="config-strip__label">
        {label}
      </label>
      <div className="config-strip__input-wrap">
        {prefix && <span className="config-strip__prefix">{prefix}</span>}
        <input
          id={id}
          type="number"
          className="config-strip__input"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onChange(next);
          }}
        />
        {suffix && <span className="config-strip__suffix">{suffix}</span>}
      </div>
      <Provenance {...mapProvenance(provenance)} />
    </div>
  );
}

function DerivedDisplay({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="config-strip__group config-strip__group--derived">
      <span className="config-strip__label">{label}</span>
      <div className="config-strip__derived-input">{value}</div>
      {caption && <span className="config-strip__caption">{caption}</span>}
    </div>
  );
}

function SegmentedControl({
  label,
  value,
  onChange,
  provenance,
  disabled,
  disabledHint,
}: {
  label: string;
  value: 'capitalise' | 'upfront';
  onChange: (v: 'capitalise' | 'upfront') => void;
  provenance: ProvenanceRecord | undefined;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <div className="config-strip__group">
      <span className="config-strip__label">{label}</span>
      <div
        className={`config-strip__segmented ${disabled ? 'is-disabled' : ''}`}
        role="radiogroup"
        aria-label={label}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!disabled && value === 'capitalise'}
          className={`config-strip__seg ${
            !disabled && value === 'capitalise' ? 'active' : ''
          }`}
          disabled={disabled}
          onClick={() => onChange('capitalise')}
        >
          Add to loan
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!disabled && value === 'upfront'}
          className={`config-strip__seg ${
            !disabled && value === 'upfront' ? 'active' : ''
          }`}
          disabled={disabled}
          onClick={() => onChange('upfront')}
        >
          Pay upfront
        </button>
      </div>
      {disabled ? (
        <span className="config-strip__caption">{disabledHint}</span>
      ) : (
        <Provenance {...mapProvenance(provenance)} />
      )}
    </div>
  );
}

// ============================================================
// Provenance mapping — same shape used by RegFieldRow.
// ============================================================

function mapProvenance(p: ProvenanceRecord | undefined): ProvenanceProps {
  if (!p) {
    return { source: 'manual' };
  }
  if (p.source === 'Document') {
    return {
      source: {
        documentLabel: p.documentLabel ?? 'Document',
        pageNumber: p.pageNumber,
      },
      confidence: p.confidence !== undefined ? p.confidence / 100 : undefined,
      extractionMethod:
        p.method === 'AI text'
          ? 'AI text'
          : p.method === 'OCR'
            ? 'OCR-assisted'
            : p.method === 'AI image'
              ? 'AI text'
              : undefined,
    };
  }
  if (p.source === 'manual-override') {
    return {
      source: {
        documentLabel: p.documentLabel ?? 'Document',
        pageNumber: p.pageNumber,
      },
      confidence: p.confidence !== undefined ? p.confidence / 100 : undefined,
      extractionMethod:
        p.method === 'AI text'
          ? 'AI text'
          : p.method === 'OCR'
            ? 'OCR-assisted'
            : undefined,
      overridden: true,
    };
  }
  if (p.source === 'Manual') {
    return {
      source: 'manual',
      enteredBy: p.enteredBy,
      enteredAt: p.enteredAt,
    };
  }
  if (p.source === 'Locked') {
    return { source: 'dip-locked', lockedAt: p.lockedAt };
  }
  if (p.source === 'Derived') {
    return { source: 'manual', enteredBy: 'Computed' };
  }
  return { source: 'manual' };
}
