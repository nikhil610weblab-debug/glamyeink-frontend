import { useRef, useState } from 'react';
import { Eraser, Redo2, Undo2, UploadCloud } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextInput } from '../ui/Field';
import { useSignatureCanvas } from '../../hooks/useSignatureCanvas';
import { SIGNATURE_FONTS } from '../../constants/editor';
import { validateImageFile } from '../../utils/validation';
import type { SignaturePayload } from '../../types/document';
import clsx from 'clsx';

interface Props {
  open: boolean;
  fieldLabel: string;
  onClose: () => void;
  onInsert: (payload: SignaturePayload) => void;
}

type Tab = 'draw' | 'type' | 'upload';

export function SignatureModal({ open, fieldLabel, onClose, onInsert }: Props) {
  const [tab, setTab] = useState<Tab>('draw');
  const [typedText, setTypedText] = useState('');
  const [typedFont, setTypedFont] = useState(SIGNATURE_FONTS[0]);
  const [typedColor, setTypedColor] = useState('#171B21');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draw = useSignatureCanvas();

  function reset() {
    setTab('draw');
    setTypedText('');
    setUploadedDataUrl(null);
    setUploadError(null);
    draw.clear();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function renderTypedToDataUrl(): string {
    const canvas = document.createElement('canvas');
    const scale = 3;
    canvas.width = 480 * scale;
    canvas.height = 140 * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, 480, 140);
    ctx.fillStyle = typedColor;
    ctx.font = `48px ${typedFont.family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedText || 'Your Signature', 240, 76);
    return canvas.toDataURL('image/png');
  }

  function handleInsert() {
    let payload: SignaturePayload | null = null;
    const now = new Date().toISOString();
    if (tab === 'draw') {
      const dataUrl = draw.toTransparentPng();
      if (dataUrl) payload = { source: 'draw', imageDataUrl: dataUrl, createdAt: now };
    } else if (tab === 'type') {
      if (typedText.trim()) {
        payload = {
          source: 'type',
          imageDataUrl: renderTypedToDataUrl(),
          typedText,
          typedFont: typedFont.family,
          createdAt: now,
        };
      }
    } else if (tab === 'upload') {
      if (uploadedDataUrl) payload = { source: 'upload', imageDataUrl: uploadedDataUrl, createdAt: now };
    }
    if (!payload) return;
    onInsert(payload);
    reset();
  }

  const canInsert =
    (tab === 'draw' && !draw.isEmpty) || (tab === 'type' && typedText.trim().length > 0) || (tab === 'upload' && !!uploadedDataUrl);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add your signature"
      description={`This will be inserted into “${fieldLabel}”.`}
      width={520}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canInsert} onClick={handleInsert}>
            Insert signature
          </Button>
        </>
      }
    >
      <div className="mb-4 flex gap-1 rounded-[var(--radius-sm)] bg-[var(--surface-secondary)] p-1">
        {(['draw', 'type', 'upload'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex-1 rounded-[4px] py-1.5 text-[12.5px] font-medium capitalize transition-colors',
              tab === t ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]' : 'text-[var(--text-muted)]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'draw' && (
        <div>
          <div className="relative h-[160px] w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[repeating-linear-gradient(0deg,transparent,transparent_31px,var(--border)_32px)]">
            <canvas
              ref={draw.canvasRef}
              onPointerDown={draw.onPointerDown}
              onPointerMove={draw.onPointerMove}
              onPointerUp={draw.onPointerUp}
              onPointerLeave={draw.onPointerUp}
              className="h-full w-full touch-none rounded-[var(--radius-md)]"
              style={{ width: '100%', height: '100%' }}
            />
            {draw.isEmpty && (
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] text-[var(--text-muted)]">
                Draw your signature here
              </p>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon={<Undo2 size={13} />} onClick={draw.undo} disabled={!draw.canUndo}>
              Undo
            </Button>
            <Button variant="ghost" size="sm" icon={<Redo2 size={13} />} onClick={draw.redo} disabled={!draw.canRedo}>
              Redo
            </Button>
            <Button variant="ghost" size="sm" icon={<Eraser size={13} />} onClick={draw.clear} disabled={draw.isEmpty}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {tab === 'type' && (
        <div className="flex flex-col gap-3">
          <TextInput
            autoFocus
            placeholder="Type your full name"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
          />
          <div
            className="flex h-[110px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-secondary)]"
            style={{ color: typedColor }}
          >
            <span style={{ fontFamily: typedFont.family, fontSize: 40 }}>{typedText || 'Your Signature'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SIGNATURE_FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTypedFont(f)}
                className={clsx(
                  'rounded-[var(--radius-sm)] border px-3 py-1.5 text-[16px]',
                  typedFont.id === f.id ? 'border-[var(--brand)] bg-[var(--brand-tint)]' : 'border-[var(--border)]',
                )}
                style={{ fontFamily: f.family }}
              >
                {typedText.slice(0, 8) || 'Preview'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[12.5px] text-[var(--text-secondary)]">Color</label>
            <input
              type="color"
              value={typedColor}
              onChange={(e) => setTypedColor(e.target.value)}
              className="h-7 w-7 cursor-pointer border-none bg-transparent p-0"
            />
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div className="flex flex-col gap-3">
          {uploadedDataUrl ? (
            <div className="flex h-[140px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[repeating-conic-gradient(var(--surface-secondary)_0%_25%,var(--surface)_0%_50%)] bg-[length:16px_16px]">
              <img src={uploadedDataUrl} alt="Uploaded signature" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[140px] flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <UploadCloud size={22} />
              <span className="text-[12.5px]">PNG, JPG, or WebP — transparent PNG works best</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = validateImageFile(file);
              if (!result.valid) {
                setUploadError(result.error ?? 'Invalid file.');
                return;
              }
              setUploadError(null);
              const reader = new FileReader();
              reader.onload = () => setUploadedDataUrl(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />
          {uploadError && <p className="text-[12px] text-[var(--danger)]">{uploadError}</p>}
          {uploadedDataUrl && (
            <Button variant="ghost" size="sm" onClick={() => setUploadedDataUrl(null)}>
              Choose a different image
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
