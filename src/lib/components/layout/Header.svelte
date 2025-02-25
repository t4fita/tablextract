<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
  // Reactive variable for user menu toggle
  let isUserMenuOpen = false;
  let profileButtonRef: HTMLButtonElement;
  let menuRef: HTMLDivElement;
  
  // Subscribe to the auth store
  $: isLoggedIn = !!$authStore.user;
  
  // Handle sign out
  async function handleSignOut() {
    await authStore.signOut();
    isUserMenuOpen = false;
  }
  
  // Close menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (isUserMenuOpen && menuRef && !menuRef.contains(event.target as Node) && 
        profileButtonRef && !profileButtonRef.contains(event.target as Node)) {
      isUserMenuOpen = false;
    }
  }
  
  // Close menu when pressing Escape
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isUserMenuOpen) {
      isUserMenuOpen = false;
    }
  }
  
  // Add and remove event listeners
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<header class="bg-white shadow">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 justify-between">
      <!-- Logo and site name -->
      <div class="flex items-center">
        <a href="/" class="flex items-center">
          <span class="text-2xl font-bold text-primary-600">Tablextract</span>
        </a>
      </div>

      <!-- Navigation -->
      <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
        <a
          href="/"
          class="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          aria-current="page">Home</a>
        <a
          href="/pricing"
          class="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >Pricing</a>
        <a
          href="/about"
          class="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
          >About</a>
      </div>

      <!-- Auth buttons / User menu -->
      <div class="flex items-center">
        {#if isLoggedIn}
          <!-- User dropdown button -->
          <div class="relative">
            <button
              type="button"
              class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              id="user-menu-button"
              aria-expanded={isUserMenuOpen}
              bind:this={profileButtonRef}
              on:click={() => (isUserMenuOpen = !isUserMenuOpen)}>
              <span class="sr-only">Open user menu</span>
              <div class="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center">
                <span class="text-primary-800 font-medium">
                  {$authStore.user?.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>
            </button>
            <!-- User dropdown menu -->
            {#if isUserMenuOpen}
              <div
                bind:this={menuRef}
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1">
                <a
                  href="/dashboard"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-0">Dashboard</a>
                <a
                  href="/account"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-1">Account</a>
                <button
                  type="button"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  tabindex="-1"
                  id="user-menu-item-2"
                  on:click={handleSignOut}>Sign out</button>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Login / Sign up buttons -->
          <div class="flex space-x-4">
            <a
              href="/login"
              class="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Login
            </a>
            <a
              href="/signup"
              class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium rounded-md">
              Sign up
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header> 