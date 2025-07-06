<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import { computed } from 'vue';
  const props = defineProps<{
      time: Time,
      wrTime: Time | undefined,
      col: object,
    }>();
</script>


<template>
  <span>{{ props.col.format ? col.format(props.time[props.col.data]) : props.time[props.col.data] }}</span>
  <span v-if="props.col.data === 'time' && props.wrTime" 
  :class="
    props.time.time - props.wrTime.time > 0 ? 'text-red-600' :
    props.time.time - props.wrTime.time < 0 ? 'text-green-600 opacity-90' : 
   'text-gray-500'
  "> 
    ({{ dateTimeFormats.timeDiff(props.time.time - props.wrTime.time) }})
  </span>
</template>