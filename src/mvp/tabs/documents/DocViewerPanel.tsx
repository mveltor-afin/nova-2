import { useState } from 'react';
import { ConfidencePill } from '../../components/atoms';
import FieldReviewCard, {
  type RecentAction,
} from '../../components/drawers/FieldReviewCard';
import { useCaseStore } from '../../store/caseStore';
import type { Document } from '../../model/document';

/**
 * Document viewer panel — opens beneath the tray when a doc row is
 * clicked. Mock document preview on the left, list of every
 * extraction from this doc on the right, each rendered via the same
 * `<FieldReviewCard />` used by the field-review drawer.
 */
export interface DocViewerPanelProps {
  doc: Document;
  onClose: () => void;
}

export default function DocViewerPanel({ doc, onClose }: DocViewerPanelProps) {
  const allExtractions = useCaseStore((s) => s.case.extractions);
  const docExtractions = allExtractions.filter((e) => e.documentId === doc.uuid);

  // Local recent-actions tracking, matching the Field Review drawer's
  // "Accepted ✓ for 3s" pattern.
  const [recent, setRecent] = useState<Map<string, RecentAction>>(new Map());

  function recordAction(uuid: string, action: RecentAction) {
    setRecent((prev) => new Map(prev).set(uuid, action));
    setTimeout(() => {
      setRecent((prev) => {
        const next = new Map(prev);
        next.delete(uuid);
        return next;
      });
    }, 3000);
  }

  return (
    <div className="doc-viewer-panel">
      <div className="doc-viewer-head">
        <div className="doc-viewer-titles">
          <div className="doc-viewer-name">{doc.filename}</div>
          <div className="doc-viewer-chips">
            {doc.pageCount !== undefined && (
              <span className="doc-viewer-chip">{doc.pageCount} pages</span>
            )}
            {doc.classificationConfidence !== undefined && (
              <span className="doc-viewer-chip-pill">
                <ConfidencePill confidence={doc.classificationConfidence / 100} />
              </span>
            )}
            {doc.classificationSource && (
              <span className="doc-viewer-chip">{doc.classificationSource}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="doc-viewer-close"
          onClick={onClose}
          aria-label="Close viewer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="doc-viewer-body">
        {/* Left — mock preview */}
        <div className="doc-viewer-preview">
          <div className="doc-viewer-page">
            <div className="doc-viewer-page-margin">
              <span className="doc-viewer-page-pseudo">{doc.filename}</span>
              <span className="doc-viewer-page-pseudo">
                {doc.classificationSource ?? 'Source'}
              </span>
            </div>
            <div className="doc-viewer-page-body">
              <span className="doc-viewer-page-pseudo">— extracted regions —</span>
              {docExtractions.slice(0, 4).map((e) => (
                <div key={e.uuid} className="doc-viewer-snippet">
                  {e.evidenceSnippet ?? '— snippet —'}
                </div>
              ))}
              {docExtractions.length === 0 && (
                <div className="doc-viewer-empty">
                  No extractions for this document yet.
                </div>
              )}
            </div>
            <div className="doc-viewer-page-margin">
              <span className="doc-viewer-page-pseudo">
                {doc.uploadedBy ?? '—'}
              </span>
              <span className="doc-viewer-page-pseudo">{doc.source}</span>
            </div>
          </div>
        </div>

        {/* Right — extractions list */}
        <div className="doc-viewer-extractions">
          <div className="doc-viewer-extractions-title">
            Extractions · {docExtractions.length}
          </div>
          {docExtractions.length === 0 ? (
            <div className="doc-viewer-empty">
              {doc.extractionStatus === 'Running'
                ? 'Extraction in progress…'
                : 'No fields extracted from this document.'}
            </div>
          ) : (
            <ul className="doc-viewer-cards">
              {docExtractions.map((e) => (
                <li key={e.uuid}>
                  <FieldReviewCard
                    extractionUuid={e.uuid}
                    recentAction={recent.get(e.uuid)}
                    onAction={(a) => recordAction(e.uuid, a)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
