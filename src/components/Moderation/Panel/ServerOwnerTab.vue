<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useModerationStore } from '@/stores/moderation'
import { useBulkSelection } from '@/composables/useBulkSelection'
import { useAuth } from '@/stores/auth'
import OffstylesApi from '@/api/offstylesApi'
import type { ServerActivityResponse } from '@/api/offstylesApi'
import type { Time } from '@/types/Time'
import type { TimesFilter } from '@/types/TimesFilter'
import type { TimeListColumn } from '@/types/TimeListColumn'
import dateTimeFormats from '@/utils/dateTimeFormats'
import TimesList from '@/components/TimeLists/TimesList.vue'
import ConfirmActionDialog from './ConfirmActionDialog.vue'
import type { ConfirmRow } from './ConfirmActionDialog.vue'

const moderationStore = useModerationStore()
const bulk = useBulkSelection()
const { user } = useAuth()

// --- Owned servers + browse state --------------------------------------

const servers: Ref<ServerActivityResponse[]> = ref([])
const serversLoading: Ref<boolean> = ref(false)
const serversError: Ref<string> = ref('')
const selectedServerId: Ref<string> = ref('')
const includeInvalidated: Ref<boolean> = ref(false)

const PAGE_SIZE = 20

const times: Ref<Time[]> = ref([])
const totalTimes: Ref<number> = ref(0)
const currentPage: Ref<number> = ref(1)
const timesLoading: Ref<boolean> = ref(false)
const timesError: Ref<string> = ref('')

// Server is "owned" by the signed-in user when their steam_id matches the
// owner. Admins also see all so they can act on any server they manage.
const ownedServers = computed(() => {
  if (!user.value) return []
  return servers.value.filter(s => s.user?.steam_id === user.value!.steam_id)
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalTimes.value / PAGE_SIZE)))

const browseCols = computed((): TimeListColumn[] => [
  {
    label: 'Map',
    data: 'map',
    col: 1,
    row: 1,
    rowSpan: 2,
    colMobile: 1,
    rowMobile: 1,
    width: '32%',
    widthMobile: '40%',
    alignmentClasses: 'text-left justify-start',
  },
  {
    label: 'Player',
    data: 'name',
    col: 2,
    row: 1,
    rowSpan: 2,
    colMobile: 1,
    colSpanMobile: 3,
    rowMobile: 2,
    width: '28%',
    classes: 'text-sm text-gray-300',
    alignmentClasses: 'text-left justify-start',
  },
  {
    label: 'Time',
    data: 'time',
    col: 3,
    row: 1,
    colMobile: 2,
    colSpanMobile: 2,
    rowMobile: 1,
    width: '20%',
    widthMobile: '25%',
    classes: 'monospace',
    alignmentClasses: 'text-right justify-end',
    numFormat: dateTimeFormats.time,
  },
  {
    label: 'Date',
    data: 'date',
    col: 3,
    row: 2,
    colMobile: 3,
    rowMobile: 3,
    classes: 'text-xs text-gray-400',
    alignmentClasses: 'text-right justify-end',
  },
])

const loadServers = async () => {
  serversLoading.value = true
  serversError.value = ''
  try {
    servers.value = await OffstylesApi.getServers()
    if (!selectedServerId.value && ownedServers.value.length > 0) {
      selectedServerId.value = ownedServers.value[0].key_id
    }
  } catch (e) {
    serversError.value = e instanceof Error ? e.message : 'Failed to load servers'
  } finally {
    serversLoading.value = false
  }
}

const loadTimes = async () => {
  if (!selectedServerId.value) {
    times.value = []
    totalTimes.value = 0
    return
  }
  timesLoading.value = true
  timesError.value = ''
  try {
    const filter: TimesFilter = {
      scope: { kind: 'server', server: selectedServerId.value },
      page: currentPage.value,
      limit: PAGE_SIZE,
      sort: 'Newest',
      best: false,
      invalidated: includeInvalidated.value ? undefined : false,
    }
    const page = await OffstylesApi.getTimes(filter)
    times.value = page.data
    totalTimes.value = page.total
  } catch (e) {
    timesError.value = e instanceof Error ? e.message : 'Failed to load times'
    times.value = []
    totalTimes.value = 0
  } finally {
    timesLoading.value = false
  }
}

watch(selectedServerId, () => {
  currentPage.value = 1
  loadTimes()
})
watch(includeInvalidated, () => {
  currentPage.value = 1
  loadTimes()
})

const goToPage = (p: number) => {
  if (p < 1 || p > totalPages.value || timesLoading.value) return
  currentPage.value = p
  loadTimes()
}

