import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled application error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-[var(--background)] text-center">
          <AlertTriangle size={28} className="text-[var(--danger)]" />
          <p className="text-[15px] font-medium text-[var(--text-primary)]">Something went wrong</p>
          <p className="max-w-sm text-[13px] text-[var(--text-muted)]">
            An unexpected error occurred. Reloading usually fixes this.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
