import React, { useMemo } from 'react';
import { 
  CalendarDays, 
  Search, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  CalendarCheck2 
} from 'lucide-react';
import { Empleado, Cargo, EstatusLaboral, CriterioOrden } from '../types';

interface TabAsistenciasProps {
  empleados: Empleado[];
  cargos: Cargo[];
  fechaInicioSemana: string;
  criterioOrden: CriterioOrden;
  searchQuery: string;
  filtroCargo: string;
  onFechaInicioSemanaChange: (fecha: string) => void;
  onCriterioOrdenChange: (val: CriterioOrden) => void;
  onSearchChange: (val: string) => void;
  onFiltroCargoChange: (val: string) => void;
  onToggleAsistencia: (empId: string, dayIndex: number, checked: boolean) => void;
  onCambiarEstatus: (empId: string, estatus: EstatusLaboral) => void;
  onCambiarDiasAdicionales: (empId: string, dias: number) => void;
  onMarcarTodosAsistieron: () => void;
  onLimpiarSemana: () => void;
}

const NOMBRES_DIAS: { [key: number]: { nombre: string; label: string; isSunday: boolean } } = {
  0: { nombre: 'DOM', label: 'Domingo', isSunday: true },
  1: { nombre: 'LUN', label: 'Lunes', isSunday: false },
  2: { nombre: 'MAR', label: 'Martes', isSunday: false },
  3: { nombre: 'MIÉ', label: 'Miércoles', isSunday: false },
  4: { nombre: 'JUE', label: 'Jueves', isSunday: false },
  5: { nombre: 'VIE', label: 'Viernes', isSunday: false },
  6: { nombre: 'SÁB', label: 'Sábado', isSunday: false },
};

