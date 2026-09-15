import type { ReactNode } from 'react';
import clsx from 'clsx';

export function StatCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone?: 'default' | 'brand' | 'success' | 'warning' | 'danger';
}) {
  const toneColor: Record<string, string> = {
    default: 'var(--text-secondary)',
    brand: 'var(--brand)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--text-muted)]">{label}</span>
        <span
          className={clsx('flex h-7 w-7 items-center justify-center rounded-[8px]')}
          style={{ background: `color-mix(in srgb, ${toneColor[tone]} 14%, transparent)`, color: toneColor[tone] }}
        >
          {icon}
        </span>
      </div>
      <div className="text-[24px] font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
