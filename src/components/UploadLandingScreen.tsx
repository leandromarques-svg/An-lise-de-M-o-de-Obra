import React, { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, ArrowRight, ShieldCheck } from 'lucide-react';
import { MetarhLogo } from './MetarhLogo';

interface UploadLandingScreenProps {
  onDatasetLoaded: (rawContent: string, filename: string) => void;
  onLoadDemo: () => void;
  recentDatasets?: { filename: string; date: string; content: string }[];
  onSelectRecent?: (content: string, filename: string) => void;
}

export const UploadLandingScreen: React.FC<UploadLandingScreenProps> = ({
  onDatasetLoaded,
  onLoadDemo,
  recentDatasets = [],
  onSelectRecent,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [filenameInput, setFilenameInput] = useState('cliente_dados.csv');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onDatasetLoaded(text, file.name);
        }
      };
      reader.readAsText(file, 'ISO-8859-1'); // Common Portuguese CSV encoding fallback
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onDatasetLoaded(text, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    onDatasetLoaded(pasteText.trim(), filenameInput || 'dados_cliente_pasted.csv');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-barlow flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full my-auto py-8">
        
        {/* Header Branding with METARH Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MetarhLogo className="h-10 sm:h-12 w-auto" fillColor="#401669" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#470082] tracking-tight">
            Painel de Relação da Prestação de Serviço
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mt-2.5">
            Suba a lista do cliente em CSV para apresentar a análise de modalidades de contratação, motivos de desligamento, ranking de cargos e evolução de admissões por ano.
          </p>
        </div>

        {/* Card Main Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3.5 px-6 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Arquivo CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-3.5 px-6 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Colar Texto do CSV</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'upload' ? (
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-150 ${
                    dragActive
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Selecione ou arraste a planilha do cliente (CSV)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    As colunas são mapeadas deterministicamente para exibição direta dos gráficos e relatórios.
                  </p>
                  <button
                    type="button"
                    className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Procurar no Computador
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nome de Referência do Cliente ou Arquivo
                  </label>
                  <input
                    type="text"
                    value={filenameInput}
                    onChange={(e) => setFilenameInput(e.target.value)}
                    placeholder="Ex: cliente_hidrovias_2025.csv"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cole o conteúdo do CSV (separado por ';' ou ',')
                  </label>
                  <textarea
                    rows={8}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={`Cód.Func.;Nome do Funcionário;Vínculo Empregatício;Salário Base;Cargo ou Função;Nome Cliente\n101;MARIA SILVA;4 - Temporário;4500,00;ANALISTA;CLIENTE EXEMPLO`}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pasteText.trim()}
                  className="w-full py-2.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Gerar Painel do Cliente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Demo Option */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Processamento 100% privado no seu navegador. Nenhum dado é enviado para servidores externos.</span>
              </div>
              <button
                onClick={onLoadDemo}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-indigo-600" />
                <span>Carregar Exemplo de Teste</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Client Datasets (if any saved in session) */}
        {recentDatasets.length > 0 && onSelectRecent && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Listas de Clientes Recentes Nesta Sessão
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentDatasets.map((ds, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectRecent(ds.content, ds.filename)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{ds.filename}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ds.date}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
