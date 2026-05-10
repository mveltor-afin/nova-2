import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { DropZone } from '../components/atoms';
import { useCaseStore } from '../store/caseStore';
import PlaceholderGroup from './documents/PlaceholderGroup';
import PreviewPanel from './documents/PreviewPanel';
import UnclassifiedSection from './documents/UnclassifiedSection';
import {
  buildPlaceholderDoc,
  simulateAIPipeline,
} from './documents/aiPipeline';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  resolvePlaceholders,
  unclassifiedDocuments,
  type DocumentCategory,
  type ResolvedPlaceholder,
} from '../model/documentPlaceholders';
import type { Document } from '../model/document';

/**
 * Step 17 — Documents tab overhaul. Drop drawer pinned at the top,
 * collapsible category groups for the placeholder shopping list, and
 * a bottom Unclassified bin for AI-unmatched uploads. Document
 * preview moved to a right-side slide-in (`PreviewPanel`).
 */
export default function DocumentsTab() {
  const caseState = useCaseStore((s) => s.case);
  const addDocument = useCaseStore((s) => s.addDocument);

  const [previewUuid, setPreviewUuid] = useState<string | null>(null);

  const resolved = useMemo(() => resolvePlaceholders(caseState), [caseState]);
  const unclassified = useMemo(
    () => unclassifiedDocuments(caseState, resolved),
    [caseState, resolved],
  );
  const documentsByUuid = useMemo(
    () => new Map(caseState.documents.map((d) => [d.uuid, d])),
    [caseState.documents],
  );

  useEffect(() => {
    if (previewUuid && !documentsByUuid.has(previewUuid)) {
      setPreviewUuid(null);
    }
  }, [documentsByUuid, previewUuid]);

  function handleFiles(files: File[]) {
    files.forEach((f) => {
      const placeholder = buildPlaceholderDoc(f);
      addDocument(placeholder);
      simulateAIPipeline(placeholder.uuid);
    });
  }

  const grouped = groupByCategory(resolved);
  const previewDoc = previewUuid ? documentsByUuid.get(previewUuid) : undefined;

  return (
    <div className="documents-page documents-tab__layout">
      <section className="documents-drop-drawer">
        <div className="documents-drop-drawer__intro">
          <h3 className="documents-drop-drawer__title">Drop documents</h3>
          <p className="documents-drop-drawer__sublabel">
            Nova classifies, OCRs, and routes each file to the matching
            placeholder below. Drag anywhere onto a placeholder to assign
            it directly.
          </p>
        </div>
        <DropZone
          size="default"
          label="Drop or click to upload"
          sublabel="PDF, JPEG, PNG, HEIC. Multi-file supported."
          onFiles={handleFiles}
        />
      </section>

      {CATEGORY_ORDER.map((cat) => {
        const rows = grouped.get(cat) ?? [];
        if (rows.length === 0) return null;
        return (
          <PlaceholderGroup
            key={cat}
            title={CATEGORY_LABELS[cat]}
            rows={rows}
            documentsByUuid={documentsByUuid}
            defaultOpen={isMandatoryGroup(rows)}
            icon={CATEGORY_ICONS[cat]}
            onView={(d) => setPreviewUuid(d.uuid)}
          />
        );
      })}

      <UnclassifiedSection
        documents={unclassified}
        resolved={resolved}
        onView={(d) => setPreviewUuid(d.uuid)}
      />

      {previewDoc && (
        <PreviewPanel
          doc={previewDoc}
          onClose={() => setPreviewUuid(null)}
        />
      )}
    </div>
  );
}

function groupByCategory(
  rows: ResolvedPlaceholder[],
): Map<DocumentCategory, ResolvedPlaceholder[]> {
  const out = new Map<DocumentCategory, ResolvedPlaceholder[]>();
  for (const r of rows) {
    const list = out.get(r.spec.category) ?? [];
    list.push(r);
    out.set(r.spec.category, list);
  }
  return out;
}

function isMandatoryGroup(rows: ResolvedPlaceholder[]): boolean {
  return rows.some((r) => r.spec.mandatory);
}

const CATEGORY_ICONS: Record<DocumentCategory, ReactNode> = {
  identity: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="11" r="2.5" />
      <path d="M14 9h4" />
      <path d="M14 13h4" />
      <path d="M5 17c1.5-2 5-2 6.5 0" />
    </svg>
  ),
  'income-employed': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 6V4h8v2" />
    </svg>
  ),
  'income-self-employed': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M9 21v-7h6v7" />
    </svg>
  ),
  'bank-statements': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M7 11h2" />
      <path d="M7 15h6" />
    </svg>
  ),
  property: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  affordability: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 6-6" />
    </svg>
  ),
  deposit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9 10h4.5a2 2 0 0 1 0 4H9" />
    </svg>
  ),
  declarations: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
};
