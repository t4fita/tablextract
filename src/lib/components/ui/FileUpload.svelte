<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { validateFile, formatFileSize, isImageFile } from '$lib/utils/file-utils';
  import Button from './Button.svelte';
  
  export let id: string = crypto.randomUUID();
  export let name: string = '';
  export let label: string = 'Upload file';
  export let accept: string = '';
  export let maxSize: number = 10 * 1024 * 1024; // 10MB default
  export let multiple: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let helpText: string = '';
  export let value: File[] = [];
  
  let dragActive = false;
  let fileInput: HTMLInputElement;
  let internalError = '';
  
  $: displayError = error || internalError;
  
  const dispatch = createEventDispatcher<{
    change: { files: File[] };
    error: { message: string };
  }>();
  
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const files = Array.from(input.files);
    validateAndProcessFiles(files);
  }
  
  function validateAndProcessFiles(files: File[]) {
    internalError = '';
    
    // Validate each file
    const invalidFiles = files.filter(file => {
      const { valid, errors } = validateFile(file, accept ? accept.split(',') : undefined, maxSize);
      if (!valid && errors.length) {
        internalError = errors[0];
        dispatch('error', { message: errors[0] });
        return true;
      }
      return false;
    });
    
    if (invalidFiles.length) return;
    
    // Update value
    if (multiple) {
      value = [...value, ...files];
    } else {
      value = [files[0]];
    }
    
    dispatch('change', { files: value });
  }
  
  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    dragActive = true;
  }
  
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragActive = false;
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    dragActive = true;
  }
  
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    
    dragActive = false;
    
    if (!event.dataTransfer?.files?.length) return;
    
    const files = Array.from(event.dataTransfer.files);
    validateAndProcessFiles(files);
  }
  
  function handleBrowseClick() {
    if (disabled) return;
    fileInput.click();
  }
  
  function removeFile(index: number) {
    value = value.filter((_, i) => i !== index);
    dispatch('change', { files: value });
  }
  
  function clearFiles() {
    value = [];
    if (fileInput) fileInput.value = '';
    dispatch('change', { files: value });
  }
</script>

<div class="space-y-2">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
  {/if}
  
  <div
    class="relative"
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
  >
    <input
      {id}
      {name}
      type="file"
      {accept}
      {multiple}
      {disabled}
      class="sr-only"
      bind:this={fileInput}
      on:change={handleFileSelect}
    />
    
    <div
      class="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg {dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'} {disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} transition-colors duration-200"
    >
      <div class="flex flex-col items-center justify-center text-center">
        <svg class="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="mb-2 text-sm text-gray-700">
          <span class="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">
          {#if accept}
            {accept.split(',').join(', ')}
          {:else}
            All file types supported
          {/if}
          {#if maxSize}
            (Max: {formatFileSize(maxSize)})
          {/if}
        </p>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        class="mt-4"
        on:click={handleBrowseClick}
        disabled={disabled}
      >
        Browse files
      </Button>
    </div>
    
    {#if value.length > 0}
      <div class="mt-4 space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-700">Selected files</h4>
          <Button
            variant="ghost"
            size="sm"
            on:click={clearFiles}
            disabled={disabled}
          >
            Clear all
          </Button>
        </div>
        
        <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {#each value as file, index}
            <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
              <div class="flex items-center flex-1 min-w-0">
                {#if isImageFile(file)}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    class="h-10 w-10 object-cover rounded mr-3"
                  />
                {:else}
                  <svg class="h-10 w-10 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                {/if}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p class="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                class="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                on:click={() => removeFile(index)}
                disabled={disabled}
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
  
  {#if displayError}
    <p class="mt-1 text-sm text-red-600">{displayError}</p>
  {/if}
  
  {#if helpText && !displayError}
    <p class="mt-1 text-sm text-gray-500">{helpText}</p>
  {/if}
</div> 