import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FieldShell({ label, hint, error, children, htmlFor }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-[var(--text-xs)] font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[var(--text-xs)] text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-[var(--text-xs)] text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 text-[var(--text-base)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors duration-[var(--duration-fast)] focus:border-[var(--brand)] focus:shadow-[var(--shadow-focus)] disabled:opacity-50 disabled:bg-[var(--surface-secondary)]';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input ref={ref} className={clsx(inputBase, 'h-8', className)} {...rest} />
  ),
);
TextInput.displayName = 'TextInput';

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea ref={ref} className={clsx(inputBase, 'py-2 resize-none', className)} {...rest} />
  ),
);
TextArea.displayName = 'TextArea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select ref={ref} className={clsx(inputBase, 'h-8 pr-7 bg-[var(--surface)] appearance-none', className)} {...rest}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-[var(--duration-fast)]',
        checked ? 'bg-[var(--brand)]' : 'bg-[var(--border-strong)]',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-[var(--duration-fast)]',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
