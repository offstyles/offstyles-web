<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { ModerationActionType, UserPermissions, type ModerationLogEntry } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'

const props = defineProps<{
  targetId?: string
  targetType?: 'player' | 'record'
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  actionReversed: []
}>()

const { user } = useAuth()
const logs: Ref<ModerationLogEntry[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
const error: Ref<string | null> = ref(null)

// Reversal confirmation modal state
const showReversalModal: Ref<boolean> = ref(false)
const reversalActionId: Ref<string> = ref('')
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

const getActionColor = (action: ModerationActionType) => {
  switch (action) {
    case ModerationActionType.Ban:
    case ModerationActionType.Invalidate:
      return 'text-red-400'
    case ModerationActionType.Unban:
    case ModerationActionType.Revalidate:
      return 'text-green-400'
    case ModerationActionType.Note:
    default:
      return 'text-blue-400'
  }
}

const loadLogs = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    logs.value = await OffstylesApi.getModerationLogs(props.targetId, props.targetType)
  } catch (err) {
    console.error('Failed to load moderation logs:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load logs'
  } finally {
    isLoading.value = false
  }
}

const showReversalConfirmation = (actionId: string) => {
  reversalActionId.value = actionId
  showReversalModal.value = true
}

const confirmReversal = async () => {
  if (!reversalActionId.value) return
  
  isReversing.value = true
  
  try {
    await OffstylesApi.reverseModerationAction(reversalActionId.value)
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
  reversalActionId.value = ''
}

onMounted(() => {
  if (props.isOpen) {
    loadLogs()
  }
})

// Call loadLogs when isOpen changes to true
const previousIsOpen = ref(props.isOpen)
const watchIsOpen = () => {
  if (props.isOpen && !previousIsOpen.value) {
    loadLogs()
  }
  previousIsOpen.value = props.isOpen
}

// Watch for changes
const unwatchIsOpen = setInterval(watchIsOpen, 100)
onMounted(() => {
  setTimeout(() => {
    clearInterval(unwatchIsOpen)
  }, 1000)
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
          <span v-if="targetId" class="text-gray-400 text-sm ml-2">
            ({{ targetType }}: {{ targetId }})
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
        <div v-else-if="logs.length === 0" class="text-center py-8">
          <div class="text-gray-400">No moderation logs found</div>
        </div>
        
        <!-- Logs list -->
        <div v-else class="space-y-4">
          <div 
            v-for="log in logs" 
            :key="log._id"
            class="bg-main-700 border border-main-500 rounded-lg p-4"
            :class="{ 'opacity-50': log.reversed }"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span 
                    :class="getActionColor(log.action)"
                    class="font-semibold uppercase text-sm"
                  >
                    {{ log.action }}
                  </span>
                  <span v-if="log.reversed" class="text-yellow-500 text-sm">(REVERSED)</span>
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Target:</strong> {{ log.target_type }} {{ log.target_id }}
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Moderator:</strong> {{ log.moderator_name || log.moderator_steam_id }}
                </div>
                
                <div class="text-gray-300 mb-2">
                  <strong>Reason:</strong> {{ log.reason }}
                </div>
                
                <div class="text-gray-400 text-sm">
                  {{ formatDate(log.timestamp) }}
                </div>
                
                <div v-if="log.reversed" class="text-yellow-400 text-sm mt-1">
                  Reversed by {{ log.reversed_by }} on {{ formatDate(log.reversed_at!) }}
                </div>
              </div>
              
              <!-- Reverse Action Button -->
              <div v-if="canReverse && !log.reversed" class="ml-4">
                <button
                  @click="showReversalConfirmation(log._id)"
                  class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Reverse
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
      <h3 class="text-lg font-semibold text-white mb-4">Confirm Reversal</h3>
      
      <!-- Content -->
      <div class="mb-6">
        <p class="text-gray-300">
          Are you sure you want to reverse this moderation action? This action cannot be undone.
        </p>
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
          :disabled="isReversing"
          class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500 text-white rounded-md transition-colors"
        >
          {{ isReversing ? 'Reversing...' : 'Reverse Action' }}
        </button>
      </div>
    </div>
  </div>
</template>