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
  import TimesListPagination from './TimesListPagination.vue';
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
  const paginationChanged = async (page: number)=>{
    await router.replace({query:urlParams.update('page', page)});
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
      alignmentClasses: 'text-left',
      link: timeLinks.playerLink
    }, 
    {
      label: 'Server',
      data: 'server',
      width: '30%',
      classes: 'text-sm text-gray-400',
      alignmentClasses: 'text-left text-gray-300'
    },
    {
      label: 'Date',
      data: 'date',
      width:'15%',
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.date
    },
    {
      label: 'Time',
      data: 'time',
      width: '30%',
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.time
    }]"
    @refresh-data="() => emit('updateMap', props.mapName)"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected map & style</h1>
    <TimesListPagination :limitPerPage="50" :times="props.mapTimes" :isLoading = "props.isLoading" @pagination-changed="paginationChanged"></TimesListPagination>
  </div>
</template>