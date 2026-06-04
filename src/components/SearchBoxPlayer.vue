<script setup lang="ts">
  import { ref } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from './icons/loadWheel.vue';
  import urlParams from '@/utils/urlParams';
  const currentInput : Ref<string> = ref('');
  const autoCompleteResults : Ref<[string, string, string?][]> = ref([]);
  const showAutoCompleteDropdown : Ref<boolean> = ref(false);
  const isLoading : Ref<boolean> = ref(false);
  const props = defineProps<{
    placeholder: string,
  }>()

  const hideAvatarOnError = (event: Event) => {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  let debounce : ReturnType<typeof setTimeout>;
  const updatePlayerAutoComplete = () => {
    isLoading.value = true;
    if(debounce){
      clearTimeout(debounce);
    }
    debounce = setTimeout(async () => {
        try {
            autoCompleteResults.value = await OffstylesApi.getPlayersForAutoComplete(currentInput.value);
            showAutoCompleteDropdown.value = autoCompleteResults.value.length > 0;
        } catch (error) {
            console.error('Error fetching autocomplete results:', error);
            autoCompleteResults.value = [];
            showAutoCompleteDropdown.value = false;
        } finally {
            isLoading.value = false;
        }
    }, 600);
  }
</script>

<template>
  <div class="relative group">
    <input
    v-model="currentInput"
    @input="updatePlayerAutoComplete"
    @click="showAutoCompleteDropdown = true"
    :placeholder = "props.placeholder"
    class="rounded-lg bg-main-800 text-left border border-transparent focus-within:border-main-50 py-2 px-3 text-sm leading-5 text-gray-200 placeholder:text-gray-500 outline-none">
    <div class="absolute top-full w-full rounded-lg bg-main-900 border border-main-100 text-sm text-gray-300 mt-1 py-2 px-2 shadow-xl/20 hidden group-focus-within:block z-[999]" v-if="showAutoCompleteDropdown && currentInput">
      <loadWheel v-if="isLoading" class="text-gray-300 flex mx-auto w-6 h-6"></loadWheel>
      <router-link v-else v-for="(result, index) in autoCompleteResults.slice(0, 6)" :to="{path:`/players/${result[1]}/`, query:urlParams.clearPage()}" :key="index"
        @click="$emit('updatePlayer', result[1]); showAutoCompleteDropdown = false"
        class="flex items-center gap-2 py-1 px-1.5 hover:bg-main-600 rounded-sm min-w-0">
        <img v-if="result[2]" :src="result[2]" :alt="result[0]" @error="hideAvatarOnError" class="w-5 h-5 rounded-full flex-shrink-0" />
        <span class="truncate">{{ result[0] }}</span>
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