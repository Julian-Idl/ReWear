"use client";

import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({
    title,
    description,
    variant = "default"
  }: Omit<Toast, "id">) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      title,
      description,
      variant
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);

    // Show browser notification for now
    if (title && description) {
      alert(`${title}: ${description}`);
    } else if (title) {
      alert(title);
    } else if (description) {
      alert(description);
    }

    return id;
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts
  };
};

export { useToast };
