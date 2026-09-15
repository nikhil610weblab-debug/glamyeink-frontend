import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Save, Server, Settings as SettingsIcon, ShieldCheck, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FieldShell, TextInput } from '../../components/ui/Field';
import { useToast } from '../../components/ui/Toast';
import { fetchSettings, updateSettingsSection, SessionExpiredError, type AdminSettings } from '../../services/adminService';

function SectionCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--brand-tint)] text-[var(--brand)]">{icon}</span>
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</h2>
          {description && <p className="text-[12.5px] text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingApp, setSavingApp] = useState(false);
  const [savingAgreement, setSavingAgreement] = useState(false);
  const [appName, setAppName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [defaultSubject, setDefaultSubject] = useState('');
  const [reminderDays, setReminderDays] = useState(3);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setSettings(s);
        setAppName(s.application.appName);
        setSupportEmail(s.application.supportEmail);
        setDefaultSubject(s.agreement.defaultSubject);
        setReminderDays(s.agreement.reminderDays);
      })
      .catch((err) => {
        if (err instanceof SessionExpiredError) return navigate('/admin/login', { replace: true });
        toast.show({ tone: 'error', title: 'Could not load settings', description: err.message });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveApplication() {
    setSavingApp(true);
    try {
      await updateSettingsSection('application', { appName, supportEmail });
      toast.show({ tone: 'success', title: 'Application settings saved' });
    } catch (err) {
      toast.show({ tone: 'error', title: 'Could not save', description: (err as Error).message });
    } finally {
      setSavingApp(false);
    }
  }

  async function saveAgreement() {
    setSavingAgreement(true);
    try {
      await updateSettingsSection('agreement', { defaultSubject, reminderDays });
      toast.show({ tone: 'success', title: 'Agreement settings saved' });
    } catch (err) {
      toast.show({ tone: 'error', title: 'Could not save', description: (err as Error).message });
    } finally {
      setSavingAgreement(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-6">
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-secondary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-[13px] text-[var(--text-muted)]">Manage your admin profile and application configuration.</p>
      </div>

      <div className="flex flex-col gap-4">
        <SectionCard icon={<User size={15} />} title="Admin profile">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Name"><TextInput value={settings.profile.name} disabled /></FieldShell>
            <FieldShell label="Email"><TextInput value={settings.profile.email} disabled /></FieldShell>
          </div>
        </SectionCard>

        <SectionCard icon={<Mail size={15} />} title="Email / SMTP configuration" description="Configured via backend environment variables.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Host"><TextInput value={settings.smtp.host} disabled /></FieldShell>
            <FieldShell label="Port"><TextInput value={settings.smtp.port} disabled /></FieldShell>
            <FieldShell label="Username"><TextInput value={settings.smtp.user} disabled /></FieldShell>
            <FieldShell label="Password"><TextInput value={settings.smtp.configured ? '••••••••' : 'Not configured'} disabled /></FieldShell>
          </div>
        </SectionCard>

        <SectionCard icon={<SettingsIcon size={15} />} title="Application settings">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Application name"><TextInput value={appName} onChange={(e) => setAppName(e.target.value)} /></FieldShell>
            <FieldShell label="Support email"><TextInput value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} /></FieldShell>
          </div>
          <Button variant="primary" size="sm" className="mt-3" onClick={saveApplication} disabled={savingApp}>
            {savingApp ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
          </Button>
        </SectionCard>

        <SectionCard icon={<SettingsIcon size={15} />} title="Agreement settings">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Default subject line"><TextInput value={defaultSubject} onChange={(e) => setDefaultSubject(e.target.value)} /></FieldShell>
            <FieldShell label="Reminder after (days)">
              <TextInput type="number" min={1} value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} />
            </FieldShell>
          </div>
          <Button variant="primary" size="sm" className="mt-3" onClick={saveAgreement} disabled={savingAgreement}>
            {savingAgreement ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
          </Button>
        </SectionCard>

        <SectionCard icon={<Server size={15} />} title="Storage configuration">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Storage driver"><TextInput value={settings.storage.driver} disabled /></FieldShell>
            <FieldShell label="Max upload size (MB)"><TextInput value={settings.storage.maxUploadMb} disabled /></FieldShell>
          </div>
        </SectionCard>

        <SectionCard icon={<ShieldCheck size={15} />} title="Security">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldShell label="Session length"><TextInput value={`${settings.security.sessionLengthHours} hours`} disabled /></FieldShell>
            <FieldShell label="Password hashing"><TextInput value={settings.security.passwordHashing} disabled /></FieldShell>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
