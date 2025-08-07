<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'

const moderationStore = useModerationStore()

const showPanel: Ref<boolean> = ref(false)
const showReversalForm: Ref<boolean> = ref(false)

// Reversal form state
const moderatorSteamId: Ref<string> = ref('')
const timeframeHours: Ref<number> = ref(24)
const reversalReason: Ref<string> = ref('')
const isProcessingReversal: Ref<boolean> = ref(false)
const reversalResult: Ref<string> = ref('')

// Moderation logs state
const logId: Ref<string> = ref('')
const moderationLogs: Ref<any> = ref(null)
const isLoadingLogs: Ref<boolean> = ref(false)

const canAccessPanel = computed(() => {
  return moderationStore.canUndoModerationActions.value
})

const togglePanel = () => {
  showPanel.value = !showPanel.value
  // Reset forms when closing
  if (!showPanel.value) {
    resetForms()
  }
}

const resetForms = () => {
  showReversalForm.value = false
  moderatorSteamId.value = ''
  timeframeHours.value = 24
  reversalReason.value = ''
  reversalResult.value = ''
  logId.value = ''
  moderationLogs.value = null
}

const showReversalFormToggle = () => {
  showReversalForm.value = !showReversalForm.value
  if (!showReversalForm.value) {
    moderatorSteamId.value = ''
    timeframeHours.value = 24
    reversalReason.value = ''
    reversalResult.value = ''
  }
}

const canSubmitReversal = computed(() => {
  return moderatorSteamId.value.trim() && 
         timeframeHours.value > 0 && 
         reversalReason.value.trim() && 
         !isProcessingReversal.value
})

const submitReversal = async () => {
  if (!canSubmitReversal.value) return

  isProcessingReversal.value = true
  reversalResult.value = ''

  try {
    const result = await moderationStore.reverseModerationActions(
      moderatorSteamId.value.trim(),
      timeframeHours.value,
      reversalReason.value.trim()
    )
    reversalResult.value = result
  } catch (error) {
    console.error('Failed to reverse moderation actions:', error)
    reversalResult.value = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    isProcessingReversal.value = false
  }
}

const loadModerationLogs = async () => {
  if (!logId.value.trim()) return

  isLoadingLogs.value = true
  moderationLogs.value = null

  try {
    const logs = await moderationStore.getModerationLogs(logId.value.trim())
    moderationLogs.value = logs
  } catch (error) {
    console.error('Failed to load moderation logs:', error)
    moderationLogs.value = { error: error instanceof Error ? error.message : 'Unknown error' }
  } finally {
    isLoadingLogs.value = false
  }
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}
</script>

<template>
  <div v-if="canAccessPanel" class="fixed top-4 right-4 z-50">
    <!-- Toggle Button -->
    <button
      @click="togglePanel"
      class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
    >
      {{ showPanel ? 'Close' : 'Admin Panel' }}
    </button>

    <!-- Admin Panel -->
    <div 
      v-if="showPanel"
      class="absolute top-12 right-0 w-96 bg-main-800 border border-main-400 rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
    >
      <div class="p-4 border-b border-main-400">
        <h3 class="text-lg font-medium text-gray-200">Admin Moderation Panel</h3>
      </div>

      <div class="p-4 space-y-4">
        <!-- Reverse Moderation Actions Section -->
        <div class="space-y-2">
          <button
            @click="showReversalFormToggle"
            class="w-full text-left px-3 py-2 bg-main-700 hover:bg-main-600 rounded border border-main-500 text-gray-200 transition-colors"
          >
            {{ showReversalForm ? '▼' : '▶' }} Reverse Moderation Actions
          </button>

          <div v-if="showReversalForm" class="space-y-3 pl-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Moderator Steam ID
              </label>
              <input
                v-model="moderatorSteamId"
                type="text"
                class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
                placeholder="76561198000000000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Timeframe (hours)
              </label>
              <input
                v-model.number="timeframeHours"
                type="number"
                min="1"
                class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Reason
              </label>
              <textarea
                v-model="reversalReason"
                rows="2"
                class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
                placeholder="Reason for reversal..."
              ></textarea>
            </div>

            <button
              @click="submitReversal"
              :disabled="!canSubmitReversal"
              class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded transition-colors"
            >
              {{ isProcessingReversal ? 'Processing...' : 'Reverse Actions' }}
            </button>

            <div v-if="reversalResult" class="text-sm p-2 rounded" :class="reversalResult.startsWith('Error') ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'">
              {{ reversalResult }}
            </div>
          </div>
        </div>

        <!-- Moderation Logs Section -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-300">View Moderation Logs</h4>
          <div class="flex gap-2">
            <input
              v-model="logId"
              type="text"
              class="flex-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
              placeholder="Moderation ID (invalid_ref or ban_ref)"
            />
            <button
              @click="loadModerationLogs"
              :disabled="!logId.trim() || isLoadingLogs"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors"
            >
              {{ isLoadingLogs ? '...' : 'Load' }}
            </button>
          </div>
        </div>

        <!-- Moderation Logs Display -->
        <div v-if="moderationLogs" class="space-y-2">
          <div v-if="moderationLogs.error" class="text-red-400 text-sm">
            Error: {{ moderationLogs.error }}
          </div>
          <div v-else class="bg-main-900 rounded p-3 text-sm">
            <h5 class="text-gray-300 font-medium mb-2">Moderation History</h5>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div 
                v-for="(action, index) in moderationLogs.actions" 
                :key="index"
                class="border-l-2 border-main-400 pl-2 py-1"
              >
                <div class="flex justify-between items-start">
                  <span class="font-medium text-gray-200">{{ action.action }}</span>
                  <span class="text-xs text-gray-400">{{ formatTimestamp(action.timestamp) }}</span>
                </div>
                <div class="text-xs text-gray-300">by {{ action.mod.username }}</div>
                <div v-if="action.notes" class="text-xs text-gray-400 mt-1">{{ action.notes }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
