import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { createId } from '../../utils/id';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_CONFIG: Record<ToastTone, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: 'var(--success)' },
  error: { icon: XCircle, color: 'var(--danger)' },
  warning: { icon: AlertTriangle, color: 'var(--warning)' },
  info: { icon: Info, color: 'var(--info)' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = createId('toast');
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[340px]">
          {toasts.map((t) => {
            const config = TONE_CONFIG[t.tone];
            const Icon = config.icon;
            return (
              <div
                key={t.id}
                role="status"
                className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 shadow-[var(--shadow-md)] animate-[toastIn_var(--duration-base)_var(--ease-standard)]"
              >
                <Icon size={17} style={{ color: config.color }} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-sm)] font-medium text-[var(--text-primary)]">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-[var(--text-xs)] text-[var(--text-muted)]">{t.description}</p>
                  )}
                </div>
                <button
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(t.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
