import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => {
      // Prevent spamming duplicate toast messages
      if (prev.some(t => t.message === message)) return prev;
      return [...prev.slice(-3), { id, message, type }];
    });

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Notification Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none'
      }}>
        {toasts.map((toast) => {
          let bg = '#10B981';
          let Icon = CheckCircle;
          if (toast.type === 'error') { bg = '#EF4444'; Icon = AlertCircle; }
          if (toast.type === 'warning') { bg = '#F59E0B'; Icon = AlertTriangle; }
          if (toast.type === 'info') { bg = '#3B82F6'; Icon = Info; }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: bg,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 600,
                minWidth: '280px',
                maxWidth: '420px',
                animation: 'slideIn 0.3s ease'
              }}
            >
              <Icon size={20} />
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: 'white', opacity: 0.8, cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
