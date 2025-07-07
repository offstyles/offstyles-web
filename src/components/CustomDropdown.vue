<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { Ref } from 'vue';
  import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
  import IconCheck from './icons/IconCheck.vue';
  import IconChevronUpDown from './icons/IconChevronUpDown.vue';
  import { Style } from '@/types/Style';
  const emit = defineEmits(['dropdown-Changed']);
  
  const props = defineProps<{
    options: number[], 
    name: string,
    format: (value: number) => string
  }>()

  const currentInput : Ref<number> = ref(Style.normal);
  
  watch(currentInput, async() => {
    emit('dropdown-Changed', props.name, currentInput.value);
  });
</script>

<template>
  <Listbox v-model="currentInput" :name="props.name" class="w-auto">
    <div class="relative min-w-40">
      <ListboxButton class="w-full" v-slot="{open}">
        <div :class="[
          open?'border border-main-400':'border border-transparent',
          'bg-main-700 p-2 px-5 rounded-md w-full text-left']">
          {{ props.format ? props.format(currentInput) : currentInput }}
          <span class="pointer-events-none absolute right-0 inset-y-0 flex items-center pe-1">
            <IconChevronUpDown></IconChevronUpDown>
          </span>
        </div>
      </ListboxButton>
      <ListboxOptions class="absolute mt-1 w-full overflow-auto rounded-md bg-main-800 p-1 py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-[999] border border-main-400 drop-shadow-lg">
        <ListboxOption v-for="(val, index) in props.options" :value="val" :key="'region'+index" v-slot="{ active, selected }" as="template">
          <li :class="[
                active ? 'bg-main-400 text-gray-100' : selected ? 'bg-main-600 text-gray-200' : 'text-gray-300',
                'relative cursor-default select-none py-2 my-1 pl-9 pr-4 rounded',
              ]">
              <span
                :class="[
                  'block truncate',
                ]">
                {{ props.format ? props.format(val) : val }}
              </span>
              <span
                v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-200">
                <IconCheck class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
