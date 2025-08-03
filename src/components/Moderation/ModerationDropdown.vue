<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { ModerationActionType, UserPermissions, type ModerationPostData } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'

const props = defineProps<{
  targetId: string
  targetType: 'player' | 'record'
  targetName: string
  isBanned?: boolean
}>()

const { user } = useAuth()
const showDropdown: Ref<boolean> = ref(false)
const isLoading: Ref<boolean> = ref(false)

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
      if (props.isBanned) {
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

const performAction = async (actionType: ModerationActionType, label: string) => {
  const reason = prompt(`Enter reason for ${label.toLowerCase()}:`)
  if (!reason || reason.trim() === '') return
  
  isLoading.value = true
  showDropdown.value = false
  
  try {
    if (props.targetType === 'player') {
      await OffstylesApi.moderatePlayer(props.targetId, actionType as 'ban' | 'unban', reason.trim())
    } else {
      await OffstylesApi.moderateRecord(props.targetId, actionType as 'invalidate' | 'validate', reason.trim())
    }
    
    // Show success message
    alert(`Successfully ${label.toLowerCase()} for ${props.targetName}`)
    
    // Emit event to refresh parent component
    emit('moderationComplete')
  } catch (error) {
    console.error('Moderation action failed:', error)
    alert(`Failed to ${label.toLowerCase()}: ${error}`)
  } finally {
    isLoading.value = false
  }
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
          @click="performAction(action.action, action.label)"
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
</template>