<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  action: string
  size?: 'sm' | 'md'
}>()

const colorClass = computed(() => {
  switch (props.action.toLowerCase()) {
    case 'ban':
    case 'invalidate':
      return 'text-red-300 bg-red-900/30 border border-red-800/40'
    case 'unban':
    case 'revalidate':
      return 'text-green-300 bg-green-900/30 border border-green-800/40'
    case 'note':
      return 'text-blue-300 bg-blue-900/30 border border-blue-800/40'
    case 'reverse':
      return 'text-purple-300 bg-purple-900/30 border border-purple-800/40'
    default:
      return 'text-gray-300 bg-gray-900/30 border border-gray-800/40'
  }
})

const sizeClass = computed(() => {
  return props.size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px] tracking-wide font-semibold uppercase'
    : 'px-2 py-0.5 text-xs tracking-wide font-semibold uppercase'
})
</script>

<template>
  <span :class="['rounded inline-flex items-center', sizeClass, colorClass]">
    {{ action }}
  </span>
</template>
