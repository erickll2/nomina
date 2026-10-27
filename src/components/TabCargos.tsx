import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { Cargo } from '../types';

interface TabCargosProps {
  cargos: Cargo[];
  onNuevoCargo: () => void;
  onEliminarCargo: (id: string) => void;
}

export const TabCargos: React.FC<TabCargosProps> = ({
  cargos,
  onNuevoCargo,
  onEliminarCargo,
}) => {
  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Tabulador Salarial por Cargo</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Define los salarios predeterminados en Dólares ($) según la responsabilidad del puesto en la empresa.
            </p>
          </div>

          <button
            onClick={onNuevoCargo}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cargo</span>
          </button>
        </div>

        {/* Table of Positions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Nombre del Cargo</th>
                <th className="py-3 px-4 text-right">Salario Semanal ($)</th>
                <th className="py-3 px-4 text-right">Salario Quincenal ($)</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
              {cargos.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition border-b border-slate-100 dark:border-slate-700/60"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs">
                      {c.nombre}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatUSD(c.semanal)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatUSD(c.quincenal)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onEliminarCargo(c.id)}
                      title="Eliminar cargo"
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
