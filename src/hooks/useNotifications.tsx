import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface ScheduledNotification {
  id: string;
  title: string;
  time: Date;
  timeoutId: NodeJS.Timeout;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: t('error'),
        description: t('notifications_not_supported'),
        variant: 'destructive',
      });
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: t('success'),
          description: t('notifications_enabled'),
        });
        return true;
      } else if (result === 'denied') {
        toast({
          title: t('info'),
          description: t('notifications_denied'),
        });
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [permission, toast, t]);

  const showNotification = useCallback((title: string, body?: string) => {
    if (permission !== 'granted') return;

    try {
      new Notification(title, {
        body,
        icon: '/pwa-icon.png',
        badge: '/pwa-icon.png',
        tag: `task-${Date.now()}`,
        requireInteraction: true,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  const scheduleNotification = useCallback((
    id: string,
    title: string,
    reminderTime: Date,
    body?: string
  ) => {
    // Cancel existing notification for this task if any
    cancelNotification(id);

    const now = new Date();
    const timeUntilNotification = reminderTime.getTime() - now.getTime();

    if (timeUntilNotification <= 0) {
      // If time has passed, show immediately
      showNotification(title, body);
      return;
    }

    const timeoutId = setTimeout(() => {
      showNotification(title, body);
      setScheduledNotifications(prev => prev.filter(n => n.id !== id));
    }, timeUntilNotification);

    const newNotification: ScheduledNotification = {
      id,
      title,
      time: reminderTime,
      timeoutId,
    };

    setScheduledNotifications(prev => [...prev, newNotification]);
  }, [showNotification]);

  const cancelNotification = useCallback((id: string) => {
    setScheduledNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification) {
        clearTimeout(notification.timeoutId);
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const cancelAllNotifications = useCallback(() => {
    scheduledNotifications.forEach(n => clearTimeout(n.timeoutId));
    setScheduledNotifications([]);
  }, [scheduledNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scheduledNotifications.forEach(n => clearTimeout(n.timeoutId));
    };
  }, []);

  return {
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    scheduledNotifications,
    isSupported: 'Notification' in window,
  };
}
