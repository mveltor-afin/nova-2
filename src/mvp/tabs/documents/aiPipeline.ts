import { useCaseStore } from '../../store/caseStore';
import type { Document, DocumentType } from '../../model/document';
import {
  resolvePlaceholders,
  type ResolvedPlaceholder,
} from '../../model/documentPlaceholders';
import type { Case } from '../../model/case';

/**
 * Mock AI ingest pipeline. When a file lands (drop or browse), the
 * Documents tab / rail kicks off a sequence of state transitions on
 * the corresponding `Document`:
 *
 *   pending           (immediately on add)
 *   classifying       (2s)        → sets a classificationConfidence
 *   ocr-in-progress   (3s, image)  → sets ocrConfidence
 *   extracting        (3s)         → maps proposed values
 *   done              (final)
 *
 * The dev panel (Step 3) overrides this pipeline by setting doc state
 * directly on the canonical HEIC scan; this helper is only used for
 * runtime-added uploads.
 */
export function simulateAIPipeline(uuid: string) {
  const update = useCaseStore.getState().updateDocument;
  const get = () => useCaseStore.getState().case.documents.find((d) => d.uuid === uuid);

  const initial = get();
  if (!initial) return;
  const isImage =
    initial.mimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|heic|tiff?)$/i.test(initial.filename);

  // 0 → classifying
  update(uuid, {
    extractionStatus: 'Pending',
    extractionStatusMessage: 'Queued for classification',
  });

  setTimeout(() => {
    if (!get()) return;
    update(uuid, {
      extractionStatus: 'Pending',
      extractionStatusMessage: 'Classifying…',
    });
  }, 200);

  setTimeout(() => {
    if (!get()) return;
    const guess = guessType(initial.filename);
    update(uuid, {
      classificationType: guess.type,
      classificationConfidence: guess.confidence,
      classificationSource: 'AI text',
      extractionStatus: 'Running',
      extractionStatusMessage: isImage ? 'Reading scan…' : 'Extracting fields…',
      ocrRequired: isImage,
      ocrConfidence: isImage ? 60 : undefined,
    });
  }, 2000);

  if (isImage) {
    setTimeout(() => {
      if (!get()) return;
      update(uuid, {
        ocrConfidence: 88,
        extractionStatus: 'Running',
        extractionStatusMessage: 'Extracting fields…',
      });
    }, 5000);
  }

  setTimeout(() => {
    const doc = get();
    if (!doc) return;
    update(uuid, {
      extractionStatus: 'Complete',
      extractionStatusMessage: undefined,
    });
    // Step 17 — once classified, attempt to pin the document onto a
    // matching empty placeholder. If multiple match (e.g. per-applicant
    // payslip across two applicants) we keep it deterministic by
    // picking the first empty slot whose applicant heuristic agrees.
    const state = useCaseStore.getState();
    const assigned = state.case.documentPlaceholderAssignments?.[uuid];
    if (assigned) return;
    const match = pickPlaceholderFor(state.case, doc.type, uuid);
    if (match) {
      state.assignDocumentToPlaceholder(uuid, match.uniqueKey);
    }
  }, isImage ? 8000 : 5000);
}

function pickPlaceholderFor(
  c: Case,
  type: DocumentType,
  documentId: string,
): ResolvedPlaceholder | undefined {
  const resolved = resolvePlaceholders(c);
  const empty = resolved.filter(
    (r) => r.state === 'empty' && r.spec.expectedType === type,
  );
  if (empty.length === 0) return undefined;
  if (empty.length === 1) return empty[0];
  const doc = c.documents.find((d) => d.uuid === documentId);
  const filename = doc?.filename.toLowerCase() ?? '';
  const byName = empty.find((r) => {
    if (!r.applicantId) return false;
    const party = c.parties.find((p) => p.uuid === r.applicantId);
    if (!party || party.kind !== 'Person') return false;
    return filename.includes(party.person.firstName.toLowerCase());
  });
  return byName ?? empty[0];
}

