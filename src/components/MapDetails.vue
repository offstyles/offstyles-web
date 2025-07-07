<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRouter } from 'vue-router';
  const router = useRouter();

  const emit = defineEmits(['updateMap']);

  const props = defineProps<{
    mapName : string,
    mapTimes: Time[] | null,
    isLoading: boolean
  }>()
 
  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updateMap', props.mapName);
  }
</script>


<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ mapName }}</h1>
    <div class="flex py-2">
      <CustomDropdown :options="[Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" @dropdown-Changed="dropdownChanged"></CustomDropdown>
    </div>
    <TimesList v-if="props.mapTimes" :times="props.mapTimes" :cols="[{
      label: 'Player',
      data: 'name',
      placement: true,
      width:'25%',
      classes: 'text-left',
      link: timeLinks.playerLink
    }, 
    {
      label: 'Server',
      data: 'server',
      width: '30%',
      classes: 'text-left'
    },
    {
      label: 'Date',
      data: 'date',
      width:'15%',
      classes: 'text-right',
      numFormat: dateTimeFormats.date
    },
    {
      label: 'Time',
      data: 'time',
      width: '30%',
      classes: 'text-right',
      numFormat: dateTimeFormats.time
    }]"></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected map & style</h1>
  </div>
</template>