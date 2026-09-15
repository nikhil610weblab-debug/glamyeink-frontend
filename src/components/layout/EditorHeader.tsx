import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Eye, FileStack, Loader2, Send, Undo2, Redo2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import type { DocumentStatus } from '../../types/document';

interface Props {
  name: string;
  status: DocumentStatus;
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onRename: (name: string) => void;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPreview: () => void;
  onSend: () => void;
  sendDisabled?: boolean;
  onOpenPages?: () => void;
}

const STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: 'Draft',
  ready: 'Ready to send',
  sent: 'Sent',
  viewed: 'Viewed',
  signed: 'Signed',
  completed: 'Completed',
};

export function EditorHeader({
  name,
  status,
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  onRename,
  onBack,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onSend,
  sendDisabled,
  onOpenPages,
}: Props) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraftName(name), [name]);
  useEffect(() => {
    if (editingName) inputRef.current?.select();
  }, [editingName]);

  return (
    <header
      className="flex h-[var(--header-height)] shrink-0 items-center justify-between gap-4 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-3"
      style={{ color: 'var(--chrome-text)' }}
    >
      <div className="flex min-w-0 items-center gap-1">
        <IconButton tone="chrome" label="Back to documents" onClick={onBack}>
          <ArrowLeft size={17} />
        </IconButton>
        <div className="mx-1.5 flex h-6 w-6 items-center justify-center rounded-[6px]" style={{ background: 'var(--brand)' }}>
          <FileStack size={14} color="white" />
        </div>
        {editingName ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={() => {
              setEditingName(false);
              if (draftName.trim()) onRename(draftName.trim());
              else setDraftName(name);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setDraftName(name);
                setEditingName(false);
              }
            }}
            className="h-7 w-56 rounded-[4px] bg-[var(--chrome-bg-raised)] px-2 text-[13.5px] text-[var(--chrome-text)] outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="truncate rounded-[4px] px-2 py-1 text-[13.5px] font-medium text-[var(--chrome-text)] hover:bg-[var(--chrome-bg-raised)]"
            title="Rename document"
          >
            {name}
          </button>
        )}
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
        {isSaving ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Saving…
          </>
        ) : isDirty ? (
          'Unsaved changes'
        ) : (
          <>
            <Check size={13} /> All changes saved
          </>
        )}
        <span className="mx-1 h-1 w-1 rounded-full bg-[var(--chrome-text-muted)]" />
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: 'var(--chrome-bg-raised)', color: 'var(--chrome-text)' }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {onOpenPages && (
          <IconButton tone="chrome" label="Pages" onClick={onOpenPages} className="lg:hidden">
            <FileStack size={16} />
          </IconButton>
        )}
        <Button variant="ghost" size="sm" className="!text-[var(--chrome-text-muted)] hover:!bg-[var(--chrome-bg-raised)] hover:!text-[var(--chrome-text)]" icon={<Eye size={15} />} onClick={onPreview}>
          <span className="hidden sm:inline">Preview</span>
        </Button>
        <Button variant="secondary" size="sm" className="!bg-[var(--chrome-bg-raised)] !border-[var(--chrome-border)] !text-[var(--chrome-text)] hover:!bg-[var(--chrome-border)]" onClick={onSave}>
          <span className="hidden sm:inline">Save</span>
          <Check size={15} className="sm:hidden" />
        </Button>
        <Button variant="primary" size="sm" icon={<Send size={14} />} onClick={onSend} disabled={sendDisabled}>
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </header>
  );
}
