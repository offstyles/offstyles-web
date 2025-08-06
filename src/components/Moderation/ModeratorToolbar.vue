<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from '@/stores/auth'
import { UserPermissions } from '@/types/moderation'

const props = defineProps<{
  selectedRecords?: string[]
  recordNames?: Record<string, string>
  targetId?: string
  targetType?: 'player' | 'record'
  targetName?: string
}>()

const emit = defineEmits<{
  bulkModerate: []
  showLogs: []
  toggleSelection: []
  clearSelection: []
}>()

const { user } = useAuth()
const isVisible: Ref<boolean> = ref(false)

const userPermissions = computed(() => {
  if (!user.value) return new UserPermissions(0)
  return new UserPermissions(user.value.permissions)
})

const isModerator = computed(() => {
  return userPermissions.value.isModerator()
})

const canBulkModerate = computed(() => {
  return userPermissions.value.contains(UserPermissions.INVALIDATE_TIMES)
})

const canViewLogs = computed(() => {
  return userPermissions.value.isModerator()
})

const selectedCount = computed(() => {
  return props.selectedRecords?.length || 0
})

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div v-if="isModerator" class="fixed top-4 right-4 z-40">
    <!-- Toggle Button -->
    <button
      @click="toggleVisibility"
      class="mb-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg shadow-lg transition-colors"
      title="Toggle Moderator Tools"
    >
      🛡️ Mod Tools
    </button>
    
    <!-- Moderator Toolbar -->
    <div 
      v-if="isVisible"
      class="bg-main-800 border border-main-400 rounded-lg shadow-lg p-4 min-w-[250px]"
    >
      <h3 class="text-white font-semibold mb-3 text-center">Moderator Tools</h3>
      
      <!-- Bulk Actions Section -->
      <div v-if="canBulkModerate && selectedRecords !== undefined" class="mb-4">
        <h4 class="text-gray-300 text-sm font-medium mb-2">Bulk Actions</h4>
        
        <div class="space-y-2">
          <div class="text-gray-400 text-xs">
            {{ selectedCount }} record(s) selected
          </div>
          
          <div class="flex gap-2">
            <button
              @click="emit('toggleSelection')"
              class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
            >
              Toggle All
            </button>
            <button
              @click="emit('clearSelection')"
              :disabled="selectedCount === 0"
              class="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white text-xs rounded transition-colors"
            >
              Clear
            </button>
          </div>
          
          <button
            @click="emit('bulkModerate')"
            :disabled="selectedCount === 0"
            class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded transition-colors"
          >
            Bulk Moderate ({{ selectedCount }})
          </button>
        </div>
      </div>
      
      <!-- Logs Section -->
      <div v-if="canViewLogs" class="mb-4">
        <h4 class="text-gray-300 text-sm font-medium mb-2">Logs & History</h4>
        
        <button
          @click="emit('showLogs')"
          class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
        >
          View Mod Logs
        </button>
      </div>
      
      <!-- Target Info -->
      <div v-if="targetId && targetName" class="text-xs text-gray-400 border-t border-main-500 pt-2">
        <div><strong>Target:</strong> {{ targetType }}</div>
        <div><strong>Name:</strong> {{ targetName }}</div>
        <div><strong>ID:</strong> {{ targetId }}</div>
      </div>
    </div>
  </div>
</template>