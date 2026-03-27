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

  const props = defineProps({
    playerSteamId: {
      type: String,
      required: false,
    },
  });
  
  const route = useRoute();
  const isLoading: Ref<boolean> = ref(false);
  const playerTimes: Ref<Time[] | null> = ref(null);
  const playerSteamId: Ref<string> = ref(props.playerSteamId ?? '');
  const playerName: Ref<string> = ref('');

  //update selected_map & url
  async function updatePlayer(playerId:string){
    await getPlayerTimes(playerId);
  }

  // Clear player data and reset to initial state
  function clearPlayerData() {
    playerSteamId.value = '';
    playerName.value = '';
    playerTimes.value = null;
    isLoading.value = false;
  }

  onMounted(async ()=>{
    //set initial map from url
    if(typeof props.playerSteamId !== 'undefined'){
      updatePlayer(props.playerSteamId);
    }
  });

  // Watch for changes in playerSteamId prop to handle navigation between specific player and general page
  watch(() => props.playerSteamId, (newPlayerSteamId) => {
    if (!newPlayerSteamId) {
      // If navigating to general players page, clear the data
      clearPlayerData();
    } else {
      // If navigating to a specific player, load their data
      updatePlayer(newPlayerSteamId);
    }
  });

  // Also watch for route changes to handle navigation
  watch(() => route.path, (newPath) => {
    // If navigating to the base players page, clear everything
    if (newPath === '/players' && !props.playerSteamId) {
      clearPlayerData();
    }
  });

  watch(() => route.query, () => {
    if (props.playerSteamId) {
      getPlayerTimes(props.playerSteamId)
    }
  })

  async function getPlayerTimes(playerId: string){
    // Don't proceed if playerId is undefined or empty
    if (!playerId) return;

    playerSteamId.value = playerId;
    isLoading.value = true;
    playerTimes.value = null;
    const paramsObj = urlParams.getAsObject();

    const style = paramsObj.style ? parseInt(paramsObj.style) : Style.all;
    const page = paramsObj.page ? parseInt(paramsObj.page) : 1;
    const best = paramsObj.best !== undefined ? paramsObj.best === 'true' : true;

    const apiPlayerTimes = await OffstylesApi.getTimes({
      steamid: playerId,
      style,
      sort: 'Newest',
      best,
      limit: 50,
      page,
    });
    if(apiPlayerTimes.length){
      playerTimes.value = apiPlayerTimes;
      playerName.value = apiPlayerTimes[0].name;
    }
    isLoading.value = false;
  }
</script>

<template>
  <main>
    <div class="flex flex-col items-center justify-center">
      <!--<SearchBox @updateMap="updatePlayer"></SearchBox>-->
      <SearchBoxPlayer @updatePlayer="updatePlayer" :placeholder="'Enter a Player'"></SearchBoxPlayer>
      <PlayerDetails 
        v-if="playerSteamId && playerName && playerSteamId !== ''"
        :playerTimes="playerTimes" 
        :playerSteamId="playerSteamId" 
        :playerName="playerName" 
        :isLoading="isLoading" 
        @updatePlayer="updatePlayer"
      />
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <h1 v-if="playerSteamId === ''" class="text-lg text-gray-100 mt-5">Select a player above to view their times</h1>
    </div>
  </main>
</template>