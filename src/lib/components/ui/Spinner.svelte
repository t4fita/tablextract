<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let color: 'primary' | 'white' | 'gray' = 'primary';
  
  // Compute size classes
  $: sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-8 w-8' : 'h-12 w-12';
  
  // Compute color classes
  $: colorClass = color === 'primary' 
    ? 'text-primary-600' 
    : color === 'white' 
      ? 'text-white' 
      : 'text-gray-500';
</script>

<div class="inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent {sizeClass} {colorClass} {$$props.class || ''}" role="status">
  <span class="sr-only">Loading...</span>
</div> 