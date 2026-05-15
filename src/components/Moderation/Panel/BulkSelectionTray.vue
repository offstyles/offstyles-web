<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { ModerationActionType } from '@/types/moderation'
import { useModerationStore } from '@/stores/moderation'
import { useBulkSelection } from '@/composables/useBulkSelection'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import type { ConfirmRow } from './ConfirmActionDialog.vue'

const emit = defineEmits<{
  done: []
}>()

const moderationStore = useModerationStore()
const bulk = useBulkSelection()

const expanded: Ref<boolean> = ref(false)
const showSavedPanel: Ref<boolean> = ref(false)
const saveName: Ref<string> = ref('')

const reason: Ref<string> = ref('')
const action: Ref<ModerationActionType> = ref(ModerationActionType.Invalidate)
const isProcessing: Ref<boolean> = ref(false)
const error: Ref<string> = ref('')
const success: Ref<string> = ref('')
const showConfirm: Ref<boolean> = ref(false)
const useServerOwnerEndpoint: Ref<boolean> = ref(false)

const visible = computed(() => moderationStore.canAccessModerationPanel.value && !bulk.isEmpty.value)

const availableActions = computed(() => {
  const acts: { value: ModerationActionType; label: string }[] = []
  if (moderationStore.canInvalidateTimes.value) {
    acts.push({ value: ModerationActionType.Invalidate, label: 'Invalidate' })
    acts.push({ value: ModerationActionType.Revalidate, label: 'Revalidate' })
    acts.push({ value: ModerationActionType.Note, label: 'Add Note' })
  }
  return acts
})

const canSubmit = computed(() => {
  if (isProcessing.value) return false
  if (!reason.value.trim()) return false
  if (bulk.count.value === 0) return false
  if (useServerOwnerEndpoint.value) {
    return moderationStore.canServerOwnerInvalidate.value
        && action.value === ModerationActionType.Invalidate
  }
  return moderationStore.canInvalidateTimes.value
})

const confirmRows = computed<ConfirmRow[]>(() => {
  const rows: ConfirmRow[] = [
    { label: 'Action', value: action.value },
    { label: 'Records', value: `${bulk.count.value} record${bulk.count.value === 1 ? '' : 's'}` },
  ]
  if (useServerOwnerEndpoint.value) {
    rows.push({ label: 'Endpoint', value: 'Server-owner self-invalidate' })
  }
  return rows
})

const submit = () => {
  error.value = ''
  success.value = ''
  if (!canSubmit.value) return
  showConfirm.value = true
}

const performSubmit = async () => {
  isProcessing.value = true
  error.value = ''
  try {
    if (useServerOwnerEndpoint.value) {
      await moderationStore.performServerOwnerInvalidate(bulk.ids.value, reason.value)
    } else {
      await moderationStore.performBulkModerationAction(action.value, reason.value, bulk.ids.value)
    }
    success.value = `Applied ${action.value} to ${bulk.count.value} record${bulk.count.value === 1 ? '' : 's'}.`
    bulk.clear()
    reason.value = ''
    showConfirm.value = false
    emit('done')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed'
  } finally {
    isProcessing.value = false
  }
}

const handleSave = () => {
  if (!saveName.value.trim()) return
  bulk.save(saveName.value)
  saveName.value = ''
}
</script>

