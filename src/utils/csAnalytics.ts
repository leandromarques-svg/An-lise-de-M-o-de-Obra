import { CsvRow } from '../types';
import { parseSalaryNumber, formatCurrency } from './csvParser';

export interface ModalityStat {
  name: string;
  count: number;
  percentage: number;
  totalSalary: number;
  avgSalary: number;
}

export interface MotivoStat {
  name: string;
  count: number;
  percentage: number;
  isVoluntary: boolean;
  category: 'empregado' | 'empresa' | 'contrato' | 'outros';
}

export interface ClientStat {
  name: string;
  cnpj?: string;
  rhFocal?: string;
  count: number;
  percentage: number;
  totalSalary: number;
}

export interface CargoRankingItem {
  rank: number;
  name: string;
  count: number;
  avgSalary: number;
  totalSalary: number;
  percentage: number;
}

export interface ContractExpirationItem {
  id: string;
  workerName: string;
  cargo: string;
  modality: string;
  dataAdmissao?: string;
  dataVctoContrato?: string;
  dataVctoProrrogacao?: string;
  dataDemissao?: string;
  effectiveExpirationStr?: string;
  hasProrrogacao: boolean;
  status: 'vencido' | 'a_vencer' | 'prorrogado_ativo' | 'prorrogado_vencido';
  daysToExpiration?: number;
}

export interface ContractExpirationsData {
  totalWithContractDate: number;
  vencidosCount: number;
  aVencerCount: number;
  prorrogadosCount: number;
  semProrrogacaoCount: number;
  vencidosPercentage: number;
  aVencerPercentage: number;
  prorrogadosPercentage: number;
  expirationsList: ContractExpirationItem[];
}

export interface FactualPoint {
  id: string;
  title: string;
  category: 'Modalidades' | 'Turnover' | 'Contratos' | 'Financeiro' | 'Atendimento';
  severity: 'info' | 'warning' | 'alert' | 'success';
  metric: string;
  summary: string;
}

export interface YearlyStat {
  year: string;
  admissoes: number;
  desligamentos: number;
  saldo: number;
}

export interface CsDashboardData {
  totalWorkers: number;
  totalPayroll: number;
  avgSalary: number;
  maxSalary: number;
  modalities: ModalityStat[];
  motivos: MotivoStat[];
  clients: ClientStat[];
  regioes: { name: string; count: number; percentage: number; totalSalary: number }[];
  cargosTop: CargoRankingItem[];
  cargosAll: CargoRankingItem[];
  yearlyStats: YearlyStat[];
  factualPoints: FactualPoint[];
  contractStatus: {
    finished: number;
    active: number;
    voluntaryTurnoverRate: number;
  };
  contractExpirations: ContractExpirationsData;
}

export function extractYear(dateStr?: string): string | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str) return null;

  // DD/MM/YYYY
  const partsSlash = str.split('/');
  if (partsSlash.length === 3) {
    const y = partsSlash[2].trim();
    if (y.length === 4 && !isNaN(Number(y))) return y;
  }

  // YYYY-MM-DD
  const partsDash = str.split('-');
  if (partsDash.length === 3) {
    const y0 = partsDash[0].trim();
    if (y0.length === 4 && !isNaN(Number(y0))) return y0;
    const y2 = partsDash[2].trim();
    if (y2.length === 4 && !isNaN(Number(y2))) return y2;
  }

  return null;
}

