<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'

const emit = defineEmits(['close'])

const props = defineProps<{
  targetId: string
  targetType: 'player' | 'record'
  targetName: string
  show: boolean
}>()

const moderationStore = useModerationStore()

const moderationLogs: Ref<any> = ref(null)
const isLoading: Ref<boolean> = ref(false)
const errorMessage: Ref<string> = ref('')

// Modal state for detailed log view
const showLogDetailModal: Ref<boolean> = ref(false)
const selectedLogForModal: Ref<any> = ref(null)

const loadModerationLogs = async () => {
  if (!props.targetId) return

  isLoading.value = true
  moderationLogs.value = null
  errorMessage.value = ''

  try {
    const logs = await moderationStore.getModerationLogs(props.targetId)
    // Sort actions by timestamp descending (most recent first)
    if (logs && logs.actions) {
      logs.actions = logs.actions.sort((a: any, b: any) => b.timestamp - a.timestamp)
    }
    moderationLogs.value = logs
  } catch (error) {
    console.error('Failed to load moderation logs:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load moderation logs'
  } finally {
    isLoading.value = false
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

const handleClose = () => {
  emit('close')
}

// Modal functions for detailed log view
const openLogDetailModal = (log: any) => {
  selectedLogForModal.value = log
  showLogDetailModal.value = true
}

const closeLogDetailModal = () => {
  showLogDetailModal.value = false
  selectedLogForModal.value = null
}

// Load logs when modal opens
import { watch } from 'vue'
watch(() => props.show, (newShow) => {
  if (newShow && props.targetId) {
    loadModerationLogs()
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
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 shrink-0">
        <h3 class="text-lg font-medium text-gray-200">
          Moderation History
        </h3>
        <p class="text-sm text-gray-400 mt-1">{{ targetName }}</p>
        <p class="text-xs text-gray-500">{{ targetType === 'player' ? 'Player' : 'Record' }} ID: {{ targetId }}</p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="text-gray-400">Loading moderation history...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="errorMessage" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="text-red-400 mb-2">{{ errorMessage }}</div>
            <button
              @click="loadModerationLogs"
              class="text-sm px-3 py-1 bg-main-600 hover:bg-main-500 text-gray-200 rounded transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>

        <!-- Logs Content -->
        <div v-else-if="moderationLogs" class="flex-1 overflow-y-auto">
          <div v-if="moderationLogs.actions && moderationLogs.actions.length > 0" class="p-4">
            <div class="space-y-4">
              <div 
                v-for="(action, index) in moderationLogs.actions" 
                :key="index"
                @click="openLogDetailModal(action)"
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
                    <span class="text-sm text-gray-300">
                      by {{ action.mod.username }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ formatTimestamp(action.timestamp) }}
                  </span>
                </div>

                <!-- Moderator Info -->
                <div class="flex items-center gap-2 mb-2">
                  <img 
                    v-if="action.mod.avatar_url"
                    :src="action.mod.avatar_url" 
                    :alt="action.mod.username"
                    class="w-6 h-6 rounded-full"
                  />
                  <div class="text-xs text-gray-400">
                    Steam ID: {{ action.mod.steam_id }}
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="action.notes" class="text-sm text-gray-200 bg-main-800 p-2 rounded">
                  {{ action.notes }}
                </div>
              </div>
            </div>
          </div>

          <!-- No logs message -->
          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center text-gray-400">
              <div class="text-lg mb-2">📋</div>
              <div>No moderation history found</div>
              <div class="text-sm text-gray-500 mt-1">This {{ targetType }} has no recorded moderation actions.</div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <div class="text-lg mb-2">📋</div>
            <div>No data available</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-main-400 flex justify-end shrink-0">
        <button
          @click="handleClose"
          class="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>

  <!-- Log Detail Modal -->
  <div 
    v-if="showLogDetailModal && selectedLogForModal"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    @click.self="closeLogDetailModal"
  >
    <div class="bg-main-800 border border-main-400 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-main-400 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-200">Moderation Action Details</h3>
        <button
          @click="closeLogDetailModal"
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
              <span class="text-gray-400">Name:</span> <span class="font-medium">{{ targetName }}</span>
            </div>
            <div class="text-gray-300">
              <span class="text-gray-400">ID:</span> <span class="font-mono text-sm">{{ targetId }}</span>
            </div>
            <div class="text-gray-300">
              <span class="text-gray-400">Type:</span> {{ targetType === 'player' ? 'Player' : 'Record' }}
            </div>
          </div>
        </div>

        <!-- Moderator Details -->
        <div class="bg-main-700/50 rounded-lg p-4">
          <h4 class="text-lg font-medium text-gray-200 mb-3">Moderator</h4>
          <div class="flex items-start gap-4">
            <img 
              v-if="selectedLogForModal.mod.avatar_url"
              :src="selectedLogForModal.mod.avatar_url" 
              :alt="selectedLogForModal.mod.username"
              class="w-12 h-12 rounded-full"
            />
            <div class="space-y-2">
              <div class="text-gray-300">
                <span class="text-gray-400">Name:</span> <span class="font-medium">{{ selectedLogForModal.mod.username }}</span>
              </div>
              <div class="text-gray-300">
                <span class="text-gray-400">Steam ID:</span> <span class="font-mono text-sm">{{ selectedLogForModal.mod.steam_id }}</span>
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
</template>
