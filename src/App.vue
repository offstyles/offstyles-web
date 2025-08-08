<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'
import AuthButton from '@/components/AuthButton.vue'
import AdminModerationPanel from '@/components/Moderation/AdminModerationPanel.vue'
import { useAuth } from '@/stores/auth'

const { initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
})
</script>

<template>
    <header class="mb-6 w-full">
      <div class="flex flex-col lg:flex-row justify-between items-center w-full bg-main-700 p-4 px-8 rounded-xl">
          <router-link class="p-0 mb-4 md:mb-0" :to="{path: '/'}">
            <div class="flex items-center">
              <span class="whitespace-nowrap text-gray-200 text-lg font-black roboto">Offstyle DB</span>
            </div>
          </router-link>
        <div class="flex items-center gap-4 flex-col md:flex-row">
          <nav class="flex gap-7 gap-y-2 text-gray-300 roboto text-center flex-wrap justify-center relative md:pr-4 pb-2 md:pb-0
          after:bg-gray-400 after:absolute md:after:h-[80%] md:after:w-[1px] md:after:right-0 md:after:top-1/2 md:after:-translate-y-1/2
          after:h-[1px] after:w-[40px] after:top-full">
            <router-link class="hover:text-gray-100 text-nowrap" to="/">Recent Records</router-link>
            <router-link class="hover:text-gray-100 text-nowrap" to="/maps">Map Leaderboards</router-link>
            <router-link class="hover:text-gray-100 text-nowrap" to="/players">Player Lookup</router-link>
            <router-link class="hover:text-gray-100 text-nowrap" to="/servers">Servers</router-link>
          </nav>
          <AuthButton />
        </div>
      </div>
    </header>
    <RouterView class="mb-auto" />
    
    <!-- Admin Moderation Panel -->
    <AdminModerationPanel />
    
    <div class="flex flex-col lg:flex-row pt-8 justify-end">
      <div class="text-end text-gray-500 text-sm">WIP, Website by @y_mia | <a href="https://github.com/offstyles">https://github.com/offstyles</a></div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');

.roboto {
  font-family: "Roboto", monospace;
}

.inter {
  font-family: "Inter", monospace;
}
</style>