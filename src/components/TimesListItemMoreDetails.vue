<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import timeLinks from '@/utils/timeLinks';
  import { computed } from 'vue';
  const props = defineProps<{
      time: Time,
      cols: TimeListColumn[]
    }>();
  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
  })
</script>


<template>
  <div class="grid os-subgrid-cols-auto p-2 px-2 bg-main-800" :style="{ gridTemplateColumns: colWidthsStyle }">
    <div v-for="(col, index) in props.cols" :key="index" :class="col.alignmentClasses" class="flex flex-col">
      <span class="text-gray-400 text-xs">{{ col.label }}:</span>
      <span>{{ col.data === 'sync' ? props.time[col.data].toFixed(2) + '%' : props.time[col.data] }}</span>
    </div>
    <!-- Add link to individual record -->
    <div v-if="props.time._id" class="flex flex-col justify-center">
      <a 
        :href="timeLinks.recordLink(props.time)" 
        class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-main-700 rounded hover:bg-main-600 transition-colors text-center"
      >
        View Record
      </a>
    </div>
  </div>
</template>

<style scoped>
  .os-subgrid-cols-auto {
    display: grid;
  }
</style>