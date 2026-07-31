import React from 'react';
import {
  Upload,
  RotateCcw,
  Download,
  Plus,
  Filter,
  BarChart2,
  Table,
  Clock,
} from 'lucide-react';
import { MetarhLogo } from './MetarhLogo';

interface HeaderProps {
  filename: string;
  totalRows: number;
  filteredRows: number;
  activeView: 'dashboard' | 'contracts' | 'table';
  onChangeView: (view: 'dashboard' | 'contracts' | 'table') => void;
  onOpenUploader: () => void;
  onResetDefault: () => void;
  onExportCsv: () => void;
  onExportJson?: () => void;
  onAddRow?: () => void;
  onOpenColumnConfig: () => void;
  visibleColumnCount: number;
  totalColumnCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  filename,
  totalRows,
  filteredRows,
  activeView,
  onChangeView,
  onOpenUploader,
  onResetDefault,
  onExportCsv,
  onAddRow,
  onOpenColumnConfig,
}) => {
  return (
    <header className="bg-[#470082] text-white sticky top-0 z-30 shadow-md border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Logo & Title & View Switcher */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="flex items-center shrink-0 py-0.5">
                <MetarhLogo className="h-9 sm:h-10 w-auto text-white" />
              </div>
              <div className="border-l border-purple-400/30 pl-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-barlow">
                    Quadro de Análise
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c9f545] text-purple-950 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-900 mr-1.5"></span>
                    {filename}
                  </span>
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="bg-purple-950/50 p-1 rounded-lg flex items-center gap-1 text-xs font-semibold border border-purple-400/20 ml-auto lg:ml-2">
              <button
                onClick={() => onChangeView('dashboard')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-white text-[#470082] font-extrabold shadow-xs'
                    : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#aa3ffe]" />
                <span>Painel CS</span>
              </button>
              <button
                onClick={() => onChangeView('contracts')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'contracts'
                    ? 'bg-white text-[#470082] font-extrabold shadow-xs'
                    : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#c9f545]" />
                <span>Gestão de Contratos</span>
              </button>
              <button
                onClick={() => onChangeView('table')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-white text-[#470082] font-extrabold shadow-xs'
                    : 'text-purple-200 hover:text-white hover:bg-purple-800/40'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-purple-300" />
                <span>Lista Operacional ({filteredRows})</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Subir Novo Cliente */}
            <button
              onClick={onOpenUploader}
              className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-bold rounded-md bg-[#c9f545] hover:bg-[#b8e634] text-purple-950 transition-colors duration-150 shadow-xs cursor-pointer"
              title="Carregar ou colar CSV de outro cliente"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              <span>Subir Novo Cliente</span>
            </button>

            {activeView === 'table' && (
              <>
                {/* Column config */}
                <button
                  onClick={onOpenColumnConfig}
                  className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-md bg-purple-800/60 hover:bg-purple-800 text-white border border-purple-400/30 transition-colors duration-150 cursor-pointer"
                  title="Configurar visibilidade de colunas"
                >
                  <Filter className="w-4 h-4 mr-1.5 text-purple-300" />
                  <span>Colunas</span>
                </button>
              </>
            )}

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              className="inline-flex items-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-md bg-purple-800/60 hover:bg-purple-800 text-white border border-purple-400/30 transition-colors duration-150 cursor-pointer"
              title="Exportar dados filtrados para CSV"
            >
              <Download className="w-4 h-4 mr-1.5 text-[#c9f545]" />
              <span>Exportar CSV</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetDefault}
              className="inline-flex items-center px-2.5 py-2 text-xs sm:text-sm font-medium rounded-md bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-400/20 transition-colors duration-150 cursor-pointer"
              title="Trocar de cliente ou redefinir"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
