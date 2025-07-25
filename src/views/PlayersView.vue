<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import type { Ref } from 'vue'
  import OffstylesApi from '@/api/offstylesApi';
  import loadWheel from '@/components/icons/loadWheel.vue';
  import PlayerDetails from '@/components/PlayerDetails.vue';
  import type { Time } from '@/types/Time';
  import SearchBoxPlayer from '@/components/SearchBoxPlayer.vue';

  const props = defineProps({
    playerSteamId: {
      type: String,
      required: false,
    },
  });
  
  const isLoading: Ref<boolean> = ref(false);
  const playerTimes: Ref<Time[] | null> = ref(null);
  const playerSteamId: Ref<string> = ref(props.playerSteamId ?? '');
  const playerName: Ref<string> = ref('');

  //update selected_map & url
  async function updatePlayer(playerId:string){
    await getPlayerTimes(playerId);
  }

  onMounted(async ()=>{
    //set initial map from url
    if(typeof props.playerSteamId !== 'undefined'){
      updatePlayer(props.playerSteamId);
    }
  });

  async function getPlayerTimes(playerId: string){
    playerSteamId.value = playerId;
    isLoading.value = true;
    playerTimes.value = null;
    const apiPlayerTimes = await OffstylesApi.getTimesByPlayer(playerId);
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
      <PlayerDetails v-if="playerSteamId !== ''" :playerTimes="playerTimes" :playerSteamId="playerSteamId" :playerName="playerName" :isLoading="isLoading" @updatePlayer="updatePlayer"></PlayerDetails>
      <loadWheel v-if="isLoading" class="text-gray-200 mt-5"></loadWheel>
      <h1 v-if="playerSteamId === ''" class="text-lg text-gray-100 mt-5">Select a map above to view leaderboards</h1>
    </div>
  </main>
</template>