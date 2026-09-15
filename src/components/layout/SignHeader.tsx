import { Check, Eye, FileStack, Loader2, PenLine, Undo2, Redo2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  documentName: string;
  senderName: string;
  saveStatus: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  incompleteCount: number;
  previewMode: boolean;
  submitting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onSubmit: () => void;
  onOpenPages?: () => void;
}

const SAVE_LABEL: Record<SaveStatus, React.ReactNode> = {
  idle: null,
  saving: (
    <>
      <Loader2 size={13} className="animate-spin" /> Saving…
    </>
  ),
  saved: (
    <>
      <Check size={13} /> Changes saved
    </>
  ),
  error: (
    <span className="text-[var(--danger)]">Save failed</span>
  ),
};

export function SignHeader({
  documentName,
  senderName,
  saveStatus,
  canUndo,
  canRedo,
  incompleteCount,
  previewMode,
  submitting,
  onUndo,
  onRedo,
  onTogglePreview,
  onSubmit,
  onOpenPages,
}: Props) {
  return (
    <header
      className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-3 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-3"
      style={{ color: 'var(--chrome-text)' }}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]" style={{ background: 'var(--brand)' }}>
          <FileStack size={14} color="white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium leading-tight text-[var(--chrome-text)]">{documentName}</p>
          <p className="truncate text-[11px] leading-tight text-[var(--chrome-text-muted)]">From {senderName}</p>
        </div>
        <div className="mx-1 hidden items-center gap-1 sm:flex">
          <IconButton tone="chrome" size="sm" label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
            <Undo2 size={15} />
          </IconButton>
          <IconButton tone="chrome" size="sm" label="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo}>
            <Redo2 size={15} />
          </IconButton>
        </div>
      </div>

      <div className="hidden items-center gap-2 text-[12.5px] text-[var(--chrome-text-muted)] md:flex">
        {SAVE_LABEL[saveStatus]}
        {incompleteCount > 0 && (
          <>
            <span className="mx-1 h-1 w-1 rounded-full bg-[var(--chrome-text-muted)]" />
            <span className="flex items-center gap-1 text-[var(--warning)]">
              <AlertTriangle size={13} /> {incompleteCount} field{incompleteCount === 1 ? '' : 's'} remaining
            </span>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {onOpenPages && (
          <IconButton tone="chrome" label="Pages" onClick={onOpenPages} className="lg:hidden">
            <FileStack size={16} />
          </IconButton>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="!text-[var(--chrome-text-muted)] hover:!bg-[var(--chrome-bg-raised)] hover:!text-[var(--chrome-text)]"
          icon={<Eye size={15} />}
          onClick={onTogglePreview}
        >
          <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Save & Sign'}
        </Button>
      </div>
    </header>
  );
}
