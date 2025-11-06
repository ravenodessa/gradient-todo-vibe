import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useLanguage } from '@/hooks/useLanguage';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2">
      <div className={`glass-effect px-6 py-3 rounded-full shadow-lg border flex items-center gap-3 ${
        isOnline 
          ? 'border-green-500/30 bg-green-500/10' 
          : 'border-destructive/30 bg-destructive/10'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-500">
              {t('online')}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {t('offline')}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
