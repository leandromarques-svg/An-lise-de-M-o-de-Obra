import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, Info, Mail } from 'lucide-react';
import { parseCsvString } from '../utils/csvParser';
import { CsvDataset } from '../types';
import { GrupoEconomicoSelector } from './GrupoEconomicoSelector';

interface CsvUploaderModalProps {
  onClose: () => void;
  onApplyDataset: (dataset: CsvDataset, selectedGroups?: string[]) => void;
}

export const CsvUploaderModal: React.FC<CsvUploaderModalProps> = ({ onClose, onApplyDataset }) => {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [filename, setFilename] = useState('novo_arquivo.csv');
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<CsvDataset | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        processContent(content, file.name);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processContent = (content: string, name: string) => {
    try {
      setErrorMsg(null);
      const dataset = parseCsvString(content, name);
      if (dataset.headers.length === 0 || dataset.rows.length === 0) {
        setErrorMsg('O arquivo fornecido não contém linhas ou cabeçalhos válidos.');
        setParsedPreview(null);
        return;
      }
      setParsedPreview(dataset);
      setSelectedGroups([]);
    } catch (err: any) {
      setErrorMsg('Erro ao ler CSV: ' + (err.message || 'Formato inválido'));
      setParsedPreview(null);
    }
  };

  const handlePasteChange = (text: string) => {
    setPasteText(text);
    if (text.trim().length > 10) {
      processContent(text, filename || 'dados_colados.csv');
    } else {
      setParsedPreview(null);
    }
  };

  const handleConfirm = () => {
    if (parsedPreview) {
      onApplyDataset(parsedPreview, selectedGroups);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Carregar ou Colar CSV do Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CS Info Alert Bar */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-purple-900 font-semibold">
            <Info className="w-4 h-4 text-[#470082] shrink-0" />
            <span>Precisa da planilha do seu Grupo Econômico? Solicite ao time de CS.</span>
          </div>
          <a
            href="mailto:cs@metarh.com.br?subject=Solicita%C3%A7%C3%A3o%20da%20Rela%C3%A7%C3%A3o%20de%20Alocados"
            className="inline-flex items-center gap-1 font-bold text-[#470082] hover:underline shrink-0"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>cs@metarh.com.br</span>
          </a>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'upload'
                ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload de Arquivo (.csv / .txt)
          </button>
          <button
            onClick={() => setTab('paste')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'paste'
                ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Colar Texto CSV Direto
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tab === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Arraste e solte o arquivo CSV aqui ou clique para selecionar
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Suporta codificação UTF-8 e separadores (ponto e vírgula, vírgula, tabulação)
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="csvRawTextarea" className="block text-xs font-semibold text-slate-700 mb-1">
                Cole o conteúdo bruto do seu CSV abaixo:
              </label>
              <textarea
                id="csvRawTextarea"
                rows={6}
                value={pasteText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder={`Cód.Func.;Nome;Cargo;Salário Base;Grupo Econômico\n101;MARIA SILVA;ANALISTA;4500,00;GRUPO HIDROVIAS`}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview & Grupo Econômico Selection */}
          {parsedPreview && (
            <div className="space-y-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CSV válido: {parsedPreview.rows.length} registros e {parsedPreview.headers.length} colunas</span>
              </div>

              {/* Selector */}
              <GrupoEconomicoSelector
                rows={parsedPreview.rows}
                selectedGroups={selectedGroups}
                onChangeSelectedGroups={setSelectedGroups}
                showConfirmButton={false}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!parsedPreview}
            className="px-5 py-2 text-xs font-semibold rounded-md bg-[#470082] hover:bg-[#380068] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer"
          >
            Carregar no Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
