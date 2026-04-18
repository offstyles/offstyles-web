<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { Ref } from 'vue';
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import TimesListItemColumn from './TimesListItemColumn.vue';
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

  const totalRows = computed(()=>{
    return Math.max(...props.cols.map((v)=>(v.row ?? 1) + (v.rowSpan ?? 1) - 1));
  })

  const maxCol = computed(()=>{
    return Math.max(...props.cols.map((v)=>v.col + (v.colSpan ?? 1) - 1));
  })

  const maxColMobile = computed(()=>{
    return Math.max(...props.cols.map((v)=>(v.colMobile ?? 1) + (v.colSpanMobile ?? 1) - 1));
  })

  const colWidthsStyle = computed(()=>{
    const widths: string[] = [];
    for (let i = 1; i <= maxCol.value; i++) {
      const match = props.cols.find((c)=>c.col === i && c.width);
      widths.push(match?.width ?? 'auto');
    }
    return widths.join(' ');
  })

  const rowWidthsStyle = computed(()=>totalRows.value > 1 ? '1fr 0.5fr' : '1fr');

  const totalRowsMobile = computed(()=>{
    return Math.max(...props.cols.map((v)=>(v.rowMobile ?? 1) + (v.rowSpanMobile ?? 1) - 1));
  })

  const colWidthsStyleMobile = computed(()=>{
    const widths: string[] = [];
    for (let i = 1; i <= maxColMobile.value; i++) {
      const match = props.cols.find((c)=>(c.colMobile ?? 1) === i && c.widthMobile);
      widths.push(match?.widthMobile ?? 'auto');
    }
    return widths.join(' ');
  })

  const rowWidthsStyleMobile = computed(()=>totalRowsMobile.value > 1 ? '1fr 0.5fr' : '1fr');

  const moreDetailsCols: TimeListColumn[] = [
    { label: 'Jumps', data: 'jumps', col: 1 },
    { label: 'Strafes', data: 'strafes', col: 2 },
    { label: 'Sync', data: 'sync', col: 3 },
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

  const handleDocumentClick = () => {
    if (showContextMenu.value) {
      closeContextMenu();
    }
  }

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
      <TimesListItemColumn v-for="(col,index) in props.cols" :key="index" :time="time" :wrTime="wrTime" :col="col"></TimesListItemColumn>
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
  @media(min-width:768px){
    .os-grid-cols-auto{
      grid-template-columns: v-bind('colWidthsStyle');
      grid-template-rows: v-bind('rowWidthsStyle');
    }
  }
  @media(max-width:767px){
    .os-grid-cols-auto{
      grid-template-columns: v-bind('colWidthsStyleMobile');
      grid-template-rows: v-bind('rowWidthsStyleMobile');
    }
  }
</style>
