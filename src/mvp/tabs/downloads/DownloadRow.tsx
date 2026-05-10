import type { ReactNode } from 'react';

/**
 * One row in the Downloads tab. 38px icon, filename + reference
 * subtext, date column, source eyebrow chip, Download button.
 *
 * Parked rows (Mortgage offer T&Cs, Audit pack pre-submission) carry
 * `parked` opacity treatment + "Not yet available" status.
 */

export interface DownloadRowProps {
  filename: string;
  reference: string;
  date: string;
  source: 'Generated' | 'Lender' | 'Pulled';
  parked?: boolean;
  parkedReason?: string;
  icon?: ReactNode;
  onDownload?: () => void;
}

export default function DownloadRow({
  filename,
  reference,
  date,
  source,
  parked,
  parkedReason,
  icon,
  onDownload,
}: DownloadRowProps) {
  return (
    <article className={`download-row ${parked ? 'parked' : ''}`}>
      <div className="download-icon">{icon ?? DEFAULT_ICON}</div>
      <div className="download-text">
        <div className="download-filename">{filename}</div>
        <div className="download-ref">{reference}</div>
      </div>
      <div className="download-date">{date}</div>
      <span className="download-source">{source}</span>
      <div className="download-action">
        {parked ? (
          <span className="download-parked">
            {parkedReason ?? 'Not yet available'}
          </span>
        ) : (
          <button
            type="button"
            className="download-btn"
            onClick={onDownload}
          >
            Download
          </button>
        )}
      </div>
    </article>
  );
}

const DEFAULT_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
