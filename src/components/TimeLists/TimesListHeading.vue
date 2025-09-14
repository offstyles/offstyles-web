<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  const props = defineProps<{
      cols: TimeListColumn[]
    }>();

    const totalCols = computed(()=>{
    return Math.max(...props.cols.map((v)=>{return v.col && v.colSpan ? v.col+v.colSpan : 1}));
  })
  const totalRows = computed(()=>{
    return Math.max(...props.cols.map((v)=>{return v.row && v.rowSpan ? v.row+v.rowSpan : 1}));
  })

  const colWidthsStyle = computed(()=>{
    return props.cols.filter((v)=>v.row === undefined || v.row === 1) //only first row
    .sort((a,b)=>a.col - b.col) //sort into correct col order
    .map((v)=>v.width ? v.width : 'auto').join(' '); //make css
  })

  const rowWidthsStyle = computed(()=>{
    return '1fr'; 
  })
</script>


<template>
  <div class="grid os-grid-cols-auto px-1 bg-main-900 fw-700 text-xs pt-1.5 pb-2 text-gray-200 items-center">
    <div v-for="(col,index) in props.cols" :key="index" class="px-1.5" 
    :style="`grid-column:${col.col} / span ${col.colSpan ?? 0}; grid-row:${col.row} / span ${col.rowSpan ?? 0};`">
      <div v-if="!(col.row && col.row>1)" :class="`${col.alignmentClasses} ${col.row && col.row > 1 ? 'text-gray-500 leading-[1.17em]' : ''}`">{{ col.label }}</div>
    </div>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
    grid-template-rows: v-bind('rowWidthsStyle');
  }
  @media(max-width:767px){
    .os-grid-cols-auto{
      grid-template-columns: 40% 60%;
      grid-template-rows: repeat(2, 1fr);
    }
    .os-grid-cols-auto>.grid-col{
      width:100%;
    }
    .os-grid-cols-auto>.grid-col:nth-child(1n){
      text-align: left;
      justify-content: left;
    }
    .os-grid-cols-auto>.grid-col:nth-child(2n){
      text-align: right;
      justify-content: right;
    }
    .os-grid-cols-auto>.grid-col:nth-child(2n+1):last-child{
      grid-column:span 2;
    }
  }
</style>