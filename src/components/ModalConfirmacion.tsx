import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ModalConfirmacionProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  titulo,
  mensaje,
  confirmLabel = 'Confirmar',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            {titulo}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          {mensaje}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
