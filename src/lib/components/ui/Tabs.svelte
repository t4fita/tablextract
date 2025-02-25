<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let tabs: Array<{ id: string; label: string; disabled?: boolean }> = [];
  export let activeTab: string = tabs.length > 0 ? tabs[0].id : '';
  export let variant: 'default' | 'pills' | 'underline' = 'default';
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let fullWidth: boolean = false;
  
  // Compute container classes
  $: containerClasses = orientation === 'vertical' 
    ? 'flex flex-row' 
    : 'flex flex-col';
  
  // Compute tabs list classes
  $: tabsListClasses = [
    orientation === 'vertical' ? 'flex flex-col' : 'flex',
    variant === 'pills' ? 'space-x-1' : 'border-b border-gray-200',
    fullWidth && orientation !== 'vertical' ? 'w-full' : '',
  ].filter(Boolean).join(' ');
  
  // Compute tab item classes
  function getTabItemClasses(tabId: string, disabled: boolean = false): string {
    const isActive = activeTab === tabId;
    
    const baseClasses = [
      'inline-flex items-center justify-center',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      fullWidth && orientation !== 'vertical' ? 'flex-1' : '',
    ];
    
    if (variant === 'default') {
      return [
        ...baseClasses,
        'px-4 py-2 text-sm font-medium',
        isActive 
          ? 'border-b-2 border-primary-500 text-primary-600' 
          : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
      ].filter(Boolean).join(' ');
    } else if (variant === 'pills') {
      return [
        ...baseClasses,
        'px-3 py-1.5 text-sm font-medium rounded-md',
        isActive 
          ? 'bg-primary-100 text-primary-700' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      ].filter(Boolean).join(' ');
    } else if (variant === 'underline') {
      return [
        ...baseClasses,
        'px-4 py-2 text-sm font-medium',
        isActive 
          ? 'text-primary-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-500 relative' 
          : 'text-gray-500 hover:text-gray-700',
      ].filter(Boolean).join(' ');
    }
    
    return baseClasses.join(' ');
  }
  
  // Handle tab click
  function handleTabClick(tabId: string, disabled: boolean = false) {
    if (disabled) return;
    
    activeTab = tabId;
    dispatch('change', { tabId });
  }
  
  // Create a dispatch function for events
  const dispatch = createEventDispatcher<{
    change: { tabId: string };
  }>();
</script>

<div class={containerClasses}>
  <div class={tabsListClasses} role="tablist">
    {#each tabs as tab}
      <button
        type="button"
        role="tab"
        id={`tab-${tab.id}`}
        aria-controls={`panel-${tab.id}`}
        aria-selected={activeTab === tab.id}
        class={getTabItemClasses(tab.id, tab.disabled)}
        disabled={tab.disabled}
        on:click={() => handleTabClick(tab.id, tab.disabled)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
  
  <div class={orientation === 'vertical' ? 'flex-1 ml-4' : 'mt-4'}>
    <slot {activeTab} />
  </div>
</div> 