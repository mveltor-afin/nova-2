import Drawer from './Drawer';
import { ConfidencePill } from '../atoms';
import { useCaseStore } from '../../store/caseStore';

/**
 * Source-evidence drawer. Opens from a Provenance click or the source
 * chip on a review card. Mock UI: a paper-page frame containing the
 * extracted snippet text, with a yellow rectangle overlay marking the
 * extraction region. No real PDF rendering — the page just *looks*
 * like a document so the broker can imagine the source context.
 */
export default function SourceEvidenceDrawer() {
  const drawer = useCaseStore((s) => s.drawer);
  const closeDrawer = useCaseStore((s) => s.closeDrawer);
  const allDocuments = useCaseStore((s) => s.case.documents);
  const allExtractions = useCaseStore((s) => s.case.extractions);

  if (drawer.kind !== 'source-evidence') return null;

  const document = allDocuments.find((d) => d.uuid === drawer.documentId);
  const extraction = drawer.extractionId
    ? allExtractions.find((e) => e.uuid === drawer.extractionId)
    : undefined;

  if (!document) {
    return (
      <Drawer title="Source evidence" onClose={closeDrawer} width={560}>
        <div className="evidence-empty">Document not found.</div>
      </Drawer>
    );
  }

  const snippet = drawer.snippet ?? extraction?.evidenceSnippet ?? null;
  const pageNumber = drawer.pageNumber ?? extraction?.evidencePageNumber;

  return (
    <Drawer
      title={document.label ?? document.filename}
      subtitle={
        <>
          {pageNumber !== undefined && <span>Page {pageNumber}</span>}
          {pageNumber !== undefined && document.pageCount !== undefined && (
            <span> · of {document.pageCount}</span>
          )}
        </>
      }
      width={560}
      onClose={closeDrawer}
      variant="source-evidence-drawer"
    >
      <div className="evidence-layout">
        <aside className="evidence-thumbs" aria-label="Document pages">
          {Array.from({ length: document.pageCount ?? 1 }).map((_, i) => {
            const page = i + 1;
            const isActive = page === pageNumber;
            return (
              <button
                key={page}
                type="button"
                className={`evidence-thumb ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="evidence-thumb-page">{page}</span>
              </button>
            );
          })}
        </aside>

        <div className="evidence-main">
          <div className="evidence-page" role="img" aria-label="Document page render">
            <div className="evidence-page-margin top">
              <span className="evidence-page-pseudo">— filename: {document.filename} —</span>
            </div>
            <div className="evidence-page-body">
              <span className="evidence-page-pseudo">{document.label ?? document.filename}</span>
              <span className="evidence-page-pseudo">
                {pageNumber !== undefined ? `Page ${pageNumber}` : ''}
              </span>
              <div className="evidence-snippet-wrap">
                {snippet ? (
                  <div className="evidence-snippet-highlight">
                    <pre className="evidence-snippet-text">{snippet}</pre>
                  </div>
                ) : (
                  <div className="evidence-snippet-placeholder">
                    No snippet recorded for this extraction.
                  </div>
                )}
              </div>
              <span className="evidence-page-pseudo">…</span>
            </div>
            <div className="evidence-page-margin bottom">
              <span className="evidence-page-pseudo">
                {pageNumber !== undefined && document.pageCount !== undefined
                  ? `${pageNumber} / ${document.pageCount}`
                  : ''}
              </span>
            </div>
          </div>

          <section className="evidence-meta">
            <h4 className="evidence-meta-title">Metadata</h4>
            <dl className="evidence-meta-list">
              <MetaRow label="Source">{document.source}</MetaRow>
              <MetaRow label="Type">{document.type}</MetaRow>
              <MetaRow label="Uploaded by">{document.uploadedBy ?? '—'}</MetaRow>
              <MetaRow label="Uploaded at">{formatDate(document.uploadedAt)}</MetaRow>
              {document.classificationConfidence !== undefined && (
                <MetaRow label="Classification">
                  <ConfidencePill
                    confidence={document.classificationConfidence / 100}
                  />{' '}
                  {document.classificationSource}
                </MetaRow>
              )}
              {document.ocrRequired && (
                <MetaRow label="OCR confidence">
                  {document.ocrConfidence !== undefined ? (
                    <ConfidencePill
                      confidence={document.ocrConfidence / 100}
                    />
                  ) : (
                    'OCR required · awaiting'
                  )}
                </MetaRow>
              )}
              {extraction && (
                <>
                  <MetaRow label="Extraction confidence">
                    <ConfidencePill confidence={extraction.confidence / 100} />
                  </MetaRow>
                  <MetaRow label="Method">{extraction.method ?? '—'}</MetaRow>
                </>
              )}
              <MetaRow label="Model · version">Nova-Extract v0.4 · 2026-04-12</MetaRow>
            </dl>
          </section>
        </div>
      </div>
    </Drawer>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="evidence-meta-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
