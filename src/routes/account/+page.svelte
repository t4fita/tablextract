<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import TabPanel from '$lib/components/ui/TabPanel.svelte';
  import { getSubscriptionDetails, type SubscriptionDetails, type SubscriptionTier } from '$lib/services/subscription';
  import { getUsageStatistics } from '$lib/services/usage';
  
  // Authentication check
  onMount(async () => {
    // Use the requireAuth function to check authentication and redirect if needed
    const isAuthenticated = await authStore.requireAuth();
    if (!isAuthenticated) return;
    
    // Load subscription details
    await loadSubscriptionDetails();
    
    // Load usage statistics
    await loadUsageStatistics();
  });
  
  // State
  let isLoading = false;
  let activeTab = 'profile';
  
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'usage', label: 'Usage' },
    { id: 'security', label: 'Security' }
  ];
  
  // Profile state
  let email = $authStore.user?.email || '';
  let name = '';
  let company = '';
  
  // Password change state
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordError = '';
  
  // Subscription state
  let subscriptionDetails: SubscriptionDetails | null = null;
  let isLoadingSubscription = false;
  let isUpdatingSubscription = false;
  let selectedTier: SubscriptionTier = 'monthly';
  
  // Usage state
  let usageStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
    dailyAverage: number;
    history: { date: string; count: number }[];
  } | null = null;
  let isLoadingUsage = false;
  
  // Load subscription details
  async function loadSubscriptionDetails() {
    if (!$authStore.user) return;
    
    isLoadingSubscription = true;
    
    try {
      subscriptionDetails = await getSubscriptionDetails($authStore.user.id);
      if (subscriptionDetails) {
        selectedTier = subscriptionDetails.tier;
      }
    } catch (error) {
      console.error('Error loading subscription details:', error);
      toastStore.error('Failed to load subscription details');
    } finally {
      isLoadingSubscription = false;
    }
  }
  
  // Load usage statistics
  async function loadUsageStatistics() {
    if (!$authStore.user) return;
    
    isLoadingUsage = true;
    
    try {
      usageStats = await getUsageStatistics($authStore.user.id);
    } catch (error) {
      console.error('Error loading usage statistics:', error);
      toastStore.error('Failed to load usage statistics');
    } finally {
      isLoadingUsage = false;
    }
  }
  
  // Handle subscription update
  async function handleSubscriptionUpdate() {
    if (!$authStore.user) return;
    
    isUpdatingSubscription = true;
    
    try {
      // In a real implementation, this would call the subscription API
      // For now, we'll just show a success message
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${$authStore.session?.access_token}`
        },
        body: JSON.stringify({ tier: selectedTier })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }
      
      subscriptionDetails = data.subscription;
      toastStore.success('Subscription updated successfully');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toastStore.error('Failed to update subscription');
    } finally {
      isUpdatingSubscription = false;
    }
  }
  
  // Handle profile update
  async function handleProfileUpdate() {
    isLoading = true;
    
    try {
      // In a real implementation, this would call an API to update the user's profile
      // For now, we'll just show a success message
      toastStore.success('Profile updated successfully');
    } catch (error) {
      toastStore.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // Handle password change
  async function handlePasswordChange() {
    // Reset error
    passwordError = '';
    
    // Validate passwords
    if (!currentPassword) {
      passwordError = 'Current password is required';
      return;
    }
    
    if (!newPassword) {
      passwordError = 'New password is required';
      return;
    }
    
    if (newPassword.length < 8) {
      passwordError = 'New password must be at least 8 characters';
      return;
    }
    
    if (newPassword !== confirmPassword) {
      passwordError = 'Passwords do not match';
      return;
    }
    
    isLoading = true;
    
    try {
      // In a real implementation, this would call an API to change the password
      // For now, we'll just show a success message
      toastStore.success('Password changed successfully');
      
      // Reset form
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
    } catch (error) {
      toastStore.error('Failed to change password');
      console.error('Password change error:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // Handle sign out
  async function handleSignOut() {
    try {
      await authStore.signOut();
      goto('/');
    } catch (error) {
      toastStore.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  }
</script>

<svelte:head>
  <title>Account Settings | Tablextract</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Account Settings</h1>
  
  <Tabs {tabs} bind:activeTab />
  
  <div class="mt-6">
    <TabPanel id="profile" activeTab={activeTab}>
  <Card>
        <h2 class="text-xl font-semibold mb-4">Profile Information</h2>
        
        <form on:submit|preventDefault={handleProfileUpdate} class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input id="email" type="email" bind:value={email} disabled />
          </div>
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input id="name" type="text" bind:value={name} placeholder="Your name" />
          </div>
          
          <div>
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <Input id="company" type="text" bind:value={company} placeholder="Your company" />
          </div>
          
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
      </TabPanel>
      
    <TabPanel id="subscription" activeTab={activeTab}>
      <Card>
        <h2 class="text-xl font-semibold mb-4">Subscription Management</h2>
        
        {#if isLoadingSubscription}
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        {:else if subscriptionDetails}
          <div class="mb-6">
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">Current Plan</h3>
                  <p class="text-lg font-bold capitalize">{subscriptionDetails.tier}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">Status</p>
                  <span class={`inline-block px-2 py-1 text-xs rounded-full ${subscriptionDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {subscriptionDetails.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {#if subscriptionDetails.endDate}
                <div class="mt-2 text-sm text-gray-500">
                  Expires on {new Date(subscriptionDetails.endDate).toLocaleDateString()}
                </div>
              {/if}
            </div>
            
            <div class="mb-4">
              <h3 class="font-medium mb-2">Features</h3>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>{subscriptionDetails.features.extractionsPerDay} extractions per day</span>
                </li>
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Max file size: {Math.round(subscriptionDetails.features.maxFileSize / (1024 * 1024))}MB</span>
                </li>
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 mr-2 ${subscriptionDetails.features.advancedExport ? 'text-green-500' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    {#if subscriptionDetails.features.advancedExport}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                  <span>Advanced export options</span>
                </li>
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 mr-2 ${subscriptionDetails.features.multipleTablesSupport ? 'text-green-500' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    {#if subscriptionDetails.features.multipleTablesSupport}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                  <span>Multiple tables support</span>
                </li>
                <li class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 mr-2 ${subscriptionDetails.features.priority ? 'text-green-500' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                    {#if subscriptionDetails.features.priority}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    {:else}
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    {/if}
                  </svg>
                  <span>Priority processing</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="font-medium mb-4">Change Subscription</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class={`border rounded-lg p-4 cursor-pointer ${selectedTier === 'monthly' ? 'border-blue-500 bg-blue-50' : ''}`} on:click={() => selectedTier = 'monthly'}>
                <h4 class="font-medium">Monthly</h4>
                <p class="text-sm text-gray-500">$9.99/month</p>
              </div>
              
              <div class={`border rounded-lg p-4 cursor-pointer ${selectedTier === 'yearly' ? 'border-blue-500 bg-blue-50' : ''}`} on:click={() => selectedTier = 'yearly'}>
                <h4 class="font-medium">Yearly</h4>
                <p class="text-sm text-gray-500">$99.99/year</p>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Save 17%</span>
              </div>
              
              <div class={`border rounded-lg p-4 cursor-pointer ${selectedTier === 'lifetime' ? 'border-blue-500 bg-blue-50' : ''}`} on:click={() => selectedTier = 'lifetime'}>
                <h4 class="font-medium">Lifetime</h4>
                <p class="text-sm text-gray-500">$299.99</p>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Best value</span>
              </div>
            </div>
            
            <Button on:click={handleSubscriptionUpdate} disabled={isUpdatingSubscription || selectedTier === subscriptionDetails.tier}>
              {isUpdatingSubscription ? 'Updating...' : 'Update Subscription'}
            </Button>
          </div>
        {:else}
          <p>Failed to load subscription details. Please try again later.</p>
        {/if}
      </Card>
      </TabPanel>
      
    <TabPanel id="usage" activeTab={activeTab}>
      <Card>
        <h2 class="text-xl font-semibold mb-4">Usage Statistics</h2>
        
        {#if isLoadingUsage}
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        {:else if usageStats}
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Today</p>
              <p class="text-2xl font-bold">{usageStats.today}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">This Week</p>
              <p class="text-2xl font-bold">{usageStats.thisWeek}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">This Month</p>
              <p class="text-2xl font-bold">{usageStats.thisMonth}</p>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500">Total</p>
              <p class="text-2xl font-bold">{usageStats.total}</p>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="font-medium mb-2">Daily Average</h3>
            <p class="text-lg">{usageStats.dailyAverage} extractions per day</p>
          </div>
          
          {#if usageStats.history.length > 0}
            <div>
              <h3 class="font-medium mb-2">Recent Activity</h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="h-40 flex items-end space-x-1">
                  {#each usageStats.history as day}
                    <div class="flex-1 flex flex-col items-center">
                      <div class="w-full bg-blue-200 rounded-t" style="height: {Math.min(100, day.count * 10)}%;"></div>
                      <div class="text-xs mt-1">{new Date(day.date).getDate()}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        {:else}
          <p>Failed to load usage statistics. Please try again later.</p>
        {/if}
      </Card>
    </TabPanel>
    
    <TabPanel id="security" activeTab={activeTab}>
      <Card>
        <h2 class="text-xl font-semibold mb-4">Security Settings</h2>
        
        <form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <Input id="currentPassword" type="password" bind:value={currentPassword} />
          </div>
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <Input id="newPassword" type="password" bind:value={newPassword} />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <Input id="confirmPassword" type="password" bind:value={confirmPassword} />
          </div>
          
          {#if passwordError}
            <div class="text-red-500 text-sm">{passwordError}</div>
          {/if}
          
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
        
        <div class="mt-8 pt-6 border-t">
          <h3 class="font-medium mb-4">Sign Out</h3>
          <Button variant="danger" on:click={() => authStore.signOut()}>Sign Out</Button>
        </div>
      </Card>
      </TabPanel>
  </div>
</div> 