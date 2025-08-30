"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type Toast = { id: number; title?: string; description?: string; variant?: "default" | "destructive" };

const ToastContext = createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), ...t }]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setToasts((prev) => prev.slice(-5));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border px-4 py-3 shadow bg-background text-foreground ${
              t.variant === "destructive" ? "border-destructive text-destructive-foreground" : "border-border"
            }`}
          >
            {t.title && <div className="text-sm font-medium">{t.title}</div>}
            {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
