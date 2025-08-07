<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore, type ModerationTarget } from '@/stores/moderation'
import ModerationModal from './ModerationModal.vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'

const props = defineProps<{
  targetId: string
  targetType: 'player' | 'record'
  targetName: string
  is_banned?: boolean
  is_invalid?: boolean
}>()

const emit = defineEmits(['moderationComplete'])

const moderationStore = useModerationStore()
const showModal: Ref<boolean> = ref(false)

const target = computed((): ModerationTarget => ({
  id: props.targetId,
  type: props.targetType,
  name: props.targetName,
  is_banned: props.is_banned,
  is_invalid: props.is_invalid
}))

const openModerationModal = () => {
  showModal.value = true
}

const closeModerationModal = () => {
  showModal.value = false
}

const handleModerationComplete = () => {
  emit('moderationComplete')
  showModal.value = false
}
</script>

<template>
  <div v-if="moderationStore.canModerate.value" class="relative" @click.stop>
    <button
      @click="openModerationModal"
      :disabled="moderationStore.isLoading.value"
      class="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg transition-colors"
    >
      <span>{{ moderationStore.isLoading.value ? 'Processing...' : 'Moderate' }}</span>
      <IconChevronDown class="w-4 h-4" />
    </button>

    <!-- Moderation Modal -->
    <ModerationModal
      :target="target"
      :show="showModal"
      @moderationComplete="handleModerationComplete"
      @close="closeModerationModal"
    />
  </div>
</template>