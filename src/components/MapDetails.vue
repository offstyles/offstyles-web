<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import TimesFilterBar from './TimesFilterBar.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import type { SortOrder } from '@/types/TimesFilter';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRoute, useRouter } from 'vue-router';
  import { computed } from 'vue';
  import TimesListPagination from './TimesListPagination.vue';

  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits(['updateMap']);

  const props = defineProps<{
    mapName : string,
    mapTimes: Time[] | null,
    isLoading: boolean,
    total: number,
  }>()

  const mapStyleOptions = [Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented];

  const currentFilter = computed(() => {
    const q = route.query as Record<string, string>;
    return {
      style: q.style ? Number(q.style) : Style.normal,
      sort: (q.sort as SortOrder) || 'Fastest',
      best: q.best !== undefined ? q.best === 'true' : true,
      hasReplay: q.has_replay === 'true',
      invalidated: q.invalidated !== undefined ? q.invalidated === 'true' : undefined,
    };
  });

  const filterChanged = async (name: string, value: string | number | boolean | undefined) => {
    await router.replace({ query: urlParams.updateMany({ [name]: value }) });
  };

  const paginationChanged = async (page: number) => {
    await router.replace({ query: urlParams.update('page', page) });
  };
</script>


<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ mapName }}</h1>
    <TimesFilterBar
      :styleValue="currentFilter.style"
      :sort="currentFilter.sort"
      :best="currentFilter.best"
      :hasReplay="currentFilter.hasReplay"
      :invalidated="currentFilter.invalidated"
      :styleOptions="mapStyleOptions"
      @filter-Changed="filterChanged"
    />
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
      alignmentClasses: 'text-right justify-end',
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
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected map & filters</h1>
    <TimesListPagination :limitPerPage="50" :times="props.mapTimes" :isLoading="props.isLoading" :total="props.total" @pagination-changed="paginationChanged"></TimesListPagination>
  </div>
</template>
