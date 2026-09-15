import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, description, children, footer, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,27,33,0.45)] animate-[fadeIn_var(--duration-base)_var(--ease-standard)]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ width }}
        className="max-h-[86vh] flex flex-col rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-[modalIn_var(--duration-base)_var(--ease-standard)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-[var(--text-lg)] font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[var(--text-sm)] text-[var(--text-muted)]">{description}</p>
            )}
          </div>
          <IconButton label="Close" onClick={onClose} className="shrink-0">
            <X size={17} />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
