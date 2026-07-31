import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_CSV_DATA } from './data/defaultCsv';
import {
  parseCsvString,
  detectColumnMeta,
  parseSalaryNumber,
  exportToCsvString,
  downloadFile,
} from './utils/csvParser';
import { computeCsAnalytics, extractYear } from './utils/csAnalytics';
import {
  CsvDataset,
  CsvRow,
  ColumnMeta,
  SortConfig,
  FilterState,
  SummaryMetrics,
} from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { DataTable } from './components/DataTable';
import { DetailModal } from './components/DetailModal';
import { CsvUploaderModal } from './components/CsvUploaderModal';
import { EditRowModal } from './components/EditRowModal';
import { ColumnVisibilityModal } from './components/ColumnVisibilityModal';
import { UploadLandingScreen } from './components/UploadLandingScreen';
import { CsClientDashboard } from './components/CsClientDashboard';
import { Trash2, Check } from 'lucide-react';

export default function App() {
  // Whether the user has uploaded/selected a client dataset or is on landing screen
  const [hasLoadedClient, setHasLoadedClient] = useState<boolean>(false);

  // Active view: 'dashboard' (CS Reunião & Modalidades) or 'table' (Lista Operacional)
  const [activeView, setActiveView] = useState<'dashboard' | 'table'>('dashboard');

  // Main dataset state
  const [dataset, setDataset] = useState<CsvDataset>(() =>
    parseCsvString(DEFAULT_CSV_DATA, 'base_colaboradores_rh.csv')
  );

  // Session history of uploaded client datasets
  const [recentDatasets, setRecentDatasets] = useState<
    { filename: string; date: string; content: string }[]
  >([]);

  // Column metadata (visibility & types)
  const [columns, setColumns] = useState<ColumnMeta[]>(() =>
    detectColumnMeta(dataset.headers, dataset.rows)
  );

  // Whenever dataset headers change, update column meta
  useEffect(() => {
    setColumns(detectColumnMeta(dataset.headers, dataset.rows));
  }, [dataset]);

  // Filtering state
  const [filterState, setFilterState] = useState<FilterState>({
    globalSearch: '',
    statusFilter: 'todos',
    vinculoFilter: '',
    cargoFilter: '',
    regiaoFilter: '',
    motivoFilter: '',
    clienteFilter: '',
    rhFocalFilter: '',
    anoFilter: '',
    columnFilters: {},
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Selection & Modals state
  const [selectedRowIndices, setSelectedRowIndices] = useState<number[]>([]);
  const [activeDetailRow, setActiveDetailRow] = useState<CsvRow | null>(null);
  const [activeEditRowIndex, setActiveEditRowIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Unique filter values
  const uniqueVinculos = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val =
        r['Vínculo Empregatício'] ||
        r['Vinculo Empregaticio'] ||
        r['Modalidade'] ||
        r['Vínculo'] ||
        r['Vinculo'];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueCargos = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val = r['Cargo ou Função'] || r['Cargo'];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueRegioes = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const desc = r['Descrição Região'] || r['Região'] || r['Regiao'];
      if (desc && desc.trim()) set.add(desc.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueMotivos = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val = r['Motivo do Desligamento'] || r['Motivo'];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueClientes = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val =
        r['Grupo Econômico'] ||
        r['Grupo Economico'] ||
        r['Grupo Econômico '] ||
        r['Grupo Economico '] ||
        r['Nome Cliente'] ||
        r['Cliente'];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueRhFocais = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val =
        r['RH Focal'] ||
        r['RH Focal '] ||
        r['Consultor RH'] ||
        r['Responsável'] ||
        r['RH'] ||
        r['Gestor'];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  const uniqueAnos = useMemo(() => {
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const adm = r['Data Admissão'] || r['Data Admissao'] || r['Admissão'];
      const dem = r['Data Demissão'] || r['Data Demissao'] || r['Demissão'];
      const admYear = extractYear(adm);
      const demYear = extractYear(dem);
      if (admYear) set.add(admYear);
      if (demYear) set.add(demYear);
    });
    return Array.from(set).sort().reverse();
  }, [dataset]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return dataset.rows.filter((row) => {
      // 1. Global Search
      if (filterState.globalSearch) {
        const query = filterState.globalSearch.toLowerCase().trim();
        const matchesGlobal = Object.values(row).some((val) =>
          String(val).toLowerCase().includes(query)
        );
        if (!matchesGlobal) return false;
      }

      // 2. Status Filter
      const dem = row['Data Demissão'] || row['Data Demissao'] || row['Demissão'] || row['Demissao'];
      const isDesligado = Boolean(dem && dem.trim().length > 0 && dem.trim() !== '-');
      if (filterState.statusFilter === 'ativos' && isDesligado) return false;
      if (filterState.statusFilter === 'desligados' && !isDesligado) return false;

      // 3. Vínculo Filter
      if (filterState.vinculoFilter) {
        const vinc =
          row['Vínculo Empregatício'] ||
          row['Vinculo Empregaticio'] ||
          row['Modalidade'] ||
          row['Vínculo'] ||
          row['Vinculo'];
        if (vinc !== filterState.vinculoFilter) return false;
      }

      // 4. Cargo Filter
      if (filterState.cargoFilter) {
        const cargo = row['Cargo ou Função'] || row['Cargo'];
        if (cargo !== filterState.cargoFilter) return false;
      }

      // 5. Região Filter
      if (filterState.regiaoFilter) {
        const reg = row['Descrição Região'] || row['Região'] || row['Regiao'];
        if (reg !== filterState.regiaoFilter) return false;
      }

      // 6. Motivo Filter
      if (filterState.motivoFilter) {
        const motivo = row['Motivo do Desligamento'] || row['Motivo'];
        if (motivo !== filterState.motivoFilter) return false;
      }

      // 7. Cliente (Grupo Econômico) Filter
      if (filterState.clienteFilter) {
        const client =
          row['Grupo Econômico'] ||
          row['Grupo Economico'] ||
          row['Grupo Econômico '] ||
          row['Grupo Economico '] ||
          row['Nome Cliente'] ||
          row['Cliente'];
        if (client !== filterState.clienteFilter) return false;
      }

      // 8. RH Focal Filter
      if (filterState.rhFocalFilter) {
        const rh =
          row['RH Focal'] ||
          row['RH Focal '] ||
          row['Consultor RH'] ||
          row['Responsável'] ||
          row['RH'] ||
          row['Gestor'];
        if (rh !== filterState.rhFocalFilter) return false;
      }

      // 9. Ano Filter
      if (filterState.anoFilter) {
        const adm = row['Data Admissão'] || row['Data Admissao'] || row['Admissão'];
        const demDate = row['Data Demissão'] || row['Data Demissao'] || row['Demissão'];
        const admYear = extractYear(adm);
        const demYear = extractYear(demDate);
        if (admYear !== filterState.anoFilter && demYear !== filterState.anoFilter) {
          return false;
        }
      }

      return true;
    });
  }, [dataset, filterState]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortConfig.column) return filteredRows;

    const key = sortConfig.column;
    const colMeta = columns.find((c) => c.key === key);
    const isCurrency = colMeta?.type === 'currency' || key.toLowerCase().includes('salário');

    return [...filteredRows].sort((a, b) => {
      const valA = a[key] || '';
      const valB = b[key] || '';

      if (isCurrency) {
        const numA = parseSalaryNumber(valA);
        const numB = parseSalaryNumber(valB);
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      const cmp = String(valA).localeCompare(String(valB), 'pt-BR', { numeric: true });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortConfig, columns]);

  // Compute CS Analytics for Executive Dashboard
  const csAnalyticsData = useMemo(() => {
    return computeCsAnalytics(filteredRows);
  }, [filteredRows]);

  // Summary Metrics calculation for table view
  const summaryMetrics: SummaryMetrics = useMemo(() => {
    let totalSal = 0;
    let maxSal = 0;
    let minSal = Infinity;
    const cargoMap: Record<string, number> = {};
    const regiaoMap: Record<string, number> = {};
    const motivoMap: Record<string, number> = {};

    sortedRows.forEach((row) => {
      const sal = parseSalaryNumber(row['Salário Base'] || row['Salario Base']);
      totalSal += sal;
      if (sal > maxSal) maxSal = sal;
      if (sal < minSal && sal > 0) minSal = sal;

      const cargo = row['Cargo ou Função'] || row['Cargo'] || 'Não especificado';
      cargoMap[cargo] = (cargoMap[cargo] || 0) + 1;

      const reg = row['Descrição Região'] || row['Região'] || 'Não especificado';
      regiaoMap[reg] = (regiaoMap[reg] || 0) + 1;

      const mot = row['Motivo do Desligamento'] || row['Motivo'] || 'Sem informação';
      motivoMap[mot] = (motivoMap[mot] || 0) + 1;
    });

    const count = sortedRows.length;

    return {
      totalCount: dataset.rows.length,
      filteredCount: count,
      totalSalary: totalSal,
      avgSalary: count > 0 ? totalSal / count : 0,
      maxSalary: maxSal,
      minSalary: minSal === Infinity ? 0 : minSal,
      topCargos: Object.entries(cargoMap)
        .map(([cargo, count]) => ({ cargo, count }))
        .sort((a, b) => b.count - a.count),
      topRegioes: Object.entries(regiaoMap)
        .map(([regiao, count]) => ({ regiao, count }))
        .sort((a, b) => b.count - a.count),
      topMotivos: Object.entries(motivoMap)
        .map(([motivo, count]) => ({ motivo, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [dataset, sortedRows]);

  // Handlers
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev.column === columnKey) {
        return {
          column: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { column: columnKey, direction: 'asc' };
    });
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterState({
      globalSearch: '',
      statusFilter: 'todos',
      vinculoFilter: '',
      cargoFilter: '',
      regiaoFilter: '',
      motivoFilter: '',
      clienteFilter: '',
      rhFocalFilter: '',
      anoFilter: '',
      columnFilters: {},
    });
    setSortConfig({ column: null, direction: 'asc' });
    setCurrentPage(1);
  };

  const handleDatasetUploaded = (rawContent: string, filename: string) => {
    const newDs = parseCsvString(rawContent, filename);
    setDataset(newDs);
    setSelectedRowIndices([]);
    handleResetFilters();
    setHasLoadedClient(true);
    setActiveView('dashboard');

    // Add to session recent datasets
    setRecentDatasets((prev) => [
      {
        filename,
        date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        content: rawContent,
      },
      ...prev.filter((d) => d.filename !== filename).slice(0, 4),
    ]);

    showToast(`Painel CS gerado com sucesso para "${filename}" (${newDs.rows.length} registros).`);
  };

  const handleLoadDemoDataset = () => {
    handleDatasetUploaded(DEFAULT_CSV_DATA, 'hidrovias_exemplo_cs.csv');
  };

  const handleExportCsv = () => {
    const visibleKeys = columns.filter((c) => c.visible).map((c) => c.key);
    const csvStr = exportToCsvString(visibleKeys, sortedRows, ';');
    downloadFile(csvStr, `export_cs_${dataset.filename}`);
    showToast('CSV exportado com sucesso!');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(sortedRows, null, 2);
    downloadFile(jsonStr, `export_cs_${dataset.filename.replace('.csv', '')}.json`, 'application/json');
    showToast('JSON exportado com sucesso!');
  };

  const handleToggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  const handleSelectAllColumns = (visible: boolean) => {
    setColumns((prev) => prev.map((c) => ({ ...c, visible })));
  };

  const handleSaveRow = (row: CsvRow) => {
    if (activeEditRowIndex !== null) {
      const updatedRows = [...dataset.rows];
      updatedRows[activeEditRowIndex] = row;
      setDataset((prev) => ({ ...prev, rows: updatedRows }));
      showToast('Registro atualizado.');
    } else {
      setDataset((prev) => ({ ...prev, rows: [row, ...prev.rows] }));
      showToast('Novo registro adicionado.');
    }
    setIsEditModalOpen(false);
    setActiveEditRowIndex(null);
  };

  const handleDeleteRow = (indexInSorted: number) => {
    const targetRow = sortedRows[indexInSorted];
    if (!targetRow) return;

    if (confirm(`Tem certeza que deseja excluir o registro de "${targetRow['Nome do Funcionário'] || 'selecionado'}"?`)) {
      setDataset((prev) => ({
        ...prev,
        rows: prev.rows.filter((r) => r !== targetRow),
      }));
      showToast('Registro excluído.');
    }
  };

  const handleToggleSelectRow = (indexInSorted: number) => {
    setSelectedRowIndices((prev) =>
      prev.includes(indexInSorted)
        ? prev.filter((i) => i !== indexInSorted)
        : [...prev, indexInSorted]
    );
  };

  const handleToggleSelectAllOnPage = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageIndices = sortedRows
      .slice(startIndex, startIndex + rowsPerPage)
      .map((_, i) => startIndex + i);

    const isAllSelected = pageIndices.every((i) => selectedRowIndices.includes(i));

    if (isAllSelected) {
      setSelectedRowIndices((prev) => prev.filter((i) => !pageIndices.includes(i)));
    } else {
      setSelectedRowIndices((prev) => Array.from(new Set([...prev, ...pageIndices])));
    }
  };

  const handleBulkDelete = () => {
    const rowsToDelete = selectedRowIndices.map((idx) => sortedRows[idx]).filter(Boolean);
    if (rowsToDelete.length === 0) return;

    if (confirm(`Deseja realmente excluir ${rowsToDelete.length} colaborador(es)?`)) {
      setDataset((prev) => ({
        ...prev,
        rows: prev.rows.filter((r) => !rowsToDelete.includes(r)),
      }));
      setSelectedRowIndices([]);
      showToast(`${rowsToDelete.length} registros excluídos.`);
    }
  };

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  // If client data is not loaded yet, show clean Landing Upload Screen
  if (!hasLoadedClient) {
    return (
      <UploadLandingScreen
        onDatasetLoaded={handleDatasetUploaded}
        onLoadDemo={handleLoadDemoDataset}
        recentDatasets={recentDatasets}
        onSelectRecent={(content, filename) => handleDatasetUploaded(content, filename)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xs border border-slate-800 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with CS View switcher & Actions */}
      <Header
        filename={dataset.filename}
        totalRows={dataset.rows.length}
        filteredRows={sortedRows.length}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onResetDefault={() => setHasLoadedClient(false)}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onAddRow={() => {
          setActiveEditRowIndex(null);
          setIsEditModalOpen(true);
        }}
        onOpenColumnConfig={() => setIsColumnConfigOpen(true)}
        visibleColumnCount={visibleColumns.length}
        totalColumnCount={columns.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        
        {/* Global Dashboard & Operational Filter Bar (Matching User Image) */}
        <FilterBar
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          uniqueVinculos={uniqueVinculos}
          uniqueCargos={uniqueCargos}
          uniqueRegioes={uniqueRegioes}
          uniqueMotivos={uniqueMotivos}
          uniqueClientes={uniqueClientes}
          uniqueRhFocais={uniqueRhFocais}
          uniqueAnos={uniqueAnos}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => {
            setRowsPerPage(val);
            setCurrentPage(1);
          }}
          onOpenColumnConfig={() => setIsColumnConfigOpen(true)}
          showTableOptions={activeView === 'table'}
        />

        {/* VIEW 1: EXECUTIVE CS DASHBOARD */}
        {activeView === 'dashboard' ? (
          <CsClientDashboard
            data={csAnalyticsData}
            clientName={dataset.filename.replace('.csv', '').toUpperCase()}
            filename={dataset.filename}
            onOpenUploader={() => setIsUploaderOpen(true)}
            onSwitchToTable={() => setActiveView('table')}
          />
        ) : (
          /* VIEW 2: OPERATIONAL TABLE & FILTERS */
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* KPI Summary Cards */}
            <SummaryCards metrics={summaryMetrics} />

            {/* Bulk Action Banner */}
            {selectedRowIndices.length > 0 && (
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold bg-indigo-600 px-2.5 py-1 rounded-md">
                    {selectedRowIndices.length} selecionados
                  </span>
                  <span>Ações em massa para as linhas marcadas:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-md font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Selecionados
                  </button>
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="flex-1">
              <DataTable
                rows={sortedRows}
                columns={visibleColumns}
                sortConfig={sortConfig}
                onSort={handleSort}
                onSelectRow={(row) => setActiveDetailRow(row)}
                onEditRow={(row, sortedIdx) => {
                  const originalIndex = dataset.rows.indexOf(row);
                  setActiveEditRowIndex(originalIndex >= 0 ? originalIndex : null);
                  setIsEditModalOpen(true);
                }}
                onDeleteRow={handleDeleteRow}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                selectedRowIndices={selectedRowIndices}
                onToggleSelectRow={handleToggleSelectRow}
                onToggleSelectAll={handleToggleSelectAllOnPage}
              />
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-500 text-xs py-4 border-t border-slate-200 text-center mt-8">
        <p>METARH • Quadro de Análise de Prestação de Serviço</p>
      </footer>

      {/* Modals */}
      {activeDetailRow && (
        <DetailModal
          row={activeDetailRow}
          onClose={() => setActiveDetailRow(null)}
          onEdit={(row) => {
            const originalIndex = dataset.rows.indexOf(row);
            setActiveEditRowIndex(originalIndex >= 0 ? originalIndex : null);
            setIsEditModalOpen(true);
          }}
        />
      )}

      {isUploaderOpen && (
        <CsvUploaderModal
          onClose={() => setIsUploaderOpen(false)}
          onApplyDataset={(newDs) => {
            setDataset(newDs);
            setSelectedRowIndices([]);
            handleResetFilters();
            setHasLoadedClient(true);
            setActiveView('dashboard');

            setRecentDatasets((prev) => [
              {
                filename: newDs.filename,
                date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                content: newDs.rawContent,
              },
              ...prev.filter((d) => d.filename !== newDs.filename).slice(0, 4),
            ]);

            showToast(`Cliente "${newDs.filename}" carregado com sucesso.`);
            setIsUploaderOpen(false);
          }}
        />
      )}

      {isEditModalOpen && (
        <EditRowModal
          row={activeEditRowIndex !== null ? dataset.rows[activeEditRowIndex] : null}
          columns={columns}
          onSave={handleSaveRow}
          onClose={() => {
            setIsEditModalOpen(false);
            setActiveEditRowIndex(null);
          }}
        />
      )}

      {isColumnConfigOpen && (
        <ColumnVisibilityModal
          columns={columns}
          onToggleColumn={handleToggleColumn}
          onSelectAllColumns={handleSelectAllColumns}
          onClose={() => setIsColumnConfigOpen(false)}
        />
      )}

    </div>
  );
}
