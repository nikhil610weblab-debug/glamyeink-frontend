import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { PropertiesPanelBody } from './PropertiesPanel';
import type { AgreementField } from '../../types/document';

interface Props {
  field: AgreementField | null;
  onChange: (patch: Partial<AgreementField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}

/** Bottom sheet used on mobile/tablet instead of a permanent properties sidebar. */
export function MobilePropertiesSheet({ field, onChange, onDelete, onDuplicate, onClose }: Props) {
  if (!field) return null;

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end">
      <div className="absolute inset-0 bg-[rgba(23,27,33,0.45)] animate-[fadeIn_var(--duration-base)_var(--ease-standard)]" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Field properties"
        className="relative flex max-h-[75vh] w-full flex-col overflow-y-auto rounded-t-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-[modalIn_var(--duration-base)_var(--ease-standard)]"
      >
        <div className="sticky top-0 flex items-center justify-center border-b border-[var(--border)] bg-[var(--surface)] py-2">
          <span className="h-1 w-9 rounded-full bg-[var(--border-strong)]" />
          <IconButton label="Close" onClick={onClose} className="absolute right-2 top-1.5">
            <X size={16} />
          </IconButton>
        </div>
        <PropertiesPanelBody field={field} onChange={onChange} onDelete={onDelete} onDuplicate={onDuplicate} />
      </div>
    </div>,
    document.body,
  );
}
