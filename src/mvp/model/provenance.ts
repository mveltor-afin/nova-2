import type { DateTimeString, UUID } from './primitives';

/**
 * Universal Provenance record. Sits beneath every populated field in the UI
 * via the `<Provenance />` component. Stored in `Case.provenanceMap` keyed
 * by `${entityType}:${entityId}:${registerId}` (e.g. `Person:abc-123:A2`).
 */
export type ProvenanceSource =
  /** AI-extracted from a broker-uploaded document. */
  | 'Document'
  /** Typed in by the broker. */
  | 'Manual'
  /** Manually edited *over* a prior Document extraction. Keeps the
   *  Document reference fields (documentId/Label/pageNumber/...) so
   *  the original lineage stays auditable; adds enteredBy/enteredAt
   *  for the override stamp. Step 15. */
  | 'manual-override'
  /** Computed from other fields (e.g. A58 derived from A57 + DOB). */
  | 'Derived'
  /** Snapshot frozen at DIP submission and not editable. */
  | 'Locked';

export interface Provenance {
  source: ProvenanceSource;

  // === When source = 'Document' ===
  /** UUID of the source document. */
  documentId?: UUID;
  /** Human-readable label, e.g. "okafor-fact-find.pdf · p.3". */
  documentLabel?: string;
  /** Page number (1-indexed). */
  pageNumber?: number;
  /** 0–100. Mid (70–89) shows yellow review state; ≥90 auto-applies. */
  confidence?: number;
  /** How the value was lifted off the document. */
  method?: 'AI text' | 'OCR' | 'AI image';
  /** Excerpt from the document supporting the value, for the source-evidence drawer. */
  evidenceSnippet?: string;

  // === When source = 'Manual' ===
  /** Display name of the person who keyed the value. */
  enteredBy?: string;
  /** When the value was entered. */
  enteredAt?: DateTimeString;

  // === When source = 'Derived' ===
  /** Human-readable formula/explanation, e.g. "A57 (60) - DOB age (38) ≤ 10". */
  derivedFrom?: string;

  // === When source = 'Locked' ===
  /** When the value was frozen at DIP. */
  lockedAt?: DateTimeString;
}

/**
 * Convenience wrapper. Used only in places where it's pleasant to keep
 * value + provenance on the same node. The default model uses plain typed
 * fields plus a Case-level `provenanceMap` lookup; this wrapper is for ad-hoc
 * UI structures.
 */
export interface FieldValue<T> {
  value: T | null;
  provenance: Provenance | null;
}
