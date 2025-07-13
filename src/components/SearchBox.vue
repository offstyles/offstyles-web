<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from './icons/loadWheel.vue';
  import urlParams from '@/utils/urlParams';
  const currentInput : Ref<string> = ref('');
  const autoCompleteResults : Ref<string[]> = ref([]);
  const showAutoCompleteDropdown : Ref<boolean> = ref(false);
  const isLoading : Ref<boolean> = ref(false);
    
  let debounce : ReturnType<typeof setTimeout>;
  const updateMapAutoComplete = () => {
    isLoading.value = true;
    if(debounce){
      clearTimeout(debounce);
    }
    debounce = setTimeout(async ()=>{
      if(currentInput.value){
        autoCompleteResults.value = await OffstylesApi.getMapsForAutoComplete(currentInput.value);
        autoCompleteResults.value.sort((a,b)=>{
          if(a.indexOf(currentInput.value) === b.indexOf(currentInput.value)){
            return a.localeCompare(b);
          }
          return a.indexOf(currentInput.value) - b.indexOf(currentInput.value);
      });
      }
      isLoading.value = false;
    }, 600);
  }
  const params = computed(()=>{return urlParams.get()});
</script>

<template>
  <div class="relative group">
    <input
    v-model="currentInput"
    @input="updateMapAutoComplete"
    @click="showAutoCompleteDropdown = true"
    placeholder = "Enter a Map"
    class="rounded-lg bg-main-800 text-left border border-transparent focus-within:border-main-50 py-2 px-3 text-sm leading-5 text-gray-200 placeholder:text-gray-500 outline-none">
    <div class="absolute top-full w-full rounded-lg bg-main-900 border border-main-100 text-sm text-gray-300 mt-1 py-2 px-2 shadow-lg/20 hidden group-focus-within:block" v-if="showAutoCompleteDropdown && currentInput">
      <loadWheel v-if="isLoading" class="text-gray-300 flex mx-auto w-6 h-6"></loadWheel>
      <router-link v-else v-for="(result, index) in autoCompleteResults.slice(0, 6)" :to="{path:`/maps/${result}/?${params}`, query:urlParams.getAsObject()}" :key="index"
        @click="$emit('updateMap', result); showAutoCompleteDropdown = false"
        class="py-1 px-1.5 hover:bg-main-600 rounded-sm block truncate">{{ result }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.disabled{
  pointer-events:none;
  opacity:0.4;
}
</style>