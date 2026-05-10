import ConfidencePill from './ConfidencePill';

/**
 * One-line provenance footer. Used beneath every populated field
 * via the `<FieldRow />` component, but renderable on its own for
 * ad-hoc UI (header chips, audit-pack tooltips, etc.).
 *
 * `source` is either a document reference (compact label + page) or
 * one of the three meta-states the Standalone v3 footer supports:
 *  - `'manual'`         → "Manually entered · A. Okafor (broker)"
 *  - `'dip-locked'`     → "Locked at DIP · 22 Apr 2026"
 *  - `'updated-post-dip'` → "Updated · A. Okafor · 09 May 2026"
 *
 * Click anywhere on the footer fires `onClick`, which the source-
 * evidence drawer (Step 5) will hook up.
 */
export type ProvenanceMethod = 'AI text' | 'OCR-assisted' | 'manual';

export type ProvenanceSourceMeta =
  | 'manual'
  | 'dip-locked'
  | 'updated-post-dip';

export interface ProvenanceDocSource {
  /** Filename / compact label, e.g. `payslip-march-daniel.pdf`. */
  documentLabel: string;
  /** Page number (1-indexed). */
  pageNumber?: number;
}

export interface ProvenanceProps {
  source: ProvenanceDocSource | ProvenanceSourceMeta;
  /** 0–1. Only rendered for document-source provenance. */
  confidence?: number;
  extractionMethod?: ProvenanceMethod;
  /** "A. Okafor (broker)" — for manual / updated-post-dip states. */
  enteredBy?: string;
  /** ISO date — for manual / updated-post-dip states. Pre-formatted. */
  enteredAt?: string;
  /** ISO date — for dip-locked. */
  lockedAt?: string;
  /** Click → opens the source-evidence drawer (Step 5). */
  onClick?: () => void;
  /** Doc-source variant only — appends "overridden by broker" to flag
   *  that the broker manually replaced the extracted value while
   *  preserving the document lineage. (Step 15) */
  overridden?: boolean;
  className?: string;
}

function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Provenance({
  source,
  confidence,
  extractionMethod,
  enteredBy,
  enteredAt,
  lockedAt,
  onClick,
  overridden,
  className,
}: ProvenanceProps) {
  // Step 15: pure manual entries leave no footer. Document, Locked,
  // Derived, manual-override (carried as doc-source + `overridden`),
  // and updated-post-dip continue to render.
  if (source === 'manual') return null;

  const interactive = !!onClick;
  const cls = [
    'prov',
    interactive ? 'is-clickable' : '',
    typeof source === 'string' ? `meta-${source}` : 'src-doc',
    overridden ? 'is-overridden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Wrapper: 'button' | 'div' = interactive ? 'button' : 'div';

  return (
    <Wrapper
      className={cls}
      onClick={interactive ? onClick : undefined}
      type={interactive ? 'button' : undefined}
    >
      {typeof source === 'string'
        ? renderMeta(source, { enteredBy, enteredAt, lockedAt })
        : renderDoc(source, { confidence, extractionMethod, overridden })}
    </Wrapper>
  );
}

function renderDoc(
  src: ProvenanceDocSource,
  opts: {
    confidence?: number;
    extractionMethod?: ProvenanceMethod;
    overridden?: boolean;
  },
) {
  const pageSuffix =
    src.pageNumber !== undefined ? ` · p.${src.pageNumber}` : '';
  return (
    <>
      <span className="src">
        {src.documentLabel}
        {pageSuffix}
      </span>
      {opts.confidence !== undefined && (
        <>
          <span className="sep">·</span>
          <ConfidencePill confidence={opts.confidence} />
        </>
      )}
      {opts.extractionMethod && (
        <>
          <span className="sep">·</span>
          <span className="method">{opts.extractionMethod}</span>
        </>
      )}
      {opts.overridden && (
        <>
          <span className="sep">·</span>
          <span className="overridden-flag">overridden by broker</span>
        </>
      )}
    </>
  );
}

function renderMeta(
  meta: ProvenanceSourceMeta,
  opts: { enteredBy?: string; enteredAt?: string; lockedAt?: string },
) {
  const date = formatDate(meta === 'dip-locked' ? opts.lockedAt : opts.enteredAt);
  if (meta === 'manual') {
    return (
      <span className="src">
        Manually entered{opts.enteredBy ? ` · ${opts.enteredBy}` : ''}
        {date ? ` · ${date}` : ''}
      </span>
    );
  }
  if (meta === 'dip-locked') {
    return (
      <span className="src">
        Locked at DIP{date ? ` · ${date}` : ''}
      </span>
    );
  }
  return (
    <span className="src">
      Updated post-DIP{opts.enteredBy ? ` · ${opts.enteredBy}` : ''}
      {date ? ` · ${date}` : ''}
    </span>
  );
}
