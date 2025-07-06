<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import ComboBox from '@/components/ComboBox.vue';
  import { useRouter } from 'vue-router'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import MapDetails from '@/components/MapDetails.vue';
  import type { Time } from '@/types/Time';

  const router = useRouter();

  const props = defineProps({
    mapName: {
      type: String,
      required: false,
    },
  });
  
  const isLoading: Ref<boolean> = ref(false);
  const mapTimes: Ref<Time[] | null> = ref(null);

  //update selected_map & url
  async function updateMap(map:string){
    await getMapTimes(map);
    router.push(mapTimes.value ? '/maps/'+mapTimes.value[0].map : '/maps');
  }

  onMounted(async ()=>{
    //set initial map from url
    if(typeof props.mapName !== 'undefined'){
      updateMap(props.mapName);
    }
  });

  async function getMapTimes(mapName: string){
    isLoading.value = true;
    mapTimes.value = null;
    const apiMapTimes = await OffstylesApi.getTimesByMap(mapName);
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
      <MapDetails v-if="mapTimes" :mapTimes="mapTimes"></MapDetails>
      <div v-else class="mt-8">
        <div v-if="isLoading">
          <loadWheel class="text-gray-200"></loadWheel>
        </div>
        <h1 v-else class="text-lg text-gray-100">Select a map above to view leaderboards</h1>
      </div>
    </div>
  </main>
</template>