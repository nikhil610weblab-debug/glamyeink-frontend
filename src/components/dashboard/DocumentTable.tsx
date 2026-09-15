import { MoreHorizontal, Trash2, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { IconButton } from '../ui/IconButton';
import type { AgreementDocument } from '../../types/document';

interface Props {
  documents: AgreementDocument[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DocumentTable({ documents, onOpen, onDelete, onDuplicate }: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border)] text-[11.5px] uppercase tracking-wide text-[var(--text-muted)]">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Recipient</th>
            <th className="px-4 py-2.5 font-medium">Updated</th>
            <th className="px-4 py-2.5 font-medium">Created</th>
            <th className="w-10 px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              onClick={() => onOpen(doc.id)}
              className="cursor-pointer border-b border-[var(--border)] text-[13px] last:border-b-0 hover:bg-[var(--surface-secondary)]"
            >
              <td className="max-w-[280px] truncate px-4 py-3 font-medium text-[var(--text-primary)]">{doc.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{doc.recipient?.name || '—'}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(doc.updatedAt)}</td>
              <td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(doc.createdAt)}</td>
              <td className="relative px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="sm"
                  label="More actions"
                  onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                >
                  <MoreHorizontal size={15} />
                </IconButton>
                {openMenuId === doc.id && (
                  <div
                    onMouseLeave={() => setOpenMenuId(null)}
                    className="absolute right-4 top-10 z-10 w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] animate-[toastIn_var(--duration-fast)_var(--ease-standard)]"
                  >
                    <button
                      onClick={() => {
                        onDuplicate(doc.id);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
                    >
                      <Copy size={14} /> Duplicate
                    </button>
                    <button
                      disabled
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[var(--text-muted)] opacity-50"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                    <button
                      onClick={() => {
                        onDelete(doc.id);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-[var(--danger)] hover:bg-[var(--danger-tint)]"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
