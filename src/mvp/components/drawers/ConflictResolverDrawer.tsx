import { useState } from 'react';
import Drawer from './Drawer';
import { ConfidencePill, Chip } from '../atoms';
import { useCaseStore, type DrawerState } from '../../store/caseStore';
import { labelFor } from '../../model/registerLabels';
import type { FieldExtraction } from '../../model/extraction';
import type { Document } from '../../model/document';

/**
 * Conflict resolution drawer. Side-by-side cards for each competing
 * extraction; four resolution actions:
 *  - Use Source A / Use Source B  (resolveConflict)
 *  - Enter different value         (override new "manual" extraction)
 *  - Mark — not actually a conflict (accepts both, marks others as accepted)
 */
export default function ConflictResolverDrawer() {
  const drawer = useCaseStore((s) => s.drawer);
  const closeDrawer = useCaseStore((s) => s.closeDrawer);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const allExtractions = useCaseStore((s) => s.case.extractions);
  const allDocuments = useCaseStore((s) => s.case.documents);
  const resolveConflict = useCaseStore((s) => s.resolveConflict);
  const overrideExtraction = useCaseStore((s) => s.overrideExtraction);
  const acceptExtraction = useCaseStore((s) => s.acceptExtraction);

  const [manualValue, setManualValue] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  if (drawer.kind !== 'conflict-resolver') return null;
  // Pull the discriminated fields into locals so TypeScript keeps the
  // narrowing across the closures below.
  const { targetEntity, targetEntityId, targetAttribute } = drawer;

  const competing = allExtractions.filter(
    (e) =>
      e.targetEntity === targetEntity &&
      e.targetEntityId === targetEntityId &&
      e.targetAttribute === targetAttribute,
  );

  if (competing.length < 2) {
    return (
      <Drawer title="Resolve conflict" onClose={closeDrawer} width={480}>
        <div className="conflict-empty">
          The competing extractions for this field have already been resolved.
        </div>
      </Drawer>
    );
  }

  const [a, b] = competing;
  const docA = allDocuments.find((d) => d.uuid === a.documentId);
  const docB = allDocuments.find((d) => d.uuid === b.documentId);

  function viewEvidence(extraction: FieldExtraction) {
    openDrawer({
      kind: 'source-evidence',
      documentId: extraction.documentId,
      pageNumber: extraction.evidencePageNumber,
      snippet: extraction.evidenceSnippet,
      extractionId: extraction.uuid,
    } satisfies DrawerState);
  }

  function chooseSource(chosen: FieldExtraction) {
    resolveConflict(targetEntity, targetEntityId, targetAttribute, chosen.uuid);
    closeDrawer();
  }

  function submitManual() {
    if (!manualValue.trim()) return;
    // Override the first competing extraction with the manual value;
    // mark the rest as Rejected via resolveConflict on a non-existent UUID
    // would clear them, but we want them all rejected and the broker's
    // value to win. Easier: reject everything, then override one row.
    competing.forEach((e) => {
      if (e.uuid === a.uuid) {
        overrideExtraction(e.uuid, manualValue, manualValue);
      } else {
        // resolveConflict will reject the others, but we already overrode
        // a; just call rejectExtraction directly.
        useCaseStore.getState().rejectExtraction(e.uuid);
      }
    });
    closeDrawer();
  }

  function markNotAConflict() {
    // Accept all competing extractions. Audit will note the duplicate.
    competing.forEach((e) => acceptExtraction(e.uuid));
    closeDrawer();
  }

  return (
    <Drawer
      title={`Resolve · ${labelFor(targetAttribute)}`}
      subtitle={
        <>
          Two sources disagree. Pick one, enter your own, or mark this as
          a duplicate.
        </>
      }
      width={480}
      onClose={closeDrawer}
      variant="conflict-resolver-drawer"
      footer={
        <div className="conflict-foot">
          <button
            type="button"
            className="conflict-foot-link"
            onClick={markNotAConflict}
          >
            Mark — not actually a conflict
          </button>
          <button type="button" className="conflict-foot-cancel" onClick={closeDrawer}>
            Cancel
          </button>
        </div>
      }
    >
      <div className="conflict-grid">
        <ConflictColumn
          ext={a}
          document={docA}
          sideLabel="Source A"
          onView={() => viewEvidence(a)}
          onUse={() => chooseSource(a)}
        />
        <ConflictColumn
          ext={b}
          document={docB}
          sideLabel="Source B"
          onView={() => viewEvidence(b)}
          onUse={() => chooseSource(b)}
        />
      </div>

      <div className="conflict-divider"><span>or</span></div>

      <div className="conflict-manual">
        {showManualInput ? (
          <>
            <label className="conflict-manual-label" htmlFor="conflict-manual-input">
              Enter the correct value
            </label>
            <input
              id="conflict-manual-input"
              type="text"
              className="conflict-manual-input"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              autoFocus
            />
            <div className="conflict-manual-actions">
              <button
                type="button"
                className="conflict-manual-save"
                onClick={submitManual}
                disabled={!manualValue.trim()}
              >
                Save
              </button>
              <button
                type="button"
                className="conflict-manual-cancel"
                onClick={() => {
                  setShowManualInput(false);
                  setManualValue('');
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="conflict-manual-trigger"
            onClick={() => setShowManualInput(true)}
          >
            Enter different value
          </button>
        )}
      </div>
    </Drawer>
  );
}

function ConflictColumn({
  ext,
  document,
  sideLabel,
  onView,
  onUse,
}: {
  ext: FieldExtraction;
  document: Document | undefined;
  sideLabel: string;
  onView: () => void;
  onUse: () => void;
}) {
  return (
    <article className="conflict-col">
      <header className="conflict-col-head">
        <Chip tone="neutral">{sideLabel}</Chip>
      </header>
      <div className="conflict-col-value">
        {ext.proposedValueDisplay ?? String(ext.proposedValue ?? '—')}
      </div>
      <button
        type="button"
        className="conflict-col-evidence"
        onClick={onView}
      >
        <div className="conflict-col-doc">
          {document?.label ?? document?.filename ?? 'Document'}
          {ext.evidencePageNumber !== undefined ? ` · p.${ext.evidencePageNumber}` : ''}
        </div>
        {ext.evidenceSnippet && (
          <div className="conflict-col-snippet">{ext.evidenceSnippet}</div>
        )}
        <div className="conflict-col-evidence-cta">View evidence</div>
      </button>
      <div className="conflict-col-meta">
        <ConfidencePill confidence={ext.confidence / 100} />
        {ext.method && <span className="conflict-col-method">{ext.method}</span>}
      </div>
      <button type="button" className="conflict-col-use" onClick={onUse}>
        Use {sideLabel}
      </button>
    </article>
  );
}
