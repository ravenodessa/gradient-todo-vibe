import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Languages, RefreshCw, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { SEO } from '@/components/SEO';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import {
  getSyncHistory,
  clearSyncHistory,
  SYNC_HISTORY_EVENT,
  type SyncHistoryEntry,
} from '@/lib/syncHistory';

export default function SyncHistory() {
  const { t, language, setLanguage } = useLanguage();
  const { syncPendingOperations, isOnline } = useOfflineSync();
  const [entries, setEntries] = useState<SyncHistoryEntry[]>([]);

  const dateLocale = language === 'ru' ? ru : enUS;

  const refresh = useCallback(() => setEntries(getSyncHistory()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(SYNC_HISTORY_EVENT, refresh);
    return () => window.removeEventListener(SYNC_HISTORY_EVENT, refresh);
  }, [refresh]);

  const typeLabel = (type: SyncHistoryEntry['type']) =>
    type === 'insert' ? t('sync_op_insert') : type === 'update' ? t('sync_op_update') : t('sync_op_delete');

  const successCount = entries.filter(e => e.status === 'success').length;
  const failedCount = entries.length - successCount;

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <SEO title={t('sync_history')} description={t('sync_history_desc')} path="/sync-history" />
      <div className="max-w-2xl mx-auto">
        <div className="glass-effect rounded-t-2xl px-4 sm:px-8 pt-6 pb-4 shadow-2xl border border-white/20 border-b-0">
          <div className="flex justify-between items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('sync_history')}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-2"
                aria-label={t('switch_language')}
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm" aria-label={t('go_home')} title={t('go_home')} className="bg-white/5 border-white/20 px-2">
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t('sync_history_desc')}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-500">
              {t('sync_success')}: {successCount}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-destructive/15 text-destructive">
              {t('sync_failed')}: {failedCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={!isOnline}
              onClick={() => syncPendingOperations()}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('sync_retry_now')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={entries.length === 0}
              onClick={() => clearSyncHistory()}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('sync_clear_history')}
            </Button>
          </div>
        </div>

        <div className="glass-effect rounded-b-2xl px-4 sm:px-8 py-6 shadow-2xl border border-white/20 border-t-0">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('sync_history_empty')}</p>
          ) : (
            <ul className="space-y-2">
              {entries.map(entry => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 flex gap-3 items-start"
                >
                  {entry.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-1 shrink-0 text-destructive" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                        {entry.title || typeLabel(entry.type)}
                      </span>
                      <span className="text-xs text-muted-foreground">{typeLabel(entry.type)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t('sync_sent_at')}: {format(new Date(entry.timestamp), 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale })}
                      {typeof entry.attempts === 'number' ? ` · ${t('sync_attempt')} ${entry.attempts}` : ''}
                    </div>
                    {entry.status === 'failed' && (
                      <div className="text-xs text-destructive mt-1 break-words [overflow-wrap:anywhere]">
                        {t('sync_reason')}: {entry.reason || t('failed_sync_task')}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
