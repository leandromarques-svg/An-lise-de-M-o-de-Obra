import React from 'react';
import { Search, X, Columns, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filterState: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  uniqueVinculos?: string[];
  uniqueCargos?: string[];
  uniqueRegioes?: string[];
  uniqueMotivos?: string[];
  uniqueClientes?: string[];
  uniqueRhFocais?: string[];
  uniqueAnos?: string[];
  rowsPerPage?: number;
  onRowsPerPageChange?: (value: number) => void;
  onOpenColumnConfig?: () => void;
  showTableOptions?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterState,
  onFilterChange,
  onResetFilters,
  uniqueVinculos = [],
  uniqueCargos = [],
  uniqueRegioes = [],
  uniqueMotivos = [],
  uniqueClientes = [],
  uniqueRhFocais = [],
  uniqueAnos = [],
  rowsPerPage = 25,
  onRowsPerPageChange,
  onOpenColumnConfig,
  showTableOptions = false,
}) => {
  const hasActiveFilters =
    Boolean(filterState.globalSearch) ||
    filterState.statusFilter !== 'todos' ||
    Boolean(filterState.vinculoFilter) ||
    Boolean(filterState.cargoFilter) ||
    Boolean(filterState.regiaoFilter) ||
    Boolean(filterState.motivoFilter) ||
    Boolean(filterState.clienteFilter) ||
    Boolean(filterState.rhFocalFilter) ||
    Boolean(filterState.anoFilter) ||
    Object.keys(filterState.columnFilters).some((k) => filterState.columnFilters[k]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-xs space-y-3">
      {/* Horizontal Pill Filter Row (Matching User Image) */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* 1. Global Search Pill */}
        <div className="relative min-w-[200px] sm:min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterState.globalSearch}
            onChange={(e) => onFilterChange({ globalSearch: e.target.value })}
            placeholder="Buscar por nome, cargo, ID, e-mail..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] focus:bg-white transition-all"
          />
          {filterState.globalSearch && (
            <button
              onClick={() => onFilterChange({ globalSearch: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 2. Status Segmented Pill: Todos | Ativos | Desligados */}
        <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => onFilterChange({ statusFilter: 'todos' })}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filterState.statusFilter === 'todos'
                ? 'bg-white text-[#470082] font-extrabold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ statusFilter: 'ativos' })}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filterState.statusFilter === 'ativos'
                ? 'bg-emerald-600 text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ statusFilter: 'desligados' })}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
              filterState.statusFilter === 'desligados'
                ? 'bg-slate-700 text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Desligados
          </button>
        </div>

        {/* 3. Vínculo Select */}
        <div className="shrink-0">
          <select
            value={filterState.vinculoFilter}
            onChange={(e) => onFilterChange({ vinculoFilter: e.target.value })}
            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
          >
            <option value="">Vínculo: Todos</option>
            {uniqueVinculos.map((v) => (
              <option key={v} value={v}>
                Vínculo: {v}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Cliente (Grupo Econômico) Select */}
        <div className="shrink-0">
          <select
            value={filterState.clienteFilter}
            onChange={(e) => onFilterChange({ clienteFilter: e.target.value })}
            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
          >
            <option value="">Cliente / Grupo Econômico: Todos</option>
            {uniqueClientes.map((c) => (
              <option key={c} value={c}>
                Cliente: {c}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Região Select */}
        <div className="shrink-0">
          <select
            value={filterState.regiaoFilter}
            onChange={(e) => onFilterChange({ regiaoFilter: e.target.value })}
            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
          >
            <option value="">Região: Todas</option>
            {uniqueRegioes.map((r) => (
              <option key={r} value={r}>
                Região: {r}
              </option>
            ))}
          </select>
        </div>

        {/* 6. RH Focal Select */}
        <div className="shrink-0">
          <select
            value={filterState.rhFocalFilter}
            onChange={(e) => onFilterChange({ rhFocalFilter: e.target.value })}
            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
          >
            <option value="">RH Focal: Todos</option>
            {uniqueRhFocais.map((rh) => (
              <option key={rh} value={rh}>
                RH Focal: {rh}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Ano Select */}
        <div className="shrink-0">
          <select
            value={filterState.anoFilter}
            onChange={(e) => onFilterChange({ anoFilter: e.target.value })}
            className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
          >
            <option value="">Ano: Todos</option>
            {uniqueAnos.map((y) => (
              <option key={y} value={y}>
                Ano: {y}
              </option>
            ))}
          </select>
        </div>

        {/* Optional Extra Filters: Cargo if needed */}
        {uniqueCargos.length > 0 && (
          <div className="shrink-0">
            <select
              value={filterState.cargoFilter}
              onChange={(e) => onFilterChange({ cargoFilter: e.target.value })}
              className="bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] cursor-pointer"
            >
              <option value="">Cargo: Todos</option>
              {uniqueCargos.map((cg) => (
                <option key={cg} value={cg}>
                  Cargo: {cg}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset / Table Controls */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#470082] hover:bg-purple-50 px-3 py-2 rounded-2xl transition-colors cursor-pointer shrink-0 ml-auto"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Filtros</span>
          </button>
        )}

        {/* Extra controls for Table view */}
        {showTableOptions && (
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {onRowsPerPageChange && (
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 py-1.5 px-3"
              >
                <option value={10}>10 por pág</option>
                <option value={25}>25 por pág</option>
                <option value={50}>50 por pág</option>
                <option value={100}>100 por pág</option>
                <option value={999999}>Ver Todas</option>
              </select>
            )}

            {onOpenColumnConfig && (
              <button
                onClick={onOpenColumnConfig}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>Colunas</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

