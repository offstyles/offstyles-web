<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
    <header class="mb-6 w-full">
      <div class="flex flex-col sm:flex-row justify-between items-center w-full bg-main-700 p-4 px-8 rounded-xl">
          <router-link class="p-0 mb-4 sm:mb-0" :to="{path: '/'}">
            <div class="flex items-center">
              <span class="whitespace-nowrap text-gray-200 text-lg font-black roboto">Offstyle DB</span>
            </div>
          </router-link>
        <div class="wrapper flex justify-end ml-2">
          <nav class="flex gap-7 text-gray-300 roboto">
            <router-link class="hover:text-gray-100" to="/">Home</router-link>
            <router-link class="hover:text-gray-100" to="/recent-records">Recent Records</router-link>
            <router-link class="hover:text-gray-100" to="/maps">Map Leaderboards</router-link>
            <router-link class="hover:text-gray-100" to="/players">Player Lookup</router-link>
          </nav>
        </div>
      </div>
    </header>
    <RouterView class="mb-auto" />
    <div class="flex flex-col lg:flex-row pt-8 justify-end">
      <div class="text-end text-gray-500 text-sm">footer links or something here idk</div>
    </div>
</template>