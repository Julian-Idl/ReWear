"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "info";
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

function ToastComponent({ id, title, description, variant = "default", onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "destructive":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-white border-gray-200 text-gray-800";
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg ${getStyles()}`}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = (++toastCount).toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose toast function globally
  useEffect(() => {
    (window as any).showToast = addToast;
  }, []);

  return (
    <>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            {...toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </>
  );
}

export const toast = (options: Omit<Toast, "id">) => {
  if ((window as any).showToast) {
    (window as any).showToast(options);
  }
};
