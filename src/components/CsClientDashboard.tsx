import React, { useState, useMemo } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Building2,
  FileText,
  ArrowUpRight,
  ShieldAlert,
  BarChart2,
  Trophy,
  Calendar,
  UserPlus,
  UserMinus,
  FileSpreadsheet,
  ArrowUpDown,
  Clock,
  CalendarX,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CsDashboardData } from '../utils/csAnalytics';
import { formatCurrency } from '../utils/csvParser';

interface CsClientDashboardProps {
  data: CsDashboardData;
  clientName: string;
  filename: string;
  onOpenUploader: () => void;
  onSwitchToTable: () => void;
}

const MODALITY_COLORS = ['#470082', '#aa3ffe', '#6404bc', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#64748b'];

export const CsClientDashboard: React.FC<CsClientDashboardProps> = ({
  data,
  clientName,
  filename,
  onOpenUploader,
  onSwitchToTable,
}) => {
  const [cargoSortMode, setCargoSortMode] = useState<'count' | 'avgSalary' | 'totalSalary'>('count');
  const [contractTab, setContractTab] = useState<'all' | 'vencidos' | 'a_vencer' | 'prorrogados'>('all');
  const [contractSearch, setContractSearch] = useState<string>('');

  const contractExpirationsData = data.contractExpirations || {
    totalWithContractDate: 0,
    vencidosCount: 0,
    aVencerCount: 0,
    prorrogadosCount: 0,
    semProrrogacaoCount: 0,
    vencidosPercentage: 0,
    aVencerPercentage: 0,
    prorrogadosPercentage: 0,
    expirationsList: [],
  };

  const filteredExpirations = useMemo(() => {
    let list = contractExpirationsData.expirationsList || [];

    if (contractTab === 'vencidos') {
      list = list.filter((item) => item.status === 'vencido' || item.status === 'prorrogado_vencido');
    } else if (contractTab === 'a_vencer') {
      list = list.filter((item) => item.status === 'a_vencer' || item.status === 'prorrogado_ativo');
    } else if (contractTab === 'prorrogados') {
      list = list.filter((item) => item.hasProrrogacao);
    }

    if (contractSearch.trim()) {
      const q = contractSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.workerName.toLowerCase().includes(q) ||
          item.cargo.toLowerCase().includes(q) ||
          item.modality.toLowerCase().includes(q) ||
          (item.dataVctoContrato && item.dataVctoContrato.includes(q)) ||
          (item.dataVctoProrrogacao && item.dataVctoProrrogacao.includes(q))
      );
    }

    return list;
  }, [contractExpirationsData, contractTab, contractSearch]);

  const topClient = data.clients.length > 0 ? data.clients[0] : null;
  const totalMotivosCount = data.motivos.reduce((acc, curr) => acc + curr.count, 0);

  const sourceCargos = data.cargosAll && data.cargosAll.length > 0 ? data.cargosAll : data.cargosTop;

  const sortedCargos = useMemo(() => {
    const sorted = [...sourceCargos];
    if (cargoSortMode === 'avgSalary') {
      sorted.sort((a, b) => b.avgSalary - a.avgSalary || b.count - a.count);
    } else if (cargoSortMode === 'totalSalary') {
      sorted.sort((a, b) => b.totalSalary - a.totalSalary || b.count - a.count);
    } else {
      sorted.sort((a, b) => b.count - a.count || b.totalSalary - a.totalSalary);
    }
    return sorted.slice(0, 10).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [sourceCargos, cargoSortMode]);

  const maxValInSorted = useMemo(() => {
    if (sortedCargos.length === 0) return 1;
    if (cargoSortMode === 'avgSalary') {
      return Math.max(...sortedCargos.map((c) => c.avgSalary));
    }
    if (cargoSortMode === 'totalSalary') {
      return Math.max(...sortedCargos.map((c) => c.totalSalary));
    }
    return Math.max(...sortedCargos.map((c) => c.count));
  }, [sortedCargos, cargoSortMode]);

  return (
    <div className="space-y-6 font-barlow">
      
      {/* Top Banner: METARH Client Header & CS Focus */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#470082] text-white shadow-2xs">
                <Building2 className="w-3.5 h-3.5 mr-1 text-[#c9f545]" />
                Cliente sob Análise CS
              </span>
              <span className="text-xs text-purple-900 font-semibold">• {filename}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#470082] tracking-tight">
              {topClient?.name || clientName || 'Visão do Cliente'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenUploader}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-md bg-purple-50 hover:bg-purple-100 text-[#470082] border border-purple-200 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-[#470082]" />
              <span>Subir Outro Cliente (CSV)</span>
            </button>
            <button
              onClick={onSwitchToTable}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-md bg-[#470082] hover:bg-[#380068] text-white shadow-xs transition-colors cursor-pointer"
            >
              <span>Ver Tabela Operacional</span>
              <ArrowUpRight className="w-4 h-4 ml-1.5 text-[#c9f545]" />
            </button>
          </div>
        </div>

        {/* Client Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
              CNPJ do Cliente
            </span>
            <span className="font-semibold text-slate-800">
              {topClient?.cnpj || 'Não informado'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
              RH Focal do Cliente
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {topClient?.rhFocal || 'Não informado'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
              Prestadores Ativos/Registrados
            </span>
            <span className="font-semibold text-[#470082]">
              {data.totalWorkers} profissionais
            </span>
          </div>
          <div>
            <span className="text-[11px] font-bold text-purple-900/60 uppercase tracking-wider block">
              Investimento em Folha
            </span>
            <span className="font-bold text-[#470082]">
              {formatCurrency(data.totalPayroll)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Breakdown Strip: Ativos, Desligados & Contratos Prorrogados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ativos */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Colaboradores Ativos
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-950 tracking-tight mt-1">
              {data.contractStatus.active}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {data.totalWorkers > 0
                ? `${((data.contractStatus.active / data.totalWorkers) * 100).toFixed(1)}% do contingente total`
                : '0%'}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Desligados */}
        <div className="bg-white rounded-xl p-4 border border-rose-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
                Colaboradores Desligados
              </span>
            </div>
            <p className="text-2xl font-black text-rose-950 tracking-tight mt-1">
              {data.contractStatus.finished}
            </p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {data.totalWorkers > 0
                ? `${((data.contractStatus.finished / data.totalWorkers) * 100).toFixed(1)}% do contingente total`
                : '0%'}
            </p>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5" />
          </div>
        </div>

        {/* Contratos Prorrogados */}
        <div className="bg-white rounded-xl p-4 border border-purple-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#470082]"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#470082]">
                Contratos Prorrogados
              </span>
            </div>
            <p className="text-2xl font-black text-[#470082] tracking-tight mt-1">
              {data.contractExpirations.prorrogadosCount}
            </p>
            <p className="text-[11px] text-purple-700 mt-0.5">
              {data.contractExpirations.prorrogadosPercentage}% com aditivo contratual
            </p>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-[#470082] rounded-xl border border-purple-200 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEÇÃO: GESTÃO DE VIGÊNCIA DE CONTRATOS (VENCIDOS, A VENCER E PRORROGAÇÃO) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-50 text-[#470082] border border-purple-200 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#470082]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#470082] tracking-tight">
                Gestão de Vigência, Vencimento & Prorrogação de Contratos
              </h2>
              <p className="text-xs text-slate-500">
                Monitoramento de prazos expirados, contratos vigentes a vencer e termos de prorrogação
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#470082] border border-purple-200 rounded-full w-fit">
            {contractExpirationsData.totalWithContractDate} contratos monitorados
          </span>
        </div>

        {/* 3 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Já Vencidos */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 block">
                Contratos Já Vencidos
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-900">
                  {contractExpirationsData.vencidosCount}
                </span>
                <span className="text-xs font-bold text-rose-700">
                  ({contractExpirationsData.vencidosPercentage}% do total)
                </span>
              </div>
              <p className="text-[11px] text-rose-600 mt-0.5">Prazo expirado ou encerrado</p>
            </div>
            <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shrink-0 border border-rose-200">
              <CalendarX className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: A Vencer */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 block">
                Contratos A Vencer
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-900">
                  {contractExpirationsData.aVencerCount}
                </span>
                <span className="text-xs font-bold text-amber-700">
                  ({contractExpirationsData.aVencerPercentage}% do total)
                </span>
              </div>
              <p className="text-[11px] text-amber-600 mt-0.5">Vigência ativa a renovar ou finalizar</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: De Prorrogação */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#470082] block">
                Contratos com Prorrogação
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#470082]">
                  {contractExpirationsData.prorrogadosCount}
                </span>
                <span className="text-xs font-bold text-purple-700">
                  ({contractExpirationsData.prorrogadosPercentage}% com aditivo)
                </span>
              </div>
              <p className="text-[11px] text-purple-600 mt-0.5">Data Vcto Prorrogação cadastrada</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 text-[#470082] rounded-xl flex items-center justify-center shrink-0 border border-purple-200">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setContractTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contractTab === 'all'
                  ? 'bg-[#470082] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              Todos ({contractExpirationsData.expirationsList.length})
            </button>

            <button
              onClick={() => setContractTab('vencidos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contractTab === 'vencidos'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-100/70'
              }`}
            >
              Já Vencidos ({contractExpirationsData.vencidosCount})
            </button>

            <button
              onClick={() => setContractTab('a_vencer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contractTab === 'a_vencer'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-amber-800 hover:bg-amber-100/70'
              }`}
            >
              A Vencer ({contractExpirationsData.aVencerCount})
            </button>

            <button
              onClick={() => setContractTab('prorrogados')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contractTab === 'prorrogados'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-800 hover:bg-purple-100/70'
              }`}
            >
              Com Prorrogação ({contractExpirationsData.prorrogadosCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador ou cargo..."
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#470082]"
            />
          </div>
        </div>

        {/* Table List */}
        {filteredExpirations.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            Nenhum contrato encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[380px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-3">Colaborador / Função</th>
                  <th className="py-2.5 px-3">Modalidade</th>
                  <th className="py-2.5 px-3 text-center">Admissão</th>
                  <th className="py-2.5 px-3 text-center">Vcto. Inicial</th>
                  <th className="py-2.5 px-3 text-center">Vcto. Prorrogação</th>
                  <th className="py-2.5 px-3 text-center">Status da Vigência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredExpirations.slice(0, 50).map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="font-bold text-slate-900">{item.workerName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.cargo}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {item.modality}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-[11px]">
                      {item.dataAdmissao || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800 text-[11px]">
                      {item.dataVctoContrato || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      {item.dataVctoProrrogacao ? (
                        <span className="font-bold text-[#470082] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {item.dataVctoProrrogacao}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Sem aditivo</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === 'vencido' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <CalendarX className="w-3 h-3" /> Já Vencido
                        </span>
                      )}
                      {item.status === 'a_vencer' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" /> A Vencer
                        </span>
                      )}
                      {item.status === 'prorrogado_ativo' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-50 text-[#470082] border border-purple-200">
                          <RefreshCw className="w-3 h-3" /> Prorrogado (Ativo)
                        </span>
                      )}
                      {item.status === 'prorrogado_vencido' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <RefreshCw className="w-3 h-3" /> Prorrogado (Vencido)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW: DISTRIBUIÇÃO DAS CONTRATAÇÕES E DESLIGAMENTOS POR ANO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-purple-50 text-[#470082] border border-purple-200 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#470082]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#470082] tracking-tight">
                Distribuição de Contratações e Desligamentos por Ano
              </h2>
              <p className="text-xs text-slate-500">
                Evolução temporal de Admissões (contratações) vs. Demissões (desligamentos) na conta do cliente
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#470082] border border-purple-200 rounded-full w-fit">
            Histórico Temporal
          </span>
        </div>

        {data.yearlyStats.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Nenhuma data de admissão ou demissão registrada no arquivo para mapeamento anual.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Chart: Bar chart grouped by year */}
            <div className="lg:col-span-2 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.yearlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600, fill: '#470082' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} pessoas`,
                      name === 'admissoes' ? 'Admissões (Contratações)' : 'Desligamentos (Demissões)',
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'admissoes' ? 'Contratações (Admissões)' : 'Desligamentos (Demissões)'
                    }
                  />
                  <Bar dataKey="admissoes" fill="#10b981" radius={[4, 4, 0, 0]} name="admissoes" />
                  <Bar dataKey="desligamentos" fill="#f43f5e" radius={[4, 4, 0, 0]} name="desligamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary List per Year */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#470082] border-b border-slate-200 pb-2">
                Consolidado Anual de Movimentação
              </h3>
              <div className="divide-y divide-slate-200/60 max-h-56 overflow-y-auto text-xs">
                {data.yearlyStats.map((stat) => (
                  <div key={stat.year} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block">
                        Ano {stat.year}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Saldo líquido: <strong className={stat.saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}>{stat.saldo >= 0 ? `+${stat.saldo}` : stat.saldo}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <UserPlus className="w-3 h-3 mr-1" />
                        {stat.admissoes} adm.
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                        <UserMinus className="w-3 h-3 mr-1" />
                        {stat.desligamentos} des.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* RANKING TOP 10 CARGOS & MÉDIA SALARIAL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Ranking Top 10 Cargos & Média Salarial
              </h2>
              <p className="text-xs text-slate-500">
                Classificação das posições do cliente por headcount ou valores de remuneração
              </p>
            </div>
          </div>

          {/* Sort Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              Ranking por:
            </span>
            <button
              onClick={() => setCargoSortMode('count')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                cargoSortMode === 'count'
                  ? 'bg-[#470082] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Qtd. Prestadores
            </button>
            <button
              onClick={() => setCargoSortMode('avgSalary')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                cargoSortMode === 'avgSalary'
                  ? 'bg-[#470082] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Maior Salário Médio
            </button>
            <button
              onClick={() => setCargoSortMode('totalSalary')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                cargoSortMode === 'totalSalary'
                  ? 'bg-[#470082] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Maior Folha Total
            </button>
          </div>
        </div>

        {sortedCargos.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Nenhum cargo encontrado no arquivo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-2.5 px-3 rounded-l-lg w-14 text-center"># Pos</th>
                  <th className="py-2.5 px-3">Cargo / Função</th>
                  <th className={`py-2.5 px-3 text-center ${cargoSortMode === 'count' ? 'text-[#470082] font-extrabold bg-purple-50/60' : ''}`}>
                    Prestadores
                  </th>
                  <th className="py-2.5 px-3">
                    {cargoSortMode === 'count' ? 'Proporção do Contingente' : cargoSortMode === 'avgSalary' ? 'Proporção do Salário' : 'Proporção do Investimento'}
                  </th>
                  <th className={`py-2.5 px-3 text-right ${cargoSortMode === 'avgSalary' ? 'text-[#470082] font-extrabold bg-purple-50/60' : ''}`}>
                    Média Salarial
                  </th>
                  <th className={`py-2.5 px-3 text-right rounded-r-lg ${cargoSortMode === 'totalSalary' ? 'text-[#470082] font-extrabold bg-purple-50/60' : ''}`}>
                    Investimento Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedCargos.map((item) => {
                  const isTop3 = item.rank <= 3;
                  let currentVal = item.count;
                  if (cargoSortMode === 'avgSalary') currentVal = item.avgSalary;
                  if (cargoSortMode === 'totalSalary') currentVal = item.totalSalary;

                  const percentOfMax = Math.min(100, Math.round((currentVal / maxValInSorted) * 100));

                  return (
                    <tr key={item.name} className="hover:bg-purple-50/30 transition-colors">
                      {/* Rank Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            item.rank === 1
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                              : item.rank === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300'
                              : item.rank === 3
                              ? 'bg-amber-700/10 text-amber-900 border border-amber-800/20'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      {/* Cargo Name */}
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                          {item.name}
                        </span>
                      </td>

                      {/* Count */}
                      <td className={`py-3 px-3 text-center ${cargoSortMode === 'count' ? 'bg-purple-50/20' : ''}`}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-bold text-xs border ${
                          cargoSortMode === 'count'
                            ? 'bg-[#470082] text-white border-[#470082]'
                            : 'bg-purple-50 text-[#470082] border-purple-100'
                        }`}>
                          {item.count} {item.count === 1 ? 'prestador' : 'prestadores'}
                        </span>
                      </td>

                      {/* Visual Bar */}
                      <td className="py-3 px-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {cargoSortMode === 'count' && `${item.percentage}% do total`}
                              {cargoSortMode === 'avgSalary' && `Média: ${formatCurrency(item.avgSalary)}`}
                              {cargoSortMode === 'totalSalary' && `Total: ${formatCurrency(item.totalSalary)}`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isTop3 ? 'bg-[#470082]' : 'bg-slate-400'
                              }`}
                              style={{ width: `${percentOfMax}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Média Salarial */}
                      <td className={`py-3 px-3 text-right ${cargoSortMode === 'avgSalary' ? 'bg-purple-50/20' : ''}`}>
                        <span className={`font-mono block ${
                          cargoSortMode === 'avgSalary'
                            ? 'text-[#470082] font-extrabold text-sm'
                            : 'text-slate-900 font-bold text-xs sm:text-sm'
                        }`}>
                          {formatCurrency(item.avgSalary)}
                        </span>
                        <span className="text-[10px] text-slate-400">por prestador</span>
                      </td>

                      {/* Total Payroll for Cargo */}
                      <td className={`py-3 px-3 text-right ${cargoSortMode === 'totalSalary' ? 'bg-purple-50/20' : ''}`}>
                        <span className={`font-mono block ${
                          cargoSortMode === 'totalSalary'
                            ? 'text-[#470082] font-extrabold text-sm'
                            : 'text-[#470082] font-semibold text-xs'
                        }`}>
                          {formatCurrency(item.totalSalary)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALIDADES & ANÁLISE DE DESLIGAMENTOS PREFERIDA DO USUÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Modalidades de Contratação */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#470082]" />
                Modalidades de Contratação (Vínculo Empregatício)
              </h3>
              <span className="text-[11px] font-bold text-[#470082] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                {data.modalities.length} tipos registrados
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Tipos de vínculo na conta (CLT, Estágio, Temporário, etc.) com remuneração média
            </p>

            {data.modalities.length > 0 && (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.modalities}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {data.modalities.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={MODALITY_COLORS[index % MODALITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, item: any) => [
                        `${value} colaboradores (${item.payload.percentage}%)`,
                        'Contingente',
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 divide-y divide-slate-100 text-xs">
            {data.modalities.map((m, idx) => (
              <div key={m.name} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: MODALITY_COLORS[idx % MODALITY_COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-800 truncate">{m.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-500">{m.count} prest. ({m.percentage}%)</span>
                  <span className="font-mono text-[#470082] font-bold">{formatCurrency(m.avgSalary)}/mês</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: ANÁLISE POR MOTIVO DO DESLIGAMENTO (Conforme a preferência exata da imagem do usuário) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                Análise por Motivo do Desligamento
              </h3>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                {totalMotivosCount} saídas registradas
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Causas registradas para a saída de colaboradores da operação do cliente
            </p>

            {data.motivos.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum motivo de desligamento registrado no arquivo.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {data.motivos.map((m) => {
                  const pct = totalMotivosCount > 0 ? Number(((m.count / totalMotivosCount) * 100).toFixed(1)) : m.percentage;
                  
                  return (
                    <div key={m.name} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-900 font-bold pr-2">{m.name}</span>
                        <span className="text-rose-600 shrink-0 font-bold">
                          {m.count} {m.count === 1 ? 'ocorrência' : 'ocorrências'}{' '}
                          <span className="text-slate-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      
                      {/* Horizontal progress bar matching exact screenshot style */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            m.category === 'empregado'
                              ? 'bg-rose-500'
                              : m.category === 'empresa'
                              ? 'bg-amber-500'
                              : m.category === 'contrato'
                              ? 'bg-emerald-500'
                              : 'bg-purple-600'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Por Iniciativa do Empregado</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Por Iniciativa da Empresa</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Término de Contrato / Acordo</span>
          </div>
        </div>

      </div>

      {/* Regional Distribution Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Distribuição Geográfica da Operação
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Locais e praças de prestação de serviços do cliente
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regioes.slice(0, 6)} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`${value} prestadores`, 'Quantidade']} />
                <Bar dataKey="count" fill="#470082" radius={[4, 4, 0, 0]} name="Prestadores" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="divide-y divide-slate-100 text-xs self-center">
            {data.regioes.slice(0, 5).map((r) => (
              <div key={r.name} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">{r.name}</span>
                  <span className="text-[11px] text-slate-500">{r.count} prestadores registrados</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#470082] block">{formatCurrency(r.totalSalary)}</span>
                  <span className="text-[11px] text-slate-400">{r.percentage}% da folha</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Section: Resumo Factual das Pautas (Pautas Numéricas & Consolidado para Reunião) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#470082] text-white flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4 text-[#c9f545]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#470082]">
                Insights Práticos da Parceria
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.factualPoints.map((point) => {
            const isAlert = point.severity === 'alert';
            const isWarning = point.severity === 'warning';
            const isSuccess = point.severity === 'success';

            return (
              <div
                key={point.id}
                className={`rounded-xl p-4 border transition-all ${
                  isAlert
                    ? 'bg-rose-50/60 border-rose-200'
                    : isWarning
                    ? 'bg-amber-50/60 border-amber-200'
                    : isSuccess
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-purple-50/50 border-purple-200/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isAlert && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                    {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {!isAlert && !isWarning && !isSuccess && <Info className="w-4 h-4 text-[#470082] shrink-0" />}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {point.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800 shadow-2xs">
                    {point.metric}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {point.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {point.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};