import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Building2, CreditCard, DollarSign } from 'lucide-react';
import { Empleado, Cargo, EstatusLaboral, TipoPeriodo } from '../types';

interface ModalEmpleadoProps {
  isOpen: boolean;
  empleadoAEditar: Empleado | null;
  cargos: Cargo[];
  tipoPeriodo: TipoPeriodo;
  onClose: () => void;
  onSave: (empleado: Empleado) => void;
}

const BANCOS_VENEZUELA = [
  'BANCO DE VENEZUELA',
  'BANCO BANESCO',
  'BANCO MERCANTIL',
  'BANCO PROVINCIAL',
  'BANCO BICENTENARIO',
  'BANCO NACIONAL DE CRÉDITO (BNC)',
  'BANCO DEL TESORO',
  'BANCAMIGA',
  'BANCO EXTERIOR',
  'OTRO BANCO'
];

export const ModalEmpleado: React.FC<ModalEmpleadoProps> = ({
  isOpen,
  empleadoAEditar,
  cargos,
  tipoPeriodo,
  onClose,
  onSave,
}) => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState(BANCOS_VENEZUELA[0]);
  const [cuenta, setCuenta] = useState('');
  const [cargo, setCargo] = useState('');
  const [estatus, setEstatus] = useState<EstatusLaboral>('ACTIVO');
  const [montoUsd, setMontoUsd] = useState<number | ''>(60);
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    if (empleadoAEditar) {
      setCedula(empleadoAEditar.cedula || '');
      setNombre(empleadoAEditar.nombre || '');
      setBanco(empleadoAEditar.banco || BANCOS_VENEZUELA[0]);
      setCuenta(empleadoAEditar.cuenta || '');
      setCargo(empleadoAEditar.cargo || (cargos[0]?.nombre || 'AYUDANTE'));
      setEstatus(empleadoAEditar.estatus || 'ACTIVO');
      setMontoUsd(empleadoAEditar.montoUsd ?? 60);
      setObservacion(empleadoAEditar.observacion || '');
    } else {
      setCedula('');
      setNombre('');
      setBanco(BANCOS_VENEZUELA[0]);
      setCuenta('');
      const defaultCargo = cargos[0]?.nombre || 'AYUDANTE';
      setCargo(defaultCargo);
      setEstatus('ACTIVO');
      const cargoObj = cargos.find((c) => c.nombre === defaultCargo);
      const defaultMonto = cargoObj
        ? (tipoPeriodo === 'semanal' ? cargoObj.semanal : cargoObj.quincenal)
        : 60;
      setMontoUsd(defaultMonto);
      setObservacion('');
    }
  }, [empleadoAEditar, cargos, tipoPeriodo, isOpen]);

  const handleCargoChange = (newCargoName: string) => {
    setCargo(newCargoName);
    const cargoObj = cargos.find((c) => c.nombre === newCargoName);
    if (cargoObj) {
      setMontoUsd(tipoPeriodo === 'semanal' ? cargoObj.semanal : cargoObj.quincenal);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombre.trim()) return;

    let asistencias = empleadoAEditar?.asistencias || [true, true, true, true, true, true, true];
    let diasAdicionales = empleadoAEditar?.diasAdicionales || 0;

    if (estatus !== 'ACTIVO') {
      asistencias = [false, false, false, false, false, false, false];
      diasAdicionales = 0;
    }

    const nuevoEmpleado: Empleado = {
      id: empleadoAEditar?.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cedula: cedula.trim(),
      nombre: nombre.trim().toUpperCase(),
      banco,
      cuenta: cuenta.trim() || '00000000000000000000',
      cargo: cargo || (cargos[0]?.nombre || 'AYUDANTE'),
      estatus,
      montoUsd: typeof montoUsd === 'number' ? montoUsd : parseFloat(montoUsd) || 0,
      observacion: observacion.trim(),
      asistencias,
      diasAdicionales,
    };

    onSave(nuevoEmpleado);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b pb-3 border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100">
              {empleadoAEditar ? 'Editar Trabajador' : 'Añadir Nuevo Trabajador'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cédula de Identidad *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 14258963"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: JUAN CARLOS PÉREZ"
                value={nombre}
                onChange={(e) => setNombre(e.target.value.toUpperCase())}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm uppercase bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Entidad Bancaria
              </label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {BANCOS_VENEZUELA.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                N° Cuenta Bancaria (20 Dígitos)
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="01020000000000000000"
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value.replace(/\D/g, ''))}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-mono tracking-wider bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {cuenta.length}/20 dígitos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo / Puesto
              </label>
              <select
                value={cargo}
                onChange={(e) => handleCargoChange(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {cargos.map((c) => (
                  <option key={c.id} value={c.nombre}>
                    {c.nombre} (${tipoPeriodo === 'semanal' ? c.semanal : c.quincenal})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estatus Laboral
              </label>
              <select
                value={estatus}
                onChange={(e) => setEstatus(e.target.value as EstatusLaboral)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="SUSPENDIDO">SUSPENDIDO</option>
                <option value="REPOSO">REPOSO</option>
                <option value="DE PERMISO">DE PERMISO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sueldo Base ($ {tipoPeriodo === 'semanal' ? 'Semanal' : 'Quincenal'}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-600 font-bold text-xs pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={montoUsd}
                  onChange={(e) => setMontoUsd(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observación o Nota
              </label>
              <input
                type="text"
                placeholder="Ej: Bonos, turno especial, etc."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
              <Save className="w-4 h-4" />
              <span>Guardar Trabajador</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
