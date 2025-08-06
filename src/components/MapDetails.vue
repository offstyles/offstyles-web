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
  import TimesListPagination from './TimesListPagination.vue';
  import ModeratorToolbar from './Moderation/ModeratorToolbar.vue';
  import BulkModerationModal from './Moderation/BulkModerationModal.vue';
  import ModerationLogsViewer from './Moderation/ModerationLogsViewer.vue';
  import { ref, computed } from 'vue';
  import type { Ref } from 'vue';
  import { useAuth } from '@/stores/auth';
  import { UserPermissions } from '@/types/moderation';
  
  const router = useRouter();
  const { user } = useAuth();
  
  const selectedRecords: Ref<string[]> = ref([]);
  const showBulkModal: Ref<boolean> = ref(false);
  const showLogsModal: Ref<boolean> = ref(false);

  const emit = defineEmits(['updateMap']);

  const props = defineProps<{
    mapName : string,
    mapTimes: Time[] | null,
    isLoading: boolean
  }>()

  const userPermissions = computed(() => {
    if (!user.value) return new UserPermissions(0)
    return new UserPermissions(user.value.permissions)
  })

  const isModerator = computed(() => {
    return userPermissions.value.isModerator()
  })

  const recordNames = computed(() => {
    const names: Record<string, string> = {}
    if (props.mapTimes) {
      props.mapTimes.forEach(time => {
        if (time._id) {
          names[time._id.toString()] = `${time.name} - ${props.mapName} (${dateTimeFormats.time(time.time)})`
        }
      })
    }
    return names
  })
 
  const dropdownChanged = async (name : string, value : number)=>{
    await router.replace({query:urlParams.update(name, value)});
    emit('updateMap', props.mapName);
  }
  
  const paginationChanged = async (page: number)=>{
    await router.replace({query:urlParams.update('page', page)});
    emit('updateMap', props.mapName);
  }

  const handleSelectionChanged = (newSelection: string[]) => {
    selectedRecords.value = newSelection;
  }

  const toggleAllSelection = () => {
    // This will be handled by the TimesList component
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
    // Refresh the map data
    emit('updateMap', props.mapName);
  }

  const handleLogsActionReversed = () => {
    // Refresh the map data
    emit('updateMap', props.mapName);
  }
</script>


<template>
  <div class="text-white w-full max-w-[800px] p-4 text-center flex flex-col justify-center rounded-lg mt-8">
    <h1 class="text-2xl mb-3">{{ mapName }}</h1>
    <div class="flex py-2">
      <CustomDropdown :options="[Style.normal, Style.sideways, Style.wonly, Style.legit_scroll, Style.half_sideways, Style.a_d_only, Style.segmented]"
       :name="'style'" :format="styleFormat.name" @dropdown-Changed="dropdownChanged"></CustomDropdown>
    </div>
    <TimesList 
      v-if="props.mapTimes" 
      :times="props.mapTimes" 
      :enableSelection="isModerator"
      @selectionChanged="handleSelectionChanged"
      :cols="[{
        label: 'Player',
        data: 'name',
        placement: true,
        width:'25%',
        alignmentClasses: 'text-left',
        link: timeLinks.playerLink
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
        alignmentClasses: 'text-right justify-end monospace',
        numFormat: dateTimeFormats.date
      },
      {
        label: 'Time',
        data: 'time',
        width: '30%',
        alignmentClasses: 'text-right justify-end monospace',
        numFormat: dateTimeFormats.time
      }]"
    ></TimesList>
    <h1 v-else-if="!props.isLoading" class="text-gray-200 mt-3">No times found for selected map & style</h1>
    <TimesListPagination :limitPerPage="50" :times="props.mapTimes" :isLoading = "props.isLoading" @pagination-changed="paginationChanged"></TimesListPagination>
    
    <!-- Moderator Toolbar -->
    <ModeratorToolbar
      v-if="isModerator"
      :selectedRecords="selectedRecords"
      :recordNames="recordNames"
      targetType="record"
      :targetName="mapName"
      @bulkModerate="handleBulkModerate"
      @showLogs="handleShowLogs"
      @toggleSelection="toggleAllSelection"
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