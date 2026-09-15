import { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Copy, Lock, Trash2, Unlock } from 'lucide-react';
import clsx from 'clsx';
import type { AgreementField } from '../../types/document';
import { clamp } from '../../utils/geometry';
import { TextFieldContent } from '../fields/TextFieldContent';
import { SignatureFieldContent } from '../fields/SignatureFieldContent';
import {
  CheckboxFieldContent,
  DateFieldContent,
  DropdownFieldContent,
  ImageFieldContent,
  RadioFieldContent,
} from '../fields/SimpleFieldContents';

interface FieldObjectProps {
  field: AgreementField;
  pageWidth: number;
  pageHeight: number;
  selected: boolean;
  readOnly?: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<AgreementField>, opts?: { commit?: boolean }) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRequestSign: () => void;
  hideControlsWhenLocked?: boolean;
}

const FIELD_ACCENT: Record<string, string> = {
  text: 'var(--field-text)',
  signature: 'var(--field-signature)',
  initials: 'var(--field-signature)',
  date: 'var(--field-date)',
  checkbox: 'var(--field-checkbox)',
  radio: 'var(--field-checkbox)',
  dropdown: 'var(--field-text)',
  image: 'var(--text-muted)',
};

export function FieldObject({
  field,
  pageWidth,
  pageHeight,
  selected,
  readOnly,
  onSelect,
  onChange,
  onDelete,
  onDuplicate,
  onRequestSign,
  hideControlsWhenLocked,
}: FieldObjectProps) {
  const [editing, setEditing] = useState(false);
  const isDraggingRef = useRef(false);
  const accent = FIELD_ACCENT[field.type] ?? 'var(--brand)';

  const x = field.xPct * pageWidth;
  const y = field.yPct * pageHeight;
  const width = field.widthPct * pageWidth;
  const height = field.heightPct * pageHeight;

  useEffect(() => {
    if (!selected) setEditing(false);
  }, [selected]);

  const isTextLike = field.type === 'text' || field.type === 'date';

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      bounds="parent"
      disableDragging={readOnly || field.locked || editing}
      enableResizing={!readOnly && !field.locked && !editing && selected}
      dragGrid={[1, 1]}
      onDragStart={() => {
        isDraggingRef.current = true;
        onSelect();
      }}
      onDragStop={(_e, d) => {
        isDraggingRef.current = false;
        onChange(
          {
            xPct: clamp(d.x / pageWidth, 0, 1 - field.widthPct),
            yPct: clamp(d.y / pageHeight, 0, 1 - field.heightPct),
          },
          { commit: true },
        );
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        const newWidthPct = clamp(ref.offsetWidth / pageWidth, 0.01, 1);
        const newHeightPct = clamp(ref.offsetHeight / pageHeight, 0.01, 1);
        onChange(
          {
            widthPct: newWidthPct,
            heightPct: newHeightPct,
            xPct: clamp(pos.x / pageWidth, 0, 1 - newWidthPct),
            yPct: clamp(pos.y / pageHeight, 0, 1 - newHeightPct),
          },
          { commit: true },
        );
      }}
      resizeHandleStyles={{
        bottomRight: handleStyle,
        bottomLeft: handleStyle,
        topRight: handleStyle,
        topLeft: handleStyle,
      }}
      className={clsx('group', selected && !readOnly && 'z-10')}
      style={{ opacity: field.style.opacity, touchAction: readOnly ? undefined : 'none' }}
    >
      <div
        role="group"
        aria-label={field.label}
        tabIndex={readOnly ? -1 : 0}
        onMouseDown={() => {
          if (!readOnly) onSelect();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!readOnly && isTextLike && !field.locked) setEditing(true);
        }}
        className={clsx(
          'relative h-full w-full transition-shadow duration-[var(--duration-fast)]',
          !editing && 'select-none',
          !readOnly && 'cursor-pointer',
        )}
        style={{
          backgroundColor: field.style.backgroundColor,
          border: selected && !readOnly ? `1.5px solid ${accent}` : field.type === 'text' ? 'none' : `1px dashed ${accent}`,
          borderRadius: field.style.borderRadius,
        }}
      >
        {field.type === 'text' && (
          <TextFieldContent
            field={field}
            editing={editing}
            onChange={(value) => onChange({ value }, { commit: true })}
            onStopEditing={() => setEditing(false)}
          />
        )}
        {(field.type === 'signature' || field.type === 'initials') && (
          <SignatureFieldContent field={field} onRequestSign={() => !readOnly && !field.locked && onRequestSign()} />
        )}
        {field.type === 'date' && (
          <DateFieldContent
            field={field}
            editing={editing}
            onChange={(value) => onChange({ value }, { commit: true })}
            onStopEditing={() => setEditing(false)}
          />
        )}
        {field.type === 'checkbox' && (
          <CheckboxFieldContent
            field={field}
            onToggle={() => !readOnly && !field.locked && onChange({ checked: !field.checked }, { commit: true })}
          />
        )}
        {field.type === 'radio' && (
          <RadioFieldContent
            field={field}
            onToggle={() => !readOnly && !field.locked && onChange({ checked: !field.checked }, { commit: true })}
          />
        )}
        {field.type === 'dropdown' && (
          <DropdownFieldContent
            field={field}
            onChange={(value) => !readOnly && !field.locked && onChange({ value }, { commit: true })}
          />
        )}
        {field.type === 'image' && (
          <ImageFieldContent
            field={field}
            onChange={(value) => !readOnly && !field.locked && onChange({ value }, { commit: true })}
          />
        )}

        {field.required && !readOnly && (
          <span
            className="pointer-events-none absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ background: 'var(--danger)' }}
            title="Required"
          >
            *
          </span>
        )}

        {selected && !readOnly && !(hideControlsWhenLocked && field.locked) && (
          <div
            className="absolute -top-9 left-0 flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-1 py-1 shadow-[var(--shadow-md)] animate-[toastIn_var(--duration-fast)_var(--ease-standard)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[var(--chrome-text-muted)] hover:bg-[var(--chrome-bg-raised)] hover:text-[var(--chrome-text)]"
              title="Duplicate (Ctrl+D)"
              onClick={onDuplicate}
            >
              <Copy size={13} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[var(--chrome-text-muted)] hover:bg-[var(--chrome-bg-raised)] hover:text-[var(--chrome-text)]"
              title={field.locked ? 'Unlock position' : 'Lock position'}
              onClick={() => onChange({ locked: !field.locked }, { commit: true })}
            >
              {field.locked ? <Unlock size={13} /> : <Lock size={13} />}
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-[3px] text-[var(--chrome-text-muted)] hover:bg-[rgba(179,38,30,0.25)] hover:text-[#ff9d95]"
              title="Delete (Del)"
              onClick={onDelete}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </Rnd>
  );
}

const handleStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  background: 'var(--brand)',
  border: '2px solid white',
  borderRadius: 3,
  touchAction: 'none',
};
