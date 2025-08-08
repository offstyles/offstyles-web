import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from './auth'
import { ModerationActionType, UserPermissions, type ModerationTargetFilter } from '@/types/moderation'
import OffstylesApi from '@/api/offstylesApi'

export interface ModerationTarget {
  id: string
  type: 'player' | 'record'
  name: string
  is_banned?: boolean
  is_invalid?: boolean
  invalid_ref?: string | null  // For records
  ban_ref?: string | null      // For players
}

export interface ModerationFormData {
  action: ModerationActionType
  reason: string
  target: ModerationTarget
}

const isLoading: Ref<boolean> = ref(false)
const showModerationModal: Ref<boolean> = ref(false)
const currentTarget: Ref<ModerationTarget | null> = ref(null)

// Get auth state once at module level
const { user } = useAuth()

export const useModerationStore = () => {
  const userPermissions = computed(() => {
    if (!user.value) return new UserPermissions(0)
    return new UserPermissions(user.value.permissions)
  })

  const canModerate = computed(() => {
    return userPermissions.value.isModerator()
  })

  const canBanPlayers = computed(() => {
    return userPermissions.value.contains(UserPermissions.BAN_PLAYERS)
  })

  const canInvalidateTimes = computed(() => {
    return userPermissions.value.contains(UserPermissions.INVALIDATE_TIMES)
  })

  const canUndoModerationActions = computed(() => {
    return userPermissions.value.contains(UserPermissions.UNDO_MOD_ACTION)
  })

  const getAvailableActions = (target: ModerationTarget) => {
    if (!canModerate.value) return []
    
    const actions = []
    
    if (target.type === 'player') {
      if (canBanPlayers.value) {
        if (target.is_banned) {
          actions.push({ action: ModerationActionType.Unban, label: 'Unban Player' })
        } else {
          actions.push({ action: ModerationActionType.Ban, label: 'Ban Player' })
        }
      }
    } else if (target.type === 'record') {
      if (canInvalidateTimes.value) {
        actions.push({ action: ModerationActionType.Invalidate, label: 'Invalidate Record' })
        actions.push({ action: ModerationActionType.Revalidate, label: 'Revalidate Record' })
      }
    }
    
    // Anyone who can moderate can add notes
    actions.push({ action: ModerationActionType.Note, label: 'Add Note' })
    
    return actions
  }

  const openModerationModal = (target: ModerationTarget) => {
    currentTarget.value = target
    showModerationModal.value = true
  }

  const closeModerationModal = () => {
    showModerationModal.value = false
    currentTarget.value = null
  }

  const performModerationAction = async (action: ModerationActionType, reason: string, target: ModerationTarget): Promise<void> => {
    if (!reason.trim()) {
      throw new Error('Reason is required')
    }

    isLoading.value = true
    try {
      if (target.type === 'player') {
        const apiAction = action.toLowerCase() as 'ban' | 'unban'
        await OffstylesApi.moderatePlayer(target.id, apiAction, reason.trim())
      } else {
        const apiAction = action.toLowerCase() as 'invalidate' | 'revalidate'
        await OffstylesApi.moderateRecord(target.id, apiAction, reason.trim())
      }
    } finally {
      isLoading.value = false
    }
  }

  const performBulkModerationAction = async (action: ModerationActionType, reason: string, recordIds: string[]): Promise<void> => {
    if (!reason.trim()) {
      throw new Error('Reason is required')
    }
    if (recordIds.length === 0) {
      throw new Error('No records selected')
    }

    isLoading.value = true
    try {
      const apiAction = action.toLowerCase() as 'invalidate' | 'revalidate'
      await OffstylesApi.moderateRecords(recordIds, apiAction, reason.trim())
    } finally {
      isLoading.value = false
    }
  }

  const getModerationLogs = async (id: string) => {
    return await OffstylesApi.getModerationLogs(id)
  }

  const reverseModerationActions = async (moderatorSteamId: string, timeframeHours: number, reason: string) => {
    return await OffstylesApi.reverseModerationActions(moderatorSteamId, timeframeHours, reason)
  }

  const getRecentModerationLogs = async (filter?: ModerationTargetFilter) => {
    return await OffstylesApi.getRecentModerationLogs(filter)
  }

  return {
    // State
    isLoading: computed(() => isLoading.value),
    showModerationModal: computed(() => showModerationModal.value),
    currentTarget: computed(() => currentTarget.value),
    
    // Permissions
    canModerate,
    canBanPlayers,
    canInvalidateTimes,
    canUndoModerationActions,
    userPermissions,
    
    // Actions
    getAvailableActions,
    openModerationModal,
    closeModerationModal,
    performModerationAction,
    performBulkModerationAction,
    getModerationLogs,
    reverseModerationActions,
    getRecentModerationLogs
  }
}
