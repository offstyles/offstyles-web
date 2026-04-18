<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';

  const props = defineProps<{
      col: TimeListColumn
    }>();

  // Mobile: only render a header label for columns on row 1.
  // Secondary rows (rowMobile > 1) are self-explanatory from their data content.
  const hideOnMobile = computed(()=>(props.col.rowMobile ?? 1) > 1);
</script>


<template>
    <div class="px-1.5 time-grid-heading-col" :class="hideOnMobile ? 'max-md:hidden' : ''">
      <div :class="`${col.alignmentClasses} ${col.row && col.row > 1 ? 'text-gray-500 leading-[1.17em]' : ''}`">{{ col.label }}</div>
    </div>
</template>

<style scoped>
.time-grid-heading-col{
  grid-column: v-bind('`${col.col} / span ${col.colSpan ?? 1}`');
  grid-row: v-bind('`${col.row ?? 1} / span ${col.rowSpan ?? 1}`')
}
@media (max-width:767px) {
  .time-grid-heading-col{
    grid-column: v-bind('`${col.colMobile ?? 1} / span ${col.colSpanMobile ?? 1}`');
    grid-row: v-bind('`${col.rowMobile ?? 1} / span ${col.rowSpanMobile ?? 1}`')
  }
}
</style>
