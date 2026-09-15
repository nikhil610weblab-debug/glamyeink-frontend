import { API_BASE } from './emailService';
import type { AgreementField } from '../types/document';

export interface PublicAgreement {
  id: string;
  documentName: string;
  senderName: string;
  recipientName: string;
  status: 'sent' | 'viewed' | 'completed' | 'failed';
  pdfUrl: string;
  fields: AgreementField[];
  completedAt: string | null;
}

async function parseError(response: Response, fallback: string): Promise<never> {
  const body = await response.json().catch(() => null);
  throw new Error(body?.error || fallback);
}

/** Fetches the agreement for a signing link. The token is the only credential required. */
export async function fetchPublicAgreement(id: string, token: string): Promise<PublicAgreement> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/public/agreements/${id}/${token}`);
  } catch {
    throw new Error(`Couldn't reach GlamyeInk at ${API_BASE}. Check your connection and try again.`);
  }
  if (!response.ok) return parseError(response, 'This signing link is invalid or has expired.');
  return response.json();
}

export async function saveAgreementProgress(id: string, token: string, fields: AgreementField[]): Promise<void> {
  const response = await fetch(`${API_BASE}/api/public/agreements/${id}/${token}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: JSON.stringify(fields) }),
  });
  if (!response.ok) return parseError(response, 'Your changes could not be saved.');
}

export async function submitSignedAgreement(
  id: string,
  token: string,
  signedPdf: Blob,
  fields: AgreementField[],
): Promise<void> {
  const formData = new FormData();
  formData.append('signedFile', signedPdf, 'signed-agreement.pdf');
  formData.append('fields', JSON.stringify(fields));

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/public/agreements/${id}/${token}/sign`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error(`Couldn't reach GlamyeInk at ${API_BASE}. Check your connection and try again.`);
  }
  if (!response.ok) return parseError(response, 'The agreement could not be submitted. Please try again.');
}
