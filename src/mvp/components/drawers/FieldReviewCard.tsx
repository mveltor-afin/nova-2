import { useState, type ReactNode } from 'react';
import { useCaseStore, type DrawerState } from '../../store/caseStore';
import { ConfidencePill, Chip, bandFor } from '../atoms';
import { labelFor } from '../../model/registerLabels';
import type { FieldExtraction } from '../../model/extraction';
import type { Document } from '../../model/document';

/**
 * Single review-queue card. Reads the extraction + competing
 * extractions from the store and renders one of three modes:
 *
 *  - **standard**   AI-proposed value, three actions (Accept / Edit / Reject)
 *  - **conflict**   two competing sources side-by-side; resolution opens the
 *                   ConflictResolverDrawer
 *  - **success**    post-action collapsed state ("Accepted ✓"), shown for ~3s
 *                   before the parent drawer drops the card from the queue
 */
export type RecentAction = 'accepted' | 'rejected' | 'overridden';

export interface FieldReviewCardProps {
  extractionUuid: string;
  recentAction?: RecentAction;
  /** Called after an action — drawer dispatches the store mutator + records
   *  the recent-action set entry. */
  onAction: (action: RecentAction) => void;
  /** Called when user wants to view evidence — opens SourceEvidenceDrawer. */
  onViewEvidence?: () => void;
  /** Called when user clicks Resolve on a conflict — opens ConflictResolverDrawer. */
  onResolveConflict?: () => void;
}

export default function FieldReviewCard({
  extractionUuid,
  recentAction,
  onAction,
  onViewEvidence,
  onResolveConflict,
}: FieldReviewCardProps) {
  const allExtractions = useCaseStore((s) => s.case.extractions);
  const allDocuments = useCaseStore((s) => s.case.documents);
  const acceptExtraction = useCaseStore((s) => s.acceptExtraction);
  const rejectExtraction = useCaseStore((s) => s.rejectExtraction);
  const overrideExtraction = useCaseStore((s) => s.overrideExtraction);
  const openDrawer = useCaseStore((s) => s.openDrawer);

  const ext = allExtractions.find((e) => e.uuid === extractionUuid);
  if (!ext) return null;

  const document = allDocuments.find((d) => d.uuid === ext.documentId);
  const competing = allExtractions.filter(
    (e) =>
      e.uuid !== ext.uuid &&
      e.targetEntity === ext.targetEntity &&
      e.targetEntityId === ext.targetEntityId &&
      e.targetAttribute === ext.targetAttribute,
  );

  // Collapsed success state — shown for ~3s after action.
  if (recentAction) {
    return <SuccessCard ext={ext} action={recentAction} />;
  }

  // Conflict mode: at least one competing extraction for the same target.
  if (competing.length > 0) {
    return (
      <ConflictCard
        primary={ext}
        competing={competing[0]}
        document={document}
        competingDocument={allDocuments.find(
          (d) => d.uuid === competing[0].documentId,
        )}
        onResolve={() => {
          if (onResolveConflict) {
            onResolveConflict();
          } else {
            openDrawer({
              kind: 'conflict-resolver',
              targetEntity: ext.targetEntity,
              targetEntityId: ext.targetEntityId,
              targetAttribute: ext.targetAttribute,
            } satisfies DrawerState);
          }
        }}
      />
    );
  }

  // Standard mode.
  return (
    <StandardCard
      ext={ext}
      document={document}
      onAccept={() => {
        acceptExtraction(ext.uuid);
        onAction('accepted');
      }}
      onReject={() => {
        rejectExtraction(ext.uuid);
        onAction('rejected');
      }}
      onOverride={(value, display) => {
        overrideExtraction(ext.uuid, value, display);
        onAction('overridden');
      }}
      onViewEvidence={onViewEvidence}
    />
  );
}

// ============================================================
// Standard card
// ============================================================

interface StandardCardProps {
  ext: FieldExtraction;
  document: Document | undefined;
  onAccept: () => void;
  onReject: () => void;
  onOverride: (value: string, display: string) => void;
  onViewEvidence?: () => void;
}

