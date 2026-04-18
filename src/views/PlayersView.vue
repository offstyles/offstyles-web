<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router';
  import type { Ref } from 'vue'
  import urlParams from '@/utils/urlParams';
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import PlayerDetails from '@/components/PlayerDetails.vue';
  import type { Time } from '@/types/Time';
  import SearchBoxPlayer from '@/components/SearchBoxPlayer.vue';
  import { Style } from '@/types/Style';
  import timesFilterFromQuery from '@/utils/timesFilterFromQuery';
  import { useModerationStore } from '@/stores/moderation';

  const props = defineProps({
    playerSteamId: {
      type: String,
      required: false,
    },
  });

  const route = useRoute();
  const moderationStore = useModerationStore();
  const isLoading: Ref<boolean> = ref(false);
  const playerTimes: Ref<Time[] | null> = ref(null);
  const playerTotal: Ref<number> = ref(0);
  const playerSteamId: Ref<string> = ref(props.playerSteamId ?? '');
  const playerName: Ref<string> = ref('');
  const loadError: Ref<string | null> = ref(null);

  async function updatePlayer(playerId: string){
    await getPlayerTimes(playerId);
  }

  function clearPlayerData() {
    playerSteamId.value = '';
    playerName.value = '';
    playerTimes.value = null;
    playerTotal.value = 0;
    isLoading.value = false;
    loadError.value = null;
  }

  onMounted(async () => {
    if (typeof props.playerSteamId !== 'undefined') {
      updatePlayer(props.playerSteamId);
    }
  });

  watch(() => props.playerSteamId, (newPlayerSteamId) => {
    if (!newPlayerSteamId) {
      clearPlayerData();
    } else {
      updatePlayer(newPlayerSteamId);
    }
  });

  watch(() => route.path, (newPath) => {
    if (newPath === '/players' && !props.playerSteamId) {
      clearPlayerData();
    }
  });

  watch(() => route.query, () => {
    if (props.playerSteamId) {
      getPlayerTimes(props.playerSteamId);
    }
  });

  async function getPlayerTimes(playerId: string){
    if (!playerId) return;

    playerSteamId.value = playerId;
    isLoading.value = true;
    playerTimes.value = null;
    loadError.value = null;

    const filter = timesFilterFromQuery.fromQuery(
      urlParams.getAsObject(),
      { style: Style.all, sort: 'Newest', best: true, limit: 50 },
      moderationStore.canInvalidateTimes.value,
    );
    filter.steamid = playerId;

    try {
      const result = await OffstylesApi.getTimes(filter);
      playerTotal.value = result.total;
      if (result.data.length) {
        playerTimes.value = result.data;
        playerName.value = result.data[0].name;
      } else if (!playerName.value) {
        playerName.value = playerId;
      }
    } catch (err) {
      loadError.value = err instanceof Error ? err.message : 'Failed to load times';
      console.error('Failed to fetch player times:', err);
    } finally {
      isLoading.value = false;
    }
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <SearchBoxPlayer @updatePlayer="updatePlayer" :placeholder="'Enter a Player'"></SearchBoxPlayer>
      <PlayerDetails
        v-if="playerSteamId && playerName && playerSteamId !== ''"
        :playerTimes="playerTimes"
        :playerSteamId="playerSteamId"
        :playerName="playerName"
        :isLoading="isLoading"
        :total="playerTotal"
        @updatePlayer="updatePlayer"
      />
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <div v-if="loadError && !isLoading" class="text-red-400 bg-red-900/20 p-4 rounded-lg mt-5 max-w-[600px]">
        <p>Failed to load times: {{ loadError }}</p>
        <button @click="updatePlayer(playerSteamId)" class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Retry</button>
      </div>
      <h1 v-if="playerSteamId === ''" class="text-lg text-gray-100 mt-5">Select a player above to view their times</h1>
    </div>
  </main>
</template>
