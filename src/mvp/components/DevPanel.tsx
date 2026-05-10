import { useEffect } from 'react';
import { useCaseStore } from '../store/caseStore';
import { FIXTURE_IDS, type DevDIPState, type DevDocState } from '../mock/fixtures';
import type { DIPOutcomeStrategy } from '../tabs/products/dipResults';
import {
  FULL_APP_STAGES,
  FULL_APP_STAGE_LABELS,
  type Phase,
  type FullAppStage,
} from '../model/case';

const DIP_OPTIONS: { value: DevDIPState; label: string }[] = [
  { value: 'not-submitted', label: 'DIP not submitted' },
  { value: 'pending', label: 'DIP pending' },
  { value: 'success', label: 'DIP success' },
  { value: 'fail', label: 'DIP fail' },
  { value: 'full-app', label: 'Full app' },
];

const DOC_OPTIONS: { value: DevDocState; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'classifying', label: 'Classifying' },
  { value: 'ocr', label: 'OCR' },
  { value: 'extracting', label: 'Extracting' },
  { value: 'done', label: 'Done' },
];

const OUTCOME_OPTIONS: { value: DIPOutcomeStrategy; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'approved', label: 'Approve' },
  { value: 'declined', label: 'Decline' },
  { value: 'referred', label: 'Refer' },
];

const PHASE_OPTIONS: { value: Phase; label: string }[] = [
  { value: 'dip', label: 'DIP' },
  { value: 'full-application', label: 'Full application' },
  { value: 'disbursed', label: 'Disbursed' },
];

/**
 * Floating dev panel for screenshot-driving review. Hidden by default;
 * toggle with Cmd+Shift+D (or Ctrl+Shift+D on non-Mac). Mutations
 * apply to the canonical Okafor case in the store.
 */
