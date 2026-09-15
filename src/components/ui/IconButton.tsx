import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
  size?: 'sm' | 'md';
  tone?: 'default' | 'chrome';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ active, label, size = 'md', tone = 'default', className, children, ...rest }, ref) => {
    const dims = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
    const toneClasses =
      tone === 'chrome'
        ? active
          ? 'bg-[var(--brand)] text-white'
          : 'text-[var(--chrome-text-muted)] hover:bg-[var(--chrome-bg-raised)] hover:text-[var(--chrome-text)]'
        : active
          ? 'bg-[var(--brand-tint)] text-[var(--brand)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]';

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={clsx(
          'inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)] disabled:opacity-40 disabled:pointer-events-none',
          dims,
          toneClasses,
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
