import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';
import * as XLSX from 'xlsx';

/**
 * POST handler for exporting table data to Excel
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
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Check if multiple tables are provided
    if (body.multipleTables && Array.isArray(body.multipleTables)) {
      // Add each table as a separate worksheet
      body.multipleTables.forEach((table: { data: any[][]; sheetName: string }, index: number) => {
        const ws = XLSX.utils.aoa_to_sheet(table.data);
        XLSX.utils.book_append_sheet(wb, ws, table.sheetName || `Table ${index + 1}`);
      });
    } else {
      // Add single table as a worksheet
      const ws = XLSX.utils.aoa_to_sheet(tableData);
      XLSX.utils.book_append_sheet(wb, ws, 'Extracted Table');
    }
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for Excel download
    const headers = new Headers();
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.append('Content-Disposition', `attachment; filename="table-export-${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    // Return the Excel file
    return new Response(excelBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 