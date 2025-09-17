<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import TimesListHeadingColumn from './TimesListHeadingColumn.vue';
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

    const totalRowsMobile = computed(()=>{
    return Math.max(...props.cols.map((v)=>{return v.rowMobile && v.rowSpanMobile ? v.rowMobile+v.rowSpanMobile : 1}));
  })

  const firstRowCols = computed(()=>{
    return props.cols.filter((v)=>v.row === undefined || v.row === 1);
  })
  
  const colWidthsStyleMobile = computed(()=>{
    return props.cols.filter((v)=>(v.rowMobile === undefined || v.rowMobile === 1)) //only first row
    .sort((a,b)=>(a.colMobile ?? 1) - (b.colMobile ?? 1)) //sort into correct col order
    .map((v)=>v.widthMobile ? v.widthMobile : 'auto').join(' '); //make css
  })

  const rowWidthsStyleMobile = computed(()=>{
    return totalRowsMobile.value > 1 ? '1fr 0.5fr' : '1fr'; 
  });
</script>


<template>
  <div class="grid os-grid-cols-auto px-1 bg-main-900 fw-700 text-xs pt-1.5 pb-2 text-gray-200 items-center">
    <TimesListHeadingColumn v-for="(col,index) in firstRowCols" :col="col" :key="index"></TimesListHeadingColumn>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
    grid-template-rows: v-bind('rowWidthsStyle');
  }
  @media(max-width:767px){
    .os-grid-cols-auto{
      grid-template-columns: v-bind('colWidthsStyleMobile');
      grid-template-rows: v-bind('rowWidthsStyleMobile');
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