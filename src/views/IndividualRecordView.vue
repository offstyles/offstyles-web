<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import type { WRAwareRecord } from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import styleFormat from '@/utils/styleFormat';
  import { useRouter } from 'vue-router';
  import { useAuth } from '@/stores/auth';
  
  const props = defineProps<{
    id: string
  }>();

  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isLoading: Ref<boolean> = ref(false);
  const record: Ref<WRAwareRecord | null> = ref(null);
  const error: Ref<string | null> = ref(null);

  const playerUrl = computed(() => {
    return record.value ? `/players/${record.value.steamid}` : null;
  });

  const mapLeaderboardUrl = computed(() => {
    return record.value ? `/maps/${record.value.map}?style=${record.value.style}` : null;
  });

  onMounted(async () => {
    await fetchRecord();
  });

  async function fetchRecord() {
    isLoading.value = true;
    error.value = null;
    record.value = null;
    
    try {
      const apiRecord = await OffstylesApi.getSingleTime(props.id);
      record.value = apiRecord;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load record';
      console.error('Failed to fetch record:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function downloadReplay() {
    if (!record.value?.replay_ref) return;
    
    try {
      const response = await OffstylesApi.downloadReplay(record.value.replay_ref);
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `replay_${record.value.map}.replay`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download replay:', error);
      alert('Failed to download replay. Please try again.');
    }
  }

  function goBack() {
    router.back();
  }
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-screen p-4">
    <div class="text-white w-full max-w-[800px] text-center flex flex-col justify-center rounded-lg">
      
      <!-- Header -->
      <div class="mb-6">
        <button 
          @click="goBack" 
          class="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 class="text-3xl mb-2">Individual Record</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center">
        <loadWheel class="text-gray-200 mb-4"></loadWheel>
        <p>Loading record...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-400 bg-red-900/20 p-4 rounded-lg">
        <h2 class="text-xl mb-2">Error</h2>
        <p>{{ error }}</p>
        <button 
          @click="fetchRecord" 
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Retry
        </button>
      </div>

      <!-- Record Details -->
      <div v-else-if="record" class="space-y-6">
        
        <!-- Main Record Info -->
        <div class="bg-main-700 p-6 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            
            <!-- Player Info -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-300">Player</h3>
              <div class="text-xl">
                <a 
                  v-if="playerUrl" 
                  :href="playerUrl" 
                  class="text-blue-400 hover:text-blue-300"
                >
                  {{ record.name }}
                </a>
                <span v-else>{{ record.name }}</span>
              </div>
              <div class="text-sm text-gray-400">{{ record.steamid }}</div>
            </div>

            <!-- Map Info -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-300">Map</h3>
              <div class="text-xl">
                <a 
                  v-if="mapLeaderboardUrl" 
                  :href="mapLeaderboardUrl" 
                  class="text-blue-400 hover:text-blue-300"
                >
                  {{ record.map }}
                </a>
                <span v-else>{{ record.map }}</span>
              </div>
              <div class="text-sm text-gray-400">
                Style: {{ styleFormat.name(record.style) }}
              </div>
            </div>

          </div>
        </div>

        <!-- Performance Stats -->
        <div class="bg-main-700 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-300 mb-4">Performance</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            
            <div class="bg-main-600 p-3 rounded">
              <div class="text-sm text-gray-400">Time</div>
              <div class="text-xl font-mono text-green-400">
                {{ dateTimeFormats.time(record.time) }}
              </div>
            </div>

            <div class="bg-main-600 p-3 rounded">
              <div class="text-sm text-gray-400">Sync</div>
              <div class="text-xl font-mono">{{ record.sync }}%</div>
            </div>

            <div class="bg-main-600 p-3 rounded">
              <div class="text-sm text-gray-400">Strafes</div>
              <div class="text-xl font-mono">{{ record.strafes }}</div>
            </div>

            <div class="bg-main-600 p-3 rounded">
              <div class="text-sm text-gray-400">Jumps</div>
              <div class="text-xl font-mono">{{ record.jumps }}</div>
            </div>

          </div>
        </div>

        <!-- Additional Info -->
        <div class="bg-main-700 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-300 mb-4">Additional Information</h3>
          <div class="space-y-0 text-left">
            
            <div class="flex justify-between py-3 border-b border-gray-600/30">
              <span class="text-gray-400">Date:</span>
              <span class="font-mono">{{ dateTimeFormats.date(record.date) }}</span>
            </div>

            <div v-if="record.rank" class="flex justify-between py-3 border-b border-gray-600/30">
              <span class="text-gray-400">Rank:</span>
              <span class="font-mono text-yellow-400">#{{ record.rank }}</span>
            </div>

            <div v-if="record.wr_time" class="flex justify-between py-3 border-b border-gray-600/30">
              <span class="text-gray-400">World Record:</span>
              <span class="font-mono text-green-400">{{ dateTimeFormats.time(record.wr_time) }}</span>
            </div>

            <div v-if="record.server?.server" class="flex justify-between py-3 border-b border-gray-600/30">
              <span class="text-gray-400">Server:</span>
              <span class="font-mono">{{ record.server.server }}</span>
            </div>

            <div class="flex justify-between py-3">
              <span class="text-gray-400">Record ID:</span>
              <span class="font-mono text-xs text-gray-500">{{ record._id }}</span>
            </div>

          </div>
        </div>

        <!-- Actions -->
        <div class="bg-main-700 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-300 mb-4">Actions</h3>
          <div class="flex flex-wrap gap-3 justify-center">
            
            <a 
              v-if="playerUrl" 
              :href="playerUrl" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Player Profile
            </a>

            <a 
              v-if="mapLeaderboardUrl" 
              :href="mapLeaderboardUrl" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              View Map Leaderboard
            </a>

            <div v-if="record.replay_ref">
              <button 
                v-if="isLoggedIn" 
                @click="downloadReplay"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Download Replay
              </button>
              <button 
                v-else 
                disabled 
                class="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed"
                title="Login with Steam required to download replays"
              >
                Download Replay (Login Required)
              </button>
            </div>
            
            <span v-else class="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg">
              No Replay Available
            </span>

          </div>
        </div>

      </div>

    </div>
  </main>
</template>