import { useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import type { AgreementField } from '../../types/document';
import { validateImageFile } from '../../utils/validation';

export function DateFieldContent({ field, editing, onChange, onStopEditing }: {
  field: AgreementField;
  editing: boolean;
  onChange: (v: string) => void;
  onStopEditing: () => void;
}) {
  const { style } = field;
  if (!editing) {
    return (
      <div
        className="flex h-full w-full items-center truncate"
        style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: field.value ? style.color : 'var(--text-muted)' }}
      >
        {field.value || field.placeholder || 'MM/DD/YYYY'}
      </div>
    );
  }
  return (
    <input
      autoFocus
      type="text"
      defaultValue={field.value}
      placeholder="MM/DD/YYYY"
      onBlur={(e) => {
        onChange(e.currentTarget.value);
        onStopEditing();
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className="h-full w-full bg-transparent outline-none"
      style={{ fontFamily: style.fontFamily, fontSize: style.fontSize, color: style.color }}
    />
  );
}

export function CheckboxFieldContent({ field, onToggle }: { field: AgreementField; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={field.checked}
      className="flex h-full w-full items-center justify-center rounded-[3px] border-2"
      style={{
        borderColor: field.style.borderColor,
        background: field.checked ? field.style.borderColor : 'transparent',
      }}
    >
      {field.checked && (
        <svg viewBox="0 0 16 16" className="h-[70%] w-[70%]" fill="none">
          <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export function RadioFieldContent({ field, onToggle }: { field: AgreementField; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={field.checked}
      className="flex h-full w-full items-center justify-center rounded-full border-2"
      style={{ borderColor: field.style.borderColor }}
    >
      {field.checked && (
        <span className="h-[55%] w-[55%] rounded-full" style={{ background: field.style.borderColor }} />
      )}
    </button>
  );
}

export function DropdownFieldContent({ field, onChange }: { field: AgreementField; onChange?: (v: string) => void }) {
  return (
    <select
      value={field.value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      onMouseDown={(e) => e.stopPropagation()}
      className="h-full w-full truncate bg-transparent outline-none"
      style={{ fontFamily: field.style.fontFamily, fontSize: field.style.fontSize, color: field.style.color }}
    >
      <option value="" disabled>
        {field.placeholder || 'Select…'}
      </option>
      {(field.options ?? []).map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export function ImageFieldContent({ field, onChange }: { field: AgreementField; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (field.value) {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <img src={field.value} alt="Inserted" className="max-h-full max-w-full object-contain" draggable={false} />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed border-[var(--border-strong)] bg-[var(--surface-secondary)] text-[var(--text-muted)]"
      >
        <ImagePlus size={16} />
        <span style={{ fontSize: 10 }}>Add image</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const result = validateImageFile(file);
          if (!result.valid) return;
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />
    </>
  );
}
