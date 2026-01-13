"use client";

import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const bgColor =
    toast.type === 'success'
      ? 'bg-green-500'
      : toast.type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  const icon =
    toast.type === 'success'
      ? '✓'
      : toast.type === 'error'
      ? '✕'
      : 'ⓘ';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-6 py-4 ${bgColor} text-white rounded-lg shadow-lg transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <span className="text-xl font-bold">{icon}</span>
      <span className="font-semibold">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white/80 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (message: string) => addToast(message, 'success');
  const error = (message: string) => addToast(message, 'error');
  const info = (message: string) => addToast(message, 'info');

  return { toasts, addToast, removeToast, success, error, info };
}
