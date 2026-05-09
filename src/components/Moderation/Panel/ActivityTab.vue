<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import { ModerationTargetFilter, ModerationActionType, type RecentModAction } from '@/types/moderation'
import ActionBadge from './ActionBadge.vue'
import RelativeDate from '@/components/RelativeDate.vue'

type TargetFilter = ModerationTargetFilter | 'All'
type Density = 'compact' | 'comfortable'

const STORAGE_KEY = 'mod-activity-prefs-v1'
interface Prefs {
  density: Density
  targetFilter: TargetFilter
  modIds: string[]
  actionTypes: string[]
}
const loadPrefs = (): Prefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { density: 'comfortable', targetFilter: 'All', modIds: [], actionTypes: [] }
    return { density: 'comfortable', targetFilter: 'All', modIds: [], actionTypes: [], ...JSON.parse(raw) }
  } catch {
    return { density: 'comfortable', targetFilter: 'All', modIds: [], actionTypes: [] }
  }
}
const initialPrefs = loadPrefs()

const emit = defineEmits<{
  inspectMod: [steamId: string]
  inspectTarget: [action: RecentModAction]
}>()

const moderationStore = useModerationStore()

const targetFilter: Ref<TargetFilter> = ref(initialPrefs.targetFilter)
const selectedModIds: Ref<Set<string>> = ref(new Set(initialPrefs.modIds))
const selectedActionTypes: Ref<Set<string>> = ref(new Set(initialPrefs.actionTypes))
const density: Ref<Density> = ref(initialPrefs.density)
const showFilters: Ref<boolean> = ref(false)

const logs: Ref<RecentModAction[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
const lastLoaded: Ref<number | null> = ref(null)
const expandedKeys: Ref<Set<string>> = ref(new Set())

const persistPrefs = () => {
  try {
    const p: Prefs = {
      density: density.value,
      targetFilter: targetFilter.value,
      modIds: Array.from(selectedModIds.value),
      actionTypes: Array.from(selectedActionTypes.value),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch { /* storage full or disabled */ }
}

watch([density, targetFilter, selectedModIds, selectedActionTypes], persistPrefs, { deep: true })

const filterToParam = (f: TargetFilter): ModerationTargetFilter | undefined => {
  return f === 'All' ? undefined : f
}

const load = async () => {
  isLoading.value = true
  try {
    const data = await moderationStore.getRecentModerationLogs(filterToParam(targetFilter.value))
    logs.value = data.sort((a, b) => b.timestamp - a.timestamp)
    lastLoaded.value = Date.now()
  } catch (e) {
    console.error('Failed to load recent moderation logs:', e)
    logs.value = []
  } finally {
    isLoading.value = false
  }
}

watch(targetFilter, load)

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

const ALL_ACTION_TYPES = [
  ModerationActionType.Ban,
  ModerationActionType.Unban,
  ModerationActionType.Invalidate,
  ModerationActionType.Revalidate,
  ModerationActionType.Note,
] as const

const moderatorOptions = computed(() => {
  const seen = new Map<string, { steam_id: string; name: string; count: number }>()
  for (const l of logs.value) {
    const cur = seen.get(l.moderator_steam_id)
    if (cur) cur.count++
    else seen.set(l.moderator_steam_id, { steam_id: l.moderator_steam_id, name: l.moderator_name, count: 1 })
  }
  return Array.from(seen.values()).sort((a, b) => b.count - a.count)
})

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (selectedModIds.value.size > 0 && !selectedModIds.value.has(l.moderator_steam_id)) return false
    if (selectedActionTypes.value.size > 0 && !selectedActionTypes.value.has(l.action)) return false
    return true
  })
})

const counts = computed(() => {
  const c = { ban: 0, unban: 0, invalidate: 0, revalidate: 0, note: 0 }
  for (const l of logs.value) {
    const k = l.action.toLowerCase() as keyof typeof c
    if (k in c) c[k]++
  }
  return c
})

const activeModCount = computed(() => moderatorOptions.value.length)

const totalIsCapped = computed(() => logs.value.length >= 20)

