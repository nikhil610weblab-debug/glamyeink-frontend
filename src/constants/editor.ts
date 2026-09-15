import type { FieldType, ToolId } from '../types/document';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  shortcut?: string;
  fieldType?: FieldType;
  group: 'navigate' | 'insert' | 'annotate';
}

export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Select', shortcut: 'V', group: 'navigate' },
  { id: 'pan', label: 'Pan', shortcut: 'H', group: 'navigate' },
  { id: 'text', label: 'Text', fieldType: 'text', group: 'insert' },
  { id: 'signature', label: 'Signature', fieldType: 'signature', group: 'insert' },
  { id: 'initials', label: 'Initials', fieldType: 'initials', group: 'insert' },
  { id: 'date', label: 'Date', fieldType: 'date', group: 'insert' },
  { id: 'checkbox', label: 'Checkbox', fieldType: 'checkbox', group: 'insert' },
  { id: 'radio', label: 'Radio button', fieldType: 'radio', group: 'insert' },
  { id: 'dropdown', label: 'Dropdown', fieldType: 'dropdown', group: 'insert' },
  { id: 'image', label: 'Image', fieldType: 'image', group: 'insert' },
  { id: 'comment', label: 'Comment', group: 'annotate' },
];

export const FIELD_DEFAULT_SIZE_PCT: Record<FieldType, { width: number; height: number }> = {
  text: { width: 0.22, height: 0.032 },
  signature: { width: 0.22, height: 0.06 },
  initials: { width: 0.09, height: 0.05 },
  date: { width: 0.16, height: 0.032 },
  checkbox: { width: 0.025, height: 0.025 },
  radio: { width: 0.025, height: 0.025 },
  dropdown: { width: 0.2, height: 0.036 },
  image: { width: 0.2, height: 0.12 },
};

export const FIELD_LABELS: Record<FieldType, string> = {
  text: 'Text',
  signature: 'Signature',
  initials: 'Initials',
  date: 'Date',
  checkbox: 'Checkbox',
  radio: 'Radio button',
  dropdown: 'Dropdown',
  image: 'Image',
};

export const SIGNATURE_FONTS = [
  { id: 'dancing-script', label: 'Dancing Script', family: "'Dancing Script', cursive" },
  { id: 'great-vibes', label: 'Great Vibes', family: "'Great Vibes', cursive" },
  { id: 'sacramento', label: 'Sacramento', family: "'Sacramento', cursive" },
  { id: 'caveat', label: 'Caveat', family: "'Caveat', cursive" },
];

export const UI_FONTS = [
  'Inter',
  'Georgia',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
];

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const FIT_ZOOM_BY_BREAKPOINT = { mobile: 0.42, tablet: 0.7, desktop: 1 } as const;

export const MAX_UPLOAD_MB = 25;
export const ACCEPTED_PDF_TYPES = ['application/pdf'];
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const ARROW_NUDGE_PCT = 0.002;
export const ARROW_NUDGE_PCT_LARGE = 0.015;
