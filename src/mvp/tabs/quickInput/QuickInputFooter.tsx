import { useNavigate } from 'react-router-dom';

/**
 * Footer at the bottom of Quick input.
 *  Left  · "Skip — fill tabs manually"  (.skip-link)
 *  Right · "When you're done, head to Applicants…"  (.step-hint)
 */
export default function QuickInputFooter() {
  const navigate = useNavigate();

  return (
    <div className="qi-footer">
      <button
        type="button"
        className="skip-link"
        onClick={() => navigate('/applicants')}
      >
        Skip — fill tabs manually
      </button>

      <span className="step-hint">
        When you're done, head to{' '}
        <button
          type="button"
          className="step-hint-link"
          onClick={() => navigate('/applicants')}
        >
          Applicants
        </button>{' '}
        to finalise residuals <span className="step-hint-arrow">→</span>
      </span>
    </div>
  );
}
