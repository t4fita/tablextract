<script lang="ts">
  export let name: string;
  export let legend: string = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let value: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  export let inline: boolean = false;
  
  // Handle radio change
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('change', value);
  }
  
  // Create a dispatch function for events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    change: string;
  }>();
</script>

<fieldset class="w-full">
  {#if legend}
    <legend class="text-sm font-medium text-gray-700 mb-1">
      {legend}{required ? ' *' : ''}
    </legend>
  {/if}
  
  <div class={inline ? 'flex flex-wrap gap-4' : 'space-y-2'}>
    {#each options as option, i}
      <div class="flex items-center">
        <input
          id="{name}-{i}"
          {name}
          type="radio"
          value={option.value}
          checked={value === option.value}
          {disabled}
          class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 {disabled ? 'opacity-60 cursor-not-allowed' : ''}"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-description` : undefined}
          on:change={handleChange}
        />
        <label for="{name}-{i}" class="ml-3 block text-sm font-medium text-gray-700 {disabled ? 'opacity-60 cursor-not-allowed' : ''}">
          {option.label}
        </label>
      </div>
    {/each}
  </div>
  
  {#if error}
    <p id="{name}-error" class="mt-1 text-sm text-red-600">{error}</p>
  {:else if helpText}
    <p id="{name}-description" class="mt-1 text-sm text-gray-500">{helpText}</p>
  {/if}
</fieldset> 