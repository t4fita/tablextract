<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
</script>

<div class="flex flex-col items-center">
  <!-- Hero section -->
  <section class="py-12 text-center md:py-20">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
      <span class="block">Extract tables from</span>
      <span class="block text-primary-600">images and documents</span>
    </h1>
    <p class="mx-auto mt-6 max-w-md text-base text-gray-500 sm:text-lg md:mt-8 md:max-w-3xl md:text-xl">
      Tablextract uses AI to extract tables from images, PDFs, and more. Get structured data in seconds.
    </p>
    <div class="mx-auto mt-8 flex max-w-md justify-center md:mt-10">
      <div class="mr-4">
        <Button size="lg">Try it now</Button>
      </div>
      <Button variant="outline" size="lg">Learn more</Button>
    </div>
  </section>

  <!-- Features section -->
  <section class="py-12 md:py-20">
    <div class="text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        How it works
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
        Extract tables from any source in three simple steps
      </p>
    </div>

    <div class="mt-12 grid gap-8 md:grid-cols-3">
      <Card class="flex flex-col items-center text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">1. Upload</h3>
        <p class="mt-2 text-base text-gray-500">
          Upload an image, PDF, or paste a screenshot containing a table.
        </p>
      </Card>

      <Card class="flex flex-col items-center text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">2. Extract</h3>
        <p class="mt-2 text-base text-gray-500">
          Our AI automatically detects and extracts the table structure and data.
        </p>
      </Card>

      <Card class="flex flex-col items-center text-center">
        <div class="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">3. Export</h3>
        <p class="mt-2 text-base text-gray-500">
          Download the extracted data as CSV, Excel, or copy to clipboard.
        </p>
      </Card>
    </div>
  </section>

  <!-- CTA section -->
  <section class="bg-primary-700 py-12 md:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to extract your tables?
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-xl text-primary-100">
          Start extracting tables from your documents today.
        </p>
        <div class="mt-8">
          <Button size="lg" variant="secondary">Get started for free</Button>
        </div>
      </div>
    </div>
  </section>
</div>
