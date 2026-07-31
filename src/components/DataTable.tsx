import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Building,
  DollarSign,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { CsvRow, ColumnMeta, SortConfig } from '../types';
import { formatCurrency, parseSalaryNumber } from '../utils/csvParser';
import { getCargoAreaTag } from '../utils/csAnalytics';

interface DataTableProps {
  rows: CsvRow[];
  columns: ColumnMeta[];
  sortConfig: SortConfig;
  onSort: (columnKey: string) => void;
  onSelectRow: (row: CsvRow) => void;
  onEditRow?: (row: CsvRow, index: number) => void;
  onDeleteRow?: (index: number) => void;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  selectedRowIndices?: number[];
  onToggleSelectRow?: (index: number) => void;
  onToggleSelectAll?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
  columns,
  sortConfig,
  onSort,
  onSelectRow,
  currentPage,
  rowsPerPage,
  onPageChange,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * rowsPerPage;
  const pageRows = rows.slice(startIndex, startIndex + rowsPerPage);

  const handleCopyText = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper to format cell value depending on column key
  const renderCellContent = (column: ColumnMeta, value: string | undefined, row: CsvRow) => {
    const val = value || '-';
    if (!val || val === '-') return <span className="text-slate-400 italic">-</span>;

    const key = column.key.toLowerCase();

    // Salary formatting
    if (key.includes('salário') || key.includes('salario') || column.type === 'currency') {
      const num = parseSalaryNumber(val);
      return (
        <span className="font-semibold text-slate-900 font-mono text-xs">
          {formatCurrency(num)}
        </span>
      );
    }

    // Reason for termination badge
    if (key.includes('motivo')) {
      const isTermino = val.toLowerCase().includes('término') || val.toLowerCase().includes('termino');
      const isPedido = val.toLowerCase().includes('empregado');
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            isTermino
              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
              : isPedido
              ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
              : 'bg-slate-100 text-slate-700 border border-slate-200/60'
          }`}
        >
          {val}
        </span>
      );
    }

    // Employee ID / Func code
    if (key.includes('cód.func') || key.includes('cod.func')) {
      return (
        <span className="inline-flex items-center font-mono font-medium text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          #{val}
        </span>
      );
    }

    // Email
    if (column.type === 'email' || key.includes('e-mail') || key.includes('email')) {
      return (
        <a
          href={`mailto:${val}`}
          onClick={(e) => e.stopPropagation()}
          className="text-indigo-600 hover:text-indigo-800 hover:underline truncate max-w-[200px] block font-medium"
          title={val}
        >
          {val}
        </a>
      );
    }

    // Phone / SMS
    if (column.type === 'phone' || key.includes('telefone') || key.includes('celular')) {
      return <span className="font-mono text-xs text-slate-700">{val}</span>;
    }

    // Cargo with Focal Area badge
    if (key.includes('cargo')) {
      const tag = getCargoAreaTag(val);
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-800 text-xs font-medium truncate max-w-[220px]" title={val}>
            {val}
          </span>
          {tag && (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${tag.bgClass} ${tag.textClass} ${tag.borderClass} shrink-0`}
            >
              {tag.label}
            </span>
          )}
        </div>
      );
    }

    // General text
    return <span className="text-slate-800 text-xs truncate max-w-[260px] block" title={val}>{val}</span>;
  };

  if (totalRows === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Nenhum registro encontrado
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Tente ajustar ou limpar seus filtros de busca para visualizar os colaboradores.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      
      {/* Table Container with scrollbars */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          
          {/* Table Header */}
          <thead className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200">
            <tr>
              
              {/* Actions Header */}
              <th className="py-3.5 px-3 w-16 text-center bg-slate-50 border-b border-slate-200">
                Ver
              </th>

              {/* Dynamic Columns */}
              {columns.map((col) => {
                const isSorted = sortConfig.column === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className="py-3.5 px-4 border-b border-slate-200 hover:bg-slate-100/70 transition-colors cursor-pointer select-none whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{col.label}</span>
                      <span className="text-slate-400">
                        {isSorted ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}

            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200/80 bg-white text-xs">
            {pageRows.map((row, relativeIdx) => {
              const actualIdx = startIndex + relativeIdx;

              return (
                <tr
                  key={actualIdx}
                  onClick={() => onSelectRow(row)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    relativeIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                  }`}
                >
                  {/* View Details Column */}
                  <td
                    className="py-2.5 px-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectRow(row)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors inline-flex items-center justify-center"
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>

                  {/* Column Data Cells */}
                  {columns.map((col) => (
                    <td key={col.key} className="py-2.5 px-4 whitespace-nowrap">
                      {renderCellContent(col, row[col.key], row)}
                    </td>
                  ))}

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Info */}
        <div>
          Mostrando <span className="font-semibold text-slate-900">{startIndex + 1}</span> até{' '}
          <span className="font-semibold text-slate-900">
            {Math.min(startIndex + rowsPerPage, totalRows)}
          </span>{' '}
          de <span className="font-semibold text-slate-900">{totalRows}</span> registros
        </div>

        {/* Page navigation controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(validPage - 1)}
              disabled={validPage <= 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-medium">
              Página <span className="text-slate-900 font-semibold">{validPage}</span> de{' '}
              <span className="text-slate-900 font-semibold">{totalPages}</span>
            </span>

            <button
              onClick={() => onPageChange(validPage + 1)}
              disabled={validPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
