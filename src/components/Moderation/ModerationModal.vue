<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { ModerationActionType } from '@/types/moderation'
import { useModerationStore, type ModerationTarget } from '@/stores/moderation'
import ModerationLogsModal from './ModerationLogsModal.vue'
import IconCheck from '@/components/icons/IconCheck.vue'

const emit = defineEmits(['moderationComplete', 'close'])

const props = defineProps<{
  target: ModerationTarget
  show: boolean
}>()

const moderationStore = useModerationStore()

const selectedAction: Ref<ModerationActionType | null> = ref(null)
const reason: Ref<string> = ref('')
const isSubmitting: Ref<boolean> = ref(false)
const showSuccess: Ref<boolean> = ref(false)
const showLogsModal: Ref<boolean> = ref(false)
const errorMessage: Ref<string> = ref('')

const availableActions = computed(() => {
  return moderationStore.getAvailableActions(props.target)
})

const canSubmit = computed(() => {
  return selectedAction.value && reason.value.trim().length > 0 && !isSubmitting.value
})

const selectedActionLabel = computed(() => {
  if (!selectedAction.value) return ''
  const action = availableActions.value.find(a => a.action === selectedAction.value)
  return action?.label || ''
})

const canViewLogs = computed(() => {
  // Can view logs if user can moderate and target has a moderation reference
  return moderationStore.canModerate.value && !!getLogsId()
})

const getLogsId = () => {
  // For players, use ban_ref only if it exists; for records, use invalid_ref only if it exists
  if (props.target.type === 'player') {
    // Only return ban_ref if it exists, otherwise null (no moderation history)
    return props.target.ban_ref || null
  } else {
    // For records, only return invalid_ref if it exists, otherwise null (no moderation history)
    return props.target.invalid_ref || null
  }
}

// Reset form when modal opens/closes
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetForm()
  }
})

const resetForm = () => {
  selectedAction.value = null
  reason.value = ''
  errorMessage.value = ''
  showSuccess.value = false
}

const selectAction = (action: ModerationActionType) => {
  selectedAction.value = action
}

const handleSubmit = async () => {
  if (!canSubmit.value || !selectedAction.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await moderationStore.performModerationAction(
      selectedAction.value,
      reason.value,
      props.target
    )
    
    showSuccess.value = true
    
    // Auto close after success
    setTimeout(() => {
      emit('moderationComplete')
      emit('close')
    }, 1500)
    
  } catch (error) {
    console.error('Moderation action failed:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('close')
}

const openLogsModal = () => {
  showLogsModal.value = true
}

const closeLogsModal = () => {
  showLogsModal.value = false
}

const getActionColor = (action: ModerationActionType) => {
  switch (action) {
    case ModerationActionType.Ban:
    case ModerationActionType.Invalidate:
      return 'text-red-400 hover:bg-red-900/20'
    case ModerationActionType.Unban:
    case ModerationActionType.Revalidate:
      return 'text-green-400 hover:bg-green-900/20'
    case ModerationActionType.Note:
      return 'text-blue-400 hover:bg-blue-900/20'
    default:
      return 'text-gray-400 hover:bg-gray-900/20'
  }
}
</script>

<template>
  <!-- Modal Overlay -->
  <div 
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-full max-w-md mx-4">
      <!-- Header -->
      <div class="p-4 border-b border-main-400">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-200">
              Moderate {{ target.type === 'player' ? 'Player' : 'Record' }}
            </h3>
            <p class="text-sm text-gray-400 mt-1">{{ target.name }}</p>
          </div>
          <div class="flex gap-2">
            <button
              v-if="canViewLogs"
              @click="openLogsModal"
              class="text-xs px-2 py-1 bg-main-600 hover:bg-main-500 text-gray-200 rounded transition-colors cursor-pointer"
            >
              View Logs
            </button>
            <span
              v-else-if="moderationStore.canModerate.value"
              class="text-xs px-2 py-1 text-gray-500 italic"
            >
              No moderation history
            </span>
          </div>
        </div>
      </div>

      <!-- Success State -->
      <div v-if="showSuccess" class="p-6 text-center">
        <div class="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconCheck class="w-6 h-6 text-white" />
        </div>
        <p class="text-green-400 font-medium">Action completed successfully!</p>
      </div>

      <!-- Form -->
      <div v-else class="p-4 space-y-4">
        <!-- Action Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Select Action
          </label>
          <div class="space-y-1">
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
          <label for="reason" class="block text-sm font-medium text-gray-300 mb-2">
            Reason <span class="text-red-400">*</span>
          </label>
          <textarea
            id="reason"
            v-model="reason"
            rows="3"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:border-main-300"
            :placeholder="`Enter reason for ${selectedActionLabel.toLowerCase()}...`"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="text-red-400 text-sm">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Footer -->
      <div v-if="!showSuccess" class="p-4 border-t border-main-400 flex justify-end gap-3">
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
          {{ isSubmitting ? 'Processing...' : 'Apply Action' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Moderation Logs Modal -->
  <ModerationLogsModal
    v-if="getLogsId()"
    :target-id="getLogsId()!"
    :target-type="target.type"
    :target-name="target.name"
    :show="showLogsModal"
    @close="closeLogsModal"
  />
</template>