const toggleMod = (id: string) => {
  if (selectedModIds.value.has(id)) selectedModIds.value.delete(id)
  else selectedModIds.value.add(id)
  selectedModIds.value = new Set(selectedModIds.value)
}

const toggleAction = (a: string) => {
  if (selectedActionTypes.value.has(a)) selectedActionTypes.value.delete(a)
  else selectedActionTypes.value.add(a)
  selectedActionTypes.value = new Set(selectedActionTypes.value)
}

const clearFilters = () => {
  selectedModIds.value = new Set()
  selectedActionTypes.value = new Set()
  targetFilter.value = 'All'
}

const filtersActive = computed(() => {
  return selectedModIds.value.size > 0
      || selectedActionTypes.value.size > 0
      || targetFilter.value !== 'All'
})

const keyOf = (a: RecentModAction, i: number) => `${i}:${a.timestamp}:${a.target_id}:${a.action}`

const toggleExpand = (k: string) => {
  if (expandedKeys.value.has(k)) expandedKeys.value.delete(k)
  else expandedKeys.value.add(k)
  expandedKeys.value = new Set(expandedKeys.value)
}

const isDestructive = (action: ModerationActionType | string) => {
  const a = action.toString().toLowerCase()
  return a === 'ban' || a === 'invalidate'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Stats: honest about the 20-action window -->
    <div class="bg-main-800 border border-main-500 rounded-lg p-3 sm:p-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="text-xs text-gray-400 uppercase tracking-wide">Recent moderation activity</div>
          <div class="text-sm text-gray-300 mt-0.5">
            <span class="text-gray-100 font-medium">{{ logs.length }}</span>
            action{{ logs.length === 1 ? '' : 's' }}<span v-if="totalIsCapped"> (most recent — site cap)</span>
            · <span class="text-gray-100 font-medium">{{ activeModCount }}</span>
            mod{{ activeModCount === 1 ? '' : 's' }} appeared
          </div>
        </div>
        <div class="grid grid-cols-5 gap-2 text-center">
          <div>
            <div class="text-base font-semibold text-red-300">{{ counts.ban }}</div>
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Ban</div>
          </div>
          <div>
            <div class="text-base font-semibold text-red-300">{{ counts.invalidate }}</div>
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Invl</div>
          </div>
          <div>
            <div class="text-base font-semibold text-green-300">{{ counts.unban }}</div>
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Unban</div>
          </div>
          <div>
            <div class="text-base font-semibold text-green-300">{{ counts.revalidate }}</div>
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Reval</div>
          </div>
          <div>
            <div class="text-base font-semibold text-blue-300">{{ counts.note }}</div>
            <div class="text-[10px] uppercase tracking-wide text-gray-500">Note</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter row -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex gap-1">
          <button
            v-for="f in (['All', ModerationTargetFilter.Player, ModerationTargetFilter.Record] as TargetFilter[])"
            :key="f"
            @click="targetFilter = f"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer border',
              targetFilter === f
                ? 'bg-main-600 text-white border-main-300'
                : 'bg-main-800 text-gray-300 border-main-500 hover:border-main-400',
            ]"
          >
            {{ f }}
          </button>
        </div>
        <button
          @click="showFilters = !showFilters"
          :class="[
            'px-3 py-1.5 text-sm rounded-md border cursor-pointer transition-colors',
            filtersActive
              ? 'bg-blue-600/20 text-blue-200 border-blue-500/60'
              : 'bg-main-800 text-gray-300 border-main-500 hover:border-main-400',
          ]"
        >
          Filters{{ (selectedModIds.size + selectedActionTypes.size) > 0 ? ` · ${selectedModIds.size + selectedActionTypes.size}` : '' }}
          <span class="ml-1 text-xs">{{ showFilters ? '▾' : '▸' }}</span>
        </button>
        <button
          v-if="filtersActive"
          @click="clearFilters"
          class="px-2 py-1 text-xs text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          Clear
        </button>
        <div class="flex gap-1 ml-2 border-l border-main-500 pl-2">
          <button
            v-for="d in (['comfortable', 'compact'] as Density[])"
            :key="d"
            @click="density = d"
            :title="`Density: ${d}`"
            :class="[
              'px-2 py-1.5 text-xs rounded border cursor-pointer transition-colors',
              density === d
                ? 'bg-main-600 text-white border-main-300'
                : 'bg-main-800 text-gray-400 border-main-500 hover:border-main-400',
            ]"
          >
            {{ d === 'comfortable' ? '▤' : '☰' }}
          </button>
        </div>
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

    <!-- Filter panel -->
    <div v-if="showFilters" class="bg-main-800 border border-main-500 rounded-lg p-3 space-y-3">
      <div>
        <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Action type</div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="a in ALL_ACTION_TYPES"
            :key="a"
            @click="toggleAction(a)"
            :class="[
              'px-2 py-1 text-xs rounded border cursor-pointer transition-colors',
              selectedActionTypes.has(a)
                ? 'bg-main-600 border-main-300 text-white'
                : 'bg-main-700 border-main-500 text-gray-300 hover:border-main-400',
            ]"
          >
            {{ a }}
          </button>
        </div>
      </div>
      <div>
        <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Moderator
          <span v-if="moderatorOptions.length === 0" class="normal-case text-gray-500 lowercase">— none in current data</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="m in moderatorOptions"
            :key="m.steam_id"
            @click="toggleMod(m.steam_id)"
            :class="[
              'px-2 py-1 text-xs rounded border cursor-pointer transition-colors flex items-center gap-1.5',
              selectedModIds.has(m.steam_id)
                ? 'bg-main-600 border-main-300 text-white'
                : 'bg-main-700 border-main-500 text-gray-300 hover:border-main-400',
            ]"
          >
            <span>{{ m.name }}</span>
            <span class="text-[10px] text-gray-400">{{ m.count }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Feed -->
    <div v-if="isLoading && logs.length === 0" class="text-center py-12 text-gray-500">
      Loading recent activity…
    </div>
    <div v-else-if="logs.length === 0" class="text-center py-12 text-gray-500">
      No moderation activity in this window.
    </div>
    <div v-else-if="filteredLogs.length === 0" class="text-center py-12 text-gray-500">
      No actions match the current filters.
      <button @click="clearFilters" class="ml-2 text-blue-400 hover:underline cursor-pointer">Clear filters</button>
    </div>
    <div v-else :class="density === 'compact' ? 'space-y-1' : 'space-y-2'">
      <div
        v-for="(entry, i) in filteredLogs"
        :key="keyOf(entry, i)"
        class="bg-main-800 border border-main-500 rounded-lg overflow-hidden hover:border-main-400 transition-colors"
      >
        <button
          @click="toggleExpand(keyOf(entry, i))"
          :class="[
            'w-full text-left flex items-center gap-3 cursor-pointer',
            density === 'compact' ? 'px-3 py-1.5' : 'p-3',
          ]"
        >
          <ActionBadge :action="entry.action" :size="density === 'compact' ? 'sm' : 'md'" />
          <span
            class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0"
            :class="entry.target_type === 'Player'
              ? 'text-blue-300 border-blue-800/40 bg-blue-900/20'
              : 'text-emerald-300 border-emerald-800/40 bg-emerald-900/20'"
          >
            {{ entry.target_type === 'Player' ? 'P' : 'R' }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-gray-200 truncate">
              <span class="font-medium">{{ entry.target_name }}</span>
              <span class="text-gray-500"> by </span>
              <span class="text-gray-300">{{ entry.moderator_name }}</span>
            </div>
            <div v-if="density === 'comfortable' && entry.notes" class="text-xs text-gray-500 truncate mt-0.5">
              "{{ entry.notes }}"
            </div>
          </div>
          <div class="text-xs text-gray-500 shrink-0 whitespace-nowrap">
            <RelativeDate :date="entry.timestamp" />
          </div>
        </button>

        <!-- Expanded detail -->
        <div v-if="expandedKeys.has(keyOf(entry, i))" class="border-t border-main-500/60 bg-main-900/50 p-4 space-y-3">
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

          <div class="text-xs text-gray-500" :title="new Date(entry.timestamp).toISOString()">
            <RelativeDate :date="entry.timestamp" />
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
