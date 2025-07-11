import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, { type = 'info', duration = 3000 } = {}) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed z-50 top-4 right-4 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-down relative pointer-events-auto
              bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100
              border border-secondary-300 dark:border-secondary-700
              shadow-xl rounded-xl px-4 py-3 min-w-[220px] max-w-xs flex items-center gap-3
              backdrop-blur-sm
              transition-all duration-300
              ${toast.type === 'success' ? 'border-success-500' : ''}
              ${toast.type === 'error' ? 'border-destructive-500' : ''}
              ${toast.type === 'info' ? 'border-primary-500' : ''}
            `}
            role="alert"
            tabIndex={0}
            onClick={() => removeToast(toast.id)}
            style={{
              backgroundColor: 'var(--color-background-secondary, #fff)',
            }}
          >
            {toast.type === 'success' && <span className="text-success-600">✔</span>}
            {toast.type === 'error' && <span className="text-destructive-600">✖</span>}
            {toast.type === 'info' && <span className="text-primary-600">ℹ</span>}
            <span className="flex-1 text-sm text-text-primary dark:text-secondary-100">{toast.message}</span>
            <button className="ml-2 text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200" onClick={() => removeToast(toast.id)} aria-label="Dismiss">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 