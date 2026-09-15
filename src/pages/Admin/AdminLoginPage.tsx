import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FileStack, Loader2, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FieldShell, TextInput } from '../../components/ui/Field';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function AdminLoginPage() {
  const { user, loading, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-[380px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[var(--shadow-md)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ background: 'var(--brand)' }}>
            <FileStack size={20} color="white" />
          </div>
          <h1 className="text-[17px] font-semibold text-[var(--text-primary)]">Admin sign in</h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">Restricted to GlamyeInk administrators.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldShell label="Email" htmlFor="admin-email">
            <TextInput
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@glamyeink.com"
            />
          </FieldShell>
          <FieldShell label="Password" htmlFor="admin-password">
            <TextInput
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FieldShell>

          {error && (
            <p role="alert" className="rounded-[var(--radius-sm)] bg-[var(--danger)]/10 px-3 py-2 text-[12.5px] text-[var(--danger)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={submitting} className="mt-1 w-full justify-center">
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
