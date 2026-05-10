import { useState } from 'react';
import { useCaseStore } from '../../store/caseStore';
import type { Document } from '../../model/document';
import type { ResolvedPlaceholder } from '../../model/documentPlaceholders';

export interface UnclassifiedSectionProps {
  documents: Document[];
  resolved: ResolvedPlaceholder[];
  onView: (doc: Document) => void;
}

export default function UnclassifiedSection({
  documents,
  resolved,
  onView,
}: UnclassifiedSectionProps) {
  if (documents.length === 0) return null;

  return (
    <section className="unclassified-section">
      <header className="unclassified-section__header">
        <h3 className="unclassified-section__title">Unclassified</h3>
        <span className="unclassified-section__count">
          {documents.length} {documents.length === 1 ? 'file' : 'files'} need a home
        </span>
      </header>
      <div className="unclassified-section__body">
        {documents.map((doc) => (
          <UnclassifiedRow
            key={doc.uuid}
            doc={doc}
            resolved={resolved}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
}

function UnclassifiedRow({
  doc,
  resolved,
  onView,
}: {
  doc: Document;
  resolved: ResolvedPlaceholder[];
  onView: (doc: Document) => void;
}) {
  const assign = useCaseStore((s) => s.assignDocumentToPlaceholder);
  const removeDocument = useCaseStore((s) => s.removeDocument);
  const [pickerOpen, setPickerOpen] = useState(false);

  const empty = resolved.filter((r) => r.state === 'empty');

  return (
    <div className="unclassified-row">
      <div className="unclassified-row__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="12" y1="12" x2="12" y2="18" />
        </svg>
      </div>
      <div className="unclassified-row__text">
        <div className="unclassified-row__name">{doc.filename}</div>
        <div className="unclassified-row__meta">
          {doc.extractionStatusMessage ?? "AI couldn't match this to a placeholder"}
        </div>
      </div>
      <div className="unclassified-row__actions">
        <button type="button" className="dc-btn ghost" onClick={() => onView(doc)}>
          View
        </button>
        <div className="unclassified-row__assign">
          <button
            type="button"
            className="dc-btn primary"
            onClick={() => setPickerOpen((v) => !v)}
          >
            Assign to placeholder
          </button>
          {pickerOpen && (
            <div
              className="unclassified-picker"
              role="menu"
              onMouseLeave={() => setPickerOpen(false)}
            >
              {empty.length === 0 ? (
                <div className="unclassified-picker__empty">
                  No empty placeholders left.
                </div>
              ) : (
                empty.map((r) => (
                  <button
                    key={r.uniqueKey}
                    type="button"
                    role="menuitem"
                    className="unclassified-picker__item"
                    onClick={() => {
                      assign(doc.uuid, r.uniqueKey);
                      setPickerOpen(false);
                    }}
                  >
                    <span className="unclassified-picker__label">
                      {r.spec.label}
                    </span>
                    {r.applicantLabel && (
                      <span className="unclassified-picker__applicant">
                        {r.applicantLabel}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
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
      </div>
    </div>
  );
}
