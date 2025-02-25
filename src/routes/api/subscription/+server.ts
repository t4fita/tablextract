import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getSubscriptionDetails, updateSubscription, type SubscriptionTier } from '$lib/services/subscription';
import { supabase } from '$lib/supabase';

/**
 * GET handler for subscription details
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
  
  // Get subscription details
  const subscriptionDetails = await getSubscriptionDetails(user.id);
  
  if (!subscriptionDetails) {
    return json({ error: 'Subscription details not found' }, { status: 404 });
  }
  
  return json({ subscription: subscriptionDetails });
};

/**
 * POST handler for updating subscription
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
    
    if (!body.tier) {
      return json({ error: 'Subscription tier is required' }, { status: 400 });
    }
    
    // Validate tier
    const tier = body.tier as SubscriptionTier;
    if (!['free', 'monthly', 'yearly', 'lifetime'].includes(tier)) {
      return json({ error: 'Invalid subscription tier' }, { status: 400 });
    }
    
    // Parse end date if provided
    let endDate: Date | undefined;
    if (body.endDate) {
      endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        return json({ error: 'Invalid end date' }, { status: 400 });
      }
    }
    
    // Update subscription
    const success = await updateSubscription(user.id, tier, endDate);
    
    if (!success) {
      return json({ error: 'Failed to update subscription' }, { status: 500 });
    }
    
    // Get updated subscription details
    const subscriptionDetails = await getSubscriptionDetails(user.id);
    
    return json({ success: true, subscription: subscriptionDetails });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 