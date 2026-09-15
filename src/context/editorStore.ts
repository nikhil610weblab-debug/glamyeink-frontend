import { create } from 'zustand';
import { createId } from '../utils/id';
import { FIELD_DEFAULT_SIZE_PCT, FIELD_LABELS, DEFAULT_ZOOM } from '../constants/editor';
import { DEFAULT_FIELD_STYLE } from '../types/document';
import type { AgreementDocument, AgreementField, FieldType, ToolId } from '../types/document';

const HISTORY_LIMIT = 100;

interface HistoryEntry {
  fields: AgreementField[];
}

interface EditorState {
  document: AgreementDocument | null;
  activeTool: ToolId;
  selectedFieldId: string | null;
  currentPage: number;
  zoom: number;
  isDirty: boolean;
  past: HistoryEntry[];
  future: HistoryEntry[];
  clipboard: AgreementField | null;

  loadDocument: (doc: AgreementDocument) => void;
  setActiveTool: (tool: ToolId) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  selectField: (id: string | null) => void;
  renameDocument: (name: string) => void;

  addField: (type: FieldType, page: number, xPct: number, yPct: number) => string;
  updateField: (id: string, patch: Partial<AgreementField>, opts?: { commit?: boolean }) => void;
  commitHistory: () => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  copyField: (id: string) => void;
  pasteField: (page: number) => void;

  undo: () => void;
  redo: () => void;
  markSaved: () => void;
}

function snapshot(fields: AgreementField[]): AgreementField[] {
  return fields.map((f) => ({ ...f, style: { ...f.style } }));
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  document: null,
  activeTool: 'select',
  selectedFieldId: null,
  currentPage: 0,
  zoom: DEFAULT_ZOOM,
  isDirty: false,
  past: [],
  future: [],
  clipboard: null,

  loadDocument: (doc) =>
    set({
      document: doc,
      past: [],
      future: [],
      selectedFieldId: null,
      currentPage: 0,
      isDirty: false,
      activeTool: 'select',
    }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedFieldId: null }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setZoom: (zoom) => set({ zoom }),
  selectField: (id) => set({ selectedFieldId: id }),
  renameDocument: (name) =>
    set((s) => (s.document ? { document: { ...s.document, name, updatedAt: new Date().toISOString() }, isDirty: true } : s)),

  addField: (type, page, xPct, yPct) => {
    const state = get();
    if (!state.document) return '';
    const size = FIELD_DEFAULT_SIZE_PCT[type];
    const id = createId('field');
    const now = new Date().toISOString();
    const newField: AgreementField = {
      id,
      type,
      page,
      xPct: Math.max(0, Math.min(1 - size.width, xPct - size.width / 2)),
      yPct: Math.max(0, Math.min(1 - size.height, yPct - size.height / 2)),
      widthPct: size.width,
      heightPct: size.height,
      label: FIELD_LABELS[type],
      fieldName: `${type}_${state.document.fields.length + 1}`,
      required: type === 'signature',
      locked: false,
      options: type === 'dropdown' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      checked: false,
      style: { ...DEFAULT_FIELD_STYLE },
      createdAt: now,
      updatedAt: now,
    };

    set((s) => ({
      past: pushHistory(s.past, { fields: snapshot(s.document!.fields) }),
      future: [],
      document: { ...s.document!, fields: [...s.document!.fields, newField], updatedAt: now },
      selectedFieldId: id,
      activeTool: 'select',
      isDirty: true,
    }));
    return id;
  },

  updateField: (id, patch, opts) => {
    const state = get();
    if (!state.document) return;
    const commit = opts?.commit !== false;
    set((s) => {
      const doc = s.document!;
      const nextFields = doc.fields.map((f) =>
        f.id === id ? { ...f, ...patch, style: { ...f.style, ...(patch.style ?? {}) }, updatedAt: new Date().toISOString() } : f,
      );
      return {
        document: { ...doc, fields: nextFields, updatedAt: new Date().toISOString() },
        past: commit ? pushHistory(s.past, { fields: snapshot(doc.fields) }) : s.past,
        future: commit ? [] : s.future,
        isDirty: true,
      };
    });
  },

  commitHistory: () => {
    // no-op placeholder retained for API symmetry with drag interactions that
    // batch continuous updates and then commit once on pointer-up
  },

  removeField: (id) => {
    set((s) => {
      if (!s.document) return s;
      return {
        past: pushHistory(s.past, { fields: snapshot(s.document.fields) }),
        future: [],
        document: { ...s.document, fields: s.document.fields.filter((f) => f.id !== id), updatedAt: new Date().toISOString() },
        selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
        isDirty: true,
      };
    });
  },

  duplicateField: (id) => {
    set((s) => {
      if (!s.document) return s;
      const original = s.document.fields.find((f) => f.id === id);
      if (!original) return s;
      const now = new Date().toISOString();
      const copy: AgreementField = {
        ...original,
        id: createId('field'),
        xPct: Math.min(1 - original.widthPct, original.xPct + 0.02),
        yPct: Math.min(1 - original.heightPct, original.yPct + 0.02),
        createdAt: now,
        updatedAt: now,
      };
      return {
        past: pushHistory(s.past, { fields: snapshot(s.document.fields) }),
        future: [],
        document: { ...s.document, fields: [...s.document.fields, copy], updatedAt: now },
        selectedFieldId: copy.id,
        isDirty: true,
      };
    });
  },

  copyField: (id) => {
    const field = get().document?.fields.find((f) => f.id === id);
    if (field) set({ clipboard: { ...field, style: { ...field.style } } });
  },

  pasteField: (page) => {
    set((s) => {
      if (!s.document || !s.clipboard) return s;
      const now = new Date().toISOString();
      const copy: AgreementField = {
        ...s.clipboard,
        id: createId('field'),
        page,
        xPct: Math.min(1 - s.clipboard.widthPct, s.clipboard.xPct + 0.02),
        yPct: Math.min(1 - s.clipboard.heightPct, s.clipboard.yPct + 0.02),
        createdAt: now,
        updatedAt: now,
      };
      return {
        past: pushHistory(s.past, { fields: snapshot(s.document.fields) }),
        future: [],
        document: { ...s.document, fields: [...s.document.fields, copy], updatedAt: now },
        selectedFieldId: copy.id,
        isDirty: true,
      };
    });
  },

  undo: () => {
    set((s) => {
      if (!s.document || s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      const rest = s.past.slice(0, -1);
      return {
        past: rest,
        future: [{ fields: snapshot(s.document.fields) }, ...s.future],
        document: { ...s.document, fields: previous.fields },
        isDirty: true,
      };
    });
  },

  redo: () => {
    set((s) => {
      if (!s.document || s.future.length === 0) return s;
      const next = s.future[0];
      const rest = s.future.slice(1);
      return {
        future: rest,
        past: pushHistory(s.past, { fields: snapshot(s.document.fields) }),
        document: { ...s.document, fields: next.fields },
        isDirty: true,
      };
    });
  },

  markSaved: () => set({ isDirty: false }),
}));

function pushHistory(stack: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const next = [...stack, entry];
  if (next.length > HISTORY_LIMIT) next.shift();
  return next;
}
