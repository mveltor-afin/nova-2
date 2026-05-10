import { GlassCard } from '../../components/atoms';
import ManualEntry from './ManualEntry';

/**
 * Single card spanning the full width with two columns side-by-side
 * separated by a 1px vertical rule. Per the v3 spec — manual entry
 * stays on the right (do not rearrange).
 */
export default function TwoModeEntry() {
  return (
    <GlassCard padding="lg" className="qi-two-mode" tone="strong">
      <div className="qi-upload-col">
        <div className="qi-upload-icon" aria-hidden="true">
          {UPLOAD_ICON}
        </div>
        <h3 className="qi-col-title">Upload documents</h3>
        <p className="qi-col-sub">
          Drop fact-find, payslips, ID — Nova extracts and routes the data.
        </p>
        <button type="button" className="dz-browse">
          Browse files
        </button>
      </div>

      <div className="qi-divider" aria-hidden="true" />

      <div className="qi-manual-col">
        <h3 className="qi-col-title">Or enter details manually</h3>
        <p className="qi-col-sub">
          Key in the essentials — expand any section to fill fields directly.
        </p>
        <ManualEntry />
      </div>
    </GlassCard>
  );
}

const UPLOAD_ICON = (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
