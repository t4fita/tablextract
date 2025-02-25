/**
 * Service for tracking and managing user usage
 */
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';
import type { Json } from '$lib/database.types';

export interface UsageData {
  extractionsToday: number;
  lastExtractionDate: string;
  totalExtractions: number;
  extractionHistory: {
    date: string;
    count: number;
  }[];
}

/**
 * Get usage data for a user
 * @param userId The user ID
 * @returns Usage data
 */
export async function getUserUsage(userId: string): Promise<UsageData | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('usage_data')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching usage data:', error);
      return null;
    }

    if (!data || !data.usage_data) {
      // Initialize default usage data
      const defaultUsage: UsageData = {
        extractionsToday: 0,
        lastExtractionDate: new Date().toISOString(),
        totalExtractions: 0,
        extractionHistory: []
      };
      
      return defaultUsage;
    }

    return data.usage_data as UsageData;
  } catch (error) {
    console.error('Failed to fetch usage data:', error);
    return null;
  }
}

/**
 * Track an extraction in the user's usage data
 * @param userId The user ID
 * @returns Success status
 */
export async function trackExtraction(userId: string): Promise<boolean> {
  try {
    // Get current usage data
    const currentUsage = await getUserUsage(userId);
    
    if (!currentUsage) {
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastExtractionDate = currentUsage.lastExtractionDate?.split('T')[0];
    
    let extractionsToday = 0;
    if (lastExtractionDate === today) {
      extractionsToday = currentUsage.extractionsToday + 1;
    } else {
      extractionsToday = 1;
    }
    
    // Update extraction history
    let extractionHistory = [...(currentUsage.extractionHistory || [])];
    const historyEntry = extractionHistory.find(entry => entry.date === today);
    
    if (historyEntry) {
      historyEntry.count += 1;
    } else {
      extractionHistory.push({
        date: today,
        count: 1
      });
    }
    
    // Keep only the last 30 days of history
    if (extractionHistory.length > 30) {
      extractionHistory = extractionHistory.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 30);
    }
    
    // Update usage data
    const updatedUsage: UsageData = {
      extractionsToday,
      lastExtractionDate: new Date().toISOString(),
      totalExtractions: (currentUsage.totalExtractions || 0) + 1,
      extractionHistory
    };
    
    const { error } = await supabase
      .from('users')
      .update({ usage_data: updatedUsage as unknown as Json })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating usage data:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track extraction:', error);
    return false;
  }
}

/**
 * Get usage statistics for a user
 * @param userId The user ID
 * @returns Usage statistics
 */
export async function getUsageStatistics(userId: string): Promise<{
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  dailyAverage: number;
  history: { date: string; count: number }[];
} | null> {
  try {
    const usageData = await getUserUsage(userId);
    
    if (!usageData) {
      return null;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const history = usageData.extractionHistory || [];
    
    // Calculate this week's extractions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = history
      .filter(entry => new Date(entry.date) >= oneWeekAgo)
      .reduce((sum, entry) => sum + entry.count, 0);
    
    // Calculate this month's extractions
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonth = history
      .filter(entry => new Date(entry.date) >= oneMonthAgo)
      .reduce((sum, entry) => sum + entry.count, 0);
    
    // Calculate daily average (over the last 30 days or available history)
    const daysWithActivity = history.length;
    const dailyAverage = daysWithActivity > 0 
      ? Math.round((usageData.totalExtractions || 0) / daysWithActivity * 10) / 10
      : 0;
    
    return {
      today: usageData.extractionsToday || 0,
      thisWeek,
      thisMonth,
      total: usageData.totalExtractions || 0,
      dailyAverage,
      history: history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    };
  } catch (error) {
    console.error('Failed to get usage statistics:', error);
    return null;
  }
}

/**
 * Reset usage data for a user (admin function)
 * @param userId The user ID
 * @returns Success status
 */
export async function resetUsage(userId: string): Promise<boolean> {
  try {
    const defaultUsage: UsageData = {
      extractionsToday: 0,
      lastExtractionDate: new Date().toISOString(),
      totalExtractions: 0,
      extractionHistory: []
    };
    
    const { error } = await supabase
      .from('users')
      .update({ usage_data: defaultUsage as unknown as Json })
      .eq('id', userId);
      
    if (error) {
      console.error('Error resetting usage data:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to reset usage data:', error);
    return false;
  }
} 