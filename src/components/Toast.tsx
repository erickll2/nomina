import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none no-print">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bg = 'bg-emerald-950 border-emerald-700 text-emerald-50';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950 border-rose-700 text-rose-50';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl border ${bg} min-w-[280px] max-w-md animate-in slide-in-from-top-2 fade-in duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <span className="text-xs sm:text-sm font-medium leading-snug">{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
