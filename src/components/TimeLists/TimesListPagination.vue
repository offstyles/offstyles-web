<script setup lang="ts">
import type { Time } from '@/types/Time';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
  const props = defineProps<{
    limitPerPage: number,
    times: Time[] | null,
    isLoading: boolean
  }>()
  const emit = defineEmits(['pagination-Changed']);
  const route = useRoute();
  
  // Make currentPage reactive to URL changes
  const currentPage = computed(() => {
    const pageParam = route.query.page;
    return pageParam ? Number(pageParam) : 1;
  });

  function paginationChanged(page : number){
    emit('pagination-Changed', page);
  }
</script>


<template>
  <div class="w-full py-2 flex justify-between align-end">
    <div class="text-gray-400 text-sm my-auto">
      Page <span class="text-base text-gray-200">{{ currentPage }}</span>
    </div>
    <div class="flex items-center gap-1 text-gray-200">
      <button class="btn bg-main-900 rounded p-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none" @click="paginationChanged(currentPage-1)" :disabled="props.isLoading || currentPage <= 1">
        <svg xmlns="http://www.w3.org/2000/svg" x-bind:width="size" x-bind:height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" x-bind:stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
          <path d="M15 6l-6 6l6 6"></path>
        </svg>
      </button>
      <button class="btn bg-main-900 rounded p-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none" @click="paginationChanged(currentPage+1)" :disabled="props.isLoading || (props.times !== null && props.times.length < props.limitPerPage)">
        <svg xmlns="http://www.w3.org/2000/svg" x-bind:width="size" x-bind:height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" x-bind:stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
          <path d="M9 6l6 6l-6 6"></path>
        </svg>
      </button>
    </div>
  </div>
</template>