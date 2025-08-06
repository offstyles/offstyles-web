<script setup lang="ts">
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  
  const props = defineProps<{
      cols: TimeListColumn[],
      enableSelection?: boolean
    }>();

  const emit = defineEmits<{
    toggleAll: []
  }>()

  const colWidthsStyle = computed(()=>{
    const baseColumns = props.cols.map((v)=>v.width ? v.width : 'auto')
    if (props.enableSelection) {
      return ['40px', ...baseColumns].join(' ')
    }
    return baseColumns.join(' ')
  })
</script>


<template>
  <div class="grid os-grid-cols-auto p-1 px-2 bg-main-900 fw-700 text-xs py-1.5 text-gray-200">
    <div v-if="enableSelection" class="grid-col flex items-center justify-center">
      <input 
        type="checkbox" 
        @change="emit('toggleAll')"
        class="w-4 h-4 text-blue-600 bg-main-700 border-main-500 rounded focus:ring-blue-500"
        title="Toggle all"
      />
    </div>
    <div v-for="(col,index) in props.cols" :key="index" class="grid-col" :class="col.alignmentClasses">
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