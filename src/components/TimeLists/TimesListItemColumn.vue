<script setup lang="ts">
  import type { Time } from '@/types/Time';
  import dateTimeFormats from '@/utils/dateTimeFormats';
  import RelativeDate from '../RelativeDate.vue';
  import type { TimeListColumn } from '@/types/TimeListColumn';
  import { computed } from 'vue';

  const props = defineProps<{
      time: Time,
      wrTime: Time | undefined,
      col: TimeListColumn,
    }>();

  const data = computed(()=>{
    if(props.col.data === "server"){
      return props.time.server?.hostname || '';
    }
    if(props.col.data === 'date') {
      return props.time[props.col.data];
    }
    return props.col.numFormat && typeof props.time[props.col.data] === 'number' ?
     props.col.numFormat(props.time[props.col.data] as number) :
     props.time[props.col.data];
  })

  const wrTime = props.time.wr_time ?? (props.wrTime ? props.wrTime.time : null) ?? false;
</script>


<template>
  <div class="flex time-grid-col px-1.5 min-w-0 overflow-hidden" :class="`${col.alignmentClasses}`">
    <span v-if="props.col.placement" class="inline-flex items-center justify-end text-end mr-1.5 min-w-5 text-sm text-gray-400">{{ props.time.rank }}.</span>
    <div class="flex items-center gap-1.5 max-w-full min-w-0">
      <template v-if="props.col.data === 'date'">
        <RelativeDate :date="(data ?? '') as string | number | Date" class="truncate group-hover/timeLink:underline flex-1" :class="`${col.classes}`" />
      </template>
      <template v-else>
        <a v-if="col.link" :href="col.link(props.time)" class="group/timeLink flex max-w-full" @click.stop :class="`${col.classes}`">
          <span class="truncate group-hover/timeLink:underline flex-1">{{ data }}</span>
        </a>
        <div v-else class="max-w-full" :class="`${col.classes}`">
          <span class="truncate group-hover/timeLink:underline flex-1 max-w-full block">{{ data }}</span>
        </div>
      </template>
    </div>
    <span v-if="props.col.data === 'time' && wrTime"
    :class="
      props.time.time - wrTime > 0 ? 'nonWrTimeColor opacity-70' :
      props.time.time - wrTime < 0 ? 'text-green-600 opacity-80' :
    'text-gray-500'
    "
    class="ml-1 flex items-center monospace text-xs">
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
@media (max-width:767px) {
  .time-grid-col{
    grid-column: v-bind('`${col.colMobile ?? 1} / span ${col.colSpanMobile ?? 1}`');
    grid-row: v-bind('`${col.rowMobile ?? 1} / span ${col.rowSpanMobile ?? 1}`')
  }
}
</style>
