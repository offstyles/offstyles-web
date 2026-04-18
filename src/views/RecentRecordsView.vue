<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router';
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import RecentTimes from '@/components/RecentTimes.vue';
  import urlParams from '@/utils/urlParams';
  import type { Time } from '@/types/Time';
  import type { TimesFilter } from '@/types/TimesFilter';
  import { Style } from '@/types/Style';

  const route = useRoute();
  const isLoading: Ref<boolean> = ref(false);
  const recentTimes: Ref<Time[] | null> = ref(null);
  const recentTotal: Ref<number> = ref(0);
  const loadError: Ref<string | null> = ref(null);

  onMounted(getRecentTimes);

  watch(() => route.query, getRecentTimes);

  async function getRecentTimes(){
    isLoading.value = true;
    recentTimes.value = null;
    loadError.value = null;
    const paramsObj = urlParams.getAsObject();

    const styleRaw = paramsObj.style ? parseInt(paramsObj.style) : Style.all;
    const pageRaw = paramsObj.page ? parseInt(paramsObj.page) : 1;
    const filter: TimesFilter = {
      style: styleRaw === Style.all || Number.isNaN(styleRaw) ? undefined : styleRaw,
      page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
      limit: 15,
      wr: paramsObj.wr !== undefined ? paramsObj.wr === 'true' : true,
      recent: true,
      best: false,
    };

    try {
      const result = await OffstylesApi.getTimes(filter);
      recentTotal.value = result.total;
      if (result.data.length) {
        recentTimes.value = result.data;
      }
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load times';
      console.error('Failed to fetch recent times:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <RecentTimes :recentTimes="recentTimes" :isLoading="isLoading" :total="recentTotal" @updateRecentTimes="getRecentTimes"></RecentTimes>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <div v-if="loadError && !isLoading" class="text-red-400 bg-red-900/20 p-4 rounded-lg mt-5 max-w-[600px]">
        <p>Failed to load times: {{ loadError }}</p>
        <button @click="getRecentTimes" class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Retry</button>
      </div>
      <p v-if="!recentTimes && !isLoading && !loadError">No recent times available.</p>
    </div>
  </main>
</template>
