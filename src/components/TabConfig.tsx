import React, { useRef, useState } from 'react';
import { 
  Type, 
  Sun, 
  Moon, 
  Building2, 
  FileJson, 
  Upload, 
  Download, 
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
  Trash2,
  Truck,
  Check,
  Link
} from 'lucide-react';
import { AppConfig, Empleado, Cargo } from '../types';
import { DEFAULT_LOGO_URL } from '../services/storage';

interface TabConfigProps {
  config: AppConfig;
  empleados: Empleado[];
  cargos: Cargo[];
  onConfigChange: (newConfig: Partial<AppConfig>) => void;
  onRestoreBackup: (empleados: Empleado[], cargos: Cargo[], config: AppConfig) => void;
  onResetSeedData: () => void;
}

export const TabConfig: React.FC<TabConfigProps> = ({
  config,
  empleados,
  cargos,
  onConfigChange,
  onRestoreBackup,
  onResetSeedData,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');

  const handleExportBackup = () => {
    const backupData = {
      version: '5.0',
      exportedAt: new Date().toISOString(),
      config,
      cargos,
      empleados,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Nomina_${config.nombreEmpresa.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.empleados && parsed.cargos && parsed.config) {
          onRestoreBackup(parsed.empleados, parsed.cargos, parsed.config);
        } else {
          alert('El archivo no contiene un formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al procesar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 2MB for localStorage friendliness)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 2MB. Por favor elija una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onConfigChange({ logoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onConfigChange({ logoUrl: urlInput.trim() });
    setUrlInput('');
  };

  const handleRestoreOfficialLogo = () => {
    onConfigChange({ logoUrl: DEFAULT_LOGO_URL });
  };

  const handleRemoveLogo = () => {
    onConfigChange({ logoUrl: '' });
  };

  const isOfficialLogo = config.logoUrl === DEFAULT_LOGO_URL;

  return (
    <section className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-6 border-b pb-3 dark:border-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Configuración del Sistema y Apariencia</span>
        </h2>

        {/* Section 1: Logo de la Empresa */}
        <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400 flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Logotipo Corporativo de la Empresa</span>
            </h3>
            
            <div className="flex items-center gap-2">
              {!isOfficialLogo && (
                <button
                  type="button"
                  onClick={handleRestoreOfficialLogo}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-bold flex items-center gap-1 transition bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Logo Oficial SUPRAGUAYANA</span>
                </button>
              )}
              {config.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 font-bold flex items-center gap-1 transition px-2 py-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Icono Genérico</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Logotipo oficial que aparece en la barra superior del sistema, en la cabecera de la nómina y en los comprobantes de pago individuales para imprimir.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Visual Logo Preview */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-800 p-2 flex items-center justify-center shadow-md overflow-hidden relative group">
                {config.logoUrl ? (
                  <img
                    src={config.logoUrl}
                    alt="Logo Empresa"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Truck className="w-10 h-10 mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold text-center">
                      Icono Estándar
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                {isOfficialLogo ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Logo Oficial Activo</span>
                  </>
                ) : config.logoUrl ? (
                  'Logo Personalizado'
                ) : (
                  'Icono Genérico'
                )}
              </span>
            </div>

            {/* Upload & URL Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span>Cambiar Imagen de Logo</span>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {!isOfficialLogo && (
                  <button
                    type="button"
                    onClick={handleRestoreOfficialLogo}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restablecer Logo Oficial</span>
                  </button>
                )}

                {config.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Quitar</span>
                  </button>
                )}
              </div>

              {/* Paste URL option */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  O ingresar enlace web (URL) del logo:
                </label>
                <div className="flex gap-2 max-w-lg">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                      <Link className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/logo.png"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Formatos compatibles: PNG, JPG, SVG o WebP. Se recomienda fondo transparente.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Display & Corporate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Display & Text Settings */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Tamaño de Texto y Visualización</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Tamaño de la Fuente Global
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'fs-sm', label: 'Pequeña' },
                  { key: 'fs-base', label: 'Normal' },
                  { key: 'fs-lg', label: 'Grande' },
                  { key: 'fs-xl', label: 'Muy Grande' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onConfigChange({ fontSize: item.key as any })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      config.fontSize === item.key
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Tema Visual
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => onConfigChange({ theme: 'light' })}
                  className={`flex items-center space-x-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${
                    config.theme === 'light'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Modo Claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => onConfigChange({ theme: 'dark' })}
                  className={`flex items-center space-x-2 px-3.5 py-2 border rounded-xl text-xs font-bold transition cursor-pointer ${
                    config.theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-white shadow-sm'
                      : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Modo Oscuro</span>
                </button>
              </div>
            </div>
          </div>

          {/* Corporate Parameters */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Parámetros Corporativos</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={config.nombreEmpresa}
                onChange={(e) => onConfigChange({ nombreEmpresa: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                RIF Fiscal
              </label>
              <input
                type="text"
                value={config.rifEmpresa}
                onChange={(e) => onConfigChange({ rifEmpresa: e.target.value })}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Moneda Secundaria de Conversión
              </label>
              <input
                type="text"
                value="Bolívares Digitales (Bs.S)"
                disabled
                className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Backup & Restore JSON Section */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
            <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Copia de Respaldo y Restauración de Datos</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Guarde una copia completa en archivo JSON con todos los trabajadores, salarios, logotipo y configuración, o restaure una copia previa.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-600 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Exportar Respaldo JSON</span>
            </button>

            <label className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-600 transition cursor-pointer">
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Restaurar Respaldo JSON</span>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetSeedData}
              className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Datos Iniciales Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