const selectAllOnPage = () => {
  bulk.addMany(
    times.value
      .filter(t => !!t._id)
      .map(t => ({ id: t._id!, label: `${t.name} · ${t.map} · ${t.time.toFixed(3)}s` })),
  )
}

onMounted(loadServers)
watch(ownedServers, () => {
  if (selectedServerId.value && !ownedServers.value.some(s => s.key_id === selectedServerId.value)) {
    selectedServerId.value = ownedServers.value[0]?.key_id ?? ''
  } else if (!selectedServerId.value && ownedServers.value.length > 0) {
    selectedServerId.value = ownedServers.value[0].key_id
  }
})

// --- Manual paste flow (advanced) --------------------------------------

const pasteOpen: Ref<boolean> = ref(false)
const idsRaw: Ref<string> = ref('')
const reason: Ref<string> = ref('')
const isProcessing: Ref<boolean> = ref(false)
const error: Ref<string> = ref('')
const success: Ref<string> = ref('')
const showConfirm: Ref<boolean> = ref(false)

const tokens = computed(() => {
  return idsRaw.value
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
})

const parsedIds = computed(() => {
  return tokens.value.filter(s => /^[a-f0-9]{24}$/i.test(s))
})

const invalidTokens = computed(() => {
  return tokens.value.filter(s => !/^[a-f0-9]{24}$/i.test(s))
})

const canSubmitPaste = computed(() => {
  return moderationStore.canServerOwnerInvalidate.value
      && parsedIds.value.length > 0
      && reason.value.trim().length > 0
      && !isProcessing.value
})

const startPaste = () => {
  error.value = ''
  success.value = ''
  if (parsedIds.value.length === 0) {
    error.value = 'Provide at least one valid 24-char ObjectId.'
    return
  }
  if (!reason.value.trim()) {
    error.value = 'Reason is required.'
    return
  }
  showConfirm.value = true
}

const performPaste = async () => {
  isProcessing.value = true
  error.value = ''
  try {
    await moderationStore.performServerOwnerInvalidate(parsedIds.value, reason.value)
    success.value = `Invalidated ${parsedIds.value.length} record${parsedIds.value.length === 1 ? '' : 's'}.`
    showConfirm.value = false
    idsRaw.value = ''
    reason.value = ''
    loadTimes()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed'
  } finally {
    isProcessing.value = false
  }
}

const confirmRows = computed<ConfirmRow[]>(() => [
  { label: 'Records', value: `${parsedIds.value.length}` },
  { label: 'Endpoint', value: '/so_moderate (server-owner)' },
])
</script>

