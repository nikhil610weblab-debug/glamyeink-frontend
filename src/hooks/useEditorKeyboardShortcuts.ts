import { useEffect } from 'react';
import { useEditorStore } from '../context/editorStore';
import { ARROW_NUDGE_PCT, ARROW_NUDGE_PCT_LARGE } from '../constants/editor';
import { clamp } from '../utils/geometry';

interface Options {
  onSave: () => void;
  enabled: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function useEditorKeyboardShortcuts({ onSave, enabled }: Options) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const state = useEditorStore.getState();
      const editingText = isEditableTarget(e.target);

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
        return;
      }

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
        return;
      }

      if (editingText) return;

      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (state.selectedFieldId) state.duplicateField(state.selectedFieldId);
        return;
      }

      if (mod && e.key.toLowerCase() === 'c') {
        if (state.selectedFieldId) state.copyField(state.selectedFieldId);
        return;
      }

      if (mod && e.key.toLowerCase() === 'v') {
        state.pasteField(state.currentPage);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedFieldId) {
        e.preventDefault();
        state.removeField(state.selectedFieldId);
        return;
      }

      if (e.key === 'Escape') {
        state.selectField(null);
        state.setActiveTool('select');
        return;
      }

      if (e.key.startsWith('Arrow') && state.selectedFieldId && state.document) {
        e.preventDefault();
        const field = state.document.fields.find((f) => f.id === state.selectedFieldId);
        if (!field || field.locked) return;
        const step = e.shiftKey ? ARROW_NUDGE_PCT_LARGE : ARROW_NUDGE_PCT;
        let { xPct, yPct } = field;
        if (e.key === 'ArrowUp') yPct -= step;
        if (e.key === 'ArrowDown') yPct += step;
        if (e.key === 'ArrowLeft') xPct -= step;
        if (e.key === 'ArrowRight') xPct += step;
        state.updateField(
          field.id,
          {
            xPct: clamp(xPct, 0, 1 - field.widthPct),
            yPct: clamp(yPct, 0, 1 - field.heightPct),
          },
          { commit: true },
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onSave]);
}
