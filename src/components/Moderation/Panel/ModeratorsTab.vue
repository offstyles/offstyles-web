<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import type { RecentModAction } from '@/types/moderation'
import ActionBadge from './ActionBadge.vue'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import type { ConfirmRow } from './ConfirmActionDialog.vue'
import RelativeDate from '@/components/RelativeDate.vue'

interface ModSummary {
  steam_id: string
  name: string
  avatar_url?: string
  recent: RecentModAction[]
  last_action_ts: number
  counts: { ban: number; invalidate: number; unban: number; revalidate: number; note: number; reverse: number }
}

const props = defineProps<{
  preselectSteamId?: string
}>()

const moderationStore = useModerationStore()

const allRecent: Ref<RecentModAction[]> = ref([])
const isLoading: Ref<boolean> = ref(false)
const selected: Ref<string | null> = ref(null)
const advancedMode: Ref<boolean> = ref(false)

// Reverse form
const rawSteamId: Ref<string> = ref('')
const timeframeHours: Ref<number> = ref(24)
const reason: Ref<string> = ref('')
const isReversing: Ref<boolean> = ref(false)
const reverseError: Ref<string> = ref('')
const reverseResult: Ref<string> = ref('')
const showConfirm: Ref<boolean> = ref(false)

const load = async () => {
  isLoading.value = true
  try {
    const both = await moderationStore.getRecentModerationLogs(undefined)
    allRecent.value = both.sort((a, b) => b.timestamp - a.timestamp)
  } catch (e) {
    console.error('Failed to load mod activity:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  load()
  if (props.preselectSteamId) selected.value = props.preselectSteamId
})

watch(() => props.preselectSteamId, (sid) => {
  if (sid) selected.value = sid
})

const moderators = computed<ModSummary[]>(() => {
  const map = new Map<string, ModSummary>()
  for (const a of allRecent.value) {
    let m = map.get(a.moderator_steam_id)
    if (!m) {
      m = {
        steam_id: a.moderator_steam_id,
        name: a.moderator_name,
        avatar_url: a.moderator_avatar_url,
        recent: [],
        last_action_ts: 0,
        counts: { ban: 0, invalidate: 0, unban: 0, revalidate: 0, note: 0, reverse: 0 },
      }
      map.set(a.moderator_steam_id, m)
    }
    m.recent.push(a)
    if (a.timestamp > m.last_action_ts) m.last_action_ts = a.timestamp
    const k = a.action.toLowerCase() as keyof ModSummary['counts']
    if (k in m.counts) m.counts[k]++
  }
  return Array.from(map.values()).sort((a, b) => b.last_action_ts - a.last_action_ts)
})

const selectedMod = computed(() => {
  if (!selected.value) return null
  return moderators.value.find(m => m.steam_id === selected.value) ?? null
})

const effectiveSteamId = computed(() => {
  return advancedMode.value ? rawSteamId.value.trim() : (selected.value ?? '')
})

const canSubmit = computed(() => {
  return !!effectiveSteamId.value
      && timeframeHours.value > 0
      && reason.value.trim().length > 0
      && !isReversing.value
})

const startReverse = () => {
  reverseError.value = ''
  reverseResult.value = ''
  if (!canSubmit.value) return
  showConfirm.value = true
}

const performReverse = async () => {
  isReversing.value = true
  reverseError.value = ''
  try {
    const result = await moderationStore.reverseModerationActions(
      effectiveSteamId.value,
      timeframeHours.value,
      reason.value.trim(),
    )
    reverseResult.value = result || 'Reversed.'
    showConfirm.value = false
    reason.value = ''
    await load()
  } catch (e) {
    reverseError.value = e instanceof Error ? e.message : 'Failed'
  } finally {
    isReversing.value = false
  }
}

const confirmRows = computed<ConfirmRow[]>(() => [
  { label: 'Moderator', value: selectedMod.value?.name ?? '(by Steam ID only)' },
  { label: 'Steam ID', value: effectiveSteamId.value },
  { label: 'Timeframe', value: `${timeframeHours.value} hour${timeframeHours.value === 1 ? '' : 's'}` },
])
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h3 class="text-sm font-medium text-gray-200">Reverse moderator actions</h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Pick a moderator from the directory to see their recent activity, then reverse a slice of it.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <label class="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
          <input v-model="advancedMode" type="checkbox" class="rounded" />
          Raw Steam ID
        </label>
        <button
          @click="load"
          :disabled="isLoading"
          class="px-3 py-1.5 text-sm bg-main-700 hover:bg-main-600 disabled:opacity-50 border border-main-500 rounded text-gray-200 cursor-pointer"
        >
          {{ isLoading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div class="grid lg:grid-cols-[280px_1fr] gap-4">
      <!-- Directory -->
      <div class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
        <div class="px-3 py-2 border-b border-main-500 text-xs text-gray-400 uppercase tracking-wide">
          Active moderators
        </div>
        <div v-if="moderators.length === 0" class="p-4 text-sm text-gray-500 text-center">
          No moderator activity.
        </div>
        <div v-else class="max-h-[460px] overflow-y-auto">
          <button
            v-for="m in moderators"
            :key="m.steam_id"
            @click="selected = m.steam_id; advancedMode = false"
            :class="[
              'w-full text-left px-3 py-2.5 flex items-center gap-2.5 border-b border-main-500/40 last:border-b-0 cursor-pointer transition-colors',
              selected === m.steam_id ? 'bg-main-700' : 'hover:bg-main-700/50',
            ]"
          >
            <img v-if="m.avatar_url" :src="m.avatar_url" class="w-8 h-8 rounded shrink-0" />
            <div v-else class="w-8 h-8 rounded bg-main-600 shrink-0"></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-200 truncate">{{ m.name }}</div>
              <div class="text-xs text-gray-500">
                {{ m.recent.length }} action{{ m.recent.length === 1 ? '' : 's' }} ·
                <RelativeDate :date="m.last_action_ts" />
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Detail / reverse form -->
      <div class="space-y-3">
        <div v-if="advancedMode" class="bg-main-800 border border-main-500 rounded-lg p-4 space-y-3">
          <div class="text-sm font-medium text-gray-200">Raw Steam ID mode</div>
          <input
            v-model="rawSteamId"
            type="text"
            placeholder="76561198…"
            class="w-full px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-main-300"
          />
          <p class="text-xs text-gray-500">Reverses every action by this Steam ID in the timeframe below.</p>
        </div>

        <div v-else-if="!selectedMod" class="bg-main-800 border border-main-500 rounded-lg p-12 text-center text-gray-500 text-sm">
          Pick a moderator from the directory.
        </div>

        <div v-else class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
          <div class="p-4 border-b border-main-500 flex items-center gap-3">
            <img v-if="selectedMod.avatar_url" :src="selectedMod.avatar_url" class="w-12 h-12 rounded" />
            <div class="flex-1 min-w-0">
              <div class="text-base font-medium text-gray-100">{{ selectedMod.name }}</div>
              <div class="text-xs text-gray-500 font-mono">{{ selectedMod.steam_id }}</div>
            </div>
            <div class="text-right text-xs text-gray-500">
              <div class="text-gray-300 font-medium">{{ selectedMod.recent.length }}</div>
              <div>recent</div>
            </div>
          </div>

          <div class="px-4 py-3 border-b border-main-500 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            <div v-for="(v, k) in selectedMod.counts" :key="k">
              <div class="text-base font-medium text-gray-200">{{ v }}</div>
              <div class="text-[10px] text-gray-500 uppercase tracking-wide">{{ k }}</div>
            </div>
          </div>

          <div class="max-h-[260px] overflow-y-auto">
            <div
              v-for="(a, i) in selectedMod.recent"
              :key="i"
              class="px-4 py-2 border-b border-main-500/40 last:border-b-0 flex items-center gap-2 text-sm"
            >
              <ActionBadge :action="a.action" size="sm" />
              <span class="text-gray-300 truncate">{{ a.target_name }}</span>
              <span class="text-[10px] uppercase tracking-wide text-gray-500 ml-1">{{ a.target_type }}</span>
              <span class="ml-auto text-xs text-gray-500"><RelativeDate :date="a.timestamp" /></span>
            </div>
          </div>
        </div>

        <!-- Reverse form -->
        <div v-if="advancedMode || selectedMod" class="bg-main-800 border border-main-500 rounded-lg p-4 space-y-3">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-[10px] uppercase tracking-wide rounded bg-purple-900/30 text-purple-300 border border-purple-800/40 font-semibold">
              Admin
            </span>
            <span class="text-sm font-medium text-gray-200">Reverse window</span>
          </div>

          <div class="grid sm:grid-cols-[140px_1fr] gap-3">
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wide">Timeframe</label>
              <div class="flex items-center gap-1 mt-1">
                <input
                  v-model.number="timeframeHours"
                  type="number"
                  min="1"
                  class="w-20 px-2 py-1.5 bg-main-700 border border-main-500 rounded text-gray-200 text-sm focus:outline-none focus:border-main-300"
                />
                <span class="text-xs text-gray-400">hours</span>
              </div>
              <div class="flex gap-1 mt-1.5">
                <button
                  v-for="preset in [1, 6, 24, 72]"
                  :key="preset"
                  @click="timeframeHours = preset"
                  :class="[
                    'text-[10px] px-1.5 py-0.5 rounded border cursor-pointer',
                    timeframeHours === preset
                      ? 'bg-main-600 border-main-300 text-white'
                      : 'bg-main-700 border-main-500 text-gray-400 hover:border-main-400',
                  ]"
                >
                  {{ preset }}h
                </button>
              </div>
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wide">Reason</label>
              <textarea
                v-model="reason"
                rows="2"
                placeholder="Why is this reversal warranted?"
                class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-main-300"
              />
            </div>
          </div>

          <div v-if="reverseError" class="text-red-400 text-sm">{{ reverseError }}</div>
          <div v-if="reverseResult" class="text-green-400 text-sm bg-green-900/20 border border-green-800/40 rounded p-2">{{ reverseResult }}</div>

          <div class="flex justify-end">
            <button
              @click="startReverse"
              :disabled="!canSubmit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white text-sm rounded-lg cursor-pointer"
            >
              Reverse {{ timeframeHours }}h of actions
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmActionDialog
      :show="showConfirm"
      title="Reverse moderation actions?"
      intent="warning"
      :rows="confirmRows"
      :reason="reason"
      confirm-label="Yes, reverse"
      :is-processing="isReversing"
      @confirm="performReverse"
      @cancel="showConfirm = false"
    />
  </div>
</template>
