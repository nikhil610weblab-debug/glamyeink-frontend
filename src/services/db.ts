import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { AgreementDocument, StoredSignature } from '../types/document';

interface AgreementStudioDB extends DBSchema {
  documents: {
    key: string;
    value: AgreementDocument;
    indexes: { 'by-updatedAt': string };
  };
  pdfBlobs: {
    key: string; // document id
    value: { id: string; blob: Blob };
  };
  signatures: {
    key: string;
    value: StoredSignature;
  };
}

const DB_NAME = 'agreement-studio';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AgreementStudioDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<AgreementStudioDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('by-updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('pdfBlobs')) {
          db.createObjectStore('pdfBlobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('signatures')) {
          db.createObjectStore('signatures', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const documentStore = {
  async list(): Promise<AgreementDocument[]> {
    const db = await getDb();
    const all = await db.getAllFromIndex('documents', 'by-updatedAt');
    return all.reverse();
  },
  async get(id: string): Promise<AgreementDocument | undefined> {
    const db = await getDb();
    return db.get('documents', id);
  },
  async save(doc: AgreementDocument): Promise<void> {
    const db = await getDb();
    await db.put('documents', doc);
  },
  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('documents', id);
    await db.delete('pdfBlobs', id);
  },
};

export const pdfBlobStore = {
  async save(id: string, blob: Blob): Promise<void> {
    const db = await getDb();
    await db.put('pdfBlobs', { id, blob });
  },
  async get(id: string): Promise<Blob | undefined> {
    const db = await getDb();
    const record = await db.get('pdfBlobs', id);
    return record?.blob;
  },
};

export const signatureStore = {
  async list(): Promise<StoredSignature[]> {
    const db = await getDb();
    return db.getAll('signatures');
  },
  async save(signature: StoredSignature): Promise<void> {
    const db = await getDb();
    await db.put('signatures', signature);
  },
  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('signatures', id);
  },
};
