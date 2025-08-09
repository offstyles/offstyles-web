<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  const props = defineProps<{
      cols: TimeListColumn[]
    }>();

  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
  })
</script>


<template>
  <div class="grid os-grid-cols-auto px-1 bg-main-900 fw-700 text-xs pt-1.5 pb-2 text-gray-200">
    <div v-for="(col,index) in props.cols" :key="index" class="grid-col px-1.5" :class="col.alignmentClasses">
      <div :class="col.alignmentClasses">{{ col.label }}</div>
    </div>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
  }
  @media(max-width:768px){
    .os-grid-cols-auto{
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }
    .os-grid-cols-auto>.grid-col:nth-child(1n),
    .os-grid-cols-auto>.grid-col:nth-child(1n)>div{
      text-align: left;
      justify-content: left;
    }
    .os-grid-cols-auto>.grid-col:nth-child(2n),
    .os-grid-cols-auto>.grid-col:nth-child(2n)>div{
      text-align: right;
      justify-content: right;
    }
  }
</style>