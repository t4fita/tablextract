import { arrayToCSV } from './table-utils';

/**
 * Copies text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for browsers that don't support the Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    return false;
  }
}

/**
 * Copies table data to clipboard as CSV
 */
export async function copyTableAsCSV(data: any[][]): Promise<boolean> {
  const csv = arrayToCSV(data);
  return copyToClipboard(csv);
}

/**
 * Copies table data to clipboard as TSV (Tab-Separated Values)
 */
export async function copyTableAsTSV(data: any[][]): Promise<boolean> {
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
  
  return copyToClipboard(tsv);
}

/**
 * Copies table data to clipboard as Markdown table
 */
export async function copyTableAsMarkdown(data: any[][]): Promise<boolean> {
  if (data.length === 0) return false;
  
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
  
  return copyToClipboard(rows.join('\n'));
}

/**
 * Copies table data to clipboard as HTML table
 */
export async function copyTableAsHTML(data: any[][]): Promise<boolean> {
  if (data.length === 0) return false;
  
  let html = '<table>\n';
  
  // Add header row
  html += '  <thead>\n    <tr>\n';
  for (const cell of data[0]) {
    html += `      <th>${escapeHTML(cell)}</th>\n`;
  }
  html += '    </tr>\n  </thead>\n';
  
  // Add data rows
  html += '  <tbody>\n';
  for (let i = 1; i < data.length; i++) {
    html += '    <tr>\n';
    for (const cell of data[i]) {
      html += `      <td>${escapeHTML(cell)}</td>\n`;
    }
    html += '    </tr>\n';
  }
  html += '  </tbody>\n</table>';
  
  return copyToClipboard(html);
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