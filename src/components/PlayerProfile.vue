<template>
  <div class="moderation-dropdown">
    <button @click="showDropdown = !showDropdown">Moderation Actions</button>
    <div v-if="showDropdown" class="dropdown-menu">
      <div v-for="action in actions" :key="action">
        <button @click="performAction(action)">{{ action }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ModerationActionType, type ModerationPostData } from '@/types/moderation';

const showDropdown = ref(false);
const actions = Object.values(ModerationActionType);

const performAction = async (action: ModerationActionType) => {
  const reason = prompt('Enter reason for moderation action:');
  if (reason) {
    const postData: ModerationPostData = { reason, action };
    // Call your API to post moderation action here
    console.log('Performing action:', postData);
  }
};
</script>

<style scoped>
.moderation-dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  z-index: 10;
}
</style>
