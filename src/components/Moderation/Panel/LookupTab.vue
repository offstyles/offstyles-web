<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import OffstylesApi from '@/api/offstylesApi'
import type { User } from '@/types/User'
import type { Time } from '@/types/Time'
import ActionBadge from './ActionBadge.vue'
import RelativeDate from '@/components/RelativeDate.vue'
import PermissionBadges from '@/components/PermissionBadges.vue'

interface ResolvedPlayer {
  kind: 'player'
  user: User
  logs: { actions: Array<{ action: string; timestamp: number; notes?: string; mod: { username: string; steam_id: string; avatar_url?: string } }> } | null
}
interface ResolvedRecord {
  kind: 'record'
  time: Time
  logs: { actions: Array<{ action: string; timestamp: number; notes?: string; mod: { username: string; steam_id: string; avatar_url?: string } }> } | null
}
interface ResolvedRef {
  kind: 'ref'
  ref_id: string
  logs: { actions: Array<{ action: string; timestamp: number; notes?: string; mod: { username: string; steam_id: string; avatar_url?: string } }> }
}
type Resolved = ResolvedPlayer | ResolvedRecord | ResolvedRef

const props = defineProps<{
  prefillQuery?: string
}>()

const moderationStore = useModerationStore()

const query: Ref<string> = ref(props.prefillQuery ?? '')
const isLoading: Ref<boolean> = ref(false)
const error: Ref<string> = ref('')
const result: Ref<Resolved | null> = ref(null)

// Steam IDs are 17-digit numbers starting with 7656119; record/ref IDs are
// 24-character hex (Mongo ObjectId). Anything else is treated as ambiguous
// and we'll try the mod-log lookup first, falling back to time lookup.
const detectKind = (raw: string): 'steam' | 'oid' | 'unknown' => {
  const s = raw.trim()
  if (/^7656119\d{10}$/.test(s)) return 'steam'
  if (/^[a-f0-9]{24}$/i.test(s)) return 'oid'
  return 'unknown'
}

const detected = computed(() => detectKind(query.value))

