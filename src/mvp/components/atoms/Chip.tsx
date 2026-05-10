import type { ReactNode } from 'react';

/**
 * Small status chip. Tones cover the four product-eligibility colours
 * + neutral + the stone (dark) tone used for primary status pills.
 */
export type ChipTone = 'green' | 'amber' | 'coral' | 'neutral' | 'stone';

export interface ChipProps {
  tone: ChipTone;
  /** Optional small icon left of the label. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Chip({ tone, icon, children, className }: ChipProps) {
  const cls = ['chip', tone, className].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      {icon && <span className="chip-ico">{icon}</span>}
      {children}
    </span>
  );
}
