import React, { useMemo, useRef } from 'react';
import { 
  Coins, 
  Clock, 
  RotateCw, 
  UserPlus, 
  FileSpreadsheet, 
  Download, 
  FileDown, 
  Trash2, 
  Printer, 
  Search, 
  ArrowUpDown, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Edit3, 
  Receipt, 
  FolderOpen 
} from 'lucide-react';
import { Empleado, Cargo, TipoPeriodo, CriterioOrden } from '../types';

interface TabNominaProps {
  empleados: Empleado[];
  cargos: Cargo[];
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  criterioOrden: CriterioOrden;
  searchQuery: string;
  filtroCargo: string;
  isFetchingBCV: boolean;
  nombreEmpresa: string;
  logoUrl?: string;
  onTasaChange: (val: number) => void;
  onTipoPeriodoChange: (val: TipoPeriodo) => void;
  onCriterioOrdenChange: (val: CriterioOrden) => void;
  onSearchChange: (val: string) => void;
  onFiltroCargoChange: (val: string) => void;
  onFetchBCV: () => void;
  onNuevoTrabajador: () => void;
  onImportarExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescargarPlantilla: () => void;
  onExportarExcel: () => void;
  onVaciarNomina: () => void;
  onEditarEmpleado: (emp: Empleado) => void;
  onEliminarEmpleado: (id: string) => void;
  onVerRecibo: (emp: Empleado) => void;
  onImprimirNomina: () => void;
}

