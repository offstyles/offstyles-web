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
  import CheckboxInput from './CheckboxInput.vue';
  import TimesListPagination from './TimesListPagination.vue';
  const router = useRouter();

  const emit = defineEmits(['updateRecentTimes']);

  const props = defineProps<{
    recentTimes: Time[] | null,
    isLoading: boolean
  }>()
 
  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updateRecentTimes');
  }
  const paginationChanged = async (page: number)=>{
    await router.replace({query:urlParams.update('page', page)});
    emit('updateRecentTimes');
  }
</script>


<template>
  <div class="text-white w-full max-w-[1000px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-2">Recent Times</h1>
    <p class="text-sm text-gray-400 mb-4">Displaying records from the last 2 weeks</p>
    <div class="flex py-2 justify-between flex-wrap gap-3">
      <CustomDropdown :options="[Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" @dropdown-Changed="dropdownChanged"></CustomDropdown>
      <CheckboxInput @checkbox-Changed="dropdownChanged" :name="'wr'" :label="'Only show WR times'"></CheckboxInput>
    </div>
    <TimesList v-if="props.recentTimes" :times="props.recentTimes" :cols="[{
      label: 'Player',
      data: 'name',
      width:'20%',
      alignmentClasses: 'text-left',
      link: timeLinks.playerLink
    }, 
    {
      label: 'Map',
      data: 'map',
      width: '20%',
      alignmentClasses: 'text-right justify-end md:justify-start md:text-left',
      link: timeLinks.mapLink
    },
    {
      label: 'Server',
      data: 'server',
      width: '20%',
      alignmentClasses: 'text-right justify-end md:justify-start md:text-left text-gray-300'
    },
    {
      label: 'Date',
      data: 'date',
      width: '15%',
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.date
    },
    {
      label: 'Time',
      data: 'time',
      width: '25%',
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.time
    }]"
    @refresh-data="emit('updateRecentTimes')"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected parameters</h1>
    <TimesListPagination :limitPerPage="15" :times="props.recentTimes" :isLoading = "props.isLoading" @pagination-changed="paginationChanged"></TimesListPagination>
  </div>
</template>