import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './useLanguage';
import { getServerErrorMessage } from '@/lib/errorMessage';

interface PendingOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data?: any;
  timestamp: number;
  attempts?: number;
}

const STORAGE_KEY = 'offline_pending_operations';
// A change that keeps being rejected must not block cloud refreshes forever.
const MAX_ATTEMPTS = 5;

export function useOfflineSync() {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isSyncingRef = useRef(false);
  const previousOnlineStatus = useRef(isOnline);

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
  const syncPendingOperations = async () => {
    if (isSyncingRef.current || !isOnline) return;

    const operations = getPendingOperations();
    if (operations.length === 0) return;

    isSyncingRef.current = true;

    try {
      // Sort by timestamp to maintain order
      const sortedOps = operations.sort((a, b) => a.timestamp - b.timestamp);
      const successfulOps: string[] = [];
      const droppedOps: string[] = [];
      const attemptsById = new Map<string, number>();
      let firstSyncError: unknown;

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
        } catch (error) {
          if (import.meta.env.DEV) console.error(`Failed to sync operation ${op.id}:`, error);
          firstSyncError ??= error;
          const attempts = (op.attempts ?? 0) + 1;
          attemptsById.set(op.id, attempts);
          // Give up on changes the server keeps rejecting so the queue can drain
          // and cloud refreshes are not blocked forever.
          if (attempts >= MAX_ATTEMPTS && navigator.onLine) {
            droppedOps.push(op.id);
          }
        }
      }

      // Remove synced and permanently failing operations, bump retry counters
      const remainingOps = operations
        .filter(op => !successfulOps.includes(op.id) && !droppedOps.includes(op.id))
        .map(op =>
          attemptsById.has(op.id) ? { ...op, attempts: attemptsById.get(op.id) } : op
        );
      savePendingOperations(remainingOps);

      if (firstSyncError) {
        toast({
          title: t('error'),
          description: getServerErrorMessage(firstSyncError, t('failed_sync_task')),
          variant: 'destructive',
        });
      }

      if (successfulOps.length > 0 || droppedOps.length > 0) {
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
    }
  };

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
    queueOperation,
    getPendingOperations,
    syncPendingOperations,
    hasPendingOperations: getPendingOperations().length > 0,
  };
}
