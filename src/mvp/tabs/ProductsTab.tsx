import { useState } from 'react';
import { NudgeCard } from '../components/atoms';
import ConfigurationStrip from '../components/ConfigurationStrip';
import ProductTable from './products/ProductTable';
import DIPDecisionsPanel from './products/DIPDecisionsPanel';
import ESISModal from './products/ESISModal';
import DIPCertModal from './products/DIPCertModal';
import ProductSummary from './products/ProductSummary';
import { useCaseStore } from '../store/caseStore';
import { selectIsCaseLocked } from '../store/selectors';
import type { DIPResult } from './products/dipResults';

/**
 * Products tab — Standalone v3 chapter 5 + Step 13's DIP Decisions
 * panel sitting above the table. The panel handles the deliberative
 * "which wins?" surface; the table stays exploratory ("what fits?").
 *
 * ESIS and DIP certificate previews are full-screen modals managed
 * locally — they're not added to the global `DrawerState` because
 * (a) only the Products tab opens them and (b) they layer over the
 * tab without affecting other surfaces.
 */
export default function ProductsTab() {
  const [esisFor, setEsisFor] = useState<DIPResult | null>(null);
  const [certFor, setCertFor] = useState<DIPResult | null>(null);
  const caseState = useCaseStore((s) => s.case);
  const lockState = selectIsCaseLocked(caseState);

  if (lockState.products) {
    return (
      <div className="products-page">
        <ProductSummary />
      </div>
    );
  }

  return (
    <div className="products-page">
      <NudgeCard
        eyebrow="ELIGIBILITY"
        title="Try running Premier — likely eligible"
        body="Daniel's Solicitor occupation puts this case on track for Premier Professional rates."
        actionLabel="Run Premier DIP"
        onAction={() => {
          // Step 9 keeps the action declarative; real flow is "click
          // Run DIP on the Premier row".
        }}
      />

      <ConfigurationStrip />

      <DIPDecisionsPanel
        onOpenESIS={(r) => setEsisFor(r)}
        onOpenDIPCert={(r) => setCertFor(r)}
      />

      <ProductTable />

      {esisFor && (
        <ESISModal result={esisFor} onClose={() => setEsisFor(null)} />
      )}
      {certFor && (
        <DIPCertModal result={certFor} onClose={() => setCertFor(null)} />
      )}
    </div>
  );
}
