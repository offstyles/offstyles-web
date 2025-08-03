<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRouter } from 'vue-router';
  import ModerationDropdown from './Moderation/ModerationDropdown.vue';
  const router = useRouter();

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName : string,
    playerSteamId : string,
    playerTimes: Time[] | null,
    isLoading: boolean
  }>()
 
  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updatePlayer', props.playerSteamId);
  }

  const handleModerationComplete = () => {
    // Refresh player data after moderation action
    emit('updatePlayer', props.playerSteamId);
  }
</script>

<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <div class="flex justify-between items-center mb-3">
      <h1 class="text-2xl">{{ playerName }}</h1>
      <ModerationDropdown 
        :targetId="playerSteamId"
        targetType="player"
        :targetName="playerName"
        @moderationComplete="handleModerationComplete"
      />
    </div>
    <div class="flex py-2">
      <CustomDropdown :options="[Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" @dropdown-Changed="dropdownChanged"></CustomDropdown>
    </div>
    <TimesList v-if="props.playerTimes" :times="props.playerTimes" :cols="[
    {
      label: 'Map',
      data: 'map',
      width:'25%',
      alignmentClasses: 'text-left',
      link: timeLinks.mapLink
    }, 
    {
      label: 'Server',
      data: 'server',
      width: '30%',
      alignmentClasses: 'text-left'
    },
    {
      label: 'Date',
      data: 'date',
      width:'15%',
      numFormat: dateTimeFormats.date,
      alignmentClasses: 'text-right justify-end monospace',
    },
    {
      label: 'Time',
      data: 'time',
      width: '30%',
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.time
    }]"></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected player & style</h1>
  </div>
</template>

<style scoped>
  .monospace {
    font-family: 'Courier New', Courier, monospace;
  }
</style>