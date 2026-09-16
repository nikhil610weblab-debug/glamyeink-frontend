import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { IconButton } from '../../components/ui/IconButton';
import { TextInput, Select } from '../../components/ui/Field';
import { Pagination } from '../../components/admin/Pagination';
import { useToast } from '../../components/ui/Toast';
import { fetchUsers, SessionExpiredError, type AdminUserRecord } from '../../services/adminService';

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'agreementCount', label: 'Agreements' },
  { key: 'createdAt', label: 'Joined', sortable: true },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function UsersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [items, setItems] = useState<AdminUserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<number | undefined>(undefined);

  function load() {
    setLoading(true);
    fetchUsers({ search, role, sortBy, sortDir, page, pageSize })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (err instanceof SessionExpiredError) {
          navigate('/admin/login', { replace: true });
          return;
        }
        toast.show({ tone: 'error', title: 'Could not load users', description: err.message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(load, 300);
    return () => window.clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role, sortBy, sortDir, page, pageSize]);

  useEffect(() => setPage(1), [search, role]);

  function handleSort(key: string) {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold">Users</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">Admins and recipients that have interacted with agreements.</p>
        </div>
        <IconButton label="Refresh" onClick={load}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </IconButton>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-[280px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <TextInput placeholder="Search name or email…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-[160px]">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="recipient">Recipient</option>
        </Select>
      </div>

      <div className="mb-4 overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border)] text-[11.5px] uppercase tracking-wide text-[var(--text-muted)]">
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-4 py-2.5 font-medium">
                  {col.sortable ? (
                    <button className="flex items-center gap-1 hover:text-[var(--text-primary)]" onClick={() => handleSort(col.key)}>
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
              <tr><td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">Loading users…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">No users match these filters.</td></tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] text-[13px] last:border-b-0 hover:bg-[var(--surface-secondary)]">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{u.name || '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-tint)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--brand)]">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-[var(--surface-secondary)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--text-secondary)]">
                        Recipient
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">{u.agreementCount}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        itemLabel="user"
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
