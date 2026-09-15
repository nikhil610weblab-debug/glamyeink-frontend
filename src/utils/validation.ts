import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_MB } from '../constants/editor';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): FileValidationResult {
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    return { valid: false, error: 'Only PDF files are supported.' };
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_UPLOAD_MB) {
    return { valid: false, error: `File is too large. Maximum size is ${MAX_UPLOAD_MB}MB.` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'This file appears to be empty or corrupted.' };
  }
  return { valid: true };
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PNG, JPG, or WebP image.' };
  }
  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > 8) {
    return { valid: false, error: 'Image is too large. Maximum size is 8MB.' };
  }
  return { valid: true };
}

/** Strips characters that could be used for HTML/script injection when rendering user text into the DOM or PDF. */
export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, '');
}
