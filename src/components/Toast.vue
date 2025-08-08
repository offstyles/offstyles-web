<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-2"
  >
    <div
      v-if="show"
      :class="[
        'fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto p-4',
        typeClasses
      ]"
    >
      <div class="flex items-start">
        <div class="shrink-0">
          <div :class="iconClasses" class="h-6 w-6 rounded-full flex items-center justify-center">
            <svg v-if="type === 'success'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type === 'error'" class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-100">{{ title }}</p>
          <p v-if="message" class="mt-1 text-sm text-gray-300">{{ message }}</p>
        </div>
        <div class="ml-4 shrink-0 flex">
          <button
            @click="close"
            class="rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none transition-colors cursor-pointer"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

interface Props {
  show: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000
});

const emit = defineEmits<{
  close: [];
}>();

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-main-800 border border-green-600';
    case 'error':
      return 'bg-main-800 border border-red-600';
    case 'warning':
      return 'bg-main-800 border border-yellow-600';
    default:
      return 'bg-main-800 border border-blue-600';
  }
});

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-700';
    case 'error':
      return 'bg-red-700';
    case 'warning':
      return 'bg-yellow-700';
    default:
      return 'bg-blue-700';
  }
});

const close = () => {
  emit('close');
};

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>
