// Tool type definitions
export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category?: string;
  checked?: boolean;
}

// Toast notification types
export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  action?: React.ReactNode;
}
