<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { Time } from '@/types/Time'
import { ModerationActionType } from '@/types/moderation'
import { useModerationStore } from '@/stores/moderation'
import IconCheck from '@/components/icons/IconCheck.vue'

const emit = defineEmits(['moderationComplete', 'close'])

const props = defineProps<{
  times: Time[]
  show: boolean
}>()

const moderationStore = useModerationStore()

const selectedRecords: Ref<Set<string>> = ref(new Set())
const selectedAction: Ref<ModerationActionType | null> = ref(null)
const reason: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)
const showSuccess: Ref<boolean> = ref(false)
const errorMessage: Ref<string> = ref('')

const availableActions = computed(() => {
  const actions = []
  if (moderationStore.canInvalidateTimes.value) {
    actions.push({ action: ModerationActionType.Invalidate, label: 'Invalidate Records' })
    actions.push({ action: ModerationActionType.Revalidate, label: 'Revalidate Records' })
  }
  actions.push({ action: ModerationActionType.Note, label: 'Add Note to Records' })
  return actions
})

const validRecords = computed(() => {
  return props.times.filter(time => time._id)
})

const canSubmit = computed(() => {
  return selectedRecords.value.size > 0 && 
         selectedAction.value && 
         reason.value.trim().length > 0 && 
         !isSubmitting.value
})

const allSelected = computed(() => {
  return validRecords.value.length > 0 && 
         selectedRecords.value.size === validRecords.value.length
})

const someSelected = computed(() => {
  return selectedRecords.value.size > 0 && 
         selectedRecords.value.size < validRecords.value.length
})

const resetForm = () => {
  selectedRecords.value.clear()
  selectedAction.value = null
  reason.value = ''
  errorMessage.value = ''
  showSuccess.value = false
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRecords.value.clear()
  } else {
    validRecords.value.forEach(time => {
      if (time._id) selectedRecords.value.add(time._id)
    })
  }
}

const toggleRecord = (recordId: string) => {
  if (selectedRecords.value.has(recordId)) {
    selectedRecords.value.delete(recordId)
  } else {
    selectedRecords.value.add(recordId)
  }
}

const selectAction = (action: ModerationActionType) => {
  selectedAction.value = action
}

const handleSubmit = async () => {
  if (!canSubmit.value || !selectedAction.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // Use the moderation store's bulk action method
    const recordIds = Array.from(selectedRecords.value)
    await moderationStore.performBulkModerationAction(selectedAction.value, reason.value, recordIds)
    
    showSuccess.value = true
    
    // Auto close after success
    setTimeout(() => {
      emit('moderationComplete')
      emit('close')
    }, 1500)
    
  } catch (error) {
    console.error('Bulk moderation failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const getActionColor = (action: ModerationActionType) => {
  switch (action) {
    case ModerationActionType.Invalidate:
      return 'text-red-400 hover:bg-red-900/20'
    case ModerationActionType.Revalidate:
      return 'text-green-400 hover:bg-green-900/20'
    case ModerationActionType.Note:
      return 'text-blue-400 hover:bg-blue-900/20'
    default:
      return 'text-gray-400 hover:bg-gray-900/20'
  }
}

// Reset form when modal opens/closes
import { watch } from 'vue'
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetForm()
  }
})
</script>

<template>
  <!-- Modal Overlay -->
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 shrink-0">
        <h3 class="text-lg font-medium text-gray-200">
          Bulk Moderate Records
        </h3>
        <p class="text-sm text-gray-400 mt-1">Select records and apply moderation actions</p>
      </div>

      <!-- Success State -->
      <div v-if="showSuccess" class="p-6 text-center flex-1">
        <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconCheck class="w-6 h-6 text-white" />
        </div>
        <p class="text-green-400 font-medium">Bulk moderation completed successfully!</p>
        <p class="text-gray-400 text-sm mt-2">{{ selectedRecords.size }} record(s) processed</p>
      </div>

      <!-- Form -->
      <div v-else class="flex-1 overflow-hidden flex flex-col">
        <!-- Record Selection -->
        <div class="p-4 border-b border-main-400 shrink-0">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-gray-300">
              Select Records ({{ selectedRecords.size }}/{{ validRecords.length }})
            </label>
            <button
              @click="toggleSelectAll"
              class="text-xs px-2 py-1 bg-main-600 hover:bg-main-500 text-gray-200 rounded transition-colors cursor-pointer"
            >
              {{ allSelected ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
          
          <!-- Master checkbox -->
          <div class="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="toggleSelectAll"
              class="rounded"
            />
            <span class="text-sm text-gray-300">Select all records</span>
          </div>
        </div>

        <!-- Record List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 space-y-2">
            <div
              v-for="(time, index) in validRecords"
              :key="time._id || `record-${index}`"
              class="flex items-center gap-3 p-2 rounded border border-main-500 hover:border-main-400 transition-colors"
            >
              <input
                type="checkbox"
                :checked="selectedRecords.has(time._id!)"
                @change="toggleRecord(time._id!)"
                class="rounded"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">
                  {{ time.map }} by {{ time.name }}
                </div>
                <div class="text-xs text-gray-400">
                  Time: {{ time.time.toFixed(3) }}s
                  <span v-if="time.is_invalid" class="text-yellow-400 ml-2">⚠️ Invalid</span>
                  <span v-if="time.is_banned" class="text-red-400 ml-2">🚫 Banned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Selection and Form -->
        <div class="p-4 border-t border-main-400 space-y-4 shrink-0">
          <!-- Action Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Select Action
            </label>
            <div class="grid grid-cols-1 gap-1">
              <button
                v-for="action in availableActions"
                :key="action.action"
                @click="selectAction(action.action)"
                class="w-full text-left px-3 py-2 rounded border transition-colors cursor-pointer"
                :class="[
                  selectedAction === action.action
                    ? 'border-main-300 bg-main-600'
                    : 'border-main-500 hover:border-main-400',
                  getActionColor(action.action)
                ]"
              >
                <div class="flex items-center justify-between">
                  <span>{{ action.label }}</span>
                  <div 
                    v-if="selectedAction === action.action"
                    class="w-4 h-4 bg-main-300 rounded-full flex items-center justify-center"
                  >
                    <div class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Reason Input -->
          <div>
            <label for="bulk-reason" class="block text-sm font-medium text-gray-300 mb-2">
              Reason <span class="text-red-400">*</span>
            </label>
            <textarea
              id="bulk-reason"
              v-model="reason"
              rows="2"
              class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-main-300"
              placeholder="Enter reason for bulk moderation..."
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-400 text-sm">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!showSuccess" class="p-4 border-t border-main-400 flex justify-end gap-3 shrink-0">
        <button
          @click="handleClose"
          class="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {{ isSubmitting ? 'Processing...' : `Apply to ${selectedRecords.size} record${selectedRecords.size !== 1 ? 's' : ''}` }}
        </button>
      </div>
    </div>
  </div>
</template>
