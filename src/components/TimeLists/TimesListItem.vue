<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { Ref } from 'vue';
  import { computed, ref } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  import TimesListItemMoreDetails from './TimesListItemMoreDetails.vue';
  import ModerationModal from '../Moderation/ModerationModal.vue';
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

  // Context menu state
  const showContextMenu: Ref<boolean> = ref(false);
  const contextMenuX: Ref<number> = ref(0);
  const contextMenuY: Ref<number> = ref(0);


  const totalCols = computed(()=>{
    return Math.max(...props.cols.map((v)=>{return v.col && v.colSpan ? v.col+v.colSpan : 1}));
  })
  const totalRows = computed(()=>{
    return Math.max(...props.cols.map((v)=>{return v.row && v.rowSpan ? v.row+v.rowSpan : 1}));
  })

  const colWidthsStyle = computed(()=>{
    return props.cols.filter((v)=>v.row === undefined || v.row === 1) //only first row
    .sort((a,b)=>a.col - b.col) //sort into correct col order
    .map((v)=>v.width ? v.width : 'auto').join(' '); //make css
  })

  const rowWidthsStyle = computed(()=>{
    return totalRows.value > 1 ? '1fr 0.5fr' : '1fr'; 
  })

  const moreDetailsCols: TimeListColumn[] = [
    {
      label:'Jumps',
      data:'jumps',
      col:1,
    },
    {
      label: 'Strafes',
      data:'strafes',
      col:2,
    },
    {
      label: 'Sync',
      data:'sync',
      col:3,
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

  // Context menu functions
  const handleRightClick = (event: MouseEvent) => {
    if (moderationStore.canModerate.value && props.time._id) {
      event.preventDefault();
      contextMenuX.value = event.clientX;
      contextMenuY.value = event.clientY;
      showContextMenu.value = true;
    }
  }

  const closeContextMenu = () => {
    showContextMenu.value = false;
  }

  const handleContextModerate = () => {
    openModerationModal();
    closeContextMenu();
  }

  // Close context menu when clicking elsewhere
  const handleDocumentClick = () => {
    if (showContextMenu.value) {
      closeContextMenu();
    }
  }

  // Add document click listener
  import { onMounted, onUnmounted } from 'vue';
  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick);
  });

</script>


<template>
  <div class="transition-[padding border-color background-color] duration-200 border-b hover:bg-main-500 group"
  :class="showDetails ?
    'bg-main-500':
    'bg-main-600 odd:bg-main-700 hover:border-gray-400 border-transparent border-gray-400 hover:border-gray-200'
  ">
    <div class="grid os-grid-cols-auto p-1.5 px-1
       cursor-pointer transition-[padding border-color background-color] duration-200  hover:pb-2.5 relative"
    :class="showDetails ?
      'pb-2' : ''" 
    @click="toggleDetails()"
    @contextmenu="handleRightClick">
      <TimesListItemContent v-for="(col,index) in props.cols" :key="index" :time="time" :wrTime="wrTime" :col="col"></TimesListItemContent>
    </div>
    <TimesListItemMoreDetails v-if="showDetails" :time="props.time" :cols="moreDetailsCols"></TimesListItemMoreDetails>

    <!-- Moderation Modal -->
    <ModerationModal
      :target="moderationTarget"
      :show="showModerationModal"
      @moderationComplete="handleModerationComplete"
      @close="closeModerationModal"
    />

    <!-- Context Menu -->
    <div 
      v-if="showContextMenu"
      class="fixed bg-main-800 border border-main-400 rounded-lg shadow-xl py-1 z-50 min-w-[150px]"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
      @click.stop
    >
      <button
        @click="handleContextModerate"
        class="w-full px-3 py-2 text-left text-gray-200 hover:bg-main-700 transition-colors cursor-pointer flex items-center gap-2"
      >
        <span class="text-xs">⚙️</span>
        <span>Moderate Record</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
  .os-grid-cols-auto{
    grid-template-columns: v-bind('colWidthsStyle');
    grid-template-rows: v-bind('rowWidthsStyle');
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