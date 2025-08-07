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
  import { ref, onMounted, watch, computed } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import ModerationModal from './Moderation/ModerationModal.vue';
  import { useModerationStore, type ModerationTarget } from '@/stores/moderation';
  import TimesListPagination from './TimesListPagination.vue';
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
  const showModerationModal: Ref<boolean> = ref(false);

  const moderationStore = useModerationStore();

  const moderationTarget = computed((): ModerationTarget | null => {
    if (!userProfile.value) return null;
    return {
      id: userProfile.value.steam_id,
      type: 'player',
      name: userProfile.value.username,
      is_banned: userProfile.value.is_banned,
      ban_ref: userProfile.value.ban_ref
    };
  });
 
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
          <div v-if="userProfile?.is_banned" class="text-red-400 text-sm">⚠️ Banned</div>
        </div>
      </div>
      <button 
        v-if="moderationStore.canModerate.value && moderationTarget"
        @click="openModerationModal"
        class="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
      >
        <span>Moderate</span>
      </button>
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