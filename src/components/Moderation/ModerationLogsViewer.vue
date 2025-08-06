<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { UserPermissions } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'

// Define interfaces based on the OpenAPI spec
interface ModActionWithInfo {
  action: string; // ModerationActionType enum value
  mod: {
    _id?: string;
    steam_id: string;
    username: string;
    avatar_url?: string;
    permissions: number;
    created_at: number;
    last_login: number;
    is_banned: boolean;
    ban_ref?: string;
  };
  notes: string;
  timestamp: number;
}

interface ModDocWithInfo {
  _id: string;
  actions: ModActionWithInfo[];
}

const props = defineProps<{
  recordId?: string // The invalid_ref or ban_ref ID to search for
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  actionReversed: []
}>()

const { user } = useAuth()
const logs: Ref<ModDocWithInfo | null> = ref(null)
const isLoading: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)

// Reversal confirmation modal state
const showReversalModal: Ref<boolean> = ref(false)
const reversalModerator: Ref<string> = ref('')
const reversalTimeframe: Ref<number> = ref(24)
const reversalReason: Ref<string> = ref('')
const isReversing: Ref<boolean> = ref(false)

const userPermissions = computed(() => {
  if (!user.value) return new UserPermissions(0)
  return new UserPermissions(user.value.permissions)
})

const canReverse = computed(() => {
  return userPermissions.value.contains(UserPermissions.UNDO_MOD_ACTION)
})

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'Ban':
    case 'Invalidate':
      return 'text-red-400'
    case 'Unban':
    case 'Revalidate':
      return 'text-green-400'
    case 'Note':
    default:
      return 'text-blue-400'
  }
}

const loadLogs = async () => {
  if (!props.recordId) {
    error.value = 'Moderation logs require a specific invalid_ref or ban_ref ID. This feature is only available for records that have been moderated.'
    return
  }

  isLoading.value = true
  error.value = null
  
  try {
    logs.value = await OffstylesApi.getModerationLogs(props.recordId)
  } catch (err) {
    console.error('Failed to load moderation logs:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load logs'
  } finally {
    isLoading.value = false
  }
}

const showReversalConfirmation = (moderatorSteamId: string) => {
  reversalModerator.value = moderatorSteamId
  reversalTimeframe.value = 24
  reversalReason.value = ''
  showReversalModal.value = true
}

const confirmReversal = async () => {
  if (!reversalModerator.value || !reversalReason.value.trim()) return
  
  isReversing.value = true
  
  try {
    const result = await OffstylesApi.reverseModerationActions(
      reversalModerator.value, 
      reversalTimeframe.value, 
      reversalReason.value.trim()
    )
    console.log('Reversal result:', result)
    
    await loadLogs() // Reload logs
    emit('actionReversed')
    showReversalModal.value = false
  } catch (err) {
    console.error('Failed to reverse action:', err)
    error.value = err instanceof Error ? err.message : 'Failed to reverse action'
  } finally {
    isReversing.value = false
  }
}

const cancelReversal = () => {
  showReversalModal.value = false
  reversalModerator.value = ''
  reversalReason.value = ''
}

onMounted(() => {
  if (props.isOpen) {
    loadLogs()
  }
})

// Watch for isOpen prop changes
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadLogs()
  }
})
</script>

<template>
  <!-- Modal Backdrop -->
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <!-- Modal Content -->
    <div 
      class="bg-main-800 border border-main-400 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-main-400">
        <h2 class="text-xl font-semibold text-white">
          Moderation Logs
          <span v-if="recordId" class="text-gray-400 text-sm ml-2">
            (Record: {{ recordId }})
          </span>
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="text-gray-400">Loading moderation logs...</div>
        </div>
        
        <!-- Error -->
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-400">{{ error }}</div>
          <button 
            @click="loadLogs"
            class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
        
        <!-- No logs -->
        <div v-else-if="!logs || logs.actions.length === 0" class="text-center py-8">
          <div class="text-gray-400">No moderation logs found</div>
        </div>
        
        <!-- Logs list -->
        <div v-else class="space-y-4">
          <div 
            v-for="action in logs.actions" 
            :key="action.timestamp"
            class="bg-main-700 border border-main-500 rounded-lg p-4"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span 
                    :class="getActionColor(action.action)"
                    class="font-semibold uppercase text-sm"
                  >
                    {{ action.action }}
                  </span>
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Record ID:</strong> {{ recordId }}
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Moderator:</strong> {{ action.mod.username }} ({{ action.mod.steam_id }})
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Reason:</strong> {{ action.notes }}
                </div>
                
                <div class="text-gray-400 text-sm">
                  {{ formatDate(action.timestamp) }}
                </div>
              </div>
              
              <!-- Reverse Action Button -->
              <div v-if="canReverse" class="ml-4">
                <button
                  @click="showReversalConfirmation(action.mod.steam_id)"
                  class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Reverse Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-main-400">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>

  <!-- Reversal Confirmation Modal -->
  <div 
    v-if="showReversalModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
    @click="cancelReversal"
  >
    <!-- Modal Content -->
    <div 
      class="bg-main-800 border border-main-400 rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      @click.stop
    >
      <!-- Header -->
      <h3 class="text-lg font-semibold text-white mb-4">Reverse Moderator Actions</h3>
      
      <!-- Content -->
      <div class="mb-6 space-y-4">
        <p class="text-gray-300">
          This will reverse all moderation actions by the selected moderator within the specified timeframe.
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Moderator Steam ID
          </label>
          <input
            v-model="reversalModerator"
            type="text"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            readonly
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Timeframe (hours)
          </label>
          <input
            v-model.number="reversalTimeframe"
            type="number"
            min="1"
            max="168"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Reason (required)
          </label>
          <textarea
            v-model="reversalReason"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter reason for reversal..."
          ></textarea>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          @click="cancelReversal"
          :disabled="isReversing"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          @click="confirmReversal"
          :disabled="isReversing || !reversalReason.trim()"
          class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500 text-white rounded-md transition-colors"
        >
          {{ isReversing ? 'Reversing...' : 'Reverse Actions' }}
        </button>
      </div>
    </div>
  </div>
</template>