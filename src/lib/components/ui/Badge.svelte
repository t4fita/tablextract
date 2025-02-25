<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let rounded: boolean = false;
  
  // Compute variant classes
  $: variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'bg-white border border-gray-300 text-gray-700'
  }[variant];
  
  // Compute size classes
  $: sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }[size];
  
  // Compute rounded classes
  $: roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Combine all classes
  $: badgeClasses = [
    'inline-flex items-center font-medium',
    variantClasses,
    sizeClasses,
    roundedClasses,
    $$props.class || ''
  ].filter(Boolean).join(' ');
</script>

<span class={badgeClasses}>
  <slot />
</span> 