<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import ComboBox from '@/components/ComboBox.vue';
  import { useRouter } from 'vue-router'
  import type { Ref } from 'vue'

  const router = useRouter();

  const props = defineProps({
    map: {
      type: String,
      required: false,
    },
  });

  const maps = [
    {id:1,name:'bhop_beginner'},
    {id:2,name:'bhop_easy'},
    {id:3,name:'bhop_hard'},
    {id:4,name:'bhop_bigmichael'},
    {id:5,name:'bhop_idk'},
    {id:6,name:'bhop_update'},
  ];
  const selected_map: Ref<object> = ref({});
  const is_map_set = computed(() => {return (Object.keys(selected_map.value).length > 0) && selected_map.value.hasOwnProperty('name')});

  //update selected_map & url
  function selectChanged(map:object){
    selected_map.value = map;
    router.push(is_map_set.value ? '/map/'+selected_map.value.name : '/map');
  }

  //set initial map from url
  onMounted(()=>{
    if(typeof props.map !== 'undefined'){
      selected_map.value = maps.find((map)=>map.name === props.map) ?? {};
    }
  });
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <ComboBox :select_options="maps" :selected_option="selected_map" :type="'map'" @select-Changed="selectChanged"></ComboBox>
      <div v-if="is_map_set" class="text-white w-full max-w-[700px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
        <h1 class="text-2xl mb-3">{{ selected_map.name }}</h1>
        <p class="text-gray-200">info go here</p>
      </div>
      <div v-else><h1 class="text-lg text-gray-100 mt-8">Select a map above to view leaderboards</h1></div>
    </div>
  </main>
</template>