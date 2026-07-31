import React from 'react';
import { Columns, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';
import { SearchableSelect, SelectOption } from './SearchableSelect';

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

const MONTH_OPTIONS: SelectOption[] = [
  { value: '01', label: '01 - Janeiro' },
  { value: '02', label: '02 - Fevereiro' },
  { value: '03', label: '03 - Março' },
  { value: '04', label: '04 - Abril' },
  { value: '05', label: '05 - Maio' },
  { value: '06', label: '06 - Junho' },
  { value: '07', label: '07 - Julho' },
  { value: '08', label: '08 - Agosto' },
  { value: '09', label: '09 - Setembro' },
  { value: '10', label: '10 - Outubro' },
  { value: '11', label: '11 - Novembro' },
  { value: '12', label: '12 - Dezembro' },
];

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
    filterState.statusFilter !== 'todos' ||
    Boolean(filterState.vinculoFilter) ||
    Boolean(filterState.cargoFilter) ||
    Boolean(filterState.regiaoFilter) ||
    Boolean(filterState.motivoFilter) ||
    Boolean(filterState.clienteFilter) ||
    Boolean(filterState.rhFocalFilter) ||
    Boolean(filterState.anoFilter) ||
    Boolean(filterState.mesFilter) ||
    Object.keys(filterState.columnFilters).some((k) => filterState.columnFilters[k]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-xs space-y-3">
      {/* Horizontal Pill Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* 1. Status Segmented Pill: Todos | Ativos | Desligados */}
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

        {/* 2. Vínculo Select */}
        <SearchableSelect
          label="Vínculo"
          value={filterState.vinculoFilter}
          options={uniqueVinculos}
          onChange={(val) => onFilterChange({ vinculoFilter: val })}
        />

        {/* 3. Cliente (Grupo Econômico) Select */}
        <SearchableSelect
          label="Cliente"
          value={filterState.clienteFilter}
          options={uniqueClientes}
          onChange={(val) => onFilterChange({ clienteFilter: val })}
        />

        {/* 4. Região Select */}
        <SearchableSelect
          label="Região"
          value={filterState.regiaoFilter}
          options={uniqueRegioes}
          onChange={(val) => onFilterChange({ regiaoFilter: val })}
        />

        {/* 5. RH Focal Select */}
        <SearchableSelect
          label="RH Focal"
          value={filterState.rhFocalFilter}
          options={uniqueRhFocais}
          onChange={(val) => onFilterChange({ rhFocalFilter: val })}
        />

        {/* 6. Ano Select */}
        <SearchableSelect
          label="Ano"
          value={filterState.anoFilter}
          options={uniqueAnos}
          onChange={(val) => onFilterChange({ anoFilter: val })}
        />

        {/* 7. Mês Select */}
        <SearchableSelect
          label="Mês"
          value={filterState.mesFilter || ''}
          options={MONTH_OPTIONS}
          onChange={(val) => onFilterChange({ mesFilter: val })}
        />

        {/* 8. Cargo Select */}
        {uniqueCargos.length > 0 && (
          <SearchableSelect
            label="Cargo"
            value={filterState.cargoFilter}
            options={uniqueCargos}
            onChange={(val) => onFilterChange({ cargoFilter: val })}
          />
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