function StandardCard({
  ext,
  document,
  onAccept,
  onReject,
  onOverride,
  onViewEvidence,
}: StandardCardProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    ext.proposedValueDisplay ?? String(ext.proposedValue ?? ''),
  );

  return (
    <article className="review-card">
      <CardHeader ext={ext} />

      <div className="review-card-value">
        {editing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="review-card-edit-input"
            autoFocus
          />
        ) : (
          <span className="review-card-proposed">
            {ext.proposedValueDisplay ?? String(ext.proposedValue ?? '—')}
          </span>
        )}
      </div>

      <CardSourceLine ext={ext} document={document} onViewEvidence={onViewEvidence} />

      <div className="review-card-actions">
        {editing ? (
          <>
            <button
              type="button"
              className="review-card-btn primary"
              onClick={() => onOverride(editValue, editValue)}
            >
              Save
            </button>
            <button
              type="button"
              className="review-card-btn secondary"
              onClick={() => {
                setEditing(false);
                setEditValue(
                  ext.proposedValueDisplay ?? String(ext.proposedValue ?? ''),
                );
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className="review-card-btn primary" onClick={onAccept}>
              Accept
            </button>
            <button
              type="button"
              className="review-card-btn secondary"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              type="button"
              className="review-card-btn quiet"
              onClick={onReject}
            >
              Reject
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// ============================================================
// Conflict card
// ============================================================

interface ConflictCardProps {
  primary: FieldExtraction;
  competing: FieldExtraction;
  document: Document | undefined;
  competingDocument: Document | undefined;
  onResolve: () => void;
}

function ConflictCard({
  primary,
  competing,
  document,
  competingDocument,
  onResolve,
}: ConflictCardProps) {
  return (
    <article className="review-card review-card-conflict">
      <CardHeader ext={primary} mode="conflict" />

      <div className="review-card-conflict-grid">
        <ConflictSide ext={primary} document={document} sideLabel="Source A" />
        <div className="review-card-vs">vs</div>
        <ConflictSide
          ext={competing}
          document={competingDocument}
          sideLabel="Source B"
        />
      </div>

      <div className="review-card-actions">
        <button type="button" className="review-card-btn primary" onClick={onResolve}>
          Resolve
        </button>
      </div>
    </article>
  );
}

function ConflictSide({
  ext,
  document,
  sideLabel,
}: {
  ext: FieldExtraction;
  document: Document | undefined;
  sideLabel: string;
}) {
  return (
    <div className="conflict-side">
      <div className="conflict-side-label">{sideLabel}</div>
      <div className="conflict-side-value">
        {ext.proposedValueDisplay ?? String(ext.proposedValue ?? '—')}
      </div>
      <div className="conflict-side-meta">
        {document && (
          <span className="conflict-side-doc">
            {document.label ?? document.filename}
            {ext.evidencePageNumber !== undefined ? ` · p.${ext.evidencePageNumber}` : ''}
          </span>
        )}
        <ConfidencePill confidence={ext.confidence / 100} />
      </div>
    </div>
  );
}

// ============================================================
// Success card (post-action)
// ============================================================

function SuccessCard({
  ext,
  action,
}: {
  ext: FieldExtraction;
  action: RecentAction;
}) {
  const verb =
    action === 'accepted' ? 'Accepted' : action === 'rejected' ? 'Rejected' : 'Updated';
  const tone = action === 'rejected' ? 'coral' : 'green';
  const targetLabel = `${labelFor(ext.targetAttribute)}`;
  return (
    <article className={`review-card review-card-success ${action}`}>
      <Chip tone={tone}>{verb} ✓</Chip>
      <span className="success-detail">{targetLabel}</span>
    </article>
  );
}

// ============================================================
// Shared header / source line
// ============================================================

function CardHeader({
  ext,
  mode,
}: {
  ext: FieldExtraction;
  mode?: 'conflict';
}) {
  const targetLabel = labelFor(ext.targetAttribute);
  const entityLabel = entityDisplayName(ext.targetEntity);
  return (
    <header className="review-card-head">
      <div className="review-card-target">
        <span className="review-card-entity">{entityLabel}</span>
        <span className="review-card-arrow">→</span>
        <span className="review-card-attr">{targetLabel}</span>
      </div>
      {mode === 'conflict' && <Chip tone="coral">Conflict</Chip>}
    </header>
  );
}

function CardSourceLine({
  ext,
  document,
  onViewEvidence,
}: {
  ext: FieldExtraction;
  document: Document | undefined;
  onViewEvidence?: () => void;
}) {
  const docLabel = document?.label ?? document?.filename ?? 'Document';
  const pageSuffix = ext.evidencePageNumber !== undefined ? ` · p.${ext.evidencePageNumber}` : '';
  return (
    <div className="review-card-source">
      <button
        type="button"
        className="review-card-source-chip"
        onClick={onViewEvidence}
        title="View evidence"
      >
        {docLabel}
        {pageSuffix}
      </button>
      <ConfidencePill confidence={ext.confidence / 100} />
      {ext.method && <span className="review-card-method">{ext.method}</span>}
      <BandHint band={bandFor(ext.confidence / 100)} />
    </div>
  );
}

function BandHint({ band }: { band: 'high' | 'mid' | 'low' }): ReactNode {
  if (band === 'high') return null;
  return (
    <span className={`review-card-bandhint ${band}`}>
      {band === 'mid' ? 'Mid confidence — review' : 'Low confidence — verify'}
    </span>
  );
}

function entityDisplayName(entity: string): string {
  // Light alias map. Personal sub-entities all roll up into the
  // applicant label since the broker thinks of them as one person.
  if (entity === 'Person' || entity === 'Employment' || entity === 'AdverseHistory') {
    return 'Applicant';
  }
  return entity;
}
