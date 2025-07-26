<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Ref } from 'vue';
  import urlParams from '@/utils/urlParams';
  const emit = defineEmits(['checkbox-Changed']);
  const props = defineProps<{
    name: string,
    label: string,
  }>()
  const currentInput : Ref<boolean> = ref(urlParams.getAsObject().wr ? urlParams.getAsObject().wr === 'true' : true);
  
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
