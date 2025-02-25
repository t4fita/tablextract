import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  dismissible?: boolean;
}

const TOAST_DEFAULTS = {
  duration: 5000, // 5 seconds
  dismissible: true
};

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = Date.now().toString();
    const defaults = { ...TOAST_DEFAULTS };
    
    update(toasts => [
      ...toasts,
      { 
        ...defaults, 
        ...toast, 
        id 
      }
    ]);

    // Auto-dismiss toast if duration is set
    if (toast.duration !== 0) {
      const duration = toast.duration || defaults.duration;
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }

  function dismissToast(id: string) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  function clearToasts() {
    update(() => []);
  }

  return {
    subscribe,
    success: (message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}) => 
      addToast({ type: 'success', message, ...options }),
    error: (message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}) => 
      addToast({ type: 'error', message, ...options }),
    info: (message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}) => 
      addToast({ type: 'info', message, ...options }),
    warning: (message: string, options: Partial<Omit<Toast, 'id' | 'type' | 'message'>> = {}) => 
      addToast({ type: 'warning', message, ...options }),
    dismiss: dismissToast,
    clear: clearToasts
  };
}

export const toastStore = createToastStore(); 