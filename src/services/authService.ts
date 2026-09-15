import { API_BASE } from './emailService';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

async function parseError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = await response.json();
    if (body?.error) message = body.error;
  } catch {
    // ignore — use fallback
  }
  throw new Error(message);
}

export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  const response = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) return parseError(response, 'Invalid email or password.');
  const data = await response.json();
  return data.user;
}

export async function adminLogout(): Promise<void> {
  await fetch(`${API_BASE}/api/admin/auth/logout`, { method: 'POST', credentials: 'include' });
}

/** Resolves to the current admin user, or null if not authenticated. */
export async function fetchCurrentAdmin(): Promise<AdminUser | null> {
  const response = await fetch(`${API_BASE}/api/admin/auth/me`, { credentials: 'include' });
  if (!response.ok) return null;
  const data = await response.json();
  return data.user;
}
