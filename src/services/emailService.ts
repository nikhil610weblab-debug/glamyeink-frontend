import type { AgreementField } from '../types/document';

export interface SendAgreementPayload {
  documentId: string;
  documentName: string;
  recipientName: string;
  recipientEmail: string;
  cc: string[];
  subject: string;
  message: string;
  /** Flattened PDF (with the sender's current field values baked in) — used as the email attachment. */
  pdfBlob: Blob;
  /** The original, unflattened PDF — stored so the recipient's signing page can render editable fields. */
  sourcePdfBlob: Blob;
  fields: AgreementField[];
  senderName?: string;
  senderEmail?: string;
}

export interface SentAgreement {
  id: string;
  documentName: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  ccEmails: string[];
  subject: string;
  message: string;
  status: 'sent' | 'viewed' | 'completed' | 'failed';
  pdfPath: string;
  pdfUrl: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  viewedAt?: string | null;
  completedAt?: string | null;
  adminNotificationStatus?: 'pending' | 'sent' | 'failed' | null;
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Sends the agreement through the backend, which owns the SMTP credentials,
 * persists both PDFs (flattened preview + original source) and the field
 * layout, generates a secure signing link, and records the agreement. The
 * frontend never talks to an SMTP server directly.
 */
export async function sendAgreementEmail(payload: SendAgreementPayload): Promise<SentAgreement> {
  const formData = new FormData();
  formData.append('documentId', payload.documentId);
  formData.append('documentName', payload.documentName);
  formData.append('recipientName', payload.recipientName);
  formData.append('recipientEmail', payload.recipientEmail);
  formData.append('cc', JSON.stringify(payload.cc));
  formData.append('subject', payload.subject);
  formData.append('message', payload.message);
  formData.append('fields', JSON.stringify(payload.fields));
  if (payload.senderName) formData.append('senderName', payload.senderName);
  if (payload.senderEmail) formData.append('senderEmail', payload.senderEmail);
  formData.append('file', payload.pdfBlob, `${payload.documentName}.pdf`);
  formData.append('sourceFile', payload.sourcePdfBlob, `${payload.documentName}-source.pdf`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/documents/send`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error(
      `Couldn't reach the email server at ${API_BASE}. Make sure the backend (see /backend) is running.`,
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'The email server rejected the request. Please try again.');
  }

  return data.agreement as SentAgreement;
}
