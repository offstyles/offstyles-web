<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import { ModerationTargetFilter, type RecentModAction } from '@/types/moderation'

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

// Recent general moderation logs state
const recentLogs: Ref<RecentModAction[]> = ref([])
const isLoadingRecentLogs: Ref<boolean> = ref(false)
const selectedFilter: Ref<ModerationTargetFilter | undefined> = ref(undefined)
const showRecentLogs: Ref<boolean> = ref(false)

// Modal state for focused view
const showRecentLogsModal: Ref<boolean> = ref(false)
const showSpecificLogModal: Ref<boolean> = ref(false)
const selectedLogForModal: Ref<any> = ref(null)

// Modal state for specific logs (record/player logs)
const showSpecificLogsModal: Ref<boolean> = ref(false)
const showSpecificLogDetailModal: Ref<boolean> = ref(false)
const selectedSpecificLogForModal: Ref<any> = ref(null)

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
  showRecentLogs.value = false
  recentLogs.value = []
  selectedFilter.value = undefined
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

const toggleRecentLogs = () => {
  showRecentLogs.value = !showRecentLogs.value
  if (showRecentLogs.value) {
    loadRecentModerationLogs()
  }
}

const loadRecentModerationLogs = async () => {
  isLoadingRecentLogs.value = true
  try {
    const logs = await moderationStore.getRecentModerationLogs(selectedFilter.value)
    // Sort by timestamp descending (most recent first)
    recentLogs.value = logs.sort((a: any, b: any) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to load recent moderation logs:', error)
    recentLogs.value = []
  } finally {
    isLoadingRecentLogs.value = false
  }
}

const onFilterChange = () => {
  if (showRecentLogs.value) {
    loadRecentModerationLogs()
  }
}

// Modal functions
const openRecentLogsModal = () => {
  showRecentLogsModal.value = true
  if (recentLogs.value.length === 0) {
    loadRecentModerationLogs()
  }
}

const closeRecentLogsModal = () => {
  showRecentLogsModal.value = false
}

const openSpecificLogModal = (log: any) => {
  selectedLogForModal.value = log
  showSpecificLogModal.value = true
}

const closeSpecificLogModal = () => {
  showSpecificLogModal.value = false
  selectedLogForModal.value = null
}

// Modal functions for specific logs (record/player logs)
const openSpecificLogsModal = () => {
  showSpecificLogsModal.value = true
}

const closeSpecificLogsModal = () => {
  showSpecificLogsModal.value = false
}

const openSpecificLogDetailModal = (log: any) => {
  selectedSpecificLogForModal.value = log
  showSpecificLogDetailModal.value = true
}

const closeSpecificLogDetailModal = () => {
  showSpecificLogDetailModal.value = false
  selectedSpecificLogForModal.value = null
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
    // Sort actions by timestamp descending (most recent first)
    if (logs && logs.actions) {
      logs.actions = logs.actions.sort((a: any, b: any) => b.timestamp - a.timestamp)
    }
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

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'ban':
    case 'invalidate':
      return 'text-red-400 bg-red-900/20'
    case 'unban':
    case 'revalidate':
      return 'text-green-400 bg-green-900/20'
    case 'note':
      return 'text-blue-400 bg-blue-900/20'
    case 'reverse':
      return 'text-purple-400 bg-purple-900/20'
    default:
      return 'text-gray-400 bg-gray-900/20'
  }
}
</script>

