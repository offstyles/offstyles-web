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
  <span v-if="props.col.placement" class="inline-flex items-center justify-end text-end mr-1.5 min-w-5 text-sm text-gray-400">{{ props.time.rank }}.</span>
  <span class="truncate">{{ data }}</span>
  <span v-if="props.col.data === 'time' && props.wrTime" 
  :class="
    props.time.time - props.wrTime.time > 0 ? 'nonWrTimeColor opacity-70' :
    props.time.time - props.wrTime.time <= 0 ? 'text-green-600 opacity-80' : 
   'text-gray-500'
  "> 
    ({{ dateTimeFormats.timeDiff(props.time.time - props.wrTime.time) }})
  </span>
</template>

<style>
.nonWrTimeColor{
  color:hsl(357, v-bind('$props.wrTime ? `${($props.time.time - $props.wrTime.time)*200+40}%` : "90%"'), 58%)
}
</style>