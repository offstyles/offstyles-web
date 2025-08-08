<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { Ref } from 'vue';
  import { computed, ref } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  import TimesListItemMoreDetails from './TimesListItemMoreDetails.vue';
  import ModerationModal from './Moderation/ModerationModal.vue';
  import { useModerationStore, type ModerationTarget } from '@/stores/moderation';
  
  const props = defineProps<{
      time: Time,
      wrTime: Time,
      cols: TimeListColumn[],
      placement: number
    }>();

  const emit = defineEmits(['refreshData']);

  const moderationStore = useModerationStore();
  const showModerationModal: Ref<boolean> = ref(false);

  const colWidthsStyle = computed(()=>{
    return props.cols.map((v)=>v.width ? v.width : 'auto').join(' ');
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

  const moderationTarget = computed((): ModerationTarget => ({
    id: props.time._id || '',
    type: 'record',
    name: `${props.time.map} by ${props.time.name}`,
    is_invalid: props.time.is_invalid,
    is_banned: props.time.is_banned,
    invalid_ref: props.time.invalid_ref
  }));

  function toggleDetails(){
    showDetails.value = !showDetails.value;
  }

  const openModerationModal = () => {
    showModerationModal.value = true;
  }

  const closeModerationModal = () => {
    showModerationModal.value = false;
  }

  const handleModerationComplete = () => {
    emit('refreshData');
    showModerationModal.value = false;
  }

</script>


<template>
  <div class="transition-[padding border-color background-color] duration-200 border-b hover:bg-main-500 group"
  :class="showDetails ?
    'bg-main-500':
    'bg-main-600 odd:bg-main-700 hover:border-gray-400 border-transparent border-gray-400 hover:border-gray-200'
  ">
    <div class="grid os-grid-cols-auto p-1 px-1
       cursor-pointer transition-[padding border-color background-color] duration-200  hover:pb-2 relative"
    :class="showDetails ?
      'pb-2' : ''" 
    @click="toggleDetails()">
      
      <!-- Moderation button - positioned absolutely to avoid affecting grid layout -->
      <div 
        v-if="moderationStore.canModerate.value && props.time._id"
        class="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        @click.stop
      >
        <button
          @click="openModerationModal"
          class="flex items-center gap-1 px-2 py-1 bg-main-700 hover:bg-main-600 border border-main-500 text-gray-200 text-xs rounded transition-colors cursor-pointer"
        >
          <span>Moderate</span>
        </button>
      </div>

      <div v-for="(col,index) in props.cols" :key="index" class="grid-col flex" :class="col.alignmentClasses">
        <a v-if="col.link" :href="col.link(props.time)" class="group/timeLink flex w-full px-1.5" @click.stop :class="`${col.classes} ${col.alignmentClasses}`">
          <TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent>
        </a>
        <div v-else class="flex w-full px-1.5" :class="col.classes">
          <TimesListItemContent :col="col" :time="props.time" :wrTime="props.wrTime"></TimesListItemContent>
        </div>
      </div>
    </div>
    <TimesListItemMoreDetails v-if="showDetails" :time="props.time" :cols="moreDetailsCols"></TimesListItemMoreDetails>

    <!-- Moderation Modal -->
    <ModerationModal
      :target="moderationTarget"
      :show="showModerationModal"
      @moderationComplete="handleModerationComplete"
      @close="closeModerationModal"
    />
  </div>
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