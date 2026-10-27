import { Cargo, Empleado, AppConfig } from '../types';

export const CARGOS_INICIALES: Cargo[] = [
  { id: '1', nombre: 'AYUDANTE', semanal: 60, quincenal: 120 },
  { id: '2', nombre: 'AYUDANTE DE BARRIDO', semanal: 60, quincenal: 120 },
  { id: '3', nombre: 'LIMPIADOR', semanal: 60, quincenal: 120 },
  { id: '4', nombre: 'DESMALEZADOR', semanal: 65, quincenal: 130 },
  { id: '5', nombre: 'CAPORAL', semanal: 75, quincenal: 150 },
  { id: '6', nombre: 'CHOFER', semanal: 85, quincenal: 170 },
  { id: '7', nombre: 'MECÁNICO', semanal: 85, quincenal: 170 },
  { id: '8', nombre: 'SUPERVISOR', semanal: 90, quincenal: 180 },
  { id: '9', nombre: 'ADMINISTRATIVO', semanal: 75, quincenal: 150 },
];

export const EMPLEADOS_INICIALES: Empleado[] = [
  {
    id: 'emp_1',
    cedula: '14258963',
    nombre: 'GONZÁLEZ MARTÍNEZ JOSÉ RAMÓN',
    banco: 'BANCO DE VENEZUELA',
    cuenta: '01020123456789012345',
    cargo: 'CHOFER',
    estatus: 'ACTIVO',
    montoUsd: 85,
    observacion: 'Ruta Zona Industrial',
    asistencias: [true, true, true, true, true, true, true],
    diasAdicionales: 0,
  },
  {
    id: 'emp_2',
    cedula: '18745231',
    nombre: 'RODRÍGUEZ PEÑA CARLOS EDUARDO',
    banco: 'BANCO BANESCO',
    cuenta: '01340456789012345678',
    cargo: 'AYUDANTE',
    estatus: 'ACTIVO',
    montoUsd: 60,
    observacion: 'Cuadrilla 1',
    asistencias: [true, true, true, true, true, true, true],
    diasAdicionales: 1,
  },
  {
    id: 'emp_3',
    cedula: '20145896',
    nombre: 'HERNÁNDEZ BLANCO LUIS ALBERTO',
    banco: 'BANCO MERCANTIL',
    cuenta: '01050789012345678901',
    cargo: 'MECÁNICO',
    estatus: 'ACTIVO',
    montoUsd: 85,
    observacion: 'Taller Central',
    asistencias: [true, true, true, true, true, false, false],
    diasAdicionales: 0,
  },
  {
    id: 'emp_4',
    cedula: '16325987',
    nombre: 'PÉREZ SILVA MARÍA ALEJANDRA',
    banco: 'BANCO DE VENEZUELA',
    cuenta: '01020987654321098765',
    cargo: 'ADMINISTRATIVO',
    estatus: 'ACTIVO',
    montoUsd: 75,
    observacion: 'Oficina Puerto Ordaz',
    asistencias: [true, true, true, true, true, true, true],
    diasAdicionales: 0,
  },
  {
    id: 'emp_5',
    cedula: '19852147',
    nombre: 'TORRES SÁNCHEZ MANUEL VICENTE',
    banco: 'BANCO PROVINCIAL',
    cuenta: '01080345678901234567',
    cargo: 'DESMALEZADOR',
    estatus: 'REPOSO',
    montoUsd: 65,
    observacion: 'Reposo Médico IVSS',
    asistencias: [false, false, false, false, false, false, false],
    diasAdicionales: 0,
  },
];

export const getNearestWednesday = (): string => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mié, 4: Jue, 5: Vie, 6: Sáb
  let diff = diaSemana - 3;
  if (diff < 0) diff += 7;
  const miercoles = new Date(hoy);
  miercoles.setDate(hoy.getDate() - diff);
  return miercoles.toISOString().split('T')[0];
};

export const DEFAULT_LOGO_URL = '/assets/aistudio/Imagen2_271ab6a1.jpg';

export const CONFIG_INICIAL: AppConfig = {
  tasaDolar: 976.84,
  tipoPeriodo: 'semanal',
  criterioOrden: 'original',
  nombreEmpresa: 'SUPRAGUAYANA, S.A.',
  rifEmpresa: 'J-40983210-9',
  fechaInicioSemana: getNearestWednesday(),
  fontSize: 'fs-base',
  theme: 'light',
  logoUrl: DEFAULT_LOGO_URL,
};

const STORAGE_KEY_EMPLEADOS = 'supraguayana_nomina_empleados';
const STORAGE_KEY_CARGOS = 'supraguayana_nomina_cargos';
const STORAGE_KEY_CONFIG = 'supraguayana_nomina_config';

export const loadEmpleados = (): Empleado[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_EMPLEADOS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading empleados from storage:', e);
  }
  return EMPLEADOS_INICIALES;
};

export const saveEmpleados = (empleados: Empleado[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_EMPLEADOS, JSON.stringify(empleados));
  } catch (e) {
    console.error('Error saving empleados to storage:', e);
  }
};

export const loadCargos = (): Cargo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CARGOS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading cargos from storage:', e);
  }
  return CARGOS_INICIALES;
};

export const saveCargos = (cargos: Cargo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CARGOS, JSON.stringify(cargos));
  } catch (e) {
    console.error('Error saving cargos to storage:', e);
  }
};

export const loadConfig = (): AppConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...CONFIG_INICIAL,
        ...parsed,
        logoUrl: parsed.logoUrl && parsed.logoUrl.trim() !== '' ? parsed.logoUrl : DEFAULT_LOGO_URL,
      };
    }
  } catch (e) {
    console.error('Error loading config from storage:', e);
  }
  return CONFIG_INICIAL;
};

export const saveConfig = (config: AppConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config to storage:', e);
  }
};
