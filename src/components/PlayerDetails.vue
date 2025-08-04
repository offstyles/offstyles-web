<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import type { User } from '@/types/User';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRouter } from 'vue-router';
  import { ref, onMounted, watch } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import ModerationDropdown from './Moderation/ModerationDropdown.vue';
  const router = useRouter();

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName : string,
    playerSteamId : string,
    playerTimes: Time[] | null,
    isLoading: boolean
  }>()

  const userProfile: Ref<User | null> = ref(null);
  const isLoadingProfile: Ref<boolean> = ref(false);
 
  const fetchUserProfile = async () => {
    isLoadingProfile.value = true;
    try {
      userProfile.value = await OffstylesApi.getUserProfile(props.playerSteamId);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      userProfile.value = null;
    } finally {
      isLoadingProfile.value = false;
    }
  };

  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updatePlayer', props.playerSteamId);
  }

  const handleModerationComplete = () => {
    // Refresh player data and profile after moderation action
    emit('updatePlayer', props.playerSteamId);
    fetchUserProfile();
  }

  onMounted(() => {
    if (props.playerSteamId) {
      fetchUserProfile();
    }
  });

  watch(() => props.playerSteamId, () => {
    if (props.playerSteamId) {
      fetchUserProfile();
    }
  });
</script>

<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-3">
        <img 
          v-if="userProfile?.avatar_url" 
          :src="userProfile.avatar_url" 
          :alt="playerName"
          class="w-12 h-12 rounded-full"
        />
        <div class="text-left">
          <h1 class="text-2xl">{{ playerName }}</h1>
          <div v-if="userProfile?.is_banned" class="text-red-400 text-sm">⚠️ Banned</div>
        </div>
      </div>
      <ModerationDropdown 
        :targetId="playerSteamId"
        targetType="player"
        :targetName="playerName"
        :is_banned="userProfile?.is_banned"
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