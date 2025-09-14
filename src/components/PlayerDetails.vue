<script setup lang="ts">
  import TimesList from './TimeLists/TimesList.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import type { Time } from '@/types/Time';
  import type { User } from '@/types/User';
  import CustomDropdown from './CustomDropdown.vue';
  import styleFormat from '@/utils/styleFormat';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRouter } from 'vue-router';
  import { ref, onMounted, watch, computed } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import ModerationModal from './Moderation/ModerationModal.vue';
  import { useModerationStore, type ModerationTarget } from '@/stores/moderation';
  import TimesListPagination from './TimeLists/TimesListPagination.vue';
  const router = useRouter();

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName: string,
    playerSteamId: string,
    playerTimes: Time[] | null,
    isLoading: boolean
  }>()

  // Validate required props
  if (!props.playerSteamId) {
    console.warn('PlayerDetails: playerSteamId is required but not provided');
  }

  const userProfile: Ref<User | null> = ref(null);
  const isLoadingProfile: Ref<boolean> = ref(false);
  const showModerationModal: Ref<boolean> = ref(false);

  const moderationStore = useModerationStore();

  const moderationTarget = computed((): ModerationTarget | null => {
    // If we have a full user profile, use that data
    if (userProfile.value) {
      return {
        id: userProfile.value.steam_id,
        type: 'player',
        name: userProfile.value.username,
        is_banned: userProfile.value.is_banned,
        ban_ref: userProfile.value.ban_ref
      };
    }
    
    // Fallback: Create a basic moderation target even if profile doesn't exist in DB
    // This allows moderation of players who haven't been indexed yet
    if (props.playerSteamId && props.playerName) {
      return {
        id: props.playerSteamId,
        type: 'player',
        name: props.playerName,
        is_banned: false, // Default to not banned since we don't have profile data
        ban_ref: undefined
      };
    }
    
    return null;
  });

  const playerStatus = computed(() => {
    if (isLoadingProfile.value) {
      return { message: 'Loading...', class: 'text-gray-400' };
    }
    
    if (userProfile.value?.is_banned) {
      return { message: '⚠️ Banned', class: 'text-red-400' };
    }
    
    if (userProfile.value === null && !isLoadingProfile.value) {
      return { message: '⚠️ Profile not found in database', class: 'text-yellow-400' };
    }
    
    return null;
  });
 
  const fetchUserProfile = async () => {
    isLoadingProfile.value = true;
    try {
      userProfile.value = await OffstylesApi.getUserProfile(props.playerSteamId);
    } catch (error) {
      console.warn('Player profile not found or error occurred:', error);
      // Set to null to indicate profile doesn't exist or couldn't be loaded
      // This will trigger the fallback moderation target
      userProfile.value = null;
    } finally {
      isLoadingProfile.value = false;
    }
  };

  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updatePlayer', props.playerSteamId);
  }
  const paginationChanged = async (page: number)=>{
    await router.replace({query:urlParams.update('page', page)});
    emit('updatePlayer', props.playerSteamId);
  }

  const handleModerationComplete = () => {
    // Refresh player data and profile after moderation action
    emit('updatePlayer', props.playerSteamId);
    fetchUserProfile();
    showModerationModal.value = false;
  }

  const openModerationModal = () => {
    showModerationModal.value = true;
  }

  const closeModerationModal = () => {
    showModerationModal.value = false;
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
          <div v-if="playerStatus" :class="`text-sm ${playerStatus.class}`">{{ playerStatus.message }}</div>
        </div>
      </div>
      <button 
        v-if="moderationStore.canModerate.value && moderationTarget"
        @click="openModerationModal"
        class="flex items-center gap-2 px-4 py-2 bg-main-700 hover:bg-main-600 border border-main-500 text-gray-200 rounded transition-colors cursor-pointer"
      >
        <span>Moderate</span>
      </button>
    </div>
    <div class="flex py-2">
      <CustomDropdown :options="[Style.all, Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" :default="Style.all" @dropdown-Changed="dropdownChanged"></CustomDropdown>
    </div>
    <TimesList v-if="props.playerTimes" :times="props.playerTimes" :cols="[
    {
      label: 'Map',
      data: 'map',
      width:'25%',
      col:1,
      alignmentClasses: 'text-left',
      link: timeLinks.mapLink
    }, 
    {
      label: 'Server',
      data: 'server',
      width: '30%',
      col:2,
      classes: 'text-sm text-gray-400',
      alignmentClasses: 'text-left text-gray-300'
    },
    {
      label: 'Date',
      data: 'date',
      width:'15%',
      col:3,
      alignmentClasses: 'text-right justify-end',
    },
    {
      label: 'Time',
      data: 'time',
      width: '30%',
      col:4,
      alignmentClasses: 'text-right justify-end monospace',
      numFormat: dateTimeFormats.time
    }]"
    @refresh-data="() => emit('updatePlayer', props.playerSteamId)"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected player & style</h1>
    <TimesListPagination :limitPerPage="50" :times="props.playerTimes" :isLoading = "props.isLoading" @pagination-changed="paginationChanged"></TimesListPagination>

    <!-- Moderation Modal -->
    <ModerationModal
      v-if="moderationTarget"
      :target="moderationTarget"
      :show="showModerationModal"
      @moderationComplete="handleModerationComplete"
      @close="closeModerationModal"
    />
  </div>
</template>

<style scoped>
  .monospace {
    font-family: 'Courier New', Courier, monospace;
  }
</style>