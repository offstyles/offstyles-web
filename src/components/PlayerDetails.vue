<script setup lang="ts">
  import TimesList from './TimesList.vue';
  import TimesFilterBar from './TimesFilterBar.vue';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import timeLinks from '@/utils/timeLinks';
  import styleFormat from '@/utils/styleFormat';
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { User } from '@/types/User';
  import type { SortOrder } from '@/types/TimesFilter';
  import { Style } from "@/types/Style";
  import urlParams from '@/utils/urlParams';
  import { useRoute, useRouter } from 'vue-router';
  import { ref, onMounted, watch, computed } from 'vue';
  import type { Ref } from 'vue';
  import OffstylesApi from '@/api/offstylesApi';
  import ModerationModal from './Moderation/ModerationModal.vue';
  import { useModerationStore, type ModerationTarget } from '@/stores/moderation';
  import TimesListPagination from './TimesListPagination.vue';

  const route = useRoute();
  const router = useRouter();

  const emit = defineEmits(['updatePlayer']);

  const props = defineProps<{
    playerName: string,
    playerSteamId: string,
    playerTimes: Time[] | null,
    isLoading: boolean,
    total: number,
  }>()

  if (!props.playerSteamId) {
    console.warn('PlayerDetails: playerSteamId is required but not provided');
  }

  const userProfile: Ref<User | null> = ref(null);
  const isLoadingProfile: Ref<boolean> = ref(false);
  const showModerationModal: Ref<boolean> = ref(false);

  const moderationStore = useModerationStore();

  const playerStyleOptions = [Style.all, Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented];

  const currentFilter = computed(() => {
    const q = route.query as Record<string, string>;
    return {
      style: q.style ? Number(q.style) : Style.all,
      sort: (q.sort as SortOrder) || 'Newest',
      best: q.best !== undefined ? q.best === 'true' : true,
      hasReplay: q.has_replay === 'true',
      invalidated: q.invalidated !== undefined ? q.invalidated === 'true' : undefined,
    };
  });

  const showStyleColumn = computed(() => currentFilter.value.style === Style.all);

  const tableColumns = computed((): TimeListColumn[] => {
    const columns: TimeListColumn[] = [
      {
        label: 'Map',
        data: 'map',
        width: showStyleColumn.value ? '22%' : '25%',
        alignmentClasses: 'text-left',
        link: timeLinks.mapLink,
      },
      {
        label: 'Server',
        data: 'server',
        width: showStyleColumn.value ? '25%' : '30%',
        classes: 'text-sm text-gray-400',
        alignmentClasses: 'text-left text-gray-300',
      },
    ];

    if (showStyleColumn.value) {
      columns.push({
        label: 'Style',
        data: 'style',
        width: '12%',
        classes: 'text-sm text-gray-400',
        alignmentClasses: 'text-right justify-end md:justify-start md:text-left',
        numFormat: styleFormat.name,
      });
    }

    columns.push(
      {
        label: 'Date',
        data: 'date',
        width: showStyleColumn.value ? '13%' : '15%',
        alignmentClasses: 'text-right justify-end',
      },
      {
        label: 'Time',
        data: 'time',
        width: showStyleColumn.value ? '28%' : '30%',
        alignmentClasses: 'text-right justify-end monospace',
        numFormat: dateTimeFormats.time,
      },
    );

    return columns;
  });

  const moderationTarget = computed((): ModerationTarget | null => {
    if (userProfile.value) {
      return {
        id: userProfile.value.steam_id,
        type: 'player',
        name: userProfile.value.username,
        is_banned: userProfile.value.is_banned,
        ban_ref: userProfile.value.ban_ref
      };
    }

    if (props.playerSteamId && props.playerName) {
      return {
        id: props.playerSteamId,
        type: 'player',
        name: props.playerName,
        is_banned: false,
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
      userProfile.value = null;
    } finally {
      isLoadingProfile.value = false;
    }
  };

  const filterChanged = async (name: 'style' | 'sort' | 'best' | 'has_replay' | 'invalidated', value: string | number | boolean | undefined) => {
    await router.replace({ query: urlParams.updateMany({ [name]: value }) });
  };

  const paginationChanged = async (page: number) => {
    await router.replace({ query: urlParams.update('page', page) });
  };

  const handleModerationComplete = () => {
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
    <TimesFilterBar
      :styleValue="currentFilter.style"
      :sort="currentFilter.sort"
      :best="currentFilter.best"
      :hasReplay="currentFilter.hasReplay"
      :invalidated="currentFilter.invalidated"
      :styleOptions="playerStyleOptions"
      @filter-Changed="filterChanged"
    />
    <TimesList v-if="props.playerTimes" :times="props.playerTimes" :cols="tableColumns"
    @refresh-data="() => emit('updatePlayer', props.playerSteamId)"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected player & filters</h1>
    <TimesListPagination :limitPerPage="50" :isLoading="props.isLoading" :total="props.total" @pagination-changed="paginationChanged"></TimesListPagination>

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
