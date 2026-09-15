import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { AdminFiltersBar, type Filters } from '../../components/admin/AdminFiltersBar';
import { AgreementsTable } from '../../components/admin/AgreementsTable';
import { Pagination } from '../../components/admin/Pagination';
import { IconButton } from '../../components/ui/IconButton';
import { fetchAgreements, SessionExpiredError, type AgreementListResult } from '../../services/adminService';
import { useToast } from '../../components/ui/Toast';

const EMPTY_FILTERS: Filters = { search: '', status: '', dateFrom: '', dateTo: '', sender: '', recipient: '' };

export function AgreementsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [result, setResult] = useState<AgreementListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<number | undefined>(undefined);

  function load() {
    setLoading(true);
    fetchAgreements({ ...filters, sortBy, sortDir, page, pageSize })
      .then(setResult)
      .catch((err) => {
        if (err instanceof SessionExpiredError) {
          navigate('/admin/login', { replace: true });
          return;
        }
        toast.show({ tone: 'error', title: 'Could not load agreements', description: err.message });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(load, 300);
    return () => window.clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, pageSize, sortBy, sortDir]);

  useEffect(() => setPage(1), [filters]);

  function handleSort(key: string) {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Agreements</h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Every agreement sent from the editor, with its stored PDF, recipient, and delivery status.
          </p>
        </div>
        <IconButton label="Refresh" onClick={load}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </IconButton>
      </div>

      <div className="mb-4">
        <AdminFiltersBar filters={filters} onChange={setFilters} statusCounts={result?.statusCounts ?? {}} />
      </div>

      <div className="mb-4">
        <AgreementsTable items={result?.items ?? []} loading={loading} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
      </div>

      {result && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
