<script setup lang="ts">
  import TimesList from './TimeLists/TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRouter } from 'vue-router';
  import CheckboxInput from './CheckboxInput.vue';
  import TimesListPagination from './TimeLists/TimesListPagination.vue';
  import { ref, computed } from 'vue';
  import type { Ref } from 'vue';

  const router = useRouter();

  const emit = defineEmits(['updateRecentTimes']);

  const props = defineProps<{
    recentTimes: Time[] | null,
    isLoading: boolean,
    total: number,
  }>()

  const currentStyle: Ref<number> = ref(urlParams.getAsObject().style ? Number(urlParams.getAsObject().style) : Style.all);

  const showStyleColumn = computed(() => currentStyle.value === Style.all);

  const tableColumns = computed((): TimeListColumn[] => {
    const playerCol: TimeListColumn = {
      label: 'Player',
      data: 'name',
      col: 1,
      row: 1,
      rowSpan: 2,
      colMobile: 1,
      rowMobile: 1,
      width: showStyleColumn.value ? '20%' : '25%',
      widthMobile: '30%',
      classes: 'font-semibold',
      alignmentClasses: 'text-left justify-start',
      link: timeLinks.playerLink,
    };

    const mapCol: TimeListColumn = {
      label: 'Map',
      data: 'map',
      col: 2,
      row: 1,
      colMobile: 1,
      colSpanMobile: 2,
      rowMobile: 2,
      width: showStyleColumn.value ? '35%' : '45%',
      classes: 'text-gray-200',
      alignmentClasses: 'text-left justify-start',
      link: timeLinks.mapLink,
    };

    const serverCol: TimeListColumn = {
      label: 'Server',
      data: 'server',
      col: 2,
      row: 2,
      colMobile: 1,
      colSpanMobile: 2,
      rowMobile: 3,
      classes: 'text-xs text-gray-400',
      alignmentClasses: 'text-left justify-start text-gray-300',
    };

    const timeCol: TimeListColumn = {
      label: 'Time',
      data: 'time',
      col: 3,
      row: 1,
      rowSpan: showStyleColumn.value ? 2 : undefined,
      colMobile: 2,
      colSpanMobile: 2,
      rowMobile: 1,
      width: '30%',
      widthMobile: '20%',
      classes: 'monospace',
      alignmentClasses: showStyleColumn.value
        ? 'text-right justify-end lg:text-left lg:justify-start lg:ml-16'
        : 'text-right justify-end',
      numFormat: dateTimeFormats.time,
    };

    if (showStyleColumn.value) {
      return [
        playerCol,
        mapCol,
        serverCol,
        timeCol,
        {
          label: 'Style',
          data: 'style',
          col: 4,
          row: 1,
          colMobile: 3,
          rowMobile: 2,
          width: '15%',
          classes: 'text-sm text-gray-400',
          alignmentClasses: 'text-right justify-end',
          numFormat: styleFormat.name,
        },
        {
          label: 'Date',
          data: 'date',
          col: 4,
          row: 2,
          colMobile: 3,
          rowMobile: 3,
          classes: 'text-xs text-gray-400',
          alignmentClasses: 'text-right justify-end',
          numFormat: dateTimeFormats.date,
        },
      ];
    }

    return [
      playerCol,
      mapCol,
      serverCol,
      timeCol,
      {
        label: 'Date',
        data: 'date',
        col: 3,
        row: 2,
        colMobile: 2,
        rowMobile: 3,
        classes: 'text-xs text-gray-400',
        alignmentClasses: 'text-right justify-end',
        numFormat: dateTimeFormats.date,
      },
    ];
  });

  const dropdownChanged = async (name : string, value : number)=>{
    if (name === 'style') {
      currentStyle.value = value;
    }
    await router.replace({query:urlParams.update(name, value)});
  }
  const paginationChanged = async (page: number)=>{
    await router.replace({query:urlParams.update('page', page)});
  }
</script>


<template>
  <div class="text-white w-full max-w-5xl p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-2">Recent Times</h1>
    <p class="text-sm text-gray-400 mb-4">Displaying records from the last 2 weeks</p>
    <div class="flex py-2 justify-between flex-wrap gap-3">
      <CustomDropdown :options="[Style.all, Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" :default="Style.all" @dropdown-Changed="dropdownChanged"></CustomDropdown>
      <CheckboxInput @checkbox-Changed="dropdownChanged" :name="'wr'" :label="'Only show WR times'" :default="true"></CheckboxInput>
    </div>
    <TimesList v-if="props.recentTimes" :times="props.recentTimes" :cols="tableColumns"
    @refresh-data="emit('updateRecentTimes')"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected parameters</h1>
    <TimesListPagination :limitPerPage="15" :isLoading = "props.isLoading" :total="props.total" @pagination-changed="paginationChanged"></TimesListPagination>
  </div>
</template>
