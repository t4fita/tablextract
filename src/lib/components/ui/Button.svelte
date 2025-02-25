<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Spinner from './Spinner.svelte';
  
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;
  export let fullWidth: boolean = false;
  export let icon: string | null = null;
  export let iconPosition: 'left' | 'right' = 'left';
  export let onClick: ((event: MouseEvent) => void) | null = null;
  
  // Compute variant classes
  $: variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }[variant];
  
  // Compute size classes
  $: sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }[size];
  
  // Compute width classes
  $: widthClasses = fullWidth ? 'w-full' : '';
  
  // Compute disabled classes
  $: disabledClasses = disabled || loading ? 'opacity-60 cursor-not-allowed' : '';
  
  // Combine all classes
  $: buttonClasses = [
    'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
    variantClasses,
    sizeClasses,
    widthClasses,
    disabledClasses,
    $$props.class || ''
  ].filter(Boolean).join(' ');
  
  // Handle click event
  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(event);
    }
    
    dispatch('click', event);
  }
  
  // Create a dispatch function for events
  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();
</script>

<button
  {type}
  class={buttonClasses}
  disabled={disabled || loading}
  on:click={handleClick}
  {...$$restProps}
>
  {#if loading}
    <Spinner 
      size="sm" 
      color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} 
      class="mr-2"
    />
  {:else if icon && iconPosition === 'left'}
    <span class="mr-2">{@html icon}</span>
  {/if}
  
  <slot />
  
  {#if icon && iconPosition === 'right' && !loading}
    <span class="ml-2">{@html icon}</span>
  {/if}
</button> 