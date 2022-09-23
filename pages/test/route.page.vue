<script setup lang="ts">
import { inject } from "vue";

const route = inject("route") as WorkerRoute;
console.log("ROUTE", route);
</script>

<template>
  <div>{{ route }}</div>
</template>
