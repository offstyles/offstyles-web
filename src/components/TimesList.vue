<script setup lang="ts">
import TimesListItem from './TimesListItem.vue';
import type { Time } from '@/types/Time';

  const props = defineProps<{
      times: Time[],
    }>()
</script>


<template>
  <TimesListItem v-for="(time,index) in props.times" :key="index" :time="time" :fields="[]"></TimesListItem>
</template>