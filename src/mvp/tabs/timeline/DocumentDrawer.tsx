import { useEffect, useRef, useState } from 'react';
import { absTime, formatRel } from './helpers';
import type { DrawerSourceContext, TimelineDoc } from './types';

export interface DocumentDrawerProps {
  doc: TimelineDoc;
  source: DrawerSourceContext;
  onClose: () => void;
}

type DrawerTab = 'details' | 'versions' | 'source';

const STUB = (action: string) =>
  console.warn(`[Timeline stub] ${action} not wired`);

export default function DocumentDrawer({
  doc,
  source,
  onClose,
}: DocumentDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('details');
  const [confirmed, setConfirmed] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="timeline-drawer-backdrop is-open"
      onClick={onClose}
      role="presentation"
    >
      <aside
        ref={drawerRef}
        className="timeline-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-label={`Document ${doc.name}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="timeline-drawer__head">
          <span className="timeline-drawer__ftype">{doc.type}</span>
          <div className="timeline-drawer__titles">
            <div className="timeline-drawer__name">{doc.name}</div>
            <div className="timeline-drawer__sub">
              {doc.size}
              {doc.pages !== undefined ? ` · ${doc.pages} pages` : ''} · {doc.version}
            </div>
          </div>
          <button
            type="button"
            className="timeline-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        </header>

        <div className="timeline-drawer__preview">
          <div className="timeline-drawer__preview-pdf">
            <span className="timeline-drawer__preview-corner top">
              {doc.type} preview
            </span>
            <span className="timeline-drawer__preview-corner bottom">
              Page 1 / {doc.pages ?? 1}
            </span>
            <span className="timeline-drawer__preview-stub">
              Mocked preview · {doc.name}
            </span>
          </div>
        </div>

        <nav className="timeline-drawer__tabs" role="tablist">
          {(
            [
              { id: 'details', label: 'Details' },
              { id: 'versions', label: 'Versions' },
              { id: 'source', label: 'Source' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`timeline-drawer__tab ${tab === t.id ? 'is-on' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="timeline-drawer__content">
          {tab === 'details' && (
            <DetailsTab
              doc={doc}
              source={source}
              confirmed={confirmed}
              onConfirm={() => setConfirmed(true)}
            />
          )}
          {tab === 'versions' && <VersionsTab doc={doc} />}
          {tab === 'source' && <SourceTab source={source} />}
        </div>

        <footer className="timeline-drawer__foot">
          <button
            type="button"
            className="timeline-drawer__foot-btn primary"
            onClick={() => STUB('Download')}
          >
            Download
          </button>
          <button
            type="button"
            className="timeline-drawer__foot-btn ghost-right"
            onClick={() => STUB('Open in viewer')}
          >
            Open in viewer
          </button>
        </footer>
      </aside>
    </div>
  );
}

function DetailsTab({
  doc,
  source,
  confirmed,
  onConfirm,
}: {
  doc: TimelineDoc;
  source: DrawerSourceContext;
  confirmed: boolean;
  onConfirm: () => void;
}) {
  return (
    <>
      <dl className="timeline-drawer__kv">
        <div>
          <dt>Type</dt>
          <dd>{doc.type}</dd>
        </div>
        <div>
          <dt>Size</dt>
          <dd>{doc.size}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{doc.version}</dd>
        </div>
        <div>
          <dt>Pages</dt>
          <dd>{doc.pages ?? '—'}</dd>
        </div>
        <div>
          <dt>Uploaded by</dt>
          <dd>{doc.who ?? source.sourceWho}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{source.sourceTitle}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd>
            {formatRel(source.sourceTs)} · {absTime(source.sourceTs)}
          </dd>
        </div>
        <div>
          <dt>SHA-256</dt>
          <dd className="timeline-drawer__sha">
            f7c1…{doc.name.slice(0, 4)}…{doc.size.replace(/\s/g, '')}
          </dd>
        </div>
      </dl>

      {doc.aiClass && (
        <div
          className={`timeline-drawer__ai-card ${
            confirmed ? 'is-confirmed' : ''
          }`}
        >
          <div className="timeline-drawer__ai-head">
            <span className="timeline-badge ai">AI</span>
            <span>
              Auto-classified as <strong>{doc.aiClass}</strong> ·{' '}
              {confidenceFor(doc.aiClass)}% confidence
            </span>
          </div>
          {!confirmed ? (
            <>
              <p className="timeline-drawer__ai-body">
                Confirm classification to file this under {doc.aiClass} in the
                case Documents panel.
              </p>
              <div className="timeline-drawer__ai-actions">
                <button
                  type="button"
                  className="timeline-drawer__ai-btn primary"
                  onClick={onConfirm}
                >
                  Confirm &amp; file
                </button>
                <button
                  type="button"
                  className="timeline-drawer__ai-btn"
                  onClick={() => STUB('Reclassify')}
                >
                  Reclassify…
                </button>
              </div>
            </>
          ) : (
            <p className="timeline-drawer__ai-confirmed">
              ✓ Confirmed · added to Documents panel
            </p>
          )}
        </div>
      )}
    </>
  );
}

function VersionsTab({ doc }: { doc: TimelineDoc }) {
  return (
    <div className="timeline-drawer__versions">
      <div className="timeline-drawer__version-row is-current">
        <div>
          <div className="timeline-drawer__version-name">{doc.name}</div>
          <div className="timeline-drawer__version-meta">
            {doc.version} · {doc.size}
          </div>
        </div>
        <span className="timeline-drawer__version-pill current">current</span>
      </div>
      {doc.version === 'v2' && (
        <div className="timeline-drawer__version-row is-archived">
          <div>
            <div className="timeline-drawer__version-name">{doc.name}</div>
            <div className="timeline-drawer__version-meta">
              v1 · archived · reason: corrected secondary applicant address
            </div>
          </div>
          <span className="timeline-drawer__version-pill archived">
            archived
          </span>
        </div>
      )}
    </div>
  );
}

function SourceTab({ source }: { source: DrawerSourceContext }) {
  return (
    <div className="timeline-drawer__source-card">
      <div className="timeline-drawer__source-eyebrow">Originated from</div>
      <div className="timeline-drawer__source-title">{source.sourceTitle}</div>
      <div className="timeline-drawer__source-meta">
        {source.sourceWho} · {formatRel(source.sourceTs)} · {absTime(source.sourceTs)}
      </div>
      <button
        type="button"
        className="timeline-drawer__source-link"
        onClick={() => STUB('Jump to event in timeline')}
      >
        Jump to event in timeline →
      </button>
    </div>
  );
}

function confidenceFor(aiClass: string): number {
  const seed = aiClass
    .split('')
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  return 88 + (seed % 10);
}