export const TabAsistencias: React.FC<TabAsistenciasProps> = ({
  empleados,
  cargos,
  fechaInicioSemana,
  criterioOrden,
  searchQuery,
  filtroCargo,
  onFechaInicioSemanaChange,
  onCriterioOrdenChange,
  onSearchChange,
  onFiltroCargoChange,
  onToggleAsistencia,
  onCambiarEstatus,
  onCambiarDiasAdicionales,
  onMarcarTodosAsistieron,
  onLimpiarSemana,
}) => {
  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Calculate day dates starting dynamically from the user-selected date
  const fechasDias = useMemo(() => {
    if (!fechaInicioSemana) return [];

    const parts = fechaInicioSemana.split('-').map(Number);
    const year = parts[0];
    const month = (parts[1] || 1) - 1;
    const day = parts[2] || 1;

    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(year, month, day + idx);
      const dayOfWeek = d.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
      const info = NOMBRES_DIAS[dayOfWeek] || { nombre: 'DÍA', label: 'Día', isSunday: false };
      const diaNum = String(d.getDate()).padStart(2, '0');
      const mesNum = String(d.getMonth() + 1).padStart(2, '0');

      return {
        key: `dia_${idx}_${d.getTime()}`,
        index: idx,
        nombre: info.nombre,
        label: info.label,
        isSunday: info.isSunday,
        fechaStr: `${diaNum}/${mesNum}`,
        fullDate: `${d.getFullYear()}-${mesNum}-${diaNum}`,
      };
    });
  }, [fechaInicioSemana]);

  const parseCedula = (c: string) => parseInt(String(c || '').replace(/\D/g, ''), 10) || 0;

  const empleadosFiltrados = useMemo(() => {
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

    const query = searchQuery.toLowerCase().trim();
    return list.filter((emp) => {
      const matchCargo = filtroCargo === 'todos' || emp.cargo === filtroCargo;
      const matchSearch =
        !query ||
        emp.nombre.toLowerCase().includes(query) ||
        emp.cedula.includes(query) ||
        emp.cargo.toLowerCase().includes(query);
      return matchCargo && matchSearch;
    });
  }, [empleados, criterioOrden, searchQuery, filtroCargo]);

  return (
    <section className="space-y-6">
      {/* Search, Filter & Quick Options */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 no-print flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Buscar trabajador por nombre o cédula..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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

      {/* Main Attendance Card */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        {/* Header with dynamic period range */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Control de Asistencia Semanal {fechasDias[0] && fechasDias[6] ? `(${fechasDias[0].nombre} a ${fechasDias[6].nombre})` : ''}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {fechasDias[0] && fechasDias[6] ? (
                <>
                  Período de corte: del <span className="font-bold text-emerald-700 dark:text-emerald-400">{fechasDias[0].nombre} {fechasDias[0].fechaStr}</span> al <span className="font-bold text-emerald-700 dark:text-emerald-400">{fechasDias[6].nombre} {fechasDias[6].fechaStr}</span>. Marque los días asistidos e ingrese días adicionales si aplica.
                </>
              ) : (
                'Marque los días asistidos e ingrese días adicionales si aplica. El pago se recalcula automáticamente.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Start Date picker - starts on selected day of the week */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
              <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                Inicio ({fechasDias[0]?.nombre || 'Día'}):
              </label>
              <input
                type="date"
                value={fechaInicioSemana}
                onChange={(e) => onFechaInicioSemanaChange(e.target.value)}
                className="py-1 px-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            {/* Quick bulk attendance buttons */}
            <button
              onClick={onMarcarTodosAsistieron}
              title="Marcar asistencia completa para todos los activos"
              className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Todos Asistieron (7/7)</span>
            </button>

            <button
              onClick={onLimpiarSemana}
              title="Desmarcar todos los días de la semana"
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Limpiar Semana</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="tabla-asistencias-main">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3">TRABAJADOR</th>
                <th className="py-3 px-3">CARGO</th>
                <th className="py-3 px-3 text-center">ESTATUS</th>
                {fechasDias.map((d) => (
                  <th
                    key={d.key}
                    className={`py-3 px-2 text-center ${
                      d.isSunday
                        ? 'text-emerald-700 dark:text-emerald-400 font-extrabold bg-emerald-50/50 dark:bg-emerald-950/20'
                        : ''
                    }`}
                  >
                    <div className="font-extrabold">{d.nombre}</div>
                    <span className="text-[10px] text-slate-400 font-normal block">{d.fechaStr}</span>
                  </th>
                ))}
                <th className="py-3 px-2 text-center text-amber-700 dark:text-amber-400">
                  DÍAS ADIC.
                </th>
                <th className="py-3 px-3 text-center">ASISTENCIAS</th>
                <th className="py-3 px-3 text-right">SUELDO BASE</th>
                <th className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400">A PAGAR ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
              {empleadosFiltrados.map((emp) => {
                const estatus = emp.estatus || 'ACTIVO';
                const isActivo = estatus === 'ACTIVO';
                const asistencias = isActivo
                  ? emp.asistencias || [true, true, true, true, true, true, true]
                  : [false, false, false, false, false, false, false];

                const diasAdicionales = isActivo ? emp.diasAdicionales || 0 : 0;
                const baseUsd = parseFloat(String(emp.montoUsd)) || 0;
                const diasTrabajados = asistencias.filter(Boolean).length;
                const totalDiasPagados = diasTrabajados + diasAdicionales;
                const montoUsd = isActivo ? (baseUsd / 7) * totalDiasPagados : 0;

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition border-b border-slate-100 dark:border-slate-700/60"
                  >
                    <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                      <div>{emp.nombre}</div>
                      <div className="text-[10px] text-slate-400 font-normal">V- {emp.cedula}</div>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {emp.cargo}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <select
                        value={estatus}
                        onChange={(e) => onCambiarEstatus(emp.id, e.target.value as EstatusLaboral)}
                        className={`py-1 px-2 text-[11px] font-bold border rounded-lg focus:outline-none ${
                          estatus === 'ACTIVO'
                            ? 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                            : estatus === 'SUSPENDIDO'
                            ? 'text-rose-800 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
                            : estatus === 'REPOSO'
                            ? 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800'
                            : 'text-blue-800 bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="SUSPENDIDO">SUSPENDIDO</option>
                        <option value="REPOSO">REPOSO</option>
                        <option value="DE PERMISO">DE PERMISO</option>
                      </select>
                    </td>

                    {/* 7 Days checkboxes */}
                    {asistencias.map((checked, dayIdx) => (
                      <td key={dayIdx} className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!isActivo}
                          onChange={(e) => onToggleAsistencia(emp.id, dayIdx, e.target.checked)}
                          className={`w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500 transition ${
                            !isActivo ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        />
                      </td>
                    ))}

                    {/* Additional Days input */}
                    <td className="py-3 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={diasAdicionales}
                        disabled={!isActivo}
                        onChange={(e) =>
                          onCambiarDiasAdicionales(emp.id, parseInt(e.target.value) || 0)
                        }
                        className={`w-14 text-center py-1 text-xs border border-amber-300 dark:border-amber-700 rounded-lg bg-amber-50 dark:bg-slate-700 font-extrabold text-amber-800 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          !isActivo ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                      />
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-xs text-slate-700 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/80">
                        {diasTrabajados}
                        {diasAdicionales > 0 ? ` + ${diasAdicionales}` : ''} / 7
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      {formatUSD(baseUsd)}
                    </td>

                    <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                      {formatUSD(montoUsd)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
