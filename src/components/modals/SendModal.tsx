import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FieldShell, TextArea, TextInput } from '../ui/Field';
import { isValidEmail } from '../../utils/validation';
import { sendAgreementEmail, type SentAgreement } from '../../services/emailService';
import type { AgreementDocument } from '../../types/document';

interface Props {
  open: boolean;
  document: AgreementDocument;
  pdfBlob: Blob | null;
  sourcePdfBlob: Blob | null;
  onClose: () => void;
  onSent: (agreement: SentAgreement) => void;
}

export function SendModal({ open, document, pdfBlob, sourcePdfBlob, onClose, onSent }: Props) {
  const [recipientName, setRecipientName] = useState(document.recipient?.name ?? '');
  const [recipientEmail, setRecipientEmail] = useState(document.recipient?.email ?? '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(`Please sign: ${document.name}`);
  const [message, setMessage] = useState(
    `Hi${recipientName ? ` ${recipientName}` : ''},\n\nPlease review and sign the attached agreement, "${document.name}".\n\nThanks.`,
  );
  const [showSender, setShowSender] = useState(false);
  const [senderName, setSenderName] = useState(document.sender?.name ?? '');
  const [senderEmail, setSenderEmail] = useState(document.sender?.email ?? '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errors = {
    name: recipientName.trim().length === 0 ? 'Recipient name is required.' : undefined,
    email: !isValidEmail(recipientEmail) ? 'Enter a valid email address.' : undefined,
    senderEmail: senderEmail && !isValidEmail(senderEmail) ? 'Enter a valid email address.' : undefined,
  };
  const ccList = cc
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  const ccInvalid = ccList.some((e) => !isValidEmail(e));

  const canSend = !errors.name && !errors.email && !errors.senderEmail && !ccInvalid && !!pdfBlob && !!sourcePdfBlob;

  async function handleSend() {
    if (!canSend || !pdfBlob || !sourcePdfBlob) return;
    setSending(true);
    setError(null);
    try {
      const agreement = await sendAgreementEmail({
        documentId: document.id,
        documentName: document.name,
        recipientName,
        recipientEmail,
        cc: ccList,
        subject,
        message,
        pdfBlob,
        sourcePdfBlob,
        fields: document.fields,
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      });
      onSent(agreement);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not send the agreement. Check your connection and try again.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={sending ? () => undefined : onClose}
      title="Send agreement"
      description="Your recipient will receive this document by email."
      width={480}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={!canSend || sending} icon={sending ? <Loader2 size={14} className="animate-spin" /> : undefined}>
            {sending ? 'Sending…' : 'Send agreement'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldShell label="Recipient name">
            <TextInput value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jordan Blake" />
          </FieldShell>
          <FieldShell label="Recipient email">
            <TextInput
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="jordan@company.com"
            />
          </FieldShell>
        </div>
        <FieldShell label="CC" hint="Comma-separated for multiple addresses" error={ccInvalid ? 'One or more CC addresses look invalid.' : undefined}>
          <TextInput value={cc} onChange={(e) => setCc(e.target.value)} placeholder="finance@company.com" />
        </FieldShell>
        <FieldShell label="Subject">
          <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
        </FieldShell>
        <FieldShell label="Message">
          <TextArea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </FieldShell>

        <button
          type="button"
          onClick={() => setShowSender((v) => !v)}
          className="flex items-center gap-1 self-start text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Sender details (optional)
          {showSender ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showSender && (
          <div className="grid grid-cols-2 gap-3">
            <FieldShell label="Your name">
              <TextInput value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" />
            </FieldShell>
            <FieldShell label="Your email" error={errors.senderEmail}>
              <TextInput value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="you@company.com" />
            </FieldShell>
          </div>
        )}

        <div className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 py-2.5">
          <FileText size={16} className="shrink-0 text-[var(--text-muted)]" />
          <span className="truncate text-[12.5px] text-[var(--text-secondary)]">{document.name}.pdf</span>
        </div>

        {error && <p className="text-[12.5px] text-[var(--danger)]">{error}</p>}
      </div>
    </Modal>
  );
}
