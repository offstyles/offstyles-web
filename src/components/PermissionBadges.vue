<script setup lang="ts">
import { computed } from 'vue'
import { describePermissions, permissionRoleLabel, type PermissionTone } from '@/types/moderation'

const props = withDefaults(defineProps<{
  permissions: number
  size?: 'sm' | 'md'
  showRole?: boolean
}>(), {
  size: 'sm',
  showRole: true,
})

const labels = computed(() => describePermissions(props.permissions))
const role = computed(() => permissionRoleLabel(props.permissions))

const toneClass: Record<PermissionTone, string> = {
  red:    'text-red-300 bg-red-900/30 border-red-800/40',
  purple: 'text-purple-300 bg-purple-900/30 border-purple-800/40',
  yellow: 'text-yellow-300 bg-yellow-900/30 border-yellow-800/40',
  blue:   'text-blue-300 bg-blue-900/30 border-blue-800/40',
  gray:   'text-gray-300 bg-gray-900/30 border-gray-800/40',
}

const sizeClass = computed(() => {
  return props.size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px] tracking-wide'
    : 'px-2 py-0.5 text-xs tracking-wide'
})
</script>

<template>
  <div v-if="labels.length > 0" class="flex flex-wrap items-center gap-1">
    <span
      v-if="showRole && role"
      :class="['rounded border font-semibold uppercase', sizeClass, toneClass[role === 'Admin' ? 'purple' : role === 'Moderator' ? 'red' : 'purple']]"
    >
      {{ role }}
    </span>
    <span
      v-for="l in labels"
      :key="l.name"
      :class="['rounded border', sizeClass, toneClass[l.tone]]"
    >
      {{ l.name }}
    </span>
  </div>
</template>
