<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let id: string = crypto.randomUUID();
  export let name: string = '';
  export let label: string = '';
  export let placeholder: string = '';
  export let value: string = '';
  export let rows: number = 4;
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  export let maxlength: number | undefined = undefined;
  
  // Create a dispatch function for events
  const dispatch = createEventDispatcher<{
    input: string;
    change: string;
    focus: FocusEvent;
    blur: FocusEvent;
  }>();
  
  // Handle input change
  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('input', value);
  }
  
  // Handle textarea change
  function handleChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('change', value);
  }
</script>

<div class="w-full">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}{required ? ' *' : ''}
    </label>
  {/if}
  
  <textarea
    {id}
    {name}
    {rows}
    {placeholder}
    {maxlength}
    class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {error ? 'border-red-500' : 'border-gray-300'} {disabled ? 'bg-gray-100 cursor-not-allowed' : ''}"
    {value}
    disabled={disabled}
    required={required}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
    on:input={handleInput}
    on:change={handleChange}
    on:focus={(e) => dispatch('focus', e)}
    on:blur={(e) => dispatch('blur', e)}
    {...$$restProps}
  ></textarea>
  
  {#if error}
    <p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
  {:else if helpText}
    <p id="{id}-description" class="mt-1 text-sm text-gray-500">{helpText}</p>
  {/if}
  
  {#if maxlength}
    <div class="mt-1 text-xs text-gray-500 text-right">
      {value.length}/{maxlength}
    </div>
  {/if}
</div> 