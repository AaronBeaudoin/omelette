<script lang="ts">
export const layout = null;
export default {};
</script>

<template>
  <div>
    <teleport to="#top-before"><div class="bg-red">TOP-BEFORE</div></teleport>
    <teleport to="#top-sticky"><div class="bg-green">TOP-STICKY</div></teleport>
    <teleport to="#top-after"><div class="bg-blue">TOP-AFTER</div></teleport>
    <div class="h-[var(--th)] bg-yellow">PAGE-TOP</div>
    <div class="h-[var(--ph)]">PAGE-MIDDLE</div>
    <div class="h-[var(--bh)] bg-yellow">PAGE-BOTTOM</div>
    <teleport to="#bottom-before"><div class="bg-orange">BOTTOM-BEFORE</div></teleport>
    <teleport to="#bottom-sticky"><div class="bg-cyan">BOTTOM-STICKY</div></teleport>
    <teleport to="#bottom-after"><div class="bg-purple">BOTTOM-AFTER</div></teleport>
  </div>
</template>
