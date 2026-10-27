import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Empleado, TipoPeriodo } from '../types';
import { imprimirReciboIndividual } from '../services/printService';

interface ModalReciboProps {
  isOpen: boolean;
  empleado: Empleado | null;
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  nombreEmpresa: string;
  rifEmpresa: string;
  logoUrl?: string;
  onClose: () => void;
}

export const ModalRecibo: React.FC<ModalReciboProps> = ({
  isOpen,
  empleado,
  tasaDolar,
  tipoPeriodo,
  nombreEmpresa,
  rifEmpresa,
  logoUrl,
  onClose,
}) => {
  if (!isOpen || !empleado) return null;

  const estatus = empleado.estatus || 'ACTIVO';
  const baseUsd = empleado.montoUsd || 0;
  const diasAsistidos = estatus === 'ACTIVO' ? empleado.asistencias.filter(Boolean).length : 0;
  const diasAdic = estatus === 'ACTIVO' ? empleado.diasAdicionales || 0 : 0;
  const totalDias = diasAsistidos + diasAdic;
  const montoUsd = estatus === 'ACTIVO' ? (baseUsd / 7) * totalDias : 0;
  const montoBs = montoUsd * tasaDolar;

  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val: number) =>
    'Bs.S ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => {
    imprimirReciboIndividual({
      empleado,
      tasaDolar,
      tipoPeriodo,
      nombreEmpresa,
      rifEmpresa,
      logoUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 my-8">
        {/* Actions bar (hidden during print) */}
        <div className="flex justify-between items-center mb-6 no-print border-b pb-3 border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
            <span className="font-bold text-sm sm:text-base">Recibo de Nómina Individual</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Card */}
        <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Company Header */}
          <div className="text-center border-b pb-4 mb-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={nombreEmpresa}
                className="h-12 max-w-[140px] object-contain mx-auto mb-2"
              />
            )}
            <h2 className="text-lg font-black tracking-wide text-emerald-900">
              {nombreEmpresa}
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wider">
              RIF: {rifEmpresa} | ESTADO BOLÍVAR, VENEZUELA
            </p>
            <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase border border-emerald-200">
              Comprobante de Pago de Nómina ({tipoPeriodo})
            </div>
          </div>

          {/* Worker Info */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Trabajador</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{empleado.nombre}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Cédula de Identidad</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">V- {empleado.cedula}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Cargo / Función</span>
              <p className="font-semibold text-slate-800">{empleado.cargo}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Estatus</span>
              <p className="font-semibold text-emerald-700">{empleado.estatus}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Entidad y Cuenta Bancaria</span>
              <p className="font-mono text-[11px] text-slate-800">
                {empleado.banco} — <span className="font-bold">{empleado.cuenta}</span>
              </p>
            </div>
          </div>

          {/* Attendance and Calculation Breakdown */}
          <div className="mb-4">
            <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 text-left">Concepto</th>
                  <th className="py-2 px-3 text-center">Unidad / Cant.</th>
                  <th className="py-2 px-3 text-right">Monto ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 font-medium">Sueldo Base ({tipoPeriodo})</td>
                  <td className="py-2 px-3 text-center text-slate-500">7 días est.</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatUSD(baseUsd)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Días Asistidos (Mié-Mar)</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-700">{diasAsistidos} días</td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatUSD((baseUsd / 7) * diasAsistidos)}
                  </td>
                </tr>
                {diasAdic > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-medium text-amber-800">Días Adicionales / Guardias</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-700">{diasAdic} días</td>
                    <td className="py-2 px-3 text-right font-medium text-amber-800">
                      {formatUSD((baseUsd / 7) * diasAdic)}
                    </td>
                  </tr>
                )}
                {empleado.observacion && (
                  <tr>
                    <td colSpan={3} className="py-1.5 px-3 text-[11px] italic text-slate-500 bg-slate-50">
                      Nota: {empleado.observacion}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">
                Tasa de Cambio Oficial BCV
              </p>
              <p className="text-xs font-bold text-emerald-900">
                1 USD = Bs. {tasaDolar.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total a Transferir</span>
              <div className="text-base font-extrabold text-emerald-800">
                {formatUSD(montoUsd)}
              </div>
              <div className="text-lg font-black text-slate-900 leading-tight">
                {formatBs(montoBs)}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-dashed border-slate-300">
            <div>
              <div className="h-10 border-b border-slate-400 mx-4"></div>
              <p className="text-[10px] font-bold uppercase text-slate-700 mt-1.5">
                Por SUPRAGUAYANA, S.A.
              </p>
              <p className="text-[9px] text-slate-400">Recursos Humanos / Administración</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mx-4"></div>
              <p className="text-[10px] font-bold uppercase text-slate-700 mt-1.5">
                Recibido Conforme (Trabajador)
              </p>
              <p className="text-[9px] text-slate-400">C.I. {empleado.cedula}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
