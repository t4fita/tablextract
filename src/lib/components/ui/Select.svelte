<script lang="ts">
  export let id: string;
  export let name: string;
  export let label: string = '';
  export let value: string = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  export let placeholder: string = 'Select an option';
  
  // Handle select change
  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    dispatch('change', value);
  }
  
  // Create a dispatch function for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    change: string;
    focus: FocusEvent;
    blur: FocusEvent;
  }>();
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}{required ? ' *' : ''}
    </label>
  {/if}
  
  <div class="relative">
    <select
      {id}
      {name}
      class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-none {error ? 'border-red-500' : 'border-gray-300'} {disabled ? 'bg-gray-100 cursor-not-allowed' : ''}"
      {value}
      disabled={disabled}
      required={required}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
      on:change={handleChange}
      on:focus={(e) => dispatch('focus', e)}
      on:blur={(e) => dispatch('blur', e)}
      {...$$restProps}
    >
      <option value="" disabled selected={!value}>{placeholder}</option>
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    
    <!-- Dropdown arrow -->
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
      </svg>
    </div>
  </div>
  
  {#if error}
    <p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
  {:else if helpText}
    <p id="{id}-description" class="mt-1 text-sm text-gray-500">{helpText}</p>
  {/if}
</div> 