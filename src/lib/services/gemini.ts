/**
 * Service for interacting with the Google Gemini 2.0 Flash API
 * This is a placeholder implementation that will be expanded in Phase 2
 */

import { PUBLIC_GEMINI_API_KEY } from '$env/static/public';
import { fileToBase64 } from '$lib/utils/file-utils';

// Define the response type for table extraction
export type TableExtractionResult = {
  success: boolean;
  data?: {
    headers: string[];
    rows: string[][];
    tables?: Array<{
      headers: string[];
      rows: string[][];
      title?: string;
    }>;
  };
  error?: string;
  rawResponse?: any; // For debugging purposes
};

// Define the Gemini API request type
type GeminiRequest = {
  contents: {
    parts: {
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }[];
  }[];
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
};

/**
 * Make a request to the Gemini API with retry logic
 * @param modelVersion The Gemini model version to use
 * @param request The request body
 * @param maxRetries Maximum number of retry attempts
 * @param retryDelay Delay between retries in ms
 * @returns The API response
 */
async function callGeminiAPI(
  modelVersion: string,
  request: GeminiRequest,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        }
      );
      
      // If we get a rate limit error (429) or server error (5xx), retry
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`Gemini API returned ${response.status}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`API call attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Only retry on network errors
      if (attempt < maxRetries - 1) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to call Gemini API after multiple attempts');
}

/**
 * Parse the Gemini API response to extract table data
 * @param responseText The text response from Gemini API
 * @returns Parsed table data
 */
function parseTableData(responseText: string): { headers: string[]; rows: string[][]; tables?: Array<{ headers: string[]; rows: string[][]; title?: string; headerPosition?: string }> } {
  // Try to extract JSON from the response
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                    responseText.match(/```([\s\S]*?)```/) ||
                    responseText.match(/\{[\s\S]*\}/);
                    
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Gemini API response');
  }
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  let tableData;
  
  try {
    // Try to parse the JSON
    tableData = JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('JSON string:', jsonStr);
    
    // Try to fix common JSON parsing issues
    try {
      // Try to fix truncated JSON by adding missing closing brackets
      let fixedJson = jsonStr;
      
      // Count opening and closing braces/brackets
      const openBraces = (fixedJson.match(/\{/g) || []).length;
      const closeBraces = (fixedJson.match(/\}/g) || []).length;
      const openBrackets = (fixedJson.match(/\[/g) || []).length;
      const closeBrackets = (fixedJson.match(/\]/g) || []).length;
      
      // Add missing closing braces/brackets
      for (let i = 0; i < openBraces - closeBraces; i++) {
        fixedJson += '}';
      }
      
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        fixedJson += ']';
      }
      
      // Try parsing again with fixed JSON
      tableData = JSON.parse(fixedJson);
    } catch (fixError) {
      // If still failing, try a more aggressive approach
      try {
        // Check if we have a tables array that's truncated
        if (jsonStr.includes('"tables":') && jsonStr.includes('"title":')) {
          // Extract the first table completely
          const tableMatch = jsonStr.match(/"title":\s*"([^"]+)",\s*"headerPosition":\s*"([^"]+)",\s*"headers":\s*\[(.*?)\],\s*"rows":\s*\[(.*?)(?:\]\s*\}|\]\s*\}\s*\])/s);
          
          if (tableMatch) {
            const title = tableMatch[1];
            const headerPosition = tableMatch[2];
            const headersStr = `[${tableMatch[3]}]`;
            
            // For rows, we need to be more careful as they might be truncated
            let rowsStr = tableMatch[4];
            
            // Count opening and closing brackets to check if rows are complete
            const openBrackets = (rowsStr.match(/\[/g) || []).length;
            const closeBrackets = (rowsStr.match(/\]/g) || []).length;
            
            // If rows are truncated, try to extract as many complete rows as possible
            if (openBrackets > closeBrackets) {
              // Find the last complete row
              const rowMatches = rowsStr.match(/\[([^\[\]]*?)\]/g);
              if (rowMatches && rowMatches.length > 0) {
                rowsStr = rowMatches.join(',');
              } else {
                throw new Error('Could not extract complete rows');
              }
            }
            
            // Parse the headers and rows
            const headers = JSON.parse(headersStr);
            const rows = JSON.parse(`[${rowsStr}]`);
            
            return {
              headers,
              rows,
              tables: [{
                title,
                headerPosition,
                headers,
                rows
              }]
            };
          }
        }
        
        // Try to extract just the headers and rows
        const firstTableMatch = jsonStr.match(/"headers"\s*:\s*\[(.*?)\],\s*"rows"\s*:\s*\[(.*?)(?:\]\s*\}|\]\s*\}\s*\])/s);
        if (firstTableMatch) {
          const headersStr = `[${firstTableMatch[1]}]`;
          
          // For rows, extract as many complete rows as possible
          let rowsStr = firstTableMatch[2];
          const rowMatches = rowsStr.match(/\[([^\[\]]*?)\]/g);
          if (rowMatches && rowMatches.length > 0) {
            rowsStr = rowMatches.join(',');
          }
          
          const headers = JSON.parse(headersStr);
          const rows = JSON.parse(`[${rowsStr}]`);
          
          return { headers, rows };
        }
      } catch (extractError) {
        console.error('Error extracting table data:', extractError);
      }
      
      throw new Error('Invalid JSON format in Gemini API response');
    }
  }
  
  // Check for multiple tables format
  if (tableData.tables && Array.isArray(tableData.tables)) {
    // Multiple tables format
    if (!tableData.tables.every((table: any) => 
      table.headers && Array.isArray(table.headers) && 
      table.rows && Array.isArray(table.rows)
    )) {
      throw new Error('Invalid multiple tables format in Gemini API response');
    }
    
    // Use the first table as the main data and keep the full tables array
    return {
      headers: tableData.tables[0].headers,
      rows: tableData.tables[0].rows,
      tables: tableData.tables
    };
  } else {
    // Single table format
    if (!tableData.headers || !Array.isArray(tableData.headers) || 
        !tableData.rows || !Array.isArray(tableData.rows)) {
      throw new Error('Invalid table data format in Gemini API response');
    }
    
    return tableData;
  }
}

