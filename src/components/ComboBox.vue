<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
  } from '@headlessui/vue';
  import IconCheck from '@/components/icons/IconCheck.vue';
  import IconChevronDown from '@/components/icons/IconChevronDown.vue';
  import loadWheel from '@/components/icons/loadWheel.vue';

  const props = defineProps<{
    select_options: object[],
    selected_option: { id?:number, name?:string },
    type: string,
    is_loading?: boolean,
  }>()

  const selected = ref<object>(props.selected_option);

  //update selected when parent selected_option changes
  const selectedProp = computed(()=>{return props.selected_option});
  watch(selectedProp, async()=>{
    if(props.selected_option !== selected.value){
      selected.value = props.selected_option;
    }
  });

  const emit = defineEmits(['select-Changed']);
  watch(selected, async() => {
    emit('select-Changed', selected.value !== null ? selected.value : {});
  });

  const query = ref('');
  const filteredOptions = computed(() =>
    query.value === ''
      ? props.select_options
      : props.select_options.filter((option) =>
          option.name
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.value.toLowerCase().replace(/\s+/g, ''))
        )
  )
</script>

<template>
  <Combobox v-model="selected" nullable  v-slot="{open}" :class="is_loading ? 'disabled' : ''">
        <div class="relative mt-1 w-64">
          <div class="relative cursor-default overflow-hidden rounded-lg bg-main-800 text-left sm:text-sm border focus-within:border-main-50"
           :class="open ? 'border-main-50' : 'border-transparent'">
            <ComboboxInput
              class="w-full py-2 pl-3 pr-10 text-sm leading-5 text-gray-200 placeholder:text-gray-300"
              :placeholder="'Enter a '+props.type"
              :displayValue="(option) => option?.name"
              @change="query = $event.target.value;"
              
            />
            <ComboboxButton class="absolute inset-y-0 right-0 flex items-center px-2 bg-main-800 cursor-pointer">
              <loadWheel v-if="is_loading" class="h-4 w-4 text-gray-400"></loadWheel>
              <IconChevronDown v-else class="h-4 w-4 text-gray-400" aria-hidden="true" />
            </ComboboxButton>
          </div>
          <TransitionRoot
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            @after-leave="query = ''"
          >
            <ComboboxOptions class="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-main-700 text-gray-200 py-1 text-base sm:text-sm border border-main-50">
              <div v-if="filteredOptions.length === 0 && query !== ''" class="relative cursor-default select-none px-4 py-2" >
                No {{ props.type }}s found
              </div>
              <ComboboxOption
                v-for="option in filteredOptions" as="template"
                :key="option.id"
                :value="option"
                v-slot="{ selected, active }"
              >
                <li class="relative cursor-pointer select-none py-2 pl-10 pr-4"
                  :class="{
                    'bg-main-300 text-white': active,
                  }" >
                  <span class="block truncate" :class="{ 'font-medium': selected, 'font-normal': !selected }" >
                    {{ option.name }}
                  </span>
                  <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3"
                    :class="{ 'text-white': active }" >
                    <IconCheck class="h-5 w-5" aria-hidden="true" />
                  </span>
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </TransitionRoot>
        </div>
      </Combobox>
</template>

<style scoped>
.disabled{
  pointer-events:none;
  opacity:0.4;
}
</style>