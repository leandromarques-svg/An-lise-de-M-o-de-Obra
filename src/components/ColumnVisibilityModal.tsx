import React, { useState } from 'react';
import { X, CheckSquare, Square, Eye, EyeOff, Search } from 'lucide-react';
import { ColumnMeta } from '../types';

interface ColumnVisibilityModalProps {
  columns: ColumnMeta[];
  onToggleColumn: (key: string) => void;
  onSelectAllColumns: (visible: boolean) => void;
  onClose: () => void;
}

export const ColumnVisibilityModal: React.FC<ColumnVisibilityModalProps> = ({
  columns,
  onToggleColumn,
  onSelectAllColumns,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCount = columns.filter((c) => c.visible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white text-slate-900 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Gerenciar Colunas da Tabela</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {visibleCount} de {columns.length} colunas ativas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Toggle */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar nome da coluna..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => onSelectAllColumns(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Exibir todas
            </button>
            <button
              onClick={() => onSelectAllColumns(false)}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" /> Ocultar todas
            </button>
          </div>
        </div>

        {/* Column List */}
        <div className="p-4 overflow-y-auto space-y-1 flex-1 divide-y divide-slate-100">
          {filteredColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center justify-between py-2 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <span className="text-xs font-medium text-slate-800 truncate pr-2">
                {col.label}
              </span>
              <input
                type="checkbox"
                checked={col.visible}
                onChange={() => onToggleColumn(col.key)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
