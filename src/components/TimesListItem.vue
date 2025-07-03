<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import timeFormat from '@/utils/timeFormat';
  const props = defineProps<{
      time: Time,
      fields: string[],
    }>()
</script>


<template>
  <div :class="`columns-[${props.fields.length}]`">
    <div>{{ props.time.name }} {{ timeFormat(props.time.time) }}</div>
  </div>
</template>