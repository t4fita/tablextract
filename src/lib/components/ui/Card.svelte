<script lang="ts">
  export let variant: 'default' | 'bordered' | 'elevated' = 'default';
  export let padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let fullWidth: boolean = false;
  export let hoverable: boolean = false;
  
  // Compute variant classes
  $: variantClasses = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md'
  }[variant];
  
  // Compute padding classes
  $: paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }[padding];
  
  // Compute width classes
  $: widthClasses = fullWidth ? 'w-full' : '';
  
  // Compute hover classes
  $: hoverClasses = hoverable ? 'transition-shadow duration-200 hover:shadow-lg' : '';
  
  // Combine all classes
  $: cardClasses = [
    'rounded-lg overflow-hidden',
    variantClasses,
    widthClasses,
    hoverClasses,
    $$props.class || ''
  ].filter(Boolean).join(' ');
  
  // Compute content padding
  $: contentPaddingClasses = padding === 'none' ? '' : paddingClasses;
</script>

<div class={cardClasses}>
  {#if $$slots.header}
    <div class="border-b border-gray-200 {paddingClasses}">
      <slot name="header" />
    </div>
  {/if}
  
  <div class={contentPaddingClasses}>
    <slot />
  </div>
  
  {#if $$slots.footer}
    <div class="border-t border-gray-200 {paddingClasses}">
      <slot name="footer" />
    </div>
  {/if}
</div> 