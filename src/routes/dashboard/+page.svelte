<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { toastStore } from '$lib/stores/toast';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FileUpload from '$lib/components/ui/FileUpload.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import TabPanel from '$lib/components/ui/TabPanel.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import Table from '$lib/components/ui/Table.svelte';
  import { extractTableFromFile, extractTableFromText, extractTableFromClipboard } from '$lib/services/gemini';
  import { saveExtraction, getExtractionHistory, toggleExtractionsVisibility, type ExtractionRecord } from '$lib/services/extraction-history';
  import { ALLOWED_FILE_TYPES } from '$lib/utils/file-utils';
  import { exportToCSV, exportToExcel, exportMultipleTablesToExcel, exportToJSON, exportToHTML, exportToMarkdown } from '$lib/utils/export-utils';
  import { canPerformExtraction } from '$lib/services/subscription';
  import { trackExtraction } from '$lib/services/usage';
  
  // Authentication check
  onMount(async () => {
    // Use the requireAuth function to check authentication and redirect if needed
    const isAuthenticated = await authStore.requireAuth();
    if (!isAuthenticated) return;
    
    // Load extraction history
    await loadExtractionHistory();
  });
  
  // State
  let files: File[] = [];
  let clipboardText = '';
  let extractionHints = '';
  let isExtracting = false;
  let extractionError = '';
  let extractedData: { 
    headers: string[]; 
    rows: string[][];
    tables?: Array<{
      headers: string[];
      rows: string[][];
      title?: string;
    }>;
  } | null = null;
  let activeTab = 'upload';
  let inputMethod = 'file';
  let isLoadingHistory = false;
  let extractionHistory: ExtractionRecord[] = [];
  let currentPage = 1;
  let itemsPerPage = 5;
  let savedExtractionId: string | null = null;
  let clipboardPasteArea: HTMLDivElement;
  let selectedTableIndex = 0;
  let totalTables = 0;
  let isSubscriptionLimited = false;
  let subscriptionLimitReason = '';
  
  // Multiple select state
  let selectedExtractions: Set<string> = new Set();
  let isSelectMode = false;
  
  // Export options
  let showExportOptions = false;
  let selectedExportFormat = 'excel';
  const exportFormats = [
    { id: 'excel', label: 'Excel (.xlsx)' },
    { id: 'csv', label: 'CSV (.csv)' },
    { id: 'json', label: 'JSON (.json)' },
    { id: 'html', label: 'HTML (.html)' },
    { id: 'markdown', label: 'Markdown (.md)' }
  ];
  
  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'results', label: 'Results', disabled: !extractedData },
    { id: 'history', label: 'History' }
  ];
  
  const inputMethods = [
    { id: 'file', label: 'File Upload' },
    { id: 'clipboard', label: 'Clipboard' }
  ];
  
  // Load extraction history
  async function loadExtractionHistory() {
    if (!$authStore.user) return;
    
    isLoadingHistory = true;
    
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      extractionHistory = await getExtractionHistory($authStore.user.id, itemsPerPage, offset);
    } catch (error) {
      console.error('Error loading extraction history:', error);
      toastStore.error('Failed to load extraction history');
    } finally {
      isLoadingHistory = false;
    }
  }
  
  // Toggle selection mode
  function toggleSelectMode() {
    isSelectMode = !isSelectMode;
    if (!isSelectMode) {
      selectedExtractions.clear();
    }
  }
  
  // Toggle selection of an extraction
  function toggleExtractionSelection(id: string) {
    if (selectedExtractions.has(id)) {
      selectedExtractions.delete(id);
    } else {
      selectedExtractions.add(id);
    }
    selectedExtractions = selectedExtractions; // Trigger reactivity
  }
  
  // Handle file upload
  function handleFileUpload(event: CustomEvent<File[]>) {
    files = event.detail;
  }
  
  // Handle extraction
  async function handleExtraction() {
    if (!$authStore.user) {
      toastStore.error('You must be logged in to extract tables');
      return;
    }
    
    // Reset state
    isExtracting = true;
    extractionError = '';
    extractedData = null;
    savedExtractionId = null;
    
    try {
      // Check subscription limits
      let fileSize: number | undefined;
      if (inputMethod === 'file' && files.length > 0) {
        fileSize = files[0].size;
      }
      
      const canExtract = await canPerformExtraction($authStore.user.id, fileSize);
      
      if (!canExtract.allowed) {
        isSubscriptionLimited = true;
        subscriptionLimitReason = canExtract.reason || 'Subscription limit reached';
        toastStore.error(subscriptionLimitReason);
        return;
      }
      
      // Perform extraction
      let result;
      
      if (inputMethod === 'file') {
        if (files.length === 0) {
          extractionError = 'Please select a file to extract';
          return;
        }
        
        result = await extractTableFromFile(files[0], { extractionHints });
      } else {
        if (!clipboardText.trim()) {
          extractionError = 'Please paste content to extract';
          return;
        }
        
        result = await extractTableFromText(clipboardText, { extractionHints });
      }
      
      if (!result.success || !result.data) {
        extractionError = result.error || 'Failed to extract table';
        return;
      }
      
      // Track the extraction
      await trackExtraction($authStore.user.id);
      
      // Set extracted data
      extractedData = result.data;
      
      // Set total tables
      totalTables = extractedData.tables ? extractedData.tables.length : 1;
      
      // Save extraction to history
      const metadata = {
        extractionMethod: inputMethod as 'file' | 'clipboard',
        extractionHints,
        fileName: inputMethod === 'file' && files.length > 0 ? files[0].name : undefined,
        fileType: inputMethod === 'file' && files.length > 0 ? files[0].type : undefined,
        fileSize: inputMethod === 'file' && files.length > 0 ? files[0].size : undefined
      };
      
      const savedExtraction = await saveExtraction($authStore.user.id, result, metadata);
      
      if (savedExtraction) {
        savedExtractionId = savedExtraction.id;
      }
      
      // Switch to results tab
      activeTab = 'results';
    } catch (error) {
      console.error('Extraction error:', error);
      extractionError = 'An error occurred during extraction';
    } finally {
      isExtracting = false;
    }
  }
  
  // Handle export
  function handleExport() {
    if (!extractedData) return;
    
    showExportOptions = true;
  }
  
  // Perform export
  function performExport() {
    if (!extractedData) return;
    
    const filename = `table-export-${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (totalTables > 1 && selectedExportFormat === 'excel') {
        // Export multiple tables to Excel
        const tables = extractedData.tables!.map((table, index) => ({
          data: [table.headers, ...table.rows],
          sheetName: table.title || `Table ${index + 1}`
        }));
        
        exportMultipleTablesToExcel(tables, `${filename}.xlsx`);
      } else {
        // Get current table data
        const currentTable = totalTables > 1 
          ? extractedData.tables![selectedTableIndex]
          : { headers: extractedData.headers, rows: extractedData.rows };
        
        const tableData = [currentTable.headers, ...currentTable.rows];
        
        // Export based on selected format
        switch (selectedExportFormat) {
          case 'excel':
            exportToExcel(tableData, `${filename}.xlsx`);
            break;
          case 'csv':
            exportToCSV(tableData, `${filename}.csv`);
            break;
          case 'json':
            exportToJSON(tableData, `${filename}.json`, currentTable.headers);
            break;
          case 'html':
            exportToHTML(tableData, `${filename}.html`, 'Extracted Table');
            break;
          case 'markdown':
            exportToMarkdown(tableData, `${filename}.md`, 'Extracted Table');
            break;
        }
      }
      
      showExportOptions = false;
      toastStore.success('Table exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toastStore.error('Failed to export table');
    }
  }
  
  // Handle clipboard paste
  function handleClipboardPaste(event: ClipboardEvent) {
    // Implementation remains the same
  }
  
  // Handle pagination
  function changePage(newPage: number) {
    currentPage = newPage;
    loadExtractionHistory();
  }
  
  // Handle table navigation
  function navigateTable(direction: 'prev' | 'next') {
    if (direction === 'prev' && selectedTableIndex > 0) {
      selectedTableIndex--;
    } else if (direction === 'next' && selectedTableIndex < totalTables - 1) {
      selectedTableIndex++;
    }
  }
  
  // Get current table data
  $: currentTableData = totalTables > 1 && extractedData?.tables 
    ? extractedData.tables[selectedTableIndex]
    : extractedData;
  
  // Update tabs when extractedData changes
  $: {
    if (extractedData) {
      tabs[1].disabled = false;
    } else {
      tabs[1].disabled = true;
    }
  }
</script>

<svelte:head>
  <title>Dashboard | Tablextract</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <div class="flex space-x-2">
      <Button variant="outline" on:click={() => goto('/account')}>Account</Button>
    </div>
  </div>
  
  <Tabs {tabs} bind:activeTab />
  
  <div class="mt-6">
    <TabPanel id="upload" activeTab={activeTab}>
      <Card>
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-4">Extract Table</h2>
            
            <div class="flex space-x-4 mb-4">
              {#each inputMethods as method}
                <button
                  class={`px-4 py-2 rounded-md ${inputMethod === method.id ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-gray-100 text-gray-700'}`}
                  on:click={() => inputMethod = method.id}
                >
                  {method.label}
                </button>
              {/each}
            </div>
            
            {#if isSubscriptionLimited}
              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">Subscription Limit Reached</h3>
                    <div class="mt-2 text-sm text-yellow-700">
                      <p>{subscriptionLimitReason}</p>
                    </div>
                    <div class="mt-4">
                      <Button variant="primary" on:click={() => goto('/account?tab=subscription')}>
                        Upgrade Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
            
            {#if inputMethod === 'file'}
              <FileUpload
                on:files={handleFileUpload}
                accept={ALLOWED_FILE_TYPES.join(',')}
                maxSize={10 * 1024 * 1024}
              />
              
              {#if files.length > 0}
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-700">Selected file:</p>
                  <p class="text-sm text-gray-500">{files[0].name} ({Math.round(files[0].size / 1024)} KB)</p>
                </div>
              {/if}
            {:else if inputMethod === 'clipboard'}
              <div class="border-2 border-dashed border-gray-300 rounded-md p-4">
                <div class="text-center">
                  <p class="text-sm text-gray-500 mb-2">Paste text or image from clipboard</p>
                  <div
                    bind:this={clipboardPasteArea}
                    contenteditable="true"
                    class="min-h-[150px] p-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    on:paste={handleClipboardPaste}
                  ></div>
                </div>
              </div>
              
              {#if clipboardText}
                <div class="mt-4">
                  <p class="text-sm font-medium text-gray-700">Pasted content:</p>
                  <p class="text-sm text-gray-500">{clipboardText.length} characters</p>
                </div>
              {/if}
            {/if}
            
            <div class="mt-4">
              <label for="extraction-hints" class="block text-sm font-medium text-gray-700 mb-1">
                Extraction Hints (optional)
              </label>
              <TextArea
                id="extraction-hints"
                placeholder="Add any hints to improve extraction (e.g., 'The first row contains headers', 'Skip the first 2 rows', etc.)"
                bind:value={extractionHints}
                rows={3}
              />
            </div>
            
            {#if extractionError}
              <div class="mt-4 text-red-500 text-sm">{extractionError}</div>
            {/if}
            
            <div class="mt-6">
              <Button
                variant="primary"
                on:click={handleExtraction}
                disabled={isExtracting || isSubscriptionLimited || (inputMethod === 'file' && files.length === 0) || (inputMethod === 'clipboard' && !clipboardText)}
              >
                {isExtracting ? 'Extracting...' : 'Extract Table'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </TabPanel>
    
    <TabPanel id="results" activeTab={activeTab}>
      <Card>
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Extraction Results</h2>
            
            <div class="flex space-x-2">
              <Button variant="outline" on:click={handleExport}>
                Export
              </Button>
            </div>
          </div>
          
          {#if totalTables > 1}
            <div class="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <button
                class="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                on:click={() => navigateTable('prev')}
                disabled={selectedTableIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <div class="text-sm font-medium">
                Table {selectedTableIndex + 1} of {totalTables}
                {#if extractedData?.tables && extractedData.tables[selectedTableIndex].title}
                  - {extractedData.tables[selectedTableIndex].title}
                {/if}
              </div>
              
              <button
                class="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                on:click={() => navigateTable('next')}
                disabled={selectedTableIndex === totalTables - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          {/if}
          
          {#if currentTableData}
            <div class="overflow-x-auto">
              <Table
                data={totalTables > 1 ? currentTableData.rows : currentTableData.rows}
                headers={totalTables > 1 ? currentTableData.headers : currentTableData.headers}
              />
            </div>
          {:else}
            <div class="text-center py-8 text-gray-500">No data available</div>
          {/if}
        </div>
      </Card>
      
      {#if showExportOptions}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-lg font-medium mb-4">Export Options</h3>
            
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
                <div class="space-y-2">
                  {#each exportFormats as format}
                    <label class="flex items-center">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={format.id}
                        bind:group={selectedExportFormat}
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700">{format.label}</span>
                    </label>
                  {/each}
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-2">
              <Button variant="outline" on:click={() => showExportOptions = false}>
                Cancel
              </Button>
              <Button variant="primary" on:click={performExport}>
                Export
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </TabPanel>
    
    <TabPanel id="history" activeTab={activeTab}>
      <Card>
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Extraction History</h2>
            
            <div class="flex space-x-2">
              {#if isSelectMode}
                <Button variant="outline" on:click={toggleSelectMode}>
                  Cancel
                </Button>
              {:else}
                <Button variant="outline" on:click={toggleSelectMode}>
                  Select
                </Button>
              {/if}
            </div>
          </div>
          
          {#if isLoadingHistory}
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          {:else if extractionHistory.length === 0}
            <div class="text-center py-8 text-gray-500">No extraction history available</div>
          {:else}
            <div class="space-y-4">
              {#each extractionHistory as extraction (extraction.id)}
                <div class={`border rounded-md p-4 ${isSelectMode ? 'cursor-pointer' : ''} ${selectedExtractions.has(extraction.id) ? 'border-blue-500 bg-blue-50' : ''}`} on:click={() => isSelectMode && toggleExtractionSelection(extraction.id)}>
                  <div class="flex justify-between items-start">
                    <div>
                      {#if isSelectMode}
                        <div class="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedExtractions.has(extraction.id)}
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            on:change={() => toggleExtractionSelection(extraction.id)}
                          />
                        </div>
                      {/if}
                      
                      <div class="flex items-center">
                        <h3 class="font-medium">
                          {extraction.metadata?.fileName || 'Clipboard extraction'}
                        </h3>
                        
                        {#if extraction.extraction_data?.tables && extraction.extraction_data.tables.length > 1}
                          <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {extraction.extraction_data.tables.length} tables
                          </span>
                        {/if}
                      </div>
                      
                      <p class="text-sm text-gray-500 mt-1">
                        {new Date(extraction.created_at).toLocaleString()}
                      </p>
                      
                      {#if extraction.metadata.extractionMethod}
                        <p class="text-xs text-gray-500 mt-1">
                          Method: {extraction.metadata.extractionMethod === 'file' ? 'File upload' : 'Clipboard'}
                          {#if extraction.metadata.fileType}
                            • Type: {extraction.metadata.fileType}
                          {/if}
                          {#if extraction.metadata.fileSize}
                            • Size: {Math.round(extraction.metadata.fileSize / 1024)} KB
                          {/if}
                        </p>
                      {/if}
                    </div>
                    
                    {#if !isSelectMode}
                      <div class="flex space-x-2">
                        <button
                          class="text-blue-600 hover:text-blue-800"
                          title="View"
                          on:click|stopPropagation={() => {
                            extractedData = extraction.extraction_data;
                            totalTables = extraction.extraction_data.tables ? extraction.extraction_data.tables.length : 1;
                            selectedTableIndex = 0;
                            savedExtractionId = extraction.id;
                            activeTab = 'results';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
            
            <div class="flex justify-between items-center mt-4">
              <button
                class="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={currentPage === 1}
                on:click={() => changePage(currentPage - 1)}
              >
                Previous
              </button>
              
              <span class="text-sm text-gray-500">Page {currentPage}</span>
              
              <button
                class="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={extractionHistory.length < itemsPerPage}
                on:click={() => changePage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          {/if}
        </div>
      </Card>
    </TabPanel>
  </div>
</div> 