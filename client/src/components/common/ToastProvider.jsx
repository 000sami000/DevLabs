import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: {
    icon: FiCheckCircle,
    className: "toast-success",
  },
  error: {
    icon: FiAlertCircle,
    className: "toast-error",
  },
  info: {
    icon: FiInfo,
    className: "toast-info",
  },
};

const createToastId = () =>
  globalThis.crypto?.randomUUID?.() || `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((config = {}) => {
    const id = config.id || createToastId();
    const type = TOAST_TYPES[config.type] ? config.type : "info";
    const duration = Number(config.duration) > 0 ? Number(config.duration) : 2800;

    const toast = {
      id,
      title: config.title || "Update",
      message: config.message || "",
      type,
      duration,
    };

    setToasts((current) => [...current, toast]);
    window.setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const value = useMemo(
    () => ({
      showToast: pushToast,
      success: (title, message, duration) => pushToast({ type: "success", title, message, duration }),
      error: (title, message, duration) => pushToast({ type: "error", title, message, duration }),
      info: (title, message, duration) => pushToast({ type: "info", title, message, duration }),
      dismiss: removeToast,
    }),
    [pushToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
          const Icon = config.icon;

          return (
            <div key={toast.id} className={`app-toast-card ${config.className}`}>
              <div className="app-toast-icon-wrap">
                <Icon className="app-toast-icon" />
              </div>
              <div className="app-toast-content">
                <div className="app-toast-title">{toast.title}</div>
                {toast.message ? <div className="app-toast-message">{toast.message}</div> : null}
              </div>
              <button
                type="button"
                className="app-toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss toast"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
