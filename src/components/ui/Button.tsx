import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] disabled:opacity-50',
  secondary:
    'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40',
  danger:
    'bg-[var(--danger)] text-white hover:opacity-90 disabled:opacity-50',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12.5px] gap-1.5',
  md: 'h-9 px-3.5 text-[13.5px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon, className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-[var(--radius-sm)] font-medium transition-colors duration-[var(--duration-fast)] whitespace-nowrap select-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
