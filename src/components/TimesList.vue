<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import TimesListItem from './TimesListItem.vue';
import type { Time } from '@/types/Time';
import type { TimeListColumn } from '@/types/TimeListColumn';
import TimesListHeading from './TimesListHeading.vue';
import BulkModerationModal from './Moderation/BulkModerationModal.vue';
import { useModerationStore } from '@/stores/moderation';

  const props = defineProps<{
      times: Time[],
      cols: TimeListColumn[]
    }>()

  const emit = defineEmits(['refreshData'])

  const moderationStore = useModerationStore()
  const showBulkModal: Ref<boolean> = ref(false)

  const handleRefreshData = () => {
    emit('refreshData')
  }

  const openBulkModeration = () => {
    showBulkModal.value = true
  }

  const closeBulkModeration = () => {
    showBulkModal.value = false
  }

  const handleBulkModerationComplete = () => {
    emit('refreshData')
    showBulkModal.value = false
  }
</script>


<template>
  <div>
    <!-- Bulk moderation button above header -->
    <div v-if="moderationStore.canInvalidateTimes.value && props.times.length > 0" 
         class="flex justify-end mb-2">
      <button
        @click="openBulkModeration"
        class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors whitespace-nowrap cursor-pointer"
      >
        Bulk Moderate
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

    <!-- Bulk Moderation Modal -->
    <BulkModerationModal
      :times="props.times"
      :show="showBulkModal"
      @moderationComplete="handleBulkModerationComplete"
      @close="closeBulkModeration"
    />
  </div>
</template>