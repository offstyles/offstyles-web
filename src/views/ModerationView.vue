<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModerationStore } from '@/stores/moderation'
import { useAuth } from '@/stores/auth'
import ActivityTab from '@/components/Moderation/Panel/ActivityTab.vue'
import LookupTab from '@/components/Moderation/Panel/LookupTab.vue'
import ModeratorsTab from '@/components/Moderation/Panel/ModeratorsTab.vue'
import ServerOwnerTab from '@/components/Moderation/Panel/ServerOwnerTab.vue'
import BulkSelectionTray from '@/components/Moderation/Panel/BulkSelectionTray.vue'
import type { RecentModAction } from '@/types/moderation'

type TabKey = 'activity' | 'lookup' | 'moderators' | 'server-owner'

const route = useRoute()
const router = useRouter()
const moderationStore = useModerationStore()
const { user, isLoading: authLoading } = useAuth()

const tabs = computed<{ key: TabKey; label: string; visible: boolean; description: string }[]>(() => [
  {
    key: 'activity',
    label: 'Activity',
    visible: moderationStore.canModerate.value || moderationStore.canUndoModerationActions.value,
    description: 'Recent moderation actions across the site.',
  },
  {
    key: 'lookup',
    label: 'Lookup',
    visible: moderationStore.canModerate.value || moderationStore.canUndoModerationActions.value,
    description: 'Search by Steam ID, run ID, or mod-log reference.',
  },
  {
    key: 'moderators',
    label: 'Moderators',
    visible: moderationStore.canUndoModerationActions.value,
    description: 'Per-moderator activity and reverse window (admin).',
  },
  {
    key: 'server-owner',
    label: 'Server Owner',
    visible: moderationStore.canServerOwnerInvalidate.value,
    description: 'Self-invalidate runs on your servers.',
  },
])

const visibleTabs = computed(() => tabs.value.filter(t => t.visible))

const activeTab: Ref<TabKey> = ref('activity')
const preselectModSteamId: Ref<string | undefined> = ref(undefined)
const lookupPrefill: Ref<string | undefined> = ref(undefined)

const syncTabFromRoute = () => {
  const tab = (route.query.tab as TabKey) || 'activity'
  if (visibleTabs.value.some(t => t.key === tab)) {
    activeTab.value = tab
  } else if (visibleTabs.value.length > 0) {
    activeTab.value = visibleTabs.value[0].key
  }
}

watch(() => route.query.tab, syncTabFromRoute)
watch(visibleTabs, syncTabFromRoute, { immediate: true })

const setTab = (key: TabKey) => {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key } })
}

const onInspectMod = (steamId: string) => {
  preselectModSteamId.value = steamId
  setTab('moderators')
}

const onInspectTarget = (action: RecentModAction) => {
  // /mod_logs_recent doesn't return the moderation document ref, so the
  // Lookup tab is the only path that can resolve the audit history (it
  // calls /profile or /times first to pick up the ref, then /mod_logs).
  lookupPrefill.value = action.target_id
  setTab('lookup')
}

const accessGranted = computed(() => moderationStore.canAccessModerationPanel.value)

onMounted(() => {
  syncTabFromRoute()
})
</script>

<template>
  <main class="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
    <!-- Loading skeleton while auth resolves -->
    <div v-if="authLoading" class="text-center py-16 text-gray-500">
      Checking permissions…
    </div>

    <!-- Not allowed -->
    <div v-else-if="!user" class="bg-main-800 border border-main-500 rounded-lg p-12 text-center">
      <h2 class="text-lg font-medium text-gray-200">Sign in required</h2>
      <p class="text-sm text-gray-500 mt-2">The moderation panel is for staff only.</p>
    </div>
    <div v-else-if="!accessGranted" class="bg-main-800 border border-main-500 rounded-lg p-12 text-center">
      <h2 class="text-lg font-medium text-gray-200">Not authorized</h2>
      <p class="text-sm text-gray-500 mt-2">Your account doesn't have moderation permissions.</p>
    </div>

    <!-- Authorized -->
    <div v-else class="space-y-5">
      <!-- Header -->
      <div class="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-semibold text-gray-100 roboto">Moderation</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ visibleTabs.find(t => t.key === activeTab)?.description }}
          </p>
        </div>
        <div class="text-xs text-gray-500 text-right">
          Signed in as <span class="text-gray-300">{{ user.username }}</span><br />
          <span class="font-mono">perms 0x{{ user.permissions.toString(16) }}</span>
        </div>
      </div>

      <!-- Tab nav -->
      <div class="border-b border-main-500 -mx-1">
        <div class="flex gap-1 overflow-x-auto px-1">
          <button
            v-for="t in visibleTabs"
            :key="t.key"
            @click="setTab(t.key)"
            :class="[
              'px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 transition-colors cursor-pointer whitespace-nowrap',
              activeTab === t.key
                ? 'text-gray-100 border-blue-500 bg-main-800'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-main-800/50',
            ]"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <!-- Active tab -->
      <div>
        <ActivityTab
          v-if="activeTab === 'activity'"
          @inspect-mod="onInspectMod"
          @inspect-target="onInspectTarget"
        />
        <LookupTab v-else-if="activeTab === 'lookup'" :prefill-query="lookupPrefill" />
        <ModeratorsTab
          v-else-if="activeTab === 'moderators'"
          :preselect-steam-id="preselectModSteamId"
        />
        <ServerOwnerTab v-else-if="activeTab === 'server-owner'" />
      </div>
    </div>

    <BulkSelectionTray />
  </main>
</template>
