<script lang="ts">
export const title = "Home";
export default {};
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Examples</h1>
  <div class="[&>*]:block [&>*]:underline">
    <a class="text-red-700" href="/examples/alternate">Page With Alternate Layout</a>
    <a class="text-orange-700" href="/examples/markdown">Page With Markdown File</a>
    <a class="text-amber-700" href="/examples/auto-import-vue-vue">Component Auto-Imported In Vue SFC File</a>
    <a class="text-yellow-700" href="/examples/auto-import-vue-md">Component Auto-Imported In Markdown File</a>
    <a class="text-lime-700" href="/examples/auto-import-md-vue">Markdown Auto-Imported In Vue SFC File</a>
    <a class="text-green-700" href="/examples/auto-import-md-md">Markdown Auto-Imported In Markdown File</a>
    <a class="text-emerald-700" href="/examples/auto-import-svg-vue">SVG Auto-Imported In Vue SFC File</a>
    <a class="text-teal-700" href="/examples/auto-import-svg-md">SVG Auto-Imported In Markdown File</a>
  </div>
</template>
