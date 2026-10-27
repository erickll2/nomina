import * as XLSX from 'xlsx';
import { Empleado, Cargo, TipoPeriodo } from '../types';

export const descargarPlantillaExcel = (): void => {
  const dataPlantilla = [
    {
      "BANCO": "BANCO DE VENEZUELA",
      "N° CUENTA": "01020000000000000000",
      "CÉDULA": "12345678",
      "NOMBRE Y APELLIDO": "PÉREZ PÉREZ JUAN CARLOS",
      "CARGO": "CHOFER",
      "MONTO $": 85.00,
      "OBSERVACIÓN": "PERSONAL OPERATIVO"
    },
    {
      "BANCO": "BANCO BANESCO",
      "N° CUENTA": "01340000000000000000",
      "CÉDULA": "87654321",
      "NOMBRE Y APELLIDO": "GÓMEZ MARÍA FERNANDA",
      "CARGO": "AYUDANTE",
      "MONTO $": 60.00,
      "OBSERVACIÓN": "TURNO MAÑANA"
    },
    {
      "BANCO": "BANCO MERCANTIL",
      "N° CUENTA": "01050000000000000000",
      "CÉDULA": "15482390",
      "NOMBRE Y APELLIDO": "RODRÍGUEZ SILVA ANDRÉS",
      "CARGO": "MECÁNICO",
      "MONTO $": 85.00,
      "OBSERVACIÓN": "TALLER CENTRAL"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(dataPlantilla);
  ws['!cols'] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
    { wch: 32 },
    { wch: 20 },
    { wch: 14 },
    { wch: 28 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Nomina");
  XLSX.writeFile(wb, "Plantilla_Nomina_SUPRAGUAYANA.xlsx");
};

export const exportarNominaExcel = (
  empleados: Empleado[],
  tasaDolar: number,
  tipoPeriodo: TipoPeriodo,
  nombreEmpresa: string = 'SUPRAGUAYANA, S.A.'
): void => {
  const rows = empleados.map((emp, idx) => {
    const estatus = emp.estatus || 'ACTIVO';
    const baseUsd = emp.montoUsd || 0;
    const diasAsistidos = estatus === 'ACTIVO' ? emp.asistencias.filter(Boolean).length : 0;
    const diasAdic = estatus === 'ACTIVO' ? emp.diasAdicionales || 0 : 0;
    const totalDias = diasAsistidos + diasAdic;
    const montoUsd = estatus === 'ACTIVO' ? (baseUsd / 7) * totalDias : 0;
    const montoBs = montoUsd * tasaDolar;

    return {
      "#": idx + 1,
      "BANCO": emp.banco,
      "N° CUENTA": emp.cuenta,
      "CÉDULA": emp.cedula,
      "NOMBRE Y APELLIDO": emp.nombre,
      "CARGO": emp.cargo,
      "ESTATUS": estatus,
      "DÍAS ASISTIDOS": diasAsistidos,
      "DÍAS ADICIONALES": diasAdic,
      "TOTAL DÍAS PAGADOS": totalDias,
      "SUELDO BASE ($)": baseUsd,
      "MONTO A PAGAR ($)": parseFloat(montoUsd.toFixed(2)),
      "TASA BCV": tasaDolar,
      "MONTO A PAGAR (Bs.S)": parseFloat(montoBs.toFixed(2)),
      "OBSERVACIÓN": emp.observacion || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 24 },
    { wch: 14 },
    { wch: 32 },
    { wch: 18 },
    { wch: 14 },
    { wch: 15 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 22 },
    { wch: 26 },
  ];

  const wb = XLSX.utils.book_new();
  const fechaStr = new Date().toISOString().split('T')[0];
  XLSX.utils.book_append_sheet(wb, ws, `Nomina_${tipoPeriodo.toUpperCase()}`);
  XLSX.writeFile(wb, `Nomina_${nombreEmpresa.replace(/\s+/g, '_')}_${fechaStr}.xlsx`);
};

export const parseExcelFile = async (
  file: File,
  cargosDisponibles: Cargo[],
  tipoPeriodo: TipoPeriodo
): Promise<Empleado[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (!rows || rows.length === 0) {
    throw new Error('El archivo Excel está vacío.');
  }

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const rowStr = rows[i].map(String).join(' ').toUpperCase();
    if (
      rowStr.includes('CEDULA') ||
      rowStr.includes('CÉDULA') ||
      rowStr.includes('NOMBRE') ||
      rowStr.includes('CARGO') ||
      rowStr.includes('MONTO')
    ) {
      headerRowIndex = i;
      break;
    }
  }

  const empleadosProcesados: Empleado[] = [];

  if (headerRowIndex !== -1) {
    const headers = rows[headerRowIndex].map((h) => String(h).toUpperCase().trim());

    const colIdx = {
      banco: headers.findIndex((h) => h.includes('BANCO')),
      cuenta: headers.findIndex((h) => h.includes('CUENTA') || h.includes('Nº') || h.includes('N°')),
      cedula: headers.findIndex((h) => h.includes('CEDULA') || h.includes('CÉDULA') || h.includes('CI') || h.includes('C.I.')),
      nombre: headers.findIndex((h) => h.includes('NOMBRE') || h.includes('APELLIDO') || h.includes('TRABAJADOR') || h.includes('EMPLEADO')),
      cargo: headers.findIndex((h) => h.includes('CARGO') || h.includes('PUESTO') || h.includes('FUNCION')),
      monto: headers.findIndex((h) => h.includes('MONTO') || h.includes('SALARIO') || h.includes('SUELDO') || h.includes('DOLAR') || h.includes('$') || h.includes('USD')),
      observacion: headers.findIndex((h) => h.includes('OBSERV') || h.includes('NOTA') || h.includes('CONCEPTO')),
    };

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;

      const nombre = colIdx.nombre !== -1 ? String(r[colIdx.nombre] || '').trim().toUpperCase() : '';
      const cedula = colIdx.cedula !== -1 ? String(r[colIdx.cedula] || '').trim() : '';

      if (!nombre && !cedula) continue;

      let montoUsd = 0;
      if (colIdx.monto !== -1 && r[colIdx.monto] !== undefined && r[colIdx.monto] !== '') {
        const valStr = String(r[colIdx.monto]).replace('$', '').replace(',', '.').trim();
        montoUsd = parseFloat(valStr) || 0;
      }

      const cargo = colIdx.cargo !== -1 && r[colIdx.cargo] ? String(r[colIdx.cargo]).trim().toUpperCase() : 'AYUDANTE';

      if (montoUsd === 0) {
        const cargoObj = cargosDisponibles.find((c) => c.nombre === cargo);
        if (cargoObj) {
          montoUsd = tipoPeriodo === 'semanal' ? cargoObj.semanal : cargoObj.quincenal;
        } else {
          montoUsd = 60;
        }
      }

      empleadosProcesados.push({
        id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        banco: colIdx.banco !== -1 && r[colIdx.banco] ? String(r[colIdx.banco]).trim().toUpperCase() : 'BANCO DE VENEZUELA',
        cuenta: colIdx.cuenta !== -1 && r[colIdx.cuenta] ? String(r[colIdx.cuenta]).trim() : '00000000000000000000',
        cedula: cedula || 'S/C',
        nombre: nombre || 'TRABAJADOR SIN NOMBRE',
        cargo: cargo,
        estatus: 'ACTIVO',
        montoUsd: montoUsd,
        observacion: colIdx.observacion !== -1 && r[colIdx.observacion] ? String(r[colIdx.observacion]).trim() : 'CARGA MASIVA EXCEL',
        asistencias: [true, true, true, true, true, true, true],
        diasAdicionales: 0,
      });
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 2) continue;

      const nombre = String(r[3] || r[2] || r[1] || '').trim().toUpperCase();
      if (!nombre) continue;

      empleadosProcesados.push({
        id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        banco: String(r[0] || 'BANCO DE VENEZUELA').trim().toUpperCase(),
        cuenta: String(r[1] || '00000000000000000000').trim(),
        cedula: String(r[2] || 'S/C').trim(),
        nombre: nombre,
        cargo: String(r[4] || 'AYUDANTE').trim().toUpperCase(),
        estatus: 'ACTIVO',
        montoUsd: parseFloat(r[5]) || 60,
        observacion: String(r[6] || 'CARGA MASIVA EXCEL').trim(),
        asistencias: [true, true, true, true, true, true, true],
        diasAdicionales: 0,
      });
    }
  }

  if (empleadosProcesados.length === 0) {
    throw new Error('No se encontraron registros válidos de trabajadores en el archivo Excel.');
  }

  return empleadosProcesados;
};
