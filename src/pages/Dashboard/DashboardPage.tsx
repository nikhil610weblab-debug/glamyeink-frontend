import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppHeader } from '../../components/layout/AppHeader';
import { UploadDropzone } from '../../components/dashboard/UploadDropzone';
import { DocumentTable } from '../../components/dashboard/DocumentTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { documentStore, pdfBlobStore } from '../../services/db';
import { createDocumentFromFile } from '../../services/documentService';
import { createId } from '../../utils/id';
import { useToast } from '../../components/ui/Toast';
import type { AgreementDocument } from '../../types/document';

export function DashboardPage() {
  const [documents, setDocuments] = useState<AgreementDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  async function refresh() {
    const docs = await documentStore.list();
    setDocuments(docs);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const { document } = await createDocumentFromFile(file);
      toast.show({ tone: 'success', title: 'Document uploaded', description: document.name });
      navigate(`/editor/${document.id}`);
    } catch (err) {
      toast.show({
        tone: 'error',
        title: 'Could not open this PDF',
        description: err instanceof Error ? err.message : 'The file may be corrupted or unsupported.',
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDuplicate(id: string) {
    const doc = await documentStore.get(id);
    const blob = await pdfBlobStore.get(id);
    if (!doc || !blob) return;
    const now = new Date().toISOString();
    const copy: AgreementDocument = {
      ...doc,
      id: createId('doc'),
      name: `${doc.name} (copy)`,
      status: 'draft',
      sentAt: undefined,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
    await documentStore.save(copy);
    await pdfBlobStore.save(copy.id, blob);
    toast.show({ tone: 'success', title: 'Document duplicated' });
    refresh();
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await documentStore.remove(pendingDelete);
    setPendingDelete(null);
    toast.show({ tone: 'info', title: 'Document deleted' });
    refresh();
  }

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--text-primary)]">Agreements</h1>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">Prepare, sign, and send documents for signature.</p>
          </div>
          {documents.length > 0 && <UploadTrigger onFile={handleUpload} uploading={uploading} />}
        </div>

        {loading ? (
          <div className="py-24 text-center text-[13px] text-[var(--text-muted)]">Loading your documents…</div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-10">
            <UploadDropzone onFile={handleUpload} isProcessing={uploading} onInvalidFile={(m) => toast.show({ tone: 'error', title: 'Upload failed', description: m })} />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <UploadDropzone
                compact
                onFile={handleUpload}
                isProcessing={uploading}
                onInvalidFile={(m) => toast.show({ tone: 'error', title: 'Upload failed', description: m })}
              />
            </div>
            <DocumentTable
              documents={documents}
              onOpen={(id) => navigate(`/editor/${id}`)}
              onDelete={(id) => setPendingDelete(id)}
              onDuplicate={handleDuplicate}
            />
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this document?"
        description="This will permanently remove the document and its fields. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function UploadTrigger({ onFile, uploading }: { onFile: (file: File) => void; uploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button variant="primary" icon={<Plus size={15} />} disabled={uploading} onClick={() => inputRef.current?.click()}>
        New agreement
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </>
  );
}
