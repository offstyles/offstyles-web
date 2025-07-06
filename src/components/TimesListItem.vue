<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  const props = defineProps<{
      time: Time,
      wrTime: Time,
      cols: TimeListColumn[],
      placement: number
    }>();

  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
  })
</script>


<template>
  <div class="grid os-grid-cols-auto p-1 px-2 bg-main-600 odd:bg-main-700">
    <div v-for="(col,index) in props.cols" :key="index" :class="col.classes">
      <a v-if="col.link" :href="col.link(props.time)"><TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent></a>
      <div v-else><TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent></div>
    </div>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
  }
</style>