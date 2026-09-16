import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Download, FileWarning, Loader2, ChevronRight } from 'lucide-react';
import { SignHeader } from '../../components/layout/SignHeader';
import { EditorToolbar } from '../../components/toolbar/EditorToolbar';
import { PropertiesPanel } from '../../components/panels/PropertiesPanel';
import { MobilePropertiesSheet } from '../../components/panels/MobilePropertiesSheet';
import { PdfCanvas, type PdfCanvasHandle } from '../../components/pdf/PdfCanvas';
import { ThumbnailSidebar } from '../../components/pdf/ThumbnailSidebar';
import { PageDrawer } from '../../components/pdf/PageDrawer';
import { CanvasControls } from '../../components/layout/CanvasControls';
import { SignatureModal } from '../../components/signature/SignatureModal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useEditorStore } from '../../context/editorStore';
import { useEditorKeyboardShortcuts } from '../../hooks/useEditorKeyboardShortcuts';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { FIT_ZOOM_BY_BREAKPOINT } from '../../constants/editor';
import { exportAgreementPdf } from '../../services/pdfExport';
import {
  fetchPublicAgreement,
  saveAgreementProgress,
  submitSignedAgreement,
  type PublicAgreement,
} from '../../services/signingService';
import type { AgreementField, SignaturePayload } from '../../types/document';

type ViewState = 'loading' | 'error' | 'expired' | 'ready' | 'already-signed' | 'success';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function isFieldIncomplete(f: AgreementField) {
  if (f.type === 'signature' || f.type === 'initials') return !f.signature;
  if (f.type === 'image') return !f.value;
  if (f.type === 'checkbox' || f.type === 'radio') return false;
  return !f.value?.trim();
}

