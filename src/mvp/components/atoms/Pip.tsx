/**
 * Tiny circular pip used inline in sub-tab labels and progress
 * summaries. Variants follow the Standalone v3 `.pip.<variant>`
 * pattern.
 */
export type PipVariant = 'empty' | 'partial' | 'done' | 'attention';

export interface PipProps {
  variant: PipVariant;
  /** Accessible label, e.g. "Applicants section complete". */
  label?: string;
  className?: string;
}

export default function Pip({ variant, label, className }: PipProps) {
  const cls = ['pip', variant, className].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
