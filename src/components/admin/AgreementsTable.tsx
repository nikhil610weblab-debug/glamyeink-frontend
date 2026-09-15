import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { AgreementStatusBadge } from './AgreementStatusBadge';
import type { SentAgreement } from '../../services/emailService';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

const COLUMNS: Column[] = [
  { key: 'documentName', label: 'Document', sortable: true },
  { key: 'recipientName', label: 'Recipient', sortable: true },
  { key: 'sender', label: 'Sender' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'signed', label: 'Signed' },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'pdf', label: 'PDF' },
];

interface Props {
  items: SentAgreement[];
  loading: boolean;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function NotificationBadge({ status }: { status?: 'pending' | 'sent' | 'failed' | null }) {
  if (!status) return null;
  const config = {
    sent: { label: 'Notification sent', className: 'text-[var(--success)]' },
    pending: { label: 'Notification pending', className: 'text-[var(--warning)]' },
    failed: { label: 'Notification failed', className: 'text-[var(--danger)]' },
  }[status];
  return <div className={clsx('text-[11px]', config.className)}>{config.label}</div>;
}

export function AgreementsTable({ items, loading, sortBy, sortDir, onSort }: Props) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)] text-[11.5px] uppercase tracking-wide text-[var(--text-muted)]">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-2.5 font-medium">
                {col.sortable ? (
                  <button className="flex items-center gap-1 hover:text-[var(--text-primary)]" onClick={() => onSort(col.key)}>
                    {col.label}
                    {sortBy === col.key ? (
                      sortDir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                Loading agreements…
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                No agreements match these filters.
              </td>
            </tr>
          ) : (
            items.map((a) => (
              <tr key={a.id} className="border-b border-[var(--border)] text-[13px] last:border-b-0 hover:bg-[var(--surface-secondary)]">
                <td className="max-w-[220px] truncate px-4 py-3 font-medium text-[var(--text-primary)]">{a.documentName}</td>
                <td className="px-4 py-3">
                  <div className="text-[var(--text-primary)]">{a.recipientName}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)]">{a.recipientEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-[var(--text-secondary)]">{a.senderName || '—'}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)]">{a.senderEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <AgreementStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  {a.status === 'completed' ? (
                    <>
                      <div className="text-[12.5px] text-[var(--text-primary)]">
                        {a.recipientName} · {formatDateTime(a.completedAt ?? null)}
                      </div>
                      <NotificationBadge status={a.adminNotificationStatus} />
                    </>
                  ) : (
                    <span className="text-[12.5px] text-[var(--text-muted)]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">{formatDateTime(a.createdAt)}</td>
                <td className="px-4 py-3">
                  <a
                    href={a.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--brand)] hover:underline',
                    )}
                  >
                    View <ExternalLink size={12} />
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
