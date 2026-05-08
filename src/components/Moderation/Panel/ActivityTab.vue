<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import { ModerationTargetFilter, ModerationActionType, type RecentModAction } from '@/types/moderation'
import ActionBadge from './ActionBadge.vue'
import RelativeDate from '@/components/RelativeDate.vue'

type Filter = ModerationTargetFilter | 'All'

const emit = defineEmits<{
  inspectMod: [steamId: string]
  inspectTarget: [action: RecentModAction]
}>()

const moderationStore = useModerationStore()

const filter: Ref<Filter> = ref('All')
const logs: Ref<RecentModAction[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
const lastLoaded: Ref<number | null> = ref(null)
const expandedKeys: Ref<Set<string>> = ref(new Set())

const filterToParam = (f: Filter): ModerationTargetFilter | undefined => {
  return f === 'All' ? undefined : f
}

const load = async () => {
  isLoading.value = true
  try {
    const data = await moderationStore.getRecentModerationLogs(filterToParam(filter.value))
    logs.value = data.sort((a, b) => b.timestamp - a.timestamp)
    lastLoaded.value = Date.now()
  } catch (e) {
    console.error('Failed to load recent moderation logs:', e)
    logs.value = []
  } finally {
    isLoading.value = false
  }
}

watch(filter, load)

const onVisibility = () => {
  if (document.visibilityState === 'visible') {
    const stale = !lastLoaded.value || Date.now() - lastLoaded.value > 30_000
    if (stale) load()
  }
}

onMounted(() => {
  load()
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('focus', onVisibility)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('focus', onVisibility)
})

const stats = computed(() => {
  const since24h = Date.now() - 24 * 3600_000
  const recent = logs.value.filter(l => l.timestamp >= since24h)
  const mods = new Set(logs.value.map(l => l.moderator_steam_id))
  const counts = { ban: 0, invalidate: 0, unban: 0, revalidate: 0, note: 0 }
  for (const l of logs.value) {
    const k = l.action.toLowerCase() as keyof typeof counts
    if (k in counts) counts[k]++
  }
  return {
    total: logs.value.length,
    in24h: recent.length,
    activeMods: mods.size,
    counts,
  }
})

const keyOf = (a: RecentModAction) => `${a.timestamp}:${a.target_id}:${a.action}`

const toggleExpand = (a: RecentModAction) => {
  const k = keyOf(a)
  if (expandedKeys.value.has(k)) expandedKeys.value.delete(k)
  else expandedKeys.value.add(k)
}

const isDestructive = (action: ModerationActionType | string) => {
  const a = action.toString().toLowerCase()
  return a === 'ban' || a === 'invalidate'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Stats header -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-main-800 border border-main-500 rounded-lg p-3">
        <div class="text-xs text-gray-400 uppercase tracking-wide">Recent actions</div>
        <div class="text-2xl font-semibold text-gray-100 mt-1">{{ stats.total }}</div>
        <div class="text-xs text-gray-500 mt-0.5">last 20 site-wide</div>
      </div>
      <div class="bg-main-800 border border-main-500 rounded-lg p-3">
        <div class="text-xs text-gray-400 uppercase tracking-wide">In last 24h</div>
        <div class="text-2xl font-semibold text-gray-100 mt-1">{{ stats.in24h }}</div>
        <div class="text-xs text-gray-500 mt-0.5">{{ stats.activeMods }} mod{{ stats.activeMods === 1 ? '' : 's' }} active</div>
      </div>
      <div class="bg-main-800 border border-main-500 rounded-lg p-3">
        <div class="text-xs text-gray-400 uppercase tracking-wide">Restrictive</div>
        <div class="text-2xl font-semibold text-red-300 mt-1">{{ stats.counts.ban + stats.counts.invalidate }}</div>
        <div class="text-xs text-gray-500 mt-0.5">{{ stats.counts.ban }} ban · {{ stats.counts.invalidate }} invalidate</div>
      </div>
      <div class="bg-main-800 border border-main-500 rounded-lg p-3">
        <div class="text-xs text-gray-400 uppercase tracking-wide">Permissive</div>
        <div class="text-2xl font-semibold text-green-300 mt-1">{{ stats.counts.unban + stats.counts.revalidate }}</div>
        <div class="text-xs text-gray-500 mt-0.5">{{ stats.counts.note }} note{{ stats.counts.note === 1 ? '' : 's' }}</div>
      </div>
    </div>

    <!-- Filter + refresh -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex gap-1">
        <button
          v-for="f in (['All', ModerationTargetFilter.Player, ModerationTargetFilter.Record] as Filter[])"
          :key="f"
          @click="filter = f"
          :class="[
            'px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer border',
            filter === f
              ? 'bg-main-600 text-white border-main-300'
              : 'bg-main-800 text-gray-300 border-main-500 hover:border-main-400',
          ]"
        >
          {{ f }}
        </button>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="lastLoaded" class="text-xs text-gray-500">
          Updated <RelativeDate :date="lastLoaded" />
        </span>
        <button
          @click="load"
          :disabled="isLoading"
          class="px-3 py-1.5 text-sm bg-main-700 hover:bg-main-600 disabled:opacity-50 border border-main-500 rounded text-gray-200 cursor-pointer"
        >
          {{ isLoading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Feed -->
    <div v-if="isLoading && logs.length === 0" class="text-center py-12 text-gray-500">
      Loading recent activity…
    </div>
    <div v-else-if="logs.length === 0" class="text-center py-12 text-gray-500">
      No moderation activity in this window.
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="entry in logs"
        :key="keyOf(entry)"
        class="bg-main-800 border border-main-500 rounded-lg overflow-hidden hover:border-main-400 transition-colors"
      >
        <button
          @click="toggleExpand(entry)"
          class="w-full text-left p-3 flex items-start gap-3 cursor-pointer"
        >
          <ActionBadge :action="entry.action" />
          <span
            class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0"
            :class="entry.target_type === 'Player'
              ? 'text-blue-300 border-blue-800/40 bg-blue-900/20'
              : 'text-emerald-300 border-emerald-800/40 bg-emerald-900/20'"
          >
            {{ entry.target_type }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-200 truncate">
              <span class="font-medium">{{ entry.target_name }}</span>
              <span class="text-gray-500"> by </span>
              <span class="text-gray-300">{{ entry.moderator_name }}</span>
            </div>
            <div v-if="entry.notes" class="text-xs text-gray-500 truncate mt-0.5">
              "{{ entry.notes }}"
            </div>
          </div>
          <div class="text-xs text-gray-500 shrink-0 whitespace-nowrap">
            <RelativeDate :date="entry.timestamp" />
          </div>
        </button>

        <!-- Expanded detail -->
        <div v-if="expandedKeys.has(keyOf(entry))" class="border-t border-main-500/60 bg-main-900/50 p-4 space-y-3">
          <div class="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Target</div>
              <div class="text-gray-200">{{ entry.target_name }}</div>
              <div class="text-xs text-gray-500 font-mono break-all">{{ entry.target_id }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Moderator</div>
              <div class="flex items-center gap-2">
                <img
                  v-if="entry.moderator_avatar_url"
                  :src="entry.moderator_avatar_url"
                  class="w-6 h-6 rounded-full"
                />
                <span class="text-gray-200">{{ entry.moderator_name }}</span>
              </div>
              <div class="text-xs text-gray-500 font-mono break-all">{{ entry.moderator_steam_id }}</div>
            </div>
          </div>

          <div v-if="entry.notes">
            <div class="text-xs text-gray-400 uppercase tracking-wide mb-1">Reason</div>
            <div class="text-sm text-gray-200 whitespace-pre-wrap bg-main-800 border border-main-500 rounded p-2">{{ entry.notes }}</div>
          </div>

          <div class="text-xs text-gray-500">
            {{ new Date(entry.timestamp).toLocaleString() }}
          </div>

          <div class="flex flex-wrap gap-2 pt-1">
            <button
              @click="emit('inspectTarget', entry)"
              class="px-2.5 py-1 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-200 cursor-pointer"
            >
              View target history
            </button>
            <button
              v-if="moderationStore.canUndoModerationActions.value"
              @click="emit('inspectMod', entry.moderator_steam_id)"
              class="px-2.5 py-1 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-purple-300 cursor-pointer"
            >
              Inspect moderator
            </button>
            <a
              v-if="entry.target_type === 'Player'"
              :href="`/players/${entry.target_id}`"
              class="px-2.5 py-1 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-blue-300 cursor-pointer"
            >
              Open player →
            </a>
            <a
              v-else-if="entry.target_type === 'Record'"
              :href="`/run/${entry.target_id}`"
              class="px-2.5 py-1 text-xs bg-main-700 hover:bg-main-600 border border-main-500 rounded text-emerald-300 cursor-pointer"
            >
              Open record →
            </a>
            <span
              v-if="isDestructive(entry.action)"
              class="px-2.5 py-1 text-xs text-gray-500 italic"
            >
              Mistake? An admin can reverse via the Moderators tab.
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
