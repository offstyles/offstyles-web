<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import RelativeDate from '../RelativeDate.vue';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import ValidityIndicator from '../ValidityIndicator.vue';
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  
  const props = defineProps<{
      time: Time,
      wrTime: Time | undefined,
      col: TimeListColumn,
      key: number | string,
    }>();
    
    const data = computed(()=>{
      if(props.col.data === "server"){
        return props.time.server?.server || '';
      }
      if(props.col.data === 'date') {
        return props.time[props.col.data];
      }
      return props.col.numFormat && typeof props.time[props.col.data] === 'number' ?
       props.col.numFormat(props.time[props.col.data] as number) : 
       props.time[props.col.data];
    })
    
  const wrTime = props.time.wr_time ?? (props.wrTime ? props.wrTime.time : null) ?? false;
  
  // Only show validity indicator when viewing times from player lookup tab
  const isPlayerLookupContext = computed(() => {
    return route.path.startsWith('/players');
  });

</script>


<template>
  <div class="flex time-grid-col" :class="`${col.alignmentClasses}`">
    <span v-if="props.col.placement" class="inline-flex items-center justify-end text-end mr-1.5 min-w-5 text-sm text-gray-400">{{ props.time.rank }}.</span>
    <div class="flex items-center gap-1.5 w-full min-w-0">
      <template v-if="props.col.data === 'date'">
        <RelativeDate :date="(data ?? '') as string | number | Date" class="truncate group-hover/timeLink:underline flex-1" />
      </template>
      <template v-else>
        <a v-if="col.link" :href="col.link(props.time)" class="group/timeLink flex max-w-full px-1.5" @click.stop :class="`${col.classes} ${col.alignmentClasses}`">
          <span class="truncate group-hover/timeLink:underline flex-1">{{ data }}</span>
        </a>
        <div v-else class="flex max-w-full px-1.5" :class="col.classes">
          <span class="truncate group-hover/timeLink:underline flex-1">{{ data }}</span>
        </div>
      </template>
      <!-- Show validity indicator for time column only in player lookup context -->
      <ValidityIndicator 
        v-if="props.col.data === 'time' && isPlayerLookupContext"
        :is-invalid="props.time.is_invalid"
        :is-banned="props.time.is_banned"
        size="sm"
      />
    </div>
    <span v-if="props.col.data === 'time' && wrTime" 
    :class="
      props.time.time - wrTime > 0 ? 'nonWrTimeColor opacity-70' :
      props.time.time - wrTime < 0 ? 'text-green-600 opacity-80' : 
    'text-gray-500'
    "
    class="ml-1 flex items-center"> 
      ({{ props.time.time - wrTime > 0 ? '+' : '-' }}{{ dateTimeFormats.time(Math.abs(props.time.time - wrTime)) }})
    </span>
  </div>
</template>

<style scoped>
.nonWrTimeColor{
  color:hsl(357, v-bind('wrTime ? `${($props.time.time - wrTime)*200+40}%` : "90%"'), 58%)
}
.time-grid-col{
  grid-column: v-bind('`${col.col} / span ${col.colSpan ?? 1}`');
  grid-row: v-bind('`${col.row ?? 1} / span ${col.rowSpan ?? 1}`')
}
</style>