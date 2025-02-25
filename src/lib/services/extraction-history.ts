/**
 * Service for managing extraction history
 */
import { supabase } from '$lib/supabase';
import type { TableExtractionResult } from './gemini';
import type { Database } from '$lib/database.types';

export type ExtractionRecord = Database['public']['Tables']['extractions']['Row'];

/**
 * Save an extraction result to the user's history
 * @param userId The user ID
 * @param extractionResult The extraction result from the Gemini API
 * @param metadata Additional metadata about the extraction
 * @returns The saved extraction record
 */
export async function saveExtraction(
  userId: string,
  extractionResult: TableExtractionResult,
  metadata: {
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    extractionMethod: 'file' | 'clipboard';
    extractionHints?: string;
  }
): Promise<ExtractionRecord | null> {
  try {
    if (!extractionResult.success || !extractionResult.data) {
      throw new Error('Cannot save unsuccessful extraction');
    }

    const { data, error } = await supabase
      .from('extractions')
      .insert({
        user_id: userId,
        extraction_data: extractionResult.data,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving extraction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to save extraction:', error);
    return null;
  }
}

/**
 * Get extraction history for a user
 * @param userId The user ID
 * @param limit Maximum number of records to return
 * @param offset Offset for pagination
 * @param includeHidden Whether to include hidden records (default: false)
 * @returns Array of extraction records
 */
export async function getExtractionHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  includeHidden: boolean = false
): Promise<ExtractionRecord[]> {
  try {
    let query = supabase
      .from('extractions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Only include visible records unless includeHidden is true
    if (!includeHidden) {
      query = query.eq('visible', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting extraction history:', error);
      return [];
    }
    
    return data as ExtractionRecord[];
  } catch (error) {
    console.error('Error getting extraction history:', error);
    return [];
  }
}

/**
 * Get a single extraction record by ID
 * @param extractionId The extraction ID
 * @param userId The user ID (for security verification)
 * @returns The extraction record if found
 */
export async function getExtraction(
  extractionId: string,
  userId: string
): Promise<ExtractionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('extractions')
      .select('*')
      .eq('id', extractionId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching extraction:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch extraction:', error);
    return null;
  }
}

/**
 * Delete an extraction record
 * @param extractionId The extraction ID
 * @param userId The user ID (for security verification)
 * @returns Whether the deletion was successful
 */
export async function deleteExtraction(
  extractionId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('extractions')
      .delete()
      .eq('id', extractionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting extraction:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete extraction:', error);
    return false;
  }
}

/**
 * Toggle the visibility of extraction records
 * @param extractionIds Array of extraction IDs to toggle visibility
 * @param visible Whether the extractions should be visible or hidden
 * @returns Success status
 */
export async function toggleExtractionsVisibility(
  extractionIds: string[],
  visible: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('extractions')
      .update({ visible })
      .in('id', extractionIds);
    
    if (error) {
      console.error('Error toggling extraction visibility:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling extraction visibility:', error);
    return false;
  }
} 