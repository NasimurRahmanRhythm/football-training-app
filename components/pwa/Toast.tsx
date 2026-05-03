"use client";
import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "success" | "error";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
interface Ctx {
  showToast: (msg: string, type?: ToastType) => void;
}
const ToastCtx = createContext<Ctx | null>(null);
let _id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++_id;
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    },
    [],
  );
  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span>{t.type === "success" ? "✓" : "✕"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
