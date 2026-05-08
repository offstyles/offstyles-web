import { ref, computed } from 'vue'
import type { Ref } from 'vue'

// Heavy bulk: cross-page record selection that survives page navigation
// (sessionStorage) and named "saved selections" that persist across sessions
// (localStorage). One module-level store; every consumer of useBulkSelection
// sees the same set, which is the point — selections accrue as the moderator
// scrolls through different lists.

export interface BulkRecordEntry {
  id: string
  // Human-readable label for the tray; should be self-contained without
  // needing the original list context (e.g. "player on map · 12.345s").
  label: string
}

export interface SavedSelection {
  name: string
  saved_at: number
  entries: BulkRecordEntry[]
}

const SESSION_KEY = 'mod-bulk-selection-v1'
const SAVED_KEY = 'mod-bulk-saved-v1'

const loadSession = (): Map<string, BulkRecordEntry> => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return new Map()
    const arr: BulkRecordEntry[] = JSON.parse(raw)
    return new Map(arr.map(e => [e.id, e]))
  } catch {
    return new Map()
  }
}

const loadSaved = (): SavedSelection[] => {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const entries: Ref<Map<string, BulkRecordEntry>> = ref(loadSession())
const saved: Ref<SavedSelection[]> = ref(loadSaved())

const persistSession = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(entries.value.values())))
  } catch {
    // sessionStorage full or disabled — selection is still live in memory
  }
}

const persistSaved = () => {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved.value))
  } catch {
    // localStorage full or disabled
  }
}

export const useBulkSelection = () => {
  const count = computed(() => entries.value.size)
  const ids = computed(() => Array.from(entries.value.keys()))
  const list = computed(() => Array.from(entries.value.values()))
  const isEmpty = computed(() => entries.value.size === 0)

  const has = (id: string) => entries.value.has(id)

  const add = (entry: BulkRecordEntry) => {
    entries.value.set(entry.id, entry)
    persistSession()
  }

  const remove = (id: string) => {
    if (entries.value.delete(id)) persistSession()
  }

  const toggle = (entry: BulkRecordEntry) => {
    if (entries.value.has(entry.id)) {
      entries.value.delete(entry.id)
    } else {
      entries.value.set(entry.id, entry)
    }
    persistSession()
  }

  const addMany = (newEntries: BulkRecordEntry[]) => {
    for (const e of newEntries) entries.value.set(e.id, e)
    persistSession()
  }

  const removeMany = (idsToRemove: string[]) => {
    let changed = false
    for (const id of idsToRemove) if (entries.value.delete(id)) changed = true
    if (changed) persistSession()
  }

  const clear = () => {
    if (entries.value.size === 0) return
    entries.value.clear()
    persistSession()
  }

  const save = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || entries.value.size === 0) return
    const existing = saved.value.findIndex(s => s.name === trimmed)
    const snapshot: SavedSelection = {
      name: trimmed,
      saved_at: Date.now(),
      entries: Array.from(entries.value.values()),
    }
    if (existing >= 0) saved.value[existing] = snapshot
    else saved.value.unshift(snapshot)
    persistSaved()
  }

  const restore = (name: string, mode: 'replace' | 'merge' = 'replace') => {
    const slot = saved.value.find(s => s.name === name)
    if (!slot) return
    if (mode === 'replace') entries.value.clear()
    for (const e of slot.entries) entries.value.set(e.id, e)
    persistSession()
  }

  const deleteSaved = (name: string) => {
    const before = saved.value.length
    saved.value = saved.value.filter(s => s.name !== name)
    if (saved.value.length !== before) persistSaved()
  }

  return {
    count,
    ids,
    list,
    isEmpty,
    saved: computed(() => saved.value),

    has,
    add,
    remove,
    toggle,
    addMany,
    removeMany,
    clear,

    save,
    restore,
    deleteSaved,
  }
}
