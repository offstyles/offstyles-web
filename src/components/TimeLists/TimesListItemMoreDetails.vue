<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import timeLinks from '@/utils/timeLinks';
  import { computed } from 'vue';
  import RelativeDate from '../RelativeDate.vue';
  const props = defineProps<{
      time: Time,
      cols: TimeListColumn[]
    }>();
  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : '1fr').join(' ');
  })
</script>


<template>
  <div class="grid os-subgrid-cols-auto py-3 px-2 bg-main-800" :style="{ gridTemplateColumns: colWidthsStyle }">
    <div v-for="(col, index) in props.cols" :key="index" :class="col.alignmentClasses" class="flex flex-col">
      <span class="text-gray-400 text-xs">{{ col.label }}:</span>
      <span v-if="col.data === 'date'" class="monospace text-lg">
        <RelativeDate :date="props.time[col.data]" />
      </span>
      <span class="monospace text-lg" v-else>{{ col.data === 'sync' ? props.time[col.data].toFixed(2) + '%' : props.time[col.data] }}</span>
    </div>
    <!-- Add link to individual record -->
    <div v-if="props.time._id" class="flex flex-col justify-center items-center pt-2 pb-1 col-span-3">
      <a 
        :href="timeLinks.recordLink(props.time)" 
        class="px-8 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors text-center text-sm"
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