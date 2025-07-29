<!-- filepath: c:\Users\tommy\Documents\Git\offstyles-web\src\components\AuthDropdown.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { User } from '@/types/User'
import { useAuth } from '@/stores/auth'

const props = defineProps<{
  user: User
}>()

const { logout } = useAuth()
const showDropdown: Ref<boolean> = ref(false)

const goToProfile = () => {
  window.location.href = `/players/${props.user.steam_id}`
  showDropdown.value = false
}

const handleLogout = () => {
  logout()
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  showDropdown.value = false
}
</script>

<template>
  <div class="relative" @click.stop>
    <div 
      class="flex items-center gap-2 cursor-pointer hover:bg-main-600 p-2 rounded-lg transition-colors"
      @click="showDropdown = !showDropdown"
    >
      <img 
        :src="props.user.avatar_url" 
        :alt="props.user.username"
        class="w-8 h-8 rounded-full"
      />
      <span class="text-gray-200 text-sm max-w-32 truncate">{{ props.user.username }}</span>
    </div>
    
    <!-- Dropdown Menu -->
    <div 
      v-if="showDropdown"
      class="absolute right-0 top-full mt-2 w-40 bg-main-800 border border-main-400 rounded-lg shadow-lg z-50"
    >
      <button
        @click="goToProfile"
        class="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-main-600 rounded-t-lg transition-colors cursor-pointer"
      >
        Profile
      </button>
      <button
        @click="handleLogout"
        class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-main-600 rounded-b-lg transition-colors cursor-pointer"
      >
        Log out
      </button>
    </div>
  </div>
  
  <!-- Invisible overlay to close dropdown -->
  <div 
    v-if="showDropdown"
    class="fixed inset-0 z-40"
    @click="closeDropdown"
  ></div>
</template>