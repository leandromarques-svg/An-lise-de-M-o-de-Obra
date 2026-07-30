import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { CsvRow, ColumnMeta } from '../types';

interface EditRowModalProps {
  row: CsvRow | null;
  columns: ColumnMeta[];
  onSave: (updatedRow: CsvRow) => void;
  onClose: () => void;
}

export const EditRowModal: React.FC<EditRowModalProps> = ({ row, columns, onSave, onClose }) => {
  const [formData, setFormData] = useState<CsvRow>({});

  useEffect(() => {
    if (row) {
      setFormData({ ...row });
    } else {
      // Empty row initialized with column keys
      const initial: CsvRow = {};
      columns.forEach((col) => {
        initial[col.key] = '';
      });
      setFormData(initial);
    }
  }, [row, columns]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = Boolean(row);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              {isEditing ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? 'Editar Registro de Colaborador' : 'Adicionar Novo Registro'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="editRowForm" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {columns.map((col) => (
              <div key={col.key} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 truncate" title={col.label}>
                  {col.label}
                </label>
                <input
                  type={col.type === 'currency' || col.type === 'number' ? 'text' : col.type === 'email' ? 'email' : 'text'}
                  value={formData[col.key] || ''}
                  onChange={(e) => handleChange(col.key, e.target.value)}
                  placeholder={`Informe ${col.label.toLowerCase()}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="editRowForm"
            className="px-5 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
};