export const TabNomina: React.FC<TabNominaProps> = ({
  empleados,
  cargos,
  tasaDolar,
  tipoPeriodo,
  criterioOrden,
  searchQuery,
  filtroCargo,
  isFetchingBCV,
  nombreEmpresa,
  logoUrl,
  onTasaChange,
  onTipoPeriodoChange,
  onCriterioOrdenChange,
  onSearchChange,
  onFiltroCargoChange,
  onFetchBCV,
  onNuevoTrabajador,
  onImportarExcel,
  onDescargarPlantilla,
  onExportarExcel,
  onVaciarNomina,
  onEditarEmpleado,
  onEliminarEmpleado,
  onVerRecibo,
  onImprimirNomina,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper formatting functions
  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val: number) =>
    'Bs.S ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Parse cédula as integer for numerical sort
  const parseCedula = (c: string) => parseInt(String(c || '').replace(/\D/g, ''), 10) || 0;

  // Processed employees with calculations, sorting & filtering
  const { empleadosProcesados, totalUSD, totalBS, totalActivos } = useMemo(() => {
    let list = [...empleados];

    // Sorting
    if (criterioOrden === 'cedula-asc') {
      list.sort((a, b) => parseCedula(a.cedula) - parseCedula(b.cedula));
    } else if (criterioOrden === 'cedula-desc') {
      list.sort((a, b) => parseCedula(b.cedula) - parseCedula(a.cedula));
    } else if (criterioOrden === 'nombre-asc') {
      list.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));
    } else if (criterioOrden === 'nombre-desc') {
      list.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || '', 'es', { sensitivity: 'base' }));
    }

    let sumUSD = 0;
    let sumBS = 0;
    let activosCount = 0;

    const computed = list.map((emp) => {
      const estatus = emp.estatus || 'ACTIVO';
      const baseUsd = parseFloat(String(emp.montoUsd)) || 0;
      const isActivo = estatus === 'ACTIVO';
      if (isActivo) activosCount++;

      const asistencias = isActivo
        ? emp.asistencias || [true, true, true, true, true, true, true]
        : [false, false, false, false, false, false, false];

      const diasTrabajados = asistencias.filter(Boolean).length;
      const diasAdicionales = isActivo ? parseInt(String(emp.diasAdicionales)) || 0 : 0;
      const totalDiasPagados = diasTrabajados + diasAdicionales;

      // 7-day proportion
      const montoUsd = isActivo ? (baseUsd / 7) * totalDiasPagados : 0;
      const montoBs = montoUsd * tasaDolar;

      sumUSD += montoUsd;
      sumBS += montoBs;

      return {
        ...emp,
        diasTrabajados,
        diasAdicionales,
        montoUsdCalculado: montoUsd,
        montoBsCalculado: montoBs,
      };
    });

    // Filtering by text & cargo
    const query = searchQuery.toLowerCase().trim();
    const filtrados = computed.filter((emp) => {
      const matchCargo = filtroCargo === 'todos' || emp.cargo === filtroCargo;
      const matchSearch =
        !query ||
        emp.nombre.toLowerCase().includes(query) ||
        emp.cedula.includes(query) ||
        emp.banco.toLowerCase().includes(query) ||
        emp.cargo.toLowerCase().includes(query);
      return matchCargo && matchSearch;
    });

    return {
      empleadosProcesados: filtrados,
      totalUSD: sumUSD,
      totalBS: sumBS,
      totalActivos: activosCount,
    };
  }, [empleados, criterioOrden, searchQuery, filtroCargo, tasaDolar]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="space-y-6">
      {/* Control Panel & Quick Actions (Hidden in print) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700 no-print transition">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Exchange Rate & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tasa Oficial BCV (Bs/$)</span>
                </label>
                <button
                  type="button"
                  onClick={onFetchBCV}
                  disabled={isFetchingBCV}
                  title="Consultar tasa oficial del BCV en tiempo real"
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold flex items-center gap-1 transition disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${isFetchingBCV ? 'animate-spin' : ''}`} />
                  <span>{isFetchingBCV ? 'Consultando...' : 'Actualizar BCV'}</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-400 text-xs font-bold pointer-events-none">
                  Bs.
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={tasaDolar}
                  onChange={(e) => onTasaChange(parseFloat(e.target.value) || 0)}
                  className="pl-9 pr-3 py-2 w-full text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Modalidad de Pago</span>
                </span>
              </label>
              <select
                value={tipoPeriodo}
                onChange={(e) => onTipoPeriodoChange(e.target.value as TipoPeriodo)}
                className="w-full py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="semanal">Semanal (7 días)</option>
                <option value="quincenal">Quincenal (15 días)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 items-center justify-start lg:justify-end">
            <button
              onClick={onNuevoTrabajador}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Trabajador</span>
            </button>

            {/* Excel Import */}
            <label className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 cursor-pointer transition border border-slate-200 dark:border-slate-600">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Importar Excel</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={onImportarExcel}
                className="hidden"
              />
            </label>

            {/* Template Download */}
            <button
              onClick={onDescargarPlantilla}
              title="Descargar modelo Excel para importar nómina"
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition border border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Plantilla</span>
            </button>

            {/* Export Full Payroll to Excel */}
            <button
              onClick={onExportarExcel}
              title="Exportar toda la nómina calculada a Excel"
              className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition border border-emerald-200 dark:border-emerald-800 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={onImprimirNomina}
              title="Imprimir nómina general o guardar en PDF"
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition border border-slate-200 dark:border-slate-600 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Imprimir</span>
            </button>

            {/* Clear List */}
            <button
              onClick={onVaciarNomina}
              title="Vaciar nómina completa"
              className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold py-2 px-3 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 transition border border-rose-200 dark:border-rose-900/60 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vaciar</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o banco..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Filter by Position */}
            <div className="w-full sm:w-56">
              <select
                value={filtroCargo}
                onChange={(e) => onFiltroCargoChange(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todos">Todos los Cargos</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Ordenar por:</span>
            </label>
            <select
              value={criterioOrden}
              onChange={(e) => onCriterioOrdenChange(e.target.value as CriterioOrden)}
              className="py-1.5 px-3 text-xs border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="original">Orden de Registro</option>
              <option value="cedula-asc">Cédula: Menor a Mayor (1 → 9)</option>
              <option value="cedula-desc">Cédula: Mayor a Menor (9 → 1)</option>
              <option value="nombre-asc">Nombre: Alfabético (A - Z)</option>
              <option value="nombre-desc">Nombre: Alfabético (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards (Hidden in print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 dark:bg-emerald-950/80 p-3.5 rounded-2xl text-emerald-700 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Total Nómina
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {empleados.length} Trabajadores
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {totalActivos} activos • {empleados.length - totalActivos} en reposo/permiso
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 dark:bg-emerald-950/80 p-3.5 rounded-2xl text-emerald-700 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Monto Total ($)
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatUSD(totalUSD)}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Período: <span className="capitalize">{tipoPeriodo}</span>
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 dark:bg-blue-950/80 p-3.5 rounded-2xl text-blue-700 dark:text-blue-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Monto Total (Bs.S)
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatBs(totalBS)}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Tasa: Bs. {tasaDolar.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Payroll Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print-card">
        
        {/* Print Header (Only visible on print) */}
        <div className="print-only p-6 border-b text-center">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={nombreEmpresa}
              className="h-14 max-w-[160px] object-contain mx-auto mb-2"
            />
          )}
          <h2 className="text-2xl font-black">{nombreEmpresa}</h2>
          <p className="text-sm font-bold uppercase">
            RELACIÓN GENERAL DE NÓMINA - PERÍODO DE PAGO ({tipoPeriodo})
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tasa Oficial de Liquidación: Bs. {tasaDolar.toFixed(2)} / USD
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="tabla-nomina-main">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3 text-center">#</th>
                <th className="py-3 px-3">BANCO</th>
                <th className="py-3 px-3">N° CUENTA</th>
                <th className="py-3 px-3">CÉDULA</th>
                <th className="py-3 px-3">NOMBRE Y APELLIDO</th>
                <th className="py-3 px-3">CARGO</th>
                <th className="py-3 px-3 text-center">ESTATUS</th>
                <th className="py-3 px-3 text-center">ASISTENCIA</th>
                <th className="py-3 px-3 text-right">MONTO ($)</th>
                <th className="py-3 px-3 text-right">MONTO (Bs.S)</th>
                <th className="py-3 px-3">OBSERVACIÓN</th>
                <th className="py-3 px-3 text-center no-print">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
              {empleadosProcesados.map((emp, idx) => {
                const estatus = emp.estatus || 'ACTIVO';
                let estatusBadge = (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                    ACTIVO
                  </span>
                );
                if (estatus === 'SUSPENDIDO') {
                  estatusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-extrabold border border-rose-300 dark:border-rose-800">
                      SUSPENDIDO
                    </span>
                  );
                } else if (estatus === 'REPOSO') {
                  estatusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold border border-amber-300 dark:border-amber-800">
                      REPOSO
                    </span>
                  );
                } else if (estatus === 'DE PERMISO') {
                  estatusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold border border-blue-300 dark:border-blue-800">
                      DE PERMISO
                    </span>
                  );
                }

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition border-b border-slate-100 dark:border-slate-700/60"
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-500 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-xs text-slate-700 dark:text-slate-300">
                      {emp.banco}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {emp.cuenta}
                    </td>
                    <td className="py-3 px-3 font-bold text-xs text-slate-800 dark:text-slate-200">
                      {emp.cedula}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      {emp.nombre}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-600">
                        {emp.cargo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{estatusBadge}</td>
                    <td className="py-3 px-3 text-center font-bold text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          emp.diasTrabajados === 7
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : emp.diasTrabajados === 0
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {emp.diasTrabajados}
                        {emp.diasAdicionales > 0 ? ` + ${emp.diasAdicionales} adic.` : ''} / 7 días
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatUSD(emp.montoUsdCalculado)}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-800 dark:text-slate-200">
                      {formatBs(emp.montoBsCalculado)}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 italic">
                      {emp.observacion || '-'}
                    </td>
                    <td className="py-3 px-3 text-center no-print">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onVerRecibo(emp)}
                          title="Ver e imprimir recibo individual"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditarEmpleado(emp)}
                          title="Editar trabajador"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEliminarEmpleado(emp.id)}
                          title="Eliminar de nómina"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {empleadosProcesados.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-slate-300 dark:text-slate-600 text-4xl mb-3 flex justify-center">
              <FolderOpen className="w-12 h-12 stroke-[1.5]" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              No hay trabajadores registrados o coincidentes.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Añada un trabajador manualmente o importe un archivo Excel con la nómina.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
