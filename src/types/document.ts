export type FieldType =
  | 'text'
  | 'signature'
  | 'initials'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'image';

export type DocumentStatus = 'draft' | 'ready' | 'sent' | 'viewed' | 'signed' | 'completed';

export type SignatureSource = 'draw' | 'type' | 'upload';

export interface FieldStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  opacity: number;
}

export const DEFAULT_FIELD_STYLE: FieldStyle = {
  fontFamily: 'Inter',
  fontSize: 12,
  fontWeight: 400,
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#171B21',
  backgroundColor: 'transparent',
  borderColor: '#0F5C52',
  borderWidth: 1,
  borderRadius: 3,
  textAlign: 'left',
  letterSpacing: 0,
  lineHeight: 1.3,
  opacity: 1,
};

export interface SignaturePayload {
  source: SignatureSource;
  /** data URL, always a transparent PNG once normalized */
  imageDataUrl: string;
  typedText?: string;
  typedFont?: string;
  createdAt: string;
}

export interface AgreementField {
  id: string;
  type: FieldType;
  page: number; // 0-indexed
  /** position & size stored as a fraction (0–1) of page width/height so it is zoom- and resize-independent */
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  label: string;
  placeholder?: string;
  fieldName: string;
  required: boolean;
  locked: boolean;
  value?: string;
  options?: string[]; // dropdown / radio
  checked?: boolean; // checkbox
  signature?: SignaturePayload;
  style: FieldStyle;
  createdAt: string;
  updatedAt: string;
}

export interface Recipient {
  name: string;
  email: string;
}

export interface AgreementDocument {
  id: string;
  name: string;
  pageCount: number;
  pageAspectRatios: number[]; // width / height per page, for layout before render
  status: DocumentStatus;
  fields: AgreementField[];
  sender?: Recipient;
  recipient?: Recipient;
  ccEmails?: string[];
  message?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  completedAt?: string;
}

export interface StoredSignature {
  id: string;
  payload: SignaturePayload;
  name: string;
  createdAt: string;
}

export type ToolId =
  | 'select'
  | 'pan'
  | 'text'
  | 'signature'
  | 'initials'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'image'
  | 'comment';
