<script lang="ts">
  export let id: string;
  export let activeTab: string;
</script>

{#if activeTab === id}
  <div
    role="tabpanel"
    id={`panel-${id}`}
    aria-labelledby={`tab-${id}`}
    tabindex="0"
  >
    <slot />
  </div>
{/if} 