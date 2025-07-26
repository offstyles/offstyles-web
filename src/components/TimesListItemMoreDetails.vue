<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
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
  <div class="grid os-subgrid-cols-auto p-2 px-2 bg-main-800">
    <div v-for="(col,index) in props.cols" :key="index" :class="col.classes" class="flex flex-col">
      <span class="text-gray-400 text-xs">{{col.label}}:</span>
      <span>{{  col.data === 'sync' ? props.time[col.data].toFixed(2)+'%' : props.time[col.data] }}</span>
    </div>
  </div>
</template>

<style scoped>
  .os-subgrid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
  }
</style>