export default function DevPanel() {
  const dev = useCaseStore((s) => s.dev);
  const setOpen = useCaseStore((s) => s.setDevPanelOpen);
  const setDIPState = useCaseStore((s) => s.setDIPState);
  const setDocState = useCaseStore((s) => s.setDocState);
  const toggleConflict = useCaseStore((s) => s.toggleConflict);
  const openDrawer = useCaseStore((s) => s.openDrawer);
  const setNextDIPOutcome = useCaseStore((s) => s.setNextDIPOutcome);
  const setTimelineForceLoading = useCaseStore(
    (s) => s.setTimelineForceLoading,
  );
  const setMessagesForceLoading = useCaseStore(
    (s) => s.setMessagesForceLoading,
  );
  const setMessagesShowTyping = useCaseStore(
    (s) => s.setMessagesShowTyping,
  );
  const phase = useCaseStore((s) => s.case.phase);
  const fullAppStage = useCaseStore((s) => s.case.fullAppStage);
  const setPhase = useCaseStore((s) => s.setPhase);
  const advanceFullAppStage = useCaseStore((s) => s.advanceFullAppStage);
  const regressFullAppStage = useCaseStore((s) => s.regressFullAppStage);

  // Cmd+Shift+D / Ctrl+Shift+D hotkey.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setOpen(!useCaseStore.getState().dev.isOpen);
      }
      if (e.key === 'Escape' && useCaseStore.getState().dev.isOpen) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  if (!dev.isOpen) {
    return (
      <button
        type="button"
        className="nova-dev-fab"
        onClick={() => setOpen(true)}
        aria-label="Open dev panel"
        title="Dev panel · Cmd+Shift+D"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="nova-dev-panel" role="dialog" aria-label="Dev panel">
      <div className="nova-dev-head">
        <span>Dev panel</span>
        <button
          type="button"
          className="nova-dev-close"
          onClick={() => setOpen(false)}
          aria-label="Close dev panel"
        >
          ×
        </button>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Case stage</div>
        <div className="nova-dev-segments" role="radiogroup">
          {DIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={dev.dipState === opt.value}
              className={`nova-dev-seg ${dev.dipState === opt.value ? 'active' : ''}`}
              onClick={() => setDIPState(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Case phase</div>
        <div className="nova-dev-segments" role="radiogroup">
          {PHASE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={phase === opt.value}
              className={`nova-dev-seg ${phase === opt.value ? 'active' : ''}`}
              onClick={() => setPhase(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {phase === 'full-application' && (
          <div className="nova-dev-segments" role="radiogroup" style={{ marginTop: 6 }}>
            {FULL_APP_STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                role="radio"
                aria-checked={fullAppStage === stage}
                className={`nova-dev-seg ${fullAppStage === stage ? 'active' : ''}`}
                onClick={() => setPhase('full-application', stage as FullAppStage)}
              >
                {FULL_APP_STAGE_LABELS[stage]}
              </button>
            ))}
          </div>
        )}
        <div className="nova-dev-segments" style={{ marginTop: 6 }}>
          <button
            type="button"
            className="nova-dev-seg"
            onClick={regressFullAppStage}
          >
            ← Regress
          </button>
          <button
            type="button"
            className="nova-dev-seg"
            onClick={advanceFullAppStage}
          >
            Advance →
          </button>
        </div>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">
          Document state · chioma-passport-scan.heic
        </div>
        <div className="nova-dev-segments" role="radiogroup">
          {DOC_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={dev.docState === opt.value}
              className={`nova-dev-seg ${dev.docState === opt.value ? 'active' : ''}`}
              onClick={() => setDocState(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="nova-dev-section">
        <label className="nova-dev-toggle">
          <input
            type="checkbox"
            checked={dev.conflictInjected}
            onChange={toggleConflict}
          />
          <span>Inject salary conflict (payslip vs bank statement)</span>
        </label>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Next DIP outcome</div>
        <div className="nova-dev-segments" role="radiogroup">
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={dev.nextDIPOutcome === opt.value}
              className={`nova-dev-seg ${dev.nextDIPOutcome === opt.value ? 'active' : ''}`}
              onClick={() => setNextDIPOutcome(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {dev.nextDIPOutcome === 'auto' && (
          <div className="nova-dev-hint">
            Auto rotates Approve → Decline → Refer per run.
          </div>
        )}
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Drawers</div>
        <div className="nova-dev-segments">
          <button
            type="button"
            className="nova-dev-seg"
            onClick={() => openDrawer({ kind: 'field-review' })}
          >
            Field review
          </button>
          <button
            type="button"
            className="nova-dev-seg"
            onClick={() =>
              openDrawer({
                kind: 'source-evidence',
                documentId: FIXTURE_IDS.docPayslip,
                pageNumber: 1,
                snippet: 'Basic Pay: £4,250.00\nDate: 27 March 2026',
                extractionId: FIXTURE_IDS.extDanielSalaryPayslip,
              })
            }
          >
            Source evidence
          </button>
          <button
            type="button"
            className="nova-dev-seg"
            onClick={() =>
              openDrawer({
                kind: 'conflict-resolver',
                targetEntity: 'Employment',
                targetEntityId: FIXTURE_IDS.personDaniel,
                targetAttribute: 'A51',
              })
            }
          >
            Conflict
          </button>
        </div>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Timeline</div>
        <label className="nova-dev-toggle">
          <input
            type="checkbox"
            checked={dev.timelineForceLoading}
            onChange={(e) => setTimelineForceLoading(e.target.checked)}
          />
          <span>Force loading state</span>
        </label>
      </div>

      <div className="nova-dev-section">
        <div className="nova-dev-section-title">Messages</div>
        <label className="nova-dev-toggle">
          <input
            type="checkbox"
            checked={dev.messagesForceLoading}
            onChange={(e) => setMessagesForceLoading(e.target.checked)}
          />
          <span>Force loading state</span>
        </label>
        <label className="nova-dev-toggle">
          <input
            type="checkbox"
            checked={dev.messagesShowTyping}
            onChange={(e) => setMessagesShowTyping(e.target.checked)}
          />
          <span>Show typing indicator</span>
        </label>
      </div>

      <div className="nova-dev-foot">Toggle · ⌘⇧D</div>
    </div>
  );
}
