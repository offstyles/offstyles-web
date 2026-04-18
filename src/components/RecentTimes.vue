<script setup lang="ts">
  import TimesList from './TimesList.vue';
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
  import TimesListPagination from './TimesListPagination.vue';
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
    const columns: TimeListColumn[] = [
      {
        label: 'Player',
        data: 'name',
        width: showStyleColumn.value ? '18%' : '20%',
        classes: 'font-semibold',
        alignmentClasses: 'text-left',
        link: timeLinks.playerLink
      },
      {
        label: 'Map',
        data: 'map',
        width: showStyleColumn.value ? '18%' : '20%',
        classes: 'text-gray-200',
        alignmentClasses: 'text-right justify-end md:justify-start md:text-left',
        link: timeLinks.mapLink
      }
    ];

    if (showStyleColumn.value) {
      columns.push({
        label: 'Style',
        data: 'style',
        width: '12%',
        classes: 'text-sm text-gray-400',
        alignmentClasses: 'text-right justify-end md:justify-start md:text-left',
        numFormat: styleFormat.name
      });
    }

    columns.push(
      {
        label: 'Server',
        data: 'server',
        width: showStyleColumn.value ? '18%' : '20%',
        classes: 'text-sm text-gray-400',
        alignmentClasses: 'text-right justify-end md:justify-start md:text-left text-gray-300'
      },
      {
        label: 'Date',
        data: 'date',
        width: showStyleColumn.value ? '12%' : '15%',
        alignmentClasses: 'text-right justify-end',
        numFormat: dateTimeFormats.date
      },
      {
        label: 'Time',
        data: 'time',
        width: showStyleColumn.value ? '22%' : '25%',
        alignmentClasses: 'text-right justify-end monospace',
        numFormat: dateTimeFormats.time
      }
    );

    return columns;
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
    <TimesListPagination :limitPerPage="15" :times="props.recentTimes" :isLoading = "props.isLoading" :total="props.total" @pagination-changed="paginationChanged"></TimesListPagination>
  </div>
</template>