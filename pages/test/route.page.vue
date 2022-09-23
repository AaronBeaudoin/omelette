<script setup lang="ts">
import { inject } from "vue";

const route = inject("route") as WorkerRoute;
</script>

<template>
  <div>{{ route }}</div>
</template>
