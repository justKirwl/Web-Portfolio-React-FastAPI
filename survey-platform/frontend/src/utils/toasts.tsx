import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ToastProps {
  title: string
  message: string
  t: string | number | undefined
}

export const SuccessToast = ({ title, message, t }: ToastProps) => (
  <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-[var(--color-success)] bg-[var(--color-base-200)] shadow-lg min-w-[320px]">
    <div className="bg-[var(--color-success)] text-[var(--color-success-content)] p-2 rounded-lg flex-shrink-0">
      <CheckCircle className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[var(--color-base-content)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--color-base-content)] opacity-80">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="cursor-pointer p-1 rounded hover:bg-[var(--color-base-300)] transition-all flex-shrink-0"
    >
      <X className="w-4 h-4 text-[var(--color-base-content)]" />
    </button>
  </div>
);

export const ErrorToast = ({ title, message, t }: ToastProps) => (
  <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-[var(--color-error)] bg-[var(--color-base-200)] shadow-lg min-w-[320px]">
    <div className="bg-[var(--color-error)] text-[var(--color-error-content)] p-2 rounded-lg flex-shrink-0">
      <XCircle className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[var(--color-base-content)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--color-base-content)] opacity-80">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="cursor-pointer p-1 rounded hover:bg-[var(--color-base-300)] transition-all flex-shrink-0"
    >
      <X className="w-4 h-4 text-[var(--color-base-content)]" />
    </button>
  </div>
);

export const InfoToast = ({ title, message, t }: ToastProps) => (
  <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-[var(--color-info)] bg-[var(--color-base-200)] shadow-lg min-w-[320px]">
    <div className="bg-[var(--color-info)] text-[var(--color-info-content)] p-2 rounded-lg flex-shrink-0">
      <Info className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[var(--color-base-content)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--color-base-content)] opacity-80">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="cursor-pointer p-1 rounded hover:bg-[var(--color-base-300)] transition-all flex-shrink-0"
    >
      <X className="w-4 h-4 text-[var(--color-base-content)]" />
    </button>
  </div>
);

export const WarningToast = ({ title, message, t }: ToastProps) => (
  <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-[var(--color-warning)] bg-[var(--color-base-200)] shadow-lg min-w-[320px]">
    <div className="bg-[var(--color-warning)] text-[var(--color-warning-content)] p-2 rounded-lg flex-shrink-0">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-[var(--color-base-content)] mb-1">{title}</h4>
      <p className="text-sm text-[var(--color-base-content)] opacity-80">{message}</p>
    </div>
    <button
      onClick={() => toast.dismiss(t)}
      className="cursor-pointer p-1 rounded hover:bg-[var(--color-base-300)] transition-all flex-shrink-0"
    >
      <X className="w-4 h-4 text-[var(--color-base-content)]" />
    </button>
  </div>
);