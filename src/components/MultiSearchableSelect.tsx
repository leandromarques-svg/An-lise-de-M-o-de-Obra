import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check, CheckSquare, Square } from 'lucide-react';
import { SelectOption } from './SearchableSelect';

interface MultiSearchableSelectProps {
  label: string;
  selectedValues: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  label,
  selectedValues,
  options,
  onChange,
  placeholder = 'Todas',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const allVals = options.map((o) => o.value);
    onChange(allVals);
  };

  const handleClear = () => {
    onChange([]);
  };

  // Label formatting
  let displayLabel = `${label}: ${placeholder}`;
  if (selectedValues.length === 1) {
    const opt = options.find((o) => o.value === selectedValues[0]);
    displayLabel = `${label}: ${opt ? opt.label : selectedValues[0]}`;
  } else if (selectedValues.length > 1) {
    displayLabel = `${label}: ${selectedValues.length} selecionadas`;
  }

  const isHasSelection = selectedValues.length > 0;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Pill Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
          isHasSelection
            ? 'bg-purple-50 text-[#470082] border-purple-300 shadow-2xs font-extrabold'
            : 'bg-slate-50/90 text-slate-800 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <span className="truncate max-w-[200px]">{displayLabel}</span>
        {isHasSelection ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-0.5 rounded-full hover:bg-purple-200/80 text-[#470082] transition-colors ml-0.5"
            title="Limpar seleções"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 p-2.5 text-xs font-medium space-y-2 animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#470082]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Quick Action Header */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 border-b border-slate-100 pb-1.5">
            <span>{selectedValues.length} de {options.length} selecionados</span>
            <div className="flex items-center gap-2 font-bold text-[#470082]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="hover:underline cursor-pointer"
              >
                Marcar todos
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClear}
                className="hover:underline cursor-pointer text-slate-600"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Options List with Checkboxes */}
          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-slate-400 text-[11px]">
                Nenhum item encontrado
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer select-none ${
                      isSelected
                        ? 'bg-purple-50 text-[#470082] font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent onClick
                        className="rounded border-slate-300 text-[#470082] focus:ring-purple-500 cursor-pointer pointer-events-none"
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
