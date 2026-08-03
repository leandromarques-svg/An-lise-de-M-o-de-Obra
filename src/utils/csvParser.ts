import Papa from 'papaparse';
import { CsvDataset, CsvRow, ColumnMeta } from '../types';

/**
 * Smart file reader supporting UTF-8 (with or without BOM) and ISO-8859-1 / Windows-1252.
 */
export function readCsvFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve('');
        return;
      }

      // Try UTF-8 decoding first
      try {
        const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
        const text = utf8Decoder.decode(buffer);
        // If text decoded cleanly without replacement characters
        if (!text.includes('\uFFFD')) {
          resolve(text);
          return;
        }
      } catch {
        // UTF-8 failed, proceed to ISO-8859-1 / Windows-1252
      }

      // Fallback to Windows-1252 / ISO-8859-1 (common Portuguese Excel format)
      try {
        const isoDecoder = new TextDecoder('windows-1252');
        const text = isoDecoder.decode(buffer);
        resolve(text);
      } catch {
        // Final fallback: standard read as text
        const fallbackReader = new FileReader();
        fallbackReader.onload = (evt) => resolve((evt.target?.result as string) || '');
        fallbackReader.readAsText(file);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

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
 * Helper to retrieve row values matching various possible key aliases (case & accent insensitive)
 */
export function getRowValue(row: CsvRow, ...possibleKeys: string[]): string {
  if (!row) return '';

  // 1. Exact key match
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }

  // 2. Normalized key match (case & accent insensitive)
  const rowEntries = Object.entries(row);
  for (const key of possibleKeys) {
    const normKey = normalizeStr(key);
    for (const [rKey, rVal] of rowEntries) {
      if (normalizeStr(rKey) === normKey) {
        if (rVal !== undefined && rVal !== null && String(rVal).trim() !== '') {
          return String(rVal).trim();
        }
      }
    }
  }

  return '';
}

function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
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
 * Clean a string by removing BOM, non-breaking spaces, and outer quotes.
 */
function cleanString(str: string): string {
  if (!str) return '';
  let cleaned = str
    .replace(/^\uFEFF/, '') // Byte order mark
    .replace(/\u200B/g, '')  // Zero-width space
    .replace(/\u00A0/g, ' ') // Non-breaking space
    .trim();

  // Strip enclosing quotes if any residual
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  return cleaned;
}

/**
 * Pre-process raw CSV text to skip non-tabular header lines if present
 */
function prepareRawContent(content: string): string {
  let cleaned = content.replace(/^\uFEFF/, '').trim();
  const lines = cleaned.split(/\r\n|\n|\r/);

  // If there are multiple lines and line 0 has no delimiter (;, \t, |) but line 1 has delimiters, skip line 0
  if (lines.length > 1) {
    const line0HasDelim = /[;,\t|]/.test(lines[0]);
    const line1HasDelim = /[;,\t|]/.test(lines[1]);
    if (!line0HasDelim && line1HasDelim) {
      cleaned = lines.slice(1).join('\n').trim();
    }
  }
  return cleaned;
}

/**
 * Parse raw CSV text string into a CsvDataset with multi-delimiter fallback
 */
export function parseCsvString(content: string, filename: string = 'dados.csv'): CsvDataset {
  const preparedContent = prepareRawContent(content);

  // Candidate delimiters to try if default auto-detect fails
  const candidateDelimiters = ['', ';', ',', '\t', '|'];

  let bestResult: Papa.ParseResult<Record<string, string>> | null = null;
  let maxHeaderCount = 0;

  for (const delim of candidateDelimiters) {
    const config: Papa.ParseConfig = {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      transformHeader: (header) => cleanString(header),
    };

    if (delim) {
      config.delimiter = delim;
    }

    const res = Papa.parse<Record<string, string>>(preparedContent, config);
    const fields = (res.meta.fields || []).map((f) => cleanString(f)).filter(Boolean);

    // If this parse attempt yielded more distinct headers, keep it
    if (fields.length > maxHeaderCount) {
      maxHeaderCount = fields.length;
      bestResult = res;
    }

    // If auto-detect gave us 2+ columns, it's good
    if (!delim && fields.length > 1) {
      bestResult = res;
      break;
    }
  }

  const result = bestResult || Papa.parse<Record<string, string>>(preparedContent, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    transformHeader: (header) => cleanString(header),
  });

  const rawHeaders = result.meta.fields || [];
  const headers = rawHeaders.map((h) => cleanString(h)).filter(Boolean);

  // Clean row data
  const rows: CsvRow[] = [];
  (result.data || []).forEach((row) => {
    const cleanRow: CsvRow = {};
    let hasAnyValue = false;

    headers.forEach((h) => {
      let val = row[h];
      if (val !== undefined && val !== null) {
        val = cleanString(String(val));
      } else {
        val = '';
      }
      cleanRow[h] = val;
      if (val !== '') {
        hasAnyValue = true;
      }
    });

    if (hasAnyValue) {
      rows.push(cleanRow);
    }
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

