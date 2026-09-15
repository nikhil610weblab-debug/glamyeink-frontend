import { FileStack } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px]" style={{ background: 'var(--brand)' }}>
          <FileStack size={15} color="white" />
        </div>
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">GlaymeInk</span>
      </div>
    </header>
  );
}
