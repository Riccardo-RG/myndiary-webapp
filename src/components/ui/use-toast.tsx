import { useState, useCallback } from "react";

interface Toast {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (props: Toast) => void;
}

export function useToast(): ToastContextType {
  const [, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Toast) => {
      setToasts((currentToasts) => [
        ...currentToasts,
        { title, description, variant },
      ]);
      // For now, just use console.log as a simple implementation
      console.log(`Toast: ${variant}`, { title, description });
    },
    []
  );

  return { toast };
}
