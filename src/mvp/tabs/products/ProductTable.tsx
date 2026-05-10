import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../store/caseStore';
import { PRODUCTS, type ProductRow } from './catalogue';
import { isStale, type DIPInputs, type DIPResult } from './dipResults';

/**
 * Comparison table — Standalone v3 chapter 5. Step 13 narrows its
 * job to **exploration**: configure inputs, hit Run DIP, see a
 * status pip. Once a result exists for a row, the row's action cell
 * collapses to a status pip + label and the Run DIP button is
 * hidden — re-runs flow through the DIP Decisions panel only.
 */
export default function ProductTable() {
  // Flatten primitives at the top level so useShallow's per-key
  // comparison sees primitives. Step 14 widened the staleness inputs
  // from 3 → 6, so the row also needs broker fee + handling fields.
  const {
    selectedCode,
    dipResults,
    runningSet,
    propertyValue,
    depositAmount,
    termYears,
    brokerFee,
    productFeeHandling,
    brokerFeeHandling,
  } = useCaseStore(
    useShallow((s) => {
      const arr = s.case.arrangement;
      return {
        selectedCode: arr.selectedProductCode,
        dipResults: s.case.dipResults,
        runningSet: s.runningDIPs,
        propertyValue: s.case.collaterals[0]?.estimatedValue ?? 0,
        depositAmount: arr.depositAmount,
        termYears: arr.loanTermYears,
        brokerFee: arr.brokerFee,
        productFeeHandling: arr.productFeeHandling,
        brokerFeeHandling: arr.brokerFeeHandling,
      };
    }),
  );
  const runDIP = useCaseStore((s) => s.runDIP);
  const inputs: DIPInputs = {
    propertyValue,
    depositAmount,
    termYears,
    brokerFee,
    productFeeHandling,
    brokerFeeHandling,
  };

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>DIP status</th>
          <th>Rate</th>
          <th>Interest</th>
          <th>Monthly</th>
          <th>ERCs</th>
          <th>Fees</th>
          <th>Max loan</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {PRODUCTS.map((p) => {
          const result = dipResults.find((r) => r.productId === p.id);
          const stale = result ? isStale(result, inputs) : false;
          const isFresh = !!result && result.status === 'approved' && !stale;
          // Effective selection — staleness clears the visible state
          // even though the stored code stays set, so the broker can
          // revert and have their selection restore.
          const isSelected = isFresh && selectedCode === p.code;
          const isIneligible = p.eligibility === 'ineligible';
          const isRunning = runningSet.has(p.id);

          const showResult = !!result && !stale;

          return (
            <tr
              key={p.id}
              className={[
                isSelected ? 'selected' : '',
                isIneligible ? 'ineligible' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <td className="td-product">
                <div className="td-product-name">{p.name}</div>
                {isSelected && (
                  <span className="selected-badge">
                    <CheckIcon /> Selected for full app
                  </span>
                )}
                {isIneligible && p.ineligibleChip && (
                  <span className="ineligible-chip" title={p.ineligibleChip}>
                    Ineligible
                  </span>
                )}
              </td>

              <td className="td-dip">
                <DipStatusCell
                  result={showResult ? result : undefined}
                  isRunning={isRunning}
                />
              </td>

              <td className="td-rate">{p.rate}</td>
              <td className="td-interest">
                <span className={`interest-chip interest-${interestSlug(p.interestType)}`}>
                  {compactInterest(p.interestType)}
                </span>
              </td>
              <td>{p.monthly}</td>
              <td>{p.ercs}</td>
              <td>{p.fees}</td>
              <td>{p.maxLoan}</td>

              <td className="td-actions">
                <RowActions
                  p={p}
                  result={result}
                  stale={stale}
                  isRunning={isRunning}
                  isIneligible={isIneligible}
                  onRunDip={() => runDIP(p.id)}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DipStatusCell({
  result,
  isRunning,
}: {
  result: DIPResult | undefined;
  isRunning: boolean;
}) {
  if (isRunning) {
    return (
      <span className="dip-pip running">
        <span className="dot pulse" aria-hidden="true" />
        <span>Running…</span>
      </span>
    );
  }
  if (!result) {
    return (
      <span className="dip-pip not-run">
        <span>Not yet run</span>
      </span>
    );
  }
  if (result.status === 'approved') {
    return (
      <span className="dip-pip approved">
        <span className="dot green" aria-hidden="true" />
        <span>DIP approved</span>
      </span>
    );
  }
  if (result.status === 'declined') {
    return (
      <span className="dip-pip declined">
        <span className="dot coral" aria-hidden="true" />
        <span>DIP declined</span>
      </span>
    );
  }
  return (
    <span className="dip-pip referred">
      <span className="dot amber" aria-hidden="true" />
      <span>DIP referred</span>
    </span>
  );
}

function RowActions({
  p,
  result,
  stale,
  isRunning,
  isIneligible,
  onRunDip,
}: {
  p: ProductRow;
  result: DIPResult | undefined;
  stale: boolean;
  isRunning: boolean;
  isIneligible: boolean;
  onRunDip: () => void;
}) {
  if (isIneligible) {
    return (
      <span className="action-text muted">{p.ineligibleReason ?? '—'}</span>
    );
  }
  if (isRunning) {
    return <span className="action-text">Awaiting decision…</span>;
  }
  // Fresh result on the row → action cell becomes pip-only via DipStatusCell;
  // here we render an empty cell so the table layout stays clean.
  if (result && !stale) {
    return <span className="action-text muted">—</span>;
  }
  return (
    <button type="button" className="row-btn primary" onClick={onRunDip}>
      Run DIP
    </button>
  );
}

function CheckIcon() {
  return (
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
}

function compactInterest(t: 'Capital & Interest' | 'Interest Only'): string {
  return t === 'Capital & Interest' ? 'C&I' : 'Interest only';
}

function interestSlug(t: 'Capital & Interest' | 'Interest Only'): string {
  return t === 'Capital & Interest' ? 'ci' : 'io';
}
