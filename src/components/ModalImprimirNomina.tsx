import React, { useEffect } from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { Empleado, TipoPeriodo } from '../types';
import { imprimirNominaCompleta } from '../services/printService';

interface ModalImprimirNominaProps {
  isOpen: boolean;
  empleados: Empleado[];
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  nombreEmpresa: string;
  rifEmpresa: string;
  logoUrl?: string;
  onClose: () => void;
}

export const ModalImprimirNomina: React.FC<ModalImprimirNominaProps> = ({
  isOpen,
  empleados,
  tasaDolar,
  tipoPeriodo,
  nombreEmpresa,
  rifEmpresa,
  logoUrl,
  onClose,
}) => {
  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val: number) =>
    'Bs.S ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => {
    imprimirNominaCompleta({
      empleados,
      tasaDolar,
      tipoPeriodo,
      nombreEmpresa,
      rifEmpresa,
      logoUrl,
    });
  };

  // Trigger print automatically when opening modal
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let totalUSD = 0;
  let totalBS = 0;
  let totalActivos = 0;

  const filasCalculadas = empleados.map((emp, idx) => {
    const estatus = emp.estatus || 'ACTIVO';
    const isActivo = estatus === 'ACTIVO';
    if (isActivo) totalActivos++;

    const asistencias = isActivo
      ? emp.asistencias || [true, true, true, true, true, true, true]
      : [false, false, false, false, false, false, false];

    const diasTrabajados = asistencias.filter(Boolean).length;
    const diasAdicionales = isActivo ? parseInt(String(emp.diasAdicionales)) || 0 : 0;
    const totalDiasPagados = diasTrabajados + diasAdicionales;

    const baseUsd = parseFloat(String(emp.montoUsd)) || 0;
    const montoUsd = isActivo ? (baseUsd / 7) * totalDiasPagados : 0;
    const montoBs = montoUsd * tasaDolar;

    totalUSD += montoUsd;
    totalBS += montoBs;

    return {
      idx: idx + 1,
      emp,
      estatus,
      isActivo,
      diasTrabajados,
      diasAdicionales,
      montoUsd,
      montoBs,
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Action Bar (no-print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-extrabold text-sm sm:text-base">
              Vista Previa e Impresión de Nómina
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 dark:bg-slate-950/70">
          <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-lg max-w-5xl mx-auto border border-slate-200">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-4 border-b-2 border-blue-900 gap-4">
              <div className="flex items-center space-x-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={nombreEmpresa}
                    className="h-14 max-w-[140px] object-contain rounded-lg border border-slate-200 p-1"
                  />
                )}
                <div>
                  <h1 className="text-lg font-black text-blue-950 uppercase tracking-wide">
                    {nombreEmpresa}
                  </h1>
                  <p className="text-xs font-bold text-slate-600 uppercase">
                    RELACIÓN GENERAL DE NÓMINA — PERÍODO {tipoPeriodo.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold font-mono">
                    RIF: {rifEmpresa} • ESTADO BOLÍVAR, VENEZUELA
                  </p>
                </div>
              </div>

              <div className="text-right text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 self-stretch sm:self-auto flex flex-col justify-center">
                <div>
                  <span className="text-slate-500 font-semibold">Fecha:</span>{' '}
                  <span className="font-bold">{new Date().toLocaleDateString('es-VE')}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Tasa Oficial BCV:</span>{' '}
                  <span className="font-extrabold text-blue-900">Bs. {tasaDolar.toFixed(2)} / $</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Total Personal:</span>{' '}
                  <span className="font-bold">{empleados.length} trabajadores</span>
                </div>
              </div>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Personal Activo</span>
                <span className="font-extrabold text-slate-800">{totalActivos} de {empleados.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Modalidad</span>
                <span className="font-extrabold text-slate-800 capitalize">{tipoPeriodo}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total en Dólares ($)</span>
                <span className="font-extrabold text-emerald-700">{formatUSD(totalUSD)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total en Bolívares (Bs.S)</span>
                <span className="font-extrabold text-blue-900">{formatBs(totalBS)}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-y border-slate-300">
                    <th className="py-2 px-2 text-center">#</th>
                    <th className="py-2 px-2">Banco</th>
                    <th className="py-2 px-2">N° Cuenta</th>
                    <th className="py-2 px-2">Cédula</th>
                    <th className="py-2 px-2">Nombre y Apellido</th>
                    <th className="py-2 px-2">Cargo</th>
                    <th className="py-2 px-2 text-center">Estatus</th>
                    <th className="py-2 px-2 text-center">Asist.</th>
                    <th className="py-2 px-2 text-right">Monto ($)</th>
                    <th className="py-2 px-2 text-right">Monto (Bs.S)</th>
                    <th className="py-2 px-2">Observación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filasCalculadas.map((item) => (
                    <tr key={item.emp.id} className="text-[11px]">
                      <td className="py-2 px-2 text-center font-bold text-slate-400">{item.idx}</td>
                      <td className="py-2 px-2 font-medium">{item.emp.banco}</td>
                      <td className="py-2 px-2 font-mono text-[10px]">{item.emp.cuenta}</td>
                      <td className="py-2 px-2 font-bold">{item.emp.cedula}</td>
                      <td className="py-2 px-2 font-extrabold text-slate-900">{item.emp.nombre}</td>
                      <td className="py-2 px-2 text-slate-700">{item.emp.cargo}</td>
                      <td className="py-2 px-2 text-center font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            item.estatus === 'ACTIVO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.estatus === 'SUSPENDIDO'
                              ? 'bg-rose-100 text-rose-800'
                              : item.estatus === 'REPOSO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.estatus}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center font-bold">
                        {item.diasTrabajados}
                        {item.diasAdicionales > 0 ? ` + ${item.diasAdicionales}` : ''}/7
                      </td>
                      <td className="py-2 px-2 text-right font-black text-emerald-700">
                        {formatUSD(item.montoUsd)}
                      </td>
                      <td className="py-2 px-2 text-right font-black text-slate-900">
                        {formatBs(item.montoBs)}
                      </td>
                      <td className="py-2 px-2 text-[10px] text-slate-500 italic">
                        {item.emp.observacion || '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-xs border-t-2 border-blue-900">
                    <td colSpan={7} className="py-3 px-3 text-right uppercase tracking-wider text-blue-950">
                      Totales Generales:
                    </td>
                    <td className="py-3 px-2 text-center text-slate-700">{empleados.length} trab.</td>
                    <td className="py-3 px-2 text-right text-emerald-700 font-extrabold">
                      {formatUSD(totalUSD)}
                    </td>
                    <td className="py-3 px-2 text-right text-blue-950 font-black">
                      {formatBs(totalBS)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 text-center mt-12 pt-8 border-t border-dashed border-slate-300 text-xs">
              <div>
                <div className="h-10 border-b border-slate-400 mx-3"></div>
                <p className="font-bold text-slate-800 mt-2 text-[11px] uppercase">
                  Elaborado por
                </p>
                <p className="text-[10px] text-slate-500">Recursos Humanos / Nómina</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400 mx-3"></div>
                <p className="font-bold text-slate-800 mt-2 text-[11px] uppercase">
                  Revisado por
                </p>
                <p className="text-[10px] text-slate-500">Administración y Finanzas</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-400 mx-3"></div>
                <p className="font-bold text-slate-800 mt-2 text-[11px] uppercase">
                  Aprobado por
                </p>
                <p className="text-[10px] text-slate-500">Gerencia General</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
