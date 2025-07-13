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

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName : string,
    playerSteamId : string,
    playerTimes: Time[] | null,
    isLoading: boolean
  }>()
 
  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updatePlayer', props.playerSteamId);
  }
</script>


<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ playerName }}</h1>
    <div class="flex py-2">
      <CustomDropdown :options="[Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" @dropdown-Changed="dropdownChanged"></CustomDropdown>
    </div>
    <TimesList v-if="props.playerTimes" :times="props.playerTimes" :cols="[{
      label: 'Map',
      data: 'map',
      placement: true,
      width:'25%',
      classes: 'text-left',
      link: timeLinks.mapLink
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
      classes: 'text-right justify-end',
      numFormat: dateTimeFormats.date
    },
    {
      label: 'Time',
      data: 'time',
      width: '30%',
      classes: 'text-right justify-end',
      numFormat: dateTimeFormats.time
    }]"></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected player & style</h1>
  </div>
</template>