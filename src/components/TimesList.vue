<script setup lang="ts">
import TimesListItem from './TimesListItem.vue';
import type { Time } from '@/types/Time';
import type { TimeListColumn } from '@/types/TimeListColumn';
import TimesListHeading from './TimesListHeading.vue';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';

const props = defineProps<{
  times: Time[],
  cols: TimeListColumn[],
  enableSelection?: boolean
}>()

const emit = defineEmits<{
  selectionChanged: [selectedIds: string[]]
}>()

const selectedRecords: Ref<Set<string>> = ref(new Set())

const selectedArray = computed(() => {
  return Array.from(selectedRecords.value)
})

const isRecordSelected = (recordId: string): boolean => {
  return selectedRecords.value.has(recordId)
}

const toggleRecordSelection = (recordId: string) => {
  if (selectedRecords.value.has(recordId)) {
    selectedRecords.value.delete(recordId)
  } else {
    selectedRecords.value.add(recordId)
  }
  emit('selectionChanged', selectedArray.value)
}

const toggleAllSelection = () => {
  if (selectedRecords.value.size === props.times.length) {
    // Deselect all
    selectedRecords.value.clear()
  } else {
    // Select all
    selectedRecords.value.clear()
    props.times.forEach(time => {
      if (time._id) {
        selectedRecords.value.add(time._id.toString())
      }
    })
  }
  emit('selectionChanged', selectedArray.value)
}

const clearSelection = () => {
  selectedRecords.value.clear()
  emit('selectionChanged', selectedArray.value)
}

// Expose methods for parent components
defineExpose({
  toggleAllSelection,
  clearSelection,
  selectedRecords: selectedArray
})
</script>


<template>
  <TimesListHeading :cols="props.cols" :enableSelection="enableSelection" @toggleAll="toggleAllSelection"></TimesListHeading>
  <TimesListItem 
    v-for="(time,index) in props.times" 
    :key="time._id || index" 
    :placement="index+1" 
    :time="time" 
    :cols="props.cols" 
    :wrTime="props.times[0]"
    :enableSelection="enableSelection"
    :isSelected="isRecordSelected(time._id?.toString() || '')"
    @toggleSelection="toggleRecordSelection"
  ></TimesListItem>
</template>