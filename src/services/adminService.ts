import { API_BASE } from './emailService';
import type { SentAgreement } from './emailService';

export interface AgreementListParams {
  search?: string; status?: string; dateFrom?: string; dateTo?: string;
  sender?: string; recipient?: string; sortBy?: string; sortDir?: 'asc' | 'desc';
  page?: number; pageSize?: number;
}

export interface AgreementListResult {
  items: SentAgreement[]; total: number; page: number; pageSize: number;
  totalPages: number; statusCounts: Record<string, number>;
}

export interface AdminUserRecord {
  id: string; name: string; email: string; role: 'admin' | 'recipient';
  createdAt: string; agreementCount: number;
}

export interface UserListParams {
  search?: string; role?: string; sortBy?: string; sortDir?: 'asc' | 'desc';
  page?: number; pageSize?: number;
}

export interface UserListResult {
  items: AdminUserRecord[]; total: number; page: number; pageSize: number; totalPages: number;
}

export interface DashboardStats {
  totalAgreements: number; sent: number; pending: number; completed: number; failed: number;
  totalUsers: number; recentCount: number; statusCounts: Record<string, number>;
  latestAgreements: Array<{ id: string; documentName: string; recipientName: string; recipientEmail: string; status: string; createdAt: string }>;
  recentActivity: Array<{ id: string; documentName: string; status: string; createdAt: string; sentAt: string | null }>;
}

export interface AdminSettings {
  profile: { name: string; email: string };
  application: { appName: string; supportEmail: string };
  agreement: { defaultSubject: string; reminderDays: number };
  smtp: { host: string; port: number; secure: boolean; user: string; configured: boolean };
  storage: { driver: string; directory: string; maxUploadMb: number };
  security: { sessionLengthHours: number; passwordHashing: string };
}

/** Thrown when the backend reports the admin session is missing/expired. Callers should redirect to /admin/login. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Your session has expired. Please log in again.');
    this.name = 'SessionExpiredError';
  }
}

async function adminFetch(path: string, init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' });
  } catch {
    throw new Error(`Couldn't reach the backend at ${API_BASE}. Make sure it's running.`);
  }
  if (response.status === 401 || response.status === 403) throw new SessionExpiredError();
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || 'Request failed.');
  }
  return response.json();
}

function toQuery(params: Record<string, unknown> | AgreementListParams | UserListParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return query.toString();
}

export function fetchAgreements(params: AgreementListParams): Promise<AgreementListResult> {
  return adminFetch(`/api/admin/agreements?${toQuery(params)}`);
}

export function fetchUsers(params: UserListParams): Promise<UserListResult> {
  return adminFetch(`/api/admin/users?${toQuery(params)}`);
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return adminFetch('/api/admin/dashboard/stats');
}

export function fetchSettings(): Promise<AdminSettings> {
  return adminFetch('/api/admin/settings');
}

export function updateSettingsSection(section: string, values: Record<string, unknown>) {
  return adminFetch('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, values }),
  });
}
