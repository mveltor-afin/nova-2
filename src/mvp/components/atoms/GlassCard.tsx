import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Glass-card wrapper. The Standalone v3 glass recipe lives entirely
 * in CSS (`.glass-card` in workspace.css) so any layout primitive
 * (section, article, div) can opt in. The component just wires the
 * class names and forwards everything else through.
 */
export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Padding scale. Defaults to `md` (20px). */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Background opacity. `default` ≈ 0.7, `strong` ≈ 0.85. */
  tone?: 'default' | 'strong' | 'soft';
  children?: ReactNode;
}

const PAD_CLASS: Record<NonNullable<GlassCardProps['padding']>, string> = {
  none: 'pad-none',
  sm: 'pad-sm',
  md: 'pad-md',
  lg: 'pad-lg',
};

export default function GlassCard({
  padding = 'md',
  tone = 'default',
  className,
  children,
  ...rest
}: GlassCardProps) {
  const cls = [
    'glass-card',
    PAD_CLASS[padding],
    tone !== 'default' ? `tone-${tone}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
