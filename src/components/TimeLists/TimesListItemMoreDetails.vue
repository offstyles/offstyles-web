<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import timeLinks from '@/utils/timeLinks';
  import { computed, ref } from 'vue';
  import type { Ref } from 'vue';
  import RelativeDate from '../RelativeDate.vue';
  import OffstylesApi from '@/api/offstylesApi';
  import { useAuth } from '@/stores/auth';
  import ReplayViewerOverlay from '@/replay-viewer/ReplayViewerOverlay.vue';
  const props = defineProps<{
      time: Time,
      cols: TimeListColumn[]
    }>();

  const { isLoggedIn } = useAuth();
  const showReplayViewer: Ref<boolean> = ref(false);

  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
  })

  const hasReplay = computed(()=>isLoggedIn.value && !!props.time.replay_ref);

  async function downloadReplay() {
    if (!props.time.replay_ref) return;
    try {
      const response = await OffstylesApi.downloadReplay(props.time.replay_ref);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.time.map}.replay`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download replay:', error);
      alert('Failed to download replay. Please try again.');
    }
  }
</script>


<template>
  <div class="grid os-subgrid-cols-auto p-2 px-2 bg-main-800" :style="{ gridTemplateColumns: colWidthsStyle }">
    <div v-for="(col, index) in props.cols" :key="index" :class="col.alignmentClasses" class="flex flex-col">
      <span class="text-gray-400 text-xs">{{ col.label }}:</span>
      <span v-if="col.data === 'date'">
        <RelativeDate :date="props.time[col.data]" />
      </span>
      <span v-else>{{ col.data === 'sync' ? props.time[col.data].toFixed(2) + '%' : props.time[col.data] }}</span>
    </div>
    <!-- Action buttons -->
    <div class="flex flex-wrap gap-2 justify-center col-span-full pt-1" @click.stop>
      <a
        v-if="props.time._id"
        :href="timeLinks.recordLink(props.time)"
        class="text-blue-400 hover:text-blue-300 text-xs px-3 py-1.5 bg-main-700 rounded hover:bg-main-600 transition-colors"
      >
        View Record
      </a>
      <button
        v-if="hasReplay"
        @click="showReplayViewer = true"
        class="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-600 text-gray-100 rounded transition-colors cursor-pointer"
      >
        View Replay
      </button>
      <button
        v-if="hasReplay"
        @click="downloadReplay"
        class="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-gray-100 rounded transition-colors cursor-pointer"
      >
        Download Replay
      </button>
    </div>
  </div>

  <div v-if="hasReplay" @click.stop>
    <ReplayViewerOverlay
      :show="showReplayViewer"
      :map-name="props.time.map"
      :replay-id="props.time.replay_ref!"
      @close="showReplayViewer = false"
    />
  </div>
</template>

<style scoped>
  .os-subgrid-cols-auto {
    display: grid;
  }
</style>
