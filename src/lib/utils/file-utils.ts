/**
 * Utility functions for handling file operations
 */

// Allowed file types for table extraction
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel XLSX
  'application/vnd.ms-excel', // Excel XLS
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word DOCX
  'application/msword', // Word DOC
  'text/csv',
];

// File extensions for display
export const FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg, .jpeg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/tiff': '.tiff, .tif',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/csv': '.csv',
};

// Default max file size (10MB)
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates a file based on type and size
 */
export function validateFile(
  file: File, 
  allowedTypes: string[] = ALLOWED_FILE_TYPES, 
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not supported.`);
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    errors.push(`File size exceeds the maximum allowed size (${maxSizeMB}MB).`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Converts a File to a data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Checks if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Checks if a file is a document (PDF, Word, Excel, etc.)
 */
export function isDocumentFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword' ||
    file.type === 'text/csv'
  );
}

/**
 * Convert a File to a base64 string
 * @param file The file to convert
 * @returns A Promise that resolves to the base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Generate a unique filename
 * @param originalFilename The original filename
 * @returns A unique filename with the same extension
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomString}.${extension}`;
} 