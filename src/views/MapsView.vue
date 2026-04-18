<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router';
  import type { Ref } from 'vue'
  import urlParams from '@/utils/urlParams';
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import MapDetails from '@/components/MapDetails.vue';
  import type { Time } from '@/types/Time';
  import SearchBoxMap from '@/components/SearchBoxMap.vue';
  import { Style } from '@/types/Style';
  import timesFilterFromQuery from '@/utils/timesFilterFromQuery';
  import { useModerationStore } from '@/stores/moderation';

  const props = defineProps({
    mapName: {
      type: String,
      required: false,
    },
  });

  const route = useRoute();
  const moderationStore = useModerationStore();
  const isLoading: Ref<boolean> = ref(false);
  const mapTimes: Ref<Time[] | null> = ref(null);
  const mapTotal: Ref<number> = ref(0);
  const mapName: Ref<string> = ref(props.mapName ?? '');

  async function updateMap(map: string){
    await getMapTimes(map);
  }

  onMounted(async () => {
    if (typeof props.mapName !== 'undefined') {
      updateMap(props.mapName);
    }
  });

  watch(() => route.query, () => {
    if (props.mapName) getMapTimes(props.mapName);
  });

  async function getMapTimes(name: string){
    mapName.value = name;
    isLoading.value = true;
    mapTimes.value = null;

    const filter = timesFilterFromQuery.fromQuery(
      urlParams.getAsObject(),
      { style: Style.normal, sort: 'Fastest', best: true, limit: 50 },
      moderationStore.canInvalidateTimes.value,
    );
    filter.map = name;

    const result = await OffstylesApi.getTimes(filter);
    mapTotal.value = result.total;
    if (result.data.length) {
      mapTimes.value = result.data;
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <SearchBoxMap @updateMap="updateMap" :placeholder="'Enter a Map'"></SearchBoxMap>
      <MapDetails v-if="mapName !== ''" :mapTimes="mapTimes" :mapName="mapName" :isLoading="isLoading" :total="mapTotal" @updateMap="updateMap"></MapDetails>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <h1 v-if="mapName === ''" class="text-lg text-gray-100 mt-5">Select a map above to view leaderboards</h1>
    </div>
  </main>
</template>
