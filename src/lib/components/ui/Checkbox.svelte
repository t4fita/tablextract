<script lang="ts">
  export let id: string;
  export let name: string;
  export let label: string = '';
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  
  // Handle checkbox change
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    dispatch('change', checked);
  }
  
  // Create a dispatch function for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    change: boolean;
  }>();
</script>

<div class="flex items-start">
  <div class="flex items-center h-5">
    <input
      {id}
      {name}
      type="checkbox"
      class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 {disabled ? 'opacity-60 cursor-not-allowed' : ''}"
      checked={checked}
      {disabled}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
      on:change={handleChange}
      {...$$restProps}
    />
  </div>
  
  {#if label || $$slots.default}
    <div class="ml-3 text-sm">
      <label for={id} class="font-medium text-gray-700 {disabled ? 'opacity-60 cursor-not-allowed' : ''}">
        {#if label}
          {label}
        {:else}
          <slot />
        {/if}
      </label>
      
      {#if error}
        <p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
      {:else if helpText}
        <p id="{id}-description" class="mt-1 text-sm text-gray-500">{helpText}</p>
      {/if}
    </div>
  {/if}
</div> 