<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import type { SortType } from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import RecentTimes from '@/components/RecentTimes.vue';
  import urlParams from '@/utils/urlParams';
  import type { Time } from '@/types/Time';
  import { Style } from '@/types/Style';

  const TWO_WEEKS_SECONDS = 14 * 24 * 60 * 60;

  const isLoading: Ref<boolean> = ref(false);
  const recentTimes: Ref<Time[] | null> = ref(null);
  onMounted(async ()=>{
    getRecentTimes();
  });
  async function getRecentTimes(){
    isLoading.value = true;
    recentTimes.value = null;
    const paramsObj = urlParams.getAsObject();

    const style = paramsObj.style ? parseInt(paramsObj.style) : Style.all;
    const page = paramsObj.page ? parseInt(paramsObj.page) : 1;
    const wr = paramsObj.wr ? paramsObj.wr === 'true' : true;
    const best = paramsObj.best !== undefined ? paramsObj.best === 'true' : true;
    const recent = paramsObj.recent !== undefined ? paramsObj.recent === 'true' : true;
    const sort: SortType = recent ? 'Newest' : 'Fastest';

    const apiTimes = await OffstylesApi.getTimes({
      style,
      sort,
      best,
      wr,
      limit: 15,
      page,
    });

    if (apiTimes.length) {
      if (recent) {
        const cutoff = Math.floor(Date.now() / 1000) - TWO_WEEKS_SECONDS;
        const filtered = apiTimes.filter(t => t.date > cutoff);
        recentTimes.value = filtered.length ? filtered : null;
      } else {
        recentTimes.value = apiTimes;
      }
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <RecentTimes :recentTimes="recentTimes" :isLoading="isLoading" @updateRecentTimes="getRecentTimes"></RecentTimes>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <p v-if="!recentTimes && !isLoading">No recent times available.</p> <!-- Added message for no data -->
    </div>
  </main>
</template>