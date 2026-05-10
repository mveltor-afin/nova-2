import { useRef, useState } from 'react';
import { useCaseStore } from '../../store/caseStore';
import { buildTypedDoc, simulateExtractionOnly } from './aiPipeline';
import type { Document } from '../../model/document';
import type { ResolvedPlaceholder } from '../../model/documentPlaceholders';

export interface PlaceholderRowProps {
  resolved: ResolvedPlaceholder;
  document: Document | undefined;
  onView: (doc: Document) => void;
}

/**
 * One row in a category group. Six visual states (empty / uploading /
 * classifying / awaiting-review / done / error). Direct upload onto
 * the row skips AI classification — the file inherits the
 * placeholder's expected type.
 */
export default function PlaceholderRow({
  resolved,
  document: doc,
  onView,
}: PlaceholderRowProps) {
  const addDocument = useCaseStore((s) => s.addDocument);
  const removeDocument = useCaseStore((s) => s.removeDocument);
  const assign = useCaseStore((s) => s.assignDocumentToPlaceholder);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const { spec, applicantLabel, state } = resolved;

  function pickFile(file: File) {
    const newDoc = buildTypedDoc(file, spec.expectedType);
    addDocument(newDoc);
    assign(newDoc.uuid, resolved.uniqueKey);
    simulateExtractionOnly(newDoc.uuid);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  }

  return (
    <div className={`placeholder-row is-${state}`}>
      <div className="placeholder-row__main">
        <div className="placeholder-row__icon" aria-hidden="true">
          {STATE_ICON[state]}
        </div>
        <div className="placeholder-row__text">
          <div className="placeholder-row__label">
            <span>{spec.label}</span>
            {spec.mandatory && (
              <span className="placeholder-row__pip" aria-label="Mandatory" />
            )}
            {applicantLabel && (
              <span className="placeholder-applicant-chip">{applicantLabel}</span>
            )}
          </div>
          {(spec.description || spec.hint) && state === 'empty' && (
            <div className="placeholder-row__desc">
              {spec.description ?? spec.hint}
            </div>
          )}
          {doc && state !== 'empty' && (
            <div className="placeholder-row__filename">{doc.filename}</div>
          )}
          {state === 'classifying' && (
            <div className="placeholder-row__substate">
              <span className="ocr-spinner" aria-hidden="true" />
              <span>{doc?.extractionStatusMessage ?? 'Reading…'}</span>
            </div>
          )}
          {state === 'awaiting-review' && (
            <div className="placeholder-row__substate awaiting">
              {doc?.extractionStatusMessage ?? 'Extractions awaiting review'}
            </div>
          )}
          {state === 'error' && (
            <div className="placeholder-row__substate error">
              {doc?.extractionStatusMessage ?? 'Extraction failed'}
            </div>
          )}
        </div>
      </div>

      <div className="placeholder-row__actions">
        {state === 'empty' && (
          <div
            className={`placeholder-row__dropzone ${dragOver ? 'is-over' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <span className="placeholder-row__dropzone-label">
              Drop file or click to upload
            </span>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickFile(file);
                e.target.value = '';
              }}
            />
          </div>
        )}

        {(state === 'awaiting-review' || state === 'done') && doc && (
          <>
            <button
              type="button"
              className="dc-btn ghost"
              onClick={() => onView(doc)}
            >
              View
            </button>
            <button
              type="button"
              className="dc-btn ghost"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </button>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  removeDocument(doc.uuid);
                  pickFile(file);
                }
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="dc-btn ghost destructive"
              onClick={() => {
                if (window.confirm(`Remove ${doc.filename}?`)) {
                  removeDocument(doc.uuid);
                }
              }}
            >
              Remove
            </button>
          </>
        )}

        {state === 'classifying' && (
          <span className="placeholder-row__processing">Processing…</span>
        )}

        {state === 'error' && doc && (
          <button
            type="button"
            className="dc-btn coral"
            onClick={() => {
              if (window.confirm(`Remove ${doc.filename}?`)) {
                removeDocument(doc.uuid);
              }
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

const STATE_ICON = {
  empty: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  uploading: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  classifying: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  'awaiting-review': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  done: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};
