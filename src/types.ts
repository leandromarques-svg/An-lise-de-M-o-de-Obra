export interface CsvRow {
  [key: string]: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  column: string | null;
  direction: SortDirection;
}

export interface ColumnFilter {
  column: string;
  value: string;
}

export interface FilterState {
  globalSearch: string;
  statusFilter: 'todos' | 'ativos' | 'desligados';
  vinculoFilter: string;
  cargoFilter: string;
  regiaoFilter: string;
  motivoFilter: string;
  clienteFilter: string;
  selectedClientes?: string[];
  rhFocalFilter: string;
  anoFilter: string;
  mesFilter?: string;
  nomeFilter?: string;
  areaEstrategicaFilter?: string;
  selectedAreas?: string[];
  columnFilters: Record<string, string>;
  minSalary?: number;
  maxSalary?: number;
}

export interface ColumnMeta {
  key: string;
  label: string;
  visible: boolean;
  type: 'text' | 'number' | 'currency' | 'date' | 'email' | 'phone';
}

export interface CsvDataset {
  filename: string;
  rawContent: string;
  headers: string[];
  rows: CsvRow[];
}

export interface SummaryMetrics {
  totalCount: number;
  filteredCount: number;
  totalSalary: number;
  avgSalary: number;
  maxSalary: number;
  minSalary: number;
  topCargos: { cargo: string; count: number }[];
  topRegioes: { regiao: string; count: number }[];
  topMotivos: { motivo: string; count: number }[];
}
