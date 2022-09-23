<script lang="ts">
export const title = "Home";
export const props = async (route: WorkerRoute, fetch: WorkerFetch) => {
  const response = await fetch("/test/_date");
  return { server: await response.text() };
};
</script>

<script setup lang="ts">
import { inject } from "vue";

defineProps({
  server: {
    type: String,
    required: true
  }
});

let client: string | null = $ref(null);
const fetch = inject("fetch") as WorkerFetch;

const get = async () => {
  const response = await fetch("/test/_date");
  client = await response.text();
};
</script>

<template>
  <div class="opacity-50">
    Server: {{ server }}
  </div>
  <div class="cursor-pointer select-none" @click="get()">
    Client: {{ client || "CLICK" }}
  </div>
</template>
