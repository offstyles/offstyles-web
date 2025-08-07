<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isInvalid: boolean
  isBanned: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = computed(() => {
  switch (props.size || 'sm') {
    case 'sm':
      return 'w-3 h-3 text-xs'
    case 'md':
      return 'w-4 h-4 text-sm'
    case 'lg':
      return 'w-5 h-5 text-base'
    default:
      return 'w-3 h-3 text-xs'
  }
})

const indicatorColor = computed(() => {
  if (props.isBanned) return 'text-red-500'
  if (props.isInvalid) return 'text-yellow-500'
  return 'text-green-500'
})

const indicatorSymbol = computed(() => {
  if (props.isBanned) return '🚫'
  if (props.isInvalid) return '⚠️'
  return '✓'
})

const tooltipText = computed(() => {
  if (props.isBanned) return 'Player is banned'
  if (props.isInvalid) return 'Record is invalid'
  return 'Valid record'
})
</script>

<template>
  <div 
    class="inline-flex items-center justify-center"
    :class="[sizeClasses, indicatorColor]"
    :title="tooltipText"
  >
    <span class="select-none">{{ indicatorSymbol }}</span>
  </div>
</template>