<template>
  <div v-if="visible" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(880px,calc(100vw-2rem))]">
    <div class="bg-main-800/95 backdrop-blur border border-main-400 rounded-xl shadow-2xl">
      <!-- Collapsed bar -->
      <div class="flex items-center gap-3 px-4 py-3">
        <button
          @click="expanded = !expanded"
          class="flex items-center gap-2 text-gray-200 hover:text-white cursor-pointer"
        >
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600/20 text-blue-300 text-sm font-bold">
            {{ bulk.count.value }}
          </span>
          <span class="font-medium">selected</span>
          <span class="text-gray-400 text-sm">{{ expanded ? '▾' : '▸' }}</span>
        </button>

        <div class="ml-auto flex items-center gap-2">
          <button
            @click="showSavedPanel = !showSavedPanel"
            class="px-3 py-1.5 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-200 cursor-pointer"
            title="Saved selections"
          >
            Saved ({{ bulk.saved.value.length }})
          </button>
          <button
            @click="bulk.clear()"
            class="px-3 py-1.5 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-300 hover:text-red-300 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Saved selections panel -->
      <div v-if="showSavedPanel" class="border-t border-main-500 p-4 space-y-3 bg-main-900/40">
        <div class="flex gap-2">
          <input
            v-model="saveName"
            type="text"
            placeholder="Name this selection…"
            class="flex-1 px-3 py-1.5 bg-main-700 border border-main-500 rounded text-gray-200 text-sm placeholder-gray-500"
            @keyup.enter="handleSave"
          />
          <button
            @click="handleSave"
            :disabled="!saveName.trim() || bulk.count.value === 0"
            class="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded cursor-pointer"
          >
            Save current
          </button>
        </div>
        <div v-if="bulk.saved.value.length === 0" class="text-sm text-gray-500 text-center py-2">
          No saved selections yet.
        </div>
        <div v-else class="space-y-1 max-h-48 overflow-y-auto">
          <div
            v-for="slot in bulk.saved.value"
            :key="slot.name"
            class="flex items-center gap-2 px-3 py-2 bg-main-700/50 border border-main-500 rounded"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-200 truncate">{{ slot.name }}</div>
              <div class="text-xs text-gray-500">
                {{ slot.entries.length }} record{{ slot.entries.length === 1 ? '' : 's' }} ·
                {{ new Date(slot.saved_at).toLocaleDateString() }}
              </div>
            </div>
            <button
              @click="bulk.restore(slot.name, 'replace')"
              class="px-2 py-1 text-xs bg-main-600 hover:bg-main-500 text-gray-200 rounded cursor-pointer"
            >
              Load
            </button>
            <button
              @click="bulk.restore(slot.name, 'merge')"
              class="px-2 py-1 text-xs bg-main-600 hover:bg-main-500 text-gray-200 rounded cursor-pointer"
              title="Merge with current selection"
            >
              + Merge
            </button>
            <button
              @click="bulk.deleteSaved(slot.name)"
              class="px-2 py-1 text-xs text-gray-400 hover:text-red-300 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Expanded action panel -->
      <div v-if="expanded" class="border-t border-main-500 p-4 space-y-3">
        <div class="max-h-32 overflow-y-auto bg-main-900/60 border border-main-500 rounded">
          <div
            v-for="entry in bulk.list.value"
            :key="entry.id"
            class="flex items-center gap-2 px-3 py-1.5 text-sm border-b border-main-500/40 last:border-b-0"
          >
            <span class="flex-1 text-gray-200 truncate">{{ entry.label }}</span>
            <button
              @click="bulk.remove(entry.id)"
              class="text-gray-500 hover:text-red-300 cursor-pointer text-xs"
              title="Remove from selection"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-3 items-start">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-gray-400 uppercase tracking-wide">Action</label>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="opt in availableActions"
                :key="opt.value"
                @click="action = opt.value; useServerOwnerEndpoint = false"
                :class="[
                  'px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer',
                  action === opt.value && !useServerOwnerEndpoint
                    ? 'bg-main-600 border-main-300 text-white'
                    : 'bg-main-700 border-main-500 text-gray-300 hover:border-main-400',
                ]"
              >
                {{ opt.label }}
              </button>
              <button
                v-if="moderationStore.canServerOwnerInvalidate.value"
                @click="useServerOwnerEndpoint = true; action = ModerationActionType.Invalidate"
                :class="[
                  'px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer',
                  useServerOwnerEndpoint
                    ? 'bg-purple-700 border-purple-400 text-white'
                    : 'bg-main-700 border-main-500 text-purple-300 hover:border-purple-500',
                ]"
                title="Use server-owner endpoint (only for runs on your servers)"
              >
                SO Invalidate
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs text-gray-400 uppercase tracking-wide">Reason</label>
            <textarea
              v-model="reason"
              rows="2"
              placeholder="Required. Will appear in the audit log."
              class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-main-300"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>
        <div v-if="success" class="text-green-400 text-sm">{{ success }}</div>

        <div class="flex justify-end">
          <button
            @click="submit"
            :disabled="!canSubmit"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors cursor-pointer"
          >
            Apply to {{ bulk.count.value }} record{{ bulk.count.value === 1 ? '' : 's' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmActionDialog
      :show="showConfirm"
      :title="`${action} ${bulk.count.value} record${bulk.count.value === 1 ? '' : 's'}?`"
      :intent="action === ModerationActionType.Invalidate ? 'danger' : action === ModerationActionType.Note ? 'neutral' : 'warning'"
      :rows="confirmRows"
      :reason="reason"
      :confirm-label="`Yes, ${action.toLowerCase()}`"
      :is-processing="isProcessing"
      @confirm="performSubmit"
      @cancel="showConfirm = false"
    />
  </div>
</template>
