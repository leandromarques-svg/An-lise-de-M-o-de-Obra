import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  Calendar,
  Building2,
  Phone,
  Mail,
  Copy,
  Check,
  Edit2,
  DollarSign,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { CsvRow } from '../types';
import { formatCurrency, parseSalaryNumber } from '../utils/csvParser';

interface DetailModalProps {
  row: CsvRow | null;
  onClose: () => void;
  onEdit?: (row: CsvRow) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ row, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!row) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(row, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVal = (key: string) => row[key] || '-';
  const salaryNum = parseSalaryNumber(row['Salário Base']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-white text-slate-900 p-6 border-b border-slate-200 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                #{getVal('Cód.Func.')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {getVal('Vínculo Empregatício')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {getVal('Nome do Funcionário')}
            </h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              {getVal('Cargo ou Função')}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fechar detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Section 1: Resumo Salarial e Cargo */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Salário Base
              </span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {salaryNum > 0 ? formatCurrency(salaryNum) : getVal('Salário Base')}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Centro de Custo / Depto
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {getVal('Depto/Centro de Custo')}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Motivo Desligamento
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {getVal('Motivo do Desligamento')}
              </span>
            </div>
          </div>

          {/* Section 2: Contrato & Datas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-1">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Datas e Vencimentos de Contrato
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Data Admissão</span>
                <span className="font-semibold text-slate-900">{getVal('Data Admissão')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Vcto Contrato</span>
                <span className="font-semibold text-slate-900">{getVal('Data Vcto Contrato')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Vcto Prorrogação</span>
                <span className="font-semibold text-slate-900">{getVal('Data Vcto Prorrogação')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Data Demissão</span>
                <span className="font-semibold text-slate-900">{getVal('Data Demissão')}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Contatos & Comunicação */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-1">
              <Phone className="w-4 h-4 text-emerald-600" />
              Informações de Contato & Emergência
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Telefone / Emergência</span>
                <span className="font-medium text-slate-900">{getVal('Telefone')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Celular (SMS)</span>
                <span className="font-medium text-slate-900">{getVal('Celular(envio SMS)')}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">E-mail Corporativo</span>
                {row['E-mail Corporativo'] ? (
                  <a
                    href={`mailto:${row['E-mail Corporativo']}`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    {row['E-mail Corporativo']}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Não informado</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Dados do Cliente & RH Focal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3 border-b border-slate-100 pb-1">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Empresa, Cliente & RH Focal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Empresa Prestadora</span>
                <span className="font-semibold text-slate-900">{getVal('Empresa')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Região / Localidade</span>
                <span className="font-semibold text-slate-900">
                  {getVal('Descrição Região')} ({getVal('Região')})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Cliente Final</span>
                <span className="font-semibold text-slate-900">
                  {getVal('Nome Cliente')} (Cód. {getVal('Cod. Cliente')})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">CNPJ Cliente</span>
                <span className="font-mono text-slate-800">{getVal('CNPJ Cliente')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Nome RH Focal</span>
                <span className="font-semibold text-slate-900">{getVal('Nome RH Focal')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">E-mail RH Focal</span>
                <span className="font-medium text-slate-800">{getVal('E-mail RH Focal')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Quarterização</span>
                <span className="font-medium text-slate-800">{getVal('Quarterização')}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Grupo Econômico</span>
                <span className="font-medium text-slate-800">{getVal('Grupo Econômico')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyJson}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Copiar dados (JSON)</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
