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
  const loadError: Ref<string | null> = ref(null);

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
    loadError.value = null;

    const filter = timesFilterFromQuery.forMap(
      urlParams.getAsObject(),
      name,
      { style: Style.normal, sort: 'Fastest', best: true, limit: 50 },
      moderationStore.canInvalidateTimes.value,
    );

    try {
      const result = await OffstylesApi.getTimes(filter);
      mapTotal.value = result.total;
      if (result.data.length) {
        mapTimes.value = result.data;
      }
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load times';
      console.error('Failed to fetch map times:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <SearchBoxMap @updateMap="updateMap" :placeholder="'Enter a Map'"></SearchBoxMap>
      <MapDetails v-if="mapName !== ''" :mapTimes="mapTimes" :mapName="mapName" :isLoading="isLoading" :total="mapTotal" @updateMap="updateMap"></MapDetails>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <div v-if="loadError && !isLoading" class="text-red-400 bg-red-900/20 p-4 rounded-lg mt-5 max-w-[600px]">
        <p>Failed to load times: {{ loadError }}</p>
        <button @click="updateMap(mapName)" class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Retry</button>
      </div>
      <h1 v-if="mapName === ''" class="text-lg text-gray-100 mt-5">Select a map above to view leaderboards</h1>
    </div>
  </main>
</template>
