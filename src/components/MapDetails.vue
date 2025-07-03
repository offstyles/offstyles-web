<script setup lang="ts">
  import { computed, ref, onMounted, watch } from 'vue';
  import TimesList from './TimesList.vue';
  import OffstylesApi from '@/api/offstylesApi';
  import type { Time } from '@/types/Time';
  import type { Ref } from 'vue'


  const props = defineProps<{
    map: { id:number, name:string },
  }>()
  const currentMap = computed(()=>{return props.map});
  const times : Ref<Time[] | []> = ref([]);
  watch(currentMap, async()=>{
    const apiTimes = await OffstylesApi.getTimesByMap(props.map.name);
    if(apiTimes.length){
      times.value = apiTimes;
    }
  },
  { immediate: true });
</script>


<template>
  <div class="text-white w-full max-w-[700px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ props.map.name }}</h1>
    <p class="text-gray-200">info go here</p>
    
    <TimesList :times="times"></TimesList>
    
  </div>
</template>