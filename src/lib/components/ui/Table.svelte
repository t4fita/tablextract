<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  
  export let data: any[][] = [];
  export let headers: string[] = [];
  export let caption: string = '';
  export let sortable: boolean = false;
  export let pagination: boolean = false;
  export let pageSize: number = 10;
  export let striped: boolean = false;
  export let bordered: boolean = false;
  export let hoverable: boolean = false;
  export let compact: boolean = false;
  export let emptyMessage: string = 'No data available';
  export let hasHeaders: boolean = true;
  export let headerPosition: 'top' | 'left' | 'none' = 'top';
  
  // Pagination state
  let currentPage = 1;
  $: totalPages = Math.ceil(data.length / pageSize);
  $: paginatedData = pagination 
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
    : data;
  
  // Sorting state
  let sortColumn: number | null = null;
  let sortDirection: 'asc' | 'desc' = 'asc';
  
  // Compute table classes
  $: tableClasses = [
    'min-w-full divide-y divide-gray-300',
    bordered ? 'border border-gray-300' : '',
  ].filter(Boolean).join(' ');
  
  // Compute row classes
  function getRowClasses(index: number): string {
    return [
      hoverable ? 'hover:bg-gray-50' : '',
      striped && index % 2 === 1 ? 'bg-gray-50' : '',
    ].filter(Boolean).join(' ');
  }
  
  // Compute cell classes
  $: cellClasses = compact ? 'px-3 py-2' : 'px-4 py-3';
  
  // Handle sorting
  function handleSort(columnIndex: number) {
    if (!sortable) return;
    
    if (sortColumn === columnIndex) {
      // Toggle direction if same column
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new column and default to ascending
      sortColumn = columnIndex;
      sortDirection = 'asc';
    }
    
    // Sort the data
    data = [...data].sort((a, b) => {
      const valueA = a[columnIndex];
      const valueB = b[columnIndex];
      
      // Handle different data types
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Default string comparison
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
    
    dispatch('sort', { column: columnIndex, direction: sortDirection });
  }
  
  // Handle pagination
  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    dispatch('page', { page: currentPage });
  }
  
  // Create a dispatch function for events
  const dispatch = createEventDispatcher<{
    sort: { column: number; direction: 'asc' | 'desc' };
    page: { page: number };
  }>();
  
  // Generate array of page numbers for pagination
  $: pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Get visible page numbers (show 5 pages at most)
  $: visiblePageNumbers = getVisiblePageNumbers(currentPage, totalPages);
  
  function getVisiblePageNumbers(current: number, total: number) {
    if (total <= 5) return pageNumbers;
    
    if (current <= 3) {
      return [...pageNumbers.slice(0, 5), '...', total];
    } else if (current >= total - 2) {
      return [1, '...', ...pageNumbers.slice(total - 5)];
    } else {
      return [1, '...', current - 1, current, current + 1, '...', total];
    }
  }
</script>

<div class="overflow-x-auto">
  <table class={tableClasses}>
    {#if caption}
      <caption class="sr-only">{caption}</caption>
    {/if}
    
    {#if hasHeaders && headerPosition === 'top' && headers.length > 0}
      <thead class="bg-gray-50">
        <tr>
          {#each headers as header}
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider {bordered ? 'border border-gray-200' : ''}">
              {header}
            </th>
          {/each}
        </tr>
      </thead>
    {/if}
    
    <tbody class="divide-y divide-gray-200 bg-white">
      {#if paginatedData.length === 0}
        <tr>
          <td colspan={headers.length} class="{cellClasses} text-center text-sm text-gray-500">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each paginatedData as row, rowIndex}
          <tr class="{striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''} {hoverable ? 'hover:bg-gray-100' : ''}">
            {#each row as cell, cellIndex}
              {#if hasHeaders && headerPosition === 'left' && cellIndex === 0}
                <th scope="row" class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 {bordered ? 'border border-gray-200' : ''} {compact ? 'py-2' : ''}">
                  {cell}
                </th>
              {:else}
                <td class="{cellClasses} text-sm text-gray-500 {bordered ? 'border border-gray-200' : ''} {compact ? 'py-2' : ''}">
                  {cell}
                </td>
              {/if}
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  
  {#if pagination && totalPages > 1}
    <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div class="flex flex-1 justify-between sm:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing <span class="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span class="font-medium">{Math.min(currentPage * pageSize, data.length)}</span> of <span class="font-medium">{data.length}</span> results
          </p>
        </div>
        
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              class="rounded-l-md px-2 py-2"
            >
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
              </svg>
            </Button>
            
            {#each visiblePageNumbers as pageNum}
              {#if pageNum === '...'}
                <span class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                  ...
                </span>
              {:else}
                <Button 
                  variant={currentPage === pageNum ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => goToPage(pageNum as number)}
                  class="px-4 py-2"
                >
                  {pageNum}
                </Button>
              {/if}
            {/each}
            
            <Button 
              variant="ghost" 
              size="sm" 
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              class="rounded-r-md px-2 py-2"
            >
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
              </svg>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  {/if}
</div> 