import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserUsage, getUsageStatistics, trackExtraction } from '$lib/services/usage';
import { supabase } from '$lib/supabase';

/**
 * GET handler for usage statistics
 */
export const GET = async ({ request }: RequestEvent) => {
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
  
  // Get usage statistics
  const usageStats = await getUsageStatistics(user.id);
  
  if (!usageStats) {
    return json({ error: 'Usage statistics not found' }, { status: 404 });
  }
  
  return json({ usage: usageStats });
};

/**
 * POST handler for tracking an extraction
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
    // Track the extraction
    const success = await trackExtraction(user.id);
    
    if (!success) {
      return json({ error: 'Failed to track extraction' }, { status: 500 });
    }
    
    // Get updated usage statistics
    const usageStats = await getUsageStatistics(user.id);
    
    return json({ success: true, usage: usageStats });
  } catch (error) {
    console.error('Error tracking extraction:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 