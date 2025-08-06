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
  import ModerationDropdown from './Moderation/ModerationDropdown.vue';
  import ModeratorToolbar from './Moderation/ModeratorToolbar.vue';
  import BulkModerationModal from './Moderation/BulkModerationModal.vue';
  import ModerationLogsViewer from './Moderation/ModerationLogsViewer.vue';
  import TimesListPagination from './TimesListPagination.vue';
  import { useAuth } from '@/stores/auth';
  import { UserPermissions } from '@/types/moderation';
  const router = useRouter();
  const { user } = useAuth();

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName : string,
    playerSteamId : string,
    playerTimes: Time[] | null,
    isLoading: boolean
  }>()

  const userProfile: Ref<User | null> = ref(null);
  const isLoadingProfile: Ref<boolean> = ref(false);
  const selectedRecords: Ref<string[]> = ref([]);
  const showBulkModal: Ref<boolean> = ref(false);
  const showLogsModal: Ref<boolean> = ref(false);

  const userPermissions = computed(() => {
    if (!user.value) return new UserPermissions(0)
    return new UserPermissions(user.value.permissions)
  })

  const isModerator = computed(() => {
    return userPermissions.value.isModerator()
  })

  const recordNames = computed(() => {
    const names: Record<string, string> = {}
    if (props.playerTimes) {
      props.playerTimes.forEach(time => {
        if (time._id) {
          names[time._id.toString()] = `${time.map} - ${props.playerName} (${dateTimeFormats.time(time.time)})`
        }
      })
    }
    return names
  })
 
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
  }

  const handleSelectionChanged = (newSelection: string[]) => {
    selectedRecords.value = newSelection;
  }

  const clearSelection = () => {
    selectedRecords.value = [];
  }

  const handleBulkModerate = () => {
    showBulkModal.value = true;
  }

  const handleShowLogs = () => {
    showLogsModal.value = true;
  }

  const handleBulkModerationComplete = () => {
    showBulkModal.value = false;
    clearSelection();
    // Refresh player data
    emit('updatePlayer', props.playerSteamId);
  }

  const handleLogsActionReversed = () => {
    // Refresh player data
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
    <TimesList 
      v-if="props.playerTimes" 
      :times="props.playerTimes" 
      :enableSelection="isModerator"
      @selectionChanged="handleSelectionChanged"
      :cols="[
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
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected player & style</h1>
    <TimesListPagination :limitPerPage="50" :times="props.playerTimes" :isLoading = "props.isLoading" @pagination-changed="paginationChanged"></TimesListPagination>
    
    <!-- Moderator Toolbar -->
    <ModeratorToolbar
      v-if="isModerator"
      :selectedRecords="selectedRecords"
      :recordNames="recordNames"
      :targetId="playerSteamId"
      targetType="player"
      :targetName="playerName"
      @bulkModerate="handleBulkModerate"
      @showLogs="handleShowLogs"
      @toggleSelection="() => {}"
      @clearSelection="clearSelection"
    />
    
    <!-- Bulk Moderation Modal -->
    <BulkModerationModal
      :isOpen="showBulkModal"
      :selectedRecords="selectedRecords"
      :recordNames="recordNames"
      @close="showBulkModal = false"
      @complete="handleBulkModerationComplete"
    />
    
    <!-- Moderation Logs Modal -->
    <ModerationLogsViewer
      :isOpen="showLogsModal"
      @close="showLogsModal = false"
      @actionReversed="handleLogsActionReversed"
    />
  </div>
</template>

<style scoped>
  .monospace {
    font-family: 'Courier New', Courier, monospace;
  }
</style>