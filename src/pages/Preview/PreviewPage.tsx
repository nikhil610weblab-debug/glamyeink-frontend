import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { PdfCanvas } from '../../components/pdf/PdfCanvas';
import { CanvasControls } from '../../components/layout/CanvasControls';
import { IconButton } from '../../components/ui/IconButton';
import { Button } from '../../components/ui/Button';
import { loadDocument } from '../../services/documentService';
import { exportAgreementPdf } from '../../services/pdfExport';
import { useToast } from '../../components/ui/Toast';
import type { AgreementDocument } from '../../types/document';
import { FIT_ZOOM_BY_BREAKPOINT } from '../../constants/editor';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [doc, setDoc] = useState<AgreementDocument | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const breakpoint = useBreakpoint();
  const [zoom, setZoom] = useState<number>(FIT_ZOOM_BY_BREAKPOINT[breakpoint]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDocument(id).then((result) => {
      if (!result) {
        toast.show({ tone: 'error', title: 'Document not found' });
        navigate('/');
        return;
      }
      setDoc(result.document);
      setBlob(result.blob);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDownload() {
    if (!doc || !blob) return;
    setDownloading(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const exported = await exportAgreementPdf(arrayBuffer, doc);
      const url = URL.createObjectURL(exported);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.show({ tone: 'error', title: 'Export failed', description: 'Could not generate the PDF. Please try again.' });
    } finally {
      setDownloading(false);
    }
  }

  if (!doc || !blob) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--chrome-bg)] text-[var(--chrome-text-muted)]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--chrome-bg)]">
      <header className="flex h-[var(--header-height)] shrink-0 items-center justify-between border-b border-[var(--chrome-border)] px-3">
        <div className="flex items-center gap-2">
          <IconButton tone="chrome" label="Back to editor" onClick={() => navigate(`/editor/${doc.id}`)}>
            <ArrowLeft size={17} />
          </IconButton>
          <div>
            <p className="text-[13px] font-medium text-[var(--chrome-text)]">{doc.name}</p>
            <p className="text-[11px] text-[var(--chrome-text-muted)]">Preview — recipient view</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton tone="chrome" label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => setFullscreen((f) => !f)}>
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </IconButton>
          <Button
            variant="secondary"
            size="sm"
            className="!bg-[var(--chrome-bg-raised)] !border-[var(--chrome-border)] !text-[var(--chrome-text)] hover:!bg-[var(--chrome-border)]"
            icon={downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            onClick={handleDownload}
            disabled={downloading}
          >
            Download
          </Button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <PdfCanvas
          file={blob}
          pageCount={doc.pageCount}
          zoom={zoom}
          fields={doc.fields}
          activeTool="select"
          selectedFieldId={null}
          readOnly
          currentPage={currentPage}
          onDocumentLoad={() => undefined}
          onCurrentPageChange={setCurrentPage}
          onPlaceField={() => undefined}
          onSelectField={() => undefined}
          onUpdateField={() => undefined}
          onDeleteField={() => undefined}
          onDuplicateField={() => undefined}
          onRequestSign={() => undefined}
        />
        <CanvasControls
          zoom={zoom}
          currentPage={currentPage}
          pageCount={doc.pageCount}
          showThumbnails={false}
          onZoomChange={setZoom}
          onFitWidth={() => setZoom(FIT_ZOOM_BY_BREAKPOINT[breakpoint])}
          onPageChange={setCurrentPage}
          onToggleThumbnails={() => undefined}
        />
      </div>
    </div>
  );
}
