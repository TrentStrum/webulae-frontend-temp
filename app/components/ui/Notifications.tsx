'use client';

import React, { useEffect } from 'react';
import { useNotifications } from '@/app/lib/stateContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Alert
              variant={notification.type === 'error' ? 'destructive' : 'default'}
              className={cn(
                "shadow-lg border",
                notification.type === 'success' && 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30',
                notification.type === 'warning' && 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30',
                notification.type === 'info' && 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30'
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                  {notification.type === 'error' && <AlertTriangle className="h-4 w-4" />}
                  {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
                  {notification.type === 'info' && <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  <AlertDescription>{notification.message}</AlertDescription>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}