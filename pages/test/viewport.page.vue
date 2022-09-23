<script lang="ts">
export const layout = null;
export default {};
</script>

<template>
  <div>
    <teleport to="#top-before">TOP-BEFORE</teleport>
    <teleport to="#top-sticky">TOP-STICKY</teleport>
    <teleport to="#top-after">TOP-AFTER</teleport>
    <div>PAGE-TOP</div>
    <div>PAGE-MIDDLE</div>
    <div>PAGE-BOTTOM</div>
    <teleport to="#bottom-before">BOTTOM-BEFORE</teleport>
    <teleport to="#bottom-sticky">BOTTOM-STICKY</teleport>
    <teleport to="#bottom-after">BOTTOM-AFTER</teleport>
  </div>
</template>
