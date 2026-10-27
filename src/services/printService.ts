import { Empleado, TipoPeriodo } from '../types';

interface PrintNominaOptions {
  empleados: Empleado[];
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  nombreEmpresa: string;
  rifEmpresa: string;
  logoUrl?: string;
  fechaInicioSemana?: string;
}

export const imprimirNominaCompleta = (options: PrintNominaOptions) => {
  const {
    empleados,
    tasaDolar,
    tipoPeriodo,
    nombreEmpresa,
    rifEmpresa,
    logoUrl,
  } = options;

  const formatUSD = (val: number) =>
    '$ ' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBs = (val: number) =>
    'Bs.S ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let totalUSD = 0;
  let totalBS = 0;
  let totalActivos = 0;

  const rowsHtml = empleados
    .map((emp, idx) => {
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

      const estatusColor =
        estatus === 'ACTIVO'
          ? '#166534'
          : estatus === 'SUSPENDIDO'
          ? '#991b1b'
          : estatus === 'REPOSO'
          ? '#92400e'
          : '#1e40af';

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px;">
          <td style="padding: 5px 6px; text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
          <td style="padding: 5px 6px; font-weight: 600; color: #1e293b;">${emp.banco}</td>
          <td style="padding: 5px 6px; font-family: monospace; color: #334155;">${emp.cuenta}</td>
          <td style="padding: 5px 6px; font-weight: 700; color: #0f172a;">${emp.cedula}</td>
          <td style="padding: 5px 6px; font-weight: 700; color: #0f172a;">${emp.nombre}</td>
          <td style="padding: 5px 6px; color: #334155;">${emp.cargo}</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 700; color: ${estatusColor};">${estatus}</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 600;">
            ${diasTrabajados}${diasAdicionales > 0 ? ` + ${diasAdicionales}` : ''}/7 d
          </td>
          <td style="padding: 5px 6px; text-align: right; font-weight: 700; color: #15803d;">${formatUSD(montoUsd)}</td>
          <td style="padding: 5px 6px; text-align: right; font-weight: 700; color: #0f172a;">${formatBs(montoBs)}</td>
          <td style="padding: 5px 6px; font-size: 9px; color: #64748b; font-style: italic;">${emp.observacion || '-'}</td>
        </tr>
      `;
    })
    .join('');

  const fechaHoy = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const printHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Relación de Nómina - ${nombreEmpresa}</title>
      <style>
        @page {
          size: letter landscape;
          margin: 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          margin: 0;
          padding: 10px;
          color: #0f172a;
          background: #ffffff;
          font-size: 10px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #0d47a1;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .header-logo {
          max-height: 55px;
          max-width: 140px;
          object-fit: contain;
        }
        .header-titles {
          text-align: center;
          flex: 1;
        }
        .header-titles h1 {
          font-size: 16px;
          font-weight: 900;
          margin: 0;
          color: #092c63;
          letter-spacing: 0.5px;
        }
        .header-titles h2 {
          font-size: 11px;
          font-weight: 700;
          margin: 3px 0 0 0;
          color: #1e293b;
          text-transform: uppercase;
        }
        .header-meta {
          text-align: right;
          font-size: 9px;
          color: #475569;
        }
        .summary-box {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          margin-bottom: 12px;
          font-size: 10px;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
        }
        .summary-label {
          font-size: 9px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
        }
        .summary-val {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        thead {
          display: table-header-group;
        }
        th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: 700;
          font-size: 9px;
          text-transform: uppercase;
          padding: 6px;
          border-top: 1px solid #cbd5e1;
          border-bottom: 2px solid #cbd5e1;
          letter-spacing: 0.5px;
        }
        tr {
          page-break-inside: avoid;
        }
        .totals-row td {
          background-color: #f8fafc;
          font-weight: 900;
          padding: 8px 6px;
          border-top: 2px solid #0d47a1;
          border-bottom: 2px solid #0d47a1;
          font-size: 11px;
        }
        .signatures {
          margin-top: 30px;
          display: flex;
          justify-content: space-around;
          text-align: center;
          page-break-inside: avoid;
        }
        .sign-line {
          width: 180px;
          border-top: 1px solid #475569;
          padding-top: 4px;
          font-size: 9px;
          font-weight: 700;
          color: #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" class="header-logo" alt="${nombreEmpresa}">` : ''}
        </div>
        <div class="header-titles">
          <h1>${nombreEmpresa}</h1>
          <h2>RELACIÓN GENERAL DE NÓMINA — MODALIDAD: ${tipoPeriodo.toUpperCase()}</h2>
          <div style="font-size: 9px; color: #475569; margin-top: 2px;">
            RIF: ${rifEmpresa} • ESTADO BOLÍVAR, VENEZUELA
          </div>
        </div>
        <div class="header-meta">
          <div><strong>Fecha Emisión:</strong> ${fechaHoy}</div>
          <div><strong>Tasa Oficial BCV:</strong> Bs. ${tasaDolar.toFixed(2)}</div>
          <div><strong>Total Trabajadores:</strong> ${empleados.length}</div>
        </div>
      </div>

      <div class="summary-box">
        <div class="summary-item">
          <span class="summary-label">Personal Activo</span>
          <span class="summary-val">${totalActivos} de ${empleados.length}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Modalidad de Pago</span>
          <span class="summary-val" style="text-transform: capitalize;">${tipoPeriodo}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Monto Total Nómina ($)</span>
          <span class="summary-val" style="color: #15803d;">${formatUSD(totalUSD)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Monto Total Nómina (Bs.S)</span>
          <span class="summary-val" style="color: #0d47a1;">${formatBs(totalBS)}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 25px;">#</th>
            <th style="text-align: left; width: 120px;">Banco</th>
            <th style="text-align: left; width: 140px;">N° Cuenta</th>
            <th style="text-align: left; width: 75px;">Cédula</th>
            <th style="text-align: left;">Nombre y Apellido</th>
            <th style="text-align: left; width: 100px;">Cargo</th>
            <th style="text-align: center; width: 75px;">Estatus</th>
            <th style="text-align: center; width: 70px;">Asistencia</th>
            <th style="text-align: right; width: 85px;">Monto ($)</th>
            <th style="text-align: right; width: 110px;">Monto (Bs.S)</th>
            <th style="text-align: left; width: 110px;">Observación</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="totals-row">
            <td colspan="7" style="text-align: right; padding-right: 12px; color: #0f172a;">TOTALES GENERALES DE NÓMINA:</td>
            <td style="text-align: center; color: #0f172a;">${empleados.length} trab.</td>
            <td style="text-align: right; color: #15803d;">${formatUSD(totalUSD)}</td>
            <td style="text-align: right; color: #0d47a1;">${formatBs(totalBS)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="signatures">
        <div>
          <div class="sign-line">Elaborado por (Nómina / RRHH)</div>
        </div>
        <div>
          <div class="sign-line">Revisado por (Administración)</div>
        </div>
        <div>
          <div class="sign-line">Aprobado por (Gerencia General)</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Method 1: Create an invisible iframe to isolate print styling and avoid parent page UI
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Impresión de Nómina');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  } else {
    window.print();
  }
};

interface PrintReciboOptions {
  empleado: Empleado;
  tasaDolar: number;
  tipoPeriodo: TipoPeriodo;
  nombreEmpresa: string;
  rifEmpresa: string;
  logoUrl?: string;
}

export const imprimirReciboIndividual = (options: PrintReciboOptions) => {
  const {
    empleado,
    tasaDolar,
    tipoPeriodo,
    nombreEmpresa,
    rifEmpresa,
    logoUrl,
  } = options;

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

  const fechaHoy = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const printHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Comprobante de Pago - ${empleado.nombre}</title>
      <style>
        @page {
          size: letter portrait;
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #0f172a;
          background: #ffffff;
        }
        .voucher-card {
          border: 2px solid #0d47a1;
          border-radius: 12px;
          padding: 25px;
          max-width: 650px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .logo {
          max-height: 60px;
          max-width: 150px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        h1 {
          font-size: 18px;
          margin: 0;
          color: #0d47a1;
          font-weight: 900;
        }
        .subtitle {
          font-size: 11px;
          color: #475569;
          font-weight: 700;
          margin-top: 3px;
        }
        .badge {
          display: inline-block;
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          padding: 3px 12px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          font-size: 11px;
          margin-bottom: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-size: 9px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }
        .val {
          font-weight: 800;
          color: #0f172a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 15px;
        }
        th {
          background: #f1f5f9;
          padding: 8px;
          text-align: left;
          font-size: 10px;
          text-transform: uppercase;
          border-top: 1px solid #cbd5e1;
          border-bottom: 2px solid #cbd5e1;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .totals-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .total-usd {
          font-size: 14px;
          font-weight: 800;
          color: #166534;
        }
        .total-bs {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          text-align: center;
          padding-top: 20px;
        }
        .sign-line {
          border-top: 1px solid #64748b;
          padding-top: 6px;
          font-size: 10px;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="voucher-card">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${nombreEmpresa}">` : ''}
          <h1>${nombreEmpresa}</h1>
          <div class="subtitle">RIF: ${rifEmpresa} | ESTADO BOLÍVAR, VENEZUELA</div>
          <div class="badge">Comprobante de Pago de Nómina (${tipoPeriodo})</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Trabajador</span>
            <span class="val">${empleado.nombre}</span>
          </div>
          <div class="info-item">
            <span class="label">Cédula de Identidad</span>
            <span class="val">V- ${empleado.cedula}</span>
          </div>
          <div class="info-item">
            <span class="label">Cargo / Función</span>
            <span class="val">${empleado.cargo}</span>
          </div>
          <div class="info-item">
            <span class="label">Estatus</span>
            <span class="val" style="color: #166534;">${empleado.estatus}</span>
          </div>
          <div class="info-item" style="grid-column: span 2; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span class="label">Banco y N° Cuenta</span>
            <span class="val" style="font-family: monospace;">${empleado.banco} — ${empleado.cuenta}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th style="text-align: center;">Unidad / Cant.</th>
              <th style="text-align: right;">Monto ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sueldo Base (${tipoPeriodo})</td>
              <td style="text-align: center; color: #64748b;">7 días est.</td>
              <td style="text-align: right; font-weight: 700;">${formatUSD(baseUsd)}</td>
            </tr>
            <tr>
              <td>Días Asistidos</td>
              <td style="text-align: center; font-weight: 700; color: #166534;">${diasAsistidos} días</td>
              <td style="text-align: right; font-weight: 600;">${formatUSD((baseUsd / 7) * diasAsistidos)}</td>
            </tr>
            ${
              diasAdic > 0
                ? `
            <tr>
              <td>Días Adicionales / Guardias</td>
              <td style="text-align: center; font-weight: 700; color: #b45309;">${diasAdic} días</td>
              <td style="text-align: right; font-weight: 600;">${formatUSD((baseUsd / 7) * diasAdic)}</td>
            </tr>
            `
                : ''
            }
            ${
              empleado.observacion
                ? `
            <tr>
              <td colspan="3" style="font-size: 10px; color: #64748b; font-style: italic; background: #f8fafc;">
                Nota / Observación: ${empleado.observacion}
              </td>
            </tr>
            `
                : ''
            }
          </tbody>
        </table>

        <div class="totals-box">
          <div>
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #166534;">Tasa Oficial BCV</div>
            <div style="font-size: 11px; font-weight: 800; color: #14532d;">1 USD = Bs. ${tasaDolar.toFixed(2)}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Fecha: ${fechaHoy}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b;">Total a Transferir</div>
            <div class="total-usd">${formatUSD(montoUsd)}</div>
            <div class="total-bs">${formatBs(montoBs)}</div>
          </div>
        </div>

        <div class="signatures">
          <div>
            <div class="sign-line">Por SUPRAGUAYANA, S.A.<br><span style="font-weight: 400; font-size: 9px; color: #64748b;">Recursos Humanos / Administración</span></div>
          </div>
          <div>
            <div class="sign-line">Recibido Conforme<br><span style="font-weight: 400; font-size: 9px; color: #64748b;">Firma del Trabajador (C.I. ${empleado.cedula})</span></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('title', 'Impresión de Recibo');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(printHtml);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  } else {
    window.print();
  }
};

