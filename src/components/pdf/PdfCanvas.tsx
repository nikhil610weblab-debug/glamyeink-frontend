import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document } from 'react-pdf';
import type { AgreementField, FieldType, ToolId } from '../../types/document';
import { PdfPageWithOverlay } from './PdfPageWithOverlay';
import { CANVAS_PADDING_TOP } from '../../constants/layout';

interface PdfCanvasProps {
  file: Blob | null;
  pageCount: number;
  zoom: number;
  fields: AgreementField[];
  activeTool: ToolId;
  selectedFieldId: string | null;
  readOnly?: boolean;
  hideControlsWhenLocked?: boolean;
  currentPage: number;
  onDocumentLoad: (numPages: number) => void;
  onCurrentPageChange: (page: number) => void;
  onPlaceField: (type: FieldType, page: number, xPct: number, yPct: number) => void;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, patch: Partial<AgreementField>, opts?: { commit?: boolean }) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (id: string) => void;
  onRequestSign: (id: string) => void;
  onLoadError?: (message: string) => void;
  scrollToPageToken?: number;
}

export function PdfCanvas({
  file,
  pageCount,
  zoom,
  fields,
  activeTool,
  selectedFieldId,
  readOnly,
  hideControlsWhenLocked,
  currentPage,
  onDocumentLoad,
  onCurrentPageChange,
  onPlaceField,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onRequestSign,
  onLoadError,
  scrollToPageToken,
}: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [numPages, setNumPages] = useState(pageCount);

  const registerPageEl = useCallback((pageIndex: number, el: HTMLDivElement | null) => {
    if (el) pageRefs.current.set(pageIndex, el);
    else pageRefs.current.delete(pageIndex);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = Number((visible.target as HTMLElement).dataset.pageIndex);
          if (!Number.isNaN(idx)) onCurrentPageChange(idx);
        }
      },
      { root: container, threshold: [0.3, 0.6, 0.9] },
    );
    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, onCurrentPageChange]);

  useEffect(() => {
    if (scrollToPageToken === undefined) return;
    const el = pageRefs.current.get(currentPage);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToPageToken]);

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i), [numPages]);

  if (!file) return null;

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-auto"
      style={{ background: 'var(--surface-sunken)', paddingTop: CANVAS_PADDING_TOP }}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          onDocumentLoad(n);
        }}
        onLoadError={(err) => onLoadError?.(err.message || 'This PDF could not be opened.')}
        loading={<div className="py-24 text-center text-[var(--text-muted)]">Loading document…</div>}
        error={<div className="py-24 text-center text-[var(--danger)]">This file couldn't be read as a PDF.</div>}
        className="flex flex-col items-center gap-6 pb-24"
      >
        {pages.map((pageIndex) => (
          <PdfPageWithOverlay
            key={pageIndex}
            pageIndex={pageIndex}
            zoom={zoom}
            fields={fields.filter((f) => f.page === pageIndex)}
            activeTool={activeTool}
            selectedFieldId={selectedFieldId}
            readOnly={readOnly}
            hideControlsWhenLocked={hideControlsWhenLocked}
            onRegisterPageEl={registerPageEl}
            onPlaceField={onPlaceField}
            onSelectField={onSelectField}
            onUpdateField={onUpdateField}
            onDeleteField={onDeleteField}
            onDuplicateField={onDuplicateField}
            onRequestSign={onRequestSign}
          />
        ))}
      </Document>
    </div>
  );
}
