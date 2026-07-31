import React, { useState, useMemo } from 'react';
import { Search, CheckSquare, Square, Filter, Building2, Check, X, ArrowRight } from 'lucide-react';
import { CsvRow } from '../types';

export interface GroupOption {
  name: string;
  count: number;
}

interface GrupoEconomicoSelectorProps {
  rows: CsvRow[];
  selectedGroups: string[];
  onChangeSelectedGroups: (groups: string[]) => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  showConfirmButton?: boolean;
}

export function extractEconomicGroups(rows: CsvRow[]): GroupOption[] {
  const map: Record<string, number> = {};
  rows.forEach((row) => {
    const val =
      row['Grupo Econômico'] ||
      row['Grupo Economico'] ||
      row['Grupo Econômico '] ||
      row['Grupo Economico '] ||
      row['Nome Cliente'] ||
      row['Cliente'] ||
      'Cliente Único';
    const clean = val.trim();
    if (clean) {
      map[clean] = (map[clean] || 0) + 1;
    }
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export const GrupoEconomicoSelector: React.FC<GrupoEconomicoSelectorProps> = ({
  rows,
  selectedGroups,
  onChangeSelectedGroups,
  onConfirm,
  confirmLabel = 'Carregar Dashboard do CS',
  showConfirmButton = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique economic groups from the dataset
  const allGroups = useMemo(() => extractEconomicGroups(rows), [rows]);

  // Filter groups based on user search query
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return allGroups;
    const term = searchTerm.toLowerCase().trim();
    return allGroups.filter((g) => g.name.toLowerCase().includes(term));
  }, [allGroups, searchTerm]);

  // Total rows corresponding to the currently selected groups
  const totalSelectedCount = useMemo(() => {
    if (selectedGroups.length === 0 || selectedGroups.length === allGroups.length) {
      return rows.length;
    }
    const set = new Set(selectedGroups);
    return allGroups.filter((g) => set.has(g.name)).reduce((sum, g) => sum + g.count, 0);
  }, [allGroups, selectedGroups, rows.length]);

  const isAllSelected = selectedGroups.length === allGroups.length || selectedGroups.length === 0;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all (or select none)
      onChangeSelectedGroups([]);
    } else {
      // Select all group names
      onChangeSelectedGroups(allGroups.map((g) => g.name));
    }
  };

  const handleToggleGroup = (groupName: string) => {
    if (selectedGroups.length === 0) {
      // If currently all are selected implicitly, toggling one means selecting all EXCEPT that one
      const newSelected = allGroups.map((g) => g.name).filter((name) => name !== groupName);
      onChangeSelectedGroups(newSelected);
      return;
    }

    if (selectedGroups.includes(groupName)) {
      const next = selectedGroups.filter((n) => n !== groupName);
      onChangeSelectedGroups(next);
    } else {
      const next = [...selectedGroups, groupName];
      onChangeSelectedGroups(next);
    }
  };

  const handleSelectOnly = (groupName: string) => {
    onChangeSelectedGroups([groupName]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#470082]" />
            Seleção de Grupo Econômico para Análise
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtre por um grupo específico, selecione múltiplos ou analise a consolidação de todos os clientes.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#470082]">
            <span>
              {selectedGroups.length === 0 || selectedGroups.length === allGroups.length
                ? `Todos os ${allGroups.length} Grupos`
                : `${selectedGroups.length} de ${allGroups.length} Grupos`}
            </span>
            <span className="text-purple-400">•</span>
            <span className="text-slate-700">{totalSelectedCount} Colaboradores</span>
          </span>
        </div>
      </div>

      {/* Search Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Digite o nome do grupo para buscar ou filtrar..."
          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#470082]/20 focus:border-[#470082] transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Buttons: Select All / Clear */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            {isAllSelected ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-[#470082]" />
                <span>Selecionado Todos ({allGroups.length})</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-500" />
                <span>Selecionar Todos os {allGroups.length} Grupos</span>
              </>
            )}
          </button>

          {selectedGroups.length > 0 && selectedGroups.length < allGroups.length && (
            <button
              type="button"
              onClick={() => onChangeSelectedGroups([])}
              className="text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 transition-colors cursor-pointer"
            >
              Restaurar 'Todos'
            </button>
          )}
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          {filteredGroups.length} resultado(s) encontrado(s)
        </span>
      </div>

      {/* Scrollable Checklist */}
      <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50">
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 italic">
            Nenhum grupo econômico encontrado com o termo "{searchTerm}".
          </div>
        ) : (
          filteredGroups.map((g) => {
            const isChecked =
              selectedGroups.length === 0 || selectedGroups.includes(g.name);

            return (
              <div
                key={g.name}
                className={`p-2.5 px-3 flex items-center justify-between hover:bg-purple-50/50 transition-colors cursor-pointer ${
                  isChecked ? 'bg-purple-50/30 font-semibold' : ''
                }`}
                onClick={() => handleToggleGroup(g.name)}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    className="w-4 h-4 rounded text-[#470082] focus:ring-[#470082] border-slate-300 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-800 font-bold truncate">
                    {g.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-full">
                    {g.count} colab.
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOnly(g.name);
                    }}
                    title="Apenas este grupo"
                    className="text-[10px] text-purple-700 hover:text-purple-900 bg-purple-100/60 hover:bg-purple-200/80 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer"
                  >
                    Somente Este
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Optional Confirm Button */}
      {showConfirmButton && onConfirm && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl bg-[#470082] hover:bg-[#380068] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{confirmLabel}</span>
            <span className="bg-purple-800/80 px-2 py-0.5 rounded-full text-[11px] text-[#c9f545]">
              {totalSelectedCount} colaboradores
            </span>
            <ArrowRight className="w-4 h-4 text-[#c9f545]" />
          </button>
        </div>
      )}
    </div>
  );
};
