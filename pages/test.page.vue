<script lang="ts">
export const title = "Home";
</script>

<script setup lang="ts">
let count = $ref(1);

function two() {
  count += 2;
}
</script>

<template>
  <div class="bg-blue-200">Hello world!</div>
  <div>{{ count }} {{ count + 1 }}</div>
  <button @click="count += 1">+1</button>
  <button @click="two">+2</button>
  <MyExampleComponent></MyExampleComponent>
  <IconHero24ArrowRight/>
  <VectorLogo/>
</template>
