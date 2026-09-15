import clsx from 'clsx';

const CONFIG: Record<string, { label: string; className: string }> = {
  sent: { label: 'Sent', className: 'bg-[var(--warning-tint)] text-[var(--warning)]' },
  viewed: { label: 'Viewed', className: 'bg-[var(--info-tint)] text-[var(--info)]' },
  completed: { label: 'Completed', className: 'bg-[var(--success-tint)] text-[var(--success)]' },
  failed: { label: 'Failed', className: 'bg-[var(--danger-tint)] text-[var(--danger)]' },
};

export function AgreementStatusBadge({ status }: { status: string }) {
  const c = CONFIG[status] ?? { label: status, className: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]' };
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', c.className)}>
      {c.label}
    </span>
  );
}
