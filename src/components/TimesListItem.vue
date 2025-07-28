<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import type { Ref } from 'vue';
  import { computed, ref } from 'vue';
  import TimesListItemContent from './TimesListItemContent.vue';
  import TimesListItemMoreDetails from './TimesListItemMoreDetails.vue';
  const props = defineProps<{
      time: Time,
      wrTime: Time,
      cols: TimeListColumn[],
      placement: number
    }>();

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

  function toggleDetails(){
    showDetails.value = !showDetails.value;
  }

</script>


<template>
  <div class="grid os-grid-cols-auto p-1 px-1 border-b
  hover:bg-main-500  hover:pb-2 cursor-pointer transition-[padding border-color background-color] duration-200"
  :class="showDetails ?
   'pb-2 border-gray-400 hover:border-gray-200 bg-main-500' : 
   'border-transparent bg-main-600 odd:bg-main-700 hover:border-gray-400'" 
  @click="toggleDetails()">
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