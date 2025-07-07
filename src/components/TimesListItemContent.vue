<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';
  const props = defineProps<{
      time: Time,
      wrTime: Time | undefined,
      col: TimeListColumn,
    }>();
    const data = computed(()=>{
      if(props.col.data === "server"){
        return props.time[props.col.data].server;
      }
      return props.col.numFormat && typeof props.time[props.col.data] === 'number' ?
       props.col.numFormat(props.time[props.col.data] as number) : 
       props.time[props.col.data];
    })
</script>


<template>
  <span>{{ data }}</span>
  <span v-if="props.col.data === 'time' && props.wrTime" 
  :class="
    props.time.time - props.wrTime.time > 0 ? 'text-red-500 opacity-70' :
    props.time.time - props.wrTime.time < 0 ? 'text-green-600 opacity-80' : 
   'text-gray-500'
  "> 
    ({{ dateTimeFormats.timeDiff(props.time.time - props.wrTime.time) }})
  </span>
</template>