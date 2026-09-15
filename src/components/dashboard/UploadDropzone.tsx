import { useRef, useState, type DragEvent } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { validatePdfFile } from '../../utils/validation';

interface Props {
  onFile: (file: File) => void;
  isProcessing: boolean;
  onInvalidFile: (message: string) => void;
  compact?: boolean;
}

export function UploadDropzone({ onFile, isProcessing, onInvalidFile, compact }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const result = validatePdfFile(file);
    if (!result.valid) {
      onInvalidFile(result.error ?? 'This file could not be used.');
      return;
    }
    onFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload a PDF agreement"
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-2 border-dashed text-center transition-colors',
        compact ? 'p-8' : 'p-14',
        dragOver ? 'border-[var(--brand)] bg-[var(--brand-tint)]' : 'border-[var(--border-strong)] hover:border-[var(--brand)] hover:bg-[var(--surface-secondary)]',
      )}
    >
      {isProcessing ? (
        <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-tint)]">
          <FileUp size={20} className="text-[var(--brand)]" />
        </div>
      )}
      <div>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">
          {isProcessing ? 'Preparing your document…' : 'Drop a PDF here, or click to upload'}
        </p>
        <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">PDF files up to 25MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
