import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Copy, Trash2, Lock, Unlock, Plus, X } from 'lucide-react';
import type { AgreementField } from '../../types/document';
import { FieldShell, TextInput, Select, Switch } from '../ui/Field';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { UI_FONTS } from '../../constants/editor';

interface Props {
  field: AgreementField | null;
  onChange: (patch: Partial<AgreementField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

interface BodyProps {
  field: AgreementField;
  onChange: (patch: Partial<AgreementField>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const hasTypography = (type: string) => type === 'text' || type === 'date' || type === 'dropdown';

export function PropertiesPanelBody({ field, onChange, onDelete, onDuplicate }: BodyProps) {
  const s = field.style;
  const update = (patch: Partial<AgreementField>) => onChange(patch);
  const updateStyle = (patch: Partial<AgreementField['style']>) => onChange({ style: { ...s, ...patch } });

  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Field</p>
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">{field.label}</p>
        </div>
        <div className="flex items-center gap-1">
          <IconButton size="sm" label="Duplicate" onClick={onDuplicate}>
            <Copy size={14} />
          </IconButton>
          <IconButton size="sm" label={field.locked ? 'Unlock' : 'Lock'} onClick={() => update({ locked: !field.locked })}>
            {field.locked ? <Unlock size={14} /> : <Lock size={14} />}
          </IconButton>
          <IconButton size="sm" label="Delete" onClick={onDelete}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldShell label="Field name">
            <TextInput value={field.fieldName} onChange={(e) => update({ fieldName: e.target.value })} />
          </FieldShell>
          <FieldShell label="Label">
            <TextInput value={field.label} onChange={(e) => update({ label: e.target.value })} />
          </FieldShell>
        </div>

        {field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'signature' && field.type !== 'initials' && (
          <FieldShell label="Placeholder">
            <TextInput
              value={field.placeholder ?? ''}
              onChange={(e) => update({ placeholder: e.target.value })}
              placeholder="Shown when empty"
            />
          </FieldShell>
        )}

        <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2.5">
          <div>
            <p className="text-[12.5px] font-medium text-[var(--text-primary)]">Required</p>
            <p className="text-[11px] text-[var(--text-muted)]">Recipient must complete this field</p>
          </div>
          <Switch checked={field.required} onChange={(v) => update({ required: v })} label="Required" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldShell label="X position">
            <TextInput
              type="number"
              value={Math.round(field.xPct * 100)}
              onChange={(e) => update({ xPct: Number(e.target.value) / 100 })}
            />
          </FieldShell>
          <FieldShell label="Y position">
            <TextInput
              type="number"
              value={Math.round(field.yPct * 100)}
              onChange={(e) => update({ yPct: Number(e.target.value) / 100 })}
            />
          </FieldShell>
          <FieldShell label="Width">
            <TextInput
              type="number"
              value={Math.round(field.widthPct * 100)}
              onChange={(e) => update({ widthPct: Number(e.target.value) / 100 })}
            />
          </FieldShell>
          <FieldShell label="Height">
            <TextInput
              type="number"
              value={Math.round(field.heightPct * 100)}
              onChange={(e) => update({ heightPct: Number(e.target.value) / 100 })}
            />
          </FieldShell>
        </div>

        {(field.type === 'dropdown' || field.type === 'radio') && (
          <FieldShell label="Options">
            <div className="flex flex-col gap-1.5">
              {(field.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <TextInput
                    value={opt}
                    onChange={(e) => {
                      const next = [...(field.options ?? [])];
                      next[idx] = e.target.value;
                      update({ options: next });
                    }}
                  />
                  <IconButton
                    size="sm"
                    label="Remove option"
                    onClick={() => update({ options: (field.options ?? []).filter((_, i) => i !== idx) })}
                  >
                    <X size={13} />
                  </IconButton>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => update({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] })}
              >
                Add option
              </Button>
            </div>
          </FieldShell>
        )}

        <div className="h-px bg-[var(--border)]" />

        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">Appearance</p>

        {hasTypography(field.type) && (
          <>
            <FieldShell label="Font">
              <Select value={s.fontFamily} onChange={(e) => updateStyle({ fontFamily: e.target.value })}>
                {UI_FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <div className="grid grid-cols-2 gap-3">
              <FieldShell label="Size">
                <TextInput
                  type="number"
                  min={8}
                  max={72}
                  value={s.fontSize}
                  onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                />
              </FieldShell>
              <FieldShell label="Text color">
                <div className="flex h-8 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-2">
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => updateStyle({ color: e.target.value })}
                    className="h-5 w-5 cursor-pointer border-none bg-transparent p-0"
                  />
                  <span className="text-[12px] text-[var(--text-muted)]">{s.color}</span>
                </div>
              </FieldShell>
            </div>

            <div className="flex items-center gap-1">
              <IconButton
                size="sm"
                label="Bold"
                active={s.fontWeight >= 600}
                onClick={() => updateStyle({ fontWeight: s.fontWeight >= 600 ? 400 : 700 })}
              >
                <Bold size={14} />
              </IconButton>
              <IconButton
                size="sm"
                label="Italic"
                active={s.fontStyle === 'italic'}
                onClick={() => updateStyle({ fontStyle: s.fontStyle === 'italic' ? 'normal' : 'italic' })}
              >
                <Italic size={14} />
              </IconButton>
              <IconButton
                size="sm"
                label="Underline"
                active={s.textDecoration === 'underline'}
                onClick={() => updateStyle({ textDecoration: s.textDecoration === 'underline' ? 'none' : 'underline' })}
              >
                <Underline size={14} />
              </IconButton>
              <div className="mx-1 h-5 w-px bg-[var(--border)]" />
              {(['left', 'center', 'right'] as const).map((align) => {
                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                return (
                  <IconButton
                    key={align}
                    size="sm"
                    label={`Align ${align}`}
                    active={s.textAlign === align}
                    onClick={() => updateStyle({ textAlign: align })}
                  >
                    <Icon size={14} />
                  </IconButton>
                );
              })}
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FieldShell label="Border color">
            <div className="flex h-8 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-2">
              <input
                type="color"
                value={s.borderColor}
                onChange={(e) => updateStyle({ borderColor: e.target.value })}
                className="h-5 w-5 cursor-pointer border-none bg-transparent p-0"
              />
              <span className="text-[12px] text-[var(--text-muted)]">{s.borderColor}</span>
            </div>
          </FieldShell>
          <FieldShell label="Corner radius">
            <TextInput
              type="number"
              min={0}
              max={24}
              value={s.borderRadius}
              onChange={(e) => updateStyle({ borderRadius: Number(e.target.value) })}
            />
          </FieldShell>
        </div>

        <FieldShell label={`Opacity — ${Math.round(s.opacity * 100)}%`}>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={s.opacity}
            onChange={(e) => updateStyle({ opacity: Number(e.target.value) })}
            className="w-full accent-[var(--brand)]"
          />
        </FieldShell>
      </div>
    </>
  );
}

export function PropertiesPanel({ field, onChange, onDelete, onDuplicate }: Props) {
  if (!field) {
    return (
      <aside className="flex w-[var(--panel-width)] shrink-0 flex-col items-center justify-center gap-2 border-l border-[var(--border)] bg-[var(--surface)] px-6 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">
          Select a field on the document to edit its properties, or choose a tool to add one.
        </p>
      </aside>
    );
  }
  return (
    <aside
      className="flex w-[var(--panel-width)] shrink-0 flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] animate-[slideInPanel_var(--duration-base)_var(--ease-standard)]"
      aria-label="Field properties"
    >
      <PropertiesPanelBody field={field} onChange={onChange} onDelete={onDelete} onDuplicate={onDuplicate} />
    </aside>
  );
}
