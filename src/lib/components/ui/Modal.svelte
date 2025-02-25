<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  
  export let open: boolean = false;
  export let title: string = '';
  export let showClose: boolean = true;
  export let closeOnEscape: boolean = true;
  export let closeOnOutsideClick: boolean = true;
  export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  // Compute size classes
  $: sizeClass = 
    size === 'sm' ? 'max-w-sm' : 
    size === 'md' ? 'max-w-md' : 
    size === 'lg' ? 'max-w-lg' : 
    'max-w-xl';
  
  const dispatch = createEventDispatcher<{
    close: void;
  }>();
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (open && closeOnEscape && event.key === 'Escape') {
      handleClose();
    }
  }
  
  function handleOutsideClick(event: MouseEvent) {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    transition:fade={{ duration: 200 }}
    on:click={handleOutsideClick}
  >
    <div 
      class="bg-white rounded-lg shadow-xl w-full {sizeClass} overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {#if title || showClose}
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          {#if title}
            <h3 id="modal-title" class="text-lg font-medium text-gray-900">{title}</h3>
          {:else}
            <div></div>
          {/if}
          
          {#if showClose}
            <button 
              type="button" 
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              on:click={handleClose}
              aria-label="Close"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}
      
      <div class="px-6 py-4">
        <slot />
      </div>
      
      {#if $$slots.footer}
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <slot name="footer" />
        </div>
      {:else if $$slots.actions}
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <slot name="actions">
            <Button variant="outline" on:click={handleClose}>Cancel</Button>
            <Button>Confirm</Button>
          </slot>
        </div>
      {/if}
    </div>
  </div>
{/if} 