export function parseFullDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (!str) return null;

  // DD/MM/YYYY
  const partsSlash = str.split('/');
  if (partsSlash.length === 3) {
    const d = parseInt(partsSlash[0], 10);
    const m = parseInt(partsSlash[1], 10) - 1;
    const y = parseInt(partsSlash[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1900) {
      return new Date(y, m, d);
    }
  }

  // YYYY-MM-DD
  const partsDash = str.split('-');
  if (partsDash.length === 3) {
    if (partsDash[0].length === 4) {
      const y = parseInt(partsDash[0], 10);
      const m = parseInt(partsDash[1], 10) - 1;
      const d = parseInt(partsDash[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1900) {
        return new Date(y, m, d);
      }
    } else if (partsDash[2].length === 4) {
      const d = parseInt(partsDash[0], 10);
      const m = parseInt(partsDash[1], 10) - 1;
      const y = parseInt(partsDash[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1900) {
        return new Date(y, m, d);
      }
    }
  }

  return null;
}

export function computeCsAnalytics(rows: CsvRow[]): CsDashboardData {
  const totalWorkers = rows.length;
  if (totalWorkers === 0) {
    return {
      totalWorkers: 0,
      totalPayroll: 0,
      avgSalary: 0,
      maxSalary: 0,
      modalities: [],
      motivos: [],
      clients: [],
      regioes: [],
      cargosTop: [],
      cargosAll: [],
      yearlyStats: [],
      factualPoints: [],
      contractStatus: { finished: 0, active: 0, voluntaryTurnoverRate: 0 },
      contractExpirations: {
        totalWithContractDate: 0,
        vencidosCount: 0,
        aVencerCount: 0,
        prorrogadosCount: 0,
        semProrrogacaoCount: 0,
        vencidosPercentage: 0,
        aVencerPercentage: 0,
        prorrogadosPercentage: 0,
        expirationsList: [],
      },
    };
  }

  let totalPayroll = 0;
  let maxSalary = 0;

  const modalitiesMap: Record<string, { count: number; totalSalary: number }> = {};
  const motivosMap: Record<string, number> = {};
  const clientsMap: Record<string, { count: number; totalSalary: number; cnpj?: string; rhFocal?: string }> = {};
  const regioesMap: Record<string, { count: number; totalSalary: number }> = {};
  const cargosMap: Record<string, { count: number; totalSalary: number }> = {};
  const admissoesMap: Record<string, number> = {};
  const desligamentosMap: Record<string, number> = {};

  let finishedCount = 0;
  let activeCount = 0;
  let voluntarySaidas = 0;

  const expirationsList: ContractExpirationItem[] = [];
  let totalWithContractDate = 0;
  let vencidosCount = 0;
  let aVencerCount = 0;
  let prorrogadosCount = 0;

  const today = new Date();

  rows.forEach((row, idx) => {
    // Salary calculation
    const salVal = parseSalaryNumber(
      row['Salário Base'] || row['Salario Base'] || row['Salário'] || row['Salario'] || row['Remuneração'] || row['Valor']
    );
    totalPayroll += salVal;
    if (salVal > maxSalary) maxSalary = salVal;

    // Dates for Yearly Breakdown
    const admDate = row['Data Admissão'] || row['Data Admissao'] || row['Admissão'] || row['Admissao'];
    const admYear = extractYear(admDate);
    if (admYear) {
      admissoesMap[admYear] = (admissoesMap[admYear] || 0) + 1;
    }

    const demDateStr = row['Data Demissão'] || row['Data Demissao'] || row['Demissão'] || row['Demissao'];
    const demYear = extractYear(demDateStr);
    if (demYear) {
      desligamentosMap[demYear] = (desligamentosMap[demYear] || 0) + 1;
    }

    // Contract Expirations & Extension Logic
    const vctoContratoStr =
      row['Data Vcto Contrato'] ||
      row['Data Vcto Contrato '] ||
      row['Data Vencimento Contrato'] ||
      row['Vencimento Contrato'] ||
      '';
    const vctoProrrogacaoStr =
      row['Data Vcto Prorrogação'] ||
      row['Data Vcto Prorrogacao'] ||
      row['Data Prorrogação'] ||
      row['Data Prorrogacao'] ||
      '';
    const workerName = row['Nome do Funcionário'] || row['Nome'] || row['Funcionário'] || `Colaborador #${idx + 1}`;
    const workerCargo = row['Cargo ou Função'] || row['Cargo'] || 'Não Informado';
    const workerModality = row['Vínculo Empregatício'] || row['Modalidade'] || 'N/A';

    const cleanVctoProrr = vctoProrrogacaoStr.trim();
    const cleanVctoContr = vctoContratoStr.trim();

    const hasProrrogacao = cleanVctoProrr.length > 0;
    if (hasProrrogacao) {
      prorrogadosCount += 1;
    }

    if (cleanVctoContr.length > 0 || cleanVctoProrr.length > 0) {
      totalWithContractDate += 1;

      const effectiveStr = cleanVctoProrr || cleanVctoContr;
      const effDate = parseFullDate(effectiveStr);
      const demDate = parseFullDate(demDateStr);

      let isVencido = false;
      let daysToExpiration: number | undefined = undefined;

      if (demDate) {
        isVencido = true;
      } else if (effDate) {
        const diffMs = effDate.getTime() - today.getTime();
        daysToExpiration = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysToExpiration <= 0) {
          isVencido = true;
        }
      } else {
        isVencido = true;
      }

      if (isVencido) {
        vencidosCount += 1;
      } else {
        aVencerCount += 1;
      }

      expirationsList.push({
        id: `exp-${idx}`,
        workerName,
        cargo: workerCargo,
        modality: workerModality,
        dataAdmissao: admDate || '',
        dataVctoContrato: cleanVctoContr,
        dataVctoProrrogacao: cleanVctoProrr,
        dataDemissao: demDateStr || '',
        effectiveExpirationStr: effectiveStr,
        hasProrrogacao,
        status: isVencido
          ? (hasProrrogacao ? 'prorrogado_vencido' : 'vencido')
          : (hasProrrogacao ? 'prorrogado_ativo' : 'a_vencer'),
        daysToExpiration,
      });
    }

    // Modality (Vínculo Empregatício)
    const modKey =
      row['Vínculo Empregatício'] ||
      row['Vinculo Empregaticio'] ||
      row['Modalidade'] ||
      row['Tipo Contrato'] ||
      'Não Informado';
    const cleanMod = modKey.trim();
    if (!modalitiesMap[cleanMod]) modalitiesMap[cleanMod] = { count: 0, totalSalary: 0 };
    modalitiesMap[cleanMod].count += 1;
    modalitiesMap[cleanMod].totalSalary += salVal;

    // Motivo do Desligamento
    const motivoKey =
      row['Motivo do Desligamento'] ||
      row['Motivo Desligamento'] ||
      row['Motivo'] ||
      'Ativo / Não Especificado';
    const cleanMotivo = motivoKey.trim();
    if (cleanMotivo) {
      motivosMap[cleanMotivo] = (motivosMap[cleanMotivo] || 0) + 1;
      const lower = cleanMotivo.toLowerCase();

      if (
        lower.includes('pelo empregado') ||
        lower.includes('pedido') ||
        lower.includes('antecipado pelo empregado')
      ) {
        voluntarySaidas += 1;
      }

      if (!lower.includes('ativo') && !lower.includes('não especificado')) {
        finishedCount += 1;
      }
    } else {
      activeCount += 1;
    }

    // Client Name
    const clientKey =
      row['Nome Cliente'] ||
      row['Cliente'] ||
      row['Empresa'] ||
      row['Grupo Econômico'] ||
      'Cliente Único';
    const cleanClient = clientKey.trim();
    if (!clientsMap[cleanClient]) {
      clientsMap[cleanClient] = {
        count: 0,
        totalSalary: 0,
        cnpj: row['CNPJ Cliente'] || '',
        rhFocal: row['Nome RH Focal'] || row['E-mail RH Focal'] || '',
      };
    }
    clientsMap[cleanClient].count += 1;
    clientsMap[cleanClient].totalSalary += salVal;

    // Region
    const regKey =
      row['Descrição Região'] ||
      row['Região'] ||
      row['Regiao'] ||
      row['Localidade'] ||
      'Não Informada';
    const cleanReg = regKey.trim();
    if (!regioesMap[cleanReg]) regioesMap[cleanReg] = { count: 0, totalSalary: 0 };
    regioesMap[cleanReg].count += 1;
    regioesMap[cleanReg].totalSalary += salVal;

    // Cargo
    const cargoKey = row['Cargo ou Função'] || row['Cargo'] || row['Função'] || 'Outros';
    const cleanCargo = cargoKey.trim();
    if (!cargosMap[cleanCargo]) cargosMap[cleanCargo] = { count: 0, totalSalary: 0 };
    cargosMap[cleanCargo].count += 1;
    cargosMap[cleanCargo].totalSalary += salVal;
  });

  const avgSalary = totalWorkers > 0 ? totalPayroll / totalWorkers : 0;

  // Yearly Stats
  const allYearsSet = new Set<string>([
    ...Object.keys(admissoesMap),
    ...Object.keys(desligamentosMap),
  ]);

  const yearlyStats: YearlyStat[] = Array.from(allYearsSet)
    .sort((a, b) => Number(a) - Number(b))
    .map((year) => {
      const adm = admissoesMap[year] || 0;
      const des = desligamentosMap[year] || 0;
      return {
        year,
        admissoes: adm,
        desligamentos: des,
        saldo: adm - des,
      };
    });

  // Modalities List
  const modalities: ModalityStat[] = Object.entries(modalitiesMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Number(((data.count / totalWorkers) * 100).toFixed(1)),
      totalSalary: data.totalSalary,
      avgSalary: data.count > 0 ? data.totalSalary / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Motivos List - Categorized explicitly according to user guidelines
  const motivos: MotivoStat[] = Object.entries(motivosMap)
    .map(([name, count]) => {
      const lower = name.toLowerCase();
      let isVoluntary = false;
      let category: 'empregado' | 'empresa' | 'contrato' | 'outros' = 'outros';

      if (
        lower.includes('pelo empregado') ||
        lower.includes('pedido') ||
        lower.includes('antecipado pelo empregado')
      ) {
        isVoluntary = true;
        category = 'empregado';
      } else if (
        lower.includes('pela empresa') ||
        lower.includes('antecipado pela empresa')
      ) {
        category = 'empresa';
      } else if (
        lower.includes('término de contrato') ||
        lower.includes('termino de contrato') ||
        lower.includes('acordo')
      ) {
        category = 'contrato';
      } else {
        category = 'outros';
      }

      return {
        name,
        count,
        percentage: Number(((count / totalWorkers) * 100).toFixed(1)),
        isVoluntary,
        category,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Clients List
  const clients: ClientStat[] = Object.entries(clientsMap)
    .map(([name, data]) => ({
      name,
      cnpj: data.cnpj,
      rhFocal: data.rhFocal,
      count: data.count,
      percentage: Number(((data.count / totalWorkers) * 100).toFixed(1)),
      totalSalary: data.totalSalary,
    }))
    .sort((a, b) => b.count - a.count);

  // Regioes List
  const regioes = Object.entries(regioesMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      percentage: Number(((data.count / totalWorkers) * 100).toFixed(1)),
      totalSalary: data.totalSalary,
    }))
    .sort((a, b) => b.count - a.count);

  // All Cargos mapped
  const cargosAll: CargoRankingItem[] = Object.entries(cargosMap)
    .map(([name, data]) => ({
      rank: 0,
      name,
      count: data.count,
      avgSalary: data.count > 0 ? data.totalSalary / data.count : 0,
      totalSalary: data.totalSalary,
      percentage: Number(((data.count / totalWorkers) * 100).toFixed(1)),
    }));

  const cargosTop: CargoRankingItem[] = [...cargosAll]
    .sort((a, b) => b.count - a.count || b.totalSalary - a.totalSalary)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // Factual Points
  const factualPoints: FactualPoint[] = [];

  if (modalities.length > 0) {
    const topMod = modalities[0];
    factualPoints.push({
      id: 'modality-main',
      title: `Modalidade Predominante: ${topMod.name}`,
      category: 'Modalidades',
      severity: 'info',
      metric: `${topMod.percentage}% (${topMod.count} registros)`,
      summary: `Concentração de ${topMod.count} colaboradores contratados via "${topMod.name}", representando ${topMod.percentage}% do volume total processado na planilha.`,
    });
  }

  const pedidoEmpregado = motivos.filter((m) => m.isVoluntary).reduce((acc, curr) => acc + curr.count, 0);
  const totalVoluntaryPct = totalWorkers > 0 ? Number(((pedidoEmpregado / totalWorkers) * 100).toFixed(1)) : 0;

  if (pedidoEmpregado > 0) {
    factualPoints.push({
      id: 'turnover-voluntary',
      title: 'Desligamentos por Iniciativa do Empregado',
      category: 'Turnover',
      severity: totalVoluntaryPct > 20 ? 'alert' : 'warning',
      metric: `${totalVoluntaryPct}% (${pedidoEmpregado} saídas)`,
      summary: `Registro de ${pedidoEmpregado} saídas por pedido do próprio empregado (sem justa causa ou antecipação).`,
    });
  }

  const terminoContratoCount = motivos.filter((m) => m.category === 'contrato').reduce((acc, curr) => acc + curr.count, 0);
  if (terminoContratoCount > 0) {
    const termPct = Number(((terminoContratoCount / totalWorkers) * 100).toFixed(1));
    factualPoints.push({
      id: 'turnover-natural',
      title: 'Encerramentos de Contrato de Trabalho',
      category: 'Contratos',
      severity: 'success',
      metric: `${termPct}% (${terminoContratoCount} casos)`,
      summary: `Total de ${terminoContratoCount} contratos finalizados por término de prazo, acordo ou encerramento previsto.`,
    });
  }

  factualPoints.push({
    id: 'financial-payroll',
    title: 'Folha Salarial Bruta de Prestação de Serviço',
    category: 'Financeiro',
    severity: 'info',
    metric: `${formatCurrency(totalPayroll)}`,
    summary: `Média salarial apurada de ${formatCurrency(avgSalary)} por prestador entre os ${totalWorkers} registros analisados.`,
  });

  if (regioes.length > 1) {
    const topReg = regioes[0];
    factualPoints.push({
      id: 'geography-dist',
      title: `Maior Concentração Regional: ${topReg.name}`,
      category: 'Atendimento',
      severity: 'info',
      metric: `${topReg.percentage}% (${topReg.count} prestadores)`,
      summary: `Localidade com maior volume de prestação de serviços com ${topReg.count} profissionais e folha de ${formatCurrency(topReg.totalSalary)}.`,
    });
  }

  const semProrrogacaoCount = totalWithContractDate - prorrogadosCount;
  const vencidosPercentage = totalWithContractDate > 0 ? Number(((vencidosCount / totalWithContractDate) * 100).toFixed(1)) : 0;
  const aVencerPercentage = totalWithContractDate > 0 ? Number(((aVencerCount / totalWithContractDate) * 100).toFixed(1)) : 0;
  const prorrogadosPercentage = totalWithContractDate > 0 ? Number(((prorrogadosCount / totalWithContractDate) * 100).toFixed(1)) : 0;

  if (prorrogadosCount > 0) {
    factualPoints.push({
      id: 'prorrogacao-contratos',
      title: 'Contratos de Prorrogação Registrados',
      category: 'Contratos',
      severity: 'info',
      metric: `${prorrogadosPercentage}% (${prorrogadosCount} contratos)`,
      summary: `${prorrogadosCount} dos ${totalWithContractDate} contratos possuem termo de prorrogação registrado na planilha.`,
    });
  }

  const contractExpirations: ContractExpirationsData = {
    totalWithContractDate,
    vencidosCount,
    aVencerCount,
    prorrogadosCount,
    semProrrogacaoCount,
    vencidosPercentage,
    aVencerPercentage,
    prorrogadosPercentage,
    expirationsList,
  };

  return {
    totalWorkers,
    totalPayroll,
    avgSalary,
    maxSalary,
    modalities,
    motivos,
    clients,
    regioes,
    cargosTop,
    cargosAll,
    yearlyStats,
    factualPoints,
    contractStatus: {
      finished: finishedCount,
      active: activeCount,
      voluntaryTurnoverRate: totalVoluntaryPct,
    },
    contractExpirations,
  };
}
