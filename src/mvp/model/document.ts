import type { DateTimeString, UUID } from './primitives';

/**
 * Document — uploaded files, generated outputs, and lender-issued
 * artefacts. The Documents tab and Downloads tab are filtered views
 * over the same array on `Case.documents`, distinguished by
 * `source`.
 *
 * The AI extraction metadata fields (`classification*`, `extraction*`,
 * `ocr*`) drive the Field Review Cards in the document rail.
 */
export interface Document {
  uuid: UUID;

  // === File identity ===
  /** Filename as uploaded. */
  filename: string;
  /** MIME type. */
  mimeType: string;
  /** Size in bytes — informational. */
  sizeBytes?: number;
  /** Page count for paginated formats (PDF, multi-page TIFF). */
  pageCount?: number;
  /** Mock URL for the document blob (in MVP, points at a static asset). */
  url?: string;

  // === Source / role ===
  /** How the document arrived — drives Documents vs Downloads tab routing. */
  source: DocumentSource;
  /** What kind of document this is. Drives the icon, the routing of its
   *  extracted fields, and the document checklist on the Documents tab. */
  type: DocumentType;
  /** Free-text label override. Defaults from `type`. */
  label?: string;

  // === Upload metadata ===
  uploadedAt: DateTimeString;
  /** Display name of who uploaded — broker, applicant, lender, system. */
  uploadedBy?: string;

  // === AI classification & OCR ===
  /** AI-assigned `type` — kept separate from `type` so a broker can
   *  override without losing the AI's original answer. */
  classificationType?: DocumentType;
  /** 0–100. Same threshold semantics as field-level provenance.confidence. */
  classificationConfidence?: number;
  /** How classification was made. */
  classificationSource?: 'AI text' | 'AI image' | 'Filename heuristic' | 'Manual';
  /** Whether OCR was needed (image PDF, scanned upload). */
  ocrRequired?: boolean;
  /** OCR overall confidence. */
  ocrConfidence?: number;

  // === Extraction state ===
  /** Status of field extraction work for this document. */
  extractionStatus?: ExtractionStatus;
  /** Brief diagnostic message when extraction errored or was skipped. */
  extractionStatusMessage?: string;
}

export type DocumentSource =
  /** Uploaded by the broker. */
  | 'BrokerUpload'
  /** Uploaded by the applicant via consumer link. */
  | 'ApplicantUpload'
  /** Generated inside Nova (DIP cert, ESIS, audit pack). */
  | 'NovaGenerated'
  /** Pulled from external systems (Land Registry, EPC register, Open Banking). */
  | 'ExternalPull'
  /** Issued by the lender (Afin) — offer letter, valuation report. */
  | 'LenderIssued';

/** Document types relevant to the MVP. The list deliberately mirrors
 *  the document checklist on the Documents tab and is open-ended via
 *  `Other`. */
export type DocumentType =
  // Identity
  | 'Passport'
  | 'DrivingLicence'
  | 'BRP'
  // Address
  | 'ProofOfAddress'
  | 'CouncilTaxBill'
  | 'UtilityBill'
  // Income (employed)
  | 'Payslip'
  | 'P60'
  | 'EmploymentContract'
  // Income (self-employed)
  | 'SA302'
  | 'TaxYearOverview'
  | 'AccountantReference'
  | 'CompanyAccounts'
  // Bank
  | 'BankStatement'
  // Property
  | 'EPC'
  | 'LandRegistryTitle'
  | 'ValuationReport'
  | 'BuildingSurvey'
  // Application artefacts
  | 'FactFind'
  | 'IDD'
  | 'GiftLetter'
  | 'DepositSourceEvidence'
  // Generated outputs
  | 'DIPCertificate'
  | 'ESIS'
  | 'MortgageOffer'
  | 'AuditPack'
  // Catch-all
  | 'Other';

export type ExtractionStatus =
  | 'Pending'
  | 'Running'
  | 'Complete'
  | 'PartiallyComplete'
  | 'Errored'
  | 'Skipped';
