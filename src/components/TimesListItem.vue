<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { Ref } from 'vue';
  import { computed, ref } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  import TimesListItemMoreDetails from './TimesListItemMoreDetails.vue';
  import ModerationLogsViewer from './Moderation/ModerationLogsViewer.vue';
  import { useAuth } from '@/stores/auth';
  import { UserPermissions } from '@/types/moderation';
  
  const props = defineProps<{
      time: Time,
      wrTime: Time,
      cols: TimeListColumn[],
      placement: number,
      enableSelection?: boolean,
      isSelected?: boolean
    }>();

  const emit = defineEmits<{
    toggleSelection: [recordId: string]
  }>()

  const { user } = useAuth();
  const showLogsModal: Ref<boolean> = ref(false);

  const userPermissions = computed(() => {
    if (!user.value) return new UserPermissions(0)
    return new UserPermissions(user.value.permissions)
  })

  const canViewLogs = computed(() => {
    return userPermissions.value.isModerator()
  })

  const colWidthsStyle = computed(()=>{
    const baseColumns = props.cols.map((v)=>v.width ? v.width : 'auto')
    if (props.enableSelection) {
      return ['40px', ...baseColumns, '200px'].join(' ') // Add space for moderation indicators
    }
    return [...baseColumns, '200px'].join(' ') // Add space for moderation indicators
  })
  
  const moreDetailsCols: TimeListColumn[] = [
    {
      label:'Jumps',
      data:'jumps'
    },
    {
      label: 'Strafes',
      data:'strafes'
    },
    {
      label: 'Sync',
      data:'sync'
    },
  ];

  const showDetails: Ref<boolean> = ref(false);

  function toggleDetails(){
    showDetails.value = !showDetails.value;
  }

  function showModerationLogs() {
    if (props.time.invalid_ref) {
      showLogsModal.value = true;
    }
  }

  function closeModerationLogs() {
    showLogsModal.value = false;
  }

</script>


<template>
  <div class="transition-[padding border-color background-color] duration-200 border-b hover:bg-main-500"
  :class="showDetails ?
    'bg-main-500':
    'bg-main-600 odd:bg-main-700 hover:border-gray-400 border-transparent border-gray-400 hover:border-gray-200'
  ">
    <div class="grid os-grid-cols-auto p-1 px-1
       cursor-pointer transition-[padding border-color background-color] duration-200  hover:pb-2"
    :class="showDetails ?
      'pb-2' : ''" 
    @click="toggleDetails()">
      <div v-if="enableSelection" class="grid-col flex items-center justify-center px-1.5">
        <input 
          type="checkbox" 
          :checked="isSelected"
          @change="emit('toggleSelection', time._id?.toString() || '')"
          @click.stop
          class="w-4 h-4 text-blue-600 bg-main-700 border-main-500 rounded focus:ring-blue-500"
        />
      </div>
      <div v-for="(col,index) in props.cols" :key="index" class="grid-col flex" :class="col.alignmentClasses">
        <a v-if="col.link" :href="col.link(props.time)" class="group/timeLink flex w-full px-1.5" @click.stop :class="`${col.classes} ${col.alignmentClasses}`">
          <TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent>
        </a>
        <div v-else class="flex w-full px-1.5" :class="col.classes">
          <TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent>
        </div>
      </div>
      
      <!-- Moderation Status Indicators -->
      <div class="grid-col flex items-center justify-end px-1.5 gap-1">
        <!-- Invalid Record Badge -->
        <span
          v-if="time.is_invalid"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-200 border border-red-700"
          title="This record has been invalidated"
        >
          ❌ Invalid
        </span>
        
        <!-- Banned Player Badge -->
        <span
          v-if="time.is_banned"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-900 text-orange-200 border border-orange-700"
          title="This player is banned"
        >
          🚫 Banned
        </span>
        
        <!-- View Moderation Logs Button -->
        <button
          v-if="time.invalid_ref && canViewLogs"
          @click.stop="showModerationLogs"
          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700 hover:bg-blue-800 transition-colors"
          title="View moderation logs for this record"
        >
          📋 Logs
        </button>
      </div>
    </div>
    <TimesListItemMoreDetails v-if="showDetails" :time="props.time" :cols="moreDetailsCols"></TimesListItemMoreDetails>
  </div>
  
  <!-- Moderation Logs Modal -->
  <ModerationLogsViewer
    :is-open="showLogsModal"
    :record-id="time.invalid_ref || ''"
    @close="closeModerationLogs"
    @action-reversed="closeModerationLogs"
  />
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
  }
  @media(max-width:767px){
    .os-grid-cols-auto{
      grid-template-columns: 40% 60%;
      grid-template-rows: repeat(2, 1fr);
    }
    .os-grid-cols-auto>.grid-col{
      width:100%;
    }
    .os-grid-cols-auto>.grid-col:nth-child(1n){
      text-align: left;
      justify-content: left;
    }
    .os-grid-cols-auto>.grid-col:nth-child(2n){
      text-align: right;
      justify-content: right;
    }
    .os-grid-cols-auto>.grid-col:nth-child(2n+1):last-child{
      grid-column:span 2;
    }
  }
</style>