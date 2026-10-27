import React from 'react';
import { 
  TableProperties, 
  CalendarCheck2, 
  Briefcase, 
  Settings, 
  Truck, 
  Sparkles,
  Wifi
} from 'lucide-react';

export type TabKey = 'nomina' | 'asistencias' | 'cargos' | 'config';

interface HeaderProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  nombreEmpresa: string;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, nombreEmpresa, logoUrl }) => {
  return (
    <header className="bg-gradient-to-r from-[#092c63] via-[#0d47a1] to-[#092c63] text-white shadow-lg border-b border-blue-950 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nombreEmpresa}
                className="w-11 h-11 object-contain rounded-xl bg-white p-0.5 shadow-md border border-white/40 flex-shrink-0"
              />
            ) : (
              <div className="bg-white p-2 rounded-xl text-blue-900 font-bold text-xl flex items-center justify-center w-11 h-11 shadow-md flex-shrink-0">
                <Truck className="w-5 h-5 text-blue-700" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-wider text-white drop-shadow-sm">
                  {nombreEmpresa}
                </h1>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-200 border border-blue-400/30">
                  Nómina v5.0
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium">
                Sistema Multidispositivo de Nóminas en la Nube
              </p>
            </div>
          </div>

          {/* Sync status & Desktop navigation tabs */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="hidden lg:flex items-center space-x-2 bg-blue-950/80 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-400/30 text-blue-100 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>En Línea & Sincronizado</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1.5">
              <button
                onClick={() => onTabChange('nomina')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                  currentTab === 'nomina'
                    ? 'bg-blue-600/90 text-white shadow-md ring-1 ring-blue-300/40 backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <TableProperties className="w-4 h-4 text-blue-200" />
                <span>Nómina General</span>
              </button>

              <button
                onClick={() => onTabChange('asistencias')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                  currentTab === 'asistencias'
                    ? 'bg-blue-600/90 text-white shadow-md ring-1 ring-blue-300/40 backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4 text-blue-200" />
                <span>Control Asistencia</span>
              </button>

              <button
                onClick={() => onTabChange('cargos')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                  currentTab === 'cargos'
                    ? 'bg-blue-600/90 text-white shadow-md ring-1 ring-blue-300/40 backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4 text-blue-200" />
                <span>Tabulador Cargos</span>
              </button>

              <button
                onClick={() => onTabChange('config')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition cursor-pointer ${
                  currentTab === 'config'
                    ? 'bg-blue-600/90 text-white shadow-md ring-1 ring-blue-300/40 backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-blue-200" />
                <span>Configuración</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tab Bar */}
      <div className="md:hidden flex border-t border-blue-950 bg-[#072450] divide-x divide-blue-900/60">
        <button
          onClick={() => onTabChange('nomina')}
          className={`flex-1 py-2 text-center text-[11px] font-medium flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'nomina' ? 'bg-blue-600 text-white font-bold' : 'text-blue-200 hover:bg-blue-900/60'
          }`}
        >
          <TableProperties className="w-4 h-4 mb-0.5" />
          <span>Nómina</span>
        </button>
        <button
          onClick={() => onTabChange('asistencias')}
          className={`flex-1 py-2 text-center text-[11px] font-medium flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'asistencias' ? 'bg-blue-600 text-white font-bold' : 'text-blue-200 hover:bg-blue-900/60'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4 mb-0.5" />
          <span>Asistencia</span>
        </button>
        <button
          onClick={() => onTabChange('cargos')}
          className={`flex-1 py-2 text-center text-[11px] font-medium flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'cargos' ? 'bg-blue-600 text-white font-bold' : 'text-blue-200 hover:bg-blue-900/60'
          }`}
        >
          <Briefcase className="w-4 h-4 mb-0.5" />
          <span>Cargos</span>
        </button>
        <button
          onClick={() => onTabChange('config')}
          className={`flex-1 py-2 text-center text-[11px] font-medium flex flex-col items-center justify-center transition cursor-pointer ${
            currentTab === 'config' ? 'bg-blue-600 text-white font-bold' : 'text-blue-200 hover:bg-blue-900/60'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Ajustes</span>
        </button>
      </div>
    </header>
  );
};
