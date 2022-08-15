<script lang="ts">
export const title = "Home";
export default {};
</script>

<template>
  <h1 class="mb-4 text-2xl font-bold">Examples</h1>
  <div class="[&>*]:block [&>*]:underline">
    <a class="text-red-700" href="/examples/alternate">Page With Alternate Layout</a>
    <a class="text-orange-700" href="/examples/markdown">Page With Markdown File</a>
    <a class="text-yellow-700" href="/examples/vector-vue">SVG Auto-Imported In Vue SFC File</a>
    <a class="text-lime-700" href="/examples/vector-md">SVG Auto-Imported In Markdown File</a>
  </div>
</template>
