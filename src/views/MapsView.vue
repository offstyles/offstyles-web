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

  const props = defineProps({
    mapName: {
      type: String,
      required: false,
    },
  });
  
  const route = useRoute();
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

  watch(() => route.query, () => {
    getMapTimes(props.mapName!);
  })

  async function getMapTimes(name: string){
    mapName.value = name;
    isLoading.value = true;
    mapTimes.value = null;
    const paramsObj = urlParams.getAsObject();
    
    // Convert string params to numbers with defaults
    const style = paramsObj.style ? parseInt(paramsObj.style) : Style.normal;
    const page = paramsObj.page ? parseInt(paramsObj.page) : 1;
    
    const apiMapTimes = await OffstylesApi.getTimesByMap(name, style, undefined, undefined, page);
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