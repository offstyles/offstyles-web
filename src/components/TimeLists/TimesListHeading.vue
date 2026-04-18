<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import TimesListHeadingColumn from './TimesListHeadingColumn.vue';
  import { computed } from 'vue';

  const props = defineProps<{
      cols: TimeListColumn[]
    }>();

  const firstRowCols = computed(()=>{
    return props.cols.filter((v)=>v.row === undefined || v.row === 1);
  })

  const maxCol = computed(()=>{
    return Math.max(...props.cols.map((v)=>v.col + (v.colSpan ?? 1) - 1));
  })

  const maxColMobile = computed(()=>{
    return Math.max(...props.cols.map((v)=>(v.colMobile ?? 1) + (v.colSpanMobile ?? 1) - 1));
  })

  const colWidthsStyle = computed(()=>{
    const widths: string[] = [];
    for (let i = 1; i <= maxCol.value; i++) {
      const match = props.cols.find((c)=>c.col === i && c.width);
      widths.push(match?.width ?? 'auto');
    }
    return widths.join(' ');
  })

  const rowWidthsStyle = computed(()=>'1fr');

  const totalRowsMobile = computed(()=>{
    return Math.max(...props.cols.map((v)=>(v.rowMobile ?? 1) + (v.rowSpanMobile ?? 1) - 1));
  })

  const colWidthsStyleMobile = computed(()=>{
    const widths: string[] = [];
    for (let i = 1; i <= maxColMobile.value; i++) {
      const match = props.cols.find((c)=>(c.colMobile ?? 1) === i && c.widthMobile);
      widths.push(match?.widthMobile ?? 'auto');
    }
    return widths.join(' ');
  })

  const rowWidthsStyleMobile = computed(()=>totalRowsMobile.value > 1 ? '1fr 0.5fr' : '1fr');
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
  }
</style>
