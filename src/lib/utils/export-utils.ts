import { arrayToCSV, arrayToJSON } from './table-utils';
import * as XLSX from 'xlsx';

/**
 * Exports table data to a CSV file
 */
export function exportToCSV(data: any[][], filename: string = 'table-export.csv'): void {
  const csv = arrayToCSV(data);
  downloadFile(csv, filename, 'text/csv');
}

/**
 * Exports table data to a TSV file
 */
export function exportToTSV(data: any[][], filename: string = 'table-export.tsv'): void {
  const tsv = data.map(row => 
    row.map(cell => {
      if (cell === null || cell === undefined) {
        return '';
      }
      
      const cellStr = String(cell);
      // Escape tabs and newlines
      return cellStr.replace(/\t/g, ' ').replace(/\n/g, ' ');
    }).join('\t')
  ).join('\n');
  
  downloadFile(tsv, filename, 'text/tab-separated-values');
}

/**
 * Exports data to a JSON file
 * @param data The data to export (can be array of arrays or any JSON-serializable object)
 * @param filename The filename for the downloaded file
 * @param headers Optional headers if exporting array data with column names
 */
export function exportToJSON(data: any, filename: string = 'table-export.json', headers?: string[]): void {
  if (!data) {
    console.error('No data to export');
    return;
  }
  
  try {
    let jsonContent: string;
    
    // Handle array of arrays (table data)
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      const json = arrayToJSON(data, headers);
      jsonContent = JSON.stringify(json, null, 2);
    } else {
      // Handle any other JSON-serializable data
      jsonContent = JSON.stringify(data, null, 2);
    }
    
    downloadFile(jsonContent, filename, 'application/json');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export to JSON');
  }
}

/**
 * Exports table data to an Excel file (XLSX)
 * Note: This requires a library like SheetJS/xlsx to work properly
 */
export function exportToExcel(data: any[][], filename: string = 'table-export.xlsx', sheetName: string = 'Table Data'): void {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Exports table data to an HTML file
 */
export function exportToHTML(data: any[][], filename: string = 'table-export.html', title: string = 'Table Export'): void {
  if (data.length === 0) return;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
    th, td { padding: 0.5rem; text-align: left; }
    th { background-color: #f8f9fa; font-weight: 600; border-bottom: 2px solid #dee2e6; }
    td { border-bottom: 1px solid #dee2e6; }
    tr:nth-child(even) { background-color: #f8f9fa; }
  </style>
</head>
<body>
  <h1>${escapeHTML(title)}</h1>
  <table>
    <thead>
      <tr>`;
  
  // Add header row
  for (const cell of data[0]) {
    html += `\n        <th>${escapeHTML(cell)}</th>`;
  }
  
  html += `\n      </tr>
    </thead>
    <tbody>`;
  
  // Add data rows
  for (let i = 1; i < data.length; i++) {
    html += '\n      <tr>';
    for (const cell of data[i]) {
      html += `\n        <td>${escapeHTML(cell)}</td>`;
    }
    html += '\n      </tr>';
  }
  
  html += `\n    </tbody>
  </table>
</body>
</html>`;
  
  downloadFile(html, filename, 'text/html');
}

/**
 * Exports table data to a Markdown file
 */
export function exportToMarkdown(data: any[][], filename: string = 'table-export.md', title: string = 'Table Export'): void {
  if (data.length === 0) return;
  
  let markdown = `# ${title}\n\n`;
  
  // Create table rows
  const rows = data.map(row => 
    '| ' + row.map(cell => {
      if (cell === null || cell === undefined) {
        return '';
      }
      
      const cellStr = String(cell);
      // Escape pipe characters
      return cellStr.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    }).join(' | ') + ' |'
  );
  
  // Add header separator after first row
  rows.splice(1, 0, '| ' + data[0].map(() => '---').join(' | ') + ' |');
  
  markdown += rows.join('\n');
  
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Downloads a file with the given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Downloads a Blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  // Create a download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  
  // Append to the document temporarily
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Escapes HTML special characters
 */
function escapeHTML(text: any): string {
  if (text === null || text === undefined) {
    return '';
  }
  
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export multiple tables to Excel format and trigger download
 * @param tables Array of table data objects
 * @param filename The filename for the downloaded file
 */
export function exportMultipleTablesToExcel(
  tables: Array<{
    data: string[][];
    sheetName?: string;
  }>,
  filename: string
): void {
  if (!tables || !tables.length) {
    console.error('No tables to export');
    return;
  }
  
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Add each table as a separate worksheet
    tables.forEach((table, index) => {
      const sheetName = table.sheetName || `Table ${index + 1}`;
      const ws = XLSX.utils.aoa_to_sheet(table.data);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    // Generate the Excel file and trigger download
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting multiple tables to Excel:', error);
    throw new Error('Failed to export multiple tables to Excel');
  }
} 