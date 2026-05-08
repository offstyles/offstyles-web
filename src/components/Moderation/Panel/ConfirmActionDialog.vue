<script setup lang="ts">
export interface ConfirmRow {
  label: string
  value: string
}

defineProps<{
  show: boolean
  title: string
  intent: 'danger' | 'warning' | 'neutral'
  rows: ConfirmRow[]
  reason: string
  confirmLabel: string
  isProcessing?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const intentBtnClass = {
  danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
  warning: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400',
  neutral: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
} as const

const intentRingClass = {
  danger: 'ring-red-500/30',
  warning: 'ring-purple-500/30',
  neutral: 'ring-blue-500/30',
} as const
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/60 flex items-start justify-center z-[80] p-4 overflow-y-auto"
    @click.self="emit('cancel')"
  >
    <div :class="['bg-main-800 border border-main-400 rounded-lg shadow-2xl w-full max-w-md my-12 mx-auto ring-2', intentRingClass[intent]]">
      <div class="p-4 border-b border-main-400">
        <h3 class="text-lg font-medium text-gray-100">{{ title }}</h3>
        <p class="text-sm text-gray-400 mt-1">Review the details before confirming.</p>
      </div>

      <div class="p-4 space-y-3">
        <dl class="bg-main-900/60 border border-main-500 rounded p-3 text-sm space-y-2">
          <div v-for="row in rows" :key="row.label" class="flex gap-3">
            <dt class="text-gray-400 w-32 shrink-0">{{ row.label }}</dt>
            <dd class="text-gray-200 break-all">{{ row.value }}</dd>
          </div>
        </dl>

        <div class="bg-main-900/60 border border-main-500 rounded p-3">
          <div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Reason</div>
          <div class="text-sm text-gray-200 whitespace-pre-wrap">{{ reason || '(no reason supplied)' }}</div>
        </div>
      </div>

      <div class="p-4 border-t border-main-400 flex justify-end gap-3">
        <button
          @click="emit('cancel')"
          :disabled="isProcessing"
          class="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          @click="emit('confirm')"
          :disabled="isProcessing"
          :class="['px-4 py-2 text-white rounded-lg transition-colors cursor-pointer', intentBtnClass[intent]]"
        >
          {{ isProcessing ? 'Working…' : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
