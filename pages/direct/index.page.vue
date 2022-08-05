<script lang="ts">
export const mode = "server-only";
export default {};
</script>

<template>
  <p>This page is never cached/pre-rendered on Vercel.</p>
  <p>Server Time: {{ new Date().toISOString() }}</p>
</template>
