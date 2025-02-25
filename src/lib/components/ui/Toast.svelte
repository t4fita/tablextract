<script lang="ts">
  import { fly } from 'svelte/transition';
  import { toastStore, type Toast, type ToastType } from '$lib/stores/toast';
  
  // Get the icon based on toast type
  function getIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>`;
      case 'error':
        return `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>`;
      case 'warning':
        return `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>`;
      case 'info':
      default:
        return `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
    }
  }
  
  // Get the background color based on toast type
  function getBackgroundColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500';
      case 'error':
        return 'bg-red-50 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-500';
    }
  }
  
  // Get the text color based on toast type
  function getTextColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  }
  
  // Get the icon color based on toast type
  function getIconColor(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
  {#each $toastStore as toast (toast.id)}
    <div
      class="rounded-lg border-l-4 p-4 shadow-md {getBackgroundColor(toast.type)}"
      transition:fly={{ x: 20, duration: 300, opacity: 1 }}
    >
      <div class="flex items-start">
        <div class="flex-shrink-0 {getIconColor(toast.type)}">
          {@html getIcon(toast.type)}
        </div>
        <div class="ml-3 w-0 flex-1">
          {#if toast.title}
            <p class="text-sm font-medium {getTextColor(toast.type)}">{toast.title}</p>
          {/if}
          <p class="mt-1 text-sm {getTextColor(toast.type)}">{toast.message}</p>
        </div>
        {#if toast.dismissible}
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              class="inline-flex rounded-md {getTextColor(toast.type)} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              on:click={() => toastStore.dismiss(toast.id)}
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div> 