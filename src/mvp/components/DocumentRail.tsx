import { useNavigate } from 'react-router-dom';
import { useCaseStore } from '../store/caseStore';
import { DropZone } from './atoms';
import DocRow from '../tabs/documents/DocRow';
import {
  buildPlaceholderDoc,
  simulateAIPipeline,
} from '../tabs/documents/aiPipeline';

const DOCUMENT_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CLOSE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default function DocumentRail() {
  const documentRailExpanded = useCaseStore((s) => s.documentRailExpanded);
  const setDocumentRailExpanded = useCaseStore((s) => s.setDocumentRailExpanded);
  const documents = useCaseStore((s) => s.case.documents);
  const addDocument = useCaseStore((s) => s.addDocument);
  const navigate = useNavigate();

  const total = documents.length;
  const classified = documents.filter(
    (d) =>
      d.extractionStatus === 'Complete' || d.extractionStatus === 'PartiallyComplete',
  ).length;
  const attention = documents.filter(
    (d) =>
      d.extractionStatus === 'Skipped' ||
      d.extractionStatus === 'Errored' ||
      d.extractionStatus === 'Pending' ||
      (d.classificationConfidence ?? 100) < 50,
  ).length;

  function handleFiles(files: File[]) {
    files.forEach((f) => {
      const placeholder = buildPlaceholderDoc(f);
      addDocument(placeholder);
      simulateAIPipeline(placeholder.uuid);
    });
  }

  if (!documentRailExpanded) {
    return (
      <aside className="nova-rail collapsed" aria-label="Documents rail">
        <button
          type="button"
          className="nova-rail-collapsed-btn"
          onClick={() => setDocumentRailExpanded(true)}
          aria-label="Expand documents rail"
          aria-expanded="false"
        >
          <div className="nova-rail-badge">{total}</div>
          {DOCUMENT_ICON}
          <div className="nova-rail-label">Documents</div>
        </button>
      </aside>
    );
  }

  // Recent uploads — sorted newest first, capped at 5 in the rail.
  const recent = [...documents]
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <aside className="nova-rail expanded" aria-label="Documents rail">
      <div className="nova-rail-expanded">
        <div className="nova-rail-head">
          <h4>Documents</h4>
          <button
            type="button"
            className="nova-rail-close"
            onClick={() => setDocumentRailExpanded(false)}
            aria-label="Collapse documents rail"
            aria-expanded="true"
          >
            {CLOSE_ICON}
          </button>
        </div>

        <div className="nova-rail-dropzone">
          <DropZone
            size="compact"
            label="Drop a document"
            sublabel="PDF, JPG, HEIC"
            onFiles={handleFiles}
          />
        </div>

        <div className="nova-rail-recent">
          <div className="nova-rail-section-title">Recent uploads</div>
          {recent.length === 0 ? (
            <div className="nova-rail-empty">No uploads yet.</div>
          ) : (
            <div className="nova-rail-rows">
              {recent.map((d) => (
                <DocRow
                  key={d.uuid}
                  doc={d}
                  isSelected={false}
                  onSelect={() => {
                    setDocumentRailExpanded(false);
                    navigate('/documents');
                  }}
                  density="compact"
                />
              ))}
            </div>
          )}
        </div>

        <div className="nova-rail-tally">
          <span>
            <strong>{classified}</strong> classified
          </span>
          <span className="nova-rail-tally-sep">·</span>
          <span>
            <strong>{attention}</strong> needs attention
          </span>
          <button
            type="button"
            className="nova-rail-fulltab"
            onClick={() => {
              setDocumentRailExpanded(false);
              navigate('/documents');
            }}
          >
            Open full tab <span className="nova-rail-fulltab-arrow">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
