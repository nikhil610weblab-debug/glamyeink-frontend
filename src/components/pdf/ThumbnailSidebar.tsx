import { Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { IconButton } from '../ui/IconButton';

interface Props {
  file: Blob | null;
  pageCount: number;
  currentPage: number;
  collapsed: boolean;
  onSelectPage: (page: number) => void;
  onToggleCollapse: () => void;
}

export function ThumbnailSidebar({ file, pageCount, currentPage, collapsed, onSelectPage, onToggleCollapse }: Props) {
  if (!file) return null;

  if (collapsed) {
    return (
      <div className="flex w-9 shrink-0 flex-col items-center border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)] py-2">
        <IconButton tone="chrome" size="sm" label="Show page thumbnails" onClick={onToggleCollapse}>
          <ChevronRight size={15} />
        </IconButton>
      </div>
    );
  }

  return (
    <aside
      className="flex w-[152px] shrink-0 flex-col overflow-y-auto border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)] animate-[slideInPanel_var(--duration-base)_var(--ease-standard)]"
      aria-label="Page thumbnails"
    >
      <div className="flex items-center justify-between px-2 pt-2">
        <span className="pl-1 text-[11px] font-medium text-[var(--chrome-text-muted)]">Pages</span>
        <IconButton tone="chrome" size="sm" label="Collapse page thumbnails" onClick={onToggleCollapse}>
          <ChevronLeft size={15} />
        </IconButton>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <Document file={file} loading={null}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onSelectPage(i)}
              className={clsx(
                'group flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] p-1.5 transition-colors',
                currentPage === i ? 'bg-[var(--chrome-bg-raised)]' : 'hover:bg-[var(--chrome-bg-raised)]',
              )}
            >
              <div
                className={clsx(
                  'overflow-hidden rounded-[2px] border-2 shadow-[var(--shadow-xs)]',
                  currentPage === i ? 'border-[var(--brand)]' : 'border-transparent',
                )}
              >
                <Page pageNumber={i + 1} width={116} renderAnnotationLayer={false} renderTextLayer={false} loading={null} />
              </div>
              <span
                className={clsx(
                  'text-[11px] tabular-nums',
                  currentPage === i ? 'text-[var(--chrome-text)] font-medium' : 'text-[var(--chrome-text-muted)]',
                )}
              >
                {i + 1}
              </span>
            </button>
          ))}
        </Document>
      </div>
    </aside>
  );
}
