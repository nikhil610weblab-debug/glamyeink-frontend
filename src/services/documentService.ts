import { pdfjs } from 'react-pdf';
import { createId } from '../utils/id';
import { documentStore, pdfBlobStore } from './db';
import type { AgreementDocument } from '../types/document';

export async function createDocumentFromFile(file: File): Promise<{ document: AgreementDocument; blob: Blob }> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
  const pdf = await loadingTask.promise;

  const pageAspectRatios: number[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    pageAspectRatios.push(viewport.width / viewport.height);
  }

  const now = new Date().toISOString();
  const document: AgreementDocument = {
    id: createId('doc'),
    name: file.name.replace(/\.pdf$/i, ''),
    pageCount: pdf.numPages,
    pageAspectRatios,
    status: 'draft',
    fields: [],
    createdAt: now,
    updatedAt: now,
  };

  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  await documentStore.save(document);
  await pdfBlobStore.save(document.id, blob);

  return { document, blob };
}

export async function loadDocument(id: string): Promise<{ document: AgreementDocument; blob: Blob } | null> {
  const document = await documentStore.get(id);
  if (!document) return null;
  const blob = await pdfBlobStore.get(id);
  if (!blob) return null;
  return { document, blob };
}

export async function persistDocument(document: AgreementDocument): Promise<void> {
  await documentStore.save({ ...document, updatedAt: new Date().toISOString() });
}
