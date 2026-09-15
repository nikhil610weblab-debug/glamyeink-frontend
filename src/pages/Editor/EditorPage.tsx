import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { EditorHeader } from '../../components/layout/EditorHeader';
import { EditorToolbar } from '../../components/toolbar/EditorToolbar';
import { PropertiesPanel } from '../../components/panels/PropertiesPanel';
import { MobilePropertiesSheet } from '../../components/panels/MobilePropertiesSheet';
import { PdfCanvas } from '../../components/pdf/PdfCanvas';
import { ThumbnailSidebar } from '../../components/pdf/ThumbnailSidebar';
import { PageDrawer } from '../../components/pdf/PageDrawer';
import { CanvasControls } from '../../components/layout/CanvasControls';
import { SignatureModal } from '../../components/signature/SignatureModal';
import { SendModal } from '../../components/modals/SendModal';
import { useEditorStore } from '../../context/editorStore';
import { useEditorKeyboardShortcuts } from '../../hooks/useEditorKeyboardShortcuts';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { loadDocument, persistDocument } from '../../services/documentService';
import { exportAgreementPdf } from '../../services/pdfExport';
import { useToast } from '../../components/ui/Toast';
import { FIT_ZOOM_BY_BREAKPOINT } from '../../constants/editor';
import type { DocumentStatus, SignaturePayload } from '../../types/document';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const store = useEditorStore();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [pageDrawerOpen, setPageDrawerOpen] = useState(false);
  const [signModalFieldId, setSignModalFieldId] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPdfBlob, setSendPdfBlob] = useState<Blob | null>(null);
  const [preparingSend, setPreparingSend] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === 'desktop';

  useEffect(() => {
    if (!id) return;
    loadDocument(id).then((result) => {
      if (!result) {
        toast.show({ tone: 'error', title: 'Document not found' });
        navigate('/');
        return;
      }
      store.loadDocument(result.document);
      store.setZoom(FIT_ZOOM_BY_BREAKPOINT[breakpoint]);
      setBlob(result.blob);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!store.document) return;
    setIsSaving(true);
    try {
      await persistDocument(store.document);
      store.markSaved();
    } catch {
      toast.show({ tone: 'error', title: 'Save failed', description: 'Your changes could not be saved.' });
    } finally {
      setIsSaving(false);
    }
  }, [store, toast]);

  // Debounced autosave
  useEffect(() => {
    if (!store.isDirty) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(handleSave, 1200);
    return () => window.clearTimeout(saveTimer.current);
  }, [store.document, store.isDirty, handleSave]);

  useEditorKeyboardShortcuts({ onSave: handleSave, enabled: !loading });

  const handleOpenSend = useCallback(async () => {
    if (!blob || !store.document) return;
    setPreparingSend(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const exported = await exportAgreementPdf(arrayBuffer, store.document);
      setSendPdfBlob(exported);
      setSendOpen(true);
    } catch {
      toast.show({ tone: 'error', title: 'Could not prepare PDF', description: 'Please try sending again.' });
    } finally {
      setPreparingSend(false);
    }
  }, [blob, store.document, toast]);

  if (loading || !store.document) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--chrome-bg)] text-[var(--chrome-text-muted)]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  const doc = store.document;
  const selectedField = doc.fields.find((f) => f.id === store.selectedFieldId) ?? null;
  const signModalField = doc.fields.find((f) => f.id === signModalFieldId) ?? null;

  return (
    <div className="flex h-full flex-col bg-[var(--chrome-bg)]">
      <EditorHeader
        name={doc.name}
        status={doc.status}
        isDirty={store.isDirty}
        isSaving={isSaving}
        canUndo={store.past.length > 0}
        canRedo={store.future.length > 0}
        onRename={store.renameDocument}
        onBack={() => navigate('/')}
        onUndo={store.undo}
        onRedo={store.redo}
        onSave={handleSave}
        onPreview={() => navigate(`/preview/${doc.id}`)}
        onSend={handleOpenSend}
        sendDisabled={preparingSend}
        onOpenPages={() => setPageDrawerOpen(true)}
      />
      <div className="flex min-h-0 flex-1">
        {isDesktop && <EditorToolbar activeTool={store.activeTool} onSelectTool={store.setActiveTool} />}
        {isDesktop && (
          <ThumbnailSidebar
            file={blob}
            pageCount={doc.pageCount}
            currentPage={store.currentPage}
            collapsed={!showThumbnails}
            onSelectPage={store.setCurrentPage}
            onToggleCollapse={() => setShowThumbnails((v) => !v)}
          />
        )}
        <div className="relative min-w-0 flex-1">
          <PdfCanvas
            file={blob}
            pageCount={doc.pageCount}
            zoom={store.zoom}
            fields={doc.fields}
            activeTool={store.activeTool}
            selectedFieldId={store.selectedFieldId}
            currentPage={store.currentPage}
            onDocumentLoad={() => undefined}
            onCurrentPageChange={store.setCurrentPage}
            onPlaceField={store.addField}
            onSelectField={store.selectField}
            onUpdateField={store.updateField}
            onDeleteField={store.removeField}
            onDuplicateField={store.duplicateField}
            onRequestSign={setSignModalFieldId}
            onLoadError={(m) => toast.show({ tone: 'error', title: 'Could not open PDF', description: m })}
          />
          <CanvasControls
            zoom={store.zoom}
            currentPage={store.currentPage}
            pageCount={doc.pageCount}
            showThumbnails={isDesktop ? showThumbnails : pageDrawerOpen}
            onZoomChange={store.setZoom}
            onFitWidth={() => store.setZoom(FIT_ZOOM_BY_BREAKPOINT[breakpoint])}
            onPageChange={store.setCurrentPage}
            onToggleThumbnails={() => (isDesktop ? setShowThumbnails((v) => !v) : setPageDrawerOpen((v) => !v))}
          />
        </div>
        {isDesktop && (
          <PropertiesPanel
            field={selectedField}
            onChange={(patch) => selectedField && store.updateField(selectedField.id, patch, { commit: true })}
            onDelete={() => selectedField && store.removeField(selectedField.id)}
            onDuplicate={() => selectedField && store.duplicateField(selectedField.id)}
          />
        )}
      </div>
      {!isDesktop && <EditorToolbar variant="mobile" activeTool={store.activeTool} onSelectTool={store.setActiveTool} />}

      {!isDesktop && (
        <PageDrawer
          open={pageDrawerOpen}
          file={blob}
          pageCount={doc.pageCount}
          currentPage={store.currentPage}
          onSelectPage={store.setCurrentPage}
          onClose={() => setPageDrawerOpen(false)}
        />
      )}

      {!isDesktop && selectedField && (
        <MobilePropertiesSheet
          field={selectedField}
          onChange={(patch) => store.updateField(selectedField.id, patch, { commit: true })}
          onDelete={() => store.removeField(selectedField.id)}
          onDuplicate={() => store.duplicateField(selectedField.id)}
          onClose={() => store.selectField(null)}
        />
      )}

      <SignatureModal
        open={!!signModalField}
        fieldLabel={signModalField?.label ?? ''}
        onClose={() => setSignModalFieldId(null)}
        onInsert={(payload: SignaturePayload) => {
          if (signModalField) store.updateField(signModalField.id, { signature: payload }, { commit: true });
          setSignModalFieldId(null);
        }}
      />

      <SendModal
        open={sendOpen}
        document={doc}
        pdfBlob={sendPdfBlob}
        sourcePdfBlob={blob}
        onClose={() => setSendOpen(false)}
        onSent={(agreement) => {
          const now = new Date().toISOString();
          const next = {
            ...doc,
            status: (agreement.status === 'failed' ? 'ready' : 'sent') as DocumentStatus,
            recipient: { name: agreement.recipientName, email: agreement.recipientEmail },
            sender: { name: agreement.senderName, email: agreement.senderEmail },
            ccEmails: agreement.ccEmails,
            message: agreement.message,
            sentAt: agreement.sentAt ?? now,
            updatedAt: now,
          };
          store.loadDocument(next);
          persistDocument(next);
          setSendOpen(false);
          toast.show({ tone: 'success', title: 'Agreement sent successfully', description: `Stored and emailed to ${agreement.recipientEmail}` });
        }}
      />
    </div>
  );
}
