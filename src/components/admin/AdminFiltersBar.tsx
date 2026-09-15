import { Search, X } from 'lucide-react';
import { TextInput, Select } from '../ui/Field';
import { Button } from '../ui/Button';

export interface Filters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  sender: string;
  recipient: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  statusCounts: Record<string, number>;
}

export function AdminFiltersBar({ filters, onChange, statusCounts }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const hasActiveFilters =
    filters.status || filters.dateFrom || filters.dateTo || filters.sender || filters.recipient;

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <TextInput
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search document, recipient, or sender…"
            className="pl-8"
          />
        </div>
        <Select value={filters.status} onChange={(e) => set('status', e.target.value)} className="w-[150px]">
          <option value="">
            All statuses ({(statusCounts.sent ?? 0) + (statusCounts.viewed ?? 0) + (statusCounts.completed ?? 0) + (statusCounts.failed ?? 0)})
          </option>
          <option value="sent">Sent ({statusCounts.sent ?? 0})</option>
          <option value="viewed">Viewed ({statusCounts.viewed ?? 0})</option>
          <option value="completed">Completed ({statusCounts.completed ?? 0})</option>
          <option value="failed">Failed ({statusCounts.failed ?? 0})</option>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={13} />}
            onClick={() => onChange({ search: filters.search, status: '', dateFrom: '', dateTo: '', sender: '', recipient: '' })}
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">From</label>
          <TextInput type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} className="w-[150px]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">To</label>
          <TextInput type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} className="w-[150px]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Sender</label>
          <TextInput value={filters.sender} onChange={(e) => set('sender', e.target.value)} placeholder="Name or email" className="w-[180px]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-[var(--text-secondary)]">Recipient</label>
          <TextInput value={filters.recipient} onChange={(e) => set('recipient', e.target.value)} placeholder="Name or email" className="w-[180px]" />
        </div>
      </div>
    </div>
  );
}
