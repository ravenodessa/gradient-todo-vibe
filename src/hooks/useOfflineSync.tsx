import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './useLanguage';
import { getFullServerErrorMessage, getServerErrorMessage } from '@/lib/errorMessage';
import { recordSyncHistory } from '@/lib/syncHistory';

interface PendingOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data?: any;
  timestamp: number;
  attempts?: number;
  stalled?: boolean;
  nextRetryAt?: number;
}

const STORAGE_KEY = 'offline_pending_operations';
const QUEUE_UPDATED_EVENT = 'offline-sync-queue-updated';
// After this many failures a change is marked as stalled so repeated errors can
// be silenced. It remains eligible for later automatic retries.
const MAX_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 30_000;
const MAX_RETRY_DELAY_MS = 30 * 60_000;

const getRetryDelay = (attempts: number) =>
  Math.min(BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1), MAX_RETRY_DELAY_MS);


export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isSyncingRef = useRef(false);
  const previousOnlineStatus = useRef(isOnline);
  const syncFunctionRef = useRef<(onlyIds?: string[], options?: { force?: boolean }) => Promise<void>>(
    async () => undefined
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [queueRevision, setQueueRevision] = useState(0);

  // Load pending operations from localStorage
  const getPendingOperations = (): PendingOperation[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save pending operations to localStorage
  const savePendingOperations = (operations: PendingOperation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(operations));
      setPendingCount(operations.length);
      setQueueRevision(revision => revision + 1);
      window.dispatchEvent(new CustomEvent(QUEUE_UPDATED_EVENT, { detail: operations.length }));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to save pending operations:', error);
    }
  };

  // Add operation to queue
  const queueOperation = (operation: Omit<PendingOperation, 'timestamp'>) => {
    const operations = getPendingOperations();
    operations.push({
      ...operation,
      timestamp: Date.now(),
    });
    savePendingOperations(operations);
  };

  // Sync all pending operations
  const syncPendingOperations = async (onlyIds?: string[], options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    if (isSyncingRef.current || !isOnline) return;

    const operations = getPendingOperations();
    if (operations.length === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      // Sort by timestamp to maintain order
      const sortedOps = operations
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)
        .filter(op =>
          onlyIds
            ? onlyIds.includes(op.id)
            : force || !op.nextRetryAt || op.nextRetryAt <= Date.now()
        );
      if (sortedOps.length === 0) return;
      const successfulOps: string[] = [];
      const stalledOps: string[] = [];
      const attemptsById = new Map<string, number>();
      const nextRetryById = new Map<string, number>();
      const historyEntries: Parameters<typeof recordSyncHistory>[0] = [];
      let firstSyncError: unknown;
      let shouldReportRetryError = false;

      for (const op of sortedOps) {
        try {
          let result: any = null;
          if (op.type === 'insert') {
            result = await (supabase.from as any)(op.table).insert([op.data]);
          } else if (op.type === 'update') {
            result = await (supabase.from as any)(op.table).update(op.data).eq('id', op.id);
          } else if (op.type === 'delete') {
            result = await (supabase.from as any)(op.table).delete().eq('id', op.id);
          }
          // supabase-js resolves with { error } instead of throwing:
          // keep the operation queued when the server rejected it.
          if (result?.error) throw result.error;
          successfulOps.push(op.id);
          historyEntries.push({
            operationId: op.id,
            type: op.type,
            table: op.table,
            title: typeof op.data?.title === 'string' ? op.data.title : undefined,
            status: 'success',
            queuedAt: op.timestamp,
            attempts: (op.attempts ?? 0) + 1,
          });
        } catch (error) {
          if (import.meta.env.DEV) console.error(`Failed to sync operation ${op.id}:`, error);
          firstSyncError ??= error;
          shouldReportRetryError ||= !op.stalled || !!onlyIds;
          const attempts = (op.attempts ?? 0) + 1;
          const nextRetryAt = Date.now() + getRetryDelay(attempts);
          attemptsById.set(op.id, attempts);
          nextRetryById.set(op.id, nextRetryAt);
          // Mark the first transition to stalled so the user is warned once.
          // Stalled operations continue retrying silently on later sync cycles.
          if (attempts >= MAX_ATTEMPTS && navigator.onLine && !op.stalled) {
            stalledOps.push(op.id);
          }
          historyEntries.push({
            operationId: op.id,
            type: op.type,
            table: op.table,
            title: typeof op.data?.title === 'string' ? op.data.title : undefined,
            status: 'failed',
            queuedAt: op.timestamp,
            attempts,
            reason: getServerErrorMessage(error, t('failed_sync_task')),
            fullError: getFullServerErrorMessage(error, t('failed_sync_task')),
            nextRetryAt,
          });
        }
      }

      // Remove synced operations, bump retry counters, flag stalled ones
      const remainingOps = operations
        .filter(op => !successfulOps.includes(op.id))
        .map(op =>
          attemptsById.has(op.id)
            ? {
                ...op,
                attempts: attemptsById.get(op.id),
                nextRetryAt: nextRetryById.get(op.id),
                stalled: stalledOps.includes(op.id) || op.stalled,
              }
            : op
        );
      savePendingOperations(remainingOps);
      recordSyncHistory(historyEntries);

      if (firstSyncError && stalledOps.length === 0 && shouldReportRetryError) {
        toast({
          title: t('error'),
          description: getServerErrorMessage(firstSyncError, t('failed_sync_task')),
          variant: 'destructive',
        });
      }

      if (stalledOps.length > 0) {
        toast({
          title: t('error'),
          description: `${getServerErrorMessage(firstSyncError, t('failed_sync_task'))}. ${t('unsynced_changes_kept')} (${stalledOps.length})`,
          variant: 'destructive',
        });
      }

      if (successfulOps.length > 0) {
        // Let data views know they should reload from the database
        window.dispatchEvent(new CustomEvent('offline-sync-complete'));
      }


      if (successfulOps.length > 0) {
        toast({
          title: t('success'),
          description: `${t('synced')} ${successfulOps.length} ${t('changes')}`,
          duration: 1000,
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Sync failed:', error);
      toast({
        title: t('error'),
        description: getServerErrorMessage(error, t('failed_sync_task')),
        variant: 'destructive',
      });
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  };

  syncFunctionRef.current = syncPendingOperations;

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && !previousOnlineStatus.current) {
      // Just came back online
      syncPendingOperations();
    }
    previousOnlineStatus.current = isOnline;
  }, [isOnline]);

  // Flush anything left over from a previous session on startup
  useEffect(() => {
    if (isOnline) syncPendingOperations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wake the queue at the earliest scheduled retry. Manual retries bypass this delay.
  useEffect(() => {
    if (!isOnline) return;
    const nextRetryAt = getPendingOperations()
      .map(operation => operation.nextRetryAt)
      .filter((value): value is number => typeof value === 'number' && value > Date.now())
      .sort((a, b) => a - b)[0];
    if (!nextRetryAt) return;

    const timer = window.setTimeout(() => {
      syncFunctionRef.current();
    }, Math.max(0, nextRetryAt - Date.now()));
    return () => window.clearTimeout(timer);
    // queueRevision changes whenever retry scheduling changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queueRevision]);

  useEffect(() => {
    const updatePendingCount = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      setPendingCount(typeof count === 'number' ? count : getPendingOperations().length);
    };
    setPendingCount(getPendingOperations().length);
    window.addEventListener(QUEUE_UPDATED_EVENT, updatePendingCount);
    return () => window.removeEventListener(QUEUE_UPDATED_EVENT, updatePendingCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retry the queue whenever the app is used again, so it always drains
  useEffect(() => {
    const retry = () => {
      if (navigator.onLine) syncPendingOperations();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') retry();
    };
    window.addEventListener('focus', retry);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', retry);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    queueOperation,
    getPendingOperations,
    syncPendingOperations,
    hasPendingOperations: getPendingOperations().length > 0,
  };
}
