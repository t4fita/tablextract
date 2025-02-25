<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
</script>

<svelte:head>
  <title>About | Tablextract</title>
</svelte:head>

<div class="space-y-16 py-12">
  <!-- Hero section -->
  <div class="text-center">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
      About Tablextract
    </h1>
    <p class="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
      Tablextract is an AI-powered tool that extracts tables from images, PDFs, and other documents, 
      making it easy to convert visual data into structured formats.
    </p>
  </div>
  
  <!-- Mission section -->
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
    <p class="text-lg text-gray-600 mb-4">
      We believe that data should be accessible and usable, regardless of its original format. 
      Our mission is to eliminate the tedious task of manually transcribing tables from documents 
      and images, saving you time and reducing errors.
    </p>
    <p class="text-lg text-gray-600">
      By leveraging the latest advancements in AI and computer vision, we've created a tool that 
      can accurately recognize and extract tabular data from various sources, allowing you to 
      focus on analysis rather than data entry.
    </p>
  </div>
  
  <!-- Technology section -->
  <div class="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Technology</h2>
      <p class="text-lg text-gray-600 mb-8">
        Tablextract uses Google's Gemini 2.0 Flash AI model to power its table extraction capabilities. 
        This cutting-edge technology allows us to:
      </p>
      
      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <div class="p-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Image Recognition</h3>
            <p class="text-gray-600">
              Accurately detect and extract tables from images, screenshots, and scanned documents.
            </p>
          </div>
        </Card>
        
        <Card>
          <div class="p-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Document Parsing</h3>
            <p class="text-gray-600">
              Extract tables from PDFs, Word documents, and other file formats with high accuracy.
            </p>
          </div>
        </Card>
        
        <Card>
          <div class="p-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">Data Export</h3>
            <p class="text-gray-600">
              Convert extracted tables to various formats including CSV, Excel, and JSON for easy use.
            </p>
          </div>
        </Card>
        
        <Card>
          <div class="p-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900 mb-2">AI Enhancement</h3>
            <p class="text-gray-600">
              Intelligently correct and enhance extracted data, handling complex table structures and formatting.
            </p>
          </div>
        </Card>
      </div>
    </div>
  </div>
  
  <!-- CTA section -->
  <div class="text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-6">Ready to try Tablextract?</h2>
    <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
      Start extracting tables from your documents today and save hours of manual data entry.
    </p>
    <div class="flex justify-center space-x-4">
      <Button size="lg" on:click={() => window.location.href = '/signup'}>
        Get Started for Free
      </Button>
      <Button variant="outline" size="lg" on:click={() => window.location.href = '/pricing'}>
        View Pricing
      </Button>
    </div>
  </div>
</div> 