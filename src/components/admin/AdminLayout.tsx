import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FileStack,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAdminAuth } from '../../context/AdminAuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/agreements', label: 'Agreements', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  const initials = (user?.name || user?.email || 'A').slice(0, 1).toUpperCase();

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px]" style={{ background: 'var(--brand)' }}>
          <FileStack size={15} color="white" />
        </div>
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">GlamyeInk Admin</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2.5 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium transition-colors duration-[var(--duration-fast)]',
                isActive
                  ? 'bg-[var(--brand-tint)] text-[var(--brand)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] p-3">
        <div className="mb-2 flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-tint)] text-[12px] font-semibold text-[var(--brand)]">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-[var(--text-primary)]">{user?.name}</div>
            <div className="truncate text-[11px] text-[var(--text-muted)]">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[13.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--danger)]"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] sm:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-[var(--surface)] shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:hidden">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-[14px] font-semibold text-[var(--text-primary)]">GlamyeInk Admin</span>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
