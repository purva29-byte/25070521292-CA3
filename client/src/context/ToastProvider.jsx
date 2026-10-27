import { createContext, useCallback, useContext, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const notify = useMemo(
    () => ({
      success(message) {
        toast.success(message, { id: message });
      },
      error(message) {
        toast.error(message, { id: message });
      },
      info(message) {
        toast(message, { id: message });
      },
      dismiss(id) {
        toast.dismiss(id);
      },
    }),
    []
  );

  const value = useMemo(() => ({ notify, toast }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#17201B',
            color: '#FFFDF8',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 14px',
            boxShadow: '0 12px 32px rgba(23,32,27,0.18)',
          },
          success: {
            iconTheme: { primary: '#8DBAA3', secondary: '#112F24' },
          },
          error: {
            iconTheme: { primary: '#E8A39B', secondary: '#3C1512' },
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
