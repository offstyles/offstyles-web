<!-- filepath: c:\Users\tommy\Documents\Git\offstyles-web\src\components\AuthButton.vue -->
<script setup lang="ts">
import { useAuth } from '@/stores/auth'
import AuthDropdown from './AuthDropdown.vue'
import loadWheel from './icons/loadWheel.vue'

const { user, isLoggedIn, isLoading, login } = useAuth()
</script>

<template>
  <div class="flex items-center">
    <!-- Loading state -->
    <loadWheel v-if="isLoading" class="text-gray-300 w-6 h-6" />
    
    <!-- Logged in state -->
    <AuthDropdown v-else-if="isLoggedIn && user" :user="user" />
    
    <!-- Not logged in state -->
    <button 
      v-else
      @click="login"
      class="hover:opacity-80 transition-opacity"
    >
      <img 
        src="https://community.fastly.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
        alt="Sign in through Steam"
        class="h-8"
      />
    </button>
  </div>
</template>