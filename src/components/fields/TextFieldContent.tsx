import { useEffect, useRef } from 'react';
import type { AgreementField } from '../../types/document';
import { sanitizeText } from '../../utils/validation';

interface Props {
  field: AgreementField;
  editing: boolean;
  onChange: (value: string) => void;
  onStopEditing: () => void;
}

export function TextFieldContent({ field, editing, onChange, onStopEditing }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  const { style } = field;

  return (
    <div
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={(e) => {
        onChange(sanitizeText(e.currentTarget.textContent ?? ''));
        onStopEditing();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.currentTarget.blur();
        }
        e.stopPropagation();
      }}
      className="w-full h-full overflow-hidden outline-none"
      style={{
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        color: style.color,
        textAlign: style.textAlign,
        letterSpacing: style.letterSpacing,
        lineHeight: style.lineHeight,
        cursor: editing ? 'text' : 'inherit',
      }}
    >
      {field.value || (editing ? '' : field.placeholder || 'Text')}
    </div>
  );
}
