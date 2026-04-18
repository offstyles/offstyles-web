<script setup lang="ts">
  import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
  import { computed } from 'vue';
  import IconCheck from './icons/IconCheck.vue';
  import IconChevronUpDown from './icons/IconChevronUpDown.vue';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import type { SortOrder } from '@/types/TimesFilter';
  import { useModerationStore } from '@/stores/moderation';

  type InvalidatedChoice = 'hide' | 'mix' | 'only';

  const SORT_OPTIONS: SortOrder[] = ['Fastest', 'Slowest', 'Newest', 'Oldest'];
  const INVALIDATED_OPTIONS: { value: InvalidatedChoice, label: string }[] = [
    { value: 'hide', label: 'Valid only' },
    { value: 'mix', label: 'Show all' },
    { value: 'only', label: 'Only invalidated' },
  ];

  const props = defineProps<{
    styleValue: number,
    sort: SortOrder,
    best: boolean,
    hasReplay: boolean,
    invalidated: boolean | undefined,
    styleOptions: number[],
  }>();

  const emit = defineEmits<{
    (e: 'filter-Changed', name: string, value: string | number | boolean | undefined): void;
  }>();

  const moderationStore = useModerationStore();

  const invalidatedValue = computed<InvalidatedChoice>(() => {
    if (props.invalidated === undefined) return 'hide';
    return props.invalidated ? 'only' : 'mix';
  });

  const invalidatedLabel = computed(() =>
    INVALIDATED_OPTIONS.find(o => o.value === invalidatedValue.value)?.label,
  );

  const styleChanged = (_: string, value: number) => {
    emit('filter-Changed', 'style', value);
  };

  const sortChanged = (value: SortOrder) => {
    emit('filter-Changed', 'sort', value);
  };

  const bestChanged = (event: Event) => {
    const checked = (event.target as HTMLInputElement).checked;
    emit('filter-Changed', 'best', checked);
  };

  const hasReplayChanged = (event: Event) => {
    const checked = (event.target as HTMLInputElement).checked;
    emit('filter-Changed', 'has_replay', checked ? true : undefined);
  };

  const invalidatedChanged = (value: InvalidatedChoice) => {
    const mapped = value === 'hide' ? undefined : value === 'only';
    emit('filter-Changed', 'invalidated', mapped);
  };
</script>

<template>
  <div class="flex py-2 flex-wrap gap-3 items-center">
    <CustomDropdown
      :options="props.styleOptions"
      :name="'style'"
      :format="styleFormat.name"
      :default="props.styleValue"
      @dropdown-Changed="styleChanged"
    />

    <Listbox :model-value="props.sort" @update:model-value="sortChanged" class="w-auto">
      <div class="relative min-w-40">
        <ListboxButton class="w-full" v-slot="{open}">
          <div :class="[
            open ? 'border border-main-400' : 'border border-transparent',
            'bg-main-700 p-2 px-5 rounded-md w-full text-left']">
            {{ props.sort }}
            <span class="pointer-events-none absolute right-0 inset-y-0 flex items-center pe-1">
              <IconChevronUpDown />
            </span>
          </div>
        </ListboxButton>
        <ListboxOptions class="absolute mt-1 w-full overflow-auto rounded-md bg-main-800 p-1 py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-[999] border border-main-400 drop-shadow-lg">
          <ListboxOption v-for="option in SORT_OPTIONS" :value="option" :key="option" v-slot="{ active, selected }" as="template">
            <li :class="[
              active ? 'bg-main-400 text-gray-100' : selected ? 'bg-main-600 text-gray-200' : 'text-gray-300',
              'relative cursor-default select-none py-2 my-1 pl-9 pr-4 rounded',
            ]">
              <span class="block truncate">{{ option }}</span>
              <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-200">
                <IconCheck class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </div>
    </Listbox>

    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" :checked="props.best" @change="bestChanged">
      <span>Best per map</span>
    </label>

    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" :checked="props.hasReplay" @change="hasReplayChanged">
      <span>Has replay</span>
    </label>

    <Listbox
      v-if="moderationStore.canInvalidateTimes.value"
      :model-value="invalidatedValue"
      @update:model-value="invalidatedChanged"
      class="w-auto"
    >
      <div class="relative min-w-40">
        <ListboxButton class="w-full" v-slot="{open}">
          <div :class="[
            open ? 'border border-main-400' : 'border border-transparent',
            'bg-main-700 p-2 px-5 rounded-md w-full text-left']">
            {{ invalidatedLabel }}
            <span class="pointer-events-none absolute right-0 inset-y-0 flex items-center pe-1">
              <IconChevronUpDown />
            </span>
          </div>
        </ListboxButton>
        <ListboxOptions class="absolute mt-1 w-full overflow-auto rounded-md bg-main-800 p-1 py-0 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-[999] border border-main-400 drop-shadow-lg">
          <ListboxOption v-for="option in INVALIDATED_OPTIONS" :value="option.value" :key="option.value" v-slot="{ active, selected }" as="template">
            <li :class="[
              active ? 'bg-main-400 text-gray-100' : selected ? 'bg-main-600 text-gray-200' : 'text-gray-300',
              'relative cursor-default select-none py-2 my-1 pl-9 pr-4 rounded',
            ]">
              <span class="block truncate">{{ option.label }}</span>
              <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-200">
                <IconCheck class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </div>
    </Listbox>
  </div>
</template>
