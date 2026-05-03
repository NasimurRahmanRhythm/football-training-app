"use client";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/pwa/Toast";
import "./pwa-globals.css";
import { useEffect } from "react";

export default function PwaLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(console.error);
  }, []);
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="pwa-app">{children}</div>
      </ToastProvider>
    </AuthProvider>
  );
}
