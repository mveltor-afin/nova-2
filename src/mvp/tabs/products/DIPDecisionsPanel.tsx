import { useShallow } from 'zustand/react/shallow';
import { useCaseStore } from '../../store/caseStore';
import {
  type DIPResult,
  type DIPInputs,
  isStale,
  sortDecisions,
} from './dipResults';
import DIPDecisionCard from './DIPDecisionCard';

/**
 * "DIP Decisions" panel — accumulates one card per completed DIP run.
 * Sits above the Product table on the Products tab.
 *
 * Hidden entirely when there are no DIP results. No empty state, no
 * collapsed-state header — absent.
 */
export interface DIPDecisionsPanelProps {
  onOpenESIS: (result: DIPResult) => void;
  onOpenDIPCert: (result: DIPResult) => void;
}

export default function DIPDecisionsPanel({
  onOpenESIS,
  onOpenDIPCert,
}: DIPDecisionsPanelProps) {
  // Flatten primitives at the top level — anything that returns a
  // fresh object inside useShallow loops under Zustand v5 (Gotchas §1).
  // The 6 staleness inputs all live on `case.arrangement` (LTV is
  // derived but pure-from-primitives).
  const {
    results,
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
        results: s.case.dipResults,
        propertyValue: s.case.collaterals[0]?.estimatedValue ?? 0,
        depositAmount: arr.depositAmount,
        termYears: arr.loanTermYears,
        brokerFee: arr.brokerFee,
        productFeeHandling: arr.productFeeHandling,
        brokerFeeHandling: arr.brokerFeeHandling,
      };
    }),
  );

  if (results.length === 0) return null;

  const inputs: DIPInputs = {
    propertyValue,
    depositAmount,
    termYears,
    brokerFee,
    productFeeHandling,
    brokerFeeHandling,
  };

  const sorted = sortDecisions(results, inputs);
  const counts = countByStatus(sorted, inputs);

  return (
    <section className="dip-decisions-panel" aria-label="DIP Decisions">
      <header className="dip-decisions-panel__header">
        <h3 className="dip-decisions-panel__title">DIP Decisions</h3>
        <div className="dip-decisions-panel__count">
          <strong>{sorted.length}</strong>{' '}
          {sorted.length === 1 ? 'decision' : 'decisions'}
          {counts.approved > 0 && <> · {counts.approved} approved</>}
          {counts.declined > 0 && <> · {counts.declined} declined</>}
          {counts.referred > 0 && <> · {counts.referred} referred</>}
        </div>
      </header>

      <div className="dip-decisions-strip">
        {sorted.map((r) => (
          <DIPDecisionCard
            key={r.id}
            result={r}
            inputs={inputs}
            onOpenESIS={onOpenESIS}
            onOpenDIPCert={onOpenDIPCert}
          />
        ))}
      </div>
    </section>
  );
}

function countByStatus(results: DIPResult[], inputs: DIPInputs) {
  let approved = 0;
  let declined = 0;
  let referred = 0;
  for (const r of results) {
    if (r.status === 'approved' && !isStale(r, inputs)) approved++;
    else if (r.status === 'declined') declined++;
    else if (r.status === 'referred') referred++;
    else if (r.status === 'approved') approved++; // approved-stale still counts in the chip total
  }
  return { approved, declined, referred };
}
