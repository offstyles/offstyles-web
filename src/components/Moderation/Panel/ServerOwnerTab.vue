<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import { useBulkSelection } from '@/composables/useBulkSelection'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import type { ConfirmRow } from './ConfirmActionDialog.vue'

const moderationStore = useModerationStore()
const bulk = useBulkSelection()

const idsRaw: Ref<string> = ref('')
const reason: Ref<string> = ref('')
const isProcessing: Ref<boolean> = ref(false)
const error: Ref<string> = ref('')
const success: Ref<string> = ref('')
const showConfirm: Ref<boolean> = ref(false)

const tokens = computed(() => {
  return idsRaw.value
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const parsedIds = computed(() => {
  return tokens.value.filter(s => /^[a-f0-9]{24}$/i.test(s))
})

const invalidTokens = computed(() => {
  return tokens.value.filter(s => !/^[a-f0-9]{24}$/i.test(s))
})

const dedupedIds = computed(() => {
  const set = new Set<string>([...parsedIds.value, ...bulk.ids.value])
  return Array.from(set)
})

const canSubmit = computed(() => {
  return moderationStore.canServerOwnerInvalidate.value
      && dedupedIds.value.length > 0
      && reason.value.trim().length > 0
      && !isProcessing.value
})

const includeBulk: Ref<boolean> = ref(true)

const effectiveIds = computed(() => {
  if (includeBulk.value) return dedupedIds.value
  return parsedIds.value
})

const start = () => {
  error.value = ''
  success.value = ''
  if (effectiveIds.value.length === 0) {
    error.value = 'Provide at least one valid 24-char ObjectId.'
    return
  }
  if (!reason.value.trim()) {
    error.value = 'Reason is required.'
    return
  }
  showConfirm.value = true
}

const perform = async () => {
  isProcessing.value = true
  error.value = ''
  try {
    await moderationStore.performServerOwnerInvalidate(effectiveIds.value, reason.value)
    success.value = `Invalidated ${effectiveIds.value.length} record${effectiveIds.value.length === 1 ? '' : 's'}.`
    showConfirm.value = false
    idsRaw.value = ''
    reason.value = ''
    if (includeBulk.value) bulk.clear()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed'
  } finally {
    isProcessing.value = false
  }
}

const confirmRows = computed<ConfirmRow[]>(() => [
  { label: 'Records', value: `${effectiveIds.value.length}` },
  { label: 'Source', value: includeBulk.value && bulk.count.value > 0 ? 'Pasted IDs + bulk selection' : 'Pasted IDs' },
  { label: 'Endpoint', value: '/so_moderate (server-owner)' },
])
</script>

<template>
  <div class="space-y-4">
    <div class="bg-purple-900/10 border border-purple-800/40 text-purple-200 rounded-lg p-3 text-sm">
      <div class="font-medium">Server-owner self-invalidation</div>
      <p class="text-purple-200/80 text-xs mt-1">
        Use this to invalidate runs set on servers you own (e.g. before a major rule change, or to clear out test runs).
        The backend rejects records that weren't set on a server tied to your owner key.
      </p>
    </div>

    <div v-if="!moderationStore.canServerOwnerInvalidate.value" class="bg-red-900/20 border border-red-800/40 text-red-300 rounded-lg p-3 text-sm">
      You don't have the server-owner invalidate permission. This tab is read-only.
    </div>

    <div class="bg-main-800 border border-main-500 rounded-lg p-4 space-y-3">
      <div>
        <label class="text-xs text-gray-400 uppercase tracking-wide">Record IDs</label>
        <textarea
          v-model="idsRaw"
          rows="4"
          placeholder="Paste ObjectIds — comma, space, or newline separated"
          class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-main-300"
        />
        <div class="flex flex-wrap justify-between gap-2 text-xs mt-1">
          <span class="text-gray-500">
            {{ parsedIds.length }} valid<span v-if="invalidTokens.length"> · <span class="text-red-400">{{ invalidTokens.length }} invalid</span></span>
          </span>
        </div>
        <div v-if="invalidTokens.length" class="flex flex-wrap gap-1 text-[11px] mt-1">
          <span
            v-for="t in invalidTokens.slice(0, 8)"
            :key="t"
            class="px-1.5 py-0.5 rounded bg-red-900/20 border border-red-800/40 text-red-300 font-mono"
          >{{ t.length > 18 ? t.slice(0, 16) + '…' : t }}</span>
          <span v-if="invalidTokens.length > 8" class="text-red-400">+{{ invalidTokens.length - 8 }} more</span>
        </div>
      </div>

      <div v-if="bulk.count.value > 0" class="flex items-start gap-2 px-3 py-2 bg-main-900/40 border border-main-500 rounded">
        <input
          v-model="includeBulk"
          type="checkbox"
          class="mt-1"
        />
        <div class="flex-1 text-sm">
          <div class="text-gray-200">Include bulk selection ({{ bulk.count.value }} record{{ bulk.count.value === 1 ? '' : 's' }})</div>
          <div class="text-xs text-gray-500">Combines with the IDs above; duplicates are removed.</div>
        </div>
        <span class="text-xs text-gray-400">total: {{ effectiveIds.length }}</span>
      </div>

      <div>
        <label class="text-xs text-gray-400 uppercase tracking-wide">Reason</label>
        <textarea
          v-model="reason"
          rows="2"
          placeholder="Required. Will appear in the audit log."
          class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-main-300"
        />
      </div>

      <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-400 text-sm bg-green-900/20 border border-green-800/40 rounded p-2">{{ success }}</div>

      <div class="flex justify-end">
        <button
          @click="start"
          :disabled="!canSubmit"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white text-sm rounded-lg cursor-pointer"
        >
          Invalidate {{ effectiveIds.length }} record{{ effectiveIds.length === 1 ? '' : 's' }}
        </button>
      </div>
    </div>

    <ConfirmActionDialog
      :show="showConfirm"
      title="Self-invalidate records?"
      intent="warning"
      :rows="confirmRows"
      :reason="reason"
      confirm-label="Yes, invalidate"
      :is-processing="isProcessing"
      @confirm="perform"
      @cancel="showConfirm = false"
    />
  </div>
</template>
