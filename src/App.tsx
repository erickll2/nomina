import React, { useState, useEffect, useCallback } from 'react';
import { 
  loadEmpleados, 
  saveEmpleados, 
  loadCargos, 
  saveCargos, 
  loadConfig, 
  saveConfig, 
  EMPLEADOS_INICIALES, 
  CARGOS_INICIALES,
  CONFIG_INICIAL,
  getNearestWednesday
} from './services/storage';
import { fetchBCVRate } from './services/bcv';
import { descargarPlantillaExcel, exportarNominaExcel, parseExcelFile } from './services/excel';
import { Empleado, Cargo, AppConfig, TipoPeriodo, CriterioOrden, EstatusLaboral } from './types';
import { Header, TabKey } from './components/Header';
import { TabNomina } from './components/TabNomina';
import { TabAsistencias } from './components/TabAsistencias';
import { TabCargos } from './components/TabCargos';
import { TabConfig } from './components/TabConfig';
import { ModalEmpleado } from './components/ModalEmpleado';
import { ModalCargo } from './components/ModalCargo';
import { ModalRecibo } from './components/ModalRecibo';
import { ModalConfirmacion } from './components/ModalConfirmacion';
import { ModalImprimirNomina } from './components/ModalImprimirNomina';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';

export default function App() {
  // App State
  const [currentTab, setCurrentTab] = useState<TabKey>('nomina');
  const [empleados, setEmpleados] = useState<Empleado[]>(() => loadEmpleados());
  const [cargos, setCargos] = useState<Cargo[]>(() => loadCargos());
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [isFetchingBCV, setIsFetchingBCV] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isModalEmpleadoOpen, setIsModalEmpleadoOpen] = useState(false);
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null);

  const [isModalCargoOpen, setIsModalCargoOpen] = useState(false);

  const [isModalReciboOpen, setIsModalReciboOpen] = useState(false);
  const [reciboEmpleado, setReciboEmpleado] = useState<Empleado | null>(null);

  const [isModalImprimirOpen, setIsModalImprimirOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    titulo: string;
    mensaje: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    titulo: '',
    mensaje: '',
    onConfirm: () => {},
  });

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme with DOM
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // Sync font size with DOM
  useEffect(() => {
    document.body.classList.remove('fs-sm', 'fs-base', 'fs-lg', 'fs-xl');
    document.body.classList.add(config.fontSize || 'fs-base');
  }, [config.fontSize]);

  // Save changes to LocalStorage
  useEffect(() => {
    saveEmpleados(empleados);
  }, [empleados]);

  useEffect(() => {
    saveCargos(cargos);
  }, [cargos]);

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  // Real-time BCV query
  const handleFetchBCV = useCallback(async (isInitial = false) => {
    setIsFetchingBCV(true);
    const result = await fetchBCVRate();
    setIsFetchingBCV(false);

    if (result) {
      setConfig((prev) => ({ ...prev, tasaDolar: result.rate }));
      showToast(`Tasa BCV actualizada: Bs. ${result.rate.toFixed(2)} (${result.source})`, 'success');
    } else {
      if (!isInitial) {
        showToast('No se pudo consultar la API del BCV en tiempo real. Puede fijar la tasa manualmente.', 'error');
      }
    }
  }, [showToast]);

  // Auto-fetch BCV rate on mount
  useEffect(() => {
    handleFetchBCV(true);
  }, [handleFetchBCV]);

  // Worker Actions
  const handleNuevoTrabajador = () => {
    setEmpleadoAEditar(null);
    setIsModalEmpleadoOpen(true);
  };

  const handleEditarEmpleado = (emp: Empleado) => {
    setEmpleadoAEditar(emp);
    setIsModalEmpleadoOpen(true);
  };

  const handleSaveEmpleado = (emp: Empleado) => {
    setEmpleados((prev) => {
      const idx = prev.findIndex((e) => e.id === emp.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = emp;
        return updated;
      }
      return [...prev, emp];
    });
    showToast(`Trabajador "${emp.nombre}" guardado con éxito.`);
  };

  const handleEliminarEmpleado = (id: string) => {
    const emp = empleados.find((e) => e.id === id);
    setConfirmDialog({
      isOpen: true,
      titulo: '¿Eliminar trabajador?',
      mensaje: `¿Está seguro de eliminar a ${emp?.nombre || 'este trabajador'} de la nómina?`,
      onConfirm: () => {
        setEmpleados((prev) => prev.filter((e) => e.id !== id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Trabajador eliminado de la nómina.', 'info');
      },
    });
  };

  const handleVaciarNomina = () => {
    if (empleados.length === 0) {
      showToast('La nómina ya está vacía.', 'info');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      titulo: '¿Vaciar toda la nómina?',
      mensaje: `Esta acción eliminará los ${empleados.length} trabajadores de la lista. Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setEmpleados([]);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Nómina vaciada por completo.', 'info');
      },
    });
  };

  const handleVerRecibo = (emp: Empleado) => {
    setReciboEmpleado(emp);
    setIsModalReciboOpen(true);
  };

  // Position Actions
  const handleNuevoCargo = () => {
    setIsModalCargoOpen(true);
  };

  const handleSaveCargo = (cargo: Cargo) => {
    setCargos((prev) => [...prev, cargo]);
    showToast(`Cargo "${cargo.nombre}" agregado al tabulador.`);
  };

  const handleEliminarCargo = (id: string) => {
    const cargo = cargos.find((c) => c.id === id);
    setConfirmDialog({
      isOpen: true,
      titulo: '¿Eliminar cargo?',
      mensaje: `¿Desea eliminar el cargo "${cargo?.nombre || ''}" del tabulador salarial?`,
      onConfirm: () => {
        setCargos((prev) => prev.filter((c) => c.id !== id));
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Cargo eliminado del tabulador.', 'info');
      },
    });
  };

  // Attendance actions
  const handleToggleAsistencia = (empId: string, dayIndex: number, checked: boolean) => {
    setEmpleados((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const newAsist = [...(emp.asistencias || [true, true, true, true, true, true, true])];
        newAsist[dayIndex] = checked;
        return { ...emp, asistencias: newAsist };
      })
    );
  };

  const handleCambiarEstatus = (empId: string, nuevoEstatus: EstatusLaboral) => {
    setEmpleados((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        const isActivo = nuevoEstatus === 'ACTIVO';
        return {
          ...emp,
          estatus: nuevoEstatus,
          asistencias: isActivo ? [true, true, true, true, true, true, true] : [false, false, false, false, false, false, false],
          diasAdicionales: isActivo ? emp.diasAdicionales : 0,
        };
      })
    );
    showToast(`Estatus actualizado a: ${nuevoEstatus}`);
  };

  const handleCambiarDiasAdicionales = (empId: string, dias: number) => {
    setEmpleados((prev) =>
      prev.map((emp) => (emp.id === empId ? { ...emp, diasAdicionales: Math.max(0, dias) } : emp))
    );
  };

  const handleMarcarTodosAsistieron = () => {
    setEmpleados((prev) =>
      prev.map((emp) => {
        if (emp.estatus !== 'ACTIVO') return emp;
        return {
          ...emp,
          asistencias: [true, true, true, true, true, true, true],
        };
      })
    );
    showToast('Se marcaron todos los días (7/7) para los trabajadores activos.');
  };

  const handleLimpiarSemana = () => {
    setEmpleados((prev) =>
      prev.map((emp) => ({
        ...emp,
        asistencias: [false, false, false, false, false, false, false],
        diasAdicionales: 0,
      }))
    );
    showToast('Asistencias de la semana limpiadas (0/7).', 'info');
  };

  // Excel handlers
  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseExcelFile(file, cargos, config.tipoPeriodo);
      setEmpleados((prev) => [...prev, ...parsed]);
      showToast(`¡Éxito! Se importaron ${parsed.length} trabajadores de Excel.`);
    } catch (err: any) {
      console.error('Error al importar Excel:', err);
      showToast(err.message || 'Error al procesar el archivo Excel.', 'error');
    }
    e.target.value = '';
  };

  const handleDescargarPlantilla = () => {
    try {
      descargarPlantillaExcel();
      showToast('Plantilla Excel descargada con éxito.');
    } catch (err) {
      showToast('Error al descargar la plantilla Excel.', 'error');
    }
  };

  const handleExportarExcel = () => {
    try {
      exportarNominaExcel(empleados, config.tasaDolar, config.tipoPeriodo, config.nombreEmpresa);
      showToast('Nómina exportada a Excel exitosamente.');
    } catch (err) {
      showToast('Error al exportar la nómina a Excel.', 'error');
    }
  };

  // Backup & Restore
  const handleRestoreBackup = (
    newEmpleados: Empleado[],
    newCargos: Cargo[],
    newConfig: AppConfig
  ) => {
    setEmpleados(newEmpleados);
    setCargos(newCargos);
    setConfig(newConfig);
    showToast('Copia de respaldo restaurada exitosamente.');
  };

  const handleResetSeedData = () => {
    setConfirmDialog({
      isOpen: true,
      titulo: '¿Restaurar datos iniciales de demostración?',
      mensaje: 'Esta acción sustituirá los datos actuales con la configuración y nómina inicial de ejemplo.',
      onConfirm: () => {
        setEmpleados(EMPLEADOS_INICIALES);
        setCargos(CARGOS_INICIALES);
        setConfig(CONFIG_INICIAL);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Datos iniciales restablecidos.');
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        nombreEmpresa={config.nombreEmpresa}
        logoUrl={config.logoUrl}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {currentTab === 'nomina' && (
          <TabNomina
            empleados={empleados}
            cargos={cargos}
            tasaDolar={config.tasaDolar}
            tipoPeriodo={config.tipoPeriodo}
            criterioOrden={config.criterioOrden}
            searchQuery={searchQuery}
            filtroCargo={filtroCargo}
            isFetchingBCV={isFetchingBCV}
            nombreEmpresa={config.nombreEmpresa}
            logoUrl={config.logoUrl}
            onTasaChange={(val) => setConfig((prev) => ({ ...prev, tasaDolar: val }))}
            onTipoPeriodoChange={(val) => setConfig((prev) => ({ ...prev, tipoPeriodo: val }))}
            onCriterioOrdenChange={(val) => setConfig((prev) => ({ ...prev, criterioOrden: val }))}
            onSearchChange={setSearchQuery}
            onFiltroCargoChange={setFiltroCargo}
            onFetchBCV={() => handleFetchBCV(false)}
            onNuevoTrabajador={handleNuevoTrabajador}
            onImportarExcel={handleImportarExcel}
            onDescargarPlantilla={handleDescargarPlantilla}
            onExportarExcel={handleExportarExcel}
            onVaciarNomina={handleVaciarNomina}
            onEditarEmpleado={handleEditarEmpleado}
            onEliminarEmpleado={handleEliminarEmpleado}
            onVerRecibo={handleVerRecibo}
            onImprimirNomina={() => setIsModalImprimirOpen(true)}
          />
        )}

        {currentTab === 'asistencias' && (
          <TabAsistencias
            empleados={empleados}
            cargos={cargos}
            fechaInicioSemana={config.fechaInicioSemana}
            criterioOrden={config.criterioOrden}
            searchQuery={searchQuery}
            filtroCargo={filtroCargo}
            onFechaInicioSemanaChange={(val) =>
              setConfig((prev) => ({ ...prev, fechaInicioSemana: val }))
            }
            onCriterioOrdenChange={(val) => setConfig((prev) => ({ ...prev, criterioOrden: val }))}
            onSearchChange={setSearchQuery}
            onFiltroCargoChange={setFiltroCargo}
            onToggleAsistencia={handleToggleAsistencia}
            onCambiarEstatus={handleCambiarEstatus}
            onCambiarDiasAdicionales={handleCambiarDiasAdicionales}
            onMarcarTodosAsistieron={handleMarcarTodosAsistieron}
            onLimpiarSemana={handleLimpiarSemana}
          />
        )}

        {currentTab === 'cargos' && (
          <TabCargos
            cargos={cargos}
            onNuevoCargo={handleNuevoCargo}
            onEliminarCargo={handleEliminarCargo}
          />
        )}

        {currentTab === 'config' && (
          <TabConfig
            config={config}
            empleados={empleados}
            cargos={cargos}
            onConfigChange={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
            onRestoreBackup={handleRestoreBackup}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-4 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-medium">
          {config.nombreEmpresa} — RIF: {config.rifEmpresa} • Sistema de Nóminas y Control de Asistencias
        </p>
      </footer>

      {/* Modals */}
      <ModalEmpleado
        isOpen={isModalEmpleadoOpen}
        empleadoAEditar={empleadoAEditar}
        cargos={cargos}
        tipoPeriodo={config.tipoPeriodo}
        onClose={() => setIsModalEmpleadoOpen(false)}
        onSave={handleSaveEmpleado}
      />

      <ModalCargo
        isOpen={isModalCargoOpen}
        onClose={() => setIsModalCargoOpen(false)}
        onSave={handleSaveCargo}
      />

      <ModalRecibo
        isOpen={isModalReciboOpen}
        empleado={reciboEmpleado}
        tasaDolar={config.tasaDolar}
        tipoPeriodo={config.tipoPeriodo}
        nombreEmpresa={config.nombreEmpresa}
        rifEmpresa={config.rifEmpresa}
        logoUrl={config.logoUrl}
        onClose={() => {
          setIsModalReciboOpen(false);
          setReciboEmpleado(null);
        }}
      />

      <ModalImprimirNomina
        isOpen={isModalImprimirOpen}
        empleados={empleados}
        tasaDolar={config.tasaDolar}
        tipoPeriodo={config.tipoPeriodo}
        nombreEmpresa={config.nombreEmpresa}
        rifEmpresa={config.rifEmpresa}
        logoUrl={config.logoUrl}
        onClose={() => setIsModalImprimirOpen(false)}
      />

      <ModalConfirmacion
        isOpen={confirmDialog.isOpen}
        titulo={confirmDialog.titulo}
        mensaje={confirmDialog.mensaje}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
