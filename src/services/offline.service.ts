import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Hazard, ValidationAction } from '../types/hazard';

interface BakasDB extends DBSchema {
  pending_reports: {
    key: string;
    value: Hazard;
    indexes: { 'by-created': string };
  };
  cached_hazards: {
    key: string;
    value: Hazard;
    indexes: { 'by-category': string; 'by-expires': string };
  };
  pending_validations: {
    key: string;
    value: ValidationAction;
    indexes: { 'by-created': string };
  };
}

const DB_NAME = 'bakas_offline_radar_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<BakasDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<BakasDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BakasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pending_reports')) {
          const reportStore = db.createObjectStore('pending_reports', { keyPath: 'id' });
          reportStore.createIndex('by-created', 'createdAt');
        }

        if (!db.objectStoreNames.contains('cached_hazards')) {
          const hazardStore = db.createObjectStore('cached_hazards', { keyPath: 'id' });
          hazardStore.createIndex('by-category', 'category');
          hazardStore.createIndex('by-expires', 'expiresAt');
        }

        if (!db.objectStoreNames.contains('pending_validations')) {
          const valStore = db.createObjectStore('pending_validations', { keyPath: 'id' });
          valStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save an offline hazard report to IndexedDB
 */
export async function savePendingReport(hazard: Hazard): Promise<void> {
  const db = await getDB();
  await db.put('pending_reports', {
    ...hazard,
    syncStatus: 'pending_sync',
  });
}

/**
 * Retrieve all pending hazard reports
 */
export async function getPendingReports(): Promise<Hazard[]> {
  const db = await getDB();
  return db.getAll('pending_reports');
}

/**
 * Remove a report from the pending queue once successfully synced
 */
export async function removePendingReport(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending_reports', id);
}

/**
 * Cache hazards locally in IndexedDB for offline viewing
 */
export async function cacheHazards(hazards: Hazard[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cached_hazards', 'readwrite');
  for (const hazard of hazards) {
    await tx.store.put(hazard);
  }
  await tx.done;
}

/**
 * Get all cached hazards
 */
export async function getCachedHazards(): Promise<Hazard[]> {
  const db = await getDB();
  return db.getAll('cached_hazards');
}

/**
 * Save offline community validation action
 */
export async function savePendingValidation(action: ValidationAction): Promise<void> {
  const db = await getDB();
  await db.put('pending_validations', action);
}

/**
 * Get all pending validation actions
 */
export async function getPendingValidations(): Promise<ValidationAction[]> {
  const db = await getDB();
  return db.getAll('pending_validations');
}

/**
 * Remove a pending validation action after sync
 */
export async function removePendingValidation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending_validations', id);
}

/**
 * Clear all pending offline queue items
 */
export async function clearPendingQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('pending_reports');
  await db.clear('pending_validations');
}

/**
 * Clear cache if needed
 */
export async function clearCachedHazards(): Promise<void> {
  const db = await getDB();
  await db.clear('cached_hazards');
}
