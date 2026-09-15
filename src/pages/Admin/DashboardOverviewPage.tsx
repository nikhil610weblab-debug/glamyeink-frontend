import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Send, Clock, CheckCircle2, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { AgreementStatusBadge } from '../../components/admin/AgreementStatusBadge';
import { IconButton } from '../../components/ui/IconButton';
import { useToast } from '../../components/ui/Toast';
import { fetchDashboardStats, SessionExpiredError, type DashboardStats } from '../../services/adminService';

const STATUS_COLORS: Record<string, string> = {
  sent: 'var(--brand)',
  pending: 'var(--warning)',
  completed: 'var(--success)',
  failed: 'var(--danger)',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function DashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    setError(null);
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => {
        if (err instanceof SessionExpiredError) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.message);
        toast.show({ tone: 'error', title: 'Could not load dashboard', description: err.message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusEntries = Object.entries(stats?.statusCounts ?? {});
  const maxStatus = Math.max(1, ...statusEntries.map(([, count]) => count));

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">An overview of agreements and recipients across GlamyeInk.</p>
        </div>
        <IconButton label="Refresh" onClick={load}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </IconButton>
      </div>

      {error && !loading && (
        <div className="mb-4 rounded-[var(--radius-sm)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-[13px] text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-secondary)]" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total agreements" value={stats.totalAgreements} icon={<FileText size={15} />} tone="brand" />
            <StatCard label="Sent" value={stats.sent} icon={<Send size={15} />} tone="default" />
            <StatCard label="Pending" value={stats.pending} icon={<Clock size={15} />} tone="warning" />
            <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={15} />} tone="success" />
            <StatCard label="Recipients" value={stats.totalUsers} icon={<Users size={15} />} tone="default" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:col-span-1">
              <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                <TrendingUp size={14} /> Status distribution
              </div>
              {statusEntries.length === 0 ? (
                <p className="py-6 text-center text-[12.5px] text-[var(--text-muted)]">No agreements yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {statusEntries.map(([status, count]) => (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-[12px]">
                        <span className="capitalize text-[var(--text-secondary)]">{status}</span>
                        <span className="font-medium text-[var(--text-primary)]">{count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(count / maxStatus) * 100}%`, background: STATUS_COLORS[status] ?? 'var(--brand)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[11.5px] text-[var(--text-muted)]">{stats.recentCount} created in the last 7 days.</p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:col-span-2">
              <div className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Latest agreements</div>
              {stats.latestAgreements.length === 0 ? (
                <p className="py-6 text-center text-[12.5px] text-[var(--text-muted)]">Nothing sent yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-[var(--border)]">
                  {stats.latestAgreements.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-[var(--text-primary)]">{a.documentName}</div>
                        <div className="truncate text-[11.5px] text-[var(--text-muted)]">{a.recipientName} · {a.recipientEmail}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <AgreementStatusBadge status={a.status} />
                        <span className="whitespace-nowrap text-[11px] text-[var(--text-muted)]">{formatDate(a.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 text-[13px] font-semibold text-[var(--text-primary)]">Recent activity</div>
            {stats.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-[12.5px] text-[var(--text-muted)]">No activity recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {stats.recentActivity.map((item) => (
                  <li key={item.id} className="flex items-center gap-2.5 text-[12.5px] text-[var(--text-secondary)]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[item.status] ?? 'var(--brand)' }} />
                    <span className="truncate">
                      <strong className="font-medium text-[var(--text-primary)]">{item.documentName}</strong> was marked {item.status}
                    </span>
                    <span className="ml-auto shrink-0 whitespace-nowrap text-[11px] text-[var(--text-muted)]">{formatDate(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
