<script setup lang="ts">
import { computed } from 'vue'
import TimesListItem from './TimesListItem.vue';
import type { Time } from '@/types/Time';
import type { TimeListColumn } from '@/types/TimeListColumn';
import TimesListHeading from './TimesListHeading.vue';
import { useModerationStore } from '@/stores/moderation';
import { useBulkSelection } from '@/composables/useBulkSelection';

  const props = defineProps<{
      times: Time[],
      cols: TimeListColumn[]
    }>()

  const emit = defineEmits(['refreshData'])

  const moderationStore = useModerationStore()
  const bulk = useBulkSelection()

  const handleRefreshData = () => {
    emit('refreshData')
  }

  const pageEntries = computed(() => {
    return props.times
      .filter(t => !!t._id)
      .map(t => ({
        id: t._id!,
        label: `${t.name} · ${t.map} · ${t.time.toFixed(3)}s`,
      }))
  })

  const pageSelectedCount = computed(() => {
    return pageEntries.value.filter(e => bulk.has(e.id)).length
  })

  const allPageSelected = computed(() => {
    return pageEntries.value.length > 0 && pageSelectedCount.value === pageEntries.value.length
  })

  const togglePageSelection = () => {
    if (allPageSelected.value) {
      bulk.removeMany(pageEntries.value.map(e => e.id))
    } else {
      bulk.addMany(pageEntries.value)
    }
  }
</script>


<template>
  <div>
    <div v-if="moderationStore.canAccessModerationPanel.value && pageEntries.length > 0"
         class="flex items-center justify-end gap-3 mb-2 text-sm">
      <span v-if="pageSelectedCount > 0" class="text-gray-400">
        {{ pageSelectedCount }} of {{ pageEntries.length }} selected
      </span>
      <button
        @click="togglePageSelection"
        class="px-3 py-1 bg-main-700 hover:bg-main-600 border border-main-500 text-gray-200 rounded transition-colors whitespace-nowrap cursor-pointer"
      >
        {{ allPageSelected ? 'Clear page' : 'Select page' }}
      </button>
    </div>

    <!-- Header -->
    <div>
      <TimesListHeading :cols="props.cols"></TimesListHeading>
    </div>

    <!-- Times list -->
    <TimesListItem
      v-for="(time,index) in props.times"
      :key="index"
      :placement="index+1"
      :time="time"
      :cols="props.cols"
      :wrTime="props.times[0]"
      @refresh-data="handleRefreshData"
    ></TimesListItem>
  </div>
</template>
