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

  onMounted(getRecentTimes);

  watch(() => route.query, getRecentTimes);

  async function getRecentTimes(){
    isLoading.value = true;
    recentTimes.value = null;
    const paramsObj = urlParams.getAsObject();

    const styleRaw = paramsObj.style ? parseInt(paramsObj.style) : Style.all;
    const filter: TimesFilter = {
      style: styleRaw === Style.all ? undefined : styleRaw,
      page: paramsObj.page ? parseInt(paramsObj.page) : 1,
      limit: 15,
      wr: paramsObj.wr !== undefined ? paramsObj.wr === 'true' : true,
      recent: true,
      best: false,
    };

    const result = await OffstylesApi.getTimes(filter);
    recentTotal.value = result.total;
    if (result.data.length) {
      recentTimes.value = result.data;
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <RecentTimes :recentTimes="recentTimes" :isLoading="isLoading" :total="recentTotal" @updateRecentTimes="getRecentTimes"></RecentTimes>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <p v-if="!recentTimes && !isLoading">No recent times available.</p>
    </div>
  </main>
</template>