const lookup = async () => {
  const q = query.value.trim()
  if (!q) return
  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const kind = detectKind(q)
    if (kind === 'steam') {
      const user = await OffstylesApi.getUserProfile(q)
      let logs: ResolvedPlayer['logs'] = null
      if (user.ban_ref) {
        try {
          const r = await moderationStore.getModerationLogs(user.ban_ref)
          logs = { actions: (r.actions || []).sort((a, b) => b.timestamp - a.timestamp) }
        } catch {
          logs = null
        }
      }
      result.value = { kind: 'player', user, logs }
    } else if (kind === 'oid') {
      // Try as a record ID first; if that fails, treat as a mod-log ref.
      try {
        const time = await OffstylesApi.getSingleTime(q)
        let logs: ResolvedRecord['logs'] = null
        if (time.invalid_ref) {
          try {
            const r = await moderationStore.getModerationLogs(time.invalid_ref)
            logs = { actions: (r.actions || []).sort((a, b) => b.timestamp - a.timestamp) }
          } catch {
            logs = null
          }
        }
        result.value = { kind: 'record', time, logs }
      } catch {
        const r = await moderationStore.getModerationLogs(q)
        result.value = {
          kind: 'ref',
          ref_id: q,
          logs: { actions: (r.actions || []).sort((a, b) => b.timestamp - a.timestamp) },
        }
      }
    } else {
      throw new Error('Enter a 17-digit Steam ID or a 24-char ObjectId.')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Lookup failed'
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  query.value = ''
  result.value = null
  error.value = ''
}

onMounted(() => {
  if (props.prefillQuery && detectKind(props.prefillQuery) !== 'unknown') {
    lookup()
  }
})

watch(() => props.prefillQuery, (q) => {
  if (q && detectKind(q) !== 'unknown') {
    query.value = q
    lookup()
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="bg-main-800 border border-main-500 rounded-lg p-4 space-y-3">
      <div>
        <label class="text-xs text-gray-400 uppercase tracking-wide">Lookup</label>
        <p class="text-sm text-gray-500 mt-1">
          Paste a Steam ID, run ID, or moderation log reference. Type is detected automatically.
        </p>
      </div>
      <div class="flex gap-2">
        <input
          v-model="query"
          type="text"
          placeholder="76561198… or 24-char hex"
          class="flex-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-main-300 font-mono text-sm"
          @keyup.enter="lookup"
        />
        <button
          @click="lookup"
          :disabled="!query.trim() || isLoading"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded transition-colors cursor-pointer"
        >
          {{ isLoading ? 'Searching…' : 'Search' }}
        </button>
        <button
          v-if="query"
          @click="reset"
          class="px-3 py-2 text-gray-400 hover:text-gray-200 cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div v-if="query" class="text-xs text-gray-500">
        Detected:
        <span v-if="detected === 'steam'" class="text-blue-300">Steam ID (player profile)</span>
        <span v-else-if="detected === 'oid'" class="text-emerald-300">ObjectId (run or mod-log ref)</span>
        <span v-else class="text-gray-500">unrecognized — search will reject</span>
      </div>
    </div>

    <div v-if="error" class="bg-red-900/20 border border-red-800/40 text-red-300 rounded-lg p-3 text-sm">
      {{ error }}
    </div>

    <!-- Player result -->
    <div v-if="result?.kind === 'player'" class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
      <div class="p-4 border-b border-main-500 flex items-start gap-3">
        <img v-if="result.user.avatar_url" :src="result.user.avatar_url" class="w-12 h-12 rounded" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-lg font-medium text-gray-100">{{ result.user.username }}</span>
            <span v-if="result.user.is_banned" class="px-1.5 py-0.5 text-[10px] uppercase tracking-wide rounded bg-red-900/30 text-red-300 border border-red-800/40">Banned</span>
          </div>
          <div class="text-xs text-gray-500 font-mono">{{ result.user.steam_id }}</div>
          <div class="text-xs text-gray-500 mt-1">
            Joined {{ new Date(result.user.created_at * 1000).toLocaleDateString() }}
          </div>
          <div class="mt-2">
            <PermissionBadges :permissions="result.user.permissions" />
          </div>
        </div>
        <a :href="`/players/${result.user.steam_id}`" class="px-3 py-1.5 text-sm bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-200 cursor-pointer shrink-0">
          Open profile →
        </a>
      </div>
      <div class="p-4">
        <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Moderation history</div>
        <div v-if="!result.user.ban_ref" class="text-sm text-gray-500 italic">
          No moderation actions on record.
        </div>
        <div v-else-if="!result.logs" class="text-sm text-yellow-400">
          Has a ban_ref but logs failed to load.
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="(a, i) in result.logs.actions"
            :key="i"
            class="flex items-start gap-2 px-2 py-1.5 bg-main-900/40 border border-main-500/40 rounded text-sm"
          >
            <ActionBadge :action="a.action" size="sm" />
            <span class="text-gray-300">{{ a.mod.username }}</span>
            <span class="text-gray-500 ml-auto text-xs"><RelativeDate :date="a.timestamp" /></span>
            <div v-if="a.notes" class="basis-full text-xs text-gray-400 italic">"{{ a.notes }}"</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Record result -->
    <div v-else-if="result?.kind === 'record'" class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
      <div class="p-4 border-b border-main-500 flex items-start gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-lg font-medium text-gray-100">{{ result.time.map }}</span>
            <span v-if="result.time.is_invalid" class="px-1.5 py-0.5 text-[10px] uppercase tracking-wide rounded bg-red-900/30 text-red-300 border border-red-800/40">Invalid</span>
          </div>
          <div class="text-sm text-gray-300">
            {{ result.time.name }} · {{ result.time.time.toFixed(3) }}s
          </div>
          <div class="text-xs text-gray-500 font-mono mt-1">{{ result.time._id }}</div>
        </div>
        <a :href="`/run/${result.time._id}`" class="px-3 py-1.5 text-sm bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-200 cursor-pointer shrink-0">
          Open record →
        </a>
      </div>
      <div class="p-4">
        <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">Moderation history</div>
        <div v-if="!result.time.invalid_ref" class="text-sm text-gray-500 italic">
          No moderation actions on record.
        </div>
        <div v-else-if="!result.logs" class="text-sm text-yellow-400">
          Has an invalid_ref but logs failed to load.
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="(a, i) in result.logs.actions"
            :key="i"
            class="flex items-start gap-2 px-2 py-1.5 bg-main-900/40 border border-main-500/40 rounded text-sm"
          >
            <ActionBadge :action="a.action" size="sm" />
            <span class="text-gray-300">{{ a.mod.username }}</span>
            <span class="text-gray-500 ml-auto text-xs"><RelativeDate :date="a.timestamp" /></span>
            <div v-if="a.notes" class="basis-full text-xs text-gray-400 italic">"{{ a.notes }}"</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bare mod-log ref result -->
    <div v-else-if="result?.kind === 'ref'" class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
      <div class="p-4 border-b border-main-500">
        <div class="text-xs text-gray-400 uppercase tracking-wide">Moderation log reference</div>
        <div class="text-sm font-mono text-gray-200 mt-1">{{ result.ref_id }}</div>
        <div class="text-xs text-gray-500 mt-1">Not a known run; treating as a raw mod-log ID.</div>
      </div>
      <div class="p-4">
        <div v-if="result.logs.actions.length === 0" class="text-sm text-gray-500 italic">
          No actions on this reference.
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="(a, i) in result.logs.actions"
            :key="i"
            class="flex items-start gap-2 px-2 py-1.5 bg-main-900/40 border border-main-500/40 rounded text-sm"
          >
            <ActionBadge :action="a.action" size="sm" />
            <span class="text-gray-300">{{ a.mod.username }}</span>
            <span class="text-gray-500 ml-auto text-xs"><RelativeDate :date="a.timestamp" /></span>
            <div v-if="a.notes" class="basis-full text-xs text-gray-400 italic">"{{ a.notes }}"</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
