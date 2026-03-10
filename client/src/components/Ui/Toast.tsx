import { useEffect, useState } from "react";
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from "lucide-react";

export type ToastType = "warning" | "success" | "error" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms, default 5000
  onClose: (id: string) => void;
}

const STYLES: Record<
  ToastType,
  { bg: string; border: string; color: string; icon: React.ElementType }
> = {
  warning: {
    bg: "#1e1e1e",
    border: "#e2481540",
    color: "#e24815",
    icon: AlertTriangle,
  },
  success: {
    bg: "#1e1e1e",
    border: "#10b98140",
    color: "#10b981",
    icon: CheckCircle,
  },
  error: {
    bg: "#1e1e1e",
    border: "#e2421540",
    color: "#e24215",
    icon: AlertCircle,
  },
  info: { bg: "#1e1e1e", border: "#3b82f640", color: "#3b82f6", icon: Info },
};

/* ── Single Toast ─────────────────────────────── */
export const Toast = ({
  id,
  message,
  type = "warning",
  duration = 5000,
  onClose,
}: ToastProps) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const style = STYLES[type];
  const Icon = style.icon;

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = 50;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(timer);
          return 0;
        }
        return p - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [duration]);

  // Auto dismiss
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);
    return () => clearTimeout(t);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className="w-80 rounded-xl overflow-hidden shadow-xl"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(12px) scale(0.97)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* Body */}
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${style.color}20` }}
        >
          <Icon size={15} style={{ color: style.color }} />
        </div>
        <p className="text-sm text-white flex-1 leading-snug pt-0.5">
          {message}
        </p>
        <button
          onClick={handleClose}
          className="shrink-0 mt-0.5"
          style={{ color: "#555" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: "#2a2a2a" }}>
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: style.color,
            transition: "width 50ms linear",
          }}
        />
      </div>
    </div>
  );
};

/* ── Toast Container (manages multiple toasts) ── */
export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
};

/* ── useToast hook ────────────────────────────── */
import { useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "warning", duration = 5000) => {
      const id = `toast_${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export default Toast;
