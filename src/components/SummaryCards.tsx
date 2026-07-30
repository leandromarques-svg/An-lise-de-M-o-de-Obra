import React from 'react';
import { Users, DollarSign, TrendingUp, MapPin, Award } from 'lucide-react';
import { SummaryMetrics } from '../types';
import { formatCurrency } from '../utils/csvParser';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Employees */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Exibido
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.filteredCount}
            </span>
            <span className="text-xs text-slate-500">
              de {metrics.totalCount}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {metrics.filteredCount === metrics.totalCount
              ? 'Todos os registros'
              : 'Filtros aplicados'}
          </p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Total Payroll */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Folha Salarial
          </p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {formatCurrency(metrics.totalSalary)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Soma dos salários exibidos
          </p>
        </div>
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>

      {/* Average Salary */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Média Salarial
          </p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {formatCurrency(metrics.avgSalary)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Maior: {formatCurrency(metrics.maxSalary)}
          </p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Top Region */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Principal Região
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate tracking-tight">
            {metrics.topRegioes.length > 0 ? metrics.topRegioes[0].regiao : 'N/A'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {metrics.topRegioes.length > 0
              ? `${metrics.topRegioes[0].count} colaboradores`
              : 'Sem dados'}
          </p>
        </div>
        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
