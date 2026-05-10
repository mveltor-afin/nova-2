/**
 * Tiny inline confidence pill. Input is 0–1 (matching the
 * `Provenance.confidence` API in this codebase, where 0–100 lives
 * in the model and 0–1 is the prop convention used by atoms).
 *
 * Banding mirrors the Standalone v3 stylesheet:
 *   ≥ 0.90  → `.high`  (green)
 *   0.70–0.89 → `.mid`  (amber)
 *   < 0.70  → `.low`  (coral)
 */
export interface ConfidencePillProps {
  /** 0–1. */
  confidence: number;
  /** Optional override label (e.g. "review"). Defaults to "{n}%". */
  label?: string;
  className?: string;
}

export function bandFor(confidence: number): 'high' | 'mid' | 'low' {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'mid';
  return 'low';
}

export default function ConfidencePill({
  confidence,
  label,
  className,
}: ConfidencePillProps) {
  const band = bandFor(confidence);
  const text = label ?? `${Math.round(confidence * 100)}%`;
  const cls = ['conf-pill', band, className].filter(Boolean).join(' ');
  return <span className={cls}>{text}</span>;
}
