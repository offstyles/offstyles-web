<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';


  const props = defineProps<{
    mapTimes: Time[],
  }>()
</script>


<template>
  <div class="text-white w-full max-w-[700px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ props.mapTimes[0].map }}</h1>
    
    <TimesList :times="props.mapTimes" :cols="[{
      label: 'Player',
      data: 'name',
      placement: true,
      width:'25%',
      classes: 'text-left',
      link: timeLinks.playerLink
    }, 
    {
      label: 'Date',
      data: 'date',
      width:'35%',
      classes: 'text-right',
      format: dateTimeFormats.date
    },
    {
      label: 'Time',
      data: 'time',
      width: '40%',
      classes: 'text-right',
      format: dateTimeFormats.time
    }]"></TimesList>
    
  </div>
</template>