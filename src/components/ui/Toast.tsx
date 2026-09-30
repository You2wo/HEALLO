"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';

type ToastKind = 'success' | 'error';

interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<((text: string, kind?: ToastKind) => void) | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="card pointer-events-auto flex max-w-md animate-rise items-center gap-3 px-4 py-3 text-sm shadow-pop"
          >
            {t.kind === 'error' ? (
              <WarningCircle size={20} weight="fill" className="shrink-0 text-danger" aria-hidden="true" />
            ) : (
              <CheckCircle size={20} weight="fill" className="shrink-0 text-accent" aria-hidden="true" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
