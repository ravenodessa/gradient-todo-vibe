import { useEffect, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './useLanguage';

interface PendingOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data?: any;
  timestamp: number;
}

const STORAGE_KEY = 'offline_pending_operations';

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
      console.error('Failed to save pending operations:', error);
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

      for (const op of sortedOps) {
        try {
          if (op.type === 'insert') {
            await (supabase.from as any)(op.table).insert([op.data]);
          } else if (op.type === 'update') {
            await (supabase.from as any)(op.table).update(op.data).eq('id', op.id);
          } else if (op.type === 'delete') {
            await (supabase.from as any)(op.table).delete().eq('id', op.id);
          }
          successfulOps.push(op.id);
        } catch (error) {
          console.error(`Failed to sync operation ${op.id}:`, error);
        }
      }

      // Remove successfully synced operations
      const remainingOps = operations.filter(op => !successfulOps.includes(op.id));
      savePendingOperations(remainingOps);

      if (successfulOps.length > 0) {
        toast({
          title: t('success'),
          description: `${t('synced')} ${successfulOps.length} ${t('changes')}`,
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
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

  return {
    isOnline,
    queueOperation,
    getPendingOperations,
    hasPendingOperations: getPendingOperations().length > 0,
  };
}