/**
 * Extract table data from an image or document
 * @param file The file to extract table data from
 * @param options Additional extraction options
 */
export async function extractTableFromFile(
  file: File,
  options: {
    extractionHints?: string;
    modelVersion?: string;
  } = {}
): Promise<TableExtractionResult> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Content = base64Data.split(',')[1];
    
    // Prepare the prompt
    let promptText = "Extract all data from this table into a structured JSON format. ";
    promptText += "If there are multiple tables, return them as an array of tables in the format: { 'tables': [{ 'title': 'Table 1', 'headers': [...], 'rows': [...] }, ...] }. ";
    promptText += "If there is only one table, return it in the format: { 'headers': [...], 'rows': [...] }. ";
    promptText += "Important: Not all tables have headers in the top row. If you detect that the table doesn't have headers, return an empty array for 'headers' and put all data in 'rows'. ";
    promptText += "If the headers appear to be in the leftmost column instead of the top row, still use the standard format but make a note of this in a 'headerPosition' field with value 'left'. ";
    promptText += "For large documents, focus on extracting the most important tables first. ";
    promptText += "Ensure your JSON response is complete and properly formatted. ";
    
    if (options.extractionHints) {
      promptText += `Additional context: ${options.extractionHints}`;
    }
    
    // Prepare the request
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: file.type,
                data: base64Content
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096 // Increased from 2048 to handle larger responses
      }
    };
    
    // Call the Gemini API with retry logic
    const modelVersion = options.modelVersion || 'gemini-2.0-flash';
    const response = await callGeminiAPI(modelVersion, request);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the table data from the response
    const content = data.candidates?.[0]?.content;
    if (!content) {
      throw new Error('No content in Gemini API response');
    }
    
    const text = content.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini API response');
    }
    
    // Parse the table data
    const tableData = parseTableData(text);
    
    return {
      success: true,
      data: tableData,
      rawResponse: data // Include raw response for debugging
    };
  } catch (error) {
    console.error('Error extracting table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extract table data from text (e.g., pasted content)
 * @param text The text to extract table data from
 * @param options Additional extraction options
 */
export async function extractTableFromText(
  text: string,
  options: {
    extractionHints?: string;
    modelVersion?: string;
  } = {}
): Promise<TableExtractionResult> {
  try {
    // Prepare the prompt
    let promptText = "Extract all data from this text that appears to be in a table format into a structured JSON format. ";
    promptText += "If there are multiple tables, return them as an array of tables in the format: { 'tables': [{ 'title': 'Table 1', 'headers': [...], 'rows': [...] }, ...] }. ";
    promptText += "If there is only one table, return it in the format: { 'headers': [...], 'rows': [...] }. ";
    promptText += "Important: Not all tables have headers in the top row. If you detect that the table doesn't have headers, return an empty array for 'headers' and put all data in 'rows'. ";
    promptText += "If the headers appear to be in the leftmost column instead of the top row, still use the standard format but make a note of this in a 'headerPosition' field with value 'left'. ";
    promptText += "For large documents, focus on extracting the most important tables first. ";
    promptText += "Ensure your JSON response is complete and properly formatted. ";
    
    if (options.extractionHints) {
      promptText += `Additional context: ${options.extractionHints}`;
    }
    
    // Prepare the request
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: promptText },
            { text: text }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096 // Increased from 2048 to handle larger responses
      }
    };
    
    // Call the Gemini API with retry logic
    const modelVersion = options.modelVersion || 'gemini-2.0-flash';
    const response = await callGeminiAPI(modelVersion, request);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the table data from the response
    const content = data.candidates?.[0]?.content;
    if (!content) {
      throw new Error('No content in Gemini API response');
    }
    
    const responseText = content.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('No text in Gemini API response');
    }
    
    // Parse the table data
    const tableData = parseTableData(responseText);
    
    return {
      success: true,
      data: tableData,
      rawResponse: data // Include raw response for debugging
    };
  } catch (error) {
    console.error('Error extracting table from text:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Extract table data from a clipboard paste event
 * This handles both text and image data from clipboard
 * @param clipboardData The clipboard data from a paste event
 * @param options Additional extraction options
 */
export async function extractTableFromClipboard(
  clipboardData: DataTransfer,
  options: {
    extractionHints?: string;
    modelVersion?: string;
  } = {}
): Promise<TableExtractionResult> {
  try {
    // Check if there are any files (images) in the clipboard
    if (clipboardData.files.length > 0) {
      const file = clipboardData.files[0];
      // If it's an image, use the file extraction method
      if (file.type.startsWith('image/')) {
        return extractTableFromFile(file, options);
      }
    }
    
    // Otherwise, try to get text content
    const text = clipboardData.getData('text');
    if (text) {
      return extractTableFromText(text, options);
    }
    
    throw new Error('No valid content found in clipboard');
  } catch (error) {
    console.error('Error extracting table from clipboard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
} 