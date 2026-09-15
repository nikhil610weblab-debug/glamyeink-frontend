import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { Select } from '../ui/Field';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel?: string;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange, itemLabel = 'agreement' }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-[12.5px] text-[var(--text-muted)]">{total} {itemLabel}{total === 1 ? '' : 's'} total</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] text-[var(--text-muted)]">Rows</span>
          <Select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="w-[70px]">
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton size="sm" label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={15} />
          </IconButton>
          <span className="min-w-[70px] text-center text-[12.5px] tabular-nums text-[var(--text-secondary)]">
            Page {page} / {totalPages}
          </span>
          <IconButton size="sm" label="Next page" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            <ChevronRight size={15} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
