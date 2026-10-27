export type EstatusLaboral = 'ACTIVO' | 'SUSPENDIDO' | 'REPOSO' | 'DE PERMISO';

export type TipoPeriodo = 'semanal' | 'quincenal';

export type CriterioOrden = 
  | 'original'
  | 'cedula-asc'
  | 'cedula-desc'
  | 'nombre-asc'
  | 'nombre-desc';

export interface Cargo {
  id: string;
  nombre: string;
  semanal: number;
  quincenal: number;
}

export interface Empleado {
  id: string;
  cedula: string;
  nombre: string;
  banco: string;
  cuenta: string;
  cargo: string;
  estatus: EstatusLaboral;
  montoUsd: number;
  observacion?: string;
  asistencias: boolean[]; // 7 days (Mié to Mar)
  diasAdicionales: number;
}

export interface AppConfig {
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  criterioOrden: CriterioOrden;
  nombreEmpresa: string;
  rifEmpresa: string;
  fechaInicioSemana: string; // YYYY-MM-DD (Wednesday)
  fontSize: 'fs-sm' | 'fs-base' | 'fs-lg' | 'fs-xl';
  theme: 'light' | 'dark';
  logoUrl?: string;
}