<template>
  <div v-if="canAccessPanel" class="fixed top-4 right-4 z-50">
    <!-- Toggle Button -->
    <button
      @click="togglePanel"
      class="bg-main-700 hover:bg-main-600 border border-main-500 text-gray-200 px-4 py-2 rounded-lg shadow-lg transition-colors cursor-pointer"
    >
      {{ showPanel ? 'Close' : 'Admin Panel' }}
    </button>

    <!-- Admin Panel -->
    <div 
      v-if="showPanel"
      class="absolute top-12 right-0 w-[500px] bg-main-800 border border-main-400 rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
    >
      <div class="p-4 border-b border-main-400">
        <h3 class="text-lg font-medium text-gray-200">Admin Moderation Panel</h3>
      </div>

      <div class="p-4 space-y-4">
        <!-- Reverse Moderation Actions Section -->
        <div class="space-y-2">
          <button
            @click="showReversalFormToggle"
            class="w-full text-left px-3 py-2 bg-main-700 hover:bg-main-600 rounded border border-main-500 text-gray-200 transition-colors cursor-pointer"
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
              class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded transition-colors cursor-pointer"
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
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors cursor-pointer"
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
            <div class="flex justify-between items-center mb-2">
              <h5 class="text-gray-300 font-medium">Moderation History</h5>
              <button
                @click="openSpecificLogsModal"
                class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors cursor-pointer"
              >
                Full View
              </button>
            </div>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div 
                v-for="(action, index) in moderationLogs.actions" 
                :key="index"
                @click="openSpecificLogDetailModal(action)"
                class="border-l-2 border-main-400 pl-2 py-1 cursor-pointer hover:bg-main-700/50 rounded-r transition-colors"
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

        <!-- Recent General Moderation Logs Section -->
        <div class="space-y-2">
          <button
            @click="toggleRecentLogs"
            class="w-full text-left px-3 py-2 bg-main-700 hover:bg-main-600 rounded border border-main-500 text-gray-200 transition-colors cursor-pointer"
          >
            {{ showRecentLogs ? '▼' : '▶' }} Recent General Moderation Logs
          </button>

          <div v-if="showRecentLogs" class="space-y-3 pl-4">
            <!-- Filter Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Filter by Target Type
              </label>
              <select
                v-model="selectedFilter"
                @change="onFilterChange"
                class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
              >
                <option :value="undefined">All Actions</option>
                <option :value="ModerationTargetFilter.Player">Player Actions Only</option>
                <option :value="ModerationTargetFilter.Record">Record Actions Only</option>
              </select>
            </div>

            <!-- Recent Logs Display -->
            <div class="bg-main-900 rounded p-3 text-sm">
              <div class="flex justify-between items-center mb-2">
                <h5 class="text-gray-300 font-medium">Recent Actions</h5>
                <div class="flex gap-2">
                  <button
                    @click="openRecentLogsModal"
                    class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors cursor-pointer"
                  >
                    Full View
                  </button>
                  <button
                    @click="loadRecentModerationLogs"
                    :disabled="isLoadingRecentLogs"
                    class="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs transition-colors cursor-pointer"
                  >
                    {{ isLoadingRecentLogs ? '...' : 'Refresh' }}
                  </button>
                </div>
              </div>
              
              <div v-if="isLoadingRecentLogs" class="text-center py-4 text-gray-400">
                Loading recent logs...
              </div>
              
              <div v-else-if="recentLogs.length === 0" class="text-center py-4 text-gray-400">
                No recent moderation actions found
              </div>
              
              <div v-else class="space-y-2 max-h-60 overflow-y-auto">
                <div 
                  v-for="(action, index) in recentLogs" 
                  :key="index"
                  @click="openSpecificLogModal(action)"
                  class="border-l-4 border-main-400 pl-4 py-3 bg-main-700/50 rounded-r cursor-pointer hover:bg-main-700/70 transition-colors"
                >
                  <!-- Action Header -->
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="getActionColor(action.action)"
                      >
                        {{ action.action }}
                      </span>
                      <span class="text-xs px-1 py-0.5 rounded" :class="action.target_type === 'Player' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'">
                        {{ action.target_type }}
                      </span>
                    </div>
                    <span class="text-xs text-gray-400">{{ formatTimestamp(action.timestamp) }}</span>
                  </div>

                  <!-- Target and Moderator Info -->
                  <div class="text-sm text-gray-300 mb-2">
                    Target: <span class="font-medium">{{ action.target_name }}</span>
                  </div>
                  
                  <!-- Moderator Info with Avatar -->
                  <div class="flex items-center gap-2 mb-2">
                    <img 
                      v-if="action.moderator_avatar_url"
                      :src="action.moderator_avatar_url" 
                      :alt="action.moderator_name"
                      class="w-6 h-6 rounded-full"
                    />
                    <div class="text-sm text-gray-300">
                      by <span class="font-medium">{{ action.moderator_name }}</span>
                    </div>
                  </div>

                  <!-- Moderator Steam ID -->
                  <div class="text-xs text-gray-400 mb-2">
                    Steam ID: {{ action.moderator_steam_id }}
                  </div>

                  <!-- Notes -->
                  <div v-if="action.notes" class="text-sm text-gray-200 bg-main-800 p-2 rounded">
                    {{ action.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Logs Full View Modal -->
  <div 
    v-if="showRecentLogsModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click.self="closeRecentLogsModal"
  >
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-200">Recent Moderation Logs - Full View</h3>
        <button
          @click="closeRecentLogsModal"
          class="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Filter Controls -->
      <div class="p-4 border-b border-main-400">
        <div class="flex gap-4 items-center">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1">
              Filter by Target Type
            </label>
            <select
              v-model="selectedFilter"
              @change="onFilterChange"
              class="px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200"
            >
              <option :value="undefined">All Actions</option>
              <option :value="ModerationTargetFilter.Player">Player Actions Only</option>
              <option :value="ModerationTargetFilter.Record">Record Actions Only</option>
            </select>
          </div>
          <button
            @click="loadRecentModerationLogs"
            :disabled="isLoadingRecentLogs"
            class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors cursor-pointer"
          >
            {{ isLoadingRecentLogs ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isLoadingRecentLogs" class="text-center py-8 text-gray-400">
          Loading recent logs...
        </div>
        
        <div v-else-if="recentLogs.length === 0" class="text-center py-8 text-gray-400">
          No recent moderation actions found
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="(action, index) in recentLogs" 
            :key="index"
            @click="openSpecificLogModal(action)"
            class="border border-main-500 rounded-lg p-4 bg-main-700/30 hover:bg-main-700/50 transition-colors cursor-pointer"
          >
            <!-- Action Header -->
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <span 
                  class="px-3 py-1 rounded text-sm font-medium"
                  :class="getActionColor(action.action)"
                >
                  {{ action.action }}
                </span>
                <span class="text-sm px-2 py-1 rounded" :class="action.target_type === 'Player' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'">
                  {{ action.target_type }}
                </span>
              </div>
              <span class="text-sm text-gray-400">{{ formatTimestamp(action.timestamp) }}</span>
            </div>

            <!-- Target and Moderator Info -->
            <div class="text-sm text-gray-300 mb-2">
              Target: <span class="font-medium">{{ action.target_name }}</span>
            </div>
            
            <!-- Moderator Info with Avatar -->
            <div class="flex items-center gap-2 mb-2">
              <img 
                v-if="action.moderator_avatar_url"
                :src="action.moderator_avatar_url" 
                :alt="action.moderator_name"
                class="w-8 h-8 rounded-full"
              />
              <div class="text-sm text-gray-300">
                by <span class="font-medium">{{ action.moderator_name }}</span>
              </div>
            </div>

            <!-- Moderator Steam ID -->
            <div class="text-xs text-gray-400 mb-2">
              Steam ID: {{ action.moderator_steam_id }}
            </div>

            <!-- Notes -->
            <div v-if="action.notes" class="text-sm text-gray-200 bg-main-800 p-3 rounded">
              {{ action.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Specific Log Detail Modal -->
  <div 
    v-if="showSpecificLogModal && selectedLogForModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]"
    @click.self="closeSpecificLogModal"
  >
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-200">Moderation Action Details</h3>
        <button
          @click="closeSpecificLogModal"
          class="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Action Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span 
              class="px-4 py-2 rounded text-lg font-medium"
              :class="getActionColor(selectedLogForModal.action)"
            >
              {{ selectedLogForModal.action }}
            </span>
            <span class="text-lg px-3 py-1 rounded" :class="selectedLogForModal.target_type === 'Player' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'">
              {{ selectedLogForModal.target_type }}
            </span>
          </div>

          <div class="text-lg text-gray-300">
            <span class="text-gray-400">Timestamp:</span> {{ formatTimestamp(selectedLogForModal.timestamp) }}
          </div>
        </div>

        <!-- Target Details -->
        <div class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-2">Target</h4>
          <div class="space-y-2">
            <div class="text-gray-300">
              <span class="text-gray-400">Name:</span> <span class="font-medium">{{ selectedLogForModal.target_name }}</span>
            </div>
            <div class="text-gray-300">
              <span class="text-gray-400">ID:</span> <span class="font-mono text-sm">{{ selectedLogForModal.target_id }}</span>
            </div>
            <div class="text-gray-300">
              <span class="text-gray-400">Type:</span> {{ selectedLogForModal.target_type }}
            </div>
          </div>
        </div>

        <!-- Moderator Details -->
        <div class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-3">Moderator</h4>
          <div class="flex items-start gap-4">
            <img 
              v-if="selectedLogForModal.moderator_avatar_url"
              :src="selectedLogForModal.moderator_avatar_url" 
              :alt="selectedLogForModal.moderator_name"
              class="w-12 h-12 rounded-full"
            />
            <div class="space-y-2">
              <div class="text-gray-300">
                <span class="text-gray-400">Name:</span> <span class="font-medium">{{ selectedLogForModal.moderator_name }}</span>
              </div>
              <div class="text-gray-300">
                <span class="text-gray-400">Steam ID:</span> <span class="font-mono text-sm">{{ selectedLogForModal.moderator_steam_id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes/Reason -->
        <div v-if="selectedLogForModal.notes" class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-2">Reason/Notes</h4>
          <div class="text-gray-300 whitespace-pre-wrap">{{ selectedLogForModal.notes }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Specific Logs Full View Modal (Record/Player Logs) -->
  <div 
    v-if="showSpecificLogsModal && moderationLogs && !moderationLogs.error"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click.self="closeSpecificLogsModal"
  >
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-200">Moderation History - Full View</h3>
        <button
          @click="closeSpecificLogsModal"
          class="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="moderationLogs.actions.length === 0" class="text-center py-8 text-gray-400">
          No moderation actions found
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="(action, index) in moderationLogs.actions" 
            :key="index"
            @click="openSpecificLogDetailModal(action)"
            class="border border-main-500 rounded-lg p-4 bg-main-700/30 hover:bg-main-700/50 transition-colors cursor-pointer"
          >
            <!-- Action Header -->
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <span 
                  class="px-3 py-1 rounded text-sm font-medium"
                  :class="getActionColor(action.action)"
                >
                  {{ action.action }}
                </span>
              </div>
              <span class="text-sm text-gray-400">{{ formatTimestamp(action.timestamp) }}</span>
            </div>

            <!-- Moderator Info -->
            <div class="text-sm text-gray-300 mb-2">
              by <span class="font-medium">{{ action.mod.username }}</span>
            </div>

            <!-- Notes -->
            <div v-if="action.notes" class="text-sm text-gray-200 bg-main-800 p-3 rounded">
              {{ action.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Specific Log Detail Modal (Record/Player Logs) -->
  <div 
    v-if="showSpecificLogDetailModal && selectedSpecificLogForModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]"
    @click.self="closeSpecificLogDetailModal"
  >
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-200">Moderation Action Details</h3>
        <button
          @click="closeSpecificLogDetailModal"
          class="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Action Info -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span 
              class="px-4 py-2 rounded text-lg font-medium"
              :class="getActionColor(selectedSpecificLogForModal.action)"
            >
              {{ selectedSpecificLogForModal.action }}
            </span>
          </div>

          <div class="text-lg text-gray-300">
            <span class="text-gray-400">Timestamp:</span> {{ formatTimestamp(selectedSpecificLogForModal.timestamp) }}
          </div>
        </div>

        <!-- Moderator Details -->
        <div class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-3">Moderator</h4>
          <div class="space-y-2">
            <div class="text-gray-300">
              <span class="text-gray-400">Name:</span> <span class="font-medium">{{ selectedSpecificLogForModal.mod.username }}</span>
            </div>
          </div>
        </div>

        <!-- Notes/Reason -->
        <div v-if="selectedSpecificLogForModal.notes" class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-2">Reason/Notes</h4>
          <div class="text-gray-300 whitespace-pre-wrap">{{ selectedSpecificLogForModal.notes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
