import { useCaseStore } from '../../store/caseStore';
import { ConfidencePill, Chip } from '../../components/atoms';
import type { Document } from '../../model/document';

/**
 * Horizontal stack of doc cards (36px icon · 1fr metadata · auto actions).
 * Each card maps the document's lifecycle state onto one of three icon
 * tones and renders the corresponding metadata + actions:
 *
 *   processing  · amber, spinner, "Reading…" sub-state
 *   done        · green tick + classification chip + extracted-fields meta
 *   attention   · coral, "Couldn't classify" chip + Classify CTA
 */
export default function DocumentStack() {
  const documents = useCaseStore((s) => s.case.documents);
  const openDrawer = useCaseStore((s) => s.openDrawer);

  if (documents.length === 0) return null;

  return (
    <div className="doc-stack">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.uuid}
          doc={doc}
          onClick={() =>
            openDrawer({
              kind: 'field-review',
              documentId: doc.uuid,
            })
          }
        />
      ))}
    </div>
  );
}

type CardState = 'processing' | 'done' | 'attention';

function deriveState(doc: Document): CardState {
  if (doc.extractionStatus === 'Running') return 'processing';
  if (doc.extractionStatus === 'Pending') return 'attention';
  if (doc.extractionStatus === 'Skipped' || doc.extractionStatus === 'Errored') {
    return 'attention';
  }
  if ((doc.classificationConfidence ?? 100) < 50) return 'attention';
  return 'done';
}

function DocumentCard({
  doc,
  onClick,
}: {
  doc: Document;
  onClick: () => void;
}) {
  const state = deriveState(doc);

  return (
    <article
      className={`doc-card state-${state}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`dc-ico ${state}`}>{ICONS[state]}</div>

      <div className="dc-content">
        <div className="dc-name">{doc.filename}</div>

        {state === 'processing' && (
          <span className="ocr-substate">
            <span className="ocr-spinner" aria-hidden="true" />
            <span>{doc.extractionStatusMessage ?? 'Reading…'}</span>
          </span>
        )}

        {state === 'done' && (
          <>
            <div className="dc-class-row">
              <span className="doc-class-chip">
                {prettyType(doc.type)}
              </span>
              {doc.classificationConfidence !== undefined && (
                <ConfidencePill
                  confidence={doc.classificationConfidence / 100}
                />
              )}
            </div>
            <div className="dc-meta">{describeRouting(doc)}</div>
          </>
        )}

        {state === 'attention' && (
          <>
            <Chip tone="coral">Couldn't classify</Chip>
            <div className="dc-meta">
              {doc.extractionStatusMessage ??
                'Image quality low — pick a category manually'}
            </div>
          </>
        )}
      </div>

      <div className="dc-actions">
        {state === 'done' && (
          <>
            <button
              type="button"
              className="dc-btn primary"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Confirm
            </button>
            <button
              type="button"
              className="dc-btn ghost"
              onClick={(e) => e.stopPropagation()}
            >
              Recategorise
            </button>
          </>
        )}
        {state === 'attention' && (
          <button
            type="button"
            className="dc-btn coral"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Classify →
          </button>
        )}
      </div>
    </article>
  );
}

function prettyType(type: string): string {
  if (type === 'FactFind') return 'Fact-find';
  if (type === 'BankStatement') return 'Bank statement';
  if (type === 'ValuationReport') return 'Valuation';
  return type.replace(/([A-Z])/g, ' $1').trim();
}

function describeRouting(doc: Document): string {
  switch (doc.type) {
    case 'Payslip':
      return '8 fields extracted · Routed to Applicants → Income';
    case 'FactFind':
      return '18 fields extracted · 2 conflicts pending review';
    case 'BankStatement':
      return '18 fields extracted · 1 conflict pending';
    case 'Passport':
      return '3 fields extracted · Routed to Applicants → Identity';
    case 'ValuationReport':
      return '6 fields extracted · Routed to Security';
    default:
      return doc.extractionStatusMessage ?? 'Extraction complete';
  }
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
