<!-- The `default` layout is used if none is explicitly specified. -->
<template>
  <div class="grid grid-cols-1 place-items-center h-full p-8 bg-gray-50">
    <div class="w-full max-w-3xl p-8 border rounded-xl bg-white">
      <slot></slot>
    </div>
  </div>
</template>
