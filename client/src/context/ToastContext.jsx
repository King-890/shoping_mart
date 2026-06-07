import React, { useState, useEffect, createContext, useContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
            }}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            background: toast.type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 243, 255, 0.9)',
                            color: toast.type === 'error' ? '#fff' : '#000',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            animation: 'slideIn 0.3s ease-out forwards',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <span>{toast.type === 'error' ? '❌' : '✅'}</span>
                        {toast.message}
                        <style>{`
                            @keyframes slideIn {
                                from { transform: translateX(100%); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                        `}</style>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
