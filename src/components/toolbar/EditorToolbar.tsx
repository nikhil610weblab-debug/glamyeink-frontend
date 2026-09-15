import { useState, type DragEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  MousePointer2,
  Hand,
  Type,
  PenLine,
  Signature,
  CalendarDays,
  CheckSquare,
  Circle,
  ChevronDown,
  ImageIcon,
  MessageSquare,
  MoreHorizontal,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import type { ToolId } from '../../types/document';
import { TOOLS } from '../../constants/editor';
import { IconButton } from '../ui/IconButton';

const ICONS: Record<ToolId, typeof MousePointer2> = {
  select: MousePointer2,
  pan: Hand,
  text: Type,
  signature: Signature,
  initials: PenLine,
  date: CalendarDays,
  checkbox: CheckSquare,
  radio: Circle,
  dropdown: ChevronDown,
  image: ImageIcon,
  comment: MessageSquare,
};

interface Props {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  variant?: 'desktop' | 'mobile';
}

const MOBILE_PRIMARY: ToolId[] = ['select', 'text', 'signature', 'date', 'checkbox'];

export function EditorToolbar({ activeTool, onSelectTool, variant = 'desktop' }: Props) {
  if (variant === 'mobile') return <MobileToolbar activeTool={activeTool} onSelectTool={onSelectTool} />;

  const navigate = TOOLS.filter((t) => t.group === 'navigate');
  const insert = TOOLS.filter((t) => t.group === 'insert');
  const annotate = TOOLS.filter((t) => t.group === 'annotate');

  function handleDragStart(e: DragEvent<HTMLButtonElement>, fieldType?: string) {
    if (!fieldType) return;
    e.dataTransfer.setData('application/x-field-type', fieldType);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <nav
      aria-label="Editing tools"
      className="flex w-[var(--toolbar-width)] shrink-0 flex-col items-center gap-1 border-r border-[var(--chrome-border)] bg-[var(--chrome-bg)] py-3"
    >
      {navigate.map((tool) => {
        const Icon = ICONS[tool.id];
        return (
          <IconButton
            key={tool.id}
            tone="chrome"
            label={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            active={activeTool === tool.id}
            onClick={() => onSelectTool(tool.id)}
          >
            <Icon size={17} />
          </IconButton>
        );
      })}

      <div className="my-1.5 h-px w-7 bg-[var(--chrome-border)]" />

      {insert.map((tool) => {
        const Icon = ICONS[tool.id];
        return (
          <IconButton
            key={tool.id}
            tone="chrome"
            label={tool.label}
            active={activeTool === tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.fieldType)}
            onClick={() => onSelectTool(tool.id)}
          >
            <Icon size={17} />
          </IconButton>
        );
      })}

      <div className="my-1.5 h-px w-7 bg-[var(--chrome-border)]" />

      {annotate.map((tool) => {
        const Icon = ICONS[tool.id];
        return (
          <IconButton
            key={tool.id}
            tone="chrome"
            label={tool.label}
            active={activeTool === tool.id}
            onClick={() => onSelectTool(tool.id)}
          >
            <Icon size={17} />
          </IconButton>
        );
      })}
    </nav>
  );
}

function MobileToolbar({ activeTool, onSelectTool }: Omit<Props, 'variant'>) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = TOOLS.filter((t) => MOBILE_PRIMARY.includes(t.id));
  const rest = TOOLS.filter((t) => !MOBILE_PRIMARY.includes(t.id));

  function select(id: ToolId) {
    onSelectTool(id);
    setMoreOpen(false);
  }

  return (
    <>
      <nav
        aria-label="Editing tools"
        className="flex h-14 shrink-0 items-center justify-around border-t border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-1"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {primary.map((tool) => {
          const Icon = ICONS[tool.id];
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => select(tool.id)}
              className={clsx(
                'flex min-w-[52px] flex-col items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[10.5px]',
                active ? 'text-[var(--brand)]' : 'text-[var(--chrome-text-muted)]',
              )}
            >
              <Icon size={19} />
              {tool.label}
            </button>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex min-w-[52px] flex-col items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[10.5px] text-[var(--chrome-text-muted)]"
        >
          <MoreHorizontal size={19} />
          More
        </button>
      </nav>

      {moreOpen &&
        createPortal(
          <div className="fixed inset-0 z-40 flex items-end">
            <div
              className="absolute inset-0 bg-[rgba(23,27,33,0.45)] animate-[fadeIn_var(--duration-base)_var(--ease-standard)]"
              onClick={() => setMoreOpen(false)}
            />
            <div
              role="dialog"
              aria-label="More tools"
              className="relative w-full rounded-t-[var(--radius-lg)] bg-[var(--surface)] p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] shadow-[var(--shadow-lg)] animate-[modalIn_var(--duration-base)_var(--ease-standard)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">More tools</span>
                <IconButton label="Close" onClick={() => setMoreOpen(false)}>
                  <X size={16} />
                </IconButton>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {rest.map((tool) => {
                  const Icon = ICONS[tool.id];
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => select(tool.id)}
                      className={clsx(
                        'flex flex-col items-center gap-1 rounded-[var(--radius-md)] border px-2 py-3 text-[11px]',
                        active ? 'border-[var(--brand)] bg-[var(--brand-tint)] text-[var(--brand)]' : 'border-[var(--border)] text-[var(--text-secondary)]',
                      )}
                    >
                      <Icon size={18} />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
