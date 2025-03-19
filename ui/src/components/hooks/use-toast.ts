import { useState, useCallback } from 'react';
import { type Toast } from '@/types';

type ToastActionType = (toast: Toast) => void;

export interface UseToast {
  toasts: Toast[];
  toast: (props: Toast) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const useToast = (): UseToast => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast: ToastActionType = useCallback((props) => {
    const id = props.id || String(Date.now());
    
    setToasts((prevToasts) => {
      const existingToastIndex = prevToasts.findIndex(
        (toast) => toast.id === id
      );

      if (existingToastIndex > -1) {
        const updatedToasts = [...prevToasts];
        updatedToasts[existingToastIndex] = { ...updatedToasts[existingToastIndex], ...props };
        return updatedToasts;
      }

      return [...prevToasts, { ...props, id }];
    });

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
};
