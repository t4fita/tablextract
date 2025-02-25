<script lang="ts">
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
  <Header />
  <main class="flex-grow">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </div>
  </main>
  <Footer />
</div> 