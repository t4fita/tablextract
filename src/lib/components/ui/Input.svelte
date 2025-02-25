<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let id: string = crypto.randomUUID();
  export let name: string = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' = 'text';
  export let label: string = '';
  export let placeholder: string = '';
  export let value: string | number = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  export let maxlength: number | undefined = undefined;
  export let min: number | string | undefined = undefined;
  export let max: number | string | undefined = undefined;
  export let step: number | string | undefined = undefined;
  export let autocomplete: 'on' | 'off' | 'name' | 'email' | 'username' | 'new-password' | 'current-password' | undefined = undefined;
  export let icon: string | null = null;
  export let iconPosition: 'left' | 'right' = 'left';
  
  // Create a dispatch function for events
  const dispatch = createEventDispatcher<{
    input: Event;
    change: Event;
    focus: FocusEvent;
    blur: FocusEvent;
  }>();
  
  // Handle input event
  function handleInput(event: Event) {
    dispatch('input', event);
  }
  
  // Handle change event
  function handleChange(event: Event) {
    dispatch('change', event);
  }
  
  // Handle focus event
  function handleFocus(event: FocusEvent) {
    dispatch('focus', event);
  }
  
  // Handle blur event
  function handleBlur(event: FocusEvent) {
    dispatch('blur', event);
  }
  
  // Compute input classes
  $: inputClasses = [
    'block w-full rounded-md shadow-sm',
    error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    disabled ? 'bg-gray-100 cursor-not-allowed opacity-75' : 'bg-white',
    $$props.class || ''
  ].filter(Boolean).join(' ');
</script>

<div class="space-y-1">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="relative">
    {#if icon && iconPosition === 'left'}
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {@html icon}
      </div>
    {/if}
    
    <input
      {id}
      {name}
      {type}
      {placeholder}
      {required}
      {disabled}
      {readonly}
      {maxlength}
      {min}
      {max}
      {step}
      {autocomplete}
      class={inputClasses}
      bind:value
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : helpText ? `${id}-description` : undefined}
      {...$$restProps}
    />
    
    {#if icon && iconPosition === 'right'}
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        {@html icon}
      </div>
    {/if}
  </div>
  
  {#if error}
    <p id="{id}-error" class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
  
  {#if helpText && !error}
    <p id="{id}-description" class="mt-1 text-sm text-gray-500">{helpText}</p>
  {/if}
</div> 