<template>
  <div class="space-y-4">
    <div class="bg-purple-900/10 border border-purple-800/40 text-purple-200 rounded-lg p-3 text-sm">
      <div class="font-medium">Server-owner self-invalidation</div>
      <p class="text-purple-200/80 text-xs mt-1">
        Browse runs from your servers and invalidate them via the floating selection tray, or paste record IDs directly below.
        The backend rejects records that weren't set on a server tied to your owner key.
      </p>
    </div>

    <div v-if="!moderationStore.canServerOwnerInvalidate.value" class="bg-red-900/20 border border-red-800/40 text-red-300 rounded-lg p-3 text-sm">
      You don't have the server-owner invalidate permission. This tab is read-only.
    </div>

    <!-- Browse section -->
    <div class="bg-main-800 border border-main-500 rounded-lg p-4 space-y-3">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="text-sm font-medium text-gray-200">Browse runs on your servers</div>
          <div class="text-xs text-gray-500">Right-click a row or use "Select page" to add records to the selection.</div>
        </div>
        <button
          @click="loadServers"
          :disabled="serversLoading"
          class="px-3 py-1.5 text-sm bg-main-700 hover:bg-main-600 disabled:opacity-50 border border-main-500 rounded text-gray-200 cursor-pointer"
        >
          {{ serversLoading ? 'Loading…' : 'Reload servers' }}
        </button>
      </div>

      <div v-if="serversError" class="text-red-400 text-sm">{{ serversError }}</div>

      <div v-if="!serversLoading && ownedServers.length === 0" class="text-sm text-gray-500 italic py-2">
        No servers registered to your Steam ID. Contact an admin if this looks wrong.
      </div>

      <div v-else-if="ownedServers.length > 0" class="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <label class="text-xs text-gray-400 uppercase tracking-wide">Server</label>
          <select
            v-model="selectedServerId"
            class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm focus:outline-none focus:border-main-300"
          >
            <option v-for="s in ownedServers" :key="s.key_id" :value="s.key_id">
              {{ s.name }}<span v-if="!s.active"> (inactive)</span>
            </option>
          </select>
        </div>
        <label class="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pb-2">
          <input v-model="includeInvalidated" type="checkbox" class="rounded" />
          Include invalidated
        </label>
      </div>

      <div v-if="selectedServerId" class="space-y-2">
        <div v-if="timesError" class="text-red-400 text-sm">{{ timesError }}</div>

        <div v-if="timesLoading && times.length === 0" class="text-center py-8 text-gray-500 text-sm">
          Loading runs…
        </div>
        <div v-else-if="!timesLoading && times.length === 0" class="text-center py-8 text-gray-500 text-sm">
          No runs found for this server.
        </div>
        <template v-else>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>{{ totalTimes }} record{{ totalTimes === 1 ? '' : 's' }} on this server</span>
            <button
              @click="selectAllOnPage"
              class="px-2.5 py-1 bg-main-700 hover:bg-main-600 border border-main-500 rounded text-gray-200 cursor-pointer"
            >
              Add page to selection
            </button>
          </div>
          <TimesList :times="times" :cols="browseCols" @refresh-data="loadTimes" />
          <div v-if="totalPages > 1" class="flex items-center justify-between pt-1 text-sm">
            <div class="text-gray-400">
              Page <span class="text-gray-200">{{ currentPage }}</span> of <span class="text-gray-200">{{ totalPages }}</span>
            </div>
            <div class="flex gap-1">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage <= 1 || timesLoading"
                class="px-2.5 py-1 bg-main-700 hover:bg-main-600 disabled:opacity-50 border border-main-500 rounded text-gray-200 cursor-pointer"
              >‹ Prev</button>
              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage >= totalPages || timesLoading"
                class="px-2.5 py-1 bg-main-700 hover:bg-main-600 disabled:opacity-50 border border-main-500 rounded text-gray-200 cursor-pointer"
              >Next ›</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Paste section (advanced) -->
    <div class="bg-main-800 border border-main-500 rounded-lg overflow-hidden">
      <button
        @click="pasteOpen = !pasteOpen"
        class="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-200 hover:bg-main-700/50 cursor-pointer"
      >
        <span>
          <span class="font-medium">Paste record IDs</span>
          <span class="text-gray-500 ml-2 text-xs">advanced — for IDs supplied out-of-band</span>
        </span>
        <span class="text-xs text-gray-400">{{ pasteOpen ? '▾' : '▸' }}</span>
      </button>
      <div v-if="pasteOpen" class="border-t border-main-500 p-4 space-y-3">
        <div>
          <label class="text-xs text-gray-400 uppercase tracking-wide">Record IDs</label>
          <textarea
            v-model="idsRaw"
            rows="4"
            placeholder="Paste ObjectIds — comma, space, or newline separated"
            class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-main-300"
          />
          <div class="flex flex-wrap justify-between gap-2 text-xs mt-1">
            <span class="text-gray-500">
              {{ parsedIds.length }} valid<span v-if="invalidTokens.length"> · <span class="text-red-400">{{ invalidTokens.length }} invalid</span></span>
            </span>
          </div>
          <div v-if="invalidTokens.length" class="flex flex-wrap gap-1 text-[11px] mt-1">
            <span
              v-for="t in invalidTokens.slice(0, 8)"
              :key="t"
              class="px-1.5 py-0.5 rounded bg-red-900/20 border border-red-800/40 text-red-300 font-mono"
            >{{ t.length > 18 ? t.slice(0, 16) + '…' : t }}</span>
            <span v-if="invalidTokens.length > 8" class="text-red-400">+{{ invalidTokens.length - 8 }} more</span>
          </div>
        </div>

        <div>
          <label class="text-xs text-gray-400 uppercase tracking-wide">Reason</label>
          <textarea
            v-model="reason"
            rows="2"
            placeholder="Required. Will appear in the audit log."
            class="w-full mt-1 px-3 py-2 bg-main-700 border border-main-500 rounded text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-main-300"
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>
        <div v-if="success" class="text-green-400 text-sm bg-green-900/20 border border-green-800/40 rounded p-2">{{ success }}</div>

        <div class="flex justify-end">
          <button
            @click="startPaste"
            :disabled="!canSubmitPaste"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white text-sm rounded-lg cursor-pointer"
          >
            Invalidate {{ parsedIds.length }} record{{ parsedIds.length === 1 ? '' : 's' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmActionDialog
      :show="showConfirm"
      title="Self-invalidate records?"
      intent="warning"
      :rows="confirmRows"
      :reason="reason"
      confirm-label="Yes, invalidate"
      :is-processing="isProcessing"
      @confirm="performPaste"
      @cancel="showConfirm = false"
    />
  </div>
</template>
