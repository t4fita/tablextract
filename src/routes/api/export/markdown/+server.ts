import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

/**
 * POST handler for exporting table data to Markdown
 */
export const POST = async ({ request }: RequestEvent) => {
  // Get the session from the request
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get request body
    const body = await request.json();
    
    if (!body.data || !Array.isArray(body.data)) {
      return json({ error: 'Invalid data format' }, { status: 400 });
    }
    
    // Extract table data
    const tableData = body.data;
    const title = body.title || 'Extracted Table';
    
    // Generate Markdown content
    let markdownContent = `# ${title}\n\n`;
    
    // Get headers and rows
    const headers = tableData[0] || [];
    const rows = tableData.slice(1) || [];
    
    // Calculate column widths based on content
    let columnWidths: number[] = [];
    
    // Initialize with header widths
    headers.forEach((header: any, index: number) => {
      columnWidths[index] = String(header || '').length;
    });
    
    // Update with row content widths
    rows.forEach((row: any[]) => {
      row.forEach((cell, index) => {
        const cellWidth = String(cell || '').length;
        if (cellWidth > (columnWidths[index] || 0)) {
          columnWidths[index] = cellWidth;
        }
      });
    });
    
    // Add minimum padding
    columnWidths = columnWidths.map(width => Math.max(width, 3) + 2);
    
    // Create header row
    markdownContent += '|';
    headers.forEach((header: any, index: number) => {
      const headerStr = String(header || '');
      const padding = columnWidths[index] - headerStr.length;
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      markdownContent += ' ' + ' '.repeat(leftPad) + headerStr + ' '.repeat(rightPad) + ' |';
    });
    markdownContent += '\n';
    
    // Create separator row
    markdownContent += '|';
    columnWidths.forEach(width => {
      markdownContent += ' ' + '-'.repeat(width) + ' |';
    });
    markdownContent += '\n';
    
    // Create data rows
    rows.forEach((row: any[]) => {
      markdownContent += '|';
      row.forEach((cell, index) => {
        const cellStr = String(cell || '');
        const padding = columnWidths[index] - cellStr.length;
        markdownContent += ' ' + cellStr + ' '.repeat(padding) + ' |';
      });
      markdownContent += '\n';
    });
    
    // Add footer
    markdownContent += `\n*Generated by Tablextract on ${new Date().toLocaleDateString()}*\n`;
    
    // Set headers for Markdown download
    const responseHeaders = new Headers();
    responseHeaders.append('Content-Type', 'text/markdown');
    responseHeaders.append('Content-Disposition', `attachment; filename="table-export-${new Date().toISOString().split('T')[0]}.md"`);
    
    // Return the Markdown content
    return new Response(markdownContent, {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error exporting to Markdown:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 