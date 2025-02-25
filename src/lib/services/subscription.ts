/**
 * Service for managing user subscriptions
 */
import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';

export type SubscriptionTier = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface SubscriptionDetails {
  tier: SubscriptionTier;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  features: {
    extractionsPerDay: number;
    maxFileSize: number; // in bytes
    advancedExport: boolean;
    multipleTablesSupport: boolean;
    priority: boolean;
  };
}

// Define features for each subscription tier
const SUBSCRIPTION_FEATURES = {
  free: {
    extractionsPerDay: 3,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    advancedExport: false,
    multipleTablesSupport: false,
    priority: false
  },
  monthly: {
    extractionsPerDay: 20,
    maxFileSize: 20 * 1024 * 1024, // 20MB
    advancedExport: true,
    multipleTablesSupport: true,
    priority: false
  },
  yearly: {
    extractionsPerDay: 50,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    advancedExport: true,
    multipleTablesSupport: true,
    priority: true
  },
  lifetime: {
    extractionsPerDay: 100,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    advancedExport: true,
    multipleTablesSupport: true,
    priority: true
  }
};

/**
 * Get subscription details for a user
 * @param userId The user ID
 * @returns Subscription details
 */
export async function getSubscriptionDetails(userId: string): Promise<SubscriptionDetails | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier, subscription_start, subscription_end')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription details:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const tier = data.subscription_tier as SubscriptionTier;
    const startDate = new Date(data.subscription_start);
    const endDate = data.subscription_end ? new Date(data.subscription_end) : null;
    const isActive = tier === 'lifetime' || (endDate ? new Date() < endDate : false);

    return {
      tier,
      startDate,
      endDate,
      isActive,
      features: SUBSCRIPTION_FEATURES[tier]
    };
  } catch (error) {
    console.error('Failed to fetch subscription details:', error);
    return null;
  }
}

/**
 * Update a user's subscription tier
 * @param userId The user ID
 * @param tier The new subscription tier
 * @param endDate The new subscription end date (optional)
 * @returns Success status
 */
export async function updateSubscription(
  userId: string,
  tier: SubscriptionTier,
  endDate?: Date
): Promise<boolean> {
  try {
    const updateData: {
      subscription_tier: SubscriptionTier;
      subscription_start: string;
      subscription_end?: string | null;
    } = {
      subscription_tier: tier,
      subscription_start: new Date().toISOString()
    };

    if (tier === 'lifetime') {
      updateData.subscription_end = null;
    } else if (endDate) {
      updateData.subscription_end = endDate.toISOString();
    } else {
      // Set default end date based on tier
      const now = new Date();
      if (tier === 'monthly') {
        const monthLater = new Date(now);
        monthLater.setMonth(monthLater.getMonth() + 1);
        updateData.subscription_end = monthLater.toISOString();
      } else if (tier === 'yearly') {
        const yearLater = new Date(now);
        yearLater.setFullYear(yearLater.getFullYear() + 1);
        updateData.subscription_end = yearLater.toISOString();
      } else if (tier === 'free') {
        // Free tier expires in 7 days to encourage upgrade
        const weekLater = new Date(now);
        weekLater.setDate(weekLater.getDate() + 7);
        updateData.subscription_end = weekLater.toISOString();
      }
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return false;
  }
}

/**
 * Check if a user can perform an extraction based on their subscription
 * @param userId The user ID
 * @param fileSize The size of the file to extract (in bytes)
 * @returns Whether the user can perform the extraction
 */
export async function canPerformExtraction(
  userId: string,
  fileSize?: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const subscription = await getSubscriptionDetails(userId);
    
    if (!subscription) {
      return { allowed: false, reason: 'Subscription details not found' };
    }
    
    if (!subscription.isActive) {
      return { allowed: false, reason: 'Subscription is not active' };
    }
    
    // Check file size limit
    if (fileSize && fileSize > subscription.features.maxFileSize) {
      return { 
        allowed: false, 
        reason: `File size exceeds the limit for your subscription tier (${Math.round(subscription.features.maxFileSize / (1024 * 1024))}MB)` 
      };
    }
    
    // Check daily extraction limit
    const { data: usageData, error } = await supabase
      .from('users')
      .select('usage_data')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching usage data:', error);
      return { allowed: false, reason: 'Could not verify usage limits' };
    }
    
    const usage = usageData.usage_data as { 
      extractionsToday?: number;
      lastExtractionDate?: string;
    };
    
    const today = new Date().toISOString().split('T')[0];
    const lastExtractionDate = usage.lastExtractionDate?.split('T')[0];
    
    let extractionsToday = 0;
    if (lastExtractionDate === today) {
      extractionsToday = usage.extractionsToday || 0;
    }
    
    if (extractionsToday >= subscription.features.extractionsPerDay) {
      return { 
        allowed: false, 
        reason: `You have reached your daily extraction limit (${subscription.features.extractionsPerDay} per day)` 
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking extraction permission:', error);
    return { allowed: false, reason: 'An error occurred while checking permissions' };
  }
} 