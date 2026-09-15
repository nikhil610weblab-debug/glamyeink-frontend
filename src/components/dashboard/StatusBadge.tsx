import clsx from 'clsx';
import type { DocumentStatus } from '../../types/document';

const CONFIG: Record<DocumentStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-[var(--surface-secondary)] text-[var(--text-secondary)]' },
  ready: { label: 'Ready to send', className: 'bg-[var(--info-tint)] text-[var(--info)]' },
  sent: { label: 'Sent', className: 'bg-[var(--warning-tint)] text-[var(--warning)]' },
  viewed: { label: 'Viewed', className: 'bg-[var(--info-tint)] text-[var(--info)]' },
  signed: { label: 'Signed', className: 'bg-[var(--brand-tint)] text-[var(--brand)]' },
  completed: { label: 'Completed', className: 'bg-[var(--success-tint)] text-[var(--success)]' },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const c = CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', c.className)}>
      {c.label}
    </span>
  );
}
