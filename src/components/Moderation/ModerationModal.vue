<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { ModerationActionType } from '@/types/moderation'

const props = defineProps<{
  isOpen: boolean
  title: string
  action: ModerationActionType
  targetName: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [reason: string]
}>()

const reason: Ref<string> = ref('')

const actionColor = computed(() => {
  switch (props.action) {
    case ModerationActionType.Ban:
    case ModerationActionType.Invalidate:
      return 'bg-red-600 hover:bg-red-700'
    case ModerationActionType.Unban:
    case ModerationActionType.Revalidate:
      return 'bg-green-600 hover:bg-green-700'
    case ModerationActionType.Note:
    default:
      return 'bg-blue-600 hover:bg-blue-700'
  }
})

const actionText = computed(() => {
  switch (props.action) {
    case ModerationActionType.Ban:
      return 'Ban'
    case ModerationActionType.Unban:
      return 'Unban'
    case ModerationActionType.Invalidate:
      return 'Invalidate'
    case ModerationActionType.Revalidate:
      return 'Revalidate'
    case ModerationActionType.Note:
      return 'Add Note'
    default:
      return 'Confirm'
  }
})

const handleConfirm = () => {
  if (reason.value.trim()) {
    emit('confirm', reason.value.trim())
    reason.value = ''
  }
}

const handleClose = () => {
  reason.value = ''
  emit('close')
}
</script>

<template>
  <!-- Modal Backdrop -->
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleClose"
  >
    <!-- Modal Content -->
    <div 
      class="bg-main-800 border border-main-400 rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      @click.stop
    >
      <!-- Header -->
      <h2 class="text-xl font-semibold text-white mb-4">{{ title }}</h2>
      
      <!-- Content -->
      <div class="mb-4">
        <p class="text-gray-300 mb-3">
          Are you sure you want to {{ actionText.toLowerCase() }} <strong>{{ targetName }}</strong>?
        </p>
        
        <!-- Reason Input -->
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Reason (required)
        </label>
        <textarea
          v-model="reason"
          :disabled="isLoading"
          class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          rows="3"
          placeholder="Enter reason for this action..."
          @keydown.enter.ctrl="handleConfirm"
        ></textarea>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          @click="handleClose"
          :disabled="isLoading"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading || !reason.trim()"
          :class="actionColor"
          class="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Processing...' : actionText }}
        </button>
      </div>
    </div>
  </div>
</template>