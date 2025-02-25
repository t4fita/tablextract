/**
 * Converts a 2D array to CSV format
 */
export function arrayToCSV(data: any[][]): string {
  return data.map(row => 
    row.map(cell => {
      // Handle cells with commas, quotes, or newlines
      if (cell === null || cell === undefined) {
        return '';
      }
      
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        // Escape quotes and wrap in quotes
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
}

/**
 * Parses CSV string to a 2D array
 */
export function csvToArray(csv: string): any[][] {
  const rows = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of cell
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
      // End of row
      if (char === '\r') {
        i++; // Skip the next \n
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      // Regular character
      currentCell += char;
    }
  }
  
  // Add the last cell and row if there's any
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Converts a 2D array to JSON format
 */
export function arrayToJSON(data: any[][], headers?: string[]): any[] {
  if (data.length === 0) return [];
  
  // If headers are not provided, use the first row as headers
  const headerRow = headers || data[0];
  const jsonData = [];
  
  // Start from index 1 if the first row is used as headers
  const startIndex = headers ? 0 : 1;
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    const jsonRow: Record<string, any> = {};
    
    for (let j = 0; j < headerRow.length; j++) {
      const header = headerRow[j];
      jsonRow[header] = row[j];
    }
    
    jsonData.push(jsonRow);
  }
  
  return jsonData;
}

/**
 * Converts JSON data to a 2D array
 */
export function jsonToArray(json: any[]): any[][] {
  if (json.length === 0) return [];
  
  // Extract all unique keys from the JSON objects
  const keys = Array.from(
    new Set(
      json.flatMap(obj => Object.keys(obj))
    )
  );
  
  // Create the header row
  const result: any[][] = [keys];
  
  // Add data rows
  for (const item of json) {
    const row = keys.map(key => item[key] ?? '');
    result.push(row);
  }
  
  return result;
}

/**
 * Detects if the first row of a 2D array contains headers
 * This is a heuristic and may not be 100% accurate
 */
export function detectHeaders(data: any[][]): boolean {
  if (data.length < 2) return false;
  
  const firstRow = data[0];
  const secondRow = data[1];
  
  // Check if the first row has a different type pattern than the second row
  let differentTypes = 0;
  
  for (let i = 0; i < Math.min(firstRow.length, secondRow.length); i++) {
    const firstType = typeof firstRow[i];
    const secondType = typeof secondRow[i];
    
    if (firstType !== secondType) {
      differentTypes++;
    }
  }
  
  // If more than 50% of columns have different types, likely headers
  if (differentTypes / firstRow.length > 0.5) {
    return true;
  }
  
  // Check if the first row contains string values that look like headers
  // (shorter, more likely to be all strings)
  const firstRowAllStrings = firstRow.every(cell => 
    typeof cell === 'string' || cell instanceof String
  );
  
  const secondRowHasNonStrings = secondRow.some(cell => 
    typeof cell !== 'string' && !(cell instanceof String)
  );
  
  return firstRowAllStrings && secondRowHasNonStrings;
}

/**
 * Infers column types from data
 */
export function inferColumnTypes(data: any[][], hasHeaders: boolean = true): string[] {
  if (data.length === 0) return [];
  
  const startRow = hasHeaders ? 1 : 0;
  if (data.length <= startRow) return Array(data[0].length).fill('string');
  
  const columnCount = data[0].length;
  const types: string[] = Array(columnCount).fill('string');
  
  for (let col = 0; col < columnCount; col++) {
    let isNumber = true;
    let isDate = true;
    let isBoolean = true;
    
    for (let row = startRow; row < data.length; row++) {
      const value = data[row][col];
      
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      // Check if value is a number
      if (isNumber && isNaN(Number(value))) {
        isNumber = false;
      }
      
      // Check if value is a date
      if (isDate) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          isDate = false;
        }
      }
      
      // Check if value is a boolean
      if (isBoolean) {
        const lowerValue = String(value).toLowerCase();
        if (lowerValue !== 'true' && lowerValue !== 'false' && 
            lowerValue !== '1' && lowerValue !== '0' && 
            lowerValue !== 'yes' && lowerValue !== 'no') {
          isBoolean = false;
        }
      }
      
      // If all type checks have failed, no need to continue
      if (!isNumber && !isDate && !isBoolean) {
        break;
      }
    }
    
    // Assign the type based on checks
    if (isBoolean) {
      types[col] = 'boolean';
    } else if (isNumber) {
      types[col] = 'number';
    } else if (isDate) {
      types[col] = 'date';
    }
  }
  
  return types;
} 