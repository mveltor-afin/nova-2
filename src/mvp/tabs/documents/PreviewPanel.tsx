import { useEffect, useState } from 'react';
import { ConfidencePill } from '../../components/atoms';
import FieldReviewCard, {
  type RecentAction,
} from '../../components/drawers/FieldReviewCard';
import { useCaseStore } from '../../store/caseStore';
import type { Document } from '../../model/document';

export interface PreviewPanelProps {
  doc: Document;
  onClose: () => void;
}

/**
 * Right-side slide-in document preview. Replaces the bottom-mounted
 * DocViewerPanel on the Documents tab. 560px wide, full-height of the
 * viewport. Closes on X / Esc / click-outside — same chrome rules as
 * the workspace's other drawers.
 */
export default function PreviewPanel({ doc, onClose }: PreviewPanelProps) {
  const allExtractions = useCaseStore((s) => s.case.extractions);
  const docExtractions = allExtractions.filter((e) => e.documentId === doc.uuid);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="preview-panel__overlay"
      role="presentation"
      onClick={onClose}
    >
      <aside
        className="preview-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${doc.filename}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="preview-panel__head">
          <div className="preview-panel__titles">
            <div className="preview-panel__name">{doc.filename}</div>
            <div className="preview-panel__chips">
              {doc.pageCount !== undefined && (
                <span className="preview-panel__chip">
                  {doc.pageCount} pages
                </span>
              )}
              {doc.classificationConfidence !== undefined && (
                <span className="preview-panel__chip-pill">
                  <ConfidencePill
                    confidence={doc.classificationConfidence / 100}
                  />
                </span>
              )}
              {doc.classificationSource && (
                <span className="preview-panel__chip">
                  {doc.classificationSource}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="preview-panel__close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="preview-panel__body">
          <div className="preview-panel__document">
            <div className="preview-panel__page">
              <div className="preview-panel__page-margin">
                <span className="preview-panel__page-pseudo">
                  {doc.filename}
                </span>
                <span className="preview-panel__page-pseudo">
                  {doc.classificationSource ?? 'Source'}
                </span>
              </div>
              <div className="preview-panel__page-body">
                <span className="preview-panel__page-pseudo">
                  — extracted regions —
                </span>
                {docExtractions.slice(0, 4).map((e) => (
                  <div key={e.uuid} className="preview-panel__snippet">
                    {e.evidenceSnippet ?? '— snippet —'}
                  </div>
                ))}
                {docExtractions.length === 0 && (
                  <div className="preview-panel__empty">
                    No extractions for this document yet.
                  </div>
                )}
              </div>
              <div className="preview-panel__page-margin">
                <span className="preview-panel__page-pseudo">
                  {doc.uploadedBy ?? '—'}
                </span>
                <span className="preview-panel__page-pseudo">{doc.source}</span>
              </div>
            </div>
          </div>

          <div className="preview-panel__extractions">
            <div className="preview-panel__extractions-title">
              Extractions · {docExtractions.length}
            </div>
            {docExtractions.length === 0 ? (
              <div className="preview-panel__empty">
                {doc.extractionStatus === 'Running'
                  ? 'Extraction in progress…'
                  : 'No fields extracted from this document.'}
              </div>
            ) : (
              <ul className="preview-panel__cards">
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
      </aside>
    </div>
  );
}
