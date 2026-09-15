import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

/** Blocks rendering of any nested admin route until a valid admin session is confirmed. */
export function AdminGuard() {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[var(--background)] text-[13px] text-[var(--text-muted)]">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
