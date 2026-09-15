import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Document, Page } from 'react-pdf';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { IconButton } from '../ui/IconButton';

interface Props {
  open: boolean;
  file: Blob | null;
  pageCount: number;
  currentPage: number;
  onSelectPage: (page: number) => void;
  onClose: () => void;
}

/** Overlay drawer for page thumbnails — used on mobile/tablet instead of a permanent sidebar. */
export function PageDrawer({ open, file, pageCount, currentPage, onSelectPage, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !file) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-[rgba(23,27,33,0.45)] animate-[fadeIn_var(--duration-base)_var(--ease-standard)]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Page thumbnails"
        className="relative flex h-full w-[220px] max-w-[78vw] flex-col overflow-y-auto border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)] p-3 shadow-[var(--shadow-lg)] animate-[slideInPanel_var(--duration-base)_var(--ease-standard)]"
      >
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[12.5px] font-medium text-[var(--chrome-text)]">Pages</span>
          <IconButton tone="chrome" size="sm" label="Close" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>
        <Document file={file} loading={null}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectPage(i);
                onClose();
              }}
              className={clsx(
                'mb-3 flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] p-1.5',
                currentPage === i ? 'bg-[var(--chrome-bg-raised)]' : 'hover:bg-[var(--chrome-bg-raised)]',
              )}
            >
              <div
                className={clsx(
                  'overflow-hidden rounded-[2px] border-2 shadow-[var(--shadow-xs)]',
                  currentPage === i ? 'border-[var(--brand)]' : 'border-transparent',
                )}
              >
                <Page pageNumber={i + 1} width={168} renderAnnotationLayer={false} renderTextLayer={false} loading={null} />
              </div>
              <span className="text-[11px] tabular-nums text-[var(--chrome-text-muted)]">{i + 1}</span>
            </button>
          ))}
        </Document>
      </aside>
    </div>,
    document.body,
  );
}
