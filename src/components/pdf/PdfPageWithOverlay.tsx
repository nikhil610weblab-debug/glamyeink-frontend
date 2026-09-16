import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import { Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import type { AgreementField, FieldType, ToolId } from '../../types/document';
import { FieldObject } from '../editor/FieldObject';
import { pointerToPagePct } from '../../utils/geometry';
import { TOOLS } from '../../constants/editor';

interface Props {
  pageIndex: number;
  zoom: number;
  fields: AgreementField[];
  activeTool: ToolId;
  selectedFieldId: string | null;
  readOnly?: boolean;
  hideControlsWhenLocked?: boolean;
  onRegisterPageEl: (pageIndex: number, el: HTMLDivElement | null) => void;
  onPlaceField: (type: FieldType, page: number, xPct: number, yPct: number) => void;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, patch: Partial<AgreementField>, opts?: { commit?: boolean }) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
  onRequestSign: (id: string) => void;
}

export function PdfPageWithOverlay({
  pageIndex,
  zoom,
  fields,
  activeTool,
  selectedFieldId,
  readOnly,
  hideControlsWhenLocked,
  onRegisterPageEl,
  onPlaceField,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onRequestSign,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [dragOver, setDragOver] = useState(false);
  const tool = TOOLS.find((t) => t.id === activeTool);
  const insertFieldType = tool?.fieldType;

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    onRegisterPageEl(pageIndex, el);
    return () => {
      observer.disconnect();
      onRegisterPageEl(pageIndex, null);
    };
  }, [pageIndex, onRegisterPageEl]);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (readOnly) return;
    if (e.target !== wrapperRef.current && !(e.target as HTMLElement).classList.contains('pdf-page-surface')) return;
    if (insertFieldType) {
      const { xPct, yPct } = pointerToPagePct(e.clientX, e.clientY, wrapperRef.current!);
      onPlaceField(insertFieldType, pageIndex, xPct, yPct);
    } else {
      onSelectField(null);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (readOnly) return;
    const type = e.dataTransfer.getData('application/x-field-type') as FieldType | '';
    if (!type || !wrapperRef.current) return;
    const { xPct, yPct } = pointerToPagePct(e.clientX, e.clientY, wrapperRef.current);
    onPlaceField(type, pageIndex, xPct, yPct);
  }

  return (
    <div
      data-page-index={pageIndex}
      ref={wrapperRef}
      onClick={handleClick}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-field-type')) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className="pdf-page-surface relative bg-white shadow-[var(--shadow-md)]"
      style={{
        outline: dragOver ? '2px solid var(--brand)' : 'none',
        outlineOffset: 2,
        cursor: insertFieldType ? 'crosshair' : 'default',
      }}
    >
      <Page
        pageNumber={pageIndex + 1}
        scale={zoom}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        className="pdf-page-surface pointer-events-none select-none"
        loading={<PageSkeleton />}
      />
      {size.width > 0 &&
        fields.map((field) => (
          <FieldObject
            key={field.id}
            field={field}
            pageWidth={size.width}
            pageHeight={size.height}
            selected={selectedFieldId === field.id}
            readOnly={readOnly}
            hideControlsWhenLocked={hideControlsWhenLocked}
            onSelect={() => onSelectField(field.id)}
            onChange={(patch, opts) => onUpdateField(field.id, patch, opts)}
            onDelete={() => onDeleteField(field.id)}
            onDuplicate={() => onDuplicateField(field.id)}
            onRequestSign={() => onRequestSign(field.id)}
          />
        ))}
    </div>
  );
}

function PageSkeleton() {
  return <div className="animate-pulse bg-[var(--surface-secondary)]" style={{ width: 612, height: 792 }} />;
}
