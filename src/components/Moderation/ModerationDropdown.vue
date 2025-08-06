<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { ModerationActionType, UserPermissions } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import ModerationModal from './ModerationModal.vue'

const props = defineProps<{
  targetId: string
  targetType: 'player' | 'record'
  targetName: string
  is_banned?: boolean
}>()

const { user } = useAuth()
const showDropdown: Ref<boolean> = ref(false)
const isLoading: Ref<boolean> = ref(false)
const showModal: Ref<boolean> = ref(false)
const currentAction: Ref<ModerationActionType | null> = ref(null)
const currentActionLabel: Ref<string> = ref('')

const userPermissions = computed(() => {
  if (!user.value) return new UserPermissions(0)
  return new UserPermissions(user.value.permissions)
})

const canModerate = computed(() => {
  return userPermissions.value.isModerator()
})

const availableActions = computed(() => {
  if (!canModerate.value) return []
  
  const actions = []
  
  if (props.targetType === 'player') {
    if (userPermissions.value.contains(UserPermissions.BAN_PLAYERS)) {
      if (props.is_banned) {
        actions.push({ action: ModerationActionType.Unban, label: 'Unban Player' })
      } else {
        actions.push({ action: ModerationActionType.Ban, label: 'Ban Player' })
      }
    }
  } else if (props.targetType === 'record') {
    if (userPermissions.value.contains(UserPermissions.INVALIDATE_TIMES)) {
      actions.push({ action: ModerationActionType.Invalidate, label: 'Invalidate Record' })
      actions.push({ action: ModerationActionType.Revalidate, label: 'Revalidate Record' })
    }
  }
  
  actions.push({ action: ModerationActionType.Note, label: 'Add Note' })
  
  return actions
})

const startAction = (actionType: ModerationActionType, label: string) => {
  currentAction.value = actionType
  currentActionLabel.value = label
  showDropdown.value = false
  showModal.value = true
}

const performAction = async (reason: string) => {
  if (!currentAction.value) return
  
  isLoading.value = true
  
  try {
    if (props.targetType === 'player') {
      await OffstylesApi.moderatePlayer(props.targetId, currentAction.value as 'Ban' | 'Unban', reason)
    } else {
      await OffstylesApi.moderateRecord(props.targetId, currentAction.value as 'Invalidate' | 'Revalidate', reason)
    }
    
    // Emit event to refresh parent component
    emit('moderationComplete')
    
    // Close modal
    showModal.value = false
    currentAction.value = null
  } catch (error) {
    console.error('Moderation action failed:', error)
    alert(`Failed to ${currentActionLabel.value.toLowerCase()}: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  currentAction.value = null
  isLoading.value = false
}

const emit = defineEmits(['moderationComplete'])

// Close dropdown when clicking outside
const closeDropdown = () => {
  showDropdown.value = false
}
</script>

<template>
  <div v-if="canModerate" class="relative" @click.stop>
    <button
      @click="showDropdown = !showDropdown"
      :disabled="isLoading"
      class="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
    >
      <span>{{ isLoading ? 'Processing...' : 'Moderate' }}</span>
      <IconChevronDown class="w-4 h-4" />
    </button>
    
    <!-- Dropdown Menu -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 top-full mt-2 w-48 bg-main-800 border border-main-400 rounded-lg shadow-lg z-50"
    >
      <div class="py-1">
        <button
          v-for="action in availableActions"
          :key="action.action"
          @click="startAction(action.action, action.label)"
          class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-main-600 transition-colors"
          :class="{
            'text-red-400': action.action === ModerationActionType.Ban || action.action === ModerationActionType.Invalidate,
            'text-green-400': action.action === ModerationActionType.Unban || action.action === ModerationActionType.Revalidate,
            'text-blue-400': action.action === ModerationActionType.Note
          }"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Invisible overlay to close dropdown -->
  <div 
    v-if="showDropdown"
    class="fixed inset-0 z-40"
    @click="closeDropdown"
  ></div>
  
  <!-- Moderation Modal -->
  <ModerationModal
    :isOpen="showModal"
    :title="currentActionLabel"
    :action="currentAction || ModerationActionType.Note"
    :targetName="targetName"
    :isLoading="isLoading"
    @close="closeModal"
    @confirm="performAction"
  />
</template>