export function SignPage() {
  const { id, token } = useParams<{ id: string; token: string }>();
  const toast = useToast();
  const store = useEditorStore();
  const breakpoint = useBreakpoint();
  const isDesktop = breakpoint === 'desktop';

  const [state, setState] = useState<ViewState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [agreementMeta, setAgreementMeta] = useState<PublicAgreement | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const pdfCanvasRef = useRef<PdfCanvasHandle>(null);
  const [finalPdfUrl, setFinalPdfUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [pageDrawerOpen, setPageDrawerOpen] = useState(false);
  const [signModalFieldId, setSignModalFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [scrollToken, setScrollToken] = useState(0);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!id || !token) {
      setState('error');
      setErrorMessage('This signing link is missing information and cannot be opened.');
      return;
    }
    fetchPublicAgreement(id, token)
      .then(async (data) => {
        setAgreementMeta(data);
        if (data.status === 'completed') {
          setFinalPdfUrl(data.pdfUrl);
          setState('already-signed');
          return;
        }
        const pdfResponse = await fetch(data.pdfUrl);
        if (!pdfResponse.ok) throw new Error('The agreement PDF could not be loaded.');
        setPdfBlob(await pdfResponse.blob());
        store.loadDocument({
          id: data.id,
          name: data.documentName,
          pageCount: 1,
          pageAspectRatios: [],
          status: data.status === 'failed' ? 'sent' : data.status,
          fields: data.fields,
          createdAt: '',
          updatedAt: '',
        });
        store.setZoom(FIT_ZOOM_BY_BREAKPOINT[breakpoint]);
        setState('ready');
      })
      .catch((err) => {
        setErrorMessage(err instanceof Error ? err.message : 'This signing link is invalid or has expired.');
        setState('expired');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const doc = store.document;
  const incompleteFields = useMemo(
    () => (doc ? doc.fields.filter((f) => f.required && !f.locked && isFieldIncomplete(f)) : []),
    [doc],
  );

  const handleAutosave = useCallback(async () => {
    if (!id || !token || !doc) return;
    setSaveStatus('saving');
    try {
      await saveAgreementProgress(id, token, doc.fields);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [id, token, doc]);

  useEffect(() => {
    if (state !== 'ready' || !store.isDirty) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(handleAutosave, 1200);
    return () => window.clearTimeout(saveTimer.current);
  }, [doc, store.isDirty, state, handleAutosave]);

  useEditorKeyboardShortcuts({ onSave: handleAutosave, enabled: state === 'ready' });

  function goToField(field: AgreementField) {
    store.setCurrentPage(field.page);
    store.selectField(field.id);
    setScrollToken((n) => n + 1);
    setShowIncomplete(false);
  }

  async function handleSubmit() {
    if (!id || !token || !pdfBlob || !doc || submittedRef.current) return;
    if (incompleteFields.length > 0) {
      setShowIncomplete(true);
      toast.show({
        tone: 'error',
        title: 'A few required fields are still empty',
        description: `${incompleteFields.length} field${incompleteFields.length === 1 ? '' : 's'} need your input before you can submit.`,
      });
      return;
    }
    setSubmitting(true);
    try {
      const arrayBuffer = await (pdfCanvasRef.current?.getExportPdfBytes() ?? pdfBlob.arrayBuffer());
      const flattened = await exportAgreementPdf(arrayBuffer, doc);
      submittedRef.current = true;
      await submitSignedAgreement(id, token, flattened, doc.fields);
      setState('success');
    } catch (err) {
      submittedRef.current = false;
      toast.show({ tone: 'error', title: 'Could not submit', description: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (state === 'loading') {
    return (
      <CenteredShell>
        <Loader2 className="animate-spin text-[var(--brand)]" size={24} />
        <p className="mt-3 text-[13px] text-[var(--text-muted)]">Loading your agreement…</p>
      </CenteredShell>
    );
  }

  if (state === 'expired' || state === 'error') {
    return (
      <CenteredShell>
        <FileWarning className="text-[var(--danger)]" size={28} />
        <h1 className="mt-3 text-[16px] font-semibold text-[var(--text-primary)]">Link unavailable</h1>
        <p className="mt-1 max-w-[320px] text-center text-[13px] text-[var(--text-muted)]">{errorMessage}</p>
      </CenteredShell>
    );
  }

  if (state === 'already-signed' || state === 'success') {
    return (
      <CenteredShell>
        <CheckCircle2 className="text-[var(--success)]" size={28} />
        <h1 className="mt-3 text-[16px] font-semibold text-[var(--text-primary)]">
          {state === 'success' ? 'Agreement signed' : 'Already signed'}
        </h1>
        <p className="mt-1 max-w-[340px] text-center text-[13px] text-[var(--text-muted)]">
          {state === 'success'
            ? `Thanks${agreementMeta?.recipientName ? `, ${agreementMeta.recipientName}` : ''}! Your signed copy of "${agreementMeta?.documentName}" has been recorded.`
            : `"${agreementMeta?.documentName}" was already completed${agreementMeta?.completedAt ? ` on ${new Date(agreementMeta.completedAt).toLocaleDateString()}` : ''}.`}
        </p>
        {finalPdfUrl && (
          <Button variant="secondary" size="sm" className="mt-4" icon={<Download size={14} />} onClick={() => window.open(finalPdfUrl, '_blank')}>
            Download signed PDF
          </Button>
        )}
      </CenteredShell>
    );
  }

  if (!doc) return null;

  const selectedField = doc.fields.find((f) => f.id === store.selectedFieldId) ?? null;
  const signModalField = doc.fields.find((f) => f.id === signModalFieldId) ?? null;

  return (
    <div className="flex h-full flex-col bg-[var(--chrome-bg)]">
      <SignHeader
        documentName={doc.name}
        senderName={agreementMeta?.senderName ?? ''}
        saveStatus={saveStatus}
        canUndo={store.past.length > 0}
        canRedo={store.future.length > 0}
        incompleteCount={incompleteFields.length}
        previewMode={previewMode}
        submitting={submitting}
        onUndo={store.undo}
        onRedo={store.redo}
        onTogglePreview={() => setPreviewMode((v) => !v)}
        onSubmit={handleSubmit}
        onOpenPages={() => setPageDrawerOpen(true)}
      />

      {incompleteFields.length > 0 && showIncomplete && (
        <div className="max-h-[160px] shrink-0 overflow-y-auto border-b border-[var(--warning)]/30 bg-[var(--warning-tint)] px-4 py-2">
          <p className="mb-1.5 text-[12px] font-medium text-[var(--warning)]">
            {incompleteFields.length} required field{incompleteFields.length === 1 ? '' : 's'} still need your input:
          </p>
          <div className="flex flex-col gap-1">
            {incompleteFields.map((f) => (
              <button
                key={f.id}
                onClick={() => goToField(f)}
                className="flex items-center justify-between gap-2 rounded-[6px] px-2 py-1 text-left text-[12.5px] text-[var(--text-primary)] hover:bg-white/50"
              >
                <span className="truncate">
                  {f.label} <span className="text-[var(--text-muted)]">— page {f.page + 1}</span>
                </span>
                <ChevronRight size={13} className="shrink-0 text-[var(--text-muted)]" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {isDesktop && !previewMode && <EditorToolbar activeTool={store.activeTool} onSelectTool={store.setActiveTool} />}
        {isDesktop && (
          <ThumbnailSidebar
            file={pdfBlob}
            pageCount={pageCount}
            currentPage={store.currentPage}
            collapsed={!showThumbnails}
            onSelectPage={store.setCurrentPage}
            onToggleCollapse={() => setShowThumbnails((v) => !v)}
          />
        )}
        <div className="relative min-w-0 flex-1">
          <PdfCanvas
            ref={pdfCanvasRef}
            file={pdfBlob}
            pageCount={pageCount}
            zoom={store.zoom}
            fields={doc.fields}
            activeTool={previewMode ? 'select' : store.activeTool}
            selectedFieldId={store.selectedFieldId}
            readOnly={previewMode}
            hideControlsWhenLocked
            currentPage={store.currentPage}
            onDocumentLoad={setPageCount}
            onCurrentPageChange={store.setCurrentPage}
            onPlaceField={store.addField}
            onSelectField={(fid) => {
              const f = doc.fields.find((x) => x.id === fid);
              if (f?.locked) return;
              store.selectField(fid);
            }}
            onUpdateField={store.updateField}
            onDeleteField={store.removeField}
            onDuplicateField={store.duplicateField}
            onRequestSign={setSignModalFieldId}
            onLoadError={(m) => toast.show({ tone: 'error', title: 'Could not open PDF', description: m })}
            scrollToPageToken={scrollToken}
          />
          <CanvasControls
            zoom={store.zoom}
            currentPage={store.currentPage}
            pageCount={pageCount}
            showThumbnails={isDesktop ? showThumbnails : pageDrawerOpen}
            onZoomChange={store.setZoom}
            onFitWidth={() => store.setZoom(FIT_ZOOM_BY_BREAKPOINT[breakpoint])}
            onPageChange={store.setCurrentPage}
            onToggleThumbnails={() => (isDesktop ? setShowThumbnails((v) => !v) : setPageDrawerOpen((v) => !v))}
          />
        </div>
        {isDesktop && !previewMode && selectedField && !selectedField.locked && (
          <PropertiesPanel
            field={selectedField}
            onChange={(patch) => store.updateField(selectedField.id, patch, { commit: true })}
            onDelete={() => store.removeField(selectedField.id)}
            onDuplicate={() => store.duplicateField(selectedField.id)}
          />
        )}
      </div>

      {!isDesktop && !previewMode && <EditorToolbar variant="mobile" activeTool={store.activeTool} onSelectTool={store.setActiveTool} />}

      {!isDesktop && (
        <PageDrawer
          open={pageDrawerOpen}
          file={pdfBlob}
          pageCount={pageCount}
          currentPage={store.currentPage}
          onSelectPage={store.setCurrentPage}
          onClose={() => setPageDrawerOpen(false)}
        />
      )}

      {!isDesktop && !previewMode && selectedField && !selectedField.locked && (
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
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--background)] px-6">{children}</div>;
}
