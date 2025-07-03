<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import ComboBox from '@/components/ComboBox.vue';
  import { useRouter } from 'vue-router'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import MapDetails from '@/components/MapDetails.vue';

  const router = useRouter();

  const props = defineProps({
    map: {
      type: String,
      required: false,
    },
  });

  const maps: Ref<object[]> = ref([]);
  
  const selected_map: Ref<object> = ref({});
  const is_map_set = computed(() => {return (Object.keys(selected_map.value).length > 0) && selected_map.value.hasOwnProperty('name')});

  //update selected_map & url
  function selectChanged(map:object){
    selected_map.value = map;
    router.push(is_map_set.value ? '/map/'+selected_map.value.name : '/map');
  }

  onMounted(async ()=>{
    const apiMaps = await OffstylesApi.getMapsList();
    if(apiMaps.length){
      maps.value = apiMaps;
    }
    //set initial map from url
    if(typeof props.map !== 'undefined'){
      selected_map.value = maps.value.find((map)=>map.name === props.map) ?? {};
    }
  });
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <ComboBox :select_options="maps" :selected_option="selected_map" :is_loading="maps.length === 0" :type="'map'" @select-Changed="selectChanged"></ComboBox>
        <MapDetails v-if="is_map_set" :map="selected_map"></MapDetails>
        <div v-else class="mt-8">
          <div v-if="!maps.length && props.map">
            <loadWheel class="text-gray-200"></loadWheel>
          </div>
          <h1 v-else class="text-lg text-gray-100">Select a map above to view leaderboards</h1>
        </div>
    </div>
  </main>
</template>