<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import MapDetails from '@/components/MapDetails.vue';
  import type { Time } from '@/types/Time';
  import SearchBoxMap from '@/components/SearchBoxMap.vue';

  const props = defineProps({
    mapName: {
      type: String,
      required: false,
    },
  });
  
  const isLoading: Ref<boolean> = ref(false);
  const mapTimes: Ref<Time[] | null> = ref(null);
  const mapName: Ref<string> = ref(props.mapName ?? '');

  //update selected_map & url
  async function updateMap(map:string){
    await getMapTimes(map);
  }

  onMounted(async ()=>{
    //set initial map from url
    if(typeof props.mapName !== 'undefined'){
      updateMap(props.mapName);
    }
  });

  async function getMapTimes(name: string){
    mapName.value = name;
    isLoading.value = true;
    mapTimes.value = null;
    const apiMapTimes = await OffstylesApi.getTimesByMap(name);
    if(apiMapTimes.length){
      mapTimes.value = apiMapTimes;
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <!--<ComboBox :select_options="maps" :selected_option="selected_map" :is_loading="maps.length === 0" :type="'map'" @select-Changed="selectChanged"></ComboBox>-->
      <SearchBoxMap @updateMap="updateMap" :placeholder="'Enter a Map'"></SearchBoxMap>
      <MapDetails v-if="mapName !== ''" :mapTimes="mapTimes" :mapName="mapName" :isLoading="isLoading" @updateMap="updateMap"></MapDetails>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <h1 v-if="mapName === ''" class="text-lg text-gray-100 mt-5">Select a map above to view leaderboards</h1>
    </div>
  </main>
</template>