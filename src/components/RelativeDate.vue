<template>
  <span :title="fullDateTime">
    {{ displayDate }}
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import dateTimeFormats from '@/utils/dateTimeFormats';

export default defineComponent({
  name: 'RelativeDate',
  props: {
    date: {
      type: [Number, String, Date],
      required: true,
    },
  },
  setup(props) {
    // Convert to JS Date object
    const dateObj = computed(() => {
      if (typeof props.date === 'number') {
        // If seconds, convert to ms if needed
        return new Date(props.date < 1e12 ? props.date * 1000 : props.date);
      } else if (typeof props.date === 'string') {
        return new Date(props.date);
      } else {
        return props.date;
      }
    });

    const now = Date.now();
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;
    const isRecent = computed(() => now - dateObj.value.getTime() < twoWeeksMs);

    const displayDate = computed(() => {
      if (isRecent.value) {
        return dateTimeFormats.timeSince(dateObj.value.getTime(), now);
      } else {
        return dateTimeFormats.date(Math.floor(dateObj.value.getTime() / 1000));
      }
    });

    const fullDateTime = computed(() => {
      return dateObj.value.toLocaleString();
    });

    return { displayDate, fullDateTime };
  },
});
</script>
