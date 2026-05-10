import { useEffect, useRef } from 'react';
import type { DocumentType } from '../../model/document';

/**
 * Reclassify dropdown that opens when the broker clicks a doc-row's
 * classification chip. Top-3 candidates are seeded from the existing
 * classification + a small heuristic; the 4th and 5th items are
 * "Pick another type" (full-list picker) and "Mark as misc".
 */

const CANDIDATE_LABELS: Record<DocumentType, string> = {
  Passport: 'Passport',
  DrivingLicence: 'Driving licence',
  BRP: 'Biometric residence permit',
  ProofOfAddress: 'Proof of address',
  CouncilTaxBill: 'Council tax bill',
  UtilityBill: 'Utility bill',
  Payslip: 'Payslip',
  P60: 'P60',
  EmploymentContract: 'Employment contract',
  SA302: 'SA302',
  TaxYearOverview: 'Tax year overview',
  AccountantReference: 'Accountant reference',
  CompanyAccounts: 'Company accounts',
  BankStatement: 'Bank statement',
  EPC: 'EPC',
  LandRegistryTitle: 'Land Registry title',
  ValuationReport: 'Valuation report',
  BuildingSurvey: 'Building survey',
  FactFind: 'Fact-find',
  IDD: 'IDD',
  GiftLetter: 'Gift letter',
  DepositSourceEvidence: 'Deposit source evidence',
  DIPCertificate: 'DIP certificate',
  ESIS: 'ESIS',
  MortgageOffer: 'Mortgage offer',
  AuditPack: 'Audit pack',
  Other: 'Other',
};

export interface ReclassifyMenuProps {
  /** Top-3 candidates seeded by caller. */
  candidates: DocumentType[];
  onPick: (type: DocumentType) => void;
  onPickOther: () => void;
  onClose: () => void;
}

export default function ReclassifyMenu({
  candidates,
  onPick,
  onPickOther,
  onClose,
}: ReclassifyMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="reclassify-menu" ref={ref} role="menu">
      <div className="reclassify-menu-title">Reclassify as</div>
      {candidates.map((c) => (
        <button
          key={c}
          type="button"
          role="menuitem"
          className="reclassify-item"
          onClick={() => onPick(c)}
        >
          {CANDIDATE_LABELS[c]}
        </button>
      ))}
      <hr className="reclassify-sep" />
      <button
        type="button"
        role="menuitem"
        className="reclassify-item"
        onClick={onPickOther}
      >
        Pick another type…
      </button>
      <button
        type="button"
        role="menuitem"
        className="reclassify-item"
        onClick={() => onPick('Other')}
      >
        Mark as misc
      </button>
      <div className="reclassify-warn">
        Existing extractions for this doc will be invalidated and re-run.
      </div>
    </div>
  );
}
