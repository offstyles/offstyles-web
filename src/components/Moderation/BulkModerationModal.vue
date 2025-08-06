<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { UserPermissions } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'

const props = defineProps<{
  selectedRecords: string[]
  recordNames: Record<string, string> // recordId -> display name mapping
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  complete: []
}>()

const { user } = useAuth()
const reason: Ref<string> = ref('')
const action: Ref<'invalidate' | 'validate'> = ref('invalidate')
const isLoading: Ref<boolean> = ref(false)

const userPermissions = computed(() => {
  if (!user.value) return new UserPermissions(0)
  return new UserPermissions(user.value.permissions)
})

const canBulkModerate = computed(() => {
  return userPermissions.value.contains(UserPermissions.INVALIDATE_TIMES)
})

const selectedCount = computed(() => {
  return props.selectedRecords.length
})

const actionColor = computed(() => {
  return action.value === 'invalidate' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
})

const actionText = computed(() => {
  return action.value === 'invalidate' ? 'Invalidate' : 'Revalidate'
})

const handleConfirm = async () => {
  if (!reason.value.trim() || props.selectedRecords.length === 0) {
    return
  }
  
  isLoading.value = true
  
  try {
    await OffstylesApi.bulkModerateRecords(props.selectedRecords, action.value, reason.value.trim())
    
    // Reset form
    reason.value = ''
    action.value = 'invalidate'
    
    emit('complete')
  } catch (error) {
    console.error('Bulk moderation failed:', error)
    alert(`Failed to ${action.value} records: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  reason.value = ''
  action.value = 'invalidate'
  emit('close')
}
</script>

<template>
  <!-- Modal Backdrop -->
  <div 
    v-if="isOpen && canBulkModerate"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleClose"
  >
    <!-- Modal Content -->
    <div 
      class="bg-main-800 border border-main-400 rounded-lg shadow-lg max-w-2xl w-full mx-4 p-6"
      @click.stop
    >
      <!-- Header -->
      <h2 class="text-xl font-semibold text-white mb-4">
        Bulk Moderate Records ({{ selectedCount }} selected)
      </h2>
      
      <!-- Content -->
      <div class="mb-6">
        <!-- Action Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Action
          </label>
          <select
            v-model="action"
            :disabled="isLoading"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="invalidate">Invalidate Records</option>
            <option value="validate">Revalidate Records</option>
          </select>
        </div>
        
        <!-- Selected Records Preview -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Selected Records
          </label>
          <div class="max-h-32 overflow-y-auto bg-main-700 border border-main-500 rounded-md p-3">
            <div v-if="selectedCount === 0" class="text-gray-400 text-sm">
              No records selected
            </div>
            <div v-else class="space-y-1">
              <div 
                v-for="recordId in selectedRecords" 
                :key="recordId"
                class="text-sm text-gray-300"
              >
                {{ recordNames[recordId] || recordId }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Reason Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Reason (required)
          </label>
          <textarea
            v-model="reason"
            :disabled="isLoading"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            rows="3"
            placeholder="Enter reason for this bulk action..."
            @keydown.enter.ctrl="handleConfirm"
          ></textarea>
        </div>
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
          :disabled="isLoading || !reason.trim() || selectedCount === 0"
          :class="actionColor"
          class="px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Processing...' : `${actionText} ${selectedCount} Records` }}
        </button>
      </div>
    </div>
  </div>
</template>