import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

/**
 * POST handler for exporting table data to JSON
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
    
    // Extract headers and rows
    const tableData = body.data;
    const headers = tableData[0] || [];
    const rows = tableData.slice(1) || [];
    
    // Create JSON structure
    const jsonData = rows.map((row: any[]) => {
      const rowObj: Record<string, any> = {};
      
      // Map each cell to its corresponding header
      headers.forEach((header: string, index: number) => {
        if (header) {
          rowObj[header] = row[index] || null;
        }
      });
      
      return rowObj;
    });
    
    // Return the JSON data
    return json({ 
      success: true, 
      data: jsonData,
      meta: {
        rowCount: rows.length,
        columnCount: headers.length,
        headers
      }
    });
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 