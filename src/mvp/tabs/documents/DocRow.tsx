import { useState } from 'react';
import { ConfidencePill, Chip } from '../../components/atoms';
import { useCaseStore } from '../../store/caseStore';
import { simulateAIPipeline } from './aiPipeline';
import ReclassifyMenu from './ReclassifyMenu';
import type { Document, DocumentType } from '../../model/document';

/**
 * One row in the Document tray. Three derived states:
 *   processing   spinner + "Reading…"      (extractionStatus === 'Running')
 *   done         green tick + classified meta + View
 *   attention    coral, "Unclassified" chip + Classify CTA
 *
 * Three click affordances:
 *   - row body          → opens DocViewerPanel for this doc
 *   - classification    → opens ReclassifyMenu
 *   - overflow ···      → reclassify / delete / view raw
 */
export interface DocRowProps {
  doc: Document;
  isSelected: boolean;
  onSelect: () => void;
  /** Optional density override — `compact` is used inside the rail. */
  density?: 'default' | 'compact';
}

type RowState = 'processing' | 'done' | 'attention';

function deriveState(doc: Document): RowState {
  if (doc.extractionStatus === 'Running') return 'processing';
  if (
    doc.extractionStatus === 'Pending' ||
    doc.extractionStatus === 'Skipped' ||
    doc.extractionStatus === 'Errored'
  ) return 'attention';
  if ((doc.classificationConfidence ?? 100) < 50) return 'attention';
  return 'done';
}

export default function DocRow({
  doc,
  isSelected,
  onSelect,
  density = 'default',
}: DocRowProps) {
  const updateDocument = useCaseStore((s) => s.updateDocument);
  const removeDocument = useCaseStore((s) => s.removeDocument);

  const [reclassifyOpen, setReclassifyOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);

  const state = deriveState(doc);

  function reclassifyTo(type: DocumentType) {
    updateDocument(doc.uuid, {
      type,
      classificationType: type,
      classificationConfidence: 96,
      classificationSource: 'Manual',
      extractionStatus: 'Pending',
      extractionStatusMessage: 'Re-classified — re-extracting…',
    });
    setReclassifyOpen(false);
    // Simulate re-extraction.
    simulateAIPipeline(doc.uuid);
  }

  return (
    <div
      className={`doc-row state-${state} ${isSelected ? 'selected' : ''} ${density}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className={`dc-ico ${state}`}>{ICONS[state]}</div>

      <div className="doc-row-content">
        <div className="doc-row-name">{doc.filename}</div>

        {state === 'processing' && (
          <span className="ocr-substate">
            <span className="ocr-spinner" aria-hidden="true" />
            <span>{doc.extractionStatusMessage ?? 'Reading…'}</span>
          </span>
        )}

        {state === 'done' && (
          <div className="doc-row-classification">
            <button
              type="button"
              className="doc-class-chip clickable"
              onClick={(e) => {
                e.stopPropagation();
                setReclassifyOpen((o) => !o);
              }}
            >
              {prettyType(doc.type)}
              {doc.classificationConfidence !== undefined && (
                <>
                  {' · '}
                  <span className="doc-class-conf">
                    {doc.classificationConfidence}%
                  </span>
                </>
              )}
            </button>
            {doc.classificationConfidence !== undefined && (
              <ConfidencePill confidence={doc.classificationConfidence / 100} />
            )}
            {reclassifyOpen && (
              <ReclassifyMenu
                candidates={topCandidates(doc.type)}
                onPick={reclassifyTo}
                onPickOther={() => {
                  // Full picker is a deeper modal — out of scope for this step.
                  setReclassifyOpen(false);
                }}
                onClose={() => setReclassifyOpen(false)}
              />
            )}
          </div>
        )}

        {state === 'attention' && (
          <div className="doc-row-classification">
            <Chip tone="coral">Unclassified</Chip>
          </div>
        )}

        <div className="doc-row-meta">{describeRouting(doc, state)}</div>
      </div>

      <div className="doc-row-actions" onClick={(e) => e.stopPropagation()}>
        {state === 'attention' && (
          <button
            type="button"
            className="dc-btn coral"
            onClick={() => setReclassifyOpen(true)}
          >
            Classify →
          </button>
        )}
        {state === 'done' && density === 'default' && (
          <button type="button" className="dc-btn ghost" onClick={onSelect}>
            View
          </button>
        )}
        <div className="doc-overflow-wrap">
          <button
            type="button"
            className="doc-overflow-btn"
            onClick={(e) => {
              e.stopPropagation();
              setOverflowOpen((o) => !o);
            }}
            aria-haspopup="menu"
            aria-expanded={overflowOpen}
            aria-label="Document actions"
          >
            ···
          </button>
          {overflowOpen && (
            <div
              className="doc-overflow-menu"
              role="menu"
              onMouseLeave={() => setOverflowOpen(false)}
            >
              <button
                type="button"
                role="menuitem"
                className="doc-overflow-item"
                onClick={() => {
                  setOverflowOpen(false);
                  setReclassifyOpen(true);
                }}
              >
                Reclassify…
              </button>
              <button
                type="button"
                role="menuitem"
                className="doc-overflow-item"
                onClick={() => {
                  setOverflowOpen(false);
                  onSelect();
                }}
              >
                View raw
              </button>
              <button
                type="button"
                role="menuitem"
                className="doc-overflow-item destructive"
                onClick={() => {
                  setOverflowOpen(false);
                  if (window.confirm(`Delete ${doc.filename}?`)) {
                    removeDocument(doc.uuid);
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function prettyType(type: DocumentType): string {
  if (type === 'FactFind') return 'Fact-find';
  if (type === 'BankStatement') return 'Bank statement';
  if (type === 'ValuationReport') return 'Valuation';
  return type.replace(/([A-Z])/g, ' $1').trim();
}

function describeRouting(doc: Document, state: RowState): string {
  if (state === 'attention') {
    return doc.extractionStatusMessage ?? 'Low image quality — needs manual classification';
  }
  switch (doc.type) {
    case 'Payslip':
      return '8 fields extracted · routed to Income';
    case 'FactFind':
      return '18 fields extracted · 2 conflicts';
    case 'BankStatement':
      return '18 fields extracted · 1 conflict pending';
    case 'Passport':
      return '3 fields extracted · routed to Identity';
    case 'ValuationReport':
      return '6 fields extracted · routed to Security';
    default:
      return doc.extractionStatusMessage ?? '';
  }
}

function topCandidates(current: DocumentType): DocumentType[] {
  // Static neighbours per category.
  if (current === 'Other') {
    return ['Payslip', 'BankStatement', 'Passport'];
  }
  if (current === 'Payslip') return ['P60', 'EmploymentContract', 'BankStatement'];
  if (current === 'BankStatement') return ['SA302', 'Payslip', 'Other'];
  if (current === 'Passport') return ['DrivingLicence', 'BRP', 'Other'];
  if (current === 'FactFind') return ['IDD', 'EmploymentContract', 'Other'];
  if (current === 'ValuationReport') return ['BuildingSurvey', 'EPC', 'Other'];
  return ['Other', 'Payslip', 'BankStatement'];
}

const ICONS = {
  processing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  done: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  attention: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
};
