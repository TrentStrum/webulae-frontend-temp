'use client';

import React, { useEffect } from 'react';
import { useNotifications } from '@/app/lib/stateContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Notifications() {
  const { notifications, removeNotification } = useNotifications();

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          variant={notification.type === 'error' ? 'destructive' : 'default'}
          className={cn(
            'shadow-md transition-all duration-300 animate-in slide-in-from-right-full',
            notification.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
            notification.type === 'warning' && 'bg-yellow-50 text-yellow-800 border-yellow-200',
            notification.type === 'info' && 'bg-blue-50 text-blue-800 border-blue-200'
          )}
        >
          <div className="flex justify-between items-start">
            <AlertDescription>{notification.message}</AlertDescription>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-gray-500 hover:text-gray-700"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  );
}