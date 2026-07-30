import Papa from 'papaparse';
import { CsvDataset, CsvRow, ColumnMeta } from '../types';

/**
 * Normalizes number strings from Brazilian CSV format (e.g., "3944,00" or "5.546,12") to float.
 */
export function parseSalaryNumber(val: string | undefined): number {
  if (!val) return 0;
  let clean = val.trim();
  if (!clean) return 0;
  // Remove currency symbols or unwanted characters except digits, commas, dots, and minus
  clean = clean.replace(/[^0-9,.-]/g, '');
  
  // If format is 3944,00 or 5.546,12 (comma as decimal separator)
  if (clean.includes(',')) {
    // replace thousand dots then replace comma with dot
    clean = clean.replace(/\./g, '').replace(',', '.');
  }
  
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number as Brazilian Real currency
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

/**
 * Detect column types automatically based on values
 */
export function detectColumnMeta(headers: string[], rows: CsvRow[]): ColumnMeta[] {
  return headers.map((header) => {
    const lowerHeader = header.toLowerCase();
    let type: ColumnMeta['type'] = 'text';

    if (lowerHeader.includes('salário') || lowerHeader.includes('salario') || lowerHeader.includes('valor') || lowerHeader.includes('remunera')) {
      type = 'currency';
    } else if (lowerHeader.includes('data') || lowerHeader.includes('vcto') || lowerHeader.includes('admissão') || lowerHeader.includes('demissão')) {
      type = 'date';
    } else if (lowerHeader.includes('e-mail') || lowerHeader.includes('email')) {
      type = 'email';
    } else if (lowerHeader.includes('telefone') || lowerHeader.includes('celular') || lowerHeader.includes('tel')) {
      type = 'phone';
    } else {
      // Check sample rows to see if mostly numbers
      const nonNullSamples = rows
        .map((r) => r[header])
        .filter((val) => val && val.trim() !== '')
        .slice(0, 10);

      if (nonNullSamples.length > 0) {
        const isAllNums = nonNullSamples.every((val) => {
          const num = parseSalaryNumber(val);
          return !isNaN(num) && num !== 0;
        });
        if (isAllNums && (lowerHeader.includes('cód') || lowerHeader.includes('cod') || lowerHeader.includes('id'))) {
          type = 'number';
        }
      }
    }

    return {
      key: header,
      label: header,
      visible: true,
      type,
    };
  });
}

/**
 * Parse raw CSV text string into a CsvDataset
 */
export function parseCsvString(content: string, filename: string = 'dados.csv'): CsvDataset {
  // Use PapaParse
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => header.trim(),
  });

  const headers = result.meta.fields || [];
  
  // Clean row data
  const rows: CsvRow[] = (result.data || []).map((row) => {
    const cleanRow: CsvRow = {};
    headers.forEach((h) => {
      let val = row[h];
      if (typeof val === 'string') {
        val = val.trim();
        // Remove enclosing quotes if any residual
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).trim();
        }
      } else if (val === null || val === undefined) {
        val = '';
      } else {
        val = String(val).trim();
      }
      cleanRow[h] = val;
    });
    return cleanRow;
  });

  return {
    filename,
    rawContent: content,
    headers,
    rows,
  };
}

/**
 * Generate CSV string for export with custom delimiter (default ';')
 */
export function exportToCsvString(headers: string[], rows: CsvRow[], delimiter: string = ';'): string {
  const unparseResult = Papa.unparse(
    {
      fields: headers,
      data: rows,
    },
    {
      delimiter,
      quotes: true,
    }
  );
  return unparseResult;
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType }); // Add BOM for Excel UTF-8 support
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
