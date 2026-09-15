import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { EditorPage } from './pages/Editor/EditorPage';
import { PreviewPage } from './pages/Preview/PreviewPage';
import { SignPage } from './pages/Sign/SignPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { DashboardOverviewPage } from './pages/Admin/DashboardOverviewPage';
import { AgreementsPage } from './pages/Admin/AgreementsPage';
import { UsersPage } from './pages/Admin/UsersPage';
import { SettingsPage } from './pages/Admin/SettingsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <div className="h-screen w-screen overflow-hidden">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/preview/:id" element={<PreviewPage />} />

                {/* Public, tokenized recipient signing link — no login required. */}
                <Route path="/agreement/:id/:token" element={<SignPage />} />

                {/* Admin login is the only public entry point into the admin area,
                    and it is never linked from the public UI. */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                <Route element={<AdminGuard />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardOverviewPage />} />
                    <Route path="dashboard" element={<DashboardOverviewPage />} />
                    <Route path="agreements" element={<AgreementsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Route>
              </Routes>
            </div>
          </BrowserRouter>
        </AdminAuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
