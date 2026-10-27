import React, { useState } from 'react';
import { X, Briefcase, Plus } from 'lucide-react';
import { Cargo } from '../types';

interface ModalCargoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cargo: Cargo) => void;
}

export const ModalCargo: React.FC<ModalCargoProps> = ({ isOpen, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [semanal, setSemanal] = useState<number | ''>(65);
  const [quincenal, setQuincenal] = useState<number | ''>(130);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const sVal = typeof semanal === 'number' ? semanal : parseFloat(semanal) || 0;
    const qVal = typeof quincenal === 'number' ? quincenal : parseFloat(quincenal) || sVal * 2;

    const nuevoCargo: Cargo = {
      id: `cargo_${Date.now()}`,
      nombre: nombre.trim().toUpperCase(),
      semanal: sVal,
      quincenal: qVal,
    };

    onSave(nuevoCargo);
    setNombre('');
    setSemanal(65);
    setQuincenal(130);
    onClose();
  };

  const handleSemanalChange = (val: string) => {
    if (val === '') {
      setSemanal('');
      return;
    }
    const num = parseFloat(val);
    setSemanal(num);
    // suggest quincenal as 2x
    if (!isNaN(num)) {
      setQuincenal(parseFloat((num * 2).toFixed(2)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
              Nuevo Cargo en Tabulador
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Cargo (Puesto) *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: OPERADOR DE MAQUINARIA"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.toUpperCase())}
              className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm uppercase bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salario Semanal ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 font-bold text-xs pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={semanal}
                  onChange={(e) => handleSemanalChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salario Quincenal ($)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 font-bold text-xs pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quincenal}
                  onChange={(e) => setQuincenal(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Cargo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