/** Cheap filename heuristic — replace with a real classifier later. */
function guessType(filename: string): { type: Document['type']; confidence: number } {
  const f = filename.toLowerCase();
  if (/passport/.test(f)) return { type: 'Passport', confidence: 96 };
  if (/payslip|wage/.test(f)) return { type: 'Payslip', confidence: 94 };
  if (/p60/.test(f)) return { type: 'P60', confidence: 95 };
  if (/sa302/.test(f)) return { type: 'SA302', confidence: 93 };
  if (/(bank|statement)/.test(f)) return { type: 'BankStatement', confidence: 92 };
  if (/valuation/.test(f)) return { type: 'ValuationReport', confidence: 91 };
  if (/(fact[\s_-]?find|factfind)/.test(f)) return { type: 'FactFind', confidence: 96 };
  if (/epc/.test(f)) return { type: 'EPC', confidence: 88 };
  if (/(licence|license)/.test(f)) return { type: 'DrivingLicence', confidence: 90 };
  return { type: 'Other', confidence: 24 };
}

export function buildPlaceholderDoc(file: File): Document {
  return {
    uuid: `doc-${Math.random().toString(36).slice(2, 10)}`,
    filename: file.name,
    mimeType: file.type || guessMime(file.name),
    sizeBytes: file.size,
    pageCount: undefined,
    source: 'BrokerUpload',
    type: 'Other',
    label: undefined,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'A. Okafor (broker)',
    extractionStatus: 'Pending',
    extractionStatusMessage: 'Queued for classification',
  };
}

/**
 * Step 17 — direct upload onto a known placeholder. The file's type
 * is set deterministically (no AI classification phase), but we still
 * run a brief "Reading…" → "Extracting…" → "Done" pipeline so the
 * placeholder row shows progress and any extractions still flow.
 */
export function buildTypedDoc(file: File, type: DocumentType): Document {
  return {
    uuid: `doc-${Math.random().toString(36).slice(2, 10)}`,
    filename: file.name,
    mimeType: file.type || guessMime(file.name),
    sizeBytes: file.size,
    pageCount: undefined,
    source: 'BrokerUpload',
    type,
    classificationType: type,
    classificationConfidence: 100,
    classificationSource: 'Manual',
    label: undefined,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'A. Okafor (broker)',
    extractionStatus: 'Pending',
    extractionStatusMessage: 'Queued for extraction',
  };
}

/** Run extraction-only path (no classification), used by direct
 *  uploads onto a placeholder. */
export function simulateExtractionOnly(uuid: string) {
  const update = useCaseStore.getState().updateDocument;
  const get = () =>
    useCaseStore.getState().case.documents.find((d) => d.uuid === uuid);
  const initial = get();
  if (!initial) return;
  const isImage =
    initial.mimeType.startsWith('image/') ||
    /\.(jpg|jpeg|png|heic|tiff?)$/i.test(initial.filename);
  setTimeout(() => {
    if (!get()) return;
    update(uuid, {
      extractionStatus: 'Running',
      extractionStatusMessage: isImage ? 'Reading scan…' : 'Extracting fields…',
      ocrRequired: isImage,
      ocrConfidence: isImage ? 70 : undefined,
    });
  }, 200);
  setTimeout(() => {
    if (!get()) return;
    update(uuid, {
      extractionStatus: 'Complete',
      extractionStatusMessage: undefined,
      ocrConfidence: isImage ? 92 : undefined,
    });
  }, isImage ? 4500 : 3000);
}

function guessMime(filename: string): string {
  const f = filename.toLowerCase();
  if (f.endsWith('.pdf')) return 'application/pdf';
  if (f.endsWith('.jpg') || f.endsWith('.jpeg')) return 'image/jpeg';
  if (f.endsWith('.png')) return 'image/png';
  if (f.endsWith('.heic')) return 'image/heic';
  return 'application/octet-stream';
}
