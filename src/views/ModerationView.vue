<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModerationStore } from '@/stores/moderation'
import { useAuth } from '@/stores/auth'
import ActivityTab from '@/components/Moderation/Panel/ActivityTab.vue'
import LookupTab from '@/components/Moderation/Panel/LookupTab.vue'
import ModeratorsTab from '@/components/Moderation/Panel/ModeratorsTab.vue'
import ServerOwnerTab from '@/components/Moderation/Panel/ServerOwnerTab.vue'
import { permissionRoleLabel } from '@/types/moderation'
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

const role = computed(() => user.value ? permissionRoleLabel(user.value.permissions) : null)

const tablistRef = ref<HTMLElement | null>(null)

const onTabKey = async (e: KeyboardEvent) => {
  const keys = visibleTabs.value.map(t => t.key)
  const i = keys.indexOf(activeTab.value)
  let nextIdx = i
  if (e.key === 'ArrowRight') nextIdx = (i + 1) % keys.length
  else if (e.key === 'ArrowLeft') nextIdx = (i - 1 + keys.length) % keys.length
  else if (e.key === 'Home') nextIdx = 0
  else if (e.key === 'End') nextIdx = keys.length - 1
  else return
  e.preventDefault()
  setTab(keys[nextIdx])
  await nextTick()
  const btn = tablistRef.value?.querySelector<HTMLButtonElement>(`[data-tab-key="${keys[nextIdx]}"]`)
  btn?.focus()
}

onMounted(() => {
  syncTabFromRoute()
})
</script>

<template>
  <main class="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
        <div class="text-xs text-gray-500 sm:text-right flex items-center gap-2 sm:flex-col sm:items-end">
          <div>Signed in as <span class="text-gray-300">{{ user.username }}</span></div>
          <span
            v-if="role"
            class="px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide font-semibold"
            :class="role === 'Admin' ? 'text-purple-300 bg-purple-900/30 border-purple-800/40'
                  : role === 'Server Owner' ? 'text-purple-300 bg-purple-900/30 border-purple-800/40'
                  : 'text-red-300 bg-red-900/30 border-red-800/40'"
            :title="`Permissions bitfield: 0x${user.permissions.toString(16)}`"
          >
            {{ role }}
          </span>
        </div>
      </div>

      <!-- Tab nav -->
      <div class="border-b border-main-500 -mx-1">
        <div
          ref="tablistRef"
          role="tablist"
          aria-label="Moderation sections"
          class="flex gap-1 overflow-x-auto px-1"
          @keydown="onTabKey"
        >
          <button
            v-for="t in visibleTabs"
            :key="t.key"
            :data-tab-key="t.key"
            role="tab"
            :aria-selected="activeTab === t.key"
            :aria-controls="`tabpanel-${t.key}`"
            :id="`tab-${t.key}`"
            :tabindex="activeTab === t.key ? 0 : -1"
            @click="setTab(t.key)"
            :class="[
              'px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60',
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
      <div
        role="tabpanel"
        :id="`tabpanel-${activeTab}`"
        :aria-labelledby="`tab-${activeTab}`"
        tabindex="0"
        class="focus:outline-none"
      >
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

  </main>
</template>
