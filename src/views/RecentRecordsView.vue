<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import RecentTimes from '@/components/RecentTimes.vue';
  import urlParams from '@/utils/urlParams';
  import type { Time } from '@/types/Time';
  
  const isLoading: Ref<boolean> = ref(false);
  const recentTimes: Ref<Time[] | null> = ref(null);
  onMounted(async ()=>{
    getRecentTimes();
  });
  async function getRecentTimes(){
    isLoading.value = true;
    recentTimes.value = null;
    const paramsObj = urlParams.getAsObject();
    const apiRecentTimes = await OffstylesApi.getRecentTimes(paramsObj.style);
    if(apiRecentTimes.length){
      recentTimes.value = apiRecentTimes;
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <RecentTimes :recentTimes="recentTimes" :isLoading="isLoading" @updateRecentTimes="getRecentTimes"></RecentTimes>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
    </div>
  </main>
</template>