<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  const props = defineProps<{
      cols: TimeListColumn[],
    }>();

  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
  })
</script>


<template>
  <div class="grid os-grid-cols-auto p-1 px-2 bg-main-900 fw-700 text-xs py-1.5 text-gray-200">
    <div v-for="(col,index) in props.cols" :key="index" :class="col.classes">
      <div :class="col.classes">{{ col.label }}</div>
    </div>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
  }
</style>