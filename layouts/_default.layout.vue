<!-- The `default` layout is used if none is explicitly specified. -->
<template>
  <div class="grid grid-cols-1 place-items-center min-h-full sm:p-8 bg-gray-50">
    <div class="w-full max-w-3xl p-8 border-y sm:border-x sm:rounded-xl bg-white">
      <slot></slot>
    </div>
  </div>
</template>

<style>
#page {
  height: 100%;
}
</style>
