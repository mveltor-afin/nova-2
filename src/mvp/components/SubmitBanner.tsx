import { useEffect } from 'react';
import { useCaseStore } from '../store/caseStore';

/**
 * Inline success banner shown at the top of the main column after the
 * broker confirms submission. Auto-dismisses after 6 seconds; click ×
 * to dismiss earlier. Stays in the layout (not floating) so the
 * ContextHeader nudges down — the broker can't miss it.
 */
export default function SubmitBanner() {
  const visible = useCaseStore((s) => s.submitBannerVisible);
  const dismiss = useCaseStore((s) => s.dismissSubmitBanner);

  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(dismiss, 6000);
    return () => window.clearTimeout(t);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div className="submit-banner" role="status">
      <div className="submit-banner-inner">
        <span className="submit-banner-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <div className="submit-banner-text">
          <strong>Application submitted to underwriter.</strong> Audit pack
          generated; the case is now read-only on review surfaces.
        </div>
        <button
          type="button"
          className="submit-banner-close"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
