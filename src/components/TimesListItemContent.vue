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
</script>


<template>
  <span>{{ props.col.format ? props.col.format(props.time[props.col.data]) : props.time[props.col.data] }}</span>
  <span v-if="props.col.data === 'time' && props.wrTime" 
  :class="
    props.time.time - props.wrTime.time > 0 ? 'text-red-500 opacity-70' :
    props.time.time - props.wrTime.time < 0 ? 'text-green-600 opacity-80' : 
   'text-gray-500'
  "> 
    ({{ dateTimeFormats.timeDiff(props.time.time - props.wrTime.time) }})
  </span>
</template>