export type SyncHistoryStatus = 'success' | 'failed';

export interface SyncHistoryEntry {
  id: string;
  operationId: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  title?: string;
  status: SyncHistoryStatus;
  timestamp: number;
  queuedAt?: number;
  attempts?: number;
  reason?: string;
}

const STORAGE_KEY = 'sync_history_log';
const MAX_ENTRIES = 100;
export const SYNC_HISTORY_EVENT = 'sync-history-updated';

export function getSyncHistory(): SyncHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as SyncHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordSyncHistory(entries: Omit<SyncHistoryEntry, 'id' | 'timestamp'>[]) {
  if (entries.length === 0) return;
  try {
    const now = Date.now();
    const newEntries: SyncHistoryEntry[] = entries.map((entry, index) => ({
      ...entry,
      id: `${now}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now,
    }));
    const next = [...newEntries, ...getSyncHistory()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SYNC_HISTORY_EVENT));
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to record sync history:', error);
  }
}

export function clearSyncHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_HISTORY_EVENT));
  } catch (error) {
    if (import.meta.env.DEV) console.error('Failed to clear sync history:', error);
  }
}
