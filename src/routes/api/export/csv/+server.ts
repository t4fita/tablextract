import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

/**
 * POST handler for exporting table data to CSV
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
    
    // Convert to CSV
    const csvContent = tableData.map((row: any[]) => {
      return row.map(cell => {
        // Handle special characters in CSV
        if (cell === null || cell === undefined) {
          return '';
        }
        
        const cellStr = String(cell);
        
        // If cell contains commas, quotes, or newlines, wrap in quotes and escape quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        
        return cellStr;
      }).join(',');
    }).join('\n');
    
    // Set headers for CSV download
    const headers = new Headers();
    headers.append('Content-Type', 'text/csv');
    headers.append('Content-Disposition', `attachment; filename="table-export-${new Date().toISOString().split('T')[0]}.csv"`);
    
    // Return the CSV content
    return new Response(csvContent, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 