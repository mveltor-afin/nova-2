import type { DateTimeString, UUID } from './primitives';

/**
 * FieldExtraction — one row per AI-proposed value awaiting broker
 * confirmation. Lives on `Case.extractions`. Drives the Field Review
 * Card UI in the document rail.
 *
 * Once the broker accepts (or overrides) a row, the resolved value is
 * written through to the target entity's typed field, and a Provenance
 * record (source = 'Document') is written into `Case.provenanceMap`
 * keyed by `${targetEntity}:${targetEntityId}:${targetAttribute}`.
 *
 * The extraction row is *kept* after resolution so the audit trail
 * survives — the `status` field shows the final state.
 */
export interface FieldExtraction {
  uuid: UUID;

  // === Source ===
  /** Document this value was lifted from. */
  documentId: UUID;
  /** Page number (1-indexed) where the value was found. */
  evidencePageNumber?: number;
  /** Excerpt of supporting text / OCR for the source-evidence drawer. */
  evidenceSnippet?: string;
  /** Bounding box on the page (image docs) — `[x, y, w, h]` in PDF
   *  user-space units. Optional, used for the highlight overlay. */
  evidenceBoundingBox?: [number, number, number, number];

  // === Target ===
  /** Which top-level entity the field belongs to. */
  targetEntity:
    | 'Person'
    | 'Employment'
    | 'AdverseHistory'
    | 'Income'
    | 'Expenditure'
    | 'Liability'
    | 'Collateral'
    | 'Arrangement'
    | 'ThirdParty'
    | 'Consent';
  /** Stable UUID of the target entity (or 'arrangement' for the
   *  singleton Arrangement). For new rows that don't yet have a UUID
   *  (a previously-unknown liability spotted in a bank statement) the
   *  AI proposes a generated UUID and tags `isNewEntity = true`. */
  targetEntityId: UUID;
  /** Whether the proposed value would create a brand-new entity row. */
  isNewEntity?: boolean;
  /** Register field ID — A2, P16, M6 etc. Used as the attribute portion
   *  of the provenance key once accepted. */
  targetAttribute: string;

  // === Proposed value ===
  /** Raw extracted value. Untyped because the same FieldExtraction
   *  shape covers strings, numbers, dates, and enums. The presenter
   *  is responsible for casting based on `targetAttribute`. */
  proposedValue: unknown;
  /** Display string for the value, ready for rendering in the card
   *  (e.g. "£3,250.00", "1985-03-12 → 12 Mar 1985"). */
  proposedValueDisplay?: string;
  /** 0–100 confidence. */
  confidence: number;
  /** Method used to lift the value. */
  method?: 'AI text' | 'OCR' | 'AI image';

  // === Resolution state ===
  status: ExtractionResolutionStatus;
  /** What the value resolved to. May differ from `proposedValue` if
   *  the broker overrode it. */
  resolvedValue?: unknown;
  /** Display string for the resolved value. */
  resolvedValueDisplay?: string;
  /** Resolved by — broker name. */
  resolvedBy?: string;
  /** When resolved. */
  resolvedAt?: DateTimeString;
}

export type ExtractionResolutionStatus =
  /** Awaiting broker action — shows in the review queue. */
  | 'Proposed'
  /** Auto-accepted because confidence ≥ 90. */
  | 'AutoAccepted'
  /** Broker accepted the AI value. */
  | 'Accepted'
  /** Broker overrode the AI value with a manual entry. */
  | 'Overridden'
  /** Broker rejected the proposal (e.g. wrong document). */
  | 'Rejected'
  /** Broker deferred — needs more info before deciding. */
  | 'Deferred';
