import type { PreparedExportRequest } from '@/services/insights/types';

export type RenderedPreparedExportFile = {
  fileLabel: string;
  mimeType: string;
  content: string | Uint8Array;
};

function escapeCsvField(value: string | null): string {
  const normalizedValue = value ?? '';

  if (/[,"\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`;
  }

  return normalizedValue;
}

function createCsvLine(values: ReadonlyArray<string | null>): string {
  return values.map(escapeCsvField).join(',');
}

function renderSummaryCsv(request: PreparedExportRequest): string {
  if (request.document.kind !== 'SUMMARY') {
    throw new Error('Expected a summary document for CSV summary export.');
  }

  let rowOrder = 1;
  const rows = [
    createCsvLine(['section', 'label', 'value', 'emphasis', 'rowOrder']),
    createCsvLine(['Meta', 'Covered period', request.coveredRangeLabel, 'CONTEXT', `${rowOrder++}`]),
    createCsvLine(['Meta', 'Timezone', request.timezoneLabel, 'CONTEXT', `${rowOrder++}`]),
  ];

  request.document.sections.forEach((section) => {
    if (section.summary) {
      rows.push(
        createCsvLine([section.title, 'Summary', section.summary, 'CONTEXT', `${rowOrder++}`]),
      );
    }

    section.rows.forEach((row) => {
      rows.push(
        createCsvLine([section.title, row.label, row.value, row.emphasis, `${rowOrder++}`]),
      );
    });
  });

  request.document.limitationNotes.forEach((note, index) => {
    rows.push(
      createCsvLine([
        'Limitations',
        `Note ${index + 1}`,
        note,
        'CONTEXT',
        `${rowOrder++}`,
      ]),
    );
  });

  return rows.join('\n');
}

function renderEventLedgerCsv(request: PreparedExportRequest): string {
  if (request.document.kind !== 'EVENT_LEDGER') {
    throw new Error('Expected an event-ledger document for CSV event-ledger export.');
  }

  const rows = [
    createCsvLine([
      'timestamp',
      'timezone',
      'eventClass',
      'eventLabel',
      'account',
      'symbol',
      'strategy',
      'alignment',
      'certainty',
      'price',
      'percentChange',
    ]),
  ];

  request.document.rows.forEach((row) => {
    rows.push(
      createCsvLine([
        row.timestampLabel,
        row.timezoneLabel,
        row.eventClass,
        row.eventLabel,
        row.accountLabel,
        row.symbol,
        row.strategyLabel,
        row.alignmentLabel,
        row.certaintyLabel,
        row.priceLabel,
        row.percentChangeLabel,
      ]),
    );
  });

  return rows.join('\n');
}

function normalizePdfText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?');
}

function escapePdfText(value: string): string {
  return normalizePdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(value: string, maxLength = 88): string[] {
  if (value.length <= maxLength) {
    return [value];
  }

  const words = value.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;

    if (candidate.length <= maxLength) {
      currentLine = candidate;
      return;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

function createSummaryPdfLines(request: PreparedExportRequest): string[] {
  if (request.document.kind !== 'SUMMARY') {
    throw new Error('Expected a summary document for PDF summary export.');
  }

  const lines: string[] = [request.title, ''];

  if (request.coveredRangeLabel) {
    lines.push(request.coveredRangeLabel);
  }

  lines.push(`Timezone: ${request.timezoneLabel}`, '');

  request.document.sections.forEach((section) => {
    lines.push(section.title);

    if (section.summary) {
      lines.push(section.summary);
    }

    section.rows.forEach((row) => {
      lines.push(`- ${row.label}: ${row.value}`);
    });

    lines.push('');
  });

  if (request.document.limitationNotes.length > 0) {
    lines.push('Limitation notes');
    request.document.limitationNotes.forEach((note) => {
      lines.push(`- ${note}`);
    });
    lines.push('');
  }

  if (request.document.journalReference) {
    lines.push(request.document.journalReference.title);

    if (request.document.journalReference.linkageLabel) {
      lines.push(request.document.journalReference.linkageLabel);
    }

    if (request.document.journalReference.updatedAtLabel) {
      lines.push(request.document.journalReference.updatedAtLabel);
    }

    lines.push(request.document.journalReference.body);
  }

  return lines.flatMap((line) => (line.length === 0 ? [''] : wrapText(line)));
}

function createPdfBytes(lines: ReadonlyArray<string>): Uint8Array {
  const maxLinesPerPage = 42;
  const pageGroups: string[][] = [];

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pageGroups.push(lines.slice(index, index + maxLinesPerPage));
  }

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pageIds: number[] = [];

  pageGroups.forEach((pageLines, pageIndex) => {
    const pageId = 4 + pageIndex * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const streamLines = pageLines
      .map((line) => `(${escapePdfText(line)}) Tj`)
      .join('\nT*\n');
    const stream = `BT\n/F1 12 Tf\n50 742 Td\n14 TL\n${streamLines}\nET`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Count ${pageGroups.length} /Kids [${pageIds
    .map((pageId) => `${pageId} 0 R`)
    .join(' ')}] >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function createFallbackFileLabel(request: PreparedExportRequest): string {
  return request.format === 'PDF_SUMMARY'
    ? 'reflection-summary.pdf'
    : request.format === 'CSV_SUMMARY'
      ? 'reflection-summary.csv'
      : 'event-ledger.csv';
}

export function renderPreparedExportFile(
  request: PreparedExportRequest,
): RenderedPreparedExportFile {
  const fileLabel =
    request.dispatchAvailability.status === 'AVAILABLE'
      ? request.dispatchAvailability.fileLabel
      : createFallbackFileLabel(request);

  switch (request.format) {
    case 'PDF_SUMMARY':
      return {
        fileLabel,
        mimeType: 'application/pdf',
        content: createPdfBytes(createSummaryPdfLines(request)),
      };
    case 'CSV_SUMMARY':
      return {
        fileLabel,
        mimeType: 'text/csv',
        content: renderSummaryCsv(request),
      };
    case 'CSV_EVENT_LEDGER':
      return {
        fileLabel,
        mimeType: 'text/csv',
        content: renderEventLedgerCsv(request),
      };
    default:
      throw new Error(`Unsupported export format: ${request.format}`);
  }
}
