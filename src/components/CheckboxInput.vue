<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Ref } from 'vue';
  import urlParams from '@/utils/urlParams';
  const emit = defineEmits(['checkbox-Changed']);
  const props = withDefaults(defineProps<{
    name: string,
    label: string,
    defaultValue?: boolean,
  }>(), {
    defaultValue: true,
  });
  const paramValue = urlParams.getAsObject()[props.name];
  const currentInput : Ref<boolean> = ref(paramValue !== undefined ? paramValue === 'true' : props.defaultValue);
  
  watch(currentInput, async() => {
    emit('checkbox-Changed', props.name, currentInput.value);
  });
</script>

<template>
  <div class="flex items-center gap-2">
    <input :id="props.name" :name="props.name" v-model="currentInput" type="checkbox">
    <label :for="props.name">{{props.label}}</label>
  </div>
</template>
