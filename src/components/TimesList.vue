<script setup lang="ts">
import TimesListItem from './TimesListItem.vue';
import type { Time } from '@/types/Time';
import type { TimeListColumn } from '@/types/TimeListColumn';
import TimesListHeading from './TimesListHeading.vue';

  const props = defineProps<{
      times: Time[],
      cols: TimeListColumn[]
    }>()
</script>


<template>
  <TimesListHeading :cols="props.cols"></TimesListHeading>
  <TimesListItem v-for="(time,index) in props.times" :key="index" :placement="index+1" :time="time" :cols="props.cols" :wrTime="props.times[0]"></TimesListItem>
</template>