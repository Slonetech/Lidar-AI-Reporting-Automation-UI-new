import React, { useEffect, useRef } from 'react';

const Modal = ({ open, onClose, title, children, actions }) => {
  const ref = useRef();

  useEffect(() => {
    if (open) {
      const handleKey = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKey);
      // Focus trap
      if (ref.current) ref.current.focus();
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay/Backdrop */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/70 transition-opacity" aria-hidden="true" />
      {/* Modal Dialog */}
      <div
        className="relative z-10 max-w-md w-full p-6 rounded-2xl border border-secondary-300 dark:border-secondary-700 shadow-2xl
          bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 animate-scale-in focus:outline-none"
        tabIndex={-1}
        ref={ref}
        style={{
          // fallback for custom property backgrounds
          backgroundColor: 'var(--color-background-secondary, #fff)',
        }}
      >
        <button
          className="absolute top-3 right-3 text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 text-xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {title && <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-white">{title}</h3>}
        <div className="mb-6 text-text-primary dark:text-secondary-100">{children}</div>
        <div className="flex gap-2 justify-end">